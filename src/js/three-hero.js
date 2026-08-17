import * as THREE from 'three';

export function initThreeHero(canvasId = 'hero-canvas') {
  const container = document.getElementById(canvasId);
  if (!container) return null;

  // Check WebGL availability
  try {
    const testCanvas = document.createElement('canvas');
    if (!window.WebGLRenderingContext || (!testCanvas.getContext('webgl') && !testCanvas.getContext('experimental-webgl'))) {
      document.body.classList.add('no-webgl');
      return null;
    }
  } catch (e) {
    document.body.classList.add('no-webgl');
    return null;
  }

  // Scene setup
  const scene = new THREE.Scene();
  
  // Camera setup
  const camera = new THREE.PerspectiveCamera(
    60,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 7;

  // Renderer setup
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: "high-performance"
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.domElement.style.position = 'absolute';
  renderer.domElement.style.inset = '0';
  renderer.domElement.style.zIndex = '2';
  container.appendChild(renderer.domElement);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const pointLight1 = new THREE.PointLight(0x10b981, 3, 50);
  pointLight1.position.set(5, 5, 5);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0x06b6d4, 2.5, 50);
  pointLight2.position.set(-5, -5, -2);
  scene.add(pointLight2);

  // 1. Central 3D Geometry (Wireframe + Solid Inner Geometry)
  const coreGroup = new THREE.Group();
  scene.add(coreGroup);

  const outerGeo = new THREE.IcosahedronGeometry(2.2, 1);
  const outerMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    wireframe: true,
    transparent: true,
    opacity: 0.35,
    roughness: 0.2,
    metalness: 0.8
  });
  const outerMesh = new THREE.Mesh(outerGeo, outerMat);
  coreGroup.add(outerMesh);

  const innerGeo = new THREE.OctahedronGeometry(1.3, 0);
  const innerMat = new THREE.MeshStandardMaterial({
    color: 0x06b6d4,
    roughness: 0.1,
    metalness: 0.9,
    wireframe: false
  });
  const innerMesh = new THREE.Mesh(innerGeo, innerMat);
  coreGroup.add(innerMesh);

  // 2. Orbital Rings
  const ringGroup = new THREE.Group();
  scene.add(ringGroup);

  const ringGeo1 = new THREE.TorusGeometry(3.5, 0.02, 16, 100);
  const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.4 });
  const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
  ring1.rotation.x = Math.PI / 3;
  ringGroup.add(ring1);

  const ringGeo2 = new THREE.TorusGeometry(4.2, 0.015, 16, 100);
  const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.3 });
  const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
  ring2.rotation.y = Math.PI / 4;
  ringGroup.add(ring2);

  // 3. Floating Particle Field
  const particleCount = 400;
  const particleGeo = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount * 3; i += 3) {
    particlePositions[i] = (Math.random() - 0.5) * 20;
    particlePositions[i + 1] = (Math.random() - 0.5) * 20;
    particlePositions[i + 2] = (Math.random() - 0.5) * 20;
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

  const particleMat = new THREE.PointsMaterial({
    color: 0x10b981,
    size: 0.04,
    transparent: true,
    opacity: 0.6
  });

  const particleSystem = new THREE.Points(particleGeo, particleMat);
  scene.add(particleSystem);

  // Mouse Parallax Interaction
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  const onMouseMove = (event) => {
    const rect = container.getBoundingClientRect();
    mouseX = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
    mouseY = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;
  };

  window.addEventListener('mousemove', onMouseMove);

  // Resize Handler
  const onWindowResize = () => {
    if (!container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  };

  window.addEventListener('resize', onWindowResize);

  // Animation Loop
  let animationFrameId;
  const clock = new THREE.Clock();

  const animate = () => {
    animationFrameId = requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // Rotate core sculpture
    coreGroup.rotation.y = elapsedTime * 0.2;
    coreGroup.rotation.x = Math.sin(elapsedTime * 0.3) * 0.2;

    innerMesh.rotation.y = -elapsedTime * 0.4;
    innerMesh.rotation.z = elapsedTime * 0.3;

    // Rotate orbital rings
    ring1.rotation.z = elapsedTime * 0.15;
    ring2.rotation.x = elapsedTime * 0.1;

    // Rotate particles
    particleSystem.rotation.y = elapsedTime * 0.03;

    // Smooth mouse parallax
    targetX += (mouseX * 0.8 - targetX) * 0.05;
    targetY += (mouseY * 0.8 - targetY) * 0.05;

    camera.position.x = targetX;
    camera.position.y = targetY;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  };

  animate();

  return {
    destroy: () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onWindowResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    }
  };
}
