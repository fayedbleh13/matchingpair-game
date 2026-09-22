import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig.js';
import { sounds } from '../utils/sounds.js';

export class Card extends Phaser.GameObjects.Container {
  constructor(scene, x, y, cardData, width = 460, height = 700, onClick = null) {
    super(scene, x, y);
    this.scene = scene;
    this.cardData = cardData;
    this.onClick = onClick;
    this.isFlipped = false;
    this.isMatched = false;
    this.isAnimating = false;
    this.isPressed = false;

    // Anchor base coordinates to prevent any tween drift
    this.baseX = x;
    this.baseY = y;

    // Set exact card dimensions
    this.cardWidth = width;
    this.cardHeight = height;

    this.createCardViews();
    this.scene.add.existing(this);
    this.setupInteractivity();
  }

  setPosition(x, y) {
    super.setPosition(x, y);
    this.baseX = x;
    this.baseY = y;
    return this;
  }

  setupInteractivity() {
    const w = this.cardWidth;
    const h = this.cardHeight;

    // Direct Container interactivity covering the EXACT card boundary
    // Phaser normalizes by displayOriginX/Y, so hitArea must start at (0, 0)
    this.setSize(w, h);
    if (this.input) {
      if (this.input.hitArea) {
        this.input.hitArea.setTo(0, 0, w, h);
      } else {
        this.input.hitArea = new Phaser.Geom.Rectangle(0, 0, w, h);
      }
    } else {
      this.setInteractive(
        new Phaser.Geom.Rectangle(0, 0, w, h),
        Phaser.Geom.Rectangle.Contains
      );
    }

    this.off('pointerdown');
    this.off('pointerup');
    this.off('pointerover');
    this.off('pointerout');

    this.on('pointerdown', (pointer) => this.onPointerDown(pointer));
    this.on('pointerup', (pointer) => this.onPointerUp(pointer));
    this.on('pointerover', (pointer) => this.onPointerOver(pointer));
    this.on('pointerout', (pointer) => this.onPointerOut(pointer));
  }

  createCardViews() {
    const w = this.cardWidth;
    const h = this.cardHeight;
    const r = Math.min(36, Math.floor(w * 0.08));

    // ============================================================
    // 1. BEHIND-CARD LAYERS (Underneath everything)
    // ============================================================
    // A. Matched Glow (Emerald aura strictly behind card)
    this.matchedGlow = this.scene.add.graphics();
    this.add(this.matchedGlow);

    // B. Tactile Touch Aura (Electric Cyan highlight on touch)
    this.touchAura = this.scene.add.graphics();
    this.add(this.touchAura);

    // C. Drop Shadow
    this.shadow = this.scene.add.graphics();
    this.shadow.fillStyle(0x000000, 0.5);
    this.shadow.fillRoundedRect(-w / 2 + 8, -h / 2 + 12, w, h, r);
    this.add(this.shadow);

    // ============================================================
    // 2. CARD BACK VIEW (Sleek Cyber Navy + Bold Boomerang Emblem)
    // ============================================================
    this.backView = this.scene.add.container(0, 0);

    const backBg = this.scene.add.graphics();
    backBg.fillStyle(0x0a1326, 1);
    backBg.fillRoundedRect(-w / 2, -h / 2, w, h, r);

    // Refined, eye-friendly cyber border (subtle slate-blue with soft warm undertone)
    backBg.lineStyle(2, 0x1e355b, 0.9);
    backBg.strokeRoundedRect(-w / 2, -h / 2, w, h, r);

    // Inner Circuitry Rim (deep midnight tech accent)
    const innerRim = this.scene.add.graphics();
    innerRim.lineStyle(1.5, 0x12223b, 0.7);
    innerRim.strokeRoundedRect(-w / 2 + 12, -h / 2 + 12, w - 24, h - 24, r - 6);

    // Subtle Corner Tech Accents (soft warm amber pips)
    const cornerSize = Math.min(22, w * 0.06);
    const cornerGraphics = this.scene.add.graphics();
    cornerGraphics.lineStyle(2, 0xf05423, 0.55);
    // Top-left
    cornerGraphics.moveTo(-w / 2 + 16, -h / 2 + 16 + cornerSize);
    cornerGraphics.lineTo(-w / 2 + 16, -h / 2 + 16);
    cornerGraphics.lineTo(-w / 2 + 16 + cornerSize, -h / 2 + 16);
    // Bottom-right
    cornerGraphics.moveTo(w / 2 - 16, h / 2 - 16 - cornerSize);
    cornerGraphics.lineTo(w / 2 - 16, h / 2 - 16);
    cornerGraphics.lineTo(w / 2 - 16 - cornerSize, h / 2 - 16);
    cornerGraphics.strokePath();

    // Center Emblem: SonicWall Boomerang Mark with dark cyber badge
    const emblemSize = Math.min(w * 0.58, h * 0.42, 260);
    if (this.scene.textures.exists('sw-card-back-mark')) {
      this.backEmblem = this.scene.add.image(0, 0, 'sw-card-back-mark');
      this.backEmblem.setDisplaySize(emblemSize, emblemSize);
      this.backView.add([backBg, innerRim, cornerGraphics, this.backEmblem]);
    } else {
      const qText = this.scene.add.text(0, 0, '?', {
        fontFamily: 'Outfit',
        fontSize: `${Math.floor(emblemSize * 0.6)}px`,
        fontWeight: '900',
        color: '#f05423'
      }).setOrigin(0.5);
      this.backView.add([backBg, innerRim, cornerGraphics, qText]);
    }

    this.add(this.backView);

    // ============================================================
    // 3. CARD FRONT VIEW (Pristine White Card Face)
    // ============================================================
    this.frontView = this.scene.add.container(0, 0);
    this.frontView.setVisible(false);

    // Pristine White Base Card
    this.frontBg = this.scene.add.graphics();
    this.frontBg.fillStyle(0xffffff, 1);
    this.frontBg.fillRoundedRect(-w / 2, -h / 2, w, h, r);
    this.frontBg.lineStyle(4, 0xe2e8f0, 1);
    this.frontBg.strokeRoundedRect(-w / 2, -h / 2, w, h, r);

    // Centered Official Transparent PNG Cybersecurity Icon (Logo only, slightly bigger)
    const iconTargetW = w * 0.92;
    const iconTargetH = h * 0.92;
    const iconCenterY = 0;

    if (this.scene.textures.exists(this.cardData.textureKey)) {
      this.frontIcon = this.scene.add.image(0, iconCenterY, this.cardData.textureKey);
      const tex = this.scene.textures.get(this.cardData.textureKey).getSourceImage();
      const origW = tex.width || iconTargetW;
      const origH = tex.height || iconTargetH;
      const scale = Math.min(iconTargetW / origW, iconTargetH / origH);
      this.frontIcon.setDisplaySize(origW * scale, origH * scale);
    } else {
      this.frontIcon = this.scene.add.text(0, iconCenterY, '🛡️', {
        fontSize: `${Math.floor(iconTargetH * 0.7)}px`
      }).setOrigin(0.5);
    }

    this.frontView.add([this.frontBg, this.frontIcon]);
    this.add(this.frontView);
  }

