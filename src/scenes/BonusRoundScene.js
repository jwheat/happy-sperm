import {
  GAME_WIDTH,
  GAME_HEIGHT,
  PLAYER_BULLET_SPEED,
  ENEMY_BULLET_SPEED,
  BULLET_POOL_SIZE,
  ENEMY_BULLET_POOL_SIZE,
  BONUS_WAVE_COUNT,
  BONUS_WAVE_SPACING,
  BONUS_GATE_MIN_WIDTH,
  BONUS_GATE_MAX_WIDTH,
  BONUS_WALL_HEIGHT,
  BONUS_TURRET_HP,
  BONUS_TURRET_FIRE_RATE,
  BONUS_TURRET_SCORE,
  BONUS_SCORE_MULTIPLIER,
  BONUS_COMPLETE_SCORE,
  BONUS_SCROLL_SPEED,
  STAGES,
} from '../config.js';

import { Player } from '../entities/Player.js';
import { Bullet } from '../entities/Bullet.js';
import { TouchControls } from '../ui/TouchControls.js';

export class BonusRoundScene extends Phaser.Scene {
  constructor() {
    super('BonusRoundScene');
  }

  init(data) {
    this.nextStage = data.stage;
    this.score = data.score;
    this.lives = data.lives;
    this.totalTime = data.totalTime || 0;
    this.bonusOver = false;
    this.bonusScore = 0;
    this.wavesCleared = 0;
  }

  create() {
    const stageIndex = Math.max(0, this.nextStage - 1);
    const stage = STAGES[stageIndex] || STAGES[0];

    // Background
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0a0a1e);

    // Scrolling stars
    this.bgGraphics = this.add.graphics().setDepth(-1);
    this.bgStars = [];
    for (let i = 0; i < 40; i++) {
      this.bgStars.push({
        x: Phaser.Math.Between(0, GAME_WIDTH),
        y: Phaser.Math.Between(0, GAME_HEIGHT),
        size: Phaser.Math.Between(1, 2),
        speed: Phaser.Math.Between(20, 60),
      });
    }

    // Player
    this.player = new Player(this, GAME_WIDTH / 2, GAME_HEIGHT - 80);

    // Touch controls
    this.touchControls = new TouchControls(this);
    this.player.touchControls = this.touchControls;

    // Bullet pools
    this.playerBullets = this.physics.add.group({
      classType: Bullet,
      maxSize: BULLET_POOL_SIZE,
      runChildUpdate: false,
    });
    for (let i = 0; i < BULLET_POOL_SIZE; i++) {
      this.playerBullets.add(new Bullet(this, 0, 0, 'playerBullet'));
    }

    this.turretBullets = this.physics.add.group({
      classType: Bullet,
      maxSize: ENEMY_BULLET_POOL_SIZE,
      runChildUpdate: false,
    });
    for (let i = 0; i < ENEMY_BULLET_POOL_SIZE; i++) {
      this.turretBullets.add(new Bullet(this, 0, 0, 'enemyBullet'));
    }

    // Explosion particles
    this.explosionEmitter = this.add.particles(0, 0, 'particle', {
      speed: { min: 50, max: 200 },
      lifespan: 400,
      quantity: 12,
      scale: { start: 1, end: 0 },
      emitting: false,
    });

    // Generate waves — each wave has wall rects, turret sprites, and a gate
    this.waves = [];
    for (let i = 0; i < BONUS_WAVE_COUNT; i++) {
      this.generateWave(i, stage.color);
    }

    // Wall graphics overlay
    this.wallGraphics = this.add.graphics().setDepth(0);

    // Player vs turret bullets
    this.physics.add.overlap(
      this.turretBullets, this.player,
      this.onPlayerHit, null, this
    );

    // HUD
    this.add.rectangle(0, 0, GAME_WIDTH, 32, 0x000000, 0.5).setOrigin(0, 0).setDepth(10);

    this.headerText = this.add.text(GAME_WIDTH / 2, 8, 'BONUS ROUND', {
      fontSize: '16px',
      fontFamily: 'Bungee',
      color: '#ffdd44',
    }).setOrigin(0.5, 0).setDepth(10);

