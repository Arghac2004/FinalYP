/**
 * 3d-scene.js — FinTrack 3D Visuals & Interactive 3D Effects Engine
 * Powers interactive 3D WebGL models (Three.js) and 3D card tilt/perspective dynamics.
 */

// ═══════════════════════ 1. THREE.JS 3D INTERACTIVE ASSET MODEL ═══════════════════════

class FinTrack3DScene {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas || typeof THREE === 'undefined') return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.coinGroup = null;
    this.outerRing = null;
    this.innerCrystal = null;
    this.particles = null;
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetRotationX = 0;
    this.targetRotationY = 0;
    this.clock = new THREE.Clock();

    this.init();
  }

  init() {
    const width = this.canvas.clientWidth || 140;
    const height = this.canvas.clientHeight || 140;

    // 1. Scene & Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.z = 5.2;

    // 2. Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 3. Lighting (Rich multi-light setup for metallic & crystal reflections)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x38bdf8, 2.5); // Cyan-Blue Keylight
    keyLight.position.set(5, 5, 5);
    this.scene.add(keyLight);

    const goldLight = new THREE.DirectionalLight(0xf59e0b, 2.0); // Amber/Gold Fill
    goldLight.position.set(-5, -3, 3);
    this.scene.add(goldLight);

    const backGlow = new THREE.PointLight(0x6366f1, 3, 10); // Indigo Rim
    backGlow.position.set(0, 0, -3);
    this.scene.add(backGlow);

    // 4. Create 3D FinTrack Gold / Hologram Token
    this.coinGroup = new THREE.Group();

    // 4a. Central 3D Embossed Cylinder (Coin Body)
    const coinGeometry = new THREE.CylinderGeometry(1.6, 1.6, 0.28, 64);
    const coinMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x2563EB,
      metalness: 0.85,
      roughness: 0.18,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      reflectivity: 0.9,
      wireframe: false
    });
    const coin = new THREE.Mesh(coinGeometry, coinMaterial);
    coin.rotation.x = Math.PI / 2;
    this.coinGroup.add(coin);

    // 4b. Gold Outer Rim
    const rimGeometry = new THREE.TorusGeometry(1.62, 0.1, 32, 64);
    const rimMaterial = new THREE.MeshStandardMaterial({
      color: 0xF59E0B,
      metalness: 0.95,
      roughness: 0.2
    });
    const rim = new THREE.Mesh(rimGeometry, rimMaterial);
    this.coinGroup.add(rim);

    // 4c. Floating 3D Geometric Diamond/Crystal inside
    const octGeometry = new THREE.OctahedronGeometry(0.85, 0);
    const octMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x60A5FA,
      metalness: 0.1,
      roughness: 0.05,
      transmission: 0.8,
      thickness: 0.5,
      ior: 1.6,
      transparent: true,
      opacity: 0.95
    });
    this.innerCrystal = new THREE.Mesh(octGeometry, octMaterial);
    this.innerCrystal.position.z = 0.2;
    this.coinGroup.add(this.innerCrystal);

    // 4d. Floating Orbital Ring
    const ringGeometry = new THREE.TorusGeometry(2.1, 0.035, 16, 100);
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: 0x38BDF8,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0x0284C7,
      emissiveIntensity: 0.4
    });
    this.outerRing = new THREE.Mesh(ringGeometry, ringMaterial);
    this.outerRing.rotation.x = Math.PI / 3;
    this.outerRing.rotation.y = Math.PI / 6;
    this.scene.add(this.outerRing);

    // 4e. 3D Floating Particle Sparks
    const particleCount = 35;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 6;
      particlePositions[i + 1] = (Math.random() - 0.5) * 6;
      particlePositions[i + 2] = (Math.random() - 0.5) * 4;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x38BDF8,
      size: 0.06,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });
    this.particles = new THREE.Points(particleGeo, particleMat);
    this.scene.add(this.particles);

    this.scene.add(this.coinGroup);

    // Initial slight tilt
    this.coinGroup.rotation.y = 0.4;
    this.coinGroup.rotation.x = 0.2;

    // 5. Events
    this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.canvas.addEventListener('mouseleave', () => this.onMouseLeave());
    window.addEventListener('resize', () => this.onResize());

    // 6. Start Render Loop
    this.animate();
  }

  onMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    this.targetRotationY = x * 1.5;
    this.targetRotationX = y * 1.5;
  }

  onMouseLeave() {
    this.targetRotationX = 0;
    this.targetRotationY = 0;
  }

  onResize() {
    if (!this.canvas) return;
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    if (width === 0 || height === 0) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const elapsedTime = this.clock.getElapsedTime();

    // Constant smooth 3D rotation + mouse tracking
    if (this.coinGroup) {
      this.coinGroup.rotation.y += (this.targetRotationY + Math.sin(elapsedTime * 0.8) * 0.3 - this.coinGroup.rotation.y) * 0.05;
      this.coinGroup.rotation.x += (this.targetRotationX + Math.cos(elapsedTime * 0.6) * 0.15 - this.coinGroup.rotation.x) * 0.05;
      this.coinGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.08;
    }

    if (this.innerCrystal) {
      this.innerCrystal.rotation.x = elapsedTime * 0.9;
      this.innerCrystal.rotation.y = elapsedTime * 1.2;
    }

    if (this.outerRing) {
      this.outerRing.rotation.z = elapsedTime * 0.4;
      this.outerRing.rotation.x = Math.PI / 3 + Math.sin(elapsedTime * 0.5) * 0.2;
    }

    if (this.particles) {
      this.particles.rotation.y = elapsedTime * 0.08;
    }

    this.renderer.render(this.scene, this.camera);
  }
}

