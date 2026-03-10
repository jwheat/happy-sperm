import { GAME_WIDTH, GAME_HEIGHT, STAGES } from '../config.js';

// Star rating thresholds — earn stars based on kills
// 1 star: completed the stage
// 2 stars: killed at least KILLS_2_STAR enemies
// 3 stars: killed at least KILLS_3_STAR enemies
const KILLS_2_STAR = 25;
const KILLS_3_STAR = 50;

export class StageClearScene extends Phaser.Scene {
  constructor() {
    super('StageClearScene');
  }

  init(data) {
    this.nextStage = data.stage;
    this.score = data.score;
    this.lives = data.lives;
    this.totalTime = data.totalTime || 0;
    this.stageTime = data.stageTime || 0;
    this.stats = data.stats || {};
    this.advanced = false;
  }

  create() {
    const clearedStage = STAGES[this.nextStage - 1];
    const nextStage = STAGES[this.nextStage];

    // Plain background
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x1a0a2e);

    // Title
    this.add.text(GAME_WIDTH / 2, 60, `${clearedStage.name}`, {
      fontSize: '28px',
      fontFamily: 'Bungee',
      color: '#44ff44',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 95, 'CLEARED!', {
      fontSize: '18px',
      fontFamily: 'Bungee',
      color: '#88ff88',
    }).setOrigin(0.5);

    // Star rating
    const stars = this.calculateStars();
    this.displayStars(stars, GAME_WIDTH / 2, 150);

    // Stats panel
    const panelTop = 200;
    const panelBg = this.add.rectangle(GAME_WIDTH / 2, panelTop + 100, 340, 220, 0x000000, 0.4)
      .setOrigin(0.5);

    const labelStyle = {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#aaaaaa',
    };
    const valueStyle = {
      fontSize: '14px',
      fontFamily: 'Audiowide',
      color: '#ffffff',
    };

    const statRows = [
      ['Enemies Killed', `${this.stats.enemiesKilled || 0}`],
      ['Powerups Collected', `${this.stats.powerupsCollected || 0}`],
      ['Distance Traveled', `${Math.floor((this.stats.distanceTraveled || 0) / 100)}m`],
      ['Stage Time', this.formatTime(this.stageTime)],
      ['Stage Score', `${this.stats.stageScore || 0}`],
    ];

    statRows.forEach(([label, value], i) => {
      const y = panelTop + 20 + i * 36;
      this.add.text(GAME_WIDTH / 2 - 155, y, label, labelStyle);
      this.add.text(GAME_WIDTH / 2 + 155, y, value, valueStyle).setOrigin(1, 0);
    });

    // Total score and lives
    const bottomY = panelTop + 230;
    this.add.text(GAME_WIDTH / 2, bottomY, `Total: ${String(this.score).padStart(6, '0')}`, {
      fontSize: '18px',
      fontFamily: 'Audiowide',
      color: '#ffff88',
    }).setOrigin(0.5);

    // Lives as sperm icons
    const livesY = bottomY + 35;
    this.add.text(GAME_WIDTH / 2 - 60, livesY, 'Lives:', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#aaaaaa',
    }).setOrigin(0, 0.5);
    for (let i = 0; i < this.lives; i++) {
      this.add.image(GAME_WIDTH / 2 - 10 + i * 22, livesY, 'player')
        .setScale(0.35).setOrigin(0, 0.5);
    }

    // Next stage
    if (nextStage) {
      this.add.text(GAME_WIDTH / 2, bottomY + 75, `Next: ${nextStage.name}`, {
        fontSize: '16px',
        fontFamily: 'Bungee',
        color: '#ffff88',
      }).setOrigin(0.5);
    }

    // Continue prompt
    const promptText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 60, 'Press ENTER to continue', {
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

  calculateStars() {
    const kills = this.stats.enemiesKilled || 0;
    if (kills >= KILLS_3_STAR) return 3;
    if (kills >= KILLS_2_STAR) return 2;
    return 1;
  }

  displayStars(count, cx, y) {
    const spacing = 50;
    const startX = cx - spacing;

    for (let i = 0; i < 3; i++) {
      const earned = i < count;
      const star = this.add.image(startX + i * spacing, y, earned ? 'starFull' : 'starEmpty');

      if (earned) {
        // Animate stars popping in with delay
        star.setScale(0);
        this.tweens.add({
          targets: star,
          scaleX: 1.2,
          scaleY: 1.2,
          duration: 300,
          delay: 200 + i * 250,
          ease: 'Back.easeOut',
          onComplete: () => {
            this.tweens.add({
              targets: star,
              scaleX: 1,
              scaleY: 1,
              duration: 150,
            });
          },
        });
      }
    }
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${String(secs).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
  }

  advance() {
    if (this.advanced) return;
    this.advanced = true;
    this.scene.start('GameScene', {
      stage: this.nextStage,
      score: this.score,
      lives: this.lives,
      totalTime: this.totalTime,
    });
  }
}
