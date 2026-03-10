export class Bullet extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.birth = 0;
    this.lifespan = 1500;

    this.setActive(false);
    this.setVisible(false);
    this.body.enable = false;
  }

  update(time) {
    if (!this.active) return;

    // Auto-kill after lifespan
    if (time > this.birth + this.lifespan) {
      this.kill();
      return;
    }

    // Kill if off screen
    const h = this.scene.game.config.height;
    const w = this.scene.game.config.width;
    if (this.y < -20 || this.y > h + 20 || this.x < -20 || this.x > w + 20) {
      this.kill();
    }
  }

  kill() {
    this.setActive(false);
    this.setVisible(false);
    this.body.enable = false;
    this.setVelocity(0, 0);
  }
}
