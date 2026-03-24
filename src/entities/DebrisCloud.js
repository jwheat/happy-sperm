import { GAME_HEIGHT, DEBRIS_CLOUD_TYPES } from '../config.js';

export class DebrisCloud extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, cloudType) {
    const config = DEBRIS_CLOUD_TYPES[cloudType];
    super(scene, x, y, config.key);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.cloudType = cloudType;
    this.config = config;
    this.setActive(false);
    this.setVisible(false);
    this.body.enable = false;
  }

  spawn(x, y, cloudType, scrollSpeed) {
    this.cloudType = cloudType;
    this.config = DEBRIS_CLOUD_TYPES[cloudType];
    this.setTexture(this.config.key);
    this.enableBody(true, x, y, true, true);
    this.setVelocityY(scrollSpeed * 0.35 + 20);

    // Random scale variation for different cloud sizes
    const scale = Phaser.Math.FloatBetween(0.8, 1.5);
    this.setScale(scale);

    // Set physics body to match visual size (circle for overlap detection)
    const radius = 30 * scale;
    this.body.setCircle(radius, (48 - radius), (40 - radius));

    // Slow drift sideways
    this.setVelocityX(Phaser.Math.Between(-15, 15));

    // Gentle alpha pulse
    this.setAlpha(0.8);
    this.scene.tweens.add({
      targets: this,
      alpha: 0.5,
      duration: Phaser.Math.Between(1500, 2500),
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    return this;
  }

  update(effectiveScrollSpeed) {
    if (!this.active) return;

    // Update drift speed based on current scroll
    if (effectiveScrollSpeed !== undefined) {
      this.setVelocityY(effectiveScrollSpeed * 0.35 + 20);
    }

    // Off screen cleanup
    if (this.y > GAME_HEIGHT + 60) {
      this.kill();
    }
  }

  kill() {
    this.setActive(false);
    this.setVisible(false);
    this.body.enable = false;
    this.setVelocity(0, 0);
    this.scene.tweens.killTweensOf(this);
  }
}
