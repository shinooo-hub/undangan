/**
 * Falling Flower Petals Engine (Bunga Berguguran)
 * High-performance canvas-based sakura & rose petals simulation
 */

class PetalEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.petals = [];
    this.isRunning = true;
    this.width = 0;
    this.height = 0;
    this.wind = 0.5;
    this.windTarget = 0.5;
    this.windTimer = 0;

    // Palette of soft pastel pinks for realistic petals
    this.petalColors = [
      { start: 'rgba(255, 192, 203, 0.85)', end: 'rgba(247, 168, 184, 0.7)' },
      { start: 'rgba(255, 218, 224, 0.9)', end: 'rgba(255, 182, 193, 0.65)' },
      { start: 'rgba(254, 225, 232, 0.85)', end: 'rgba(240, 150, 170, 0.75)' },
      { start: 'rgba(255, 240, 245, 0.95)', end: 'rgba(235, 160, 180, 0.7)' },
      { start: 'rgba(250, 180, 195, 0.85)', end: 'rgba(214, 125, 148, 0.75)' }
    ];

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Petal count based on screen width
    const petalCount = window.innerWidth < 768 ? 32 : 55;
    for (let i = 0; i < petalCount; i++) {
      this.petals.push(this.createPetal(true));
    }

    this.loop();
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  createPetal(initial = false) {
    const size = Math.random() * 14 + 10; // 10px to 24px
    const color = this.petalColors[Math.floor(Math.random() * this.petalColors.length)];

    return {
      x: Math.random() * this.width,
      y: initial ? Math.random() * this.height : -size * 2,
      size: size,
      aspectRatio: Math.random() * 0.4 + 0.6, // Petal oval proportion
      speedY: Math.random() * 1.2 + 0.9,       // Falling speed
      speedX: Math.random() * 0.8 - 0.4,       // Drift speed
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.03,
      flip: Math.random() * Math.PI,
      flipSpeed: Math.random() * 0.03 + 0.015,
      swayOffset: Math.random() * Math.PI * 2,
      swaySpeed: Math.random() * 0.02 + 0.01,
      opacity: Math.random() * 0.4 + 0.6,
      color: color
    };
  }

  update() {
    // Dynamic soft wind simulation
    this.windTimer++;
    if (this.windTimer % 180 === 0) {
      this.windTarget = (Math.random() - 0.4) * 1.2;
    }
    this.wind += (this.windTarget - this.wind) * 0.01;

    for (let i = 0; i < this.petals.length; i++) {
      const p = this.petals[i];

      p.swayOffset += p.swaySpeed;
      p.rotation += p.rotationSpeed;
      p.flip += p.flipSpeed;

      // Realistic flutter movement
      p.y += p.speedY + Math.sin(p.swayOffset) * 0.4;
      p.x += p.speedX + this.wind + Math.sin(p.swayOffset) * 1.1;

      // Respawn when petal goes off screen
      if (p.y > this.height + p.size || p.x < -p.size * 2 || p.x > this.width + p.size * 2) {
        this.petals[i] = this.createPetal(false);
      }
    }
  }

  drawPetal(p) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.scale(1, Math.cos(p.flip) * p.aspectRatio);

    // Create soft gradient for organic petal look
    const grad = ctx.createRadialGradient(0, -p.size * 0.2, 2, 0, 0, p.size);
    grad.addColorStop(0, p.color.start);
    grad.addColorStop(1, p.color.end);

    ctx.fillStyle = grad;
    ctx.beginPath();
    
    // Smooth bezier curve petal shape
    ctx.moveTo(0, -p.size);
    ctx.bezierCurveTo(p.size * 0.7, -p.size * 0.8, p.size * 0.9, p.size * 0.3, 0, p.size);
    ctx.bezierCurveTo(-p.size * 0.9, p.size * 0.3, -p.size * 0.7, -p.size * 0.8, 0, -p.size);
    
    ctx.fill();

    // Subtle petal center vein
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -p.size * 0.7);
    ctx.quadraticCurveTo(p.size * 0.1, 0, 0, p.size * 0.7);
    ctx.stroke();

    ctx.restore();
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    for (let i = 0; i < this.petals.length; i++) {
      this.drawPetal(this.petals[i]);
    }
  }

  loop() {
    if (this.isRunning) {
      this.update();
      this.draw();
    }
    requestAnimationFrame(() => this.loop());
  }

  toggle() {
    this.isRunning = !this.isRunning;
    if (!this.isRunning) {
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
    return this.isRunning;
  }
}

// Instantiate on DOM ready
let petalEngineInstance = null;
document.addEventListener('DOMContentLoaded', () => {
  petalEngineInstance = new PetalEngine('petals-canvas');
});
