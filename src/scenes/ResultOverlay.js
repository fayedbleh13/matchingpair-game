import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig.js';
import { sounds } from '../utils/sounds.js';
import { Storage } from '../utils/storage.js';

export class ResultOverlay extends Phaser.Scene {
  constructor() {
    super('ResultOverlay');
  }

  create(data) {
    if (typeof window.showCyberResults === 'function' && document.getElementById('cyber-result-overlay')) {
      window.showCyberResults(data);
      return;
    }
    const {
      pairsMatched = 0,
      roundReached = 1,
      moves = 0,
      score = 0
    } = data;

    this.pairsMatched = pairsMatched;
    this.roundReached = roundReached;
    this.moves = moves;
    this.score = score;

    this.bgContainer = this.add.container(0, 0);
    this.modalContainer = this.add.container(0, 0);

    this.renderModal();

    this.scale.on('resize', () => {
      this.renderModal();
    });
  }

  renderModal() {
    this.bgContainer.removeAll(true);
    this.modalContainer.removeAll(true);

    const { width, height } = this.scale;
    const isLandscape = width > height;

    // Dark cyber backdrop
    const backdrop = this.add.graphics();
    backdrop.fillStyle(0x060913, 0.92);
    backdrop.fillRect(0, 0, width, height);
    this.bgContainer.add(backdrop);

    // Prize Tier evaluation
    let prize = GAME_CONFIG.prizes.CONSOLATION;
    let isGrand = false;

    if (this.pairsMatched >= GAME_CONFIG.prizes.GRAND.minPairs) {
      prize = GAME_CONFIG.prizes.GRAND;
      isGrand = true;
      this.createConfetti(40);
    } else if (this.pairsMatched >= GAME_CONFIG.prizes.TIER_2.minPairs) {
      prize = GAME_CONFIG.prizes.TIER_2;
      this.createConfetti(25);
    }

    if (isLandscape) {
      this.renderLandscapeModal(width, height, prize, isGrand);
    } else {
      this.renderPortraitModal(width, height, prize, isGrand);
    }
  }

  renderLandscapeModal(width, height, prize, isGrand) {
    const modalW = Math.min(width * 0.72, 720);
    const modalH = Math.min(height * 0.88, 540);
    const modalX = width / 2;
    const modalY = height / 2;

    // Drop shadow & glass body
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.7);
    shadow.fillRoundedRect(modalX - modalW / 2 + 8, modalY - modalH / 2 + 12, modalW, modalH, 24);

    const modalBg = this.add.graphics();
    modalBg.fillStyle(0x0a1325, 0.98);
    modalBg.fillRoundedRect(modalX - modalW / 2, modalY - modalH / 2, modalW, modalH, 24);
    modalBg.lineStyle(3, isGrand ? 0xf05423 : 0x00d8f6, 1);
    modalBg.strokeRoundedRect(modalX - modalW / 2, modalY - modalH / 2, modalW, modalH, 24);

    this.modalContainer.add([shadow, modalBg]);

    let curY = modalY - modalH / 2 + 32;

    // Trophy Image
    if (this.textures.exists('icon-trophy')) {
      const trophy = this.add.image(modalX, curY + 22, 'icon-trophy');
      trophy.setDisplaySize(54, 54);
      this.modalContainer.add(trophy);
      curY += 58;
    }

    // Status Title
    const title = this.add.text(modalX, curY, 'CHALLENGE COMPLETE', {
      fontFamily: 'Outfit',
      fontSize: '24px',
      fontWeight: '900',
      color: '#ffffff',
      letterSpacing: 3
    }).setOrigin(0.5);
    this.modalContainer.add(title);
    curY += 28;

    // Prize Card
    const prizeCardW = modalW - 48;
    const prizeCardH = 114;
    const prizeBox = this.add.graphics();
    prizeBox.fillStyle(0x060913, 0.95);
    prizeBox.fillRoundedRect(modalX - prizeCardW / 2, curY, prizeCardW, prizeCardH, 16);
    prizeBox.lineStyle(2, isGrand ? 0xf05423 : 0x00d8f6, 0.9);
    prizeBox.strokeRoundedRect(modalX - prizeCardW / 2, curY, prizeCardW, prizeCardH, 16);
    this.modalContainer.add(prizeBox);