// ═══════════════════════ 2. HIGH-END 3D CARD TILT & DEPTH ENGINE ═══════════════════════

class Tilt3DEngine {
  static init() {
    // Attach listener using event delegation for smooth dynamic cards
    document.addEventListener('mousemove', (e) => {
      const card = e.target.closest('.tilt-card');
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -7; // Max tilt deg
      const rotateY = ((x - centerX) / centerX) * 7;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px) scale3d(1.01, 1.01, 1.01)`;

      // Specular glare reflection effect
      let glare = card.querySelector('.card-glare');
      if (!glare) {
        glare = document.createElement('div');
        glare.className = 'card-glare';
        card.appendChild(glare);
      }
      glare.style.opacity = '1';
      glare.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 65%)`;
    });

    document.addEventListener('mouseleave', (e) => {
      const card = e.target.closest('.tilt-card');
      if (!card) return;
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale3d(1, 1, 1)';
      const glare = card.querySelector('.card-glare');
      if (glare) glare.style.opacity = '0';
    }, true);
  }
}

// ═══════════════════════ 3. FLOATING 3D BACKGROUND AMBIENT PARTICLES ═══════════════════════

class AmbientParticles3D {
  static init() {
    const canvas = document.getElementById('bg-3d-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 400;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    // Create glowing 3D depth geometric particles (cubes & pyramids)
    const count = 40;
    const group = new THREE.Group();

    const geoCube = new THREE.BoxGeometry(8, 8, 8);
    const geoTetra = new THREE.TetrahedronGeometry(7);

    const matLight = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      wireframe: true,
      transparent: true,
      opacity: 0.15
    });

    const matCyan = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.12
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
        initialY: mesh.position.y
      };

      group.add(mesh);
      meshes.push(mesh);
    }

    scene.add(group);

    let mouseX = 0;
    let mouseY = 0;

    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX - window.innerWidth / 2) * 0.05;
      mouseY = (e.clientY - window.innerHeight / 2) * 0.05;
    });

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    let clock = new THREE.Clock();
    function renderLoop() {
      requestAnimationFrame(renderLoop);
      const time = clock.getElapsedTime();

      group.rotation.y += 0.001;
      camera.position.x += (mouseX - camera.position.x) * 0.02;
      camera.position.y += (-mouseY - camera.position.y) * 0.02;
      camera.lookAt(scene.position);

      meshes.forEach((m, idx) => {
        m.rotation.x += m.userData.rotSpeedX;
        m.rotation.y += m.userData.rotSpeedY;
        m.position.y = m.userData.initialY + Math.sin(time * m.userData.floatSpeed + idx) * 15;
      });

      renderer.render(scene, camera);
    }

    renderLoop();
  }
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  Tilt3DEngine.init();
  setTimeout(() => {
    new FinTrack3DScene('fintrack-3d-token');
    AmbientParticles3D.init();
  }, 100);
});
