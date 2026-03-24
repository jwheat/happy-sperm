import { GAME_WIDTH, GAME_HEIGHT, ENEMY_TYPES, POWERUP_TYPES } from '../config.js';

export class InstructionsScene extends Phaser.Scene {
  constructor() {
    super('InstructionsScene');
  }

  create() {
    // Background
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x1a0a2e);

    const headerStyle = {
      fontSize: '20px',
      fontFamily: 'Bungee',
      color: '#ffff88',
    };
    const labelStyle = {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#ffffff',
    };
    const dimStyle = {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: '#aaaaaa',
    };
    const scoreStyle = {
      fontSize: '12px',
      fontFamily: 'Audiowide',
      color: '#ffdd44',
    };

    // Title
    this.add.text(GAME_WIDTH / 2, 30, 'HOW TO PLAY', headerStyle).setOrigin(0.5);

    // Controls
    let y = 65;
    this.add.text(GAME_WIDTH / 2, y, 'CONTROLS', {
      fontSize: '14px', fontFamily: 'Bungee', color: '#44ffff',
    }).setOrigin(0.5);
    y += 25;
    this.add.text(GAME_WIDTH / 2, y, 'Arrow Keys / WASD to move', dimStyle).setOrigin(0.5);
    y += 18;
    this.add.text(GAME_WIDTH / 2, y, 'SPACE to shoot', dimStyle).setOrigin(0.5);
    y += 18;
    this.add.text(GAME_WIDTH / 2, y, 'Move up to scroll faster  •  Collect powerups to survive', dimStyle).setOrigin(0.5);

    // Enemies section
    y += 35;
    this.add.text(GAME_WIDTH / 2, y, 'ENEMIES', {
      fontSize: '14px', fontFamily: 'Bungee', color: '#ff4444',
    }).setOrigin(0.5);
    y += 25;

    const enemies = [
      { key: 'whiteBloodCell', name: 'White Blood Cell', desc: 'Tough, slow drifter', hp: ENEMY_TYPES.WHITE_BLOOD_CELL.hp, score: ENEMY_TYPES.WHITE_BLOOD_CELL.score },
      { key: 'antibody', name: 'Antibody', desc: 'Fast zigzag pattern', hp: ENEMY_TYPES.ANTIBODY.hp, score: ENEMY_TYPES.ANTIBODY.score },
      { key: 'rivalSperm', name: 'Rival Sperm', desc: 'Chases you down', hp: ENEMY_TYPES.RIVAL_SPERM.hp, score: ENEMY_TYPES.RIVAL_SPERM.score },
      { key: 'mucusBlob', name: 'Mucus Blob', desc: 'Tanky, shoots back', hp: ENEMY_TYPES.MUCUS_BLOB.hp, score: ENEMY_TYPES.MUCUS_BLOB.score },
    ];

    enemies.forEach((e) => {
      this.add.image(40, y, e.key).setScale(0.8).setOrigin(0.5);
      this.add.text(65, y - 8, e.name, labelStyle).setOrigin(0, 0);
      this.add.text(65, y + 7, e.desc, dimStyle).setOrigin(0, 0);
      this.add.text(GAME_WIDTH - 20, y - 8, `${e.score} pts`, scoreStyle).setOrigin(1, 0);
      this.add.text(GAME_WIDTH - 20, y + 7, `HP: ${e.hp}`, dimStyle).setOrigin(1, 0);
      y += 40;
    });

    // Powerups section
    y += 10;
    this.add.text(GAME_WIDTH / 2, y, 'POWER-UPS', {
      fontSize: '14px', fontFamily: 'Bungee', color: '#44ff44',
    }).setOrigin(0.5);
    y += 25;

    const powerups = [
      { key: 'energy', name: 'Energy', desc: `+${POWERUP_TYPES.ENERGY.score} points`, color: '#ffff44' },
      { key: 'speedBoost', name: 'Speed Boost', desc: `${POWERUP_TYPES.SPEED_BOOST.duration / 1000}s faster movement & scroll`, color: '#44ffff' },
      { key: 'rapidFire', name: 'Rapid Fire', desc: `${POWERUP_TYPES.RAPID_FIRE.duration / 1000}s machine gun`, color: '#ff4444' },
      { key: 'shieldPickup', name: 'Shield', desc: `${POWERUP_TYPES.SHIELD.duration / 1000}s absorbs one hit`, color: '#4488ff' },
      { key: 'tripleShot', name: 'Triple Shot', desc: `${POWERUP_TYPES.TRIPLE_SHOT.duration / 1000}s three-way fire`, color: '#ff44ff' },
    ];

    powerups.forEach((p) => {
      this.add.image(40, y, p.key).setScale(1).setOrigin(0.5);
      this.add.text(65, y - 8, p.name, { ...labelStyle, color: p.color }).setOrigin(0, 0);
      this.add.text(65, y + 7, p.desc, dimStyle).setOrigin(0, 0);
      y += 35;
    });

    // Goal
    y += 10;
    this.add.text(GAME_WIDTH / 2, y, 'Survive all 4 stages and reach the egg!', {
      fontSize: '12px', fontFamily: 'Bungee', color: '#ff88aa',
    }).setOrigin(0.5);

    // Back prompt
    const backText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 35, 'Press any key to return', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#ffff88',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: backText,
      alpha: 0.3,
      duration: 600,
      yoyo: true,
      repeat: -1,
    });

    this.goBack = () => {
      this.scene.start('TitleScene');
    };
    this.input.keyboard.on('keydown', this.goBack, this);
    this.input.on('pointerdown', this.goBack, this);

    this.events.once('shutdown', () => {
      this.input.keyboard.off('keydown', this.goBack, this);
      this.input.off('pointerdown', this.goBack, this);
    });
  }
}
