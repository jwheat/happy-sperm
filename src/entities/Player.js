import {
  PLAYER_SPEED,
  PLAYER_FIRE_RATE,
  PLAYER_INVULN_TIME,
  PLAYER_BULLET_SPEED,
  GAME_WIDTH,
  GAME_HEIGHT,
  POWERUP_TYPES,
  DEBRIS_CLOUD_TYPES,
  CHARACTERS,
} from '../config.js';

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, characterId = 'happy') {
    const ch = CHARACTERS[characterId] || CHARACTERS.happy;
    super(scene, x, y, `player_${characterId}`);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.characterId = characterId;
    this.characterDef = ch;

    this.setCollideWorldBounds(true);
    this.body.setSize(16, 22);
    this.body.setOffset(8, 0);

    this.alive = true;
    this.invulnerable = false;
    this.lastFired = 0;
    this.speed = ch.speed;
    this.fireRate = ch.fireRate;
    this.bulletSpeed = ch.bulletSpeed;

    // Active powerups
    this.powerups = {
      speedBoost: false,
      rapidFire: false,
      shield: false,
      tripleShot: false,
    };
    this.powerupTimers = {};

    // Zone effects (set by GameScene overlap checks each frame)
    this.activeZone = null; // null, 'SLOW', or 'TURBULENT'

    // Special ability state
    this.specialActive = false;
    this.specialCooldown = false;
    this.lastSpecialTime = 0;

    // Tank: wall breaker state
    if (characterId === 'tank') {
      this.ramActive = false;
      this.ramCooldown = false;
    }

    // Input
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasd = {
      up: scene.input.keyboard.addKey('W'),
      down: scene.input.keyboard.addKey('S'),
      left: scene.input.keyboard.addKey('A'),
      right: scene.input.keyboard.addKey('D'),
    };
    this.fireKey = scene.input.keyboard.addKey('SPACE');
    this.specialKey = scene.input.keyboard.addKey('SHIFT');

    // Touch controls (set externally by scene)
    this.touchControls = null;

    // Start swim animation
    this.play(`playerSwim_${characterId}`);
  }

  handleInput(time, bulletGroup) {
    if (!this.alive) return;

    let speed = this.powerups.speedBoost ? this.speed * 1.6 : this.speed;

    // Zip Hyper Swim active — extreme speed
    if (this.characterId === 'zip' && this.specialActive) {
      speed = this.speed * this.characterDef.specialConfig.speedMult;
    }

    // Apply zone movement modifier (speed boost overrides slow zone)
    if (this.activeZone) {
      const isSlowZone = this.activeZone === 'SLOW';
      if (!(isSlowZone && this.powerups.speedBoost)) {
        const zoneConfig = DEBRIS_CLOUD_TYPES[this.activeZone];
        speed *= zoneConfig.moveMult;
      }
    }

    // Turbulent zone: use momentum/inertia instead of instant velocity
    const isTurbulent = this.activeZone === 'TURBULENT';
    const drag = isTurbulent ? DEBRIS_CLOUD_TYPES.TURBULENT.drag : 0;

    // Movement
    let vx = 0;
    let vy = 0;

    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      vx = -speed;
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      vx = speed;
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      vy = -speed;
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      vy = speed;
    }

    // Merge touch joystick input (overrides keyboard if active)
    const tc = this.touchControls;
    if (tc && tc.enabled && (tc.dirX !== 0 || tc.dirY !== 0)) {
      vx = tc.dirX * speed;
      vy = tc.dirY * speed;
    }

    if (isTurbulent) {
      // Slippery: blend current velocity toward target with inertia
      const curVx = this.body.velocity.x;
      const curVy = this.body.velocity.y;
      if (vx !== 0 || vy !== 0) {
        // Input active: accelerate toward target but with momentum
        this.body.setVelocityX(curVx * drag + vx * (1 - drag));
        this.body.setVelocityY(curVy * drag + vy * (1 - drag));
      } else {
        // No input: slide with friction
        this.body.setVelocityX(curVx * drag);
        this.body.setVelocityY(curVy * drag);
      }
    } else {
      // Normal or slow: instant response
      this.body.setVelocityX(vx);
      this.body.setVelocityY(vy);
    }

    // Firing
    const rate = this.powerups.rapidFire ? POWERUP_TYPES.RAPID_FIRE.fireRate : this.fireRate;
    const touchFiring = tc && tc.enabled && tc.isFiring;
    if ((this.fireKey.isDown || touchFiring) && time > this.lastFired + rate) {
      this.fire(bulletGroup);
      this.lastFired = time;
    }

    // Special ability activation (SHIFT key)
    if (Phaser.Input.Keyboard.JustDown(this.specialKey)) {
      this.activateSpecial(time);
    }
  }

  activateSpecial(time) {
    if (this.specialCooldown || this.specialActive) return;

    const cfg = this.characterDef.specialConfig;

    if (this.characterId === 'zip') {
      // Hyper Swim — extreme speed burst
      this.specialActive = true;
      this.setTint(0x44ffff);
      this.scene.events.emit('showMessage', 'Hyper Swim!');
      this.scene.time.delayedCall(cfg.duration, () => {
        this.specialActive = false;
        this.clearTint();
        this.specialCooldown = true;
        this.scene.time.delayedCall(cfg.cooldown, () => {
          this.specialCooldown = false;
        });
      });
    } else if (this.characterId === 'tank') {
      // Wall Breaker — ram mode
      this.ramActive = true;
      this.invulnerable = true;
      this.setTint(0xff4444);
      this.scene.events.emit('showMessage', 'Wall Breaker!');
      this.scene.time.delayedCall(cfg.ramDuration, () => {
        this.ramActive = false;
        this.invulnerable = false;
        this.clearTint();
        this.specialCooldown = true;
        this.scene.time.delayedCall(cfg.ramCooldown, () => {
          this.specialCooldown = false;
        });
      });
    }
    // Brainiac and Lucky are passive — no activation needed
    // Happy has no special
  }

  fire(bulletGroup) {
    if (this.powerups.tripleShot) {
      // Center bullet
      this.spawnBullet(bulletGroup, 0, -this.bulletSpeed);
      // Left angled
      this.spawnBullet(bulletGroup, -this.bulletSpeed * 0.3, -this.bulletSpeed * 0.9);
      // Right angled
      this.spawnBullet(bulletGroup, this.bulletSpeed * 0.3, -this.bulletSpeed * 0.9);
      if (this.scene.cache.audio.exists('sfxTripleShoot')) {
        this.scene.sound.play('sfxTripleShoot', { volume: 0.5 });
      }
    } else {
      this.spawnBullet(bulletGroup, 0, -this.bulletSpeed);
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
    const config = POWERUP_TYPES[type.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase()];
    if (!config || !config.duration) return;

    const key = type;
    this.powerups[key] = true;

    // Clear existing timer for this powerup
    if (this.powerupTimers[key]) {
      this.powerupTimers[key].remove();
    }

    // Switch to shield animation
    if (key === 'shield') {
      this.play(`playerShieldSwim_${this.characterId}`);
      this.body.setSize(16, 22);
      this.body.setOffset(12, 4);
    }

    // Brainiac: powerups last 50% longer
    let duration = config.duration;
    if (this.characterId === 'brainiac') {
      duration *= this.characterDef.specialConfig.durationMult;
    }

    this.powerupTimers[key] = this.scene.time.delayedCall(duration, () => {
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
      this.play(`playerSwim_${this.characterId}`);
      this.body.setSize(16, 22);
      this.body.setOffset(8, 0);
    }
  }

  die() {
    this.alive = false;
    this.setActive(false);
    this.setVisible(false);
    this.body.enable = false;

    // Clear special state
    this.specialActive = false;
    this.specialCooldown = false;
    if (this.characterId === 'tank') this.ramActive = false;
    this.clearTint();

    // Clear all powerups
    Object.keys(this.powerups).forEach((key) => this.clearPowerup(key));
  }

  respawn(x, y) {
    this.enableBody(true, x, y, true, true);
    this.alive = true;
    this.activeZone = null;
    this.play(`playerSwim_${this.characterId}`);
    this.setInvulnerable();
  }

  destroy(fromScene) {
    // Clean up timers
    Object.values(this.powerupTimers).forEach((t) => t.remove());
    super.destroy(fromScene);
  }
}
