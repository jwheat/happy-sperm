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

    // Wait for both sounds and fonts before starting
    const fontsReady = Promise.all([
      document.fonts.load('16px "Rubik Wet Paint"'),
      document.fonts.load('16px "Bungee"'),
      document.fonts.load('16px "Aladin"'),
    ]).catch(() => {
      // If fonts fail to load, continue anyway with fallback fonts
      console.warn('Some Google Fonts failed to load, using fallbacks');
    });

    Promise.all([generateSounds(this), fontsReady]).then(() => {
      this.scene.start('TitleScene');
    });
  }
}
