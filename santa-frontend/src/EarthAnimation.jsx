import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import Papa from "papaparse"; // For CSV parsing

// Set your Mapbox access token
mapboxgl.accessToken =
  "pk.eyJ1IjoiaXZhbXB5eSIsImEiOiJjbTR5aWNteXQwc3djMmtzOHpocm94cHNrIn0.Ic3HQz_R__Oib4zwhwyA6Q";

const EarthAnimation = () => {
  const mapContainer = useRef(null);
  const [map, setMap] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showGoodPath, setShowGoodPath] = useState(true);
  const [showBadPath, setShowBadPath] = useState(true);

  const goodPathMarkers = useRef([]);
  const badPathMarkers = useRef([]);

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
        img.style.width = "40px";
        img.style.height = "40px";

        el.appendChild(img);

        const marker = new mapboxgl.Marker(el)
          .setLngLat([lon, lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
              `<div>
                <strong>Name:</strong> ${name}<br />
                <strong>Gift:</strong> ${gift}<br />
                <strong>Fitness:</strong> ${(probability * 100).toFixed(2)}%<br />
                <strong></strong> ${message}
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

  useEffect(() => {
    if (!map || !mapLoaded) return;

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
          const sourceId = `${type}_source`;
          const layerId = `${type}_layer`;

          if (!map.getSource(sourceId)) {
            map.addSource(sourceId, { type: "geojson", data: feature });
          }
          if (!map.getLayer(layerId)) {
            map.addLayer({
              id: layerId,
              type: "line",
              source: sourceId,
              layout: { "line-join": "round", "line-cap": "round" },
              paint: { "line-width": 6, "line-color": color },
            });
          }

          addMarkers(feature, type, map, names, gifts, probabilities);
        });
      } catch (error) {
        console.error(`Error loading ${fileName}:`, error);
      }
    };

    loadPathData("good_path.json", "#f19506", "good");
    loadPathData("bad_path.json", "#FF0000", "bad");
  }, [map, mapLoaded]);

  useEffect(() => {
    if (!map || !mapLoaded) return;

    const toggleVisibility = (type, visible) => {
      map.getStyle().layers.forEach((layer) => {
        if (layer.id.includes(`${type}_layer`)) {
          map.setLayoutProperty(
            layer.id,
            "visibility",
            visible ? "visible" : "none"
          );
        }
      });

      const markers =
        type === "good" ? goodPathMarkers.current : badPathMarkers.current;

      if (visible) {
        markers.forEach((marker) => marker.addTo(map));
      } else {
        markers.forEach((marker) => marker.remove());
      }
    };

    toggleVisibility("good", showGoodPath);
    toggleVisibility("bad", showBadPath);
  }, [showGoodPath, showBadPath, map, mapLoaded]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      {/* Map */}
      <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />

      {/* Buttons */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          zIndex: 1000,
          backgroundColor: "rgba(255, 255, 255, 0)",
          padding: "10px",
          borderRadius: "10px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <button
          onClick={() => setShowGoodPath(!showGoodPath)}
          style={{
            padding: "10px 20px",
            border: "none",
            borderRadius: "5px",
            backgroundColor: showGoodPath ? "#f19506" : "#f19506",
            color: "white",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          {showGoodPath ? "Hide Good Path" : "Show Good Path"}
        </button>
        <button
          onClick={() => setShowBadPath(!showBadPath)}
          style={{
            padding: "10px 20px",
            border: "none",
            borderRadius: "5px",
            backgroundColor: showBadPath ? "#FF0000" : "#FF0000",
            color: "white",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          {showBadPath ? "Hide Bad Path" : "Show Bad Path"}
        </button>
      </div>
    </div>
  );
};

export default EarthAnimation;
