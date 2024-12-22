// EarthAnimation.jsx

import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Set your Mapbox access token
mapboxgl.accessToken =
  "pk.eyJ1IjoiaXZhbXB5eSIsImEiOiJjbTR5aWNteXQwc3djMmtzOHpocm94cHNrIn0.Ic3HQz_R__Oib4zwhwyA6Q"; // Replace with your actual Mapbox access token

const EarthAnimation = () => {
  const mapContainer = useRef(null);

  useEffect(() => {
    // Initialize Mapbox
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/satellite-streets-v11",
      center: [0, 0],
      zoom: 1.5,
      projection: "globe",
    });

    map.on("style.load", () => {
      map.setFog({}); // Set fog for better visual effect
    });

    // Function to load path data and add as a GeoJSON layer
    const loadPathData = (map, fileName, color, type) => {
      fetch(`/${fileName}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              `Failed to fetch ${fileName}: ${response.status} ${response.statusText}`
            );
          }
          return response.json();
        })
        .then((data) => {
          console.log(`Loaded data for ${fileName}:`, data); // Debugging line

          // Validate GeoJSON structure
          const isValidFeatureCollection =
            data.type === "FeatureCollection" &&
            Array.isArray(data.features) &&
            data.features.length > 0 &&
            ["LineString", "MultiLineString"].includes(
              data.features[0].geometry.type
            );

          const isValidFeature =
            data.type === "Feature" &&
            ["LineString", "MultiLineString"].includes(data.geometry.type);

          if (isValidFeatureCollection || isValidFeature) {
            const features = isValidFeatureCollection
              ? data.features
              : [data];

            features.forEach((feature, index) => {
              // Add source
              const sourceId = `${fileName}_source_${index}`;
              map.addSource(sourceId, {
                type: "geojson",
                data: feature,
                lineMetrics: true, // Required for line-progress if animating lines
              });

              // Add line layer
              const layerId = `${fileName}_layer_${index}`;
              map.addLayer({
                id: layerId,
                type: "line",
                source: sourceId,
                layout: {
                  "line-join": "round",
                  "line-cap": "round",
                },
                paint: {
                  "line-width": 6, // Thicker lines
                  "line-color": color,
                },
              });

              // Add markers for each coordinate with image icons
              if (feature.geometry.type === "LineString") {
                feature.geometry.coordinates.forEach(
                  ([lon, lat], coordIndex) => {
                    const name = `Kid ${coordIndex + 1}`;
                    const message = `${name}: (${lat.toFixed(
                      4
                    )}, ${lon.toFixed(4)})`;

                    // Create a custom HTML element for the marker
                    const el = document.createElement("div");
                    el.className = "marker";

                    // Create an <img> element for the icon
                    const img = document.createElement("img");
                    img.src = type === "good" ? "/good.png" : "/bad.png"; // Path to your images
                    img.alt = type === "good" ? "Good Kid" : "Bad Kid";
                    img.style.width = "40px"; // Adjust size as needed
                    img.style.height = "40px"; // Adjust size as needed

                    el.appendChild(img);

                    new mapboxgl.Marker(el)
                      .setLngLat([lon, lat])
                      .setPopup(
                        new mapboxgl.Popup({ offset: 25 }).setText(message)
                      )
                      .addTo(map);
                  }
                );
              } else if (feature.geometry.type === "MultiLineString") {
                feature.geometry.coordinates.forEach((line, lineIndex) => {
                  line.forEach(([lon, lat], coordIndex) => {
                    const name = `Kid ${coordIndex + 1}`;
                    const message = `${name}: (${lat.toFixed(
                      4
                    )}, ${lon.toFixed(4)})`;

                    // Create a custom HTML element for the marker
                    const el = document.createElement("div");
                    el.className = "marker";

                    // Create an <img> element for the icon
                    const img = document.createElement("img");
                    img.src = type === "good" ? "/good.png" : "/bad.png"; // Path to your images
                    img.alt = type === "good" ? "Good Kid" : "Bad Kid";
                    img.style.width = "24px"; // Adjust size as needed
                    img.style.height = "24px"; // Adjust size as needed

                    el.appendChild(img);

                    new mapboxgl.Marker(el)
                      .setLngLat([lon, lat])
                      .setPopup(
                        new mapboxgl.Popup({ offset: 25 }).setText(message)
                      )
                      .addTo(map);
                  });
                });
              }

              // Optionally, animate the line if needed
              // animateLine(map, layerId, duration, color);
            });
          } else {
            console.error(`Invalid GeoJSON structure in ${fileName}:`, data);
          }
        })
        .catch((error) => {
          console.error(`Error loading ${fileName}:`, error);
        });
    };

    // Add Custom Layers to Mapbox
    const addCustomLayers = () => {
      // Load and add the path lines with animation
      // Parameters: map, fileName, color, type ("good" or "bad")
      loadPathData(map, "good_path.json", "#f19506", "good"); // Green for good kids
      loadPathData(map, "bad_path.json", "#FF0000", "bad"); // Red for bad kids
    };

    map.on("load", addCustomLayers);

    // Define the resize handler
    const handleResize = () => {
      const canvas = map.getCanvas();
      if (map && map.resize) {
        map.resize();
      }
    };

    // Add the resize event listener
    window.addEventListener("resize", handleResize);

    // Cleanup on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
      map.remove();
    };
  }, []);

  return (
    <div
      ref={mapContainer}
      style={{ width: "100%", height: "100vh" }}
      id="map"
    ></div>
  );
};

// Optional: Add CSS for the marker in your CSS file (e.g., App.css)
/*
.marker {
  /* Remove background-color as the image will be used instead */
  /* width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}
*/

export default EarthAnimation;
