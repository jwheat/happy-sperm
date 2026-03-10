import { GAME_WIDTH, GAME_HEIGHT, STAGES, POWERUP_TYPES } from '../config.js';

const POWERUP_BAR_COLORS = {
  speedBoost: 0x44ff44,
  rapidFire:  0xff4444,
  shield:     0x4488ff,
  tripleShot: 0xff44ff,
};

const POWERUP_LABELS = {
  speedBoost: 'SPD',
  rapidFire:  'RAP',
  shield:     'SHD',
  tripleShot: 'TRI',
};

const POWERUP_CONFIG_KEYS = {
  speedBoost: 'SPEED_BOOST',
  rapidFire:  'RAPID_FIRE',
  shield:     'SHIELD',
  tripleShot: 'TRIPLE_SHOT',
};

const BAR_WIDTH = 100;
const BAR_HEIGHT = 8;
const BAR_SPACING = 14;
const BAR_TOP = 40;

export class HudScene extends Phaser.Scene {
  constructor() {
    super('HudScene');
  }

  init(data) {
    this.gameScene = data.gameScene || this.scene.get('GameScene');
    this.currentStage = data.stage || 0;
  }

  create() {
    // Semi-transparent background panel behind top HUD
    this.hudBg = this.add.rectangle(0, 0, GAME_WIDTH, 36, 0x000000, 0.45)
      .setOrigin(0, 0);

    const textStyle = {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#ffffff',
    };

    // Score
    this.scoreText = this.add.text(10, 8, 'SCORE: 0', textStyle);

    // Lives (sperm icons)
    this.livesIcons = [];
    this.maxLives = 5; // max we'll ever show
    for (let i = 0; i < this.maxLives; i++) {
      const icon = this.add.image(
        GAME_WIDTH - 12 - i * 20, 16, 'player'
      ).setScale(0.35).setOrigin(1, 0.5);
      icon.setVisible(false);
      this.livesIcons.push(icon);
    }

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

    // Powerup timer bars
    this.powerupBarsBg = this.add.rectangle(0, 34, 140, 4 * BAR_SPACING + 4, 0x000000, 0.45)
      .setOrigin(0, 0).setAlpha(0);
    this.powerupBars = {};
    const barKeys = ['speedBoost', 'rapidFire', 'shield', 'tripleShot'];
    barKeys.forEach((key, i) => {
      const y = BAR_TOP + i * BAR_SPACING;
      const label = this.add.text(8, y, POWERUP_LABELS[key], {
        fontSize: '9px',
        fontFamily: 'monospace',
        color: '#' + POWERUP_BAR_COLORS[key].toString(16).padStart(6, '0'),
      }).setOrigin(0, 0.5).setAlpha(0);

      const bg = this.add.rectangle(32, y, BAR_WIDTH, BAR_HEIGHT, 0x222222)
        .setOrigin(0, 0.5).setAlpha(0);
      const fill = this.add.rectangle(32, y, BAR_WIDTH, BAR_HEIGHT, POWERUP_BAR_COLORS[key])
        .setOrigin(0, 0.5).setAlpha(0);

      this.powerupBars[key] = { label, bg, fill, active: false };
    });

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

    // Named handler functions so we can remove them later
    const gs = this.gameScene;

    this.onScoreChanged = (score) => {
      this.scoreText.setText(`SCORE: ${score}`);
    };

    this.onLivesChanged = (lives) => {
      for (let i = 0; i < this.maxLives; i++) {
        this.livesIcons[i].setVisible(i < lives);
      }
      // Tint last life red as a warning
      if (lives === 1) {
        this.livesIcons[0].setTint(0xff4444);
      } else {
        this.livesIcons.forEach((icon) => icon.clearTint());
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
      // handled in update
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

    // Set initial lives display
    if (gs.lives !== undefined) {
      this.onLivesChanged(gs.lives);
    }

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

  update() {
    const gs = this.gameScene;
    if (!gs.player) return;

    const player = gs.player;

    // Update powerup timer bars
    for (const key of Object.keys(this.powerupBars)) {
      const bar = this.powerupBars[key];
      const isActive = player.powerups[key];

      if (isActive && player.powerupTimers[key]) {
        const timer = player.powerupTimers[key];
        const elapsed = timer.getElapsed();
        const total = timer.delay;
        const remaining = Math.max(0, 1 - elapsed / total);

        bar.label.setAlpha(1);
        bar.bg.setAlpha(0.6);
        bar.fill.setAlpha(0.9);
        bar.fill.setSize(BAR_WIDTH * remaining, BAR_HEIGHT);

        // Flash when almost expired (last 20%)
        if (remaining < 0.2) {
          bar.fill.setAlpha(Math.sin(elapsed * 0.01) * 0.4 + 0.5);
        }

        bar.active = true;
      } else if (bar.active) {
        // Just expired — hide
        bar.label.setAlpha(0);
        bar.bg.setAlpha(0);
        bar.fill.setAlpha(0);
        bar.active = false;
      }
    }

    // Show/hide powerup panel background
    const anyActive = Object.values(this.powerupBars).some((b) => b.active);
    this.powerupBarsBg.setAlpha(anyActive ? 1 : 0);
  }
}
