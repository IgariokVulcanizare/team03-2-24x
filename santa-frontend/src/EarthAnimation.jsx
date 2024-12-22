import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import Papa from "papaparse"; // For CSV parsing

// Set your Mapbox access token
mapboxgl.accessToken =
  "pk.eyJ1IjoiaXZhbXB5eSIsImEiOiJjbTR5aWNteXQwc3djMmtzOHpocm94cHNrIn0.Ic3HQz_R__Oib4zwhwyA6Q";

const EarthAnimation = () => {
  const speedVar = 0.0001;
  const mapContainer = useRef(null);
  const [map, setMap] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const [isGoodPathVisible, setIsGoodPathVisible] = useState(true);
  const [isBadPathVisible, setIsBadPathVisible] = useState(true);

  const goodPathMarkers = useRef([]);
  const badPathMarkers = useRef([]);
  const animationHandles = useRef({}); // Stores animation state and progress

  useEffect(() => {
    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/satellite-streets-v11",
      center: [0, 0],
      zoom: 1.5,
      projection: "globe",
    });

    mapInstance.on("style.load", () => {
      mapInstance.setFog({});
      setMapLoaded(true);
    });

    setMap(mapInstance);

    return () => mapInstance.remove();
  }, []);

  const animatePath = (coordinates, color, map, speedVar, pathKey) => {
    let progress = animationHandles.current[pathKey]?.progress || 0;
    const pathCoordinates = [];
    const sourceId = `${color}_animated_source`;

    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [],
          },
        },
      });

      map.addLayer({
        id: `${color}_animated_layer`,
        type: "line",
        source: sourceId,
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": color,
          "line-opacity": 1,
          "line-width": 4,
        },
      });
    }

    const updatePath = () => {
      if (!animationHandles.current[pathKey]?.isRunning) return;

      const currentIndex = Math.floor(progress * (coordinates.length - 1));
      const nextIndex = currentIndex + 1;

      if (nextIndex < coordinates.length) {
        const currentPoint = coordinates[currentIndex];
        const nextPoint = coordinates[nextIndex];

        const t = (progress * (coordinates.length - 1)) % 1;
        const interpolatedPoint = [
          currentPoint[0] + t * (nextPoint[0] - currentPoint[0]),
          currentPoint[1] + t * (nextPoint[1] - currentPoint[1]),
        ];

        pathCoordinates.push(interpolatedPoint);

        map.getSource(sourceId).setData({
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: pathCoordinates,
          },
        });

        progress += speedVar;
        animationHandles.current[pathKey].progress = progress;

        animationHandles.current[pathKey].frameId = requestAnimationFrame(updatePath);
      } else {
        map.getSource(sourceId).setData({
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: coordinates,
          },
        });
      }
    };

    if (!animationHandles.current[pathKey]) {
      animationHandles.current[pathKey] = {
        isRunning: true,
        progress: 0,
      };
    }

    updatePath();
  };

  const toggleVisibility = (type, visible) => {
    const pathKey = type === "good" ? "good_path" : "bad_path";
    const layerId = `${type}_animated_layer`;
    const markers =
      type === "good" ? goodPathMarkers.current : badPathMarkers.current;

    // Pause or resume animation
    animationHandles.current[pathKey].isRunning = visible;
    console.log(animationHandles.current)

    // Adjust path opacity
    if (map.getLayer(layerId)) {
      map.setPaintProperty(
        layerId,
        "line-opacity",
        visible ? 1 : 0 // Fully visible or fully transparent
      );
    }

    // Adjust marker visibility
    if (visible) {
      markers.forEach((marker) => marker.addTo(map));
    } else {
      markers.forEach((marker) => marker.remove());
    }
  };

  const addMarkers = (feature, type, map, names, gifts, probabilities) => {
    if (feature.geometry.type === "LineString") {
      feature.geometry.coordinates.forEach(([lon, lat], coordIndex) => {
        const name = names[coordIndex] || `Kid ${coordIndex + 1}`;
        const gift = gifts[coordIndex] || "No Gift";
        const probability = probabilities[coordIndex] || 0;

        const message =
          probability >= 0.7
            ? `You can enter ${name}'s house safely.`
            : `Rudolph suggests skipping the cookies in ${name}'s house.`;

        const el = document.createElement("div");
        el.className = "marker";

        const img = document.createElement("img");
        img.src = type === "good" ? "/good.png" : "/bad.png";
        img.alt = type === "good" ? "Good Kid" : "Bad Kid";

        if (coordIndex === 0) {
          img.style.width = "100px";
          img.style.height = "100px";
        } else {
          img.style.width = "40px";
          img.style.height = "40px";
        }

        el.appendChild(img);

        const marker = new mapboxgl.Marker(el)
          .setLngLat([lon, lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
              `<div>
                  <strong>Name:</strong> ${name}<br />
                  <strong>Gift:</strong> ${gift}<br />
                  <strong>Fitness:</strong> ${(probability * 100).toFixed(2)}%<br />
                  ${message}
                </div>`
            )
          )
          .addTo(map);

        if (type === "good") {
          goodPathMarkers.current.push(marker);
        } else {
          badPathMarkers.current.push(marker);
        }
      });
    }
  };

  const loadPathData = async (fileName, color, type) => {
    try {
      const [giftsData, santaData] = await Promise.all([
        fetch("gifts.csv").then((res) => res.text()),
        fetch("santa2.csv").then((res) => res.text()),
      ]);

      const gifts = Papa.parse(giftsData, { header: true }).data.map(
        (row) => row.Gift
      );
      const names = Papa.parse(santaData, { header: true }).data.map(
        (row) => row.Name
      );
      const probabilities = Papa.parse(santaData, { header: true }).data.map(
        (row) => parseFloat(row.Probability)
      );

      const response = await fetch(`/${fileName}`);
      if (!response.ok) throw new Error(`Failed to fetch ${fileName}`);

      const data = await response.json();
      const features =
        data.type === "FeatureCollection" ? data.features : [data];

      features.forEach((feature) => {
        if (feature.geometry.type === "LineString") {
          const coordinates = feature.geometry.coordinates;
          addMarkers(feature, type, map, names, gifts, probabilities);
          const pathColor = type === "good" ? "#f19506" : "#FF0000";
          animatePath(coordinates, pathColor, map, speedVar, `${type}_path`);
          // save the current state?
        }
      });
    } catch (error) {
      console.error(`Error loading ${fileName}:`, error);
    }
  };

  useEffect(() => {
    if (!map || !mapLoaded) return;

    loadPathData("good_path.json", "#f19506", "good");
    loadPathData("bad_path.json", "#FF0000", "bad");
  }, [map, mapLoaded]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          zIndex: 1000,
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          padding: "10px",
          borderRadius: "10px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <button
          onClick={() => {
            setIsGoodPathVisible(!isGoodPathVisible);
            toggleVisibility("good", !isGoodPathVisible);
          }}
          style={{
            padding: "10px 20px",
            border: "none",
            borderRadius: "5px",
            backgroundColor: isGoodPathVisible ? "#f19506" : "#f19506",
            color: "white",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          {isGoodPathVisible ? "Hide Good Path" : "Show Good Path"}
        </button>
        <button
          onClick={() => {
            setIsBadPathVisible(!isBadPathVisible);
            toggleVisibility("bad", !isBadPathVisible);
          }}
          style={{
            padding: "10px 20px",
            border: "none",
            borderRadius: "5px",
            backgroundColor: isBadPathVisible ? "#FF0000" : "#FF0000",
            color: "white",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          {isBadPathVisible ? "Hide Bad Path" : "Show Bad Path"}
        </button>
      </div>
    </div>
  );
};

export default EarthAnimation;
