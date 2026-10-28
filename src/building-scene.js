import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export function mountBuildingScene(host) {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.className = 'building-webgl';
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const environment = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environmentMap = environment.fromScene(room, 0.04);
  scene.environment = environmentMap.texture;
  room.dispose();
  environment.dispose();

  const camera = new THREE.OrthographicCamera(-4.8, 4.8, 5.3, -5.3, 0.1, 100);
  camera.position.set(11, 8.3, 13);
  camera.lookAt(0, 3.2, 0);

  const model = new THREE.Group();
  scene.add(model);
  scene.add(new THREE.HemisphereLight(0xdceafb, 0x52616b, 0.9));
  const sun = new THREE.DirectionalLight(0xffebce, 2.2);
  sun.position.set(-6, 12, 8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -7;
  sun.shadow.camera.right = 7;
  sun.shadow.camera.top = 10;
  sun.shadow.camera.bottom = -7;
  sun.shadow.normalBias = 0.03;
  scene.add(sun);
  const rim = new THREE.DirectionalLight(0xb9d9ed, 0.8);
  rim.position.set(6, 7, -6);
  scene.add(rim);

  const geometries = new Set();
  const materials = new Set();
  const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
  geometries.add(boxGeometry);

  function material(options) {
    const result = new THREE.MeshStandardMaterial(options);
    materials.add(result);
    return result;
  }

  const trim = material({ color: '#8b999d', roughness: 0.4, metalness: 0.5 });
  const dark = material({ color: '#24394a', roughness: 0.6 });
  const frame = material({ color: '#4b606b', roughness: 0.34, metalness: 0.7 });
  const glass = new THREE.MeshPhysicalMaterial({
    color: '#527f90',
    roughness: 0.12,
    metalness: 0.68,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.6,
  });
  materials.add(glass);
  const warmGlass = new THREE.MeshPhysicalMaterial({
    color: '#b6ab89',
    roughness: 0.2,
    metalness: 0.35,
    emissive: '#b58e45',
    emissiveIntensity: 0.18,
    clearcoat: 0.8,
  });
  materials.add(warmGlass);

  function box(width, height, depth, x, y, z, surface, castShadow = true) {
    const mesh = new THREE.Mesh(boxGeometry, surface);
    mesh.scale.set(width, height, depth);
    mesh.position.set(x, y, z);
    mesh.castShadow = castShadow;
    mesh.receiveShadow = true;
    model.add(mesh);
    return mesh;
  }

  const pools = new Map([[frame, []], [glass, []], [warmGlass, []]]);
  const transform = new THREE.Object3D();
  function instance(surface, width, height, depth, x, y, z, rotation = 0) {
    transform.position.set(x, y, z);
    transform.rotation.set(0, rotation, 0);
    transform.scale.set(width, height, depth);
    transform.updateMatrix();
    pools.get(surface).push(transform.matrix.clone());
  }

  function building({ width, height, depth, x, z, color, floors }) {
    const concrete = material({ color, roughness: 0.78, metalness: 0.06 });
    box(width, height, depth, x, height / 2 + 0.25, z, concrete);
    box(width + 0.06, 0.1, depth + 0.06, x, height + 0.27, z, trim);
    box(width - 0.13, 0.07, depth - 0.13, x, height + 0.33, z, dark);
    const spacing = (height - 0.4) / floors;
    const columns = Math.max(3, Math.round(width / 0.4));
    const sideColumns = Math.max(3, Math.round(depth / 0.4));

    for (let floor = 0; floor < floors; floor++) {
      const y = 0.57 + floor * spacing;
      if (floor > 0) box(width + 0.018, 0.025, depth + 0.018, x, y - 0.13, z, trim, false);
      for (let side = 0; side < 4; side++) {
        const front = side % 2 === 0;
        const count = front ? columns : sideColumns;
        const span = front ? width : depth;
        const rotation = front ? 0 : Math.PI / 2;
        for (let column = 0; column < count; column++) {
          const offset = -span / 2 + (column + 0.5) * span / count;
          const positive = side < 2 ? 1 : -1;
          const px = front ? x + offset : x + positive * (width / 2 + 0.016);
          const pz = front ? z + positive * (depth / 2 + 0.016) : z + offset;
          const windowWidth = span / count * 0.62;
          const windowHeight = spacing * 0.67;
          instance(frame, windowWidth + 0.045, windowHeight + 0.045, 0.045, px, y, pz, rotation);
          const paneX = px + (front ? 0 : positive * 0.028);
          const paneZ = pz + (front ? positive * 0.028 : 0);
          const surface = (floor * 7 + column * 3 + side) % 13 === 0 ? warmGlass : glass;
          instance(surface, windowWidth, windowHeight, 0.016, paneX, y, paneZ, rotation);
          instance(frame, 0.012, windowHeight, 0.022, paneX, y, paneZ + (front ? positive * 0.012 : 0), rotation);
        }
      }
    }
    return height + 0.35;
  }

  // The same tall centre tower, left wing, and low front wing as the illustration.
  box(5.3, 0.18, 4.3, -0.15, 0.08, 0.25, material({ color: '#334b5f', roughness: 0.65 }));
  box(5.5, 0.06, 4.5, -0.15, -0.03, 0.25, material({ color: '#aa956c', metalness: 0.55, roughness: 0.35 }));
  building({ width: 1.8, height: 4.25, depth: 1.55, x: -1.53, z: 0.3, color: '#78a59f', floors: 9 });
  const roof = building({ width: 1.95, height: 7.1, depth: 1.8, x: 0.12, z: -0.32, color: '#a295b7', floors: 15 });
  building({ width: 1.62, height: 2.95, depth: 1.5, x: 1.25, z: 1.05, color: '#bca77c', floors: 6 });

  box(0.94, 0.33, 0.76, 0.12, roof + 0.14, -0.32, trim);
  box(0.74, 0.05, 0.58, 0.12, roof + 0.33, -0.32, dark);
  for (let i = 0; i < 5; i++) box(0.035, 0.025, 0.55, -0.17 + i * 0.14, roof + 0.37, -0.32, trim, false);
  box(0.026, 0.7, 0.026, 0.12, roof + 0.7, -0.32, trim);
  box(0.025, 0.4, 0.025, -0.06, roof + 0.56, -0.32, trim);
  box(0.025, 0.4, 0.025, 0.3, roof + 0.56, -0.32, trim);
  box(0.35, 0.55, 0.045, 1.25, 0.57, 1.82, glass);
  box(0.8, 0.05, 0.42, 1.25, 0.93, 1.94, trim);

  for (const [surface, matrices] of pools) {
    const mesh = new THREE.InstancedMesh(boxGeometry, surface, matrices.length);
    matrices.forEach((matrix, index) => mesh.setMatrixAt(index, matrix));
    mesh.receiveShadow = true;
    model.add(mesh);
  }

  let hovered = false;
  let disposed = false;
  let frameId = 0;
  let targetX = 0;
  let targetY = 0;
  let lastTime = 0;

  function resize() {
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    const aspect = width / height;
    camera.left = -5.3 * aspect;
    camera.right = 5.3 * aspect;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  }

  function tick(time) {
    if (disposed) return;
    const smoothing = 1 - Math.exp(-Math.min(time - lastTime || 16, 50) / 140);
    lastTime = time;
    model.rotation.y += (targetY - model.rotation.y) * smoothing;
    model.rotation.x += (targetX - model.rotation.x) * smoothing;
    renderer.render(scene, camera);
    if (Math.abs(targetY - model.rotation.y) + Math.abs(targetX - model.rotation.x) > 0.0001) {
      frameId = requestAnimationFrame(tick);
    } else {
      frameId = 0;
    }
  }

  function enter() {
    hovered = true;
    if (!frameId) frameId = requestAnimationFrame(tick);
  }
  function leave() {
    hovered = false;
    targetX = 0;
    targetY = 0;
    if (!frameId) frameId = requestAnimationFrame(tick);
  }
  function move(event) {
    const rect = host.getBoundingClientRect();
    targetY = ((event.clientX - rect.left) / rect.width - 0.5) * 0.13;
    targetX = ((event.clientY - rect.top) / rect.height - 0.5) * 0.06;
    if (hovered && !frameId) frameId = requestAnimationFrame(tick);
  }
  function contextLost(event) {
    event.preventDefault();
    host.removeAttribute('data-webgl-ready');
    hovered = false;
    cancelAnimationFrame(frameId);
  }

  const observer = new ResizeObserver(resize);
  observer.observe(host);
  host.addEventListener('pointerenter', enter);
  host.addEventListener('pointerleave', leave);
  host.addEventListener('pointermove', move);
  renderer.domElement.addEventListener('webglcontextlost', contextLost);
  resize();
  host.dataset.webglReady = 'true';
  if (host.matches(':hover')) enter();

  return () => {
    disposed = true;
    cancelAnimationFrame(frameId);
    observer.disconnect();
    host.removeEventListener('pointerenter', enter);
    host.removeEventListener('pointerleave', leave);
    host.removeEventListener('pointermove', move);
    renderer.domElement.removeEventListener('webglcontextlost', contextLost);
    host.removeAttribute('data-webgl-ready');
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((surface) => surface.dispose());
    environmentMap.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  };
}
