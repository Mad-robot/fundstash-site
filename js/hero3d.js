// Hero: a real-time 3D phone running Fundstash, with ₹ coins, floating transaction cards and drifting particles.
// three.js is served from this site (CSP: script-src 'self'); no network calls, no tracking.
import * as THREE from '../vendor/three.module.min.js';
import { RoundedBoxGeometry } from '../vendor/RoundedBoxGeometry.js';
import { RoomEnvironment } from '../vendor/RoomEnvironment.js';

const root = document.documentElement;
const canvas = document.getElementById('scene');
const hero = document.getElementById('hero');
const reduce = root.classList.contains('reduce');

function start() {
  if (!canvas || root.classList.contains('no-webgl')) return;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: (window.devicePixelRatio || 1) < 1.5, alpha: true });
  } catch (e) {
    root.classList.add('no-webgl');
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 6);

  // ---------- lights ----------
  scene.add(new THREE.AmbientLight(0x8fa8c8, 0.35));
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(-3, 4, 5);
  scene.add(key);
  const teal = new THREE.PointLight(0x2dd4bf, 28, 12, 1.6);
  teal.position.set(2.4, 0.6, 2.2);
  scene.add(teal);
  const indigo = new THREE.PointLight(0x818cf8, 22, 12, 1.6);
  indigo.position.set(-2.2, -1.6, 1.6);
  scene.add(indigo);

  const loader = new THREE.TextureLoader();
  const tex = (url) => {
    const t = loader.load(url);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  };

  // ---------- phone ----------
  const W = 0.8, H = 1.66, D = 0.09;
  const phone = new THREE.Group();
  const body = new THREE.Mesh(
    new RoundedBoxGeometry(W, H, D, 5, 0.13),
    new THREE.MeshStandardMaterial({ color: 0x1b2333, metalness: 0.85, roughness: 0.24 })
  );
  phone.add(body);

  // two stacked screen planes so screens can cross-fade
  const SW = 0.742, SH = SW * (1295 / 600);
  const screenGeo = new THREE.PlaneGeometry(SW, SH);
  const screens = ['dashboard', 'transactions', 'budgets', 'lock', 'split'].map((id) => tex(`/img/screens/${id}.webp`));
  const screenA = new THREE.Mesh(screenGeo, new THREE.MeshBasicMaterial({ map: screens[0], transparent: true, toneMapped: false }));
  const screenB = new THREE.Mesh(screenGeo, new THREE.MeshBasicMaterial({ map: screens[1], transparent: true, opacity: 0, toneMapped: false }));
  screenA.position.z = D / 2 + 0.001;
  screenB.position.z = D / 2 + 0.002;
  phone.add(screenA, screenB);

  // glass sheen over the screen
  const sheen = new THREE.Mesh(
    new THREE.PlaneGeometry(SW, SH),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.04, toneMapped: false })
  );
  sheen.position.z = D / 2 + 0.004;
  phone.add(sheen);

  // back: camera bump + lenses
  const bump = new THREE.Mesh(
    new RoundedBoxGeometry(0.3, 0.3, 0.03, 4, 0.07),
    new THREE.MeshStandardMaterial({ color: 0x232c3d, metalness: 0.9, roughness: 0.2 })
  );
  bump.position.set(-W / 2 + 0.2, H / 2 - 0.2, -D / 2 - 0.012);
  phone.add(bump);
  const lensMat = new THREE.MeshStandardMaterial({ color: 0x05070c, metalness: 0.4, roughness: 0.08 });
  [[-0.06, 0.06], [0.06, -0.06], [-0.06, -0.06]].forEach(([x, y]) => {
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 20), lensMat);
    lens.rotation.x = Math.PI / 2;
    lens.position.set(bump.position.x + x, bump.position.y + y, -D / 2 - 0.03);
    phone.add(lens);
  });
  // side buttons
  const btnMat = new THREE.MeshStandardMaterial({ color: 0x2a3446, metalness: 0.9, roughness: 0.3 });
  [[0.32, 0.2], [0.12, 0.14]].forEach(([y, h]) => {
    const b = new THREE.Mesh(new RoundedBoxGeometry(0.02, h, 0.04, 2, 0.008), btnMat);
    b.position.set(W / 2 + 0.006, y, 0);
    phone.add(b);
  });
  scene.add(phone);

  // ---------- ₹ coins ----------
  function coinFace() {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d');
    const grd = g.createRadialGradient(100, 90, 20, 128, 128, 128);
    grd.addColorStop(0, '#99f6e4');
    grd.addColorStop(0.55, '#2dd4bf');
    grd.addColorStop(1, '#0d9488');
    g.fillStyle = grd;
    g.beginPath();
    g.arc(128, 128, 128, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = 'rgba(4,32,28,0.35)';
    g.lineWidth = 10;
    g.beginPath();
    g.arc(128, 128, 104, 0, Math.PI * 2);
    g.stroke();
    g.fillStyle = 'rgba(4,32,28,0.75)';
    g.font = '800 140px Inter, system-ui, sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('₹', 128, 138);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }
  const face = coinFace();
  const coinGeo = new THREE.CylinderGeometry(0.17, 0.17, 0.035, 36);
  const coinSide = new THREE.MeshStandardMaterial({ color: 0x14b8a6, metalness: 1, roughness: 0.22 });
  const coinCap = new THREE.MeshStandardMaterial({ map: face, metalness: 0.35, roughness: 0.42, envMapIntensity: 0.6 });
  const coins = [];
  const coinSpots = [
    [-0.82, 0.9, 0.3], [0.9, -0.62, 0.55], [-0.78, -0.92, -0.2], [0.86, 0.98, -0.3], [0.15, 1.3, -0.7], [-0.15, -1.32, 0.25],
  ];
  coinSpots.forEach((p, i) => {
    const m = new THREE.Mesh(coinGeo, [coinSide, coinCap, coinCap]);
    m.position.set(...p);
    m.rotation.set(Math.PI / 2 + (i % 2 ? 0.5 : -0.4), i * 0.7, 0.3 * i);
    m.userData = { base: new THREE.Vector3(...p), speed: 0.4 + (i % 3) * 0.15, phase: i * 1.3, spin: (i % 2 ? 1 : -1) * (0.4 + i * 0.07) };
    scene.add(m);
    coins.push(m);
  });

  // ---------- floating transaction cards ----------
  function cardTexture(emoji, title, sub, amount, positive) {
    const c = document.createElement('canvas');
    c.width = 640;
    c.height = 200;
    const g = c.getContext('2d');
    const r = 44;
    g.beginPath();
    g.moveTo(r, 0); g.lineTo(640 - r, 0); g.quadraticCurveTo(640, 0, 640, r); g.lineTo(640, 200 - r);
    g.quadraticCurveTo(640, 200, 640 - r, 200); g.lineTo(r, 200); g.quadraticCurveTo(0, 200, 0, 200 - r); g.lineTo(0, r); g.quadraticCurveTo(0, 0, r, 0);
    const bg = g.createLinearGradient(0, 0, 640, 200);
    bg.addColorStop(0, 'rgba(30,42,62,0.92)');
    bg.addColorStop(1, 'rgba(14,21,34,0.92)');
    g.fillStyle = bg;
    g.fill();
    g.strokeStyle = 'rgba(94,234,212,0.45)';
    g.lineWidth = 3;
    g.stroke();
    g.fillStyle = 'rgba(45,212,191,0.16)';
    g.beginPath();
    g.arc(100, 100, 52, 0, Math.PI * 2);
    g.fill();
    g.font = '58px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(emoji, 100, 104);
    g.textAlign = 'left';
    g.fillStyle = '#f8fafc';
    g.font = '700 44px Inter, system-ui, sans-serif';
    g.fillText(title, 178, 82);
    g.fillStyle = '#94a3b8';
    g.font = '500 30px Inter, system-ui, sans-serif';
    g.fillText(sub, 178, 132);
    g.textAlign = 'right';
    g.fillStyle = positive ? '#34d399' : '#f87171';
    g.font = '800 46px Inter, system-ui, sans-serif';
    g.fillText(amount, 604, 104);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }
  const cardGeo = new THREE.PlaneGeometry(0.95, 0.297);
  const cards = [
    ['🍽️', 'Swiggy', 'from HDFC SMS', '−₹450', false, [-0.92, 0.28, 0.65]],
    ['💰', 'Salary', 'Acme Corp', '+₹85,000', true, [0.8, 0.5, 0.55]],
    ['🛒', 'DMart', 'receipt scan', '−₹1,284', false, [0.78, -1.08, 0.15]],
  ].map(([e, t, s, a, pos, p], i) => {
    const m = new THREE.Mesh(cardGeo, new THREE.MeshBasicMaterial({ map: cardTexture(e, t, s, a, pos), transparent: true, toneMapped: false, depthWrite: false }));
    m.position.set(...p);
    m.userData = { base: new THREE.Vector3(...p), phase: i * 2.1 };
    scene.add(m);
    return m;
  });

  // ---------- particles ----------
  const N = 500;
  const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const r = 2.5 + Math.random() * 4;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
    pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.7;
    pos[i * 3 + 2] = r * Math.cos(ph) - 2;
  }
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const dots = new THREE.Points(pg, new THREE.PointsMaterial({ color: 0x5eead4, size: 0.022, transparent: true, opacity: 0.65, blending: THREE.AdditiveBlending, depthWrite: false }));
  scene.add(dots);

  // ---------- layout ----------
  const rig = new THREE.Group(); // everything except particles follows the layout
  [phone, ...coins, ...cards].forEach((o) => rig.add(o));
  scene.add(rig);

  let narrow = false;
  function resize() {
    const w = hero.clientWidth;
    const h = hero.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    narrow = w < 900;
    // desktop: phone sits right of the headline; mobile: below it
    // half the visible width at z=0 is tan(16°)·6·aspect ≈ 1.72·aspect; put the phone at ~70% across
    rig.position.set(narrow ? 0 : Math.min(1.9, 0.69 * camera.aspect), narrow ? -1.2 : -0.05, 0);
    rig.scale.setScalar(narrow ? Math.min(0.8, 0.55 * camera.aspect + 0.3) : 1);
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  // ---------- interaction ----------
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener('pointermove', (e) => {
    pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  let scrollP = 0;
  window.addEventListener('scroll', () => {
    scrollP = Math.min(1, Math.max(0, window.scrollY / (hero.offsetHeight || 1)));
  }, { passive: true });

  // screen cross-fade every few seconds
  let shown = 0;
  let fadeStart = -1;
  const FADE = 0.9;
  function nextScreen(t) {
    shown = (shown + 1) % screens.length;
    screenB.material.map = screens[shown];
    screenB.material.needsUpdate = true;
    fadeStart = t;
  }

  let visible = true;
  new IntersectionObserver((entries) => { visible = entries[0].isIntersecting; }, { threshold: 0 }).observe(hero);

  const clock = new THREE.Clock();
  let lastSwap = 0;
  let shownCanvas = false;
  function frame() {
    requestAnimationFrame(frame);
    if (!visible || document.hidden) return;
    const t = clock.getElapsedTime();

    pointer.x += (pointer.tx - pointer.x) * 0.05;
    pointer.y += (pointer.ty - pointer.y) * 0.05;

    // phone: gentle float, follows the pointer, turns away as the page scrolls
    phone.position.y = Math.sin(t * 0.9) * 0.05;
    phone.rotation.y = -0.38 + pointer.x * 0.28 + Math.sin(t * 0.35) * 0.06 + scrollP * 1.3;
    phone.rotation.x = 0.08 + pointer.y * 0.16 - scrollP * 0.35;
    phone.rotation.z = 0.05 + Math.sin(t * 0.5) * 0.02;
    rig.position.z = -scrollP * 1.2;

    coins.forEach((c) => {
      const u = c.userData;
      c.position.y = u.base.y + Math.sin(t * u.speed + u.phase) * 0.12;
      c.position.x = u.base.x + Math.cos(t * u.speed * 0.7 + u.phase) * 0.05;
      c.rotation.y += 0.01 * u.spin;
      c.rotation.z = Math.sin(t * 0.6 + u.phase) * 0.4;
    });
    cards.forEach((c) => {
      const u = c.userData;
      c.position.y = u.base.y + Math.sin(t * 0.7 + u.phase) * 0.08;
      c.rotation.y = -0.25 + pointer.x * 0.2 + Math.sin(t * 0.4 + u.phase) * 0.08;
      c.rotation.x = pointer.y * 0.1;
    });
    dots.rotation.y = t * 0.02 + pointer.x * 0.08;
    dots.rotation.x = pointer.y * 0.05;

    if (!reduce && t - lastSwap > 3.6 && fadeStart < 0) {
      lastSwap = t;
      nextScreen(t);
    }
    if (fadeStart >= 0) {
      const k = Math.min(1, (t - fadeStart) / FADE);
      screenB.material.opacity = k;
      if (k >= 1) {
        screenA.material.map = screens[shown];
        screenA.material.needsUpdate = true;
        screenB.material.opacity = 0;
        fadeStart = -1;
      }
    }

    camera.position.x = pointer.x * 0.15;
    camera.position.y = -pointer.y * 0.1;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
    if (!shownCanvas) { shownCanvas = true; canvas.classList.add('ready'); }
  }

  if (reduce) {
    // one still frame, no motion
    phone.rotation.set(0.08, -0.38, 0.05);
    renderer.render(scene, camera);
    canvas.classList.add('ready');
    loader.manager.onLoad = () => renderer.render(scene, camera);
    return;
  }
  frame();
}

if (document.readyState === 'complete') setTimeout(start, 0);
else window.addEventListener('load', () => (window.requestIdleCallback ? requestIdleCallback(start, { timeout: 600 }) : setTimeout(start, 0)));