  resize(w, h) {
    this.cardWidth = w;
    this.cardHeight = h;

    this.removeAll(true);
    this.createCardViews();
    this.setupInteractivity();

    if (this.isMatched) {
      this.setMatched(true);
    } else if (this.isFlipped) {
      this.frontView.setVisible(true);
      this.backView.setVisible(false);
    } else {
      this.frontView.setVisible(false);
      this.backView.setVisible(true);
    }
  }

  // ============================================================
  // TACTILE USER EXPERIENCE & DIRECT CLICK DISPATCH
  // ============================================================
  onPointerDown(pointer) {
    if (this.isMatched) return;
    if (this.scene && this.scene.canClick === false) return;
    if (this.isFlipped && this.scene && this.scene.selectedCards && this.scene.selectedCards.includes(this)) return;

    sounds.playTap();

    // Tactile touch aura pulse around entire card perimeter
    const w = this.cardWidth;
    const h = this.cardHeight;
    const r = Math.min(36, Math.floor(w * 0.08));
    this.touchAura.clear();
    this.touchAura.lineStyle(Math.max(4, Math.floor(w * 0.02)), 0xff6b35, 0.95);
    this.touchAura.strokeRoundedRect(-w / 2 - 4, -h / 2 - 4, w + 8, h + 8, r + 4);

    this.scene.time.delayedCall(120, () => {
      if (this.touchAura) this.touchAura.clear();
    });

    this.spawnTouchRipple();

    if (typeof this.onClick === 'function') {
      this.onClick(this);
    }
  }

  onPointerUp(pointer) {
    if (this.touchAura) this.touchAura.clear();
  }

  spawnTouchRipple() {
    const ripple = this.scene.add.graphics();
    ripple.setPosition(this.x, this.y);
    ripple.lineStyle(3, 0xf05423, 0.85);
    ripple.strokeCircle(0, 0, Math.min(this.cardWidth * 0.35, 40));

    this.scene.tweens.add({
      targets: ripple,
      scaleX: 2.2,
      scaleY: 2.2,
      alpha: 0,
      duration: 180,
      ease: 'Quad.easeOut',
      onComplete: () => {
        ripple.destroy();
      }
    });
  }

