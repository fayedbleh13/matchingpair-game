import Phaser from 'phaser';
import { Storage } from '../utils/storage.js';
import { sounds } from '../utils/sounds.js';

export class LeaderboardScene extends Phaser.Scene {
  constructor() {
    super('LeaderboardScene');
  }

  create() {
    this.bgContainer = this.add.container(0, 0);
    this.uiContainer = this.add.container(0, 0);

    this.renderUI();

    this.scale.on('resize', () => {
      this.renderUI();
    });
  }

  renderUI() {
    this.bgContainer.removeAll(true);
    this.uiContainer.removeAll(true);

    const { width, height } = this.scale;
    const isLandscape = width > height;

    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x060913, 0x060913, 0x0a1324, 0x0a1324, 1);
    bg.fillRect(0, 0, width, height);
    this.bgContainer.add(bg);

    if (isLandscape) {
      this.renderLandscape(width, height);
    } else {
      this.renderPortrait(width, height);
    }
  }

  renderLandscape(width, height) {
    let curY = 32;

    // Header logo
    if (this.textures.exists('sw-brand-logo')) {
      const logoW = Math.min(width * 0.22, 260);
      const logoH = logoW * (200 / 1238);
      const logo = this.add.image(width / 2, curY + logoH / 2, 'sw-brand-logo');
      logo.setDisplaySize(logoW, logoH);
      this.uiContainer.add(logo);
      curY += logoH + 12;
    }

    const title = this.add.text(width / 2, curY, 'BOOTH LEADERBOARD ★', {
      fontFamily: 'Outfit',
      fontSize: '28px',
      fontWeight: '900',
      color: '#ffffff',
      letterSpacing: 2
    }).setOrigin(0.5);
    this.uiContainer.add(title);
    curY += 28;

    const sub = this.add.text(width / 2, curY, 'Top Cyber Memory Challenge Competitors • GovWare 2026', {
      fontFamily: 'Outfit',
      fontSize: '14px',
      fontWeight: '600',
      color: '#00d8f6'
    }).setOrigin(0.5);
    this.uiContainer.add(sub);
    curY += 22;

    // Table Box
    const tableW = Math.min(width * 0.75, 780);
    const availableH = height - curY - 70;
    const tableH = Math.min(availableH, 420);
    const tableX = width / 2;
    const tableY = curY + tableH / 2;

    const tableBg = this.add.graphics();
    tableBg.fillStyle(0x091224, 0.96);
    tableBg.fillRoundedRect(tableX - tableW / 2, tableY - tableH / 2, tableW, tableH, 18);
    tableBg.lineStyle(2, 0x1e355b, 1);
    tableBg.strokeRoundedRect(tableX - tableW / 2, tableY - tableH / 2, tableW, tableH, 18);
    this.uiContainer.add(tableBg);

    // Table Header Row
    const thY = tableY - tableH / 2 + 24;
    const cols = [
      { x: tableX - tableW / 2 + 36, text: 'RANK', align: 0 },
      { x: tableX - tableW / 2 + 130, text: 'NAME', align: 0 },
      { x: tableX + 30, text: 'SCORE', align: 0.5 },
      { x: tableX + 170, text: 'PAIRS', align: 0.5 },
      { x: tableX + tableW / 2 - 36, text: 'MOVES', align: 1 }
    ];

    cols.forEach(c => {
      const t = this.add.text(c.x, thY, c.text, {
        fontFamily: 'Outfit',
        fontSize: '12px',
        fontWeight: '900',
        color: '#94a3b8',
        letterSpacing: 1
      }).setOrigin(c.align, 0.5);
      this.uiContainer.add(t);
    });

    const entries = Storage.getLeaderboard().slice(0, 6);
    const rowH = (tableH - 56) / Math.max(1, Math.min(entries.length, 6));

    entries.forEach((entry, idx) => {
      const rY = tableY - tableH / 2 + 48 + idx * rowH + rowH / 2;

      // Subtle row striping
      if (idx % 2 === 0) {
        const rBg = this.add.graphics();
        rBg.fillStyle(0x0d1830, 0.6);
        rBg.fillRoundedRect(tableX - tableW / 2 + 10, rY - (rowH - 4) / 2, tableW - 20, rowH - 4, 8);
        this.uiContainer.add(rBg);
      }

      let rankColor = '#ffffff';
      let rankText = `#${idx + 1}`;
      if (idx === 0) { rankColor = '#facc15'; rankText = '🥇 1ST'; }
      else if (idx === 1) { rankColor = '#cbd5e1'; rankText = '🥈 2ND'; }
      else if (idx === 2) { rankColor = '#f05423'; rankText = '🥉 3RD'; }

      const rankT = this.add.text(tableX - tableW / 2 + 36, rY, rankText, {
        fontFamily: 'Outfit',
        fontSize: '13px',
        fontWeight: '900',
        color: rankColor
      }).setOrigin(0, 0.5);

      const nameT = this.add.text(tableX - tableW / 2 + 130, rY, entry.name, {
        fontFamily: 'Outfit',
        fontSize: '15px',
        fontWeight: '800',
        color: '#ffffff'
      }).setOrigin(0, 0.5);

      const scoreT = this.add.text(tableX + 30, rY, `${entry.score} PTS`, {
        fontFamily: 'Outfit',
        fontSize: '15px',
        fontWeight: '900',
        color: '#00d8f6'
      }).setOrigin(0.5, 0.5);

      const pairsT = this.add.text(tableX + 170, rY, `${entry.pairs || 0}/8`, {
        fontFamily: 'Outfit',
        fontSize: '14px',
        fontWeight: '700',
        color: '#94a3b8'
      }).setOrigin(0.5, 0.5);

      const movesT = this.add.text(tableX + tableW / 2 - 36, rY, `${entry.moves || 0}`, {
        fontFamily: 'Outfit',
        fontSize: '14px',
        fontWeight: '700',
        color: '#cbd5e1'
      }).setOrigin(1, 0.5);

      this.uiContainer.add([rankT, nameT, scoreT, pairsT, movesT]);
    });

    // Bottom Controls
    const botY = height - 34;
    const backW = 200;
    const backH = 42;

    const backBg = this.add.graphics();
    backBg.fillStyle(0xf05423, 1);
    backBg.fillRoundedRect(width / 2 - backW / 2, botY - backH / 2, backW, backH, 10);

    const backText = this.add.text(width / 2, botY, '◀ BACK TO MENU', {
      fontFamily: 'Outfit',
      fontSize: '14px',
      fontWeight: '900',
      color: '#ffffff',
      letterSpacing: 1
    }).setOrigin(0.5);

    const backZone = this.add.zone(width / 2, botY, backW, backH).setInteractive({ useHandCursor: true });
    backZone.on('pointerdown', () => {
      sounds.playClick();
      this.scene.start('StartScene');
    });

    this.uiContainer.add([backBg, backText, backZone]);
  }

  renderPortrait(width, height) {
    const s = Math.max(0.65, Math.min(width / 1080, 2.2));
    let curY = 50 * s;

    if (this.textures.exists('sw-brand-logo')) {
      const logoW = Math.min(width * 0.65, 400 * s);
      const logoH = logoW * (200 / 1238);
      const logo = this.add.image(width / 2, curY + logoH / 2, 'sw-brand-logo');
      logo.setDisplaySize(logoW, logoH);
      this.uiContainer.add(logo);
      curY += logoH + 16 * s;
    }

    const title = this.add.text(width / 2, curY, 'BOOTH LEADERBOARD ★', {
      fontFamily: 'Outfit',
      fontSize: `${Math.floor(28 * s)}px`,
      fontWeight: '900',
      color: '#ffffff',
      letterSpacing: 2
    }).setOrigin(0.5);
    this.uiContainer.add(title);
    curY += 32 * s;

    // Table
    const tableW = width - 40 * s;
    const tableH = Math.min(height * 0.65, 600 * s);
    const tableX = width / 2;
    const tableY = curY + tableH / 2;

    const tableBg = this.add.graphics();
    tableBg.fillStyle(0x091224, 0.96);
    tableBg.fillRoundedRect(tableX - tableW / 2, tableY - tableH / 2, tableW, tableH, 18 * s);
    tableBg.lineStyle(2, 0x1e355b, 1);
    tableBg.strokeRoundedRect(tableX - tableW / 2, tableY - tableH / 2, tableW, tableH, 18 * s);
    this.uiContainer.add(tableBg);

    const entries = Storage.getLeaderboard().slice(0, 8);
    const rowH = (tableH - 40 * s) / Math.max(1, Math.min(entries.length, 8));

    entries.forEach((entry, idx) => {
      const rY = tableY - tableH / 2 + 20 * s + idx * rowH + rowH / 2;

      let rankColor = '#ffffff';
      let rankText = `#${idx + 1}`;
      if (idx === 0) { rankColor = '#facc15'; rankText = '🥇 1ST'; }
      else if (idx === 1) { rankColor = '#cbd5e1'; rankText = '🥈 2ND'; }
      else if (idx === 2) { rankColor = '#f05423'; rankText = '🥉 3RD'; }

      const rankT = this.add.text(tableX - tableW / 2 + 20 * s, rY, rankText, {
        fontFamily: 'Outfit',
        fontSize: `${Math.floor(14 * s)}px`,
        fontWeight: '900',
        color: rankColor
      }).setOrigin(0, 0.5);

      const nameT = this.add.text(tableX - tableW / 2 + 90 * s, rY, entry.name, {
        fontFamily: 'Outfit',
        fontSize: `${Math.floor(16 * s)}px`,
        fontWeight: '800',
        color: '#ffffff'
      }).setOrigin(0, 0.5);

      const scoreT = this.add.text(tableX + tableW / 2 - 20 * s, rY, `${entry.score} PTS`, {
        fontFamily: 'Outfit',
        fontSize: `${Math.floor(16 * s)}px`,
        fontWeight: '900',
        color: '#00d8f6'
      }).setOrigin(1, 0.5);

      this.uiContainer.add([rankT, nameT, scoreT]);
    });

    // Back Button
    const botY = height - 50 * s;
    const backW = Math.min(width * 0.7, 340 * s);
    const backH = 50 * s;

    const backBg = this.add.graphics();
    backBg.fillStyle(0xf05423, 1);
    backBg.fillRoundedRect(width / 2 - backW / 2, botY - backH / 2, backW, backH, 12 * s);

    const backText = this.add.text(width / 2, botY, '◀ BACK TO MENU', {
      fontFamily: 'Outfit',
      fontSize: `${Math.floor(16 * s)}px`,
      fontWeight: '900',
      color: '#ffffff',
      letterSpacing: 1
    }).setOrigin(0.5);

    const backZone = this.add.zone(width / 2, botY, backW, backH).setInteractive({ useHandCursor: true });
    backZone.on('pointerdown', () => {
      sounds.playClick();
      this.scene.start('StartScene');
    });

    this.uiContainer.add([backBg, backText, backZone]);
  }
}
