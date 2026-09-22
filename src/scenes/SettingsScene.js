import Phaser from 'phaser';
import { Storage } from '../utils/storage.js';
import { sounds } from '../utils/sounds.js';

export class SettingsScene extends Phaser.Scene {
  constructor() {
    super('SettingsScene');
  }

  init(data) {
    this.returnTo = (data && data.returnTo) ? data.returnTo : 'StartScene';
  }

  create() {
    this.settings = Storage.getSettings();
    this.bgContainer = this.add.container(0, 0);
    this.modalContainer = this.add.container(0, 0);

    this.renderUI();

    this.scale.on('resize', () => {
      this.renderUI();
    });
  }

  renderUI() {
    this.bgContainer.removeAll(true);
    this.modalContainer.removeAll(true);

    const { width, height } = this.scale;
    const isLandscape = width > height;

    const backdrop = this.add.graphics();
    backdrop.fillStyle(0x060913, 0.92);
    backdrop.fillRect(0, 0, width, height);
    this.bgContainer.add(backdrop);

    const modalW = isLandscape ? Math.min(width * 0.65, 620) : width - 48;
    const modalH = isLandscape ? Math.min(height * 0.85, 480) : Math.min(height * 0.8, 560);
    const cx = width / 2;
    const cy = height / 2;

    const modalBg = this.add.graphics();
    modalBg.fillStyle(0x091325, 0.98);
    modalBg.fillRoundedRect(cx - modalW / 2, cy - modalH / 2, modalW, modalH, 20);
    modalBg.lineStyle(2, 0x1e355b, 1);
    modalBg.strokeRoundedRect(cx - modalW / 2, cy - modalH / 2, modalW, modalH, 20);
    this.modalContainer.add(modalBg);

    // Title
    const title = this.add.text(cx, cy - modalH / 2 + 36, 'SETTINGS ⚙️', {
      fontFamily: 'Outfit',
      fontSize: '24px',
      fontWeight: '900',
      color: '#ffffff',
      letterSpacing: 2
    }).setOrigin(0.5);
    this.modalContainer.add(title);

    let curY = cy - modalH / 2 + 84;
    const itemGap = isLandscape ? 84 : 100;

    // 1. MUSIC VOLUME
    this.createVolumeRow(cx, curY, modalW - 48, 'Music Volume 🎵', this.settings.musicVolume, this.settings.musicMuted, (val, muted) => {
      this.settings.musicVolume = val;
      this.settings.musicMuted = muted;
      sounds.setMusicVolume(val);
      sounds.setMusicMuted(muted);
    });
    curY += itemGap;

    // 2. SFX VOLUME
    this.createVolumeRow(cx, curY, modalW - 48, 'Sound Effects 🔊', this.settings.sfxVolume, this.settings.sfxMuted, (val, muted) => {
      this.settings.sfxVolume = val;
      this.settings.sfxMuted = muted;
      sounds.setSFXVolume(val);
      sounds.setSFXMuted(muted);
      sounds.playClick();
    });
    curY += itemGap;

    // 3. INITIAL PEEK
    this.createToggleRow(cx, curY, modalW - 48, 'Initial Card Peek 👀', this.settings.previewEnabled, (enabled) => {
      this.settings.previewEnabled = enabled;
      Storage.saveSettings({ previewEnabled: enabled });
      sounds.playClick();
    });
    curY += itemGap;

    // SAVE & CLOSE BUTTON
    const btnW = modalW - 64;
    const btnH = 46;
    const btnY = cy + modalH / 2 - 38;

    const closeBg = this.add.graphics();
    closeBg.fillStyle(0xf05423, 1);
    closeBg.fillRoundedRect(cx - btnW / 2, btnY - btnH / 2, btnW, btnH, 10);

    const closeText = this.add.text(cx, btnY, 'SAVE & CLOSE', {
      fontFamily: 'Outfit',
      fontSize: '16px',
      fontWeight: '900',
      color: '#ffffff',
      letterSpacing: 1
    }).setOrigin(0.5);

    const closeZone = this.add.zone(cx, btnY, btnW, btnH).setInteractive({ useHandCursor: true });
    closeZone.on('pointerdown', () => {
      sounds.playClick();
      Storage.saveSettings(this.settings);
      this.scene.stop('SettingsScene');
      if (this.returnTo === 'GameScene') {
        this.scene.resume('GameScene');
      } else {
        this.scene.start('StartScene');
      }
    });

    this.modalContainer.add([closeBg, closeText, closeZone]);
  }