    this.tweens.add({
      targets: this.headerText,
      alpha: 0.4,
      duration: 400,
      yoyo: true,
      repeat: 3,
      onComplete: () => { this.headerText.setAlpha(1); },
    });

    this.bonusScoreText = this.add.text(10, 8, '0', {
      fontSize: '14px',
      fontFamily: 'Audiowide',
      color: '#ffffff',
    }).setDepth(10);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 16, 'ESC to skip', {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#555555',
    }).setOrigin(0.5).setDepth(10);

    this.add.text(GAME_WIDTH - 10, 8, 'x2', {
      fontSize: '14px',
      fontFamily: 'Bungee',
      color: '#ff4444',
    }).setOrigin(1, 0).setDepth(10);

    // Input
    this.skipScene = () => {
      if (this.bonusOver) return;
      this.endBonusRound(false);
    };
    this.input.keyboard.on('keydown-ESC', this.skipScene, this);

    this.events.once('shutdown', () => {
      this.input.keyboard.off('keydown-ESC', this.skipScene, this);
      this.input.keyboard.removeAllKeys(true);
      if (this.touchControls) this.touchControls.destroy();
    });

    if (this.cache.audio.exists('sfxPowerup')) {
      this.sound.play('sfxPowerup', { volume: 0.3 });
    }
  }

  generateWave(index, wallColor) {
    const gateWidth = Phaser.Math.Between(BONUS_GATE_MIN_WIDTH, BONUS_GATE_MAX_WIDTH);
    const gateX = Phaser.Math.Between(60, GAME_WIDTH - 60 - gateWidth);
    const startY = -(index + 1) * BONUS_WAVE_SPACING;

    const wave = {
      y: startY,
      gateX,
      gateWidth,
      wallColor,
      cleared: false,
      turrets: [],
      // Wall collision rects — created as dynamic, immovable bodies
      wallRects: [],
    };

    // Left wall segment
    const leftWidth = gateX;
    if (leftWidth > 10) {
      const rect = this.add.rectangle(leftWidth / 2, startY, leftWidth, BONUS_WALL_HEIGHT);
      rect.setVisible(false);
      this.physics.add.existing(rect, false);
      rect.body.immovable = true;
      rect.body.allowGravity = false;
      wave.wallRects.push(rect);
      this.physics.add.collider(this.player, rect);

      if (leftWidth > 50) {
        this.createTurret(leftWidth / 2, startY + BONUS_WALL_HEIGHT / 2 + 16, wave);
      }
    }

    // Right wall segment
    const rightX = gateX + gateWidth;
    const rightWidth = GAME_WIDTH - rightX;
    if (rightWidth > 10) {
      const rect = this.add.rectangle(rightX + rightWidth / 2, startY, rightWidth, BONUS_WALL_HEIGHT);
      rect.setVisible(false);
      this.physics.add.existing(rect, false);
      rect.body.immovable = true;
      rect.body.allowGravity = false;
      wave.wallRects.push(rect);
      this.physics.add.collider(this.player, rect);

      if (rightWidth > 50) {
        this.createTurret(rightX + rightWidth / 2, startY + BONUS_WALL_HEIGHT / 2 + 16, wave);
      }
    }

    this.waves.push(wave);
  }

  createTurret(x, y, wave) {
    const turret = this.add.sprite(x, y, 'turret').setDepth(1);
    this.physics.add.existing(turret, false);
    turret.body.allowGravity = false;
    turret.hp = BONUS_TURRET_HP;
    turret.lastFired = 0;
    turret.alive = true;
    turret.offsetY = y - wave.y;

    // Bullet vs turret collision
    this.physics.add.overlap(
      this.playerBullets, turret,
      this.onBulletHitTurret, null, this
    );

    // Player vs turret collision
    this.physics.add.overlap(
      this.player, turret,
      this.onPlayerHitTurret, null, this
    );

    wave.turrets.push(turret);
  }

  update(time, delta) {
    if (this.bonusOver) return;

    // Scrolling stars
    this.bgGraphics.clear();
    this.bgGraphics.fillStyle(0x444466, 0.6);
    this.bgStars.forEach((star) => {
      star.y += star.speed * (delta / 1000);
      if (star.y > GAME_HEIGHT) {
        star.y = -2;
        star.x = Phaser.Math.Between(0, GAME_WIDTH);
      }
      this.bgGraphics.fillRect(star.x, star.y, star.size, star.size);
    });

    // Player input
    this.player.handleInput(time, this.playerBullets);
    if (this.player.x < 16) this.player.x = 16;
    if (this.player.x > GAME_WIDTH - 16) this.player.x = GAME_WIDTH - 16;

    // Update bullets
    this.playerBullets.getChildren().forEach((b) => b.update(time));
    this.turretBullets.getChildren().forEach((b) => b.update(time));

    // Move waves, walls, turrets — all manually positioned each frame
    this.wallGraphics.clear();
    let allCleared = true;

    this.waves.forEach((wave) => {
      wave.y += BONUS_SCROLL_SPEED * (delta / 1000);

      // Move wall collision rects
      wave.wallRects.forEach((rect) => {
        rect.setY(wave.y);
        if (rect.body) rect.body.updateFromGameObject();
      });

      // Move and update turrets
      wave.turrets.forEach((turret) => {
        if (!turret.active) return;
        turret.setY(wave.y + turret.offsetY);
        if (turret.body) turret.body.updateFromGameObject();

        // Fire at player when on screen
        if (turret.alive && turret.y > 30 && turret.y < GAME_HEIGHT - 30) {
          if (time > turret.lastFired + BONUS_TURRET_FIRE_RATE) {
            this.fireTurret(turret, time);
            turret.lastFired = time;
          }
        }
      });

      // Draw wall visuals
      if (wave.y > -BONUS_WALL_HEIGHT && wave.y < GAME_HEIGHT + BONUS_WALL_HEIGHT) {
        const wy = wave.y - BONUS_WALL_HEIGHT / 2;

        // Left wall
        if (wave.gateX > 10) {
          this.wallGraphics.fillStyle(wave.wallColor, 0.7);
          this.wallGraphics.fillRect(0, wy, wave.gateX, BONUS_WALL_HEIGHT);
          this.wallGraphics.fillStyle(0xffffff, 0.15);
          this.wallGraphics.fillRect(0, wy, wave.gateX, 2);
          this.wallGraphics.fillRect(0, wy + BONUS_WALL_HEIGHT - 2, wave.gateX, 2);
        }

        // Right wall
        const rightX = wave.gateX + wave.gateWidth;
        const rightWidth = GAME_WIDTH - rightX;
        if (rightWidth > 10) {
          this.wallGraphics.fillStyle(wave.wallColor, 0.7);
          this.wallGraphics.fillRect(rightX, wy, rightWidth, BONUS_WALL_HEIGHT);
          this.wallGraphics.fillStyle(0xffffff, 0.15);
          this.wallGraphics.fillRect(rightX, wy, rightWidth, 2);
          this.wallGraphics.fillRect(rightX, wy + BONUS_WALL_HEIGHT - 2, rightWidth, 2);
        }

        // Gate edge markers
        this.wallGraphics.fillStyle(0xffff44, 0.5);
        this.wallGraphics.fillRect(wave.gateX - 3, wy, 3, BONUS_WALL_HEIGHT);
        this.wallGraphics.fillRect(wave.gateX + wave.gateWidth, wy, 3, BONUS_WALL_HEIGHT);
      }

      // Check if wave has scrolled off bottom
      if (wave.y > GAME_HEIGHT + 60 && !wave.cleared) {
        wave.cleared = true;
        this.wavesCleared++;
        // Hide turrets and walls that scrolled off
        wave.turrets.forEach((t) => {
          if (t.active) { t.setActive(false); t.setVisible(false); }
        });
        wave.wallRects.forEach((r) => {
          if (r.body) r.body.enable = false;
        });
      }

      if (!wave.cleared) allCleared = false;
    });

    if (allCleared) {
      this.endBonusRound(true);
    }

    this.bonusScoreText.setText(String(this.bonusScore));
  }

  fireTurret(turret, time) {
    const bullet = this.turretBullets.getFirstDead(false);
    if (!bullet) return;

    bullet.enableBody(true, turret.x, turret.y + 14, true, true);
    const angle = Phaser.Math.Angle.Between(turret.x, turret.y, this.player.x, this.player.y);
    bullet.setVelocity(
      Math.cos(angle) * ENEMY_BULLET_SPEED,
      Math.sin(angle) * ENEMY_BULLET_SPEED
    );
    bullet.birth = time;
    bullet.lifespan = 3000;

    if (this.cache.audio.exists('sfxEnemyShoot')) {
      this.sound.play('sfxEnemyShoot', { volume: 0.2 });
    }
  }

  onBulletHitTurret(bullet, turret) {
    if (!bullet.active || !turret.alive) return;
    bullet.kill();

    turret.hp--;
    turret.setTintFill(0xffffff);
    this.time.delayedCall(80, () => {
      if (turret.alive && turret.active) turret.clearTint();
    });

    if (turret.hp <= 0) {
      turret.alive = false;
      this.explosionEmitter.emitParticleAt(turret.x, turret.y);
      turret.setTexture('turretDead');
      if (turret.body) turret.body.enable = false;

      const points = BONUS_TURRET_SCORE * BONUS_SCORE_MULTIPLIER;
      this.bonusScore += points;
      this.score += points;

      if (this.cache.audio.exists('sfxExplosion')) {
        this.sound.play('sfxExplosion', { volume: 0.4 });
      }

      const pointText = this.add.text(turret.x, turret.y, `+${points}`, {
        fontSize: '14px',
        fontFamily: 'Audiowide',
        color: '#ffdd44',
      }).setOrigin(0.5).setDepth(10);
      this.tweens.add({
        targets: pointText,
        y: turret.y - 40,
        alpha: 0,
        duration: 800,
        onComplete: () => pointText.destroy(),
      });
    }
  }

  onPlayerHit(player, bullet) {
    if (!player.active || !bullet.active || this.bonusOver) return;
    bullet.kill();
    this.endBonusRound(false);
  }

  onPlayerHitTurret(player, turret) {
    if (!player.active || !turret.alive || this.bonusOver) return;
    this.endBonusRound(false);
  }

  endBonusRound(completed) {
    if (this.bonusOver) return;
    this.bonusOver = true;

    if (completed) {
      this.bonusScore += BONUS_COMPLETE_SCORE;
      this.score += BONUS_COMPLETE_SCORE;
      this.cameras.main.flash(500, 100, 255, 100);

      this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, 'BONUS COMPLETE!', {
        fontSize: '24px',
        fontFamily: 'Bungee',
        color: '#44ff44',
      }).setOrigin(0.5).setDepth(20);

      this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20, `+${this.bonusScore} points`, {
        fontSize: '18px',
        fontFamily: 'Audiowide',
        color: '#ffdd44',
      }).setOrigin(0.5).setDepth(20);

      if (this.cache.audio.exists('sfxPowerup')) {
        this.sound.play('sfxPowerup', { volume: 0.5 });
      }
    } else {
      this.cameras.main.shake(300, 0.01);
      this.explosionEmitter.emitParticleAt(this.player.x, this.player.y);
      this.player.setVisible(false);
      if (this.player.body) this.player.body.enable = false;

      if (this.cache.audio.exists('sfxHit')) {
        this.sound.play('sfxHit', { volume: 0.5 });
      }

      this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, 'BONUS ROUND OVER', {
        fontSize: '22px',
        fontFamily: 'Bungee',
        color: '#ff4444',
      }).setOrigin(0.5).setDepth(20);

      if (this.bonusScore > 0) {
        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20, `+${this.bonusScore} points`, {
          fontSize: '18px',
          fontFamily: 'Audiowide',
          color: '#ffdd44',
        }).setOrigin(0.5).setDepth(20);
      }
    }

    this.time.delayedCall(2000, () => {
      this.scene.start('GameScene', {
        stage: this.nextStage,
        score: this.score,
        lives: this.lives,
        totalTime: this.totalTime,
      });
    });
  }
}
