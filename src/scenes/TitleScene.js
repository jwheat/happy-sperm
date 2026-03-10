import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene');
  }

  create() {
    // Scrolling background
    this.bg = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'bgTile')
      .setOrigin(0, 0);

    // Title
    this.add.text(GAME_WIDTH / 2, 160, 'HAPPY SPERM', {
      fontSize: '48px',
      fontFamily: '"Rubik Wet Paint"',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(GAME_WIDTH / 2, 220, 'The Ultimate Fight To Save The Human Race!', {
      fontSize: '18px',
      fontFamily: 'Bungee',
      color: '#ff88aa',
    }).setOrigin(0.5);

    // Animated sperm on title screen
    this.sperm = this.add.image(GAME_WIDTH / 2, 340, 'player').setScale(2);

    // Instructions
    this.add.text(GAME_WIDTH / 2, 460, 'Arrow Keys / WASD to move', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#aaaaaa',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 485, 'SPACE to shoot', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#aaaaaa',
    }).setOrigin(0.5);

    // Start prompt
    this.startText = this.add.text(GAME_WIDTH / 2, 560, 'Press ENTER or SPACE to start', {
      fontSize: '16px',
      fontFamily: 'Bungee',
      color: '#ffff88',
    }).setOrigin(0.5);

    // Blink start text
    this.tweens.add({
      targets: this.startText,
      alpha: 0.3,
      duration: 600,
      yoyo: true,
      repeat: -1,
    });

    // Float the sperm
    this.tweens.add({
      targets: this.sperm,
      y: 360,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Start title music
    const music = this.registry.get('music');
    if (music) music.play('title');

    // Input
    this.input.keyboard.on('keydown-ENTER', this.startGame, this);
    this.input.keyboard.on('keydown-SPACE', this.startGame, this);

    // Clean up on shutdown
    this.events.once('shutdown', () => {
      this.input.keyboard.removeAllListeners();
    });
  }

  startGame() {
    this.scene.start('GameScene', { stage: 0, score: 0, lives: 3 });
  }

  update() {
    this.bg.tilePositionY -= 0.5;
  }
}
