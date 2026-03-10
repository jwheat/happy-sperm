import { GAME_WIDTH, GAME_HEIGHT, STAGES } from '../config.js';

export class HudScene extends Phaser.Scene {
  constructor() {
    super('HudScene');
  }

  init(data) {
    this.gameScene = data.gameScene || this.scene.get('GameScene');
    this.currentStage = data.stage || 0;
  }

  create() {
    const textStyle = {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#ffffff',
    };

    // Score
    this.scoreText = this.add.text(10, 8, 'SCORE: 0', textStyle);

    // Lives
    this.livesText = this.add.text(GAME_WIDTH - 10, 8, 'LIVES: 3', textStyle)
      .setOrigin(1, 0);

    // Stage name
    const stage = STAGES[this.currentStage] || STAGES[0];
    this.stageText = this.add.text(GAME_WIDTH / 2, 8, stage.name, {
      ...textStyle,
      color: '#ffff88',
    }).setOrigin(0.5, 0);

    // Progress bar (distance through stage)
    this.progressBg = this.add.rectangle(GAME_WIDTH / 2, 28, 200, 6, 0x333333)
      .setOrigin(0.5, 0.5);
    this.progressBar = this.add.rectangle(
      GAME_WIDTH / 2 - 100, 28, 0, 6, 0x44ff44
    ).setOrigin(0, 0.5);

    // Center message
    this.messageText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT * 0.35, '', {
      fontSize: '24px',
      fontFamily: 'monospace',
      color: '#ffff44',
      fontStyle: 'bold',
    }).setOrigin(0.5).setAlpha(0);

    // Stage timer
    this.timerText = this.add.text(GAME_WIDTH - 10, GAME_HEIGHT - 24, '0:00', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#aaaaaa',
    }).setOrigin(1, 0);

    // Powerup indicators
    this.powerupText = this.add.text(10, GAME_HEIGHT - 24, '', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#44ffff',
    });

    // Named handler functions so we can remove them later
    const gs = this.gameScene;

    this.onScoreChanged = (score) => {
      this.scoreText.setText(`SCORE: ${score}`);
    };

    this.onLivesChanged = (lives) => {
      this.livesText.setText(`LIVES: ${lives}`);
      if (lives <= 1) {
        this.livesText.setColor('#ff4444');
      }
    };

    this.onProgressChanged = (pct) => {
      const width = Math.min(pct, 1) * 200;
      this.progressBar.setSize(width, 6);
    };

    this.onShowMessage = (msg) => {
      this.showMessage(msg);
    };

    this.onPowerupChanged = () => {
      this.updatePowerupDisplay();
    };

    this.onTimerChanged = (stageTime, totalTime) => {
      const mins = Math.floor(stageTime / 60);
      const secs = Math.floor(stageTime % 60);
      this.timerText.setText(`${mins}:${String(secs).padStart(2, '0')}`);
    };

    gs.events.on('scoreChanged', this.onScoreChanged);
    gs.events.on('livesChanged', this.onLivesChanged);
    gs.events.on('progressChanged', this.onProgressChanged);
    gs.events.on('showMessage', this.onShowMessage);
    gs.events.on('powerupChanged', this.onPowerupChanged);
    gs.events.on('timerChanged', this.onTimerChanged);

    // Clean up listeners on GameScene's emitter when HudScene shuts down
    this.events.once('shutdown', () => {
      gs.events.off('scoreChanged', this.onScoreChanged);
      gs.events.off('livesChanged', this.onLivesChanged);
      gs.events.off('progressChanged', this.onProgressChanged);
      gs.events.off('showMessage', this.onShowMessage);
      gs.events.off('powerupChanged', this.onPowerupChanged);
      gs.events.off('timerChanged', this.onTimerChanged);
    });

    // Stage entrance animation
    this.showMessage(stage.name);
  }

  showMessage(text) {
    this.messageText.setText(text).setAlpha(1);
    this.tweens.killTweensOf(this.messageText);
    this.tweens.add({
      targets: this.messageText,
      alpha: 0,
      y: GAME_HEIGHT * 0.3,
      duration: 2000,
      ease: 'Power2',
      onComplete: () => {
        this.messageText.setY(GAME_HEIGHT * 0.35);
      },
    });
  }

  updatePowerupDisplay() {
    const gs = this.gameScene;
    if (!gs.player) return;
    const active = [];
    const p = gs.player.powerups;
    if (p.speedBoost) active.push('SPEED');
    if (p.rapidFire) active.push('RAPID');
    if (p.shield) active.push('SHIELD');
    if (p.tripleShot) active.push('TRIPLE');
    this.powerupText.setText(active.join(' | '));
  }

  update() {
    this.updatePowerupDisplay();
  }
}
