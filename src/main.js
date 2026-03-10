import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './config.js';
import { BootScene } from './scenes/BootScene.js';
import { TitleScene } from './scenes/TitleScene.js';
import { GameScene } from './scenes/GameScene.js';
import { HudScene } from './scenes/HudScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#1a0a2e',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      // debug: true,
    },
  },
  scene: [BootScene, TitleScene, GameScene, HudScene, GameOverScene],
};

new Phaser.Game(config);
