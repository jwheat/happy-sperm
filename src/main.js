import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './config.js';
import { BootScene } from './scenes/BootScene.js';
import { TitleScene } from './scenes/TitleScene.js';
import { GameScene } from './scenes/GameScene.js';
import { HudScene } from './scenes/HudScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';
import { StageClearScene } from './scenes/StageClearScene.js';
import { BonusRoundScene } from './scenes/BonusRoundScene.js';
import { InstructionsScene } from './scenes/InstructionsScene.js';

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#1a0a2e',
  input: {
    activePointers: 3,  // support simultaneous joystick + fire button
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      // debug: true,
    },
  },
  scene: [BootScene, TitleScene, InstructionsScene, GameScene, HudScene, GameOverScene, StageClearScene, BonusRoundScene],
};

const game = new Phaser.Game(config);

// Mute audio when tab loses focus, resume when it returns
document.addEventListener('visibilitychange', () => {
  if (!game.sound || !game.sound.context) return;
  if (document.hidden) {
    game.sound.context.suspend();
  } else {
    game.sound.context.resume();
  }
});
