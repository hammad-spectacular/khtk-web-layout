/**
 * Khattak Academy — 3D School Objects (Three.js ES Module)
 * ────────────────────────────────────────────────────────────
 * Stage 1: REAL blackboard + REAL pencil with PBR materials,
 * procedural canvas textures, key/fill/rim lighting + IBL.
 *
 * Debug modes (query string):
 *   ?debug=objects  -> only blackboard + pencil, large & centered,
 *                      slowly rotating, book hidden.
 *   ?debug=fps      -> small on-screen FPS counter.
 *
 * Normal mode hooks into the GSAP scroll timeline for
 * cluster/spread/return; motion polish is Stage 3.
 */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

/* ─────────────────────────────────────────────
   QUERY / DEBUG STATE
   ───────────────────────────────────────────── */
const PARAMS = new URLSearchParams(window.location.search);
const DEBUG_TOKENS = (PARAMS.get('debug') || '').split(',').map(s => s.trim());
const DEBUG_OBJECTS = DEBUG_TOKENS.includes('objects');
const DEBUG_FPS = DEBUG_TOKENS.includes('fps');

/* ─────────────────────────────────────────────
   SHARED STATE
   ───────────────────────────────────────────── */
export const school3d = {
  scene: null,
  camera: null,
  renderer: null,
  objects: [],
  shadowPlanes: [],
  isLowMode: false,
  fps: 60,
  rafId: null,
  isVisible: true,
  prefersReduced: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  frameTimes: [],
  lastTime: performance.now(),
  time: 0,
  scrollProgress: 0,
  debugObjects: DEBUG_OBJECTS,
  debugFps: DEBUG_FPS,
};

/* ─────────────────────────────────────────────
   SMALL HELPERS
   ───────────────────────────────────────────── */
function makeCanvas(w, h) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  return { canvas, ctx: canvas.getContext('2d') };
}

function canvasTex(canvas, srgb = true) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function rand(min, max) {
  return min + Math.random() * (max - min);
}

/* ─────────────────────────────────────────────
   RENDERER
   ───────────────────────────────────────────── */
