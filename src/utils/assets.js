// SonicWall Brand Assets & Visual Utility Library
// Curated for GovWare 2026 In-Booth Engagement

export function preloadGameAssets(scene) {
  const images = [
    { key: 'sw-brand-logo', path: '/assets/images/sonicwall-logo.png' },
    { key: 'sw-swoosh', path: '/assets/images/icon-swoosh-centered.png' },
    { key: 'sw-logo', path: '/assets/images/sonicwall-logo.png' },

    // 18 Threat Vectors
    { key: 'threat-phishing', path: '/assets/images/threats/icon_phishing.png' },
    { key: 'threat-malware', path: '/assets/images/threats/icon_malware.png' },
    { key: 'threat-ransomware', path: '/assets/images/threats/icon_ransomware.png' },
    { key: 'threat-hacking', path: '/assets/images/threats/icon_hacking.png' },
    { key: 'threat-data_breach', path: '/assets/images/threats/icon_data_breach.png' },
    { key: 'threat-cloud_threats', path: '/assets/images/threats/icon_cloud_threats.png' },
    { key: 'threat-vulnerabilities', path: '/assets/images/threats/icon_vulnerabilities.png' },
    { key: 'threat-network_attacks', path: '/assets/images/threats/icon_network_attacks.png' },
    { key: 'threat-zero_day', path: '/assets/images/threats/icon_zero_day.png' },
    { key: 'threat-malicious_files', path: '/assets/images/threats/icon_malicious_files.png' },
    { key: 'threat-insider_threats', path: '/assets/images/threats/icon_insider_threats.png' },
    { key: 'threat-ddos_attacks', path: '/assets/images/threats/icon_ddos_attacks.png' },
    { key: 'threat-malicious_usb', path: '/assets/images/threats/icon_malicious_usb.png' },
    { key: 'threat-social_engineering', path: '/assets/images/threats/icon_social_engineering.png' },
    { key: 'threat-mobile_threats', path: '/assets/images/threats/icon_mobile_threats.png' },
    { key: 'threat-rogue_wifi', path: '/assets/images/threats/icon_rogue_wifi.png' },
    { key: 'threat-misconfigurations', path: '/assets/images/threats/icon_misconfigurations.png' },
    { key: 'threat-unpatched_systems', path: '/assets/images/threats/icon_unpatched_systems.png' }
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
