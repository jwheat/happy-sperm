import { GAME_WIDTH, GAME_HEIGHT, STAGES } from '../config.js';

export class StageClearScene extends Phaser.Scene {
  constructor() {
    super('StageClearScene');
  }

  init(data) {
    this.nextStage = data.stage;
    this.score = data.score;
    this.lives = data.lives;
    this.advanced = false;
  }

  create() {
    const clearedStage = STAGES[this.nextStage - 1];
    const nextStage = STAGES[this.nextStage];

    // Plain background (no TileSprite to avoid drawImage corruption)
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x1a0a2e);

    this.add.text(GAME_WIDTH / 2, 260, `${clearedStage.name} cleared!`, {
      fontSize: '28px',
      fontFamily: 'monospace',
      color: '#44ff44',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    if (nextStage) {
      this.add.text(GAME_WIDTH / 2, 320, `Next: ${nextStage.name}`, {
        fontSize: '18px',
        fontFamily: 'monospace',
        color: '#ffff88',
      }).setOrigin(0.5);
    }

    this.add.text(GAME_WIDTH / 2, 420, `Score: ${this.score}`, {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 450, `Lives: ${this.lives}`, {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#ffffff',
    }).setOrigin(0.5);

    const promptText = this.add.text(GAME_WIDTH / 2, 520, 'Press ENTER to continue', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#ffff88',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: promptText,
      alpha: 0.3,
      duration: 600,
      yoyo: true,
      repeat: -1,
    });

    this.input.keyboard.on('keydown-ENTER', this.advance, this);
    this.input.keyboard.on('keydown-SPACE', this.advance, this);

    this.events.once('shutdown', () => {
      this.input.keyboard.off('keydown-ENTER', this.advance, this);
      this.input.keyboard.off('keydown-SPACE', this.advance, this);
    });
  }

  advance() {
    if (this.advanced) return;
    this.advanced = true;
    this.scene.start('GameScene', {
      stage: this.nextStage,
      score: this.score,
      lives: this.lives,
    });
  }
}