    const tierTag = this.add.text(modalX, curY + 24, `[ ${prize.tierName} UNLOCKED ]`, {
      fontFamily: 'Outfit',
      fontSize: '13px',
      fontWeight: '900',
      color: isGrand ? '#f05423' : '#00d8f6',
      letterSpacing: 2
    }).setOrigin(0.5);

    const prizeName = this.add.text(modalX, curY + 56, prize.prizeItem, {
      fontFamily: 'Outfit',
      fontSize: '18px',
      fontWeight: '900',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    const claimNotice = this.add.text(modalX, curY + 88, '★ SHOW SCREEN TO SONICWALL BOOTH REP TO CLAIM ★', {
      fontFamily: 'Outfit',
      fontSize: '11px',
      fontWeight: '900',
      color: '#facc15',
      letterSpacing: 1
    }).setOrigin(0.5);

    this.modalContainer.add([tierTag, prizeName, claimNotice]);
    curY += prizeCardH + 18;

    // Performance Stats
    const statsStr = `Score: ${this.score}   •   Pairs: ${this.pairsMatched}/8   •   Stage: ${this.roundReached}   •   Moves: ${this.moves}`;
    const statsText = this.add.text(modalX, curY, statsStr, {
      fontFamily: 'Outfit',
      fontSize: '15px',
      fontWeight: '800',
      color: '#94a3b8'
    }).setOrigin(0.5);
    this.modalContainer.add(statsText);
    curY += 24;

    // Name Input Row
    this.playerName = 'ATTENDEE';
    const inputLbl = this.add.text(modalX, curY, 'RECORD SCORE ON BOOTH LEADERBOARD:', {
      fontFamily: 'Outfit',
      fontSize: '11px',
      fontWeight: '800',
      color: '#cbd5e1',
      letterSpacing: 1
    }).setOrigin(0.5);
    this.modalContainer.add(inputLbl);
    curY += 22;

    const nameBoxW = 220;
    const saveBtnW = 110;
    const rowGap = 12;
    const rowTotalW = nameBoxW + saveBtnW + rowGap;
    const startX = modalX - rowTotalW / 2;

    const nameRect = this.add.rectangle(startX + nameBoxW / 2, curY + 18, nameBoxW, 38, 0x060913, 1)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(2, 0x00d8f6);

    this.nameText = this.add.text(startX + nameBoxW / 2, curY + 18, this.playerName, {
      fontFamily: 'Outfit',
      fontSize: '15px',
      fontWeight: '900',
      color: '#00d8f6',
      letterSpacing: 1
    }).setOrigin(0.5);

    nameRect.on('pointerdown', () => {
      const input = window.prompt('Enter attendee name or initials (max 12 chars):', this.playerName);
      if (input && input.trim()) {
        this.playerName = input.trim().substring(0, 12).toUpperCase();
        this.nameText.setText(this.playerName);
      }
    });

    const saveRect = this.add.rectangle(startX + nameBoxW + rowGap + saveBtnW / 2, curY + 18, saveBtnW, 38, 0xf05423, 1)
      .setInteractive({ useHandCursor: true });

    const saveTxt = this.add.text(startX + nameBoxW + rowGap + saveBtnW / 2, curY + 18, 'SAVE', {
      fontFamily: 'Outfit',
      fontSize: '14px',
      fontWeight: '900',
      color: '#ffffff',
      letterSpacing: 1
    }).setOrigin(0.5);

    let saved = false;
    saveRect.on('pointerdown', () => {
      if (saved) return;
      sounds.playClick();
      Storage.saveScore({
        name: this.playerName,
        score: this.score,
        pairs: this.pairsMatched,
        stage: this.roundReached,
        moves: this.moves,
        date: 'GovWare 2026'
      });
      saved = true;
      saveTxt.setText('SAVED ✓');
      saveRect.setFillStyle(0x10b981);
    });

    this.modalContainer.add([nameRect, this.nameText, saveRect, saveTxt]);
    curY += 56;

    // Play Again Button
    const playAgainW = modalW - 64;
    const playAgainH = 48;
    const playAgainBg = this.add.graphics();
    playAgainBg.fillStyle(0xf05423, 1);
    playAgainBg.fillRoundedRect(modalX - playAgainW / 2, curY - playAgainH / 2, playAgainW, playAgainH, 12);

    const playAgainText = this.add.text(modalX, curY, 'PLAY AGAIN / NEXT ATTENDEE ▶', {
      fontFamily: 'Outfit',
      fontSize: '16px',
      fontWeight: '900',
      color: '#ffffff',
      letterSpacing: 2
    }).setOrigin(0.5);

    const playAgainZone = this.add.zone(modalX, curY, playAgainW, playAgainH).setInteractive({ useHandCursor: true });
    playAgainZone.on('pointerdown', () => {
      sounds.playClick();
      const gameScene = this.scene.get('GameScene');
      if (gameScene) gameScene.restartGame();
    });

    this.modalContainer.add([playAgainBg, playAgainText, playAgainZone]);
    curY += 46;

    // Sub Buttons
    const subW = (playAgainW - 16) / 2;
    const subH = 38;
    const sub1X = modalX - playAgainW / 2 + subW / 2;
    const sub2X = modalX + playAgainW / 2 - subW / 2;

    const createSubBtn = (x, label, onClick) => {
      const bg = this.add.graphics();
      bg.fillStyle(0x060913, 0.9);
      bg.fillRoundedRect(x - subW / 2, curY - subH / 2, subW, subH, 10);
      bg.lineStyle(1.5, 0x1e355b, 1);
      bg.strokeRoundedRect(x - subW / 2, curY - subH / 2, subW, subH, 10);

      const txt = this.add.text(x, curY, label, {
        fontFamily: 'Outfit',
        fontSize: '12px',
        fontWeight: '800',
        color: '#cbd5e1',
        letterSpacing: 1
      }).setOrigin(0.5);

      const zone = this.add.zone(x, curY, subW, subH).setInteractive({ useHandCursor: true });
      zone.on('pointerdown', () => {
        sounds.playClick();
        onClick();
      });

      this.modalContainer.add([bg, txt, zone]);
    };

    createSubBtn(sub1X, '★ LEADERBOARD', () => {
      this.scene.stop('GameScene');
      this.scene.stop('ResultOverlay');
      this.scene.start('LeaderboardScene');
    });

    createSubBtn(sub2X, 'MAIN MENU', () => {
      sounds.playMenuMusic();
      this.scene.stop('GameScene');
      this.scene.stop('ResultOverlay');
      this.scene.start('StartScene');
    });
  }

  renderPortraitModal(width, height, prize, isGrand) {
    const s = Math.max(0.65, Math.min(width / 1080, 2.2));
    const modalW = width - 48 * s;
    const modalH = Math.min(height * 0.85, 540 * s);
    const modalX = width / 2;
    const modalY = height / 2;

    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.7);
    shadow.fillRoundedRect(modalX - modalW / 2 + 8 * s, modalY - modalH / 2 + 12 * s, modalW, modalH, 24 * s);

    const modalBg = this.add.graphics();
    modalBg.fillStyle(0x0a1325, 0.98);
    modalBg.fillRoundedRect(modalX - modalW / 2, modalY - modalH / 2, modalW, modalH, 24 * s);
    modalBg.lineStyle(3, isGrand ? 0xf05423 : 0x00d8f6, 1);
    modalBg.strokeRoundedRect(modalX - modalW / 2, modalY - modalH / 2, modalW, modalH, 24 * s);
    this.modalContainer.add([shadow, modalBg]);

    let curY = modalY - modalH / 2 + 36 * s;

    if (this.textures.exists('icon-trophy')) {
      const trophy = this.add.image(modalX, curY + 25 * s, 'icon-trophy');
      trophy.setDisplaySize(60 * s, 60 * s);
      this.modalContainer.add(trophy);
      curY += 66 * s;
    }

    const title = this.add.text(modalX, curY, 'CHALLENGE COMPLETE', {
      fontFamily: 'Outfit',
      fontSize: `${Math.floor(26 * s)}px`,
      fontWeight: '900',
      color: '#ffffff',
      letterSpacing: 2
    }).setOrigin(0.5);
    this.modalContainer.add(title);
    curY += 34 * s;

    // Prize Card
    const prizeCardW = modalW - 36 * s;
    const prizeCardH = 130 * s;
    const prizeBox = this.add.graphics();
    prizeBox.fillStyle(0x060913, 0.95);
    prizeBox.fillRoundedRect(modalX - prizeCardW / 2, curY, prizeCardW, prizeCardH, 16 * s);
    prizeBox.lineStyle(2, isGrand ? 0xf05423 : 0x00d8f6, 0.9);
    prizeBox.strokeRoundedRect(modalX - prizeCardW / 2, curY, prizeCardW, prizeCardH, 16 * s);
    this.modalContainer.add(prizeBox);

    const tierTag = this.add.text(modalX, curY + 26 * s, `[ ${prize.tierName} UNLOCKED ]`, {
      fontFamily: 'Outfit',
      fontSize: `${Math.floor(14 * s)}px`,
      fontWeight: '900',
      color: isGrand ? '#f05423' : '#00d8f6'
    }).setOrigin(0.5);

    const prizeName = this.add.text(modalX, curY + 65 * s, prize.prizeItem, {
      fontFamily: 'Outfit',
      fontSize: `${Math.floor(19 * s)}px`,
      fontWeight: '900',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    const claimNotice = this.add.text(modalX, curY + 104 * s, '★ SHOW SCREEN TO SONICWALL BOOTH REP TO CLAIM ★', {
      fontFamily: 'Outfit',
      fontSize: `${Math.floor(11 * s)}px`,
      fontWeight: '900',
      color: '#facc15'
    }).setOrigin(0.5);

    this.modalContainer.add([tierTag, prizeName, claimNotice]);
    curY += prizeCardH + 22 * s;

    const statsStr = `Score: ${this.score}  •  Pairs: ${this.pairsMatched}/8  •  Moves: ${this.moves}`;
    const statsText = this.add.text(modalX, curY, statsStr, {
      fontFamily: 'Outfit',
      fontSize: `${Math.floor(15 * s)}px`,
      fontWeight: '800',
      color: '#94a3b8'
    }).setOrigin(0.5);
    this.modalContainer.add(statsText);
    curY += 30 * s;

    this.playerName = 'ATTENDEE';
    const nameBoxW = modalW * 0.58;
    const saveBtnW = modalW * 0.32;
    const nameRect = this.add.rectangle(modalX - modalW / 2 + nameBoxW / 2 + 18 * s, curY, nameBoxW, 44 * s, 0x060913, 1)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(2, 0x00d8f6);

    this.nameText = this.add.text(modalX - modalW / 2 + nameBoxW / 2 + 18 * s, curY, this.playerName, {
      fontFamily: 'Outfit',
      fontSize: `${Math.floor(16 * s)}px`,
      fontWeight: '900',
      color: '#00d8f6'
    }).setOrigin(0.5);

    nameRect.on('pointerdown', () => {
      const input = window.prompt('Enter attendee name or initials:', this.playerName);
      if (input && input.trim()) {
        this.playerName = input.trim().substring(0, 12).toUpperCase();
        this.nameText.setText(this.playerName);
      }
    });

    const saveRect = this.add.rectangle(modalX + modalW / 2 - saveBtnW / 2 - 18 * s, curY, saveBtnW, 44 * s, 0xf05423, 1)
      .setInteractive({ useHandCursor: true });

    const saveTxt = this.add.text(modalX + modalW / 2 - saveBtnW / 2 - 18 * s, curY, 'SAVE', {
      fontFamily: 'Outfit',
      fontSize: `${Math.floor(15 * s)}px`,
      fontWeight: '900',
      color: '#ffffff'
    }).setOrigin(0.5);

    let saved = false;
    saveRect.on('pointerdown', () => {
      if (saved) return;
      sounds.playClick();
      Storage.saveScore({
        name: this.playerName,
        score: this.score,
        pairs: this.pairsMatched,
        stage: this.roundReached,
        moves: this.moves,
        date: 'GovWare 2026'
      });
      saved = true;
      saveTxt.setText('SAVED ✓');
      saveRect.setFillStyle(0x10b981);
    });

    this.modalContainer.add([nameRect, this.nameText, saveRect, saveTxt]);
    curY += 44 * s;

    // Play Again Button
    const playAgainW = modalW - 36 * s;
    const playAgainH = 54 * s;
    const playAgainBg = this.add.graphics();
    playAgainBg.fillStyle(0xf05423, 1);
    playAgainBg.fillRoundedRect(modalX - playAgainW / 2, curY, playAgainW, playAgainH, 14 * s);

    const playAgainText = this.add.text(modalX, curY + playAgainH / 2, 'PLAY AGAIN / NEXT ATTENDEE ▶', {
      fontFamily: 'Outfit',
      fontSize: `${Math.floor(17 * s)}px`,
      fontWeight: '900',
      color: '#ffffff',
      letterSpacing: 2
    }).setOrigin(0.5);

    const playAgainZone = this.add.zone(modalX, curY + playAgainH / 2, playAgainW, playAgainH).setInteractive({ useHandCursor: true });
    playAgainZone.on('pointerdown', () => {
      sounds.playClick();
      const gameScene = this.scene.get('GameScene');
      if (gameScene) gameScene.restartGame();
    });

    this.modalContainer.add([playAgainBg, playAgainText, playAgainZone]);
    curY += playAgainH + 18 * s;

    // Sub Buttons
    const subW = (playAgainW - 14 * s) / 2;
    const subH = 42 * s;

    const createSub = (x, label, onClick) => {
      const bg = this.add.graphics();
      bg.fillStyle(0x060913, 0.9);
      bg.fillRoundedRect(x - subW / 2, curY, subW, subH, 10 * s);
      bg.lineStyle(1.5, 0x1e355b, 1);
      bg.strokeRoundedRect(x - subW / 2, curY, subW, subH, 10 * s);

      const txt = this.add.text(x, curY + subH / 2, label, {
        fontFamily: 'Outfit',
        fontSize: `${Math.floor(13 * s)}px`,
        fontWeight: '800',
        color: '#cbd5e1'
      }).setOrigin(0.5);

      const zone = this.add.zone(x, curY + subH / 2, subW, subH).setInteractive({ useHandCursor: true });
      zone.on('pointerdown', () => {
        sounds.playClick();
        onClick();
      });

      this.modalContainer.add([bg, txt, zone]);
    };

    createSub(modalX - playAgainW / 2 + subW / 2, '★ LEADERBOARD', () => {
      this.scene.stop('GameScene');
      this.scene.stop('ResultOverlay');
      this.scene.start('LeaderboardScene');
    });

    createSub(modalX + playAgainW / 2 - subW / 2, 'MAIN MENU', () => {
      sounds.playMenuMusic();
      this.scene.stop('GameScene');
      this.scene.stop('ResultOverlay');
      this.scene.start('StartScene');
    });
  }

  createConfetti(count = 35) {
    const { width, height } = this.scale;
    const colors = [0xf05423, 0x00d8f6, 0x10b981, 0xfacc15, 0xffffff];

    for (let i = 0; i < count; i++) {
      const p = this.add.graphics();
      p.fillStyle(colors[Math.floor(Math.random() * colors.length)], 1);
      const w = 6 + Math.random() * 8;
      const h = 4 + Math.random() * 6;
      p.fillRect(-w / 2, -h / 2, w, h);

      const startX = width / 2 + (Math.random() - 0.5) * (width * 0.6);
      const startY = height * 0.2;
      p.setPosition(startX, startY);
      this.modalContainer.add(p);

      const destX = startX + (Math.random() - 0.5) * 400;
      const destY = height * 0.75 + Math.random() * 200;

      this.tweens.add({
        targets: p,
        x: destX,
        y: destY,
        angle: Math.random() * 720,
        alpha: 0,
        duration: 1200 + Math.random() * 1000,
        ease: 'Quad.easeOut',
        onComplete: () => p.destroy()
      });
    }
  }
}