function initRenderer() {
  const canvas = document.getElementById('school-canvas');
  if (!canvas) { console.error('[School3D] Canvas not found'); return; }

  school3d.renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  });
  school3d.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  school3d.renderer.setSize(window.innerWidth, window.innerHeight);
  school3d.renderer.outputColorSpace = THREE.SRGBColorSpace;
  school3d.renderer.toneMapping = THREE.ACESFilmicToneMapping;
  school3d.renderer.toneMappingExposure = 1.0;
  school3d.renderer.shadowMap.enabled = false;
  school3d.renderer.setClearColor(0x000000, 0); // fully transparent

  // Fixed backdrop canvas, behind the book layer, non-interactive
  canvas.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 100vw; height: 100vh;
    z-index: 4;
    pointer-events: none;
  `;
}

/* ─────────────────────────────────────────────
   SCENE + CAMERA
   ───────────────────────────────────────────── */
function initScene() {
  school3d.scene = new THREE.Scene();
  const camDist = DEBUG_OBJECTS ? 6.6 : 14;
  school3d.camera = new THREE.PerspectiveCamera(
    42, window.innerWidth / window.innerHeight, 0.1, 200
  );
  school3d.camera.position.set(0, 0, camDist);
  school3d.camera.lookAt(0, 0, 0);
}

/* ─────────────────────────────────────────────
   IMAGE-BASED LIGHTING + KEY/FILL/RIM
   ───────────────────────────────────────────── */
function initLighting() {
  const { renderer, scene } = school3d;

  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTexture;
  scene.environmentIntensity = 0.55;
  pmrem.dispose();

  // Warm key light (top-left, amber/gold) — highlights slide as objects turn
  const key = new THREE.DirectionalLight(0xffeedd, 2.2);
  key.position.set(-6, 8, 5);
  scene.add(key);

  // Soft cool fill (right)
  const fill = new THREE.DirectionalLight(0xb0d4ff, 0.9);
  fill.position.set(7, 2, 3);
  scene.add(fill);

  // Gentle rim from behind
  const rim = new THREE.DirectionalLight(0xfff0cc, 0.7);
  rim.position.set(0, -3, -8);
  scene.add(rim);

  // Ambient fill
  scene.add(new THREE.AmbientLight(0xfff8f0, 0.4));
}

/* ─────────────────────────────────────────────
   PROCEDURAL TEXTURES
   ───────────────────────────────────────────── */

// ── soft blurred radial contact shadow (canvas radial gradient) ──
function makeShadowTexture() {
  const size = 256;
  const { canvas, ctx } = makeCanvas(size, size);
  const g = ctx.createRadialGradient(size / 2, size / 2, 8, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
  g.addColorStop(0.35, 'rgba(0, 0, 0, 0.32)');
  g.addColorStop(0.7, 'rgba(0, 0, 0, 0.12)');
  g.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = canvasTex(canvas, false);
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

// ── wood grain (board frame / ledge) ──
function makeWoodTexture(seed = 0) {
  const { canvas, ctx } = makeCanvas(256, 128);
  const base = ctx.createLinearGradient(0, 0, 0, 128);
  base.addColorStop(0, '#8a5a2e');
  base.addColorStop(0.5, '#6e441f');
  base.addColorStop(1, '#532f15');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 256, 128);

  // streaks
  for (let i = 0; i < 220; i++) {
    const y = Math.random() * 128;
    const len = rand(30, 220);
    const x = Math.random() * 256 - len;
    const tone = Math.random() < 0.5 ? 'rgba(255, 215, 160, 0.10)' : 'rgba(30, 15, 5, 0.16)';
    ctx.strokeStyle = tone;
    ctx.lineWidth = rand(0.6, 2.6);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len, y + rand(-0.8, 0.8));
    ctx.stroke();
  }

  // knots
  for (let i = 0; i < 3; i++) {
    const kx = Math.random() * 256;
    const ky = Math.random() * 128;
    ctx.strokeStyle = 'rgba(50, 26, 8, 0.4)';
    ctx.lineWidth = 1;
    for (let r = 2; r < 9; r += 2) {
      ctx.beginPath();
      ctx.ellipse(kx, ky, r, r * rand(0.5, 0.8), rand(-0.4, 0.4), 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // top-left sheen
  ctx.fillStyle = 'rgba(255, 240, 210, 0.06)';
  ctx.fillRect(0, 0, 256, 40);

  return canvasTex(canvas);
}

// ── slate board: dark green + chalk dust + handwritten equations ──
function makeSlateCanvas(seed = 0) {
  const { canvas, ctx } = makeCanvas(768, 480);
  const bg = ctx.createLinearGradient(0, 0, 0, 480);
  bg.addColorStop(0, '#2c4d30');
  bg.addColorStop(0.5, '#1e3822');
  bg.addColorStop(1, '#122414');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 768, 480);

  // mottled board tone (uneven pigment)
  for (let i = 0; i < 900; i++) {
    const x = Math.random() * 768;
    const y = Math.random() * 480;
    const r = rand(8, 60);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const light = Math.random() < 0.5;
    g.addColorStop(0, light ? 'rgba(120, 150, 120, 0.05)' : 'rgba(0, 0, 0, 0.08)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  // chalk-dust smudges near the left/right where a hand wiped
  for (let i = 0; i < 8; i++) {
    const x = rand(0, 768);
    const y = rand(60, 440);
    const r = rand(50, 150);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(235, 238, 225, 0.05)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  const chalk = (text, cx, cy, size, angle, alpha = 0.85) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.font = `${size}px 'Segoe Script', 'Comic Sans MS', 'Segoe Print', cursive`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < 4; i++) { // layered strokes = chalk texture on the lettering
      ctx.strokeStyle = `rgba(250, 250, 244, ${alpha * 0.22})`;
      ctx.lineWidth = size * 0.18;
      ctx.strokeText(text, rand(-0.8, 0.8), rand(-0.8, 0.8));
    }
    ctx.fillStyle = `rgba(250, 250, 244, ${alpha})`;
    ctx.fillText(text, 0, 0);
    ctx.restore();
  };

  // uneven handwritten equations
  chalk('E = mc²', 384, 150, 64, -0.028);
  chalk('a² + b² = c²', 384, 268, 50, 0.022);
  chalk('∑  ∫  π  lim', 384, 392, 40, -0.015, 0.55);
  chalk('✓', 96, 100, 44, 0.35, 0.5);

  // stray chalk flecks
  for (let i = 0; i < 500; i++) {
    if (Math.random() < 0.5) continue;
    ctx.fillStyle = `rgba(250, 250, 244, ${rand(0.02, 0.09)})`;
    const x = Math.random() * 768;
    const y = Math.random() * 480;
    ctx.fillRect(x, y, rand(0.6, 2.2), rand(0.6, 2.2));
  }

  return canvas;
}

// ── slate rough canvas (roughness map for the board) ──
function makeSlateRoughCanvas() {
  const { canvas, ctx } = makeCanvas(256, 160);
  ctx.fillStyle = '#8a8a8a';
  ctx.fillRect(0, 0, 256, 160);
  for (let i = 0; i < 1400; i++) {
    const v = Math.floor(rand(78, 160));
    ctx.fillStyle = `rgba(${v},${v},${v},${rand(0.15, 0.5)})`;
    ctx.fillRect(Math.random() * 256, Math.random() * 160, rand(1, 3), rand(1, 3));
  }
  // chalk text areas are flatter/whiter in the roughness map (sanded dust)
  const tex = canvasTex(canvas, false);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return { tex, canvas };
}

// ── pencil body: 6 hexagonal faces, yellow paint, darker edges ──
function makePencilPaintTexture() {
  const faceW = 64;
  const w = faceW * 6;
  const { canvas, ctx } = makeCanvas(w, 256);

  const yellows = [
    ['#ffd867', '#e8b832'],
    ['#ffdf82', '#f0c03e'],
    ['#f2c138', '#d9a825'],
    ['#c89411', '#b07d07'],
    ['#c89411', '#b8870e'],
    ['#ffe07e', '#f6c844'],
  ];
  for (let f = 0; f < 6; f++) {
    const x = f * faceW;
    const g = ctx.createLinearGradient(x, 0, x + faceW, 0);
    g.addColorStop(0, yellows[f][0]);
    g.addColorStop(0.5, yellows[f][1]);
    g.addColorStop(1, yellows[f][0]);
    ctx.fillStyle = g;
    ctx.fillRect(x, 0, faceW, 256);
  }

  // darker edge lines between the hexagonal facets
  for (let f = 1; f < 6; f++) {
    const x = f * faceW;
    ctx.fillStyle = 'rgba(70, 45, 8, 0.55)';
    ctx.fillRect(x - 1, 0, 2.4, 256);
  }
  // bevel shading along the paint near the ends
  ctx.fillStyle = 'rgba(90, 60, 10, 0.22)';
  ctx.fillRect(0, 0, w, 10);
  ctx.fillStyle = 'rgba(255, 235, 170, 0.20)';
  ctx.fillRect(0, 246, w, 10);

  // paint speckle + tiny scratches
  for (let i = 0; i < 900; i++) {
    ctx.fillStyle = Math.random() < 0.5 ? 'rgba(255, 255, 255, 0.06)' : 'rgba(90, 60, 10, 0.07)';
    ctx.fillRect(Math.random() * w, Math.random() * 256, rand(1, 3), rand(1, 3));
  }
  for (let i = 0; i < 3; i++) {
    const x = Math.random() * w;
    const y = 30 + Math.random() * 200;
    ctx.strokeStyle = 'rgba(90, 60, 10, 0.28)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + rand(-6, 6), y + rand(4, 18));
    ctx.stroke();
  }

  return canvasTex(canvas);
}

// ── pencil ferrule: bright metal with crimped grooves ──
function makeFerruleTexture() {
  const { canvas, ctx } = makeCanvas(256, 64);
  // circumference shading (left bright, right dark) baked into the wrap
  const circ = ctx.createLinearGradient(0, 0, 256, 0);
  circ.addColorStop(0, '#f4f6fa');
  circ.addColorStop(0.45, '#c9cdd6');
  circ.addColorStop(1, '#7c828f');
  ctx.fillStyle = circ;
  ctx.fillRect(0, 0, 256, 64);

  // ridge / groove rings across the height (v axis wraps around the ferrule)
  for (let i = 0; i < 5; i++) {
    const y = 6 + i * 12;
    ctx.fillStyle = 'rgba(50, 54, 62, 0.45)';
    ctx.fillRect(0, y, 256, 3);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillRect(0, y + 3, 256, 1.5);
  }
  // micro noise / brushed feel
  for (let i = 0; i < 700; i++) {
    ctx.fillStyle = Math.random() < 0.5 ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)';
    ctx.fillRect(Math.random() * 256, Math.random() * 64, 1, rand(1, 3));
  }
  return canvasTex(canvas);
}

/* ─────────────────────────────────────────────
   MATERIALS
   ───────────────────────────────────────────── */
let mats = {};
function initMaterials() {
  const woodTex = makeWoodTexture();

  // blackboard frame: varnished wood, slight clearcoat so specular moves in light
  mats.frame = new THREE.MeshPhysicalMaterial({
    map: woodTex,
    roughness: 0.62,
    metalness: 0.0,
    clearcoat: 0.22,
    clearcoatRoughness: 0.55,
  });

  const slateCanvas = makeSlateCanvas();
  const { tex: slateRough } = makeSlateRoughCanvas();
  mats.slate = new THREE.MeshStandardMaterial({
    map: canvasTex(slateCanvas),
    roughnessMap: slateRough,
    roughness: 0.88,
    metalness: 0.0,
  });
  mats.boardBack = new THREE.MeshStandardMaterial({
    map: woodTex,
    roughness: 0.8,
    metalness: 0.0,
  });

  mats.chalkWhite = new THREE.MeshStandardMaterial({
    color: 0xffffff, roughness: 0.9, metalness: 0.0,
  });
  mats.chalkPink = new THREE.MeshStandardMaterial({
    color: 0xf2b8c0, roughness: 0.9, metalness: 0.0,
  });
  mats.eraserWood = new THREE.MeshStandardMaterial({
    color: 0x7a4a22, roughness: 0.75, metalness: 0.0,
  });
  mats.eraserFelt = new THREE.MeshStandardMaterial({
    color: 0x2e2f33, roughness: 1.0, metalness: 0.0,
  });

  // pencil
  mats.pencilBody = new THREE.MeshPhysicalMaterial({
    map: makePencilPaintTexture(),
    roughness: 0.48,
    metalness: 0.0,
    clearcoat: 0.28,
    clearcoatRoughness: 0.55,
    flatShading: true,
  });
  mats.ferrule = new THREE.MeshStandardMaterial({
    map: makeFerruleTexture(),
    roughness: 0.3,
    metalness: 1.0,
  });
  mats.eraser = new THREE.MeshStandardMaterial({
    color: 0xe989a0, roughness: 0.85, metalness: 0.0,
  });
  mats.pencilWood = new THREE.MeshStandardMaterial({
    color: 0xe2c08e, roughness: 0.72, metalness: 0.0,
  });
  mats.graphite = new THREE.MeshStandardMaterial({
    color: 0x2c2c30, roughness: 0.42, metalness: 0.2,
  });

  // soft blurred contact shadow (radial-gradient canvas)
  mats.shadowTex = makeShadowTexture();
  mats.shadow = new THREE.MeshBasicMaterial({
    map: mats.shadowTex,
    transparent: true,
    opacity: 0.0,
    depthWrite: false,
  });
}

/* ─────────────────────────────────────────────
   OBJECT: BLACKBOARD
   ───────────────────────────────────────────── */
function buildBlackboard() {
  const group = new THREE.Group();

  const W = 2.4, H = 1.55, D = 0.07;      // board slab (D ≈ 3% of width)
  const ft = 0.17, fd = 0.13;             // frame plank thickness / depth
  const slab = new THREE.Mesh(
    new RoundedBoxGeometry(W, H, D, 3, 0.02),
    [mats.boardBack, mats.boardBack, mats.boardBack, mats.boardBack, mats.slate, mats.boardBack]
  );
  group.add(slab);

  // wooden frame: top, bottom, left, right (bevelled planks)
  const horiz = new RoundedBoxGeometry(W + ft * 2, ft, fd, 3, 0.02);
  const vert = new RoundedBoxGeometry(ft, H, fd, 3, 0.02);
  const frameZ = 0.05; // frame sits proud of the slate face

  const top = new THREE.Mesh(horiz, mats.frame);
  top.position.set(0, H / 2 + ft / 2, frameZ);
  const bottom = new THREE.Mesh(horiz, mats.frame);
  bottom.position.set(0, -(H / 2 + ft / 2), frameZ);
  const left = new THREE.Mesh(vert, mats.frame);
  left.position.set(-(W / 2 + ft / 2), 0, frameZ);
  const right = new THREE.Mesh(vert, mats.frame);
  right.position.set(W / 2 + ft / 2, 0, frameZ);
  group.add(top, bottom, left, right);

  // chalk ledge across the bottom front
  const ledge = new THREE.Mesh(
    new RoundedBoxGeometry(W + ft * 2 + 0.06, 0.1, fd + 0.04, 2, 0.02),
    mats.frame
  );
  ledge.position.set(0, -(H / 2 + ft + 0.075), frameZ + 0.02);
  ledge.rotation.z = 0.012; // slight unevenness
  group.add(ledge);

  // chalk sticks on the ledge
  const mkChalk = (r, len, mat, yaw) => {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 10, 1), mat);
    c.rotation.x = Math.PI / 2;
    c.rotation.z = yaw;
    c.position.set(0, 0, 0);
    return c;
  };
  const chalk1 = mkChalk(0.032, 0.3, mats.chalkWhite, -0.05);
  chalk1.position.set(-W / 2 + 0.55, ledge.position.y + 0.082, frameZ + 0.09);
  chalk1.rotation.z = -0.06;
  const chalk2 = mkChalk(0.028, 0.22, mats.chalkPink, 0.04);
  chalk2.position.set(-W / 2 + 0.92, ledge.position.y + 0.078, frameZ + 0.075);
  chalk2.rotation.z = 0.045;
  const chalk3 = mkChalk(0.026, 0.16, mats.chalkWhite, -0.03);
  chalk3.position.set(-W / 2 + 1.18, ledge.position.y + 0.076, frameZ + 0.06);
  chalk3.rotation.z = -0.03;
  group.add(chalk1, chalk2, chalk3);

  // eraser: wooden body + felt pad, resting on the ledge
  const eraserBody = new THREE.Mesh(
    new RoundedBoxGeometry(0.2, 0.05, 0.11, 2, 0.008), mats.eraserWood
  );
  eraserBody.position.set(W / 2 - 0.55, ledge.position.y + 0.075, frameZ + 0.07);
  eraserBody.rotation.z = 0.05;
  const eraserFelt = new THREE.Mesh(
    new RoundedBoxGeometry(0.2, 0.02, 0.11, 2, 0.004), mats.eraserFelt
  );
  eraserFelt.position.set(W / 2 - 0.55, ledge.position.y + 0.11, frameZ + 0.07);
  eraserFelt.rotation.z = 0.05;
  group.add(eraserBody, eraserFelt);

  return group;
}

/* ─────────────────────────────────────────────
   OBJECT: PENCIL  (built along +X, tip at -X, eraser at +X)
   ───────────────────────────────────────────── */
function buildPencil() {
  const group = new THREE.Group();

  // hexagonal painted body
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 7.4, 6, 1), mats.pencilBody);
  body.rotation.z = Math.PI / 2;
  group.add(body);

  // metal ferrule with ridges (slightly wider than the body)
  const ferrule = new THREE.Mesh(new THREE.CylinderGeometry(0.375, 0.375, 0.62, 14, 1), mats.ferrule);
  ferrule.rotation.z = Math.PI / 2;
  ferrule.position.x = 3.95;
  group.add(ferrule);

  // pink eraser
  const eraser = new THREE.Mesh(new THREE.CylinderGeometry(0.335, 0.33, 0.55, 12, 1), mats.eraser);
  eraser.rotation.z = Math.PI / 2;
  eraser.position.x = 4.62;
  eraser.rotation.y = 0.12; // slightly misaligned cap
  group.add(eraser);

  // sharpened wood cone (hexagonal)
  const cone = new THREE.Mesh(new THREE.ConeGeometry(0.36, 1.6, 6, 1), mats.pencilWood);
  cone.rotation.z = -Math.PI / 2;
  cone.position.x = -4.5;
  group.add(cone);

  // graphite tip
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.45, 6, 1), mats.graphite);
  tip.rotation.z = -Math.PI / 2;
  tip.position.x = -5.35;
  group.add(tip);

  // about 2.2 world units long
  group.scale.setScalar(0.21);
  return group;
}

/* ─────────────────────────────────────────────
   CONTACT SHADOW PLANE (blurred radial gradient)
   ───────────────────────────────────────────── */
function buildShadowPlane(cfg) {
  const geo = new THREE.PlaneGeometry(3.2, 3.2);
  const mesh = new THREE.Mesh(geo, mats.shadow.clone());
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(cfg.cluster.x, cfg.cluster.y + cfg.shadowY, cfg.cluster.z);
  mesh.scale.setScalar(cfg.shadowScale);
  school3d.scene.add(mesh);
  school3d.shadowPlanes.push(mesh);
  return mesh;
}

/* ─────────────────────────────────────────────
   OBJECT CONFIGURATION (Stage 1: blackboard + pencil)
   ───────────────────────────────────────────── */
const OBJECT_CONFIGS = [
  {
    id: 'blackboard',
    side: 'left',
    build: buildBlackboard,
    cluster: { x: -3.8, y: 0.5,  z: 0.9, rx: 0.14,  ry: -0.3,   rz: -0.06 },
    spread:  { x: -5.7, y: 0.8,  z: 2.0, rx: 0.09,  ry: -0.22,  rz: -0.04 },
    shadowY: -1.28,
    shadowScale: 1.2,
    pageTurn: { rx: 0.4,  ry: 1.2, rz: 0.25 },
    tumbleAxes: { rx: 0.0005, ry: 0.0004, rz: 0.0002 },
    debug: { x: -1.5, y: 0.0, z: 0.0, scale: 1.12 },
  },
  {
    id: 'pencil',
    side: 'left',
    build: buildPencil,
    cluster: { x: -3.1, y: -1.45, z: 1.5, rx: 0.5,  ry: 0.34,   rz: 0.4 },
    spread:  { x: -4.9, y: -2.35, z: 2.5, rx: 0.32, ry: 0.46,   rz: 0.52 },
    shadowY: -1.5,
    shadowScale: 0.55,
    pageTurn: { rx: 0.9,  ry: 2.4,  rz: 1.0 },
    tumbleAxes: { rx: 0.006, ry: 0.005, rz: 0.0025 },
    debug: { x: 1.85, y: -0.55, z: 0.45, scale: 1.0 },
  },
];

/* ─────────────────────────────────────────────
   BUILD all configured objects
   ───────────────────────────────────────────── */
function buildObjects() {
  for (const cfg of OBJECT_CONFIGS) {
    const mesh = cfg.build();
    mesh.position.set(cfg.cluster.x, cfg.cluster.y, cfg.cluster.z);
    mesh.rotation.set(cfg.cluster.rx, cfg.cluster.ry, cfg.cluster.rz);
    mesh.userData = {
      id: cfg.id,
      side: cfg.side,
      cluster: cfg.cluster,
      spread: cfg.spread,
      pageTurn: cfg.pageTurn,
      tumbleAxes: cfg.tumbleAxes,
      shadowY: cfg.shadowY,
      shadowScale: cfg.shadowScale,
      debug: cfg.debug,
    };

    school3d.scene.add(mesh);
    school3d.objects.push(mesh);
    buildShadowPlane(cfg);
  }
}

/* ─────────────────────────────────────────────
   DEBUG MODE SETUP
   ───────────────────────────────────────────── */
function initDebugSetup() {
  if (school3d.debugObjects) {
    document.body.classList.add('debug-objects');
    // slow camera drift so the whole figure is readable
    school3d.camera.position.set(0, 0, 6.6);
  }
  if (school3d.debugFps) {
    const el = document.createElement('div');
    el.id = 'fps-counter';
    el.style.cssText = 'position:fixed;bottom:12px;left:12px;z-index:9999;' +
      'font:12px/1.4 Consolas,monospace;color:#8fe38f;background:rgba(0,0,0,0.62);' +
      'padding:4px 8px;border-radius:4px;pointer-events:none;user-select:none;';
    document.body.appendChild(el);
    school3d._fpsEl = el;
    school3d._fpsAcc = 0;
    school3d._fpsFrames = 0;
  }
}

/* ─────────────────────────────────────────────
   GSAP TIMELINE INTEGRATION (normal mode only)
   ───────────────────────────────────────────── */
function hookIntoGSAP() {
  if (school3d.debugObjects) return; // debug mode is time-driven

  const proxy = { p: 0 };
  gsap.to(proxy, {
    p: 1,
    ease: 'none',
    scrollTrigger: {
      trigger: '.scroll-track',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.5,
      onUpdate(self) {
        school3d.scrollProgress = self.progress;
      },
    },
  });
}

/* ─────────────────────────────────────────────
   VISIBILITY + PERFORMANCE
   ───────────────────────────────────────────── */
function initPerformance() {
  document.addEventListener('visibilitychange', () => {
    school3d.isVisible = !document.hidden;
    if (!school3d.isVisible) {
      cancelAnimationFrame(school3d.rafId);
    } else {
      school3d.lastTime = performance.now();
      animate();
    }
  });
}

/* ─────────────────────────────────────────────
   EASING HELPERS
   ───────────────────────────────────────────── */
function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

/* ─────────────────────────────────────────────
   POSITION FROM PROGRESS (normal mode)
   cluster -> spread -> return, page-turn spins come in Stage 3
   ───────────────────────────────────────────── */
function getPositionsAtProgress(p) {
  school3d.objects.forEach((obj, i) => {
    const ud = obj.userData;
    const { cluster, spread } = ud;

    let x, y, z, rx, ry, rz;
    if (p < 0.12) {
      x = cluster.x; y = cluster.y; z = cluster.z;
      rx = cluster.rx; ry = cluster.ry; rz = cluster.rz;
    } else if (p < 0.45) {
      const t = easeInOut(Math.min(1, Math.max(0, (p - 0.12) / 0.33 - i * 0.015)));
      x = cluster.x + (spread.x - cluster.x) * t;
      y = cluster.y + (spread.y - cluster.y) * t;
      z = cluster.z + (spread.z - cluster.z) * t;
      rx = cluster.rx + (spread.rx - cluster.rx) * t;
      ry = cluster.ry + (spread.ry - cluster.ry) * t;
      rz = cluster.rz + (spread.rz - cluster.rz) * t;
    } else if (p < 0.82) {
      x = spread.x; y = spread.y; z = spread.z;
      rx = spread.rx; ry = spread.ry; rz = spread.rz;
    } else {
      const t = easeInOut(Math.min(1, Math.max(0, (p - 0.82) / 0.14)));
      x = spread.x + (cluster.x - spread.x) * t;
      y = spread.y + (cluster.y - spread.y) * t;
      z = spread.z + (cluster.z - spread.z) * t;
      rx = spread.rx + (cluster.rx - spread.rx) * t;
      ry = spread.ry + (cluster.ry - spread.ry) * t;
      rz = spread.rz + (cluster.rz - spread.rz) * t;
    }

    obj.position.set(x, y, z);
    obj.rotation.set(rx, ry, rz);
  });
}

/* ─────────────────────────────────────────────
   DEBUG TRANSFORMS (time-driven slow rotation)
   ───────────────────────────────────────────── */
function applyDebugTransforms() {
  const t = school3d.time;
  const [blackboard, pencil] = school3d.objects;

  if (blackboard) {
    const d = blackboard.userData.debug;
    blackboard.position.set(d.x, d.y, d.z);
    blackboard.scale.setScalar(d.scale);
    blackboard.rotation.y = Math.sin(t * 0.55) * 0.7;   // slow sway ±40°
    blackboard.rotation.x = 0.12 + Math.sin(t * 0.31) * 0.09;
    blackboard.rotation.z = Math.sin(t * 0.42) * 0.1;
  }
  if (pencil) {
    const d = pencil.userData.debug;
    pencil.position.set(d.x, d.y, d.z);
    pencil.scale.setScalar(d.scale);
    pencil.rotation.y = t * 0.6;                        // gentle spin → light glints travel
    pencil.rotation.x = Math.sin(t * 0.4) * 0.4;
    pencil.rotation.z = 0.55 + Math.sin(t * 0.35) * 0.25;
  }
}

/* ─────────────────────────────────────────────
   SHADOW UPDATE
   ───────────────────────────────────────────── */
function updateShadows(p, opacityScale = 1) {
  school3d.objects.forEach((obj, i) => {
    const sp = school3d.shadowPlanes[i];
    if (!sp) return;
    const ud = obj.userData;
    sp.position.x = obj.position.x;
    sp.position.z = obj.position.z;
    sp.position.y = obj.position.y + ud.shadowY;
    sp.scale.setScalar(ud.shadowScale);
    const target = (p > 0.12 && p < 0.82) ? 0.55 : 0.4;
    sp.material.opacity += (target * opacityScale - sp.material.opacity) * 0.06;
  });
}

/* ─────────────────────────────────────────────
   FPS COUNTER
   ───────────────────────────────────────────── */
function updateFpsCounter(dt) {
  if (!school3d.debugFps || !school3d._fpsEl) return;
  school3d._fpsAcc += dt;
  school3d._fpsFrames++;
  if (school3d._fpsAcc >= 500) {
    const ms = school3d._fpsAcc / school3d._fpsFrames;
    school3d._fpsEl.textContent = `${(1000 / ms).toFixed(1)} fps  |  ${ms.toFixed(1)} ms/frame`;
    school3d._fpsAcc = 0;
    school3d._fpsFrames = 0;
  }
}

/* ─────────────────────────────────────────────
   ANIMATION LOOP
   ───────────────────────────────────────────── */
function animate() {
  school3d.rafId = requestAnimationFrame(animate);
  if (!school3d.isVisible) return;

  const now = performance.now();
  const dt = Math.min(now - school3d.lastTime, 100);
  school3d.lastTime = now;

  // FPS tracking
  if (dt > 0) {
    school3d.frameTimes.push(dt);
    if (school3d.frameTimes.length > 60) school3d.frameTimes.shift();
  }
  if (school3d.frameTimes.length >= 30) {
    const avg = school3d.frameTimes.reduce((a, b) => a + b, 0) / school3d.frameTimes.length;
    school3d.fps = Math.round(1000 / avg);
    if (avg > 24 && !school3d.isLowMode) {
      school3d.isLowMode = true;
      console.log('[School3D] Low mode ON — tumble paused');
    } else if (avg < 20 && school3d.isLowMode) {
      school3d.isLowMode = false;
      console.log('[School3D] Low mode OFF');
    }
  }

  school3d.time += dt * 0.001;
  const p = school3d.scrollProgress;

  // ── transforms
  if (school3d.debugObjects) {
    applyDebugTransforms();
  } else {
    getPositionsAtProgress(p);
  }

  // ── float (sine bob) unless reduced motion
  if (!school3d.prefersReduced) {
    school3d.objects.forEach((obj, i) => {
      const phase = i * 0.7;
      const bobY = Math.sin(school3d.time * 0.4 + phase) * 0.08;
      const bobX = Math.cos(school3d.time * 0.28 + phase) * 0.04;
      obj.position.y += bobY;
      obj.position.x += bobX;
    });
  }

  // ── idle tumble only when spread + not low mode (final motion in Stage 3)
  if (!school3d.isLowMode && !school3d.prefersReduced && !school3d.debugObjects && p > 0.12 && p < 0.82) {
    school3d.objects.forEach((obj) => {
      const ax = obj.userData.tumbleAxes;
      obj.rotation.x += ax.rx;
      obj.rotation.y += ax.ry;
      obj.rotation.z += ax.rz;
    });
  }

  updateShadows(p, school3d.debugObjects ? 0.8 : 1);
  updateFpsCounter(dt);

  school3d.renderer.render(school3d.scene, school3d.camera);
}

/* ─────────────────────────────────────────────
   RESIZE HANDLER
   ───────────────────────────────────────────── */
function initResize() {
  window.addEventListener('resize', () => {
    school3d.camera.aspect = window.innerWidth / window.innerHeight;
    school3d.camera.updateProjectionMatrix();
    school3d.renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

/* ─────────────────────────────────────────────
   QUALITY SWITCH HOOK (wired from script.js)
   ───────────────────────────────────────────── */
window._stopSchoolObjectsTumble = () => {
  school3d.isLowMode = true;
};

/* ─────────────────────────────────────────────
   SELF-DIAGNOSTICS (logged in ?debug=objects)
   Verifies in code: PBR/clearcoat present, environment on,
   bevelled geometry used, no flat planes other than shadows.
   ───────────────────────────────────────────── */
function runDiagnostics() {
  const meshes = [];
  (function walk(o) {
    o.traverse(c => { if (c.isMesh) meshes.push(c); });
  })(school3d.scene);

  const clearcoatMats = {};
  const rounded = [];
  const flatPlanes = [];
  const standardMats = new Map();

  meshes.forEach(m => {
    const geoName = m.geometry ? (m.geometry.constructor.name || m.geometry.type) : '?';
    if (geoName === 'RoundedBoxGeometry' || (/^RoundedBox/).test(geoName)) rounded.push(m.name || m.userData.id || 'unnamed');
    if (geoName === 'PlaneGeometry') flatPlanes.push(m.userData.id || 'shadow');
    const matArr = Array.isArray(m.material) ? m.material : [m.material];
    matArr.forEach(mat => {
      if (!standardMats.has(mat.uuid)) standardMats.set(mat.uuid, { type: mat.type, clearcoat: mat.clearcoat ?? 0, roughness: mat.roughness, metalness: mat.metalness, map: !!mat.map, env: !!mat.envMap });
      const rec = standardMats.get(mat.uuid);
      if (mat.clearcoat && mat.clearcoat > 0) clearcoatMats[mat.type] = (clearcoatMats[mat.type] || 0) + 1;
    });
  });

  const uniqueMats = [...standardMats.values()];
  const diag = {
    environmentMap: !!school3d.scene.environment,
    environmentIntensity: school3d.scene.environmentIntensity,
    toneMapping: school3d.renderer.toneMapping === THREE.ACESFilmicToneMapping ? 'ACESFilmic' : school3d.renderer.toneMapping,
    outputColorSpace: school3d.renderer.outputColorSpace === THREE.SRGBColorSpace ? 'sRGB' : school3d.renderer.outputColorSpace,
    pixelRatio: school3d.renderer.getPixelRatio(),
    antialias: true,
    roundedBoxMeshes: rounded.length,
    flatPlaneMeshes: flatPlanes.length,
    materialCount: uniqueMats.length,
    materialsWithClearcoat: clearcoatMats,
    materials: uniqueMats.map((m, i) => `#${i} ${m.type} cl=${m.clearcoat} rough=${m.roughness} metal=${m.metalness} map=${m.map}`),
    triangleCount: meshes.reduce((n, m) => n + (m.geometry.index ? m.geometry.index.count / 3 : m.geometry.attributes.position.count / 3), 0),
  };
  console.log('[School3D][diagnostics] ' + JSON.stringify(diag, null, 2));
}

/* ─────────────────────────────────────────────
   INIT ENTRY POINT
   ───────────────────────────────────────────── */
export function initSchool3D() {
  initRenderer();
  initScene();
  initLighting();
  initMaterials();
  buildObjects();
  initDebugSetup();
  if (!DEBUG_OBJECTS) hookIntoGSAP();
  initPerformance();
  initResize();

  requestAnimationFrame(() => animate());

  if (DEBUG_OBJECTS) runDiagnostics();
  console.log('[School3D] Stage 1 — real blackboard + pencil. Type window.__school3d for diagnostics.');
  window.__school3d = school3d;
}