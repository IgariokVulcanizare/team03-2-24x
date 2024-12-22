import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

// Import the model
import santaModel from "./santa.glb";

// Set your Mapbox access token
mapboxgl.accessToken = "pk.eyJ1IjoiaXZhbXB5eSIsImEiOiJjbTR5aWNteXQwc3djMmtzOHpocm94cHNrIn0.Ic3HQz_R__Oib4zwhwyA6Q";

const EarthAnimation = () => {
  const mapContainer = useRef(null);

  useEffect(() => {
    // Initialize Mapbox
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/satellite-streets-v11",
      center: [0, 0],
      zoom: 1,
      projection: "globe",
    });

    map.on("style.load", () => {
      map.setFog({}); // Set fog for better visual effect
    });

    let renderer, scene, camera, santa;

    const setupThreeJS = () => {
      // Get Mapbox's WebGL context
      const canvas = map.getCanvas();
      const gl = map.painter.context.gl;

      // Initialize Three.js Renderer
      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        context: gl,
        antialias: true,
      });
      renderer.autoClear = false; // Prevent Mapbox from clearing the canvas
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      renderer.setPixelRatio(window.devicePixelRatio);

      // Create Scene and Camera
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
      camera.position.set(0, 3, 10);

      // Add Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 1); // Soft white light
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
      directionalLight.position.set(1, 1, 1).normalize();
      scene.add(directionalLight);
    };

    // Helper to convert latitude/longitude to spherical coordinates
    const latLonToCartesian = (lat, lon, radius) => {
      const phi = (90 - lat) * (Math.PI / 180); // Convert latitude to polar angle
      const theta = (lon + 180) * (Math.PI / 180); // Convert longitude to azimuthal angle

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);

      return { x, y, z };
    };

    // Load Santa's Model
    const loadModel = () => {
      const loader = new GLTFLoader();
      loader.load(
        santaModel,
        (gltf) => {
          santa = gltf.scene;
          santa.scale.set(0.5, 0.5, 0.5); // Adjust scale
          
          // Position the model on top of the globe (e.g., North Pole)
          const radius = 3; // Approximate radius of the globe
          const position = latLonToCartesian(90, 0, radius + 0.2); // Slightly above the globe
          santa.position.set(position.x, position.y, position.z);

          // Rotate the model to align it properly
          santa.lookAt(0, 0, 0);

          scene.add(santa);
          animateModel();
        },
        undefined,
        (error) => {
          console.error("An error occurred while loading the model:", error);
        }
      );
    };

    // Animate the Model
    const animateModel = () => {
      const animate = () => {
        if (santa) {
          santa.rotation.y += 0.01; // Rotate the model on its own axis
        }

        map.triggerRepaint(); // Request Mapbox to repaint the scene
        requestAnimationFrame(animate); // Loop animation
      };

      animate();
    };

    // Add Custom Three.js Layer to Mapbox
    const addCustomLayer = () => {
      setupThreeJS();
      loadModel();

      // Load and add the path lines after the map has loaded
      loadPathData(map, "good_path.json", "#00FF00"); // Green for good kids
      loadPathData(map, "bad_path.json", "#FF0000");  // Red for bad kids
    };

    // Function to load path data and add as a GeoJSON layer
    const loadPathData = (map, fileName, color) => {
      fetch(`/${fileName}`)
        .then(response => response.json())
        .then(data => {
          // Add source
          map.addSource(`${fileName}_source`, {
            type: "geojson",
            data: data,
          });

          // Add layer
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
              "line-width": 2,
            },
          });
        })
        .catch(error => console.error(`Error loading ${fileName}:`, error));
    };

    map.on("load", addCustomLayer);

    // Calculate and add the 3D path after the map has loaded
    const add3DPath = () => {
      // Example: Adding a 3D line using Three.js (optional)
      // You can skip this if you prefer using Mapbox's 2D lines

      // Load path data
      fetch('/good_path.json')
        .then(response => response.json())
        .then(data => {
          const coordinates = data.geometry.coordinates;
          const pathGeometry = new THREE.BufferGeometry().setFromPoints(
            coordinates.map(coord => {
              const [lon, lat] = coord;
              const { x, y, z } = latLonToCartesian(lat, lon, 3); // Radius should match the globe
              return new THREE.Vector3(x, y, z);
            })
          );

          const pathMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
          const pathLine = new THREE.Line(pathGeometry, pathMaterial);
          scene.add(pathLine);
        });

      fetch('/bad_path.json')
        .then(response => response.json())
        .then(data => {
          const coordinates = data.geometry.coordinates;
          const pathGeometry = new THREE.BufferGeometry().setFromPoints(
            coordinates.map(coord => {
              const [lon, lat] = coord;
              const { x, y, z } = latLonToCartesian(lat, lon, 3); // Radius should match the globe
              return new THREE.Vector3(x, y, z);
            })
          );

          const pathMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
          const pathLine = new THREE.Line(pathGeometry, pathMaterial);
          scene.add(pathLine);
        });
    };

    // Optionally call add3DPath if you want 3D lines
    // map.on("load", add3DPath);

    // Handle window resizing
    window.addEventListener("resize", () => {
      const canvas = map.getCanvas();
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    });

    // Cleanup on component unmount
    return () => map.remove();
  }, []);

  return (
    <div
      ref={mapContainer}
      style={{ width: "100%", height: "100vh" }}
    ></div>
  );
};

export default EarthAnimation;
