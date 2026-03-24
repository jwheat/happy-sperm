import { GAME_WIDTH, GAME_HEIGHT, STAGES, PLAYER_LIVES } from '../config.js';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  init(data) {
    this.win = data.win || false;
    this.finalScore = data.score || 0;
    this.finalStage = data.stage || 0;
    this.totalTime = data.totalTime || 0;
  }

  create() {
    // Background
    this.bg = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'bgTile')
      .setOrigin(0, 0);

    // Play appropriate music
    const music = this.registry.get('music');
    if (music) music.play(this.win ? 'victory' : 'gameOver');

    if (this.win) {
      this.add.text(GAME_WIDTH / 2, 140, 'FERTILIZED!', {
        fontSize: '42px',
        fontFamily: 'monospace',
        color: '#ffff44',
        fontStyle: 'bold',
      }).setOrigin(0.5);

      this.add.text(GAME_WIDTH / 2, 200, 'You made it to the egg!', {
        fontSize: '16px',
        fontFamily: 'monospace',
        color: '#88ff88',
      }).setOrigin(0.5);

      // Egg
      const egg = this.add.image(GAME_WIDTH / 2, 310, 'egg').setScale(1.5);
      this.tweens.add({
        targets: egg,
        scaleX: 1.7,
        scaleY: 1.7,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    } else {
      this.add.text(GAME_WIDTH / 2, 140, 'GAME OVER', {
        fontSize: '42px',
        fontFamily: 'monospace',
        color: '#ff4444',
        fontStyle: 'bold',
      }).setOrigin(0.5);

      const stageName = STAGES[this.finalStage]?.name || 'Unknown';
      this.add.text(GAME_WIDTH / 2, 200, `Died in: ${stageName}`, {
        fontSize: '16px',
        fontFamily: 'monospace',
        color: '#ff8888',
      }).setOrigin(0.5);
    }

    // Score
    this.add.text(GAME_WIDTH / 2, 410, `Final Score: ${this.finalScore}`, {
      fontSize: '22px',
      fontFamily: 'monospace',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Total time
    const mins = Math.floor(this.totalTime / 60);
    const secs = Math.floor(this.totalTime % 60);
    const ms = Math.floor((this.totalTime % 1) * 100);
    this.add.text(GAME_WIDTH / 2, 450, `Time: ${mins}:${String(secs).padStart(2, '0')}.${String(ms).padStart(2, '0')}`, {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#44ffff',
    }).setOrigin(0.5);

    // Restart prompt
    const restartText = this.add.text(
      GAME_WIDTH / 2,
      520,
      this.win ? 'Press ENTER to play again' : 'Press ENTER to try again',
      {
        fontSize: '16px',
        fontFamily: 'monospace',
        color: '#ffff88',
      }
    ).setOrigin(0.5);

    this.tweens.add({
      targets: restartText,
      alpha: 0.3,
      duration: 600,
      yoyo: true,
      repeat: -1,
    });

    this.handleEnter = () => {
      if (this.win) {
        this.scene.start('GameScene', { stage: 0, score: 0, lives: PLAYER_LIVES });
      } else {
        this.scene.start('GameScene', { stage: this.finalStage, score: 0, lives: PLAYER_LIVES });
      }
    };
    this.handleSpace = () => {
      this.scene.start('TitleScene');
    };
    this.input.keyboard.on('keydown-ENTER', this.handleEnter, this);
    this.input.keyboard.on('keydown-SPACE', this.handleSpace, this);
    this.input.on('pointerdown', this.handleEnter, this);

    this.add.text(GAME_WIDTH / 2, 560, 'SPACE for title screen', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#888888',
    }).setOrigin(0.5);

    // Clean up on shutdown
    this.events.once('shutdown', () => {
      this.input.keyboard.off('keydown-ENTER', this.handleEnter, this);
      this.input.keyboard.off('keydown-SPACE', this.handleSpace, this);
      this.input.off('pointerdown', this.handleEnter, this);
    });
  }

  update() {
    this.bg.tilePositionY -= 0.3;
  }
}
