import { GAME_WIDTH, GAME_HEIGHT, CHARACTERS, CHARACTER_IDS } from '../config.js';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene');
  }

  create() {
    this.selectedIndex = 0;
    this.charCenterX = GAME_WIDTH / 2;

    // Scrolling background
    this.bg = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'bgTile')
      .setOrigin(0, 0);

    // Title
    this.add.text(GAME_WIDTH / 2, 55, 'HAPPY SPERM', {
      fontSize: '48px',
      fontFamily: '"Rubik Wet Paint"',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(GAME_WIDTH / 2, 100, 'Swim.  Fight.  Fertilize.', {
      fontSize: '18px',
      fontFamily: 'Bungee',
      color: '#ff88aa',
    }).setOrigin(0.5);

    // --- Build the character card ---
    this.buildCard();

    // Left / right arrows (outside the card so they don't slide)
    this.leftArrow = this.add.text(20, 380, '\u25C0', {
      fontSize: '36px',
      color: '#ffffff',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.leftArrow.on('pointerdown', () => this.cycleCharacter(-1));

    this.rightArrow = this.add.text(GAME_WIDTH - 20, 380, '\u25B6', {
      fontSize: '36px',
      color: '#ffffff',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.rightArrow.on('pointerdown', () => this.cycleCharacter(1));

    // Instructions
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 100, 'Arrow Keys / WASD to move  |  SPACE to shoot', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#aaaaaa',
    }).setOrigin(0.5);

    // How to play
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 75, 'Press H for How to Play', {
      fontSize: '13px',
      fontFamily: 'monospace',
      color: '#888888',
    }).setOrigin(0.5);

    // Start prompt
    this.startText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 45, 'Press ENTER to start', {
      fontSize: '16px',
      fontFamily: 'Bungee',
      color: '#ffff88',
    }).setOrigin(0.5);

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

    // Touch: tap bottom to start
    this.input.on('pointerdown', (pointer) => {
      const cx = GAME_WIDTH / 2;
      if (pointer.x < cx - 60 || pointer.x > cx + 60) return;
      if (pointer.y < GAME_HEIGHT - 150) return;
      this.startGame();
    });

    // Swipe detection for mobile character cycling
    this.swipeStartX = null;
    this.input.on('pointerdown', (pointer) => {
      if (pointer.y >= 130 && pointer.y <= 620) {
        this.swipeStartX = pointer.x;
      }
    });
    this.input.on('pointerup', (pointer) => {
      if (this.swipeStartX !== null && pointer.y >= 130 && pointer.y <= 620) {
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
    this.updateCard();
  }

  buildCard() {
    // Card dimensions
    const cardW = 340;
    const cardH = 480;

    // Container positioned at center — all children use local coords relative to (0,0) = card center
    this.card = this.add.container(this.charCenterX, 400);

    // Card background
    this.cardBg = this.add.graphics();
    this.card.add(this.cardBg);

    // Card border (drawn per-character in updateCard)
    this.cardBorder = this.add.graphics();
    this.card.add(this.cardBorder);

    // Inner highlight line at top of card
    this.cardHighlight = this.add.graphics();
    this.card.add(this.cardHighlight);

    // Character name (top of card)
    this.charName = this.add.text(0, -cardH / 2 + 24, '', {
      fontSize: '32px',
      fontFamily: 'Bungee',
      color: '#ffff88',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);
    this.card.add(this.charName);

    // Character sprite
    this.charSprite = this.add.sprite(0, -cardH / 2 + 110, 'player_happy').setScale(3);
    this.card.add(this.charSprite);

    // Float the sprite (local y within container)
    this.tweens.add({
      targets: this.charSprite,
      y: -cardH / 2 + 120,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Divider line (drawn in updateCard)

    // Special ability
    this.charSpecial = this.add.text(0, -cardH / 2 + 175, '', {
      fontSize: '15px',
      fontFamily: 'Bungee',
      color: '#88ffaa',
    }).setOrigin(0.5);
    this.card.add(this.charSpecial);

    // Description
    this.charDesc = this.add.text(0, -cardH / 2 + 200, '', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#cccccc',
      wordWrap: { width: cardW - 40 },
      align: 'center',
    }).setOrigin(0.5);
    this.card.add(this.charDesc);

    // Stat bars area
    const statsLocalY = -cardH / 2 + 235;
    this.statsLocalY = statsLocalY;
    const statLabels = ['Speed', 'Acceleration', 'Health', 'Fire Power', 'Special'];
    const statKeys = ['speed', 'accel', 'health', 'firepower', 'special'];
    this.statKeys = statKeys;

    statLabels.forEach((label, i) => {
      const t = this.add.text(-cardW / 2 + 25, statsLocalY + i * 24, label, {
        fontSize: '11px',
        fontFamily: 'monospace',
        color: '#bbbbbb',
      }).setOrigin(0, 0.5);
      this.card.add(t);
    });

    this.statBarGraphics = this.add.graphics();
    this.card.add(this.statBarGraphics);

    // Quote attribution
    this.charQuoteAttribution = this.add.text(-cardW / 2 + 25, statsLocalY + 5 * 24 + 15, 'Sir Swimsworth says:', {
      fontSize: '11px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0, 0.5);
    this.card.add(this.charQuoteAttribution);

    // Quote
    this.charQuote = this.add.text(0, statsLocalY + 5 * 24 + 42, '', {
      fontSize: '13px',
      fontFamily: 'monospace',
      fontStyle: 'italic',
      color: '#dff307',
      wordWrap: { width: cardW - 40 },
      align: 'center',
    }).setOrigin(0.5);
    this.card.add(this.charQuote);

    this.cardW = cardW;
    this.cardH = cardH;
  }

  drawCardBackground(ch) {
    const w = this.cardW;
    const h = this.cardH;
    const ribbonColor = ch.colors.ribbon;
    const ribbonCSS = `#${ribbonColor.toString(16).padStart(6, '0')}`;

    // Card background — dark with slight transparency
    this.cardBg.clear();
    this.cardBg.fillStyle(0x0a0a1e, 0.85);
    this.cardBg.fillRoundedRect(-w / 2, -h / 2, w, h, 12);

    // Card border in character color
    this.cardBorder.clear();
    this.cardBorder.lineStyle(2, ribbonColor, 0.8);
    this.cardBorder.strokeRoundedRect(-w / 2, -h / 2, w, h, 12);

    // Top inner highlight
    this.cardHighlight.clear();
    this.cardHighlight.lineStyle(1, 0xffffff, 0.15);
    this.cardHighlight.strokeRoundedRect(-w / 2 + 2, -h / 2 + 2, w - 4, h - 4, 10);

    // Divider line under sprite
    this.cardBorder.lineStyle(1, ribbonColor, 0.4);
    this.cardBorder.lineBetween(-w / 2 + 20, -h / 2 + 160, w / 2 - 20, -h / 2 + 160);

    // Update name styling
    this.charName.setColor(ribbonCSS);
    this.charName.setShadow(0, 0, ribbonCSS, 8, false, true);
  }

  prevChar() {
    this.cycleCharacter(-1);
  }

  nextChar() {
    this.cycleCharacter(1);
  }

  cycleCharacter(dir) {
    this.selectedIndex = (this.selectedIndex + dir + CHARACTER_IDS.length) % CHARACTER_IDS.length;
    this.updateCard(dir);
  }

  updateCard(dir = 0) {
    const id = CHARACTER_IDS[this.selectedIndex];
    const ch = CHARACTERS[id];

    // Update sprite
    this.charSprite.setTexture(`player_${id}`);
    this.charSprite.play(`playerSwim_${id}`);

    // Update text
    this.charName.setText(ch.name);
    this.charSpecial.setText(ch.special);
    this.charDesc.setText(ch.description);
    this.charQuote.setText(ch.quote || '');

    // Draw card visuals in character color
    this.drawCardBackground(ch);

    // Draw stat bars
    this.drawStatBars(ch);

    // Slide the whole card from the arrow direction
    if (dir !== 0) {
      if (this.cardSlideTween) this.cardSlideTween.stop();
      const slideOffset = 300;
      this.card.x = this.charCenterX - dir * slideOffset;
      this.card.setAlpha(0.2);
      this.cardSlideTween = this.tweens.add({
        targets: this.card,
        x: this.charCenterX,
        alpha: 1,
        duration: 400,
        ease: 'Back.easeOut',
      });
      if (this.cache.audio.exists('sfxSwoosh')) {
        this.sound.play('sfxSwoosh', { volume: 0.4 });
      }
    }
  }

  drawStatBars(ch) {
    const g = this.statBarGraphics;
    g.clear();

    const barX = 20;
    const barW = 18;
    const barH = 14;
    const gap = 4;
    const statColors = [0x44ffff, 0xffff44, 0xff4444, 0xff8844, 0x88ff88];

    this.statKeys.forEach((key, i) => {
      const val = ch.stats[key];
      const y = this.statsLocalY + i * 24 - barH / 2;

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
