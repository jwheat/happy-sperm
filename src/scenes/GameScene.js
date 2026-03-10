import {
  GAME_WIDTH,
  GAME_HEIGHT,
  SCROLL_SPEED,
  SCROLL_SPEED_INCREMENT,
  SCROLL_SPEED_BOOST_MULT,
  SCROLL_POSITION_BONUS,
  PLAYER_LIVES,
  BULLET_POOL_SIZE,
  ENEMY_BULLET_POOL_SIZE,
  ENEMY_TYPES,
  BASE_SPAWN_INTERVAL,
  MIN_SPAWN_INTERVAL,
  SPAWN_INTERVAL_DECREASE,
  POWERUP_TYPES,
  POWERUP_DROP_CHANCE,
  ENERGY_SPAWN_INTERVAL,
  SCORE_ENERGY,
  SCORE_STAGE_CLEAR,
  STAGES,
  TUBE_WALL_THICKNESS,
  TUBE_MIN_WIDTH,
  TUBE_MAX_WIDTH,
  TUBE_SEGMENT_HEIGHT,
} from '../config.js';

import { Player } from '../entities/Player.js';
import { Bullet } from '../entities/Bullet.js';
import { Enemy } from '../entities/Enemy.js';
import { Collectible } from '../entities/Collectible.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  init(data) {
    this.currentStage = data.stage || 0;
    this.score = data.score || 0;
    this.lives = data.lives ?? PLAYER_LIVES;
    this.stageTimer = 0;        // speed-adjusted timer (drives progress bar / stage completion)
    this.realStageTime = 0;      // real wall-clock time for current stage
    this.totalTime = data.totalTime || 0; // cumulative real time across stages
    this.gameOver = false;
    this.stageComplete = false;
    this.effectiveScrollSpeed = 0; // updated each frame
  }

  create() {
    const stage = STAGES[this.currentStage] || STAGES[0];
    this.scrollSpeed = SCROLL_SPEED + this.currentStage * SCROLL_SPEED_INCREMENT;

    // Background
    this.bg = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'bgTile')
      .setOrigin(0, 0)
      .setDepth(-2);

    // Tube walls (organic tube boundaries)
    this.wallSegments = [];
    this.tubeGraphics = this.add.graphics().setDepth(-1);
    this.currentTubeLeft = 40;
    this.currentTubeRight = GAME_WIDTH - 40;
    this.targetTubeLeft = 40;
    this.targetTubeRight = GAME_WIDTH - 40;
    this.tubeChangeTimer = 0;
    this.generateTubeTarget();

    // Create tube wall physics bodies
    this.leftWall = this.add.rectangle(0, GAME_HEIGHT / 2, TUBE_WALL_THICKNESS, GAME_HEIGHT);
    this.physics.add.existing(this.leftWall, true);
    this.rightWall = this.add.rectangle(GAME_WIDTH, GAME_HEIGHT / 2, TUBE_WALL_THICKNESS, GAME_HEIGHT);
    this.physics.add.existing(this.rightWall, true);
    this.leftWall.setVisible(false);
    this.rightWall.setVisible(false);

    // Player
    this.player = new Player(this, GAME_WIDTH / 2, GAME_HEIGHT - 80);

    // Bullet pools
    this.playerBullets = this.physics.add.group({
      classType: Bullet,
      maxSize: BULLET_POOL_SIZE,
      runChildUpdate: false,
      createCallback: (bullet) => {
        bullet.setTexture('playerBullet');
      },
    });
    // Pre-create bullets
    for (let i = 0; i < BULLET_POOL_SIZE; i++) {
      const b = new Bullet(this, 0, 0, 'playerBullet');
      this.playerBullets.add(b);
    }

    this.enemyBullets = this.physics.add.group({
      classType: Bullet,
      maxSize: ENEMY_BULLET_POOL_SIZE,
      runChildUpdate: false,
      createCallback: (bullet) => {
        bullet.setTexture('enemyBullet');
      },
    });
    for (let i = 0; i < ENEMY_BULLET_POOL_SIZE; i++) {
      const b = new Bullet(this, 0, 0, 'enemyBullet');
      this.enemyBullets.add(b);
    }

    // Enemy group
    this.enemies = this.physics.add.group({
      classType: Enemy,
      runChildUpdate: false,
    });

    // Collectibles group
    this.collectibles = this.physics.add.group({
      classType: Collectible,
      runChildUpdate: false,
    });

    // Particle emitter for explosions
    this.explosionEmitter = this.add.particles(0, 0, 'particle', {
      speed: { min: 50, max: 200 },
      lifespan: 400,
      quantity: 12,
      scale: { start: 1, end: 0 },
      emitting: false,
    });

    // Collisions
    this.physics.add.overlap(
      this.playerBullets,
      this.enemies,
      this.onBulletHitEnemy,
      null,
      this
    );

    this.physics.add.overlap(
      this.enemyBullets,
      this.player,
      this.onEnemyBulletHitPlayer,
      null,
      this
    );

    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.onPlayerHitEnemy,
      null,
      this
    );

    this.physics.add.overlap(
      this.player,
      this.collectibles,
      this.onPlayerCollect,
      null,
      this
    );

    // Spawn timers
    this.spawnTimer = 0;
    this.spawnInterval = Math.max(
      MIN_SPAWN_INTERVAL,
      BASE_SPAWN_INTERVAL - this.currentStage * SPAWN_INTERVAL_DECREASE
    );
    this.energyTimer = 0;

    // Stage name display
    this.events.emit('stageStart', stage.name);

    // Launch HUD
    this.scene.launch('HudScene', {
      gameScene: this,
      stage: this.currentStage,
      score: this.score,
      lives: this.lives,
    });

    // Start game music
    const music = this.registry.get('music');
    if (music) music.play('game');

    // Egg for final stage
    this.egg = null;
    this.eggSpawned = false;

    this.events.emit('scoreChanged', this.score);
    this.events.emit('livesChanged', this.lives);

    // Clean up custom key listeners on shutdown
    this.events.once('shutdown', () => {
      this.input.keyboard.removeAllKeys(true);
    });
  }

  update(time, delta) {
    if (this.gameOver) return;

    const stage = STAGES[this.currentStage] || STAGES[0];

    // Calculate effective scroll speed
    // Base speed + position bonus (higher on screen = faster)
    const playerYRatio = 1 - (this.player.y / GAME_HEIGHT); // 0 at bottom, 1 at top
    const positionMult = 1 + playerYRatio * SCROLL_POSITION_BONUS;
    // Speed boost powerup
    const boostMult = this.player.powerups.speedBoost ? SCROLL_SPEED_BOOST_MULT : 1;
    this.effectiveScrollSpeed = this.scrollSpeed * positionMult * boostMult;

    // Scroll background
    this.bg.tilePositionY -= this.effectiveScrollSpeed * (delta / 1000);

    // Stage timer — advances faster with higher scroll speed (drives progress/completion)
    const speedRatio = this.effectiveScrollSpeed / this.scrollSpeed;
    this.stageTimer += (delta / 1000) * speedRatio;
    // Real timers — wall-clock speed
    this.realStageTime += delta / 1000;
    this.totalTime += delta / 1000;
    this.events.emit('progressChanged', this.stageTimer / stage.length);
    this.events.emit('timerChanged', this.realStageTime, this.totalTime);

    // Update tube walls
    this.updateTubeWalls(delta);

    // Player input
    this.player.handleInput(time, this.playerBullets);

    // Constrain player to tube
    this.constrainToTube(this.player);

    // Update bullets
    this.playerBullets.getChildren().forEach((b) => b.update(time));
    this.enemyBullets.getChildren().forEach((b) => b.update(time));

    // Update enemies with current effective scroll speed
    this.enemies.getChildren().forEach((enemy) => {
      if (enemy.active) {
        enemy.update(time, delta, this.player.x, this.player.y, this.enemyBullets, this.effectiveScrollSpeed);
      }
    });

    // Update collectibles with current effective scroll speed
    this.collectibles.getChildren().forEach((c) => {
      if (c.active) c.update(this.effectiveScrollSpeed);
    });

    // Spawn enemies
    this.spawnTimer += delta;
    if (this.spawnTimer >= this.spawnInterval && !this.stageComplete) {
      this.spawnEnemy();
      this.spawnTimer = 0;
    }

    // Spawn energy pickups
    this.energyTimer += delta;
    if (this.energyTimer >= ENERGY_SPAWN_INTERVAL) {
      this.spawnCollectible('energy');
      this.energyTimer = 0;
    }

    // Check stage completion
    if (this.stageTimer >= stage.length && !this.stageComplete) {
      this.stageComplete = true;
      if (this.currentStage === STAGES.length - 1) {
        this.spawnEgg();
      } else {
        this.completeStage();
      }
    }
  }

  // --- Tube wall system ---
  generateTubeTarget() {
    const center = GAME_WIDTH / 2 + Phaser.Math.Between(-80, 80);
    const width = Phaser.Math.Between(TUBE_MIN_WIDTH, TUBE_MAX_WIDTH);
    this.targetTubeLeft = Math.max(10, center - width / 2);
    this.targetTubeRight = Math.min(GAME_WIDTH - 10, center + width / 2);
  }

  updateTubeWalls(delta) {
    this.tubeChangeTimer += delta;
    if (this.tubeChangeTimer > 2000) {
      this.generateTubeTarget();
      this.tubeChangeTimer = 0;
    }

    // Lerp toward target
    const lerpSpeed = 0.001 * delta;
    this.currentTubeLeft += (this.targetTubeLeft - this.currentTubeLeft) * lerpSpeed;
    this.currentTubeRight += (this.targetTubeRight - this.currentTubeRight) * lerpSpeed;

    // Update wall physics bodies
    this.leftWall.setPosition(this.currentTubeLeft - TUBE_WALL_THICKNESS / 2, GAME_HEIGHT / 2);
    this.rightWall.setPosition(this.currentTubeRight + TUBE_WALL_THICKNESS / 2, GAME_HEIGHT / 2);

    // Draw organic walls
    this.drawTubeWalls();
  }

  drawTubeWalls() {
    const g = this.tubeGraphics;
    g.clear();

    const stage = STAGES[this.currentStage] || STAGES[0];
    const wallColor = stage.color;

    // Left wall
    g.fillStyle(wallColor, 0.8);
    g.fillRect(0, 0, this.currentTubeLeft, GAME_HEIGHT);

    // Right wall
    g.fillRect(this.currentTubeRight, 0, GAME_WIDTH - this.currentTubeRight, GAME_HEIGHT);

    // Inner edge glow
    g.fillStyle(wallColor, 0.3);
    g.fillRect(this.currentTubeLeft, 0, 6, GAME_HEIGHT);
    g.fillRect(this.currentTubeRight - 6, 0, 6, GAME_HEIGHT);

    // Organic texture bumps
    g.fillStyle(wallColor, 0.5);
    for (let y = 0; y < GAME_HEIGHT; y += 40) {
      const bumpL = Math.sin(y * 0.05 + this.stageTimer * 2) * 8;
      const bumpR = Math.sin(y * 0.05 + this.stageTimer * 2 + 1) * 8;
      g.fillCircle(this.currentTubeLeft + bumpL, y, 10);
      g.fillCircle(this.currentTubeRight + bumpR, y, 10);
    }
  }

  constrainToTube(sprite) {
    if (!sprite.active) return;
    const pad = 12;
    if (sprite.x < this.currentTubeLeft + pad) {
      sprite.x = this.currentTubeLeft + pad;
      sprite.body.setVelocityX(0);
    }
    if (sprite.x > this.currentTubeRight - pad) {
      sprite.x = this.currentTubeRight - pad;
      sprite.body.setVelocityX(0);
    }
  }

  // --- Spawning ---
  spawnEnemy() {
    // Pick a random enemy type based on stage
    const typeKeys = Object.values(ENEMY_TYPES);
    let available = [typeKeys[0], typeKeys[1]]; // WBC and antibody always

    if (this.currentStage >= 1) available.push(typeKeys[2]); // rival sperm
    if (this.currentStage >= 2) available.push(typeKeys[3]); // mucus blob

    const type = Phaser.Utils.Array.GetRandom(available);
    const x = Phaser.Math.Between(
      this.currentTubeLeft + 30,
      this.currentTubeRight - 30
    );
    const y = -40;

    // Reuse or create enemy
    let enemy = this.enemies.getFirstDead(false);
    if (enemy) {
      enemy.init(x, y, type.key, this.scrollSpeed);
    } else {
      enemy = new Enemy(this, x, y, type.key);
      enemy.init(x, y, type.key, this.scrollSpeed);
      this.enemies.add(enemy);
    }
  }

  spawnCollectible(type) {
    const x = Phaser.Math.Between(
      this.currentTubeLeft + 20,
      this.currentTubeRight - 20
    );

    let collectible = this.collectibles.getFirstDead(false);
    if (collectible) {
      collectible.spawn(x, -20, type, this.scrollSpeed);
    } else {
      collectible = new Collectible(this, x, -20, type);
      collectible.spawn(x, -20, type, this.scrollSpeed);
      this.collectibles.add(collectible);
    }
  }

  spawnPowerupDrop(x, y) {
    if (Math.random() > POWERUP_DROP_CHANCE) return;

    const types = ['speedBoost', 'rapidFire', 'shieldPickup', 'tripleShot'];
    const type = Phaser.Utils.Array.GetRandom(types);
    let collectible = this.collectibles.getFirstDead(false);
    if (collectible) {
      collectible.spawn(x, y, type, this.scrollSpeed);
    } else {
      collectible = new Collectible(this, x, y, type);
      collectible.spawn(x, y, type, this.scrollSpeed);
      this.collectibles.add(collectible);
    }
  }

  spawnEgg() {
    this.egg = this.add.image(GAME_WIDTH / 2, -60, 'egg').setDepth(1);
    this.tweens.add({
      targets: this.egg,
      y: 200,
      duration: 3000,
      ease: 'Sine.easeOut',
      onComplete: () => {
        // Pulse the egg
        this.tweens.add({
          targets: this.egg,
          scaleX: 1.1,
          scaleY: 1.1,
          duration: 800,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });

        // Create physics body for egg
        this.physics.add.existing(this.egg, true);
        this.egg.body.setCircle(30, 10, 10);

        this.physics.add.overlap(
          this.player,
          this.egg,
          this.onReachEgg,
          null,
          this
        );

        this.events.emit('showMessage', 'Reach the egg!');
      },
    });
  }

  // --- Collision handlers ---
  onBulletHitEnemy(bullet, enemy) {
    if (!bullet.active || !enemy.active) return;

    bullet.kill();

    const dead = enemy.takeDamage(1);
    if (dead) {
      // Explosion
      this.explosionEmitter.emitParticleAt(enemy.x, enemy.y);
      if (this.cache.audio.exists('sfxExplosion')) {
        this.sound.play('sfxExplosion', { volume: 0.4 });
      }

      // Score
      this.score += enemy.scoreValue;
      this.events.emit('scoreChanged', this.score);

      // Drop powerup
      this.spawnPowerupDrop(enemy.x, enemy.y);

      enemy.setActive(false);
      enemy.setVisible(false);
      enemy.body.enable = false;
    }
  }

  onEnemyBulletHitPlayer(player, bullet) {
    if (!bullet.active || !player.active) return;

    bullet.kill();

    if (player.takeDamage()) {
      this.playerHit();
    }
  }

  onPlayerHitEnemy(player, enemy) {
    if (!player.active || !enemy.active) return;

    if (player.takeDamage()) {
      this.playerHit();
    }

    // Also kill the enemy on collision
    this.explosionEmitter.emitParticleAt(enemy.x, enemy.y);
    if (this.cache.audio.exists('sfxExplosion')) {
      this.sound.play('sfxExplosion', { volume: 0.4 });
    }
    this.score += Math.floor(enemy.scoreValue / 2);
    this.events.emit('scoreChanged', this.score);
    enemy.setActive(false);
    enemy.setVisible(false);
    enemy.body.enable = false;
  }

  onPlayerCollect(player, collectible) {
    if (!player.active || !collectible.active) return;

    const type = collectible.collectibleType;
    collectible.pickupEffect();

    switch (type) {
      case 'energy':
        this.score += SCORE_ENERGY;
        this.events.emit('scoreChanged', this.score);
        if (this.cache.audio.exists('sfxPickup')) {
          this.sound.play('sfxPickup', { volume: 0.4 });
        }
        break;
      case 'speedBoost':
        player.activatePowerup('speedBoost');
        this.events.emit('showMessage', 'Speed Boost!');
        this.events.emit('powerupChanged', 'speedBoost', true);
        if (this.cache.audio.exists('sfxPowerup')) {
          this.sound.play('sfxPowerup', { volume: 0.4 });
        }
        break;
      case 'rapidFire':
        player.activatePowerup('rapidFire');
        this.events.emit('showMessage', 'Rapid Fire!');
        this.events.emit('powerupChanged', 'rapidFire', true);
        if (this.cache.audio.exists('sfxPowerup')) {
          this.sound.play('sfxPowerup', { volume: 0.4 });
        }
        break;
      case 'shieldPickup':
        player.activatePowerup('shield');
        this.events.emit('showMessage', 'Shield Active!');
        this.events.emit('powerupChanged', 'shield', true);
        if (this.cache.audio.exists('sfxPowerup')) {
          this.sound.play('sfxPowerup', { volume: 0.4 });
        }
        break;
      case 'tripleShot':
        player.activatePowerup('tripleShot');
        this.events.emit('showMessage', 'Triple Shot!');
        this.events.emit('powerupChanged', 'tripleShot', true);
        if (this.cache.audio.exists('sfxPowerup')) {
          this.sound.play('sfxPowerup', { volume: 0.4 });
        }
        break;
    }
  }

  onReachEgg() {
    if (this.gameOver) return;
    this.gameOver = true;

    this.score += SCORE_STAGE_CLEAR * 5; // Big bonus for winning
    this.events.emit('scoreChanged', this.score);
    this.events.emit('showMessage', 'FERTILIZED!');

    // Victory flash
    this.cameras.main.flash(1000, 255, 255, 255);

    this.time.delayedCall(2000, () => {
      this.scene.stop('HudScene');
      this.scene.start('GameOverScene', {
        win: true,
        score: this.score,
        stage: this.currentStage,
        totalTime: this.totalTime,
      });
    });
  }

  playerHit() {
    this.explosionEmitter.emitParticleAt(this.player.x, this.player.y);
    if (this.cache.audio.exists('sfxHit')) {
      this.sound.play('sfxHit', { volume: 0.5 });
    }
    this.player.die();
    this.lives--;
    this.events.emit('livesChanged', this.lives);
    this.cameras.main.shake(200, 0.01);

    if (this.lives <= 0) {
      this.gameOver = true;
      this.time.delayedCall(1500, () => {
        this.scene.stop('HudScene');
        this.scene.start('GameOverScene', {
          win: false,
          score: this.score,
          stage: this.currentStage,
          totalTime: this.totalTime,
        });
      });
    } else {
      // Respawn
      this.time.delayedCall(1000, () => {
        if (!this.gameOver) {
          this.player.respawn(GAME_WIDTH / 2, GAME_HEIGHT - 80);
        }
      });
    }
  }

  completeStage() {
    this.score += SCORE_STAGE_CLEAR;
    this.events.emit('scoreChanged', this.score);
    this.events.emit('showMessage', `${STAGES[this.currentStage].name} cleared!`);
    this.cameras.main.flash(500, 255, 255, 200);

    this.scene.stop('HudScene');
    this.scene.start('StageClearScene', {
      stage: this.currentStage + 1,
      score: this.score,
      lives: this.lives,
      totalTime: this.totalTime,
      stageTime: this.realStageTime,
    });
  }
}
