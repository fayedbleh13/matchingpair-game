import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig.js';
import { Card } from '../objects/Card.js';
import { sounds } from '../utils/sounds.js';
import { preloadGameAssets, createGameAssets } from '../utils/assets.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  preload() {
    preloadGameAssets(this);
  }

  create() {
    createGameAssets(this);

    this.cards = [];
    this.selectedCards = [];
    this.pendingMismatch = null;
    this.mismatchTimer = null;

    // Progressive scale-based tracking
    this.currentRound = 1;
    this.totalPairsMatched = 0;
    this.matchedInRound = 0;
    this.totalPairsPerRound = 8; // 8 pairs = 16 cards (4x4 grid)
    this.moves = 0;
    this.comboStreak = 0;
    this.totalScore = 0;

    this.calculateRoundDuration();

    this.isGameOver = false;
    this.canClick = true;
    this.isPaused = false;

    // Start game / combat track (The_Final_Combo.mp3)
    sounds.playGameMusic();

    // Containers for responsive layout
    this.bgContainer = this.add.container(0, 0);
    this.hudContainer = this.add.container(0, 0);
    this.gridContainer = this.add.container(0, 0);

    this.createBackground();
    this.createHUD();
    this.startRound(false);

    // Handle resume from settings
    this.events.on('resume', () => {
      this.isPaused = false;
    });

    // Handle window resize dynamically
    this.scale.on('resize', this.handleResize, this);
  }

  calculateRoundDuration() {
    const { baseDuration, minDuration, timeReductionPerRound } = GAME_CONFIG.progression;
    const duration = Math.max(minDuration, baseDuration - (this.currentRound - 1) * timeReductionPerRound);
    this.timeLeft = duration;
    this.initialDuration = duration;
  }

  createBackground() {
    this.bgContainer.removeAll(true);
    const { width, height } = this.scale;

    this.bg = this.add.graphics();
    this.bg.fillGradientStyle(0x060913, 0x060913, 0x0a1324, 0x0a1324, 1);
    this.bg.fillRect(0, 0, width, height);
    this.bgContainer.add(this.bg);

    // Soft cyber ambient glows
    const gTop = this.add.graphics();
    gTop.fillStyle(0xf05423, 0.05);
    gTop.fillCircle(width * 0.25, height * 0.22, Math.min(width, height) * 0.4);
    this.bgContainer.add(gTop);

    const gMid = this.add.graphics();
    gMid.fillStyle(0x00d8f6, 0.045);
    gMid.fillCircle(width * 0.8, height * 0.6, Math.min(width, height) * 0.45);
    this.bgContainer.add(gMid);

    // Ambient floating particles
    for (let i = 0; i < 28; i++) {
      const star = this.add.graphics();
      const isOrange = i % 3 === 0;
      star.fillStyle(isOrange ? 0xf05423 : 0x00d8f6, 0.15 + Math.random() * 0.35);
      star.fillCircle(0, 0, 2 + Math.random() * 3);
      const startX = Math.random() * width;
      const startY = Math.random() * height;
      star.setPosition(startX, startY);
      this.bgContainer.add(star);

      this.tweens.add({
        targets: star,
        alpha: { from: 0.1, to: 0.5 },
        y: startY - (30 + Math.random() * 60),
        duration: 3000 + Math.random() * 2500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  // ============================================================
  // RESPONSIVE HUD (Landscape Desktop Left Panel vs Portrait Top HUD)
  // ============================================================
  createHUD() {
    this.hudContainer.removeAll(true);
    const { width, height } = this.scale;
    const isLandscape = width > height;

    if (isLandscape) {
      this.createLandscapeHUD(width, height);
    } else {
      this.createPortraitHUD(width, height);
    }
  }

  createLandscapeHUD(width, height) {
    const panelW = Math.max(340, Math.min(Math.floor(width * 0.28), 440));
    const panelH = height;

    // Left Panel Dark Cyber Card
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x070c18, 0.98);
    panelBg.fillRect(0, 0, panelW, panelH);
    panelBg.lineStyle(2, 0x1e355b, 0.9);
    panelBg.lineBetween(panelW, 0, panelW, panelH);
    this.hudContainer.add(panelBg);

    // Top Brand Logo
    let curY = 36;
    if (this.textures.exists('sw-brand-logo')) {
      const logoW = Math.min(panelW - 60, 280);
      const logoH = logoW * (200 / 1238);
      const logo = this.add.image(panelW / 2, curY + logoH / 2, 'sw-brand-logo');
      logo.setDisplaySize(logoW, logoH);
      this.hudContainer.add(logo);
      curY += logoH + 16;
    }

    // GovWare Tagline
    const tagText = this.add.text(panelW / 2, curY, 'GovWare 2026 • CYBER CHALLENGE', {
      fontFamily: 'Outfit',
      fontSize: '13px',
      fontWeight: '900',
      color: '#00d8f6',
      letterSpacing: 2
    }).setOrigin(0.5);
    this.hudContainer.add(tagText);
    curY += 34;

    // Digital Countdown Clock Card
    const timerCardW = panelW - 36;
    const timerCardH = 110;
    const timerCardX = panelW / 2;
    const timerCardY = curY + timerCardH / 2;

    const timerBox = this.add.graphics();
    timerBox.fillStyle(0x0b1528, 0.9);
    timerBox.fillRoundedRect(timerCardX - timerCardW / 2, timerCardY - timerCardH / 2, timerCardW, timerCardH, 16);
    timerBox.lineStyle(2, 0x00d8f6, 0.8);
    timerBox.strokeRoundedRect(timerCardX - timerCardW / 2, timerCardY - timerCardH / 2, timerCardW, timerCardH, 16);
    this.hudContainer.add(timerBox);

    this.timerText = this.add.text(timerCardX, timerCardY - 14, `${Math.ceil(this.timeLeft)}s`, {
      fontFamily: 'Outfit',
      fontSize: '44px',
      fontWeight: '900',
      color: '#00d8f6',
      letterSpacing: 2
    }).setOrigin(0.5);
    this.hudContainer.add(this.timerText);

    // Neon Countdown Progress Bar inside timer card
    this.timerBar = this.add.graphics();
    this.hudContainer.add(this.timerBar);
    this.timerBarBounds = {
      x: timerCardX - timerCardW / 2 + 18,
      y: timerCardY + 28,
      w: timerCardW - 36,
      h: 12
    };
    this.drawTimerBar();

    curY += timerCardH + 20;

    // Stats Grid (2 rows x 2 columns)
    const statW = (panelW - 46) / 2;
    const statH = 68;

    const createStatPill = (x, y, label, textRef, color, initialVal) => {
      const box = this.add.graphics();
      box.fillStyle(0x091222, 0.95);
      box.fillRoundedRect(x, y, statW, statH, 12);
      box.lineStyle(1.5, 0x1e355b, 0.8);
      box.strokeRoundedRect(x, y, statW, statH, 12);

      const lbl = this.add.text(x + statW / 2, y + 18, label, {
        fontFamily: 'Outfit',
        fontSize: '11px',
        fontWeight: '800',
        color: '#94a3b8',
        letterSpacing: 1.5
      }).setOrigin(0.5);

      const val = this.add.text(x + statW / 2, y + 44, initialVal, {
        fontFamily: 'Outfit',
        fontSize: '18px',
        fontWeight: '900',
        color: color,
        letterSpacing: 1
      }).setOrigin(0.5);

      this.hudContainer.add([box, lbl, val]);
      return val;
    };

    const sX1 = 18;
    const sX2 = 18 + statW + 10;
    const sY1 = curY;
    const sY2 = curY + statH + 10;

    this.stageBadge = createStatPill(sX1, sY1, 'STAGE', 'stageBadge', '#f05423', `STAGE ${this.currentRound}`);
    this.movesText = createStatPill(sX2, sY1, 'MOVES', 'movesText', '#ffffff', `${this.moves}`);
    this.pairsText = createStatPill(sX1, sY2, 'PAIRS', 'pairsText', '#00d8f6', `${this.matchedInRound}/${this.totalPairsPerRound}`);
    this.scoreText = createStatPill(sX2, sY2, 'SCORE', 'scoreText', '#facc15', `${this.totalScore}`);

    curY = sY2 + statH + 20;

    // Live Prize Milestone Pill
    const prizePillW = panelW - 36;
    const prizePillH = 92;
    const prizePillX = panelW / 2;
    const prizePillY = curY + prizePillH / 2;

    const prizeBoxGfx = this.add.graphics();
    prizeBoxGfx.fillStyle(0x060c18, 0.95);
    prizeBoxGfx.fillRoundedRect(prizePillX - prizePillW / 2, prizePillY - prizePillH / 2, prizePillW, prizePillH, 14);
    prizeBoxGfx.lineStyle(2, 0xfacc15, 0.85);
    prizeBoxGfx.strokeRoundedRect(prizePillX - prizePillW / 2, prizePillY - prizePillH / 2, prizePillW, prizePillH, 14);
    this.hudContainer.add(prizeBoxGfx);

    const prizeHdr = this.add.text(prizePillX, prizePillY - 22, 'IN-BOOTH PRIZE MILESTONE', {
      fontFamily: 'Outfit',
      fontSize: '11px',
      fontWeight: '900',
      color: '#facc15',
      letterSpacing: 1.5
    }).setOrigin(0.5);

    this.prizeStatusText = this.add.text(prizePillX, prizePillY + 12, '8 Pairs: Laptop Sleeve ★', {
      fontFamily: 'Outfit',
      fontSize: '14px',
      fontWeight: '900',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    this.hudContainer.add([prizeHdr, this.prizeStatusText]);
    this.updatePrizeBadge();

    // Action Buttons at Bottom of Left Panel
    const btnW = panelW - 44;
    const btnH = 46;
    const restartY = height - 110;
    const menuY = height - 52;

    const createBtn = (y, label, bgColor, textColor, onClick) => {
      const bg = this.add.graphics();
      bg.fillStyle(bgColor, 1);
      bg.fillRoundedRect(panelW / 2 - btnW / 2, y - btnH / 2, btnW, btnH, 12);

      const txt = this.add.text(panelW / 2, y, label, {
        fontFamily: 'Outfit',
        fontSize: '16px',
        fontWeight: '900',
        color: textColor,
        letterSpacing: 2
      }).setOrigin(0.5);

      const zone = this.add.zone(panelW / 2, y, btnW, btnH).setInteractive({ useHandCursor: true });
      zone.on('pointerdown', () => {
        sounds.playClick();
        onClick();
      });

      this.hudContainer.add([bg, txt, zone]);
    };

    createBtn(restartY, 'RESTART GAME', 0xf05423, '#ffffff', () => this.restartGame());
    createBtn(menuY, 'EXIT TO MENU', 0x0f172a, '#cbd5e1', () => this.returnToMenu());
  }

  createPortraitHUD(width, height) {
    const s = Math.max(0.65, Math.min(width / 1080, 2.2));
    const hudH = Math.min(height * 0.20, 390 * s);

    const topBar = this.add.graphics();
    topBar.fillStyle(0x060913, 0.95);
    topBar.fillRect(0, 0, width, hudH);
    topBar.lineStyle(2, 0x1e355b, 0.8);
    topBar.lineBetween(0, hudH, width, hudH);
    this.hudContainer.add(topBar);

    // Row 1 Y position (Vertically balanced at top)
    const row1Y = hudH * 0.18;

    // 1. SonicWall Brand Logo (Top Left)
    if (this.textures.exists('sw-brand-logo')) {
      const tex = this.textures.get('sw-brand-logo').getSourceImage();
      const origW = (tex && tex.width) ? tex.width : 3231;
      const origH = (tex && tex.height) ? tex.height : 871;
      const aspect = origH / origW;
      const logoW = Math.min(width * 0.32, 280 * s);
      const logoH = logoW * aspect;
      const logo = this.add.image(logoW / 2 + 12 * s, row1Y, 'sw-brand-logo');
      logo.setDisplaySize(logoW, logoH);
      this.hudContainer.add(logo);
    }

    // Right Action Buttons: RESTART & MENU (Sleek, right-anchored to never overlap center circle)
    const btnH = Math.max(30, Math.min(42 * s, 46));
    const menuBtnW = Math.max(54, Math.min(80 * s, 96));
    const restartBtnW = Math.max(76, Math.min(108 * s, 132));

    const menuX = width - 12 * s - menuBtnW / 2;
    const restartX = menuX - menuBtnW / 2 - 8 * s - restartBtnW / 2;

    const restartBg = this.add.graphics();
    restartBg.fillStyle(0xf05423, 1);
    restartBg.fillRoundedRect(restartX - restartBtnW / 2, row1Y - btnH / 2, restartBtnW, btnH, 10 * s);
    const restartText = this.add.text(restartX, row1Y, 'RESTART', {
      fontFamily: 'Outfit',
      fontSize: `${Math.max(11, Math.floor(14 * s))}px`,
      fontWeight: '900',
      color: '#ffffff',
      letterSpacing: 1
    }).setOrigin(0.5);

    const restartZone = this.add.zone(restartX, row1Y, restartBtnW, btnH).setInteractive({ useHandCursor: true });
    restartZone.on('pointerdown', () => {
      sounds.playClick();
      this.restartGame();
    });

    const menuBg = this.add.graphics();
    menuBg.fillStyle(0x091325, 1);
    menuBg.fillRoundedRect(menuX - menuBtnW / 2, row1Y - btnH / 2, menuBtnW, btnH, 10 * s);
    menuBg.lineStyle(1.5, 0x1e355b, 1);
    menuBg.strokeRoundedRect(menuX - menuBtnW / 2, row1Y - btnH / 2, menuBtnW, btnH, 10 * s);

    const menuText = this.add.text(menuX, row1Y, 'MENU', {
      fontFamily: 'Outfit',
      fontSize: `${Math.max(11, Math.floor(14 * s))}px`,
      fontWeight: '900',
      color: '#cbd5e1',
      letterSpacing: 1
    }).setOrigin(0.5);

    const menuZone = this.add.zone(menuX, row1Y, menuBtnW, btnH).setInteractive({ useHandCursor: true });
    menuZone.on('pointerdown', () => {
      sounds.playClick();
      this.returnToMenu();
    });

    this.hudContainer.add([restartBg, restartText, restartZone, menuBg, menuText, menuZone]);

    // Row 2: Centered Large Circular Timer Dial (Guaranteed clearance from buttons)
    const timeCircleY = hudH * 0.53;
    const timeCircleX = width / 2;
    const circleR = Math.min(hudH * 0.20, Math.max(30, 44 * s));

    this.timerCircleGraphics = this.add.graphics();
    this.hudContainer.add(this.timerCircleGraphics);
    this.timerCircleBounds = { x: timeCircleX, y: timeCircleY, radius: circleR, s };

    const timerFontSize = Math.max(22, Math.floor(32 * s));
    this.timerText = this.add.text(timeCircleX, timeCircleY, `${Math.ceil(this.timeLeft)}s`, {
      fontFamily: 'Outfit',
      fontSize: `${timerFontSize}px`,
      fontWeight: '900',
      color: '#00d8f6',
      letterSpacing: 1.5
    }).setOrigin(0.5);
    this.hudContainer.add(this.timerText);

    // Row 3: Stats Row (MOVES and PAIRS - Centered and balanced)
    const statY = hudH * 0.82;
    this.movesText = this.add.text(width * 0.28, statY, `MOVES ${this.moves}`, {
      fontFamily: 'Outfit',
      fontSize: `${Math.max(13, Math.floor(17 * s))}px`,
      fontWeight: '800',
      color: '#ffffff',
      letterSpacing: 1.5
    }).setOrigin(0.5);

    this.pairsText = this.add.text(width * 0.72, statY, `PAIRS ${this.matchedInRound}/${this.totalPairsPerRound}`, {
      fontFamily: 'Outfit',
      fontSize: `${Math.max(13, Math.floor(17 * s))}px`,
      fontWeight: '900',
      color: '#00d8f6',
      letterSpacing: 1.5
    }).setOrigin(0.5);

    this.hudContainer.add([this.movesText, this.pairsText]);

    // Row 4: Neon Countdown Bar - Positioned just below, right near the cards
    const barW = width - 36 * s;
    const barH = 10 * s;
    const barX = width / 2 - barW / 2;
    const barY = hudH - 12 * s;

    this.timerBar = this.add.graphics();
    this.hudContainer.add(this.timerBar);
    this.timerBarBounds = { x: barX, y: barY, w: barW, h: barH };

    this.drawTimerBar();
    this.drawTimerCircle();
  }

  drawTimerBar() {
    if (!this.timerBar || !this.timerBarBounds) return;
    this.timerBar.clear();

    const { x, y, w, h } = this.timerBarBounds;
    const r = h / 2;

    // Track background
    this.timerBar.fillStyle(0x13233f, 0.9);
    this.timerBar.fillRoundedRect(x, y, w, h, r);

    // Fill progress
    const pct = Math.max(0, Math.min(1, this.timeLeft / (this.initialDuration || 20)));
    const fillW = Math.max(0, w * pct);

    if (fillW > 0) {
      let color = 0x00d8f6;
      if (pct < 0.28) {
        color = 0xef4444; // Red
      } else if (pct < 0.50) {
        color = 0xf05423; // Sonic Orange
      }

      this.timerBar.fillStyle(color, 1);
      this.timerBar.fillRoundedRect(x, y, fillW, h, r);
    }
  }

  drawTimerCircle() {
    if (!this.timerCircleGraphics || !this.timerCircleBounds) return;
    this.timerCircleGraphics.clear();

    const { x, y, radius, s } = this.timerCircleBounds;
    const pct = Math.max(0, Math.min(1, this.timeLeft / (this.initialDuration || 20)));

    let color = 0x00d8f6;
    if (pct < 0.28) {
      color = 0xef4444; // Red
    } else if (pct < 0.50) {
      color = 0xf05423; // Sonic Orange
    }

    // Outer subtle ambient glow
    this.timerCircleGraphics.lineStyle(6 * s, color, 0.2);
    this.timerCircleGraphics.strokeCircle(x, y, radius + 2 * s);

    // Dark high-tech container background
    this.timerCircleGraphics.fillStyle(0x071120, 0.96);
    this.timerCircleGraphics.fillCircle(x, y, radius);

    // Track background ring
    this.timerCircleGraphics.lineStyle(4 * s, 0x13233f, 0.9);
    this.timerCircleGraphics.strokeCircle(x, y, radius);

    // Animated countdown progress arc
    if (pct > 0) {
      this.timerCircleGraphics.lineStyle(4.5 * s, color, 1);
      this.timerCircleGraphics.beginPath();
      this.timerCircleGraphics.arc(x, y, radius, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * pct, false);
      this.timerCircleGraphics.strokePath();
    }

    // Inner subtle tech ring
    this.timerCircleGraphics.lineStyle(1, 0x00d8f6, 0.25);
    this.timerCircleGraphics.strokeCircle(x, y, radius - 6 * s);
  }

  updatePrizeBadge() {
    if (!this.prizeStatusText) return;
    const pairs = this.totalPairsMatched;
    if (pairs >= 8) {
      this.prizeStatusText.setText('★ TOP PRIZE UNLOCKED!\nStorage Pouch / Laptop Sleeve');
      this.prizeStatusText.setColor('#facc15');
    } else if (pairs >= 6) {
      this.prizeStatusText.setText(`⚡ TIER 2 UNLOCKED!\nFast Charging Cable (8 for Top Prize)`);
      this.prizeStatusText.setColor('#00d8f6');
    } else {
      this.prizeStatusText.setText(`${pairs}/8 Pairs Matched\n(6 for Tier 2 • 8 for Top Prize)`);
      this.prizeStatusText.setColor('#ffffff');
    }
  }

  // ============================================================
  // 4x4 CARD GRID LAYOUT (Responsive & Pixel-Perfect on Any Screen)
  // ============================================================
  startRound(fastDeal = false) {
    this.cards.forEach(card => card.destroy());
    this.cards = [];
    this.selectedCards = [];
    this.pendingMismatch = null;
    this.matchedInRound = 0;

    this.calculateRoundDuration();
    if (this.stageBadge) this.stageBadge.setText(`STAGE ${this.currentRound}`);
    if (this.pairsText) this.pairsText.setText(`PAIRS 0/${this.totalPairsPerRound}`);
    if (this.timerText) {
      this.timerText.setText(`${Math.ceil(this.timeLeft)}s`);
      this.timerText.setColor('#00d8f6');
    }
    this.drawTimerBar();
    this.drawTimerCircle();

    // Select 8 SonicWall cybersecurity cards (8 pairs = 16 cards)
    const allItems = [...GAME_CONFIG.cardItems];
    Phaser.Utils.Array.Shuffle(allItems);
    const chosenItems = allItems.slice(0, 8);

    // Duplicate for pairs
    const deck = [...chosenItems, ...chosenItems];
    Phaser.Utils.Array.Shuffle(deck);

    this.deckData = deck;
    this.layoutCards();

    // Make immediately interactable and start countdown timer
    this.canClick = true;
    this.startTimer();
    this.dealCards(fastDeal);
  }

  layoutCards() {
    if (!this.deckData) return;
    const { width, height } = this.scale;
    const isLandscape = width > height;

    let availableX = 0;
    let availableY = 0;
    let availableW = width;
    let availableH = height;

    if (isLandscape) {
      const panelW = Math.max(340, Math.min(Math.floor(width * 0.28), 440));
      availableX = panelW + 24;
      availableY = 24;
      availableW = width - panelW - 48;
      availableH = height - 48;
    } else {
      const s = Math.max(0.65, Math.min(width / 1080, 2.2));
      const hudH = Math.min(height * 0.20, 390 * s);
      availableX = 20;
      availableY = hudH + 16;
      availableW = width - 40;
      availableH = height - hudH - 36;
    }

    const cols = 4;
    const rows = 4;
    const gapX = Math.max(8, Math.min(availableW * 0.02, 36));
    const gapY = Math.max(8, Math.min(availableH * 0.02, 36));

    // Calculate maximum card size respecting aspect ratio ~460 / 680
    const cardAspect = 460 / 680;
    let cardH = (availableH - (rows - 1) * gapY) / rows;
    let cardW = cardH * cardAspect;

    if (cols * cardW + (cols - 1) * gapX > availableW) {
      cardW = (availableW - (cols - 1) * gapX) / cols;
      cardH = cardW / cardAspect;
    }

    const gridTotalW = cols * cardW + (cols - 1) * gapX;
    const gridTotalH = rows * cardH + (rows - 1) * gapY;
    const startX = availableX + (availableW - gridTotalW) / 2 + cardW / 2;
    const startY = availableY + (availableH - gridTotalH) / 2 + cardH / 2;

    if (this.cards.length === 0) {
      // Create cards
      this.deckData.forEach((item, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        const targetX = startX + col * (cardW + gapX);
        const targetY = startY + row * (cardH + gapY);

        const card = new Card(this, targetX, targetY, item, cardW, cardH, (c) => this.handleCardClick(c));
        this.cards.push(card);
      });
    } else {
      // Reposition cards on resize
      this.cards.forEach((card, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        const targetX = startX + col * (cardW + gapX);
        const targetY = startY + row * (cardH + gapY);

        card.setPosition(targetX, targetY);
        card.resize(cardW, cardH);
      });
    }
  }

  handleResize() {
    this.createBackground();
    this.createHUD();
    this.layoutCards();
  }

  dealCards(fastDeal = false) {
    this.cards.forEach((card, index) => {
      card.setAlpha(1);
      card.setScale(1);
      this.time.delayedCall(index * (fastDeal ? 8 : 15), () => {
        sounds.playDeal(index);
      });
    });
  }

  startTimer() {
    if (this.timerEvent) {
      this.timerEvent.remove();
    }
    this.timerEvent = this.time.addEvent({
      delay: 100,
      callback: this.tickTimer,
      callbackScope: this,
      loop: true
    });
  }

  tickTimer() {
    if (this.isGameOver || this.isPaused) return;

    this.timeLeft = Math.max(0, this.timeLeft - 0.1);
    const displaySeconds = Math.ceil(this.timeLeft);

    if (this.timerText) {
      this.timerText.setText(`${displaySeconds}s`);
      if (this.timeLeft <= 5.0 && this.timeLeft > 0) {
        this.timerText.setColor('#ef4444');
      } else {
        this.timerText.setColor('#00d8f6');
      }
    }
    this.drawTimerBar();
    this.drawTimerCircle();

    if (this.timeLeft <= 0) {
      if (this.timerEvent) this.timerEvent.remove();
      this.handleGameOver();
    }
  }

  // ============================================================
  // ULTRA-FAST, TACTILE SPEED-MATCHING GAMEPLAY
  // ============================================================
  handleCardClick(card) {
    if (!this.canClick || this.isGameOver || this.isPaused || !card || card.isMatched) return;

    // 1. RAPID-TAPPING OVERRIDE:
    // If player taps a card while a previous mismatch was pending or showing,
    // IMMEDIATELY snap mismatched cards back face-down, cancel timer, and process this tap!
    if (this.pendingMismatch) {
      if (this.mismatchTimer) {
        this.mismatchTimer.remove();
        this.mismatchTimer = null;
      }
      this.pendingMismatch.forEach(c => {
        if (c && !c.isMatched) c.flip(false, true); // Instant snap down
      });
      this.pendingMismatch = null;
    }

    // 2. Ignore click if card is already open in current selection
    if (this.selectedCards.includes(card)) return;

    // 3. Safety check: if somehow 2 cards are already selected, clear them
    if (this.selectedCards.length >= 2) {
      this.selectedCards.forEach(c => {
        if (c && !c.isMatched) c.flip(false, true);
      });
      this.selectedCards = [];
    }

    // 4. Select and flip this card
    this.selectedCards.push(card);
    card.flip(true);

    // 5. When second card is selected, evaluate match SYNCHRONOUSLY!
    if (this.selectedCards.length === 2) {
      const [card1, card2] = this.selectedCards;
      this.moves++;
      if (this.movesText) {
        this.movesText.setText(this.scale.width > this.scale.height ? `${this.moves}` : `MOVES ${this.moves}`);
      }

      if (card1.cardData.id === card2.cardData.id) {
        // MATCH!
        sounds.playMatch();
        card1.setMatched();
        card2.setMatched();

        this.comboStreak++;
        this.maxStreak = Math.max(this.maxStreak || 0, this.comboStreak);

        // Sparkle burst
        this.createMatchSparkles(card1.x, card1.y);
        this.createMatchSparkles(card2.x, card2.y);

        // Floating Match Feedback
        const midX = (card1.x + card2.x) / 2;
        const midY = (card1.y + card2.y) / 2;
        this.showFloatingPoints(midX, midY, 'MATCH!');

        this.matchedInRound++;
        this.totalPairsMatched++;
        if (this.pairsText) {
          this.pairsText.setText(`PAIRS ${this.matchedInRound}/${this.totalPairsPerRound}`);
        }

        this.updatePrizeBadge();

        // CRITICAL: CLEAR SELECTION IMMEDIATELY SO PLAYER CAN TAP NEXT PAIR WITH ZERO DELAY!
        this.selectedCards = [];

        if (this.matchedInRound === this.totalPairsPerRound) {
          this.handleStageCleared();
        }
      } else {
        // MISMATCH!
        sounds.playMismatch();
        this.comboStreak = 0;
        const mismatchPair = [card1, card2];
        this.pendingMismatch = mismatchPair;
        this.selectedCards = []; // Hand off to pendingMismatch; new taps can immediately form the next pair

        // Balanced auto-flip timeout (450ms), giving clear visual feedback while maintaining snappy pace
        this.mismatchTimer = this.time.delayedCall(450, () => {
          if (this.pendingMismatch === mismatchPair) {
            card1.shakeMismatch(() => {
              card1.flip(false);
            });
            card2.shakeMismatch(() => {
              card2.flip(false);
            });
            this.pendingMismatch = null;
          }
        });
      }
    }
  }

  createMatchSparkles(x, y) {
    const colors = [0xf05423, 0x00d8f6, 0x10b981, 0xffffff];
    for (let i = 0; i < 18; i++) {
      const p = this.add.graphics();
      const color = colors[Math.floor(Math.random() * colors.length)];
      p.fillStyle(color, 1);
      p.fillCircle(0, 0, 4 + Math.random() * 4);
      p.setPosition(x, y);

      const angle = Math.random() * Math.PI * 2;
      const dist = 40 + Math.random() * 70;

      this.tweens.add({
        targets: p,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        alpha: 0,
        scaleX: 0.2,
        scaleY: 0.2,
        duration: 350 + Math.random() * 150,
        ease: 'Quad.easeOut',
        onComplete: () => p.destroy()
      });
    }
  }

  showFloatingPoints(x, y, text) {
    const txt = this.add.text(x, y, text, {
      fontFamily: 'Outfit',
      fontSize: '28px',
      fontWeight: '900',
      color: '#facc15'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: txt,
      y: y - 60,
      scaleX: 1.2,
      scaleY: 1.2,
      alpha: 0,
      duration: 650,
      ease: 'Back.easeOut',
      onComplete: () => txt.destroy()
    });
  }

  handleStageCleared() {
    this.canClick = false;
    if (this.timerEvent) this.timerEvent.remove();
    sounds.playWin();

    const timeTaken = Math.max(1, 20 - Math.round(this.timeLeft));
    const resultData = {
      pairsMatched: this.totalPairsMatched,
      moves: this.moves,
      timeLeft: Math.round(this.timeLeft),
      timeTaken: timeTaken,
      maxStreak: this.maxStreak || this.comboStreak || 4,
      won: true
    };

    this.time.delayedCall(400, () => {
      if (typeof window.showCyberResults === 'function') {
        window.showCyberResults(resultData);
      } else {
        this.scene.launch('ResultOverlay', resultData);
      }
    });
  }

  handleGameOver() {
    this.isGameOver = true;
    this.canClick = false;
    if (this.timerEvent) this.timerEvent.remove();

    sounds.playGameOver();

    const resultData = {
      pairsMatched: this.totalPairsMatched,
      moves: this.moves,
      timeLeft: 0,
      timeTaken: 20,
      maxStreak: this.maxStreak || this.comboStreak || 1,
      won: false
    };

    this.time.delayedCall(400, () => {
      if (typeof window.showCyberResults === 'function') {
        window.showCyberResults(resultData);
      } else {
        this.scene.launch('ResultOverlay', resultData);
      }
    });
  }

  restartGame() {
    if (this.timerEvent) this.timerEvent.remove();
    this.scene.stop('ResultOverlay');
    sounds.playGameMusic();
    this.scene.restart();
  }

  returnToMenu() {
    if (this.timerEvent) this.timerEvent.remove();
    this.scene.stop('ResultOverlay');
    sounds.playMenuMusic();
    if (typeof window.returnToCyberMenu === 'function') {
      window.returnToCyberMenu();
    } else {
      this.scene.start('StartScene');
    }
  }
}
