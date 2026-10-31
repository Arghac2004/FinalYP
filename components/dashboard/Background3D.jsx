"use client";

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const Background3D = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    //  Three.js Ambient Particle Scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 400;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    const count = 35;
    const group = new THREE.Group();

    const geoCube = new THREE.BoxGeometry(8, 8, 8);
    const geoTetra = new THREE.TetrahedronGeometry(7);

    const matLight = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    });

    const matCyan = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });

    const meshes = [];

    for (let i = 0; i < count; i++) {
      const geo = i % 2 === 0 ? geoCube : geoTetra;
      const mat = i % 3 === 0 ? matCyan : matLight;
      const mesh = new THREE.Mesh(geo, mat);

      mesh.position.x = (Math.random() - 0.5) * 800;
      mesh.position.y = (Math.random() - 0.5) * 600;
      mesh.position.z = (Math.random() - 0.5) * 400;

      mesh.rotation.x = Math.random() * Math.PI;
      mesh.rotation.y = Math.random() * Math.PI;

      mesh.userData = {
        rotSpeedX: (Math.random() - 0.5) * 0.015,
        rotSpeedY: (Math.random() - 0.5) * 0.015,
        floatSpeed: 0.2 + Math.random() * 0.3,
        initialY: mesh.position.y,
      };

      group.add(mesh);
      meshes.push(mesh);
    }

    scene.add(group);

    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e) => {
      mouseX = (e.clientX - window.innerWidth / 2) * 0.04;
      mouseY = (e.clientY - window.innerHeight / 2) * 0.04;
    };

    const handleResize = () => {
      if (!canvas) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    let animationFrameId;
    const startTime = performance.now();

    const renderLoop = (nowTime) => {
      animationFrameId = requestAnimationFrame(renderLoop);
      const time = ((nowTime || performance.now()) - startTime) * 0.001;

      group.rotation.y += 0.0008;
      camera.position.x += (mouseX - camera.position.x) * 0.02;
      camera.position.y += (-mouseY - camera.position.y) * 0.02;
      camera.lookAt(scene.position);

      meshes.forEach((m, idx) => {
        m.rotation.x += m.userData.rotSpeedX;
        m.rotation.y += m.userData.rotSpeedY;
        m.position.y = m.userData.initialY + Math.sin(time * m.userData.floatSpeed + idx) * 15;
      });

      renderer.render(scene, camera);
    };

    renderLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  return <canvas id="bg-3d-canvas" ref={canvasRef} />;
};

export default Background3D;
