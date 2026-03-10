import { generateTextures } from '../utils/TextureGenerator.js';
import { generateSounds } from '../utils/SoundGenerator.js';
import { MusicPlayer } from '../utils/MusicPlayer.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    generateTextures(this);

    // Create global music player
    const music = new MusicPlayer();
    music.init(this.sound.context);
    this.registry.set('music', music);

    generateSounds(this).then(() => {
      this.scene.start('TitleScene');
    });
  }
}
