const canvas = document.getElementById('space');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Space color palette
const spaceColors = [
  '#ebf8e1', // bright white
  '#b6e0fe', // light blue
  '#ffc6ff', // violet
  '#e0b0ff', // lavender
  '#ffd6a5', // pastel orange
  '#bae1ff', // pale blue
  '#fcb9b2', // soft pink
  '#fff3b0', // yellow
  '#a3cef1', // ice blue
  '#b3b8e6', // periwinkle
];

// Generate stars
const STAR_COUNT = 120;
const stars = [];

function randomColor() {
  return spaceColors[Math.floor(Math.random() * spaceColors.length)];
}

class Star {
  constructor(x, y, r, color) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.color = color;
    this.glow = Math.random() * 8 + 6;
    this.pulse = Math.random() * Math.PI * 2;
  }
  draw(ctx, time) {
    // Twinkling effect
    const pulse = Math.sin(time / 600 + this.pulse) * 0.35 + 0.85;
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r * pulse, 0, Math.PI * 2);
    ctx.shadowColor = this.color;
    ctx.shadowBlur = this.glow * pulse;
    ctx.fillStyle = this.color;
    ctx.globalAlpha = 0.82;
    ctx.fill();
    ctx.restore();
  }
}

function generateStars() {
  stars.length = 0;
  for (let i = 0; i < STAR_COUNT; i++) {
    let x = Math.random() * canvas.width;
    let y = Math.random() * canvas.height;
    let r = Math.random() * 1.7 + 0.8;
    let color = randomColor();
    stars.push(new Star(x, y, r, color));
  }
}
generateStars();

window.addEventListener('resize', () => {
  generateStars();
});

// Constellation connection (now only for grouping, not for drawing lines)
function distance(a, b) {
  return Math.sqrt((a.x-b.x)**2 + (a.y-b.y)**2);
}

let mouse = {x: canvas.width/2, y: canvas.height/2};

canvas.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

// Generate "anchor" stars for constellations (subsets of stars)
const CONSTELLATION_COUNT = 6;
const constellations = [];
function generateConstellations() {
  constellations.length = 0;
  const step = Math.floor(STAR_COUNT / CONSTELLATION_COUNT);
  for (let i = 0; i < CONSTELLATION_COUNT; i++) {
    const size = Math.floor(Math.random() * 5) + 4; // 4-8 stars
    let anchor = Math.floor(Math.random() * (STAR_COUNT - size));
    let indices = [];
    for (let j = 0; j < size; j++) {
      indices.push(anchor+j);
    }
    constellations.push(indices);
  }
}
generateConstellations();

window.addEventListener('resize', generateConstellations);

// Animation loop
function draw(time) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw background nebula clouds
  drawNebula(ctx, time);

  // Draw stars
  for (let s of stars) s.draw(ctx, time);

  // Draw glowing points at mouse intersections (keep this for the effect)
  for (let c of constellations) {
    let anchorStars = c.map(idx => stars[idx]);
    anchorStars.sort((a, b) =>
      distance(a, mouse) - distance(b, mouse)
    );
    // Closest star to mouse
    let s = anchorStars[0];
    ctx.save();
    ctx.beginPath();
    ctx.arc(s.x, s.y, 7 + Math.sin(time/300)*2, 0, 2*Math.PI);
    ctx.shadowColor = '#8be9fd';
    ctx.shadowBlur = 16;
    ctx.fillStyle = '#43e0ff';
    ctx.globalAlpha = 0.34 + 0.24 * Math.sin(time/350);
    ctx.fill();
    ctx.restore();
  }

  requestAnimationFrame(draw);
}

// Nebula background
function drawNebula(ctx, time) {
  // 2-3 overlapping radial gradients with color shift
  const nebulaCenters = [
    [canvas.width*0.35, canvas.height*0.3, 300+70*Math.sin(time/1500)],
    [canvas.width*0.7, canvas.height*0.65, 260+80*Math.cos(time/1200)],
    [canvas.width*0.5+120*Math.sin(time/3000), canvas.height*0.8, 350+50*Math.sin(time/800)]
  ];
  const nebulaColors = [
    ['#44e3ff11', '#5c51ff22', '#e0b0ff11'],
    ['#fff3b022', '#e0b0ff22', '#bae1ff11'],
    ['#ffc6ff33', '#fcb9b222', '#bae1ff11']
  ];
  for (let i = 0; i < nebulaCenters.length; i++) {
    let [x, y, r] = nebulaCenters[i];
    let grad = ctx.createRadialGradient(
      x, y, r*0.1,
      x, y, r
    );
    let colors = nebulaColors[i];
    grad.addColorStop(0, colors[0]);
    grad.addColorStop(0.6, colors[1]);
    grad.addColorStop(1, colors[2]);
    ctx.save();
    ctx.globalAlpha = 0.85 + 0.1*Math.sin(time/1700+i);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2*Math.PI);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();
  }
}

// Interactivity: click to randomize constellations
canvas.addEventListener('click', () => {
  generateConstellations();
});

requestAnimationFrame(draw);
