(() => {
/* ---------- Envelope ---------- */
const env = document.getElementById('env');
const seal = document.getElementById('seal');
const stage = document.getElementById('stage');
const letter = document.getElementById('letter');
const bgm = document.getElementById('bgm');
const musicBtn = document.getElementById('musicBtn');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const hasMusic = () => (bgm.getAttribute('src') || '').trim() !== '';
if (hasMusic()) musicBtn.classList.add('available');

let opened = false;
seal.addEventListener('click', () => {
  if (opened) return;
  opened = true;

  env.classList.add('open');
  stage.classList.add('opening');

  // Music starts on this click, which browsers allow as a user gesture
  if (hasMusic()) {
    bgm.volume = 0.6;
    bgm.play().catch(() => musicBtn.classList.add('muted'));
  }

  setTimeout(() => {
    stage.classList.add('done');
    letter.classList.add('show');
    letter.focus({ preventScroll: true });
  }, reduceMotion ? 50 : 2000);
});

musicBtn.addEventListener('click', () => {
  if (bgm.paused) {
    bgm.play();
    musicBtn.classList.remove('muted');
  } else {
    bgm.pause();
    musicBtn.classList.add('muted');
  }
});

/* ---------- Falling rose petals ---------- */
const canvas = document.getElementById('petals');
const ctx = canvas.getContext('2d');
const colors = ['#c9959b', '#b87f88', '#d8b4b0', '#a67279', '#caa7a0', '#9d6a73'];
let w, h, dpr, petals = [];

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  w = window.innerWidth;
  h = window.innerHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function makePetal(initial) {
  const size = 7 + Math.random() * 11;
  return {
    x: Math.random() * w,
    y: initial ? Math.random() * h : -size * 2 - Math.random() * h * 0.3,
    size,
    speed: 0.45 + Math.random() * 0.95,
    sway: 0.6 + Math.random() * 1.4,
    swayPhase: Math.random() * Math.PI * 2,
    swaySpeed: 0.005 + Math.random() * 0.012,
    rot: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.02,
    flip: Math.random() * Math.PI * 2,
    flipSpeed: 0.01 + Math.random() * 0.025,
    color: colors[(Math.random() * colors.length) | 0],
    alpha: 0.5 + Math.random() * 0.4
  };
}

function drawPetal(p) {
  const s = p.size;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot);
  ctx.scale(Math.max(0.25, Math.abs(Math.cos(p.flip))), 1);
  ctx.globalAlpha = p.alpha;
  ctx.fillStyle = p.color;
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.bezierCurveTo(s * 0.95, -s * 0.55, s * 0.8, s * 0.75, 0, s);
  ctx.bezierCurveTo(-s * 0.8, s * 0.75, -s * 0.95, -s * 0.55, 0, -s);
  ctx.fill();
  // soft highlight vein
  ctx.globalAlpha = p.alpha * 0.25;
  ctx.strokeStyle = '#f1e9e6';
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.7);
  ctx.quadraticCurveTo(s * 0.12, 0, 0, s * 0.7);
  ctx.stroke();
  ctx.restore();
}

function init() {
  resize();
  const count = Math.round(Math.min(46, Math.max(22, w / 32)));
  petals = Array.from({ length: count }, () => makePetal(true));
}

function tick() {
  ctx.clearRect(0, 0, w, h);
  for (const p of petals) {
    p.swayPhase += p.swaySpeed;
    p.x += Math.sin(p.swayPhase) * p.sway * 0.5 + 0.12;
    p.y += p.speed;
    p.rot += p.rotSpeed;
    p.flip += p.flipSpeed;
    if (p.y - p.size > h || p.x < -40 || p.x > w + 40) Object.assign(p, makePetal(false));
    drawPetal(p);
  }
  requestAnimationFrame(tick);
}

window.addEventListener('resize', resize);
init();
if (reduceMotion) {
  petals.forEach(drawPetal);
} else {
  tick();
}
})();