  onPointerOver(pointer) {
    if (pointer && pointer.wasTouch) return;
    if (this.isMatched || this.isFlipped || this.isAnimating) return;

    this.scene.tweens.add({
      targets: this,
      scaleX: 1.03,
      scaleY: 1.03,
      duration: 80,
      ease: 'Quad.easeOut'
    });
  }

  onPointerOut(pointer) {
    if (this.touchAura) this.touchAura.clear();
    if (pointer && pointer.wasTouch) return;
    if (this.isMatched || this.isFlipped || this.isAnimating) return;

    this.scene.tweens.add({
      targets: this,
      scaleX: 1.0,
      scaleY: 1.0,
      duration: 80,
      ease: 'Quad.easeOut'
    });
  }

  // ============================================================
  // CARD FLIP SEQUENCE (Ultra-Fast 80ms Flip Kinetics)
  // ============================================================
  flip(showFront = true, instant = false, onComplete = null) {
    this.isFlipped = showFront;
    this.x = this.baseX;
    this.y = this.baseY;

    if (instant) {
      this.scene.tweens.killTweensOf(this);
      this.isAnimating = false;
      this.scaleX = 1;
      this.scaleY = 1;
      this.frontView.setVisible(showFront);
      this.backView.setVisible(!showFront);
      if (onComplete) onComplete();
      return;
    }

    this.scene.tweens.killTweensOf(this);
    this.isAnimating = true;
    sounds.playFlip();

    // Balanced Smooth & Snappy Flip Sequence (110ms down + 120ms up = 230ms total)
    this.scene.tweens.add({
      targets: this,
      scaleX: 0,
      duration: 110,
      ease: 'Quad.easeIn',
      onComplete: () => {
        this.isFlipped = showFront;
        this.frontView.setVisible(showFront);
        this.backView.setVisible(!showFront);

        this.scene.tweens.add({
          targets: this,
          scaleX: 1,
          duration: 120,
          ease: 'Back.easeOut',
          onComplete: () => {
            this.x = this.baseX;
            this.y = this.baseY;
            this.scaleX = 1;
            this.scaleY = 1;
            this.isAnimating = false;
            if (onComplete) onComplete();
          }
        });
      }
    });
  }

  // ============================================================
  // MATCHED STATE (Refined Emerald Border & Subtle Behind-Card Pulse)
  // ============================================================
  setMatched(instant = false) {
    this.isMatched = true;
    this.isFlipped = true;
    this.disableInteractive(); // Matched cards must never capture clicks or hovers
    this.scene.tweens.killTweensOf(this);
    if (this.matchedGlow) this.scene.tweens.killTweensOf(this.matchedGlow);
    this.isAnimating = false;
    this.frontView.setVisible(true);
    this.backView.setVisible(false);
    this.x = this.baseX;
    this.y = this.baseY;
    this.scaleX = 1;
    this.scaleY = 1;

    const w = this.cardWidth;
    const h = this.cardHeight;
    const r = Math.min(36, Math.floor(w * 0.08));

    // 1. BEHIND-CARD SOFT AURA (Lessen border, strictly behind card, no overlap with neighbors)
    this.matchedGlow.clear();
    const glowPad = Math.min(5, Math.max(3, Math.floor(w * 0.025)));
    this.matchedGlow.fillStyle(0x10b981, 0.45);
    this.matchedGlow.fillRoundedRect(-w / 2 - glowPad, -h / 2 - glowPad, w + glowPad * 2, h + glowPad * 2, r + 2);

    // 2. Card front plate: Single clean, elegant 3px Emerald Green border (no double stroke)
    this.frontBg.clear();
    this.frontBg.fillStyle(0xffffff, 1);
    this.frontBg.fillRoundedRect(-w / 2, -h / 2, w, h, r);
    this.frontBg.lineStyle(3, 0x10b981, 1);
    this.frontBg.strokeRoundedRect(-w / 2, -h / 2, w, h, r);

    // Optional label tint if label exists
    if (this.frontLabel) {
      this.frontLabel.setColor('#059669');
    }

    if (!instant) {
      // Subtle pulse on the behind-card aura only (card dimensions stay stable, never overlapping neighbors)
      this.matchedGlow.setAlpha(0.9);
      this.scene.tweens.add({
        targets: this.matchedGlow,
        alpha: 0.4,
        duration: 380,
        ease: 'Sine.easeOut'
      });
    }
  }

  shakeMismatch(onDone = null) {
    sounds.playMismatch();
    this.scene.tweens.killTweensOf(this);
    this.x = this.baseX;
    this.y = this.baseY;
    this.scene.tweens.add({
      targets: this,
      x: this.baseX + 12,
      duration: 35,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        this.x = this.baseX;
        this.flip(false, false, onDone);
      }
    });
  }
}
