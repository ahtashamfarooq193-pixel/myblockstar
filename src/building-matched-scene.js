import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export function mountBuildingScene(host, options = {}) {
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'low-power',
    preserveDrawingBuffer: Boolean(options.capturePoster),
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.className = 'building-webgl';
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const generator = new THREE.PMREMGenerator(renderer);
  const skyCanvas = document.createElement('canvas');
  skyCanvas.width = 1024;
  skyCanvas.height = 512;
  const skyPaint = skyCanvas.getContext('2d');
  const daylight = skyPaint.createLinearGradient(0, 0, 0, 512);
  daylight.addColorStop(0, '#426b8d');
  daylight.addColorStop(0.35, '#b2c7d8');
  daylight.addColorStop(0.49, '#eee5d3');
  daylight.addColorStop(0.56, '#8e9691');
  daylight.addColorStop(1, '#34444a');
  skyPaint.fillStyle = daylight;
  skyPaint.fillRect(0, 0, 1024, 512);
  const softSun = skyPaint.createRadialGradient(280, 160, 5, 280, 160, 115);
  softSun.addColorStop(0, '#fff5df');
  softSun.addColorStop(0.2, '#fff2d9a0');
  softSun.addColorStop(1, '#fff2d900');
  skyPaint.fillStyle = softSun;
  skyPaint.fillRect(0, 0, 1024, 512);
  for (let i = 0; i < 28; i++) {
    const height = 15 + (i * 37 % 65);
    skyPaint.fillStyle = i % 3 === 0 ? '#586c78' : '#71818a';
    skyPaint.fillRect(i * 39, 282 - height, 19 + (i * 7 % 17), height + 70);
  }
  const skyTexture = new THREE.CanvasTexture(skyCanvas);
  skyTexture.mapping = THREE.EquirectangularReflectionMapping;
  skyTexture.colorSpace = THREE.SRGBColorSpace;
  const environment = generator.fromEquirectangular(skyTexture);
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.65;
  skyTexture.dispose();
  generator.dispose();

  // Use the illustration's original viewBox and outlines for an exact match.
  const camera = new THREE.OrthographicCamera(-270, 270, 300, -300, 0.1, 3000);
  camera.position.set(0, 0, 1200);
  const model = new THREE.Group();
  scene.add(model);
  scene.add(new THREE.HemisphereLight(0xdceafb, 0x52616b, 0.7));
  const sun = new THREE.DirectionalLight(0xffebce, 1.6);
  sun.position.set(-400, 650, 900);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -450;
  sun.shadow.camera.right = 450;
  sun.shadow.camera.top = 450;
  sun.shadow.camera.bottom = -450;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 2200;
  sun.shadow.normalBias = 0.25;
  sun.shadow.bias = -0.0001;
  sun.shadow.radius = 2;
  scene.add(sun);
  const rim = new THREE.DirectionalLight(0xc7e3ee, 0.7);
  rim.position.set(500, 200, 700);
  scene.add(rim);

  const geometries = new Set();
  const materials = new Set();
  const textures = new Set();
  const loader = new SVGLoader();

  const glassCanvas = document.createElement('canvas');
  glassCanvas.width = 128;
  glassCanvas.height = 256;
  const paint = glassCanvas.getContext('2d');
  const skyReflection = paint.createLinearGradient(0, 0, 100, 256);
  skyReflection.addColorStop(0, '#b9d0d7');
  skyReflection.addColorStop(0.25, '#7a9eae');
  skyReflection.addColorStop(0.48, '#42697f');
  skyReflection.addColorStop(0.54, '#6c8fa1');
  skyReflection.addColorStop(1, '#294656');
  paint.fillStyle = skyReflection;
  paint.fillRect(0, 0, 128, 256);
  paint.fillStyle = '#d6e3e91c';
  paint.beginPath();
  paint.moveTo(28, 0);
  paint.lineTo(50, 0);
  paint.lineTo(112, 256);
  paint.lineTo(90, 256);
  paint.fill();
  paint.fillStyle = '#142a3910';
  paint.fillRect(8, 180, 17, 76);
  paint.fillRect(45, 155, 24, 101);
  paint.fillRect(95, 195, 18, 61);
  const glassTexture = new THREE.CanvasTexture(glassCanvas);
  glassTexture.colorSpace = THREE.SRGBColorSpace;
  textures.add(glassTexture);

  function officeTexture(lit, variant) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    const roomLight = context.createLinearGradient(0, 0, 0, 256);
    roomLight.addColorStop(0, lit ? '#b6bba7' : '#597583');
    roomLight.addColorStop(0.45, lit ? '#727e76' : '#304957');
    roomLight.addColorStop(1, '#172e3d');
    context.fillStyle = roomLight;
    context.fillRect(0, 0, 128, 256);

    // Room surfaces converge inward behind the glass instead of sitting on it.
    context.fillStyle = lit ? '#d9dac3' : '#76909a';
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(128, 0);
    context.lineTo(100, 70);
    context.lineTo(24, 70);
    context.closePath();
    context.fill();
    context.strokeStyle = lit ? '#656e68' : '#384e5b';
    context.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      context.beginPath();
      context.moveTo(i * 42, 0);
      context.lineTo(24 + i * 25, 70);
      context.stroke();
    }
    context.fillStyle = lit ? '#fff5d5' : '#abc5ce';
    context.fillRect(18, 32, 42, 4);
    context.fillRect(76, 32, 34, 4);
    context.fillRect(37, 57, 38, 2);
    context.fillStyle = lit ? '#b6bcb0' : '#657c86';
    context.fillRect(19 + variant * 12, 70, 6, 143);
    context.fillStyle = '#223946';
    context.fillRect(8, 166, 111, 8);
    context.fillRect(24, 174, 5, 49);
    context.fillRect(95, 174, 5, 49);
    context.fillStyle = '#122a39';
    context.fillRect(31 + variant * 8, 143, 25, 19);
    context.fillRect(40 + variant * 8, 162, 5, 5);
    context.fillRect(74, 188, 18, 24);
    context.fillStyle = '#9cb9c24a';
    context.fillRect(33 + variant * 8, 145, 21, 14);

    // Cool sky reflection sits over the office; interiors stay visible beneath it.
    context.globalAlpha = lit ? 0.27 : 0.43;
    context.drawImage(glassCanvas, 0, 0);
    context.globalAlpha = 1;
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);
    textures.add(texture);
    return texture;
  }

  const roofCanvas = document.createElement('canvas');
  roofCanvas.width = 256;
  roofCanvas.height = 256;
  const roofPaint = roofCanvas.getContext('2d');
  roofPaint.fillStyle = '#81909f';
  roofPaint.fillRect(0, 0, 256, 256);
  roofPaint.strokeStyle = '#50647730';
  roofPaint.lineWidth = 1;
  for (let i = 32; i < 256; i += 32) {
    roofPaint.beginPath();
    roofPaint.moveTo(i, 0);
    roofPaint.lineTo(i, 256);
    roofPaint.stroke();
  }
  roofPaint.strokeStyle = '#cfdae580';
  roofPaint.strokeRect(10, 10, 236, 236);
  const roofTexture = new THREE.CanvasTexture(roofCanvas);
  roofTexture.colorSpace = THREE.SRGBColorSpace;
  textures.add(roofTexture);

  const noisePixels = new Uint8Array(64 * 64);
  for (let i = 0; i < noisePixels.length; i++) {
    noisePixels[i] = 110 + Math.floor((Math.sin(i * 127.1 + 41.7) * 43758.5453 % 1 + 1) * 12);
  }
  const concreteTexture = new THREE.DataTexture(noisePixels, 64, 64, THREE.RedFormat);
  concreteTexture.wrapS = THREE.RepeatWrapping;
  concreteTexture.wrapT = THREE.RepeatWrapping;
  concreteTexture.repeat.set(12, 25);
  concreteTexture.needsUpdate = true;
  textures.add(concreteTexture);

  function material(color, options = {}) {
    const surface = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.7,
      metalness: 0.08,
      bumpMap: concreteTexture,
      bumpScale: 0.035,
      side: THREE.DoubleSide,
      ...options,
    });
    materials.add(surface);
    return surface;
  }

  const fronts = {
    teal: material('#b0c9c0'),
    purple: material('#c1b9ce'),
    gold: material('#d6c6a8'),
  };
  const sides = {
    teal: material('#819f98'),
    purple: material('#91859f'),
    gold: material('#aa9470'),
  };
  const roof = material('#becbd9', {
    map: roofTexture,
    roughness: 0.76,
    metalness: 0.08,
  });
  const base = material('#c1c9bd');
  const roofRim = material('#65798d', { roughness: 0.55, metalness: 0.18 });
  const pavingMaterials = {
    '#102643': material('#a8b7b1'),
    '#203957': material('#d9dbcd'),
    '#324b5c': material('#b3beb6'),
  };
  const frame = material('#506674', { metalness: 0.45, roughness: 0.35 });
  const concreteEdge = material('#93a5ac', { roughness: 0.85, metalness: 0.02 });
  const revealShadow = material('#2c4353', { roughness: 0.6 });
  const reflection = material('#7e9ca8', { metalness: 0.25, roughness: 0.38 });
  const recess = material('#183140');
  const glass = new THREE.MeshPhysicalMaterial({
    color: '#d9e6e9',
    map: officeTexture(false, 0),
    metalness: 0.12,
    roughness: 0.16,
    clearcoat: 0.8,
    clearcoatRoughness: 0.08,
    envMapIntensity: 2,
    side: THREE.DoubleSide,
  });
  materials.add(glass);
  const glassVariants = [glass];
  for (const [color, roughness] of [
    ['#c7d8e0', 0.24],
    ['#d2dfe3', 0.19],
    ['#b9cfd8', 0.26],
  ]) {
    const surface = glass.clone();
    surface.color.set(color);
    surface.roughness = roughness;
    surface.map = officeTexture(false, glassVariants.length);
    glassVariants.push(surface);
    materials.add(surface);
  }
  const illuminatedOffice = officeTexture(true, 1);
  glassVariants.forEach((surface) => {
    surface.emissive.set('#ffe3a3');
    surface.emissiveMap = illuminatedOffice;
    surface.emissiveIntensity = 0;
  });
  const warmGlass = new THREE.MeshPhysicalMaterial({
    color: '#e1e5d9',
    map: illuminatedOffice,
    roughness: 0.19,
    metalness: 0.08,
    emissive: '#fff0ce',
    emissiveMap: illuminatedOffice,
    emissiveIntensity: 0.28,
    clearcoat: 0.9,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.5,
    side: THREE.DoubleSide,
  });
  materials.add(warmGlass);

  function polygon(points, depth, surface, slope = 0, holes = [], thickness = 0) {
    const shape = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)));
    holes.forEach((opening) => {
      shape.holes.push(new THREE.Path(opening.map(([x, y]) => new THREE.Vector2(x, y))));
    });
    const geometry = thickness > 0
      ? new THREE.ExtrudeGeometry(shape, {
        depth: thickness,
        bevelEnabled: false,
        steps: 1,
        curveSegments: 1,
      })
      : new THREE.ShapeGeometry(shape);
    const positions = geometry.attributes.position;
    const uv = geometry.attributes.uv;
    const minX = Math.min(...points.map(([x]) => x));
    const minY = Math.min(...points.map(([, y]) => y));
    const spanX = Math.max(...points.map(([x]) => x)) - minX || 1;
    const spanY = Math.max(...points.map(([, y]) => y)) - minY || 1;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);
      uv.setXY(i, (x - minX) / spanX, 1 - (y - minY) / spanY);
      positions.setXYZ(i, x - 270, 300 - y, depth + (x - points[0][0]) * slope + z - thickness);
    }
    positions.needsUpdate = true;
    geometry.computeVertexNormals();
    geometries.add(geometry);
    const mesh = new THREE.Mesh(geometry, surface);
    mesh.castShadow = thickness > 0;
    mesh.receiveShadow = true;
    model.add(mesh);
  }

  function rectangle(x, y, width, height, depth, surface, slope, originX) {
    polygon([[x, y], [x + width, y], [x + width, y + height], [x, y + height]], depth + (x - originX) * slope, surface, slope);
  }

  function inside(x, y, points) {
    let result = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const [xi, yi] = points[i];
      const [xj, yj] = points[j];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) result = !result;
    }
    return result;
  }

  function addWindows(points, depth, slope, side, wallMaterial) {
    const [topLeft, topRight, bottomRight, bottomLeft] = points;
    if (!bottomLeft) return;
    const width = Math.hypot(topRight[0] - topLeft[0], topRight[1] - topLeft[1]);
    const height = Math.max(bottomLeft[1] - topLeft[1], bottomRight[1] - topRight[1]);
    const columns = Math.max(3, Math.round(width / (side ? 21 : 23)));
    const floors = Math.max(4, Math.round(height / 32));
    const openings = [];

    function project(u, v) {
      const left = [
        topLeft[0] + (bottomLeft[0] - topLeft[0]) * v,
        topLeft[1] + (bottomLeft[1] - topLeft[1]) * v,
      ];
      const right = [
        topRight[0] + (bottomRight[0] - topRight[0]) * v,
        topRight[1] + (bottomRight[1] - topRight[1]) * v,
      ];
      return [left[0] + (right[0] - left[0]) * u, left[1] + (right[1] - left[1]) * u];
    }

    function panel(u0, v0, u1, v1, lift, surface) {
      const corners = [project(u0, v0), project(u1, v0), project(u1, v1), project(u0, v1)];
      polygon(corners, depth + lift + (corners[0][0] - topLeft[0]) * slope, surface, slope);
    }

    function reveal(outer, inner) {
      for (let sideIndex = 0; sideIndex < 4; sideIndex++) {
        const next = (sideIndex + 1) % 4;
        const vertices = [outer[sideIndex], outer[next], inner[next], inner[sideIndex]];
        const geometry = new THREE.BufferGeometry();
        const positions = vertices.flatMap(([x, y], index) => [
          x - 270,
          300 - y,
          depth + (x - topLeft[0]) * slope + (index < 2 ? 0 : -2.5),
        ]);
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1], 2));
        geometry.setIndex([0, 1, 2, 0, 2, 3]);
        geometry.computeVertexNormals();
        geometries.add(geometry);
        const mesh = new THREE.Mesh(geometry, sideIndex === 0 || sideIndex === 3 ? revealShadow : frame);
        mesh.receiveShadow = true;
        model.add(mesh);
      }
    }

    // Perspective follows each existing face; nothing extends its silhouette.
    for (let floor = 0; floor < floors; floor++) {
      const row = floor / floors;
      if (floor > 0) {
        panel(0.008, row, 0.992, row + 0.002, 0.15, wallMaterial);
        panel(0.008, row + 0.002, 0.992, row + 0.005, 0.4, concreteEdge);
      }
      for (let column = 0; column < columns; column++) {
        const u0 = (column + 0.21) / columns;
        const u1 = (column + 0.79) / columns;
        const v0 = (floor + 0.19) / floors;
        const v1 = (floor + 0.84) / floors;
        const middle = (u0 + u1) / 2;
        const variation = floor * 7 + column * 3;
        const glassSurface = (floor % 4 === 1 && column % 3 !== 2) || variation % 17 === 0
          ? warmGlass
          : glassVariants[variation % glassVariants.length];
        const outer = [project(u0 - 0.006, v0 - 0.002), project(u1 + 0.006, v0 - 0.002), project(u1 + 0.006, v1 + 0.003), project(u0 - 0.006, v1 + 0.003)];
        const inner = [project(u0, v0), project(u1, v0), project(u1, v1), project(u0, v1)];
        openings.push(outer);
        reveal(outer, inner);
        panel(u0, v0, u1, v1, -2.55, glassSurface);
        panel(u0, v0, u0 + 0.005, v1, -2.2, frame);
        panel(u1 - 0.005, v0, u1, v1, -2.2, reflection);
        panel(u0, v1 - 0.003, u1, v1 + 0.001, -1.8, concreteEdge);
        panel(middle - 0.002, v0, middle + 0.002, v1, -2.1, frame);
        if ((floor + column) % 5 === 0) {
          panel(u0 + 0.012, v0 + 0.005, u0 + 0.021, v1 - 0.005, -2.5, reflection);
        }
      }
    }
    polygon(points, depth, wallMaterial, slope, openings, 1.8);
    panel(0.008, 0.01, 0.992, 0.017, 0.5, concreteEdge);
    panel(0.008, 0.98, 0.992, 0.988, 0.5, concreteEdge);
  }

  const outline = new THREE.LineBasicMaterial({ color: '#b9a16d', transparent: true, opacity: 0.65 });
  materials.add(outline);
  let sourceIndex = 0;
  const originalMaterials = new Map();
  host.querySelectorAll('.architecture > path').forEach((element) => {
    const data = element.getAttribute('d');
    const fill = element.getAttribute('fill');
    const parsed = loader.parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${data}" fill="#ffffff" /></svg>`);
    let depth = -24 + sourceIndex++ * 0.8;
    if (element.classList.contains('building-footing-teal')) depth = -1;
    if (element.classList.contains('building-footing-purple')) depth = 11;
    if (element.classList.contains('building-footing-gold')) depth = 25;
    if (element.classList.contains('building-wing-teal') || element.classList.contains('building-wing-teal-side')) depth = 0;
    if (element.classList.contains('building-wing-purple') || element.classList.contains('building-wing-purple-side')) depth = 12;
    if (element.classList.contains('building-wing-gold') || element.classList.contains('building-wing-gold-side')) depth = 26;
    if (fill?.includes('windows')) return;

    for (const path of parsed.paths) {
      const points = path.subPaths[0]?.getPoints().map((point) => [point.x, point.y]);
      if (!points?.length) continue;
      if (!fill || fill === 'none') {
        for (const subPath of path.subPaths) {
          const vertices = subPath.getPoints().map(({ x, y }) => new THREE.Vector3(x - 270, 300 - y, 28));
          const geometry = new THREE.BufferGeometry().setFromPoints(vertices);
          geometries.add(geometry);
          model.add(new THREE.Line(geometry, outline));
        }
        continue;
      }
      const color = ['teal', 'purple', 'gold'].find((name) => element.classList.contains(`building-wing-${name}`) || element.classList.contains(`building-wing-${name}-side`));
      const side = element.classList.value.endsWith('-side');
      const slope = color ? (side ? -0.025 : 0.02) : 0;
      if (fill.startsWith('#') && !originalMaterials.has(fill)) originalMaterials.set(fill, material(fill));
      const isRoof = fill === '#405b76' || fill === '#243f5d';
      const surface = color
        ? (side ? sides[color] : fronts[color])
        : fill.includes('gold') ? frame
          : isRoof ? roof : pavingMaterials[fill] ?? originalMaterials.get(fill) ?? base;
      const surfaceDepth = element.classList.contains('building-wing-teal-roof') ? 4
        : element.classList.contains('building-wing-gold-roof') ? 31
          : isRoof ? (fill === '#243f5d' ? 23 : 19) : depth;
      if (color) addWindows(points, depth, slope, side, surface);
      else polygon(points, surfaceDepth, surface, slope, [], isRoof ? 2.8 : 0.8);
      if (isRoof && points.length >= 4) {
        const center = points.slice(0, 4).reduce(([x, y], point) => [x + point[0] / 4, y + point[1] / 4], [0, 0]);
        const inset = points.slice(0, 4).map(([x, y]) => [center[0] + (x - center[0]) * 0.91, center[1] + (y - center[1]) * 0.91]);
        polygon(inset, surfaceDepth + 0.6, roofRim);
        const inner = inset.map(([x, y]) => [center[0] + (x - center[0]) * 0.96, center[1] + (y - center[1]) * 0.96]);
        polygon(inner, surfaceDepth + 0.9, roof);
      }
    }
  });

  // Batch shared materials to keep detailed windows inexpensive to render.
  const batches = new Map();
  [...model.children].forEach((mesh) => {
    if (!mesh.isMesh) return;
    if (!batches.has(mesh.material)) batches.set(mesh.material, []);
    const geometry = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry;
    if (geometry !== mesh.geometry) {
      mesh.geometry.dispose();
      geometries.delete(mesh.geometry);
      geometries.add(geometry);
    }
    batches.get(mesh.material).push(geometry);
    model.remove(mesh);
  });
  for (const [surface, batch] of batches) {
    const geometry = mergeGeometries(batch);
    geometries.add(geometry);
    const mesh = new THREE.Mesh(geometry, surface);
    mesh.castShadow = surface !== glass && !glassVariants.includes(surface);
    mesh.receiveShadow = ![...originalMaterials.values()].includes(surface);
    model.add(mesh);
    batch.forEach((source) => {
      source.dispose();
      geometries.delete(source);
    });
  }

  let disposed = false;
  let hovered = false;
  let frameId = 0;
  let targetX = -400;
  let currentX = -400;
  let targetY = 650;
  let currentY = 650;
  let lastFrameTime = 0;
  let windowLight = 0;

  function resize() {
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    const scale = Math.max(540 / width, 600 / height);
    camera.left = -width * scale / 2;
    camera.right = width * scale / 2;
    camera.top = height * scale / 2;
    camera.bottom = -height * scale / 2;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  }

  function tick(time) {
    if (disposed) return;
    const elapsed = Math.min(time - lastFrameTime || 16, 50);
    const easing = 1 - Math.exp(-elapsed / 220);
    lastFrameTime = time;
    currentX += (targetX - currentX) * easing;
    currentY += (targetY - currentY) * easing;
    const targetLight = hovered ? 1 : 0;
    windowLight += (targetLight - windowLight) * (1 - Math.exp(-elapsed / 330));
    glassVariants.forEach((surface, index) => {
      surface.emissiveIntensity = windowLight * (0.85 + index * 0.12);
    });
    warmGlass.emissiveIntensity = 0.28 + windowLight * 1.1;
    sun.position.set(currentX, currentY, 900);
    host.style.setProperty('--artwork-shift-x', `${((currentX + 400) / 125 * 4).toFixed(2)}px`);
    host.style.setProperty('--artwork-shift-y', `${((currentY - 650) / 90 * 3).toFixed(2)}px`);
    renderer.render(scene, camera);
    if (Math.abs(targetX - currentX) + Math.abs(targetY - currentY) > 0.4 || Math.abs(targetLight - windowLight) > 0.002) frameId = requestAnimationFrame(tick);
    else frameId = 0;
  }
  function enter() {
    hovered = true;
    if (!frameId) frameId = requestAnimationFrame(tick);
  }
  function leave() {
    hovered = false;
    targetX = -400;
    targetY = 650;
    if (!frameId) frameId = requestAnimationFrame(tick);
  }
  function move(event) {
    const rect = host.getBoundingClientRect();
    targetX = -400 + ((event.clientX - rect.left) / rect.width - 0.5) * 250;
    targetY = 650 - ((event.clientY - rect.top) / rect.height - 0.5) * 180;
    if (hovered && !frameId) frameId = requestAnimationFrame(tick);
  }
  function contextLost(event) {
    event.preventDefault();
    host.removeAttribute('data-webgl-ready');
    cancelAnimationFrame(frameId);
  }

  const observer = new ResizeObserver(resize);
  observer.observe(host);
  host.addEventListener('pointerenter', enter);
  host.addEventListener('pointerleave', leave);
  host.addEventListener('pointermove', move);
  renderer.domElement.addEventListener('webglcontextlost', contextLost);
  resize();
  if (options.capturePoster) {
    host.dataset.posterCapture = renderer.domElement.toDataURL('image/png');
  }
  host.dataset.webglReady = 'true';
  if (host.matches(':hover')) enter();

  return () => {
    disposed = true;
    cancelAnimationFrame(frameId);
    observer.disconnect();
    host.removeEventListener('pointerenter', enter);
    host.removeEventListener('pointerleave', leave);
    host.removeEventListener('pointermove', move);
    host.style.removeProperty('--artwork-shift-x');
    host.style.removeProperty('--artwork-shift-y');
    renderer.domElement.removeEventListener('webglcontextlost', contextLost);
    host.removeAttribute('data-webgl-ready');
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((surface) => surface.dispose());
    textures.forEach((texture) => texture.dispose());
    environment.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  };
}
