import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// Import your 3D model
import santaModel from './santa.glb'; 

const SantaScene = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    // 1) Create renderer, scene, camera
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 1, 5);

    // 2) Add some light so the model isn't completely dark
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(2, 2, 5);
    scene.add(directionalLight);

    // 3) Load the Santa GLB model
    let santa;
    const loader = new GLTFLoader();
    loader.load(
      santaModel,
      (gltf) => {
        santa = gltf.scene;
        // Adjust scale/position as needed
        santa.scale.set(0.2, 0.2, 0.2);
        santa.position.set(0, 0, 0);
        scene.add(santa);
      },
      undefined,
      (error) => {
        console.error('Error loading Santa model:', error);
      }
    );

    // 4) Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // If Santa is loaded, rotate it for a little flair
      if (santa) {
        santa.rotation.y += 0.01;
      }

      renderer.render(scene, camera);
    };
    animate();

    // 5) Handle resizing
    const handleResize = () => {
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;
      renderer.setSize(newWidth, newHeight);
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      if (renderer) {
        renderer.dispose();
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
      }}
    />
  );
};

export default SantaScene;
