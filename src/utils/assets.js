// SonicWall Brand Assets & Visual Utility Library
// Curated for GovWare 2026 In-Booth Engagement

export function preloadGameAssets(scene) {
  const images = [
    { key: 'sw-brand-logo', path: '/assets/images/sonicwall-logo.png' },
    { key: 'sw-university', path: '/assets/images/sonicwall-university.png' },
    { key: 'sw-untitled-transparent', path: '/assets/images/Untitled-transparent.png' },
    { key: 'sw-swoosh', path: '/assets/images/icon-swoosh.png' },
    { key: 'sw-cloud', path: '/assets/images/icon-cloud.png' },
    { key: 'sw-nsa', path: '/assets/images/icon-nsa.png' },
    { key: 'sw-cse', path: '/assets/images/icon-cse.png' },
    { key: 'sw-endpoint', path: '/assets/images/icon-endpoint.png' },
    { key: 'sw-analytics', path: '/assets/images/icon-analytics.png' },
    { key: 'sw-securefirst-shield', path: '/assets/images/icon-securefirst-shield.png' },
    { key: 'sw-untitled', path: '/assets/images/Untitled-transparent.png' },
    { key: 'sw-wit', path: '/assets/images/icon-wit.png' },
    { key: 'sw-shield', path: '/assets/images/icon-shield.png' },
    { key: 'sw-identity', path: '/assets/images/icon-identity.png' },
    { key: 'sw-securefirst', path: '/assets/images/icon-securefirst.png' },
    { key: 'sw-logo', path: '/assets/images/sonicwall-logo.png' }
  ];

  images.forEach(img => {
    if (!scene.textures.exists(img.key)) {
      scene.load.image(img.key, img.path);
    }
  });
}

export function createGameAssets(scene) {
  const size = 256;

  const createTexture = (key, drawFn) => {
    if (scene.textures.exists(key)) return;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    drawFn(ctx, size);
    scene.textures.addCanvas(key, canvas);
  };

  // 1. Bold, High-Contrast SonicWall Boomerang Emblem for Card Back
  createTexture('sw-card-back-mark', (ctx, s) => {
    const cx = s / 2;
    const cy = s / 2;

    // Glowing cyber circle background
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, s * 0.46);
    grad.addColorStop(0, '#16233f');
    grad.addColorStop(0.7, '#0d1629');
    grad.addColorStop(1, '#070b16');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, s * 0.46, 0, Math.PI * 2);
    ctx.fill();

    // Outer refined cyber ring (sleek & eye-friendly)
    ctx.strokeStyle = '#22385e';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(cx, cy, s * 0.46, 0, Math.PI * 2);
    ctx.stroke();

    // Inner subtle warm accent ring
    ctx.strokeStyle = 'rgba(240, 84, 35, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, s * 0.38, 0, Math.PI * 2);
    ctx.stroke();

    // SonicWall signature boomerang curve (Large, Bold & Vibrant Orange)
    ctx.fillStyle = '#f05423';
    ctx.beginPath();
    ctx.moveTo(cx - 75, cy + 35);
    ctx.quadraticCurveTo(cx - 95, cy - 65, cx + 88, cy - 50);
    ctx.quadraticCurveTo(cx - 20, cy - 15, cx - 12, cy + 70);
    ctx.quadraticCurveTo(cx - 55, cy + 60, cx - 75, cy + 35);
    ctx.closePath();
    ctx.fill();
  });

  // 2. Victory Trophy
  createTexture('icon-trophy', (ctx, s) => {
    const cx = s / 2;
    const cy = s / 2;

    const grad = ctx.createLinearGradient(cx, cy - 70, cx, cy + 70);
    grad.addColorStop(0, '#fef08a');
    grad.addColorStop(0.35, '#facc15');
    grad.addColorStop(0.7, '#eab308');
    grad.addColorStop(1, '#ca8a04');

    // Cup Body
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(cx - 42, cy - 45);
    ctx.lineTo(cx + 42, cy - 45);
    ctx.quadraticCurveTo(cx + 40, cy + 18, cx + 14, cy + 26);
    ctx.lineTo(cx + 12, cy + 46);
    ctx.lineTo(cx + 34, cy + 56);
    ctx.lineTo(cx + 34, cy + 64);
    ctx.lineTo(cx - 34, cy + 64);
    ctx.lineTo(cx - 34, cy + 56);
    ctx.lineTo(cx - 12, cy + 46);
    ctx.lineTo(cx - 14, cy + 26);
    ctx.quadraticCurveTo(cx - 40, cy + 18, cx - 42, cy - 45);
    ctx.closePath();
    ctx.fill();

    // Handles
    ctx.lineWidth = 7;
    ctx.strokeStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(cx - 44, cy - 20, 18, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx + 44, cy - 20, 18, -Math.PI / 2, Math.PI / 2, true);
    ctx.stroke();
  });
}
