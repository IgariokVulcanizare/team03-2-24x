import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken =
  "pk.eyJ1IjoiaXZhbXB5eSIsImEiOiJjbTR5aWNteXQwc3djMmtzOHpocm94cHNrIn0.Ic3HQz_R__Oib4zwhwyA6Q"; 

const EarthAnimation = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  // This keeps track of whether the user is currently interacting
  const isInteracting = useRef(false);

  // We’ll store the timeout ID for restarting rotation
  const restartTimer = useRef(null);

  // We'll store our 'rotation' value across re-renders
  let rotation = useRef(0);

  useEffect(() => {
    // 1) Initialize the map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/satellite-streets-v11",
      center: [0, 0],
      zoom: 1,
      projection: "globe",
    });

    // 2) Once the style is loaded, start auto-rotation
    map.current.on("style.load", () => {
      map.current.setFog({});
      // Kick off the animation loop
      requestAnimationFrame(rotateGlobe);
    });

    // 3) Listen for user interactions that should STOP rotation
    //    - 'wheel' catches zoom in/out by mouse wheel
    //    - 'mousedown' or 'touchstart' catches dragging/click
    //    - 'zoomstart' also if user uses +/– or pinch zoom
    //    - 'click' if you specifically want a single click to pause
    [
      "wheel",
      "mousedown",
      "touchstart",
      "zoomstart",
      "click",
    ].forEach((eventName) => {
      map.current.on(eventName, handleUserInteraction);
    });

    // Cleanup on unmount
    return () => {
      if (map.current) {
        map.current.remove();
      }
      clearTimeout(restartTimer.current);
    };
    // eslint-disable-next-line
  }, []);

  /**
   * Rotation function called on each animation frame (~60 fps).
   * If the user is NOT interacting, we do an "easeTo" to a new longitude.
   * After finishing, we request another frame.
   */
  const rotateGlobe = () => {
    if (!map.current) return;

    // If NOT interacting, do the rotate
    if (!isInteracting.current) {
      // Adjust rotation speed here
      rotation.current -= 0.1;

      // Perform one smooth step of rotation
      map.current.easeTo({
        center: [rotation.current, 0], 
        duration: 2000, 
        easing: (t) => t, 
      });
    }

    // Always request the next frame, so we can resume
    // as soon as 'isInteracting' goes false
    requestAnimationFrame(rotateGlobe);
  };

  /**
   * Called whenever user does something that should pause rotation:
   * wheel, mousedown, touchstart, zoomstart, click, etc.
   * We set isInteracting to TRUE so rotation stops,
   * then start/reschedule a 2s timer to restart rotation if user is idle.
   */
  const handleUserInteraction = () => {
    // 1) Mark user is interacting
    isInteracting.current = true;

    // 2) Clear any existing "restart" timer
    if (restartTimer.current) {
      clearTimeout(restartTimer.current);
    }

    // 3) Start a new 2-second timer
    restartTimer.current = setTimeout(() => {
      // After 2s of no further interaction events, resume rotation
      isInteracting.current = false;
    }, 2000);
  };

  return (
    <div
      ref={mapContainer}
      style={{
        width: "100%",
        height: "100vh",
      }}
    />
  );
};

export default EarthAnimation;