  createVolumeRow(cx, y, width, label, initialVol, isMuted, onChange) {
    const lbl = this.add.text(cx - width / 2 + 10, y - 14, label, {
      fontFamily: 'Outfit',
      fontSize: '14px',
      fontWeight: '800',
      color: '#cbd5e1'
    }).setOrigin(0, 0.5);

    const trackW = width - 110;
    const trackH = 8;
    const trackX = cx - width / 2 + 10;
    const trackY = y + 14;

    const track = this.add.graphics();
    track.fillStyle(0x1e355b, 1);
    track.fillRoundedRect(trackX, trackY - trackH / 2, trackW, trackH, 4);

    const fill = this.add.graphics();
    const updateFill = (v, m) => {
      fill.clear();
      if (!m && v > 0) {
        fill.fillStyle(0x00d8f6, 1);
        fill.fillRoundedRect(trackX, trackY - trackH / 2, trackW * v, trackH, 4);
      }
    };
    updateFill(initialVol, isMuted);

    // Slider knob
    const knob = this.add.circle(trackX + (isMuted ? 0 : trackW * initialVol), trackY, 11, 0xffffff)
      .setInteractive({ useHandCursor: true, draggable: true });

    this.input.setDraggable(knob);
    knob.on('drag', (pointer, dragX) => {
      const clampedX = Math.max(trackX, Math.min(trackX + trackW, dragX));
      knob.x = clampedX;
      const vol = (clampedX - trackX) / trackW;
      updateFill(vol, false);
      onChange(vol, false);
    });

    // Mute toggle button
    const muteBtnW = 68;
    const muteBtnH = 30;
    const muteX = cx + width / 2 - muteBtnW / 2 - 10;
    const muteY = y + 4;

    const muteBg = this.add.graphics();
    const muteTxt = this.add.text(muteX, muteY, isMuted ? 'UNMUTE' : 'MUTE', {
      fontFamily: 'Outfit',
      fontSize: '11px',
      fontWeight: '900',
      color: isMuted ? '#ef4444' : '#94a3b8'
    }).setOrigin(0.5);

    const drawMute = (m) => {
      muteBg.clear();
      muteBg.fillStyle(m ? 0x221215 : 0x0f1a2e, 1);
      muteBg.fillRoundedRect(muteX - muteBtnW / 2, muteY - muteBtnH / 2, muteBtnW, muteBtnH, 6);
      muteBg.lineStyle(1.5, m ? 0xef4444 : 0x1e355b, 1);
      muteBg.strokeRoundedRect(muteX - muteBtnW / 2, muteY - muteBtnH / 2, muteBtnW, muteBtnH, 6);
      muteTxt.setText(m ? 'UNMUTE' : 'MUTE');
      muteTxt.setColor(m ? '#ef4444' : '#94a3b8');
    };
    drawMute(isMuted);

    const muteZone = this.add.zone(muteX, muteY, muteBtnW, muteBtnH).setInteractive({ useHandCursor: true });
    let muted = isMuted;
    muteZone.on('pointerdown', () => {
      muted = !muted;
      drawMute(muted);
      updateFill(initialVol, muted);
      onChange(initialVol, muted);
    });

    this.modalContainer.add([lbl, track, fill, knob, muteBg, muteTxt, muteZone]);
  }

  createToggleRow(cx, y, width, label, initialVal, onChange) {
    const lbl = this.add.text(cx - width / 2 + 10, y, label, {
      fontFamily: 'Outfit',
      fontSize: '15px',
      fontWeight: '800',
      color: '#cbd5e1'
    }).setOrigin(0, 0.5);

    const toggleW = 60;
    const toggleH = 30;
    const toggleX = cx + width / 2 - toggleW / 2 - 10;

    let enabled = initialVal;
    const bg = this.add.graphics();
    const knob = this.add.circle(toggleX + (enabled ? 15 : -15), y, 11, 0xffffff);

    const drawToggle = (en) => {
      bg.clear();
      bg.fillStyle(en ? 0x00d8f6 : 0x1e293b, 1);
      bg.fillRoundedRect(toggleX - toggleW / 2, y - toggleH / 2, toggleW, toggleH, 15);
      knob.x = toggleX + (en ? 14 : -14);
    };
    drawToggle(enabled);

    const zone = this.add.zone(toggleX, y, toggleW, toggleH).setInteractive({ useHandCursor: true });
    zone.on('pointerdown', () => {
      enabled = !enabled;
      drawToggle(enabled);
      onChange(enabled);
    });

    this.modalContainer.add([lbl, bg, knob, zone]);
  }
}
