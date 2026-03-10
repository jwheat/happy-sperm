import {
  PLAYER_SPEED,
  PLAYER_FIRE_RATE,
  PLAYER_INVULN_TIME,
  PLAYER_BULLET_SPEED,
  GAME_WIDTH,
  GAME_HEIGHT,
  POWERUP_TYPES,
} from '../config.js';

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.body.setSize(16, 22);
    this.body.setOffset(8, 0);

    this.alive = true;
    this.invulnerable = false;
    this.lastFired = 0;
    this.speed = PLAYER_SPEED;
    this.fireRate = PLAYER_FIRE_RATE;

    // Active powerups
    this.powerups = {
      speedBoost: false,
      rapidFire: false,
      shield: false,
      tripleShot: false,
    };
    this.powerupTimers = {};

    // Input
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasd = {
      up: scene.input.keyboard.addKey('W'),
      down: scene.input.keyboard.addKey('S'),
      left: scene.input.keyboard.addKey('A'),
      right: scene.input.keyboard.addKey('D'),
    };
    this.fireKey = scene.input.keyboard.addKey('SPACE');
  }

  handleInput(time, bulletGroup) {
    if (!this.alive) return;

    const speed = this.powerups.speedBoost ? this.speed * 1.6 : this.speed;

    // Movement
    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.body.setVelocityX(-speed);
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.body.setVelocityX(speed);
    } else {
      this.body.setVelocityX(0);
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      this.body.setVelocityY(-speed);
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      this.body.setVelocityY(speed);
    } else {
      this.body.setVelocityY(0);
    }

    // Firing
    const rate = this.powerups.rapidFire ? POWERUP_TYPES.RAPID_FIRE.fireRate : this.fireRate;
    if (this.fireKey.isDown && time > this.lastFired + rate) {
      this.fire(bulletGroup);
      this.lastFired = time;
    }
  }

  fire(bulletGroup) {
    if (this.powerups.tripleShot) {
      // Center bullet
      this.spawnBullet(bulletGroup, 0, -PLAYER_BULLET_SPEED);
      // Left angled
      this.spawnBullet(bulletGroup, -PLAYER_BULLET_SPEED * 0.3, -PLAYER_BULLET_SPEED * 0.9);
      // Right angled
      this.spawnBullet(bulletGroup, PLAYER_BULLET_SPEED * 0.3, -PLAYER_BULLET_SPEED * 0.9);
      if (this.scene.cache.audio.exists('sfxTripleShoot')) {
        this.scene.sound.play('sfxTripleShoot', { volume: 0.5 });
      }
    } else {
      this.spawnBullet(bulletGroup, 0, -PLAYER_BULLET_SPEED);
      if (this.scene.cache.audio.exists('sfxShoot')) {
        this.scene.sound.play('sfxShoot', { volume: 0.5 });
      }
    }
  }

  spawnBullet(bulletGroup, vx, vy) {
    const bullet = bulletGroup.getFirstDead(false);
    if (!bullet) return;
    bullet.enableBody(true, this.x, this.y - 20, true, true);
    bullet.setVelocity(vx, vy);
    bullet.lifespan = 1500;
    bullet.birth = this.scene.time.now;
  }

  takeDamage() {
    if (this.invulnerable || !this.alive) return false;

    if (this.powerups.shield) {
      this.clearPowerup('shield');
      this.setInvulnerable(500);
      this.scene.events.emit('showMessage', 'Shield absorbed hit!');
      return false;
    }

    return true; // damage was taken
  }

  setInvulnerable(duration = PLAYER_INVULN_TIME) {
    this.invulnerable = true;
    // Flicker effect
    this.flickerTween = this.scene.tweens.add({
      targets: this,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: Math.floor(duration / 200),
    });
    this.scene.time.delayedCall(duration, () => {
      this.invulnerable = false;
      this.setAlpha(1);
      if (this.flickerTween) this.flickerTween.stop();
    });
  }

  activatePowerup(type) {
    const config = POWERUP_TYPES[type.toUpperCase().replace(/([a-z])([A-Z])/g, '$1_$2')];
    if (!config || !config.duration) return;

    const key = type;
    this.powerups[key] = true;

    // Clear existing timer for this powerup
    if (this.powerupTimers[key]) {
      this.powerupTimers[key].remove();
    }

    // Update texture if shield
    if (key === 'shield') {
      this.setTexture('playerShield');
      this.body.setSize(16, 22);
      this.body.setOffset(12, 4);
    }

    this.powerupTimers[key] = this.scene.time.delayedCall(config.duration, () => {
      this.clearPowerup(key);
    });
  }

  clearPowerup(key) {
    this.powerups[key] = false;
    if (this.powerupTimers[key]) {
      this.powerupTimers[key].remove();
      delete this.powerupTimers[key];
    }
    if (key === 'shield') {
      this.setTexture('player');
      this.body.setSize(16, 22);
      this.body.setOffset(8, 0);
    }
  }

  die() {
    this.alive = false;
    this.setActive(false);
    this.setVisible(false);
    this.body.enable = false;

    // Clear all powerups
    Object.keys(this.powerups).forEach((key) => this.clearPowerup(key));
  }

  respawn(x, y) {
    this.enableBody(true, x, y, true, true);
    this.alive = true;
    this.setInvulnerable();
  }

  destroy(fromScene) {
    // Clean up timers
    Object.values(this.powerupTimers).forEach((t) => t.remove());
    super.destroy(fromScene);
  }
}
