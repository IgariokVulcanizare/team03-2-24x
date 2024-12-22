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
    
          // Check if data is a FeatureCollection
          if (data.type === "FeatureCollection" && Array.isArray(data.features)) {
            data.features.forEach((feature, index) => {
              if (feature.geometry && feature.geometry.coordinates) {
                // Add source
                map.addSource(`${fileName}_source_${index}`, {
                  type: "geojson",
                  data: feature,
                });
    
                // Add line layer with increased line-width
                map.addLayer({
                  id: `${fileName}_layer_${index}`,
                  type: "line",
                  source: `${fileName}_source_${index}`,
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
                feature.geometry.coordinates.forEach(([lon, lat], coordIndex) => {
                  const name = `Kid ${coordIndex + 1}`;
                  const message = `Kid ${coordIndex + 1}: (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
    
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
              } else {
                console.error(`Feature at index ${index} in ${fileName} lacks geometry.coordinates`);
              }
            });
          }
          // Check if data is a single Feature
          else if (data.type === "Feature" && data.geometry && data.geometry.coordinates) {
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
            data.geometry.coordinates.forEach(([lon, lat], index) => {
              const name = `Kid ${index + 1}`;
              const message = `Kid ${index + 1}: (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
    
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
          }
          else {
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
