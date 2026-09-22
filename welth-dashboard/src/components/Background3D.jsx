import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const Background3D = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 1. Three.js Ambient Particle Scene
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
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    const clock = new THREE.Clock();
    let animationFrameId;

    const renderLoop = () => {
      animationFrameId = requestAnimationFrame(renderLoop);
      const time = clock.getElapsedTime();

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

    // 2. Interactive 3D Card Tilt Engine Listener
    const handleCardTilt = (e) => {
      const card = e.target.closest('.tilt-card');
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px) scale3d(1.01, 1.01, 1.01)`;

      let glare = card.querySelector('.card-glare');
      if (!glare) {
        glare = document.createElement('div');
        glare.className = 'card-glare';
        card.appendChild(glare);
      }
      glare.style.opacity = '1';
      glare.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 65%)`;
    };

    const handleCardLeave = (e) => {
      const card = e.target.closest('.tilt-card');
      if (!card) return;
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale3d(1, 1, 1)';
      const glare = card.querySelector('.card-glare');
      if (glare) glare.style.opacity = '0';
    };

    document.addEventListener('mousemove', handleCardTilt);
    document.addEventListener('mouseleave', handleCardLeave, true);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousemove', handleCardTilt);
      document.removeEventListener('mouseleave', handleCardLeave, true);
      renderer.dispose();
    };
  }, []);

  return <canvas id="bg-3d-canvas" ref={canvasRef} />;
};

export default Background3D;
