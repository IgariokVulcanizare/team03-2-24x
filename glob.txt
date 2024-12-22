import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = "pk.eyJ1IjoiaXZhbXB5eSIsImEiOiJjbTR5aWNteXQwc3djMmtzOHpocm94cHNrIn0.Ic3HQz_R__Oib4zwhwyA6Q";

export default function EarthAnimation() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  // Tracks whether the user is currently dragging/zooming/rotating
  const isInteracting = useRef(false);

  useEffect(() => {
    // 1) Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/satellite-streets-v11",
      center: [0, 0],
      zoom: 1,
      pitch: 0,
      bearing: 0,
      projection: "globe",
    });

    // 2) Once style is loaded, set the globe fog and start spinning
    map.current.on("style.load", () => {
      map.current.setFog({});
      spinGlobe(); // Start continuous spinning
    });

    // 3) Listen for user interaction START
    map.current.on("dragstart", () => {
      isInteracting.current = true;
    });
    map.current.on("zoomstart", () => {
      isInteracting.current = true;
    });
    map.current.on("rotatestart", () => {
      isInteracting.current = true;
    });

    // 4) Listen for user interaction END
    map.current.on("dragend", () => {
      isInteracting.current = false;
    });
    map.current.on("zoomend", () => {
      isInteracting.current = false;
    });
    map.current.on("rotateend", () => {
      isInteracting.current = false;
    });

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  /**
   * Continuously rotate the globe by incrementing its bearing a tiny bit
   * on each animation frame, as long as the user isn't interacting.
   */
  function spinGlobe() {
    // If user isn't interacting, increment the bearing
    if (!isInteracting.current) {
      const currentBearing = map.current.getBearing();
      map.current.setBearing(currentBearing + 0.1); // Adjust speed here
    }

    // Request the next frame; spinGlobe() is called ~60 times/sec
    requestAnimationFrame(spinGlobe);
  }

  return (
    <div
      ref={mapContainer}
      style={{ width: "100%", height: "100vh" }}
    />
  );
}
