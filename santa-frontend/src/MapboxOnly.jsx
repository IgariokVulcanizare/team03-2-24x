// MapboxOnly.jsx

import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Set your Mapbox access token
mapboxgl.accessToken = "pk.eyJ1IjoiaXZhbXB5eSIsImEiOiJjbTR5aWNteXQwc3djMmtzOHpocm94cHNrIn0.Ic3HQz_R__Oib4zwhwyA6Q"; // Replace with your actual Mapbox access token

const MapboxOnly = () => {
  const mapContainer = useRef(null);

  useEffect(() => {
    // Initialize Mapbox
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/satellite-streets-v11",
      center: [0, 0],
      zoom: 1.5,
    });

    map.on("load", () => {
      const fetchAndAddPath = async (fileName, color, groupName) => {
        try {
          const response = await fetch(`/${fileName}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch ${fileName}: ${response.statusText}`);
          }
          const data = await response.json();

          // Add source
          map.addSource(`${fileName}_source`, {
            type: "geojson",
            data: data,
          });

          // Add line layer with increased line-width
          map.addLayer({
            id: `${fileName}_layer`,
            type: "line",
            source: `${fileName}_source`,
            layout: {
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": color,
              "line-width": 6, // Increased from 2 to 6 for thicker lines
            },
          });

          // Add markers for each coordinate with larger, custom-styled markers
          const bounds = new mapboxgl.LngLatBounds();

          data.geometry.coordinates.forEach(([lon, lat], index) => {
            bounds.extend([lon, lat]);

            const name = `${groupName} Kid ${index + 1}`;
            const message = `${groupName} Kid ${index + 1}: (${lat.toFixed(4)}, ${lon.toFixed(4)})`;

            // Create a custom HTML element for the marker
            const el = document.createElement("div");
            el.className = "marker";
            el.style.backgroundColor = color;
            el.style.width = "20px"; // Increased size
            el.style.height = "20px"; // Increased size
            el.style.borderRadius = "50%";
            el.style.border = "2px solid white";
            el.style.boxShadow = "0 0 2px rgba(0, 0, 0, 0.5)";

            new mapboxgl.Marker(el)
              .setLngLat([lon, lat])
              .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(message))
              .addTo(map);
          });

          return bounds;
        } catch (error) {
          console.error(`Error loading ${fileName}:`, error);
          return null;
        }
      };

      const loadPaths = async () => {
        const goodBounds = await fetchAndAddPath("good_path.json", "#00FF00", "Good");
        const badBounds = await fetchAndAddPath("bad_path.json", "#FF0000", "Bad");

        // Combine all bounds
        const combinedBounds = new mapboxgl.LngLatBounds();

        if (goodBounds) {
          combinedBounds.extend(goodBounds);
        }

        if (badBounds) {
          combinedBounds.extend(badBounds);
        }

        // Fit the map to the combined bounds
        if (!combinedBounds.isEmpty()) {
          map.fitBounds(combinedBounds, {
            padding: 50,
          });
        }
      };

      loadPaths();
    });

    // Cleanup on component unmount
    return () => map.remove();
  }, []);

  return <div ref={mapContainer} style={{ width: "100%", height: "100vh" }} />;
};

export default MapboxOnly;
