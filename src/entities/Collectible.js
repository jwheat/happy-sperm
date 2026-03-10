import { GAME_HEIGHT } from '../config.js';

export class Collectible extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, type) {
    super(scene, x, y, type);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.collectibleType = type;
    this.setActive(false);
    this.setVisible(false);
    this.body.enable = false;
  }

  spawn(x, y, type, scrollSpeed) {
    this.collectibleType = type;
    this.setTexture(type);
    this.enableBody(true, x, y, true, true);
    this.setVelocityY(scrollSpeed * 0.5 + 30);

    // Gentle floating animation
    this.scene.tweens.add({
      targets: this,
      x: x + Phaser.Math.Between(-15, 15),
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    return this;
  }

  update() {
    if (!this.active) return;

    // Off screen
    if (this.y > GAME_HEIGHT + 30) {
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

  pickupEffect() {
    // Scale up and fade
    this.scene.tweens.add({
      targets: this,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        this.kill();
        this.setScale(1);
        this.setAlpha(1);
      },
    });
  }
}
