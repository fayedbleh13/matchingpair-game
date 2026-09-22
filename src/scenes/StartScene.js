import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig.js';
import { sounds } from '../utils/sounds.js';
import { preloadGameAssets, createGameAssets } from '../utils/assets.js';

export class StartScene extends Phaser.Scene {
  constructor() {
    super('StartScene');
  }

  preload() {
    preloadGameAssets(this);
  }

  create() {
    createGameAssets(this);

    this.bgContainer = this.add.container(0, 0);
    this.uiContainer = this.add.container(0, 0);

    this.createCinematicBackground();
    this.renderUI();

    // 1. Attempt immediate playback on scene load
    sounds.playMenuMusic();

    // 2. Universal user gesture unlock fallback if browser blocked immediate autoplay
    const unlockAudio = () => {
      sounds.playMenuMusic();
    };
    this.input.once('pointerdown', unlockAudio);
    ['pointerdown', 'touchstart', 'mousedown', 'keydown', 'click'].forEach(evt => {
      window.addEventListener(evt, unlockAudio, { once: true, passive: true });
    });

    this.scale.on('resize', () => {
      this.createCinematicBackground();
      this.renderUI();
    });
  }

  createCinematicBackground() {
    this.bgContainer.removeAll(true);
    const { width, height } = this.scale;

    this.bg = this.add.graphics();
    this.bg.fillGradientStyle(0x060913, 0x060913, 0x0a1324, 0x0a1324, 1);
    this.bg.fillRect(0, 0, width, height);
    this.bgContainer.add(this.bg);

    // Large ambient aura blooms
    const auraTop = this.add.graphics();
    auraTop.fillStyle(0xf05423, 0.05);
    auraTop.fillCircle(width * 0.25, height * 0.2, Math.min(width, height) * 0.45);
    this.bgContainer.add(auraTop);

    const auraMid = this.add.graphics();
    auraMid.fillStyle(0x00d8f6, 0.045);
    auraMid.fillCircle(width * 0.8, height * 0.55, Math.min(width, height) * 0.5);
    this.bgContainer.add(auraMid);

    // Dynamic glowing cyber particles
    for (let i = 0; i < 30; i++) {
      const p = this.add.graphics();
      const isOrange = i % 2 === 0;
      p.fillStyle(isOrange ? 0xf05423 : 0x00d8f6, 0.2 + Math.random() * 0.4);
      p.fillCircle(0, 0, 2 + Math.random() * 3);
      const px = Math.random() * width;
      const py = Math.random() * height;
      p.setPosition(px, py);
      this.bgContainer.add(p);

      this.tweens.add({
        targets: p,
        alpha: { from: 0.1, to: 0.6 },
        y: py - (30 + Math.random() * 60),
        duration: 3500 + Math.random() * 3000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  renderUI() {
    this.uiContainer.removeAll(true);
    if (document.getElementById('cyber-start-overlay')) {
      return;
    }
    const { width, height } = this.scale;
    const isLandscape = width > height;

    if (isLandscape) {
      this.renderLandscapeUI(width, height);
    } else {
      this.renderPortraitUI(width, height);
    }
  }

  renderLandscapeUI(width, height) {
    // 1. TOP HEADER
    let curY = 32;
    if (this.textures.exists('sw-brand-logo')) {
      const logoW = Math.min(width * 0.26, 320);
      const logoH = logoW * (200 / 1238);
      const logo = this.add.image(width / 2, curY + logoH / 2, 'sw-brand-logo');
      logo.setDisplaySize(logoW, logoH);
      this.uiContainer.add(logo);
      curY += logoH + 12;
    }

    const tag = this.add.text(width / 2, curY, 'GovWare 2026 • OFFICIAL IN-BOOTH CHALLENGE', {
      fontFamily: 'Outfit',
      fontSize: '13px',
      fontWeight: '900',
      color: '#00d8f6',
      letterSpacing: 4
    }).setOrigin(0.5);
    this.uiContainer.add(tag);
    curY += 28;

    const title = this.add.text(width / 2, curY, 'CYBER MEMORY CHALLENGE', {
      fontFamily: 'Outfit',
      fontSize: '34px',
      fontWeight: '900',
      color: '#ffffff',
      letterSpacing: 3
    }).setOrigin(0.5);
    this.uiContainer.add(title);
    curY += 32;

    const sub = this.add.text(width / 2, curY, 'Test your speed & memory. Match cybersecurity pairs to win SonicWall prizes!', {
      fontFamily: 'Outfit',
      fontSize: '15px',
      fontWeight: '600',
      color: '#94a3b8'
    }).setOrigin(0.5);
    this.uiContainer.add(sub);
    curY += 28;

    // 2. TWO-COLUMN MIDDLE SECTION (Prizes on Left, Rules on Right)
    const availableMidH = height - curY - 140;
    const cardH = Math.min(availableMidH, 300);
    const cardW = Math.min(width * 0.44, 480);
    const midY = curY + cardH / 2 + 10;
    const leftX = width / 2 - cardW / 2 - 16;
    const rightX = width / 2 + cardW / 2 + 16;

    // A. Left Card: IN-BOOTH EVENT PRIZES
    const prizeGfx = this.add.graphics();
    prizeGfx.fillStyle(0x091325, 0.94);
    prizeGfx.fillRoundedRect(leftX - cardW / 2, midY - cardH / 2, cardW, cardH, 20);
    prizeGfx.lineStyle(2, 0x1e355b, 1);
    prizeGfx.strokeRoundedRect(leftX - cardW / 2, midY - cardH / 2, cardW, cardH, 20);
    this.uiContainer.add(prizeGfx);

    const prizeHdr = this.add.text(leftX, midY - cardH / 2 + 26, 'IN-BOOTH EVENT PRIZES', {
      fontFamily: 'Outfit',
      fontSize: '16px',
      fontWeight: '900',
      color: '#f05423',
      letterSpacing: 2
    }).setOrigin(0.5);
    this.uiContainer.add(prizeHdr);

    const tiers = [
      {
        badge: 'TOP PRIZE (8 PAIRS)',
        item: 'Laptop Sleeve / Storage Pouch',
        color: '#facc15',
        bgColor: 0x1a1505,
        borderColor: 0xfacc15
      },
      {
        badge: 'TIER 2 (6–7 PAIRS)',
        item: 'Multiheaded Fast Charging Cable',
        color: '#00d8f6',
        bgColor: 0x051a24,
        borderColor: 0x00d8f6
      },
      {
        badge: 'CONSOLATION (<6 PAIRS)',
        item: 'SonicWall Pen & Canvas Tote Bag',
        color: '#94a3b8',
        bgColor: 0x0c1424,
        borderColor: 0x334155
      }
    ];

    const tierRowH = (cardH - 74) / 3;
    tiers.forEach((t, i) => {
      const rY = midY - cardH / 2 + 50 + i * tierRowH + tierRowH / 2;
      const rW = cardW - 32;
      const rH = tierRowH - 8;

      const rGfx = this.add.graphics();
      rGfx.fillStyle(t.bgColor, 0.9);
      rGfx.fillRoundedRect(leftX - rW / 2, rY - rH / 2, rW, rH, 12);
      rGfx.lineStyle(1.5, t.borderColor, 0.8);
      rGfx.strokeRoundedRect(leftX - rW / 2, rY - rH / 2, rW, rH, 12);
      this.uiContainer.add(rGfx);

      const bTxt = this.add.text(leftX - rW / 2 + 16, rY - 10, t.badge, {
        fontFamily: 'Outfit',
        fontSize: '11px',
        fontWeight: '900',
        color: t.color,
        letterSpacing: 1
      }).setOrigin(0, 0.5);

      const iTxt = this.add.text(leftX - rW / 2 + 16, rY + 10, t.item, {
        fontFamily: 'Outfit',
        fontSize: '14px',
        fontWeight: '800',
        color: '#ffffff'
      }).setOrigin(0, 0.5);

      this.uiContainer.add([bTxt, iTxt]);
    });

    // B. Right Card: HOW TO PLAY
    const rulesGfx = this.add.graphics();
    rulesGfx.fillStyle(0x091325, 0.94);
    rulesGfx.fillRoundedRect(rightX - cardW / 2, midY - cardH / 2, cardW, cardH, 20);
    rulesGfx.lineStyle(2, 0x1e355b, 1);
    rulesGfx.strokeRoundedRect(rightX - cardW / 2, midY - cardH / 2, cardW, cardH, 20);
    this.uiContainer.add(rulesGfx);

    const rulesHdr = this.add.text(rightX, midY - cardH / 2 + 26, 'HOW TO PLAY & WIN', {
      fontFamily: 'Outfit',
      fontSize: '16px',
      fontWeight: '900',
      color: '#00d8f6',
      letterSpacing: 2
    }).setOrigin(0.5);
    this.uiContainer.add(rulesHdr);

    const rules = [
      '⏱️  20s Countdown Timer — Fast matching is essential!',
      '🃏  16 Cards (8 Pairs) — Tap to find matching cyber pairs',
      '⚡  +1.5s Time Bonus — Earn extra seconds per match',
      '🔥  Combo Multipliers — Rapid streaks multiply score'
    ];

    const ruleRowH = (cardH - 70) / 4;
    rules.forEach((r, idx) => {
      const rY = midY - cardH / 2 + 56 + idx * ruleRowH + ruleRowH / 2;
      const t = this.add.text(rightX, rY, r, {
        fontFamily: 'Outfit',
        fontSize: '13px',
        fontWeight: '700',
        color: '#e2e8f0',
        align: 'center'
      }).setOrigin(0.5);
      this.uiContainer.add(t);
    });

    // 3. BOTTOM ACTION BUTTONS
    const bottomCenterY = height - 60;
    const playBtnW = Math.min(width * 0.36, 360);
    const playBtnH = 54;

    // Glowing CTA Button
    const playGlow = this.add.graphics();
    playGlow.fillStyle(0xf05423, 0.35);
    playGlow.fillRoundedRect(width / 2 - playBtnW / 2 - 6, bottomCenterY - playBtnH / 2 - 6, playBtnW + 12, playBtnH + 12, 18);

    const playBtn = this.add.graphics();
    playBtn.fillStyle(0xf05423, 1);
    playBtn.fillRoundedRect(width / 2 - playBtnW / 2, bottomCenterY - playBtnH / 2, playBtnW, playBtnH, 14);

    const playText = this.add.text(width / 2, bottomCenterY, 'START CHALLENGE ▶', {
      fontFamily: 'Outfit',
      fontSize: '20px',
      fontWeight: '900',
      color: '#ffffff',
      letterSpacing: 2
    }).setOrigin(0.5);

    const playZone = this.add.zone(width / 2, bottomCenterY, playBtnW, playBtnH).setInteractive({ useHandCursor: true });
    playZone.on('pointerdown', () => {
      sounds.playClick();
      sounds.playGameMusic();
      this.scene.start('GameScene');
    });

    // Sub-buttons: Leaderboard & Settings
    const subBtnW = 160;
    const subBtnH = 42;
    const leadX = width / 2 - playBtnW / 2 - subBtnW / 2 - 20;
    const setX = width / 2 + playBtnW / 2 + subBtnW / 2 + 20;

    const createSmallBtn = (x, y, label, onClick) => {
      const bg = this.add.graphics();
      bg.fillStyle(0x0b1528, 0.9);
      bg.fillRoundedRect(x - subBtnW / 2, y - subBtnH / 2, subBtnW, subBtnH, 10);
      bg.lineStyle(1.5, 0x1e355b, 1);
      bg.strokeRoundedRect(x - subBtnW / 2, y - subBtnH / 2, subBtnW, subBtnH, 10);

      const txt = this.add.text(x, y, label, {
        fontFamily: 'Outfit',
        fontSize: '13px',
        fontWeight: '800',
        color: '#94a3b8',
        letterSpacing: 1
      }).setOrigin(0.5);

      const zone = this.add.zone(x, y, subBtnW, subBtnH).setInteractive({ useHandCursor: true });
      zone.on('pointerdown', () => {
        sounds.playClick();
        onClick();
      });

      this.uiContainer.add([bg, txt, zone]);
    };

    createSmallBtn(leadX, bottomCenterY, '★ LEADERBOARD', () => this.scene.start('LeaderboardScene'));
    createSmallBtn(setX, bottomCenterY, '⚙️ SETTINGS', () => this.scene.start('SettingsScene', { returnTo: 'StartScene' }));

    this.uiContainer.add([playGlow, playBtn, playText, playZone]);
  }

  renderPortraitUI(width, height) {
    const s = Math.max(0.65, Math.min(width / 1080, 2.2));

    const logoW = Math.min(width * 0.72, 480 * s);
    const logoH = logoW * (200 / 1238);
    const prizeW = Math.min(width - 48 * s, 920 * s);
    const prizeH = Math.min(height * 0.28, 420 * s);
    const rulesH = Math.min(height * 0.22, 300 * s);
    const playBtnW = Math.min(width - 64 * s, 880 * s);
    const playBtnH = 74 * s;
    const subH = 50 * s;

    // Distribute extra vertical space gracefully for tall 4K kiosks (e.g. 2160x3840)
    const baseContentH = logoH + 24 * s + 34 * s + 36 * s + prizeH + 20 * s + rulesH + 24 * s + playBtnH + 18 * s + subH + 60 * s;
    const extraSpace = Math.max(0, height - baseContentH);
    const topMargin = 40 * s + extraSpace * 0.2;
    const blockGap = 16 * s + extraSpace * 0.12;

    // 1. Logo & Header
    let curY = topMargin;
    if (this.textures.exists('sw-brand-logo')) {
      const logo = this.add.image(width / 2, curY + logoH / 2, 'sw-brand-logo');
      logo.setDisplaySize(logoW, logoH);
      this.uiContainer.add(logo);
      curY += logoH + 20 * s;
    }

    const tag = this.add.text(width / 2, curY, 'GovWare 2026 • OFFICIAL IN-BOOTH CHALLENGE', {
      fontFamily: 'Outfit',
      fontSize: `${Math.floor(16 * s)}px`,
      fontWeight: '900',
      color: '#00d8f6',
      letterSpacing: 3
    }).setOrigin(0.5);
    this.uiContainer.add(tag);
    curY += 36 * s;

    const title = this.add.text(width / 2, curY, 'CYBER MEMORY CHALLENGE', {
      fontFamily: 'Outfit',
      fontSize: `${Math.floor(38 * s)}px`,
      fontWeight: '900',
      color: '#ffffff',
      letterSpacing: 2
    }).setOrigin(0.5);
    this.uiContainer.add(title);
    curY += 32 * s + blockGap;

    // 2. In-Booth Event Prizes Box
    const prizeBoxY = curY + prizeH / 2;

    const prizeGfx = this.add.graphics();
    prizeGfx.fillStyle(0x091325, 0.94);
    prizeGfx.fillRoundedRect(width / 2 - prizeW / 2, prizeBoxY - prizeH / 2, prizeW, prizeH, 20 * s);
    prizeGfx.lineStyle(2, 0x1e355b, 1);
    prizeGfx.strokeRoundedRect(width / 2 - prizeW / 2, prizeBoxY - prizeH / 2, prizeW, prizeH, 20 * s);
    this.uiContainer.add(prizeGfx);

    const prizeHdr = this.add.text(width / 2, prizeBoxY - prizeH / 2 + 30 * s, 'IN-BOOTH EVENT PRIZES', {
      fontFamily: 'Outfit',
      fontSize: `${Math.floor(20 * s)}px`,
      fontWeight: '900',
      color: '#f05423',
      letterSpacing: 2
    }).setOrigin(0.5);
    this.uiContainer.add(prizeHdr);

    const tiers = [
      { badge: 'TOP PRIZE (8 PAIRS)', item: 'Laptop Sleeve / Storage Pouch', color: '#facc15', bg: 0x1a1505, border: 0xfacc15 },
      { badge: 'TIER 2 (6–7 PAIRS)', item: 'Multiheaded Fast Charging Cable', color: '#00d8f6', bg: 0x051a24, border: 0x00d8f6 },
      { badge: 'CONSOLATION (<6 PAIRS)', item: 'SonicWall Pen & Canvas Tote Bag', color: '#94a3b8', bg: 0x0c1424, border: 0x334155 }
    ];

    const rowH = (prizeH - 80 * s) / 3;
    tiers.forEach((t, i) => {
      const rY = prizeBoxY - prizeH / 2 + 58 * s + i * rowH + rowH / 2;
      const rW = prizeW - 32 * s;
      const rGfx = this.add.graphics();
      rGfx.fillStyle(t.bg, 0.9);
      rGfx.fillRoundedRect(width / 2 - rW / 2, rY - (rowH - 8 * s) / 2, rW, rowH - 8 * s, 12 * s);
      rGfx.lineStyle(1.5, t.border, 0.8);
      rGfx.strokeRoundedRect(width / 2 - rW / 2, rY - (rowH - 8 * s) / 2, rW, rowH - 8 * s, 12 * s);
      this.uiContainer.add(rGfx);

      const bTxt = this.add.text(width / 2 - rW / 2 + 18 * s, rY - 11 * s, t.badge, {
        fontFamily: 'Outfit',
        fontSize: `${Math.floor(13 * s)}px`,
        fontWeight: '900',
        color: t.color
      }).setOrigin(0, 0.5);

      const iTxt = this.add.text(width / 2 - rW / 2 + 18 * s, rY + 11 * s, t.item, {
        fontFamily: 'Outfit',
        fontSize: `${Math.floor(16 * s)}px`,
        fontWeight: '800',
        color: '#ffffff'
      }).setOrigin(0, 0.5);

      this.uiContainer.add([bTxt, iTxt]);
    });

    curY = prizeBoxY + prizeH / 2 + blockGap;

    // 3. Rules Box
    const rulesBoxY = curY + rulesH / 2;

    const rulesGfx = this.add.graphics();
    rulesGfx.fillStyle(0x091325, 0.94);
    rulesGfx.fillRoundedRect(width / 2 - prizeW / 2, rulesBoxY - rulesH / 2, prizeW, rulesH, 20 * s);
    rulesGfx.lineStyle(2, 0x1e355b, 1);
    rulesGfx.strokeRoundedRect(width / 2 - prizeW / 2, rulesBoxY - rulesH / 2, prizeW, rulesH, 20 * s);
    this.uiContainer.add(rulesGfx);

    const rulesHdr = this.add.text(width / 2, rulesBoxY - rulesH / 2 + 28 * s, 'HOW TO PLAY', {
      fontFamily: 'Outfit',
      fontSize: `${Math.floor(19 * s)}px`,
      fontWeight: '900',
      color: '#00d8f6',
      letterSpacing: 2
    }).setOrigin(0.5);
    this.uiContainer.add(rulesHdr);

    const rules = [
      '⏱️  20 Seconds Base Timer — Fast matching is essential!',
      '🃏  16 Cards (8 Pairs) — Tap to find matching cyber icons',
      '⚡  +1.5s Time Bonus — Extra seconds per correct match',
      '🔥  Combo Multipliers — Rapid streaks multiply your score'
    ];

    const rRowH = (rulesH - 64 * s) / 4;
    rules.forEach((r, idx) => {
      const rY = rulesBoxY - rulesH / 2 + 52 * s + idx * rRowH + rRowH / 2;
      const t = this.add.text(width / 2, rY, r, {
        fontFamily: 'Outfit',
        fontSize: `${Math.floor(15 * s)}px`,
        fontWeight: '700',
        color: '#e2e8f0',
        align: 'center'
      }).setOrigin(0.5);
      this.uiContainer.add(t);
    });

    curY = rulesBoxY + rulesH / 2 + blockGap;

    // 4. Start Challenge Button
    const playBtnY = curY + playBtnH / 2;

    const playGlow = this.add.graphics();
    playGlow.fillStyle(0xf05423, 0.25);
    playGlow.fillRoundedRect(width / 2 - playBtnW / 2 - 8 * s, playBtnY - playBtnH / 2 - 8 * s, playBtnW + 16 * s, playBtnH + 16 * s, 22 * s);

    const playBtn = this.add.graphics();
    playBtn.fillStyle(0xf05423, 1);
    playBtn.fillRoundedRect(width / 2 - playBtnW / 2, playBtnY - playBtnH / 2, playBtnW, playBtnH, 18 * s);

    const playText = this.add.text(width / 2, playBtnY, 'START CHALLENGE ▶', {
      fontFamily: 'Outfit',
      fontSize: `${Math.floor(24 * s)}px`,
      fontWeight: '900',
      color: '#ffffff',
      letterSpacing: 2
    }).setOrigin(0.5);

    const playZone = this.add.zone(width / 2, playBtnY, playBtnW, playBtnH).setInteractive({ useHandCursor: true });
    playZone.on('pointerdown', () => {
      sounds.playClick();
      sounds.playGameMusic();
      this.scene.start('GameScene');
    });

    this.uiContainer.add([playGlow, playBtn, playText, playZone]);
    curY = playBtnY + playBtnH / 2 + 16 * s;

    // 5. Sub Buttons (LEADERBOARD & SETTINGS)
    const subY = curY + subH / 2;
    const subW = (playBtnW - 16 * s) / 2;

    const createSmallBtn = (x, label, onClick) => {
      const bg = this.add.graphics();
      bg.fillStyle(0x0b1528, 0.9);
      bg.fillRoundedRect(x - subW / 2, subY - subH / 2, subW, subH, 12 * s);
      bg.lineStyle(1.5, 0x1e355b, 1);
      bg.strokeRoundedRect(x - subW / 2, subY - subH / 2, subW, subH, 12 * s);

      const txt = this.add.text(x, subY, label, {
        fontFamily: 'Outfit',
        fontSize: `${Math.floor(15 * s)}px`,
        fontWeight: '800',
        color: '#cbd5e1'
      }).setOrigin(0.5);

      const zone = this.add.zone(x, subY, subW, subH).setInteractive({ useHandCursor: true });
      zone.on('pointerdown', () => {
        sounds.playClick();
        onClick();
      });

      this.uiContainer.add([bg, txt, zone]);
    };

    createSmallBtn(width / 2 - subW / 2 - 8 * s, '★ LEADERBOARD', () => this.scene.start('LeaderboardScene'));
    createSmallBtn(width / 2 + subW / 2 + 8 * s, '⚙️ SETTINGS', () => this.scene.start('SettingsScene', { returnTo: 'StartScene' }));

    // Optional Bottom Totem Kiosk Badge if there is extra space
    if (height - (subY + subH / 2) > 60 * s) {
      const footer = this.add.text(width / 2, height - 30 * s, 'SonicWall • GovWare 2026 Interactive Totem Kiosk', {
        fontFamily: 'Outfit',
        fontSize: `${Math.floor(13 * s)}px`,
        fontWeight: '700',
        color: '#475569',
        letterSpacing: 1.5
      }).setOrigin(0.5);
      this.uiContainer.add(footer);
    }
  }
}
