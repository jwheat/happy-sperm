import { generateTextures } from '../utils/TextureGenerator.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    generateTextures(this);
    this.scene.start('TitleScene');
  }
}
