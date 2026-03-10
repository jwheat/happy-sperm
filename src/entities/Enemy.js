import { ENEMY_TYPES, ENEMY_BULLET_SPEED, GAME_WIDTH } from '../config.js';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, typeKey) {
    const config = Object.values(ENEMY_TYPES).find((t) => t.key === typeKey);
    super(scene, x, y, typeKey);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.config = config;
    this.hp = config.hp;
    this.scoreValue = config.score;
    this.enemyType = typeKey;
    this.lastFired = 0;
    this.zigzagTimer = 0;
    this.zigzagDir = 1;

    this.setActive(true);
    this.setVisible(true);
  }

  init(x, y, typeKey, scrollSpeed) {
    const config = Object.values(ENEMY_TYPES).find((t) => t.key === typeKey);
    this.config = config;
    this.hp = config.hp;
    this.scoreValue = config.score;
    this.enemyType = typeKey;
    this.setTexture(typeKey);
    this.setPosition(x, y);
    this.lastFired = 0;
    this.zigzagTimer = 0;
    this.zigzagDir = Phaser.Math.Between(0, 1) ? 1 : -1;
    this.scrollSpeed = scrollSpeed;
    this.body.enable = true;
    this.setActive(true);
    this.setVisible(true);
    return this;
  }

  update(time, delta, playerX, playerY, enemyBullets) {
    if (!this.active) return;

    const speed = this.config.speed;

    // Base downward movement (scroll with the world)
    let vy = speed + (this.scrollSpeed || 0) * 0.3;
    let vx = 0;

    // Behavior patterns
    if (this.config.zigzag) {
      this.zigzagTimer += delta;
      if (this.zigzagTimer > 800) {
        this.zigzagDir *= -1;
        this.zigzagTimer = 0;
      }
      vx = speed * 1.2 * this.zigzagDir;
    }

    if (this.config.chase && playerX !== undefined) {
      const dx = playerX - this.x;
      vx = Math.sign(dx) * speed * 0.8;
    }

    this.setVelocity(vx, vy);

    // Keep in horizontal bounds
    if (this.x < 20) this.x = 20;
    if (this.x > GAME_WIDTH - 20) this.x = GAME_WIDTH - 20;

    // Shooting enemies
    if (this.config.shoots && time > this.lastFired + this.config.fireRate) {
      this.shoot(enemyBullets, playerX, playerY);
      this.lastFired = time;
    }

    // Off screen bottom - deactivate
    if (this.y > this.scene.game.config.height + 60) {
      this.setActive(false);
      this.setVisible(false);
      this.body.enable = false;
    }
  }

  shoot(bulletGroup, playerX, playerY) {
    const bullet = bulletGroup.getFirstDead(false);
    if (!bullet) return;

    bullet.enableBody(true, this.x, this.y + 16, true, true);

    // Aim at player
    const angle = Phaser.Math.Angle.Between(this.x, this.y, playerX, playerY);
    bullet.setVelocity(
      Math.cos(angle) * ENEMY_BULLET_SPEED,
      Math.sin(angle) * ENEMY_BULLET_SPEED
    );
    bullet.birth = this.scene.time.now;
    bullet.lifespan = 2500;
  }

  takeDamage(amount = 1) {
    this.hp -= amount;
    // Flash white
    this.setTintFill(0xffffff);
    this.scene.time.delayedCall(80, () => {
      if (this.active) this.clearTint();
    });
    return this.hp <= 0;
  }
}
