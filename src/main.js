import Phaser from 'phaser';
import { inject } from '@vercel/analytics';
import { StartScene } from './scenes/StartScene.js';
import { GameScene } from './scenes/GameScene.js';
import { ResultOverlay } from './scenes/ResultOverlay.js';
import { LeaderboardScene } from './scenes/LeaderboardScene.js';
import { SettingsScene } from './scenes/SettingsScene.js';

// Initialize Vercel Web Analytics
inject();

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: '#060913',
  scale: {
    mode: Phaser.Scale.RESIZE,
    parent: 'game-container',
    width: '100%',
    height: '100%'
  },
  render: {
    pixelArt: false,
    antialias: true,
    roundPixels: false
  },
  input: {
    activePointers: 5,
    touch: {
      capture: true
    }
  },
  scene: [StartScene, GameScene, ResultOverlay, LeaderboardScene, SettingsScene]
};

window.addEventListener('DOMContentLoaded', () => {
  window.__game = new Phaser.Game(config);
});
