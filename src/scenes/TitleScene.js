import { GAME_WIDTH, GAME_HEIGHT, CHARACTERS, CHARACTER_IDS } from '../config.js';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene');
  }

  create() {
    this.selectedIndex = 0;

    // Scrolling background
    this.bg = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'bgTile')
      .setOrigin(0, 0);

    // Title
    this.add.text(GAME_WIDTH / 2, 80, 'HAPPY SPERM', {
      fontSize: '48px',
      fontFamily: '"Rubik Wet Paint"',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(GAME_WIDTH / 2, 130, 'Swim.  Fight.  Fertilize.', {
      fontSize: '18px',
      fontFamily: 'Bungee',
      color: '#ff88aa',
    }).setOrigin(0.5);

    // --- Character selection area ---
    const charY = 240;
    this.charCenterX = GAME_WIDTH / 2;

    // Left arrow
    this.leftArrow = this.add.text(GAME_WIDTH / 2 - 80, charY, '\u25C0', {
      fontSize: '32px',
      color: '#ffffff',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.leftArrow.on('pointerdown', () => this.cycleCharacter(-1));

    // Right arrow
    this.rightArrow = this.add.text(GAME_WIDTH / 2 + 80, charY, '\u25B6', {
      fontSize: '32px',
      color: '#ffffff',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.rightArrow.on('pointerdown', () => this.cycleCharacter(1));

    // Character sprite (will be updated)
    this.charSprite = this.add.sprite(GAME_WIDTH / 2, charY, 'player_happy').setScale(2.5);

    // Float the sprite
    this.tweens.add({
      targets: this.charSprite,
      y: charY + 15,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Character name
    this.charName = this.add.text(GAME_WIDTH / 2, charY + 45, '', {
      fontSize: '40px',
      fontFamily: 'Bungee',
      color: '#ffff88',
      stroke: '#000000',
      strokeThickness: 4,
      shadow: {
        offsetX: -10,
        offsetY: -10,
        color: '#000000',
        blur: 0,
        fill: true,
      },
    }).setOrigin(0.5).setScale(1.1);



    // Special ability name
    this.charSpecial = this.add.text(GAME_WIDTH / 2, charY + 90, '', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#88ffaa',
    }).setOrigin(0.5);

    // Description
    this.charDesc = this.add.text(GAME_WIDTH / 2, charY + 110, '', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Quote
    this.charQuote = this.add.text(GAME_WIDTH / 2, charY + 290, '', {
      fontSize: '18px',
      fontFamily: 'monospace',
      fontStyle: 'italic',
      color: '#dff307',
    }).setOrigin(0.5);

    // Quote Attribution
    this.charQuoteAttribution = this.add.text(115, charY + 265, 'Sir Swimsworth says:', {
      fontSize: '16px',
      fontFamily: 'monospace',
      fontStyle: 'Bold',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Stat bars
    const statsY = charY + 140;
    const statLabels = ['Speed', 'Acceleration', 'Health', 'Fire Power', 'Special'];
    const statKeys = ['speed', 'accel', 'health', 'firepower', 'special'];
    this.statBarGraphics = this.add.graphics();
    this.statLabels = statLabels;
    this.statKeys = statKeys;
    this.statsY = statsY;

    // Draw stat labels
    statLabels.forEach((label, i) => {
      this.add.text(GAME_WIDTH / 3 - 30, statsY + i * 22, label, {
        fontSize: '12px',
        fontFamily: 'monospace',
        color: '#eeeeee',
      }).setOrigin(0, 0.5);
    });

    // // "Select" hint
    // this.add.text(GAME_WIDTH / 2, statsY + 5 * 22 + 10, '\u25C0 \u25B6  to select character', {
    //   fontSize: '12px',
    //   fontFamily: 'monospace',
    //   color: '#666666',
    // }).setOrigin(0.5);

    // Instructions
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 120, 'Arrow Keys / WASD to move', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#aaaaaa',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 95, 'SPACE to shoot', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#aaaaaa',
    }).setOrigin(0.5);

    // How to play
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 65, 'Press H for How to Play', {
      fontSize: '13px',
      fontFamily: 'monospace',
      color: '#888888',
    }).setOrigin(0.5);

    // Start prompt
    this.startText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 35, 'Press ENTER to start', {
      fontSize: '16px',
      fontFamily: 'Bungee',
      color: '#ffff88',
    }).setOrigin(0.5);

    // Blink start text
    this.tweens.add({
      targets: this.startText,
      alpha: 0.3,
      duration: 600,
      yoyo: true,
      repeat: -1,
    });

    // Start title music
    const music = this.registry.get('music');
    if (music) music.play('title');

    // Input
    this.input.keyboard.on('keydown-ENTER', this.startGame, this);
    this.input.keyboard.on('keydown-SPACE', this.startGame, this);
    this.input.keyboard.on('keydown-H', this.showInstructions, this);
    this.input.keyboard.on('keydown-LEFT', this.prevChar, this);
    this.input.keyboard.on('keydown-RIGHT', this.nextChar, this);
    this.input.keyboard.on('keydown-A', this.prevChar, this);
    this.input.keyboard.on('keydown-D', this.nextChar, this);

    // Touch: tap center to start (but not on arrows)
    this.input.on('pointerdown', (pointer) => {
      // Ignore if near arrows
      const cx = GAME_WIDTH / 2;
      if (pointer.x < cx - 60 || pointer.x > cx + 60) return;
      if (pointer.y < GAME_HEIGHT - 150) return;
      this.startGame();
    });

    // Swipe detection for mobile character cycling
    this.swipeStartX = null;
    this.input.on('pointerdown', (pointer) => {
      if (pointer.y >= 170 && pointer.y <= 500) {
        this.swipeStartX = pointer.x;
      }
    });
    this.input.on('pointerup', (pointer) => {
      if (this.swipeStartX !== null && pointer.y >= 170 && pointer.y <= 500) {
        const dx = pointer.x - this.swipeStartX;
        if (Math.abs(dx) > 40) {
          this.cycleCharacter(dx < 0 ? 1 : -1);
        }
        this.swipeStartX = null;
      }
    });

    // Clean up on shutdown
    this.events.once('shutdown', () => {
      this.input.keyboard.off('keydown-ENTER', this.startGame, this);
      this.input.keyboard.off('keydown-SPACE', this.startGame, this);
      this.input.keyboard.off('keydown-H', this.showInstructions, this);
      this.input.keyboard.off('keydown-LEFT', this.prevChar, this);
      this.input.keyboard.off('keydown-RIGHT', this.nextChar, this);
      this.input.keyboard.off('keydown-A', this.prevChar, this);
      this.input.keyboard.off('keydown-D', this.nextChar, this);
      this.input.off('pointerdown');
      this.input.off('pointerup');
    });

    // Show initial character
    this.updateCharacterDisplay();
  }

  prevChar() {
    this.cycleCharacter(-1);
  }

  nextChar() {
    this.cycleCharacter(1);
  }

  cycleCharacter(dir) {
    this.selectedIndex = (this.selectedIndex + dir + CHARACTER_IDS.length) % CHARACTER_IDS.length;
    this.updateCharacterDisplay(dir);
  }

  updateCharacterDisplay(dir = 0) {
    const id = CHARACTER_IDS[this.selectedIndex];
    const ch = CHARACTERS[id];

    // Update sprite texture and animation
    this.charSprite.setTexture(`player_${id}`);
    this.charSprite.play(`playerSwim_${id}`);

    // Slide sprite in from the direction of the arrow pressed
    if (dir !== 0) {
      if (this.charSlideTween) this.charSlideTween.stop();
      const slideOffset = 300;
      this.charSprite.x = this.charCenterX - dir * slideOffset;
      this.charSprite.setAlpha(0.3);
      this.charSlideTween = this.tweens.add({
        targets: this.charSprite,
        x: this.charCenterX,
        alpha: 1,
        duration: 2000,
        ease: 'Back.easeOut',
      });
      if (this.cache.audio.exists('sfxSwoosh')) {
        this.sound.play('sfxSwoosh', { volume: 0.4 });
      }
    }

    // Update text
    const ribbonCSS = `#${ch.colors.ribbon.toString(16).padStart(6, '0')}`;
    this.charName.setText(ch.name);
    this.charName.setColor(ribbonCSS);
    this.charName.setShadow(0, -1, '#ffffff', 0, true, false); // top-edge highlight
    this.charName.setShadow(0, 0, ribbonCSS, 6, false, true);  // color glow (stroke shadow)
    this.charSpecial.setText(`${ch.special}`);
    this.charDesc.setText(ch.description);
    this.charQuote.setText(ch.quote);

    // Bounce animation on character change
    if (this.charNameBounce) this.charNameBounce.stop();
    this.charName.setScale(0.9);
    this.charNameBounce = this.tweens.add({
      targets: this.charName,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 200,
      ease: 'Back.easeOut',
    });

    // Update stat bars
    this.drawStatBars(ch);
  }

  drawStatBars(ch) {
    const g = this.statBarGraphics;
    g.clear();

    const barX = GAME_WIDTH / 2;
    const barW = 18;
    const barH = 14;
    const gap = 4;
    const statColors = [0x44ffff, 0xffff44, 0xff4444, 0xff8844, 0x88ff88];

    this.statKeys.forEach((key, i) => {
      const val = ch.stats[key];
      const y = this.statsY + i * 22 - barH / 2;

      for (let p = 0; p < 5; p++) {
        if (p < val) {
          g.fillStyle(statColors[i], 0.9);
        } else {
          g.fillStyle(0x333333, 0.5);
        }
        g.fillRoundedRect(barX + p * (barW + gap), y, barW, barH, 2);
      }
    });
  }

  startGame() {
    const id = CHARACTER_IDS[this.selectedIndex];
    const ch = CHARACTERS[id];
    this.scene.start('GameScene', {
      stage: 0,
      score: 0,
      lives: ch.lives,
      character: id,
    });
  }

  showInstructions() {
    this.scene.start('InstructionsScene');
  }

  update() {
    this.bg.tilePositionY -= 0.5;
  }
}
