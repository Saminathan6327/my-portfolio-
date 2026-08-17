import * as THREE from 'three';

export function initThreeProject(containerId = 'project-3d-stage') {
  const container = document.getElementById(containerId);
  if (!container) return null;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.z = 4.5;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambient);

  const dirLight = new THREE.DirectionalLight(0x10b981, 2.5);
  dirLight.position.set(5, 5, 5);
  scene.add(dirLight);

  const pointLight = new THREE.PointLight(0x3b82f6, 2, 20);
  pointLight.position.set(-5, -5, -2);
  scene.add(pointLight);

  // Mesh container
  let currentMesh = null;

  // Geometry generator map
  const geometries = {
    torusKnot: () => new THREE.TorusKnotGeometry(1, 0.35, 100, 16),
    octahedron: () => new THREE.OctahedronGeometry(1.4, 0),
    icosahedron: () => new THREE.IcosahedronGeometry(1.3, 0),
    dodecahedron: () => new THREE.DodecahedronGeometry(1.3, 0)
  };

  function updateProjectMesh(geometryType = 'torusKnot', hexColor = '#10b981') {
    if (currentMesh) {
      scene.remove(currentMesh);
      currentMesh.geometry.dispose();
      currentMesh.material.dispose();
    }

    const geoFactory = geometries[geometryType] || geometries.torusKnot;
    const geometry = geoFactory();
    
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(hexColor),
      roughness: 0.2,
      metalness: 0.8,
      wireframe: false
    });

    currentMesh = new THREE.Mesh(geometry, material);
    scene.add(currentMesh);
  }

  // Initial Mesh
  updateProjectMesh('torusKnot', '#10b981');

  // Drag Interaction
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };

  const onPointerDown = (e) => {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
  };

  const onPointerMove = (e) => {
    if (!isDragging || !currentMesh) return;

    const deltaX = e.clientX - previousMousePosition.x;
    const deltaY = e.clientY - previousMousePosition.y;

    currentMesh.rotation.y += deltaX * 0.01;
    currentMesh.rotation.x += deltaY * 0.01;

    previousMousePosition = { x: e.clientX, y: e.clientY };
  };

  const onPointerUp = () => {
    isDragging = false;
  };

  container.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);

  // Resize Listener
  const onResize = () => {
    if (!container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  };

  window.addEventListener('resize', onResize);

  // Render loop
  let animationId;
  const animate = () => {
    animationId = requestAnimationFrame(animate);
    if (currentMesh && !isDragging) {
      currentMesh.rotation.y += 0.005;
      currentMesh.rotation.x += 0.002;
    }
    renderer.render(scene, camera);
  };

  animate();

  return {
    updateMesh: updateProjectMesh,
    destroy: () => {
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
    }
  };
}
