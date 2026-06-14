/**
 * Procedurally generates all game textures and animations.
 * Called once during BootScene.
 */

const ANIM_FRAMES = 6;  // frames for sperm swim animations
const ENEMY_ANIM_FRAMES = 4; // frames for enemy animations

// --- Helper: draw a wiggling sperm tail using sine wave ---
function drawSpermTail(g, startX, startY, phase, color, alpha, segments, segLen, amplitude) {
  g.lineStyle(2, color, alpha);
  g.beginPath();
  g.moveTo(startX, startY);
  for (let i = 1; i <= segments; i++) {
    const t = i / segments;
    // Amplitude grows toward the tip for natural tail motion
    const amp = amplitude * (0.3 + t * 0.7);
    const x = startX + Math.sin(phase + t * Math.PI * 2.5) * amp;
    const y = startY + i * segLen;
    g.lineTo(x, y);
  }
  g.stroke();
}

// --- Helper: draw sperm head ---
function drawSpermHead(g, cx, cy, headColor, nucleusColor, headW, headH, nucW, nucH) {
  g.fillStyle(headColor, 1);
  g.fillEllipse(cx, cy, headW, headH);
  g.fillStyle(nucleusColor, 0.6);
  g.fillEllipse(cx, cy - 2, nucW, nucH);
}

import { CHARACTERS, CHARACTER_IDS } from '../config.js';

export function generateTextures(scene) {
  const g = scene.make.graphics({ add: false });

  // ===================================================
  // STATIC TEXTURES (used by instructions screen, etc.)
  // ===================================================

  // --- Per-character player sperm textures ---
  CHARACTER_IDS.forEach((id) => {
    const ch = CHARACTERS[id];
    const { head, nucleus, tail } = ch.colors;

    // Static fallback
    g.clear();
    drawSpermHead(g, 16, 12, head, nucleus, 18, 22, 10, 12);
    drawSpermTail(g, 16, 23, 0, tail, 0.9, 8, 4, 6);
    g.generateTexture(`player_${id}`, 32, 56);

    // Shield static fallback
    g.clear();
    g.fillStyle(0x44aaff, 0.25);
    g.fillCircle(20, 32, 20);
    g.lineStyle(2, 0x44aaff, 0.6);
    g.strokeCircle(20, 32, 20);
    drawSpermHead(g, 20, 26, head, nucleus, 18, 22, 10, 12);
    drawSpermTail(g, 20, 37, 0, tail, 0.9, 6, 4, 5);
    g.generateTexture(`playerShield_${id}`, 40, 64);
  });

  // Keep default 'player' texture for backward compat (uses happy colors)
  g.clear();
  drawSpermHead(g, 16, 12, 0xffffff, 0xccddff, 18, 22, 10, 12);
  drawSpermTail(g, 16, 23, 0, 0xccccff, 0.9, 8, 4, 6);
  g.generateTexture('player', 32, 56);

  // --- Player bullet ---
  g.clear();
  g.fillStyle(0xffffff, 1);
  g.fillCircle(4, 4, 4);
  g.fillStyle(0xeeeeff, 0.6);
  g.fillCircle(4, 4, 2);
  g.generateTexture('playerBullet', 8, 8);

  // --- Enemy: White blood cell (static) ---
  g.clear();
  g.fillStyle(0xeedd99, 0.8);
  g.fillCircle(18, 18, 16);
  g.fillCircle(12, 12, 10);
  g.fillCircle(24, 14, 10);
  g.fillCircle(14, 24, 10);
  g.fillCircle(22, 24, 10);
  g.fillStyle(0x886644, 0.7);
  g.fillEllipse(18, 18, 14, 10);
  g.generateTexture('whiteBloodCell', 36, 36);

  // --- Enemy: Antibody (static) ---
  g.clear();
  g.fillStyle(0xff6666, 0.9);
  g.fillRect(8, 12, 4, 16);
  g.fillRect(0, 4, 4, 12);
  g.fillCircle(2, 4, 4);
  g.fillRect(16, 4, 4, 12);
  g.fillCircle(18, 4, 4);
  g.fillCircle(10, 28, 5);
  g.generateTexture('antibody', 20, 34);

  // --- Enemy: Rival sperm (static) ---
  g.clear();
  g.fillStyle(0xff8888, 1);
  g.fillEllipse(12, 10, 14, 18);
  g.fillStyle(0xcc6666, 0.6);
  g.fillEllipse(12, 8, 8, 10);
  g.lineStyle(2, 0xff8888, 0.8);
  g.beginPath();
  g.moveTo(12, 19);
  g.lineTo(8, 28);
  g.lineTo(16, 36);
  g.lineTo(10, 44);
  g.stroke();
  g.generateTexture('rivalSperm', 24, 46);

  // --- Enemy: Mucus blob (static) ---
  g.clear();
  g.fillStyle(0x88cc66, 0.7);
  g.fillCircle(20, 20, 18);
  g.fillCircle(12, 14, 12);
  g.fillCircle(28, 16, 12);
  g.fillCircle(16, 28, 12);
  g.fillCircle(26, 26, 12);
  g.fillStyle(0x66aa44, 0.5);
  g.fillCircle(20, 20, 10);
  g.generateTexture('mucusBlob', 40, 40);

  // --- Enemy bullet ---
  g.clear();
  g.fillStyle(0x88cc66, 1);
  g.fillCircle(3, 3, 3);
  g.generateTexture('enemyBullet', 6, 6);

  // --- Collectible: Energy ---
  g.clear();
  g.fillStyle(0xffff44, 0.9);
  g.beginPath();
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? 10 : 4;
    const angle = (Math.PI / 2 * 3) + (i * Math.PI / 5);
    const x = 10 + Math.cos(angle) * radius;
    const y = 10 + Math.sin(angle) * radius;
    if (i === 0) g.moveTo(x, y);
    else g.lineTo(x, y);
  }
  g.closePath();
  g.fillPath();
  g.fillStyle(0xffffff, 0.5);
  g.beginPath();
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? 6 : 2;
    const angle = (Math.PI / 2 * 3) + (i * Math.PI / 5);
    const x = 10 + Math.cos(angle) * radius;
    const y = 10 + Math.sin(angle) * radius;
    if (i === 0) g.moveTo(x, y);
    else g.lineTo(x, y);
  }
  g.closePath();
  g.fillPath();
  g.generateTexture('energy', 20, 20);

  // --- Collectible: Speed boost ---
  g.clear();
  g.fillStyle(0x44ffff, 0.9);
  g.fillTriangle(10, 0, 0, 12, 20, 12);
  g.fillRect(6, 12, 8, 10);
  g.generateTexture('speedBoost', 20, 22);

  // --- Collectible: Rapid fire ---
  g.clear();
  g.fillStyle(0xff4444, 0.9);
  g.fillCircle(10, 10, 8);
  g.fillStyle(0xffff44, 1);
  g.fillTriangle(12, 2, 6, 12, 14, 10);
  g.fillTriangle(8, 10, 14, 18, 6, 12);
  g.generateTexture('rapidFire', 20, 20);

  // --- Collectible: Shield ---
  g.clear();
  g.fillStyle(0x4488ff, 0.9);
  g.fillRoundedRect(2, 2, 16, 18, 3);
  g.fillStyle(0x88bbff, 0.6);
  g.fillRoundedRect(5, 5, 10, 12, 2);
  g.generateTexture('shieldPickup', 20, 22);

  // --- Collectible: Triple shot ---
  g.clear();
  g.fillStyle(0xff88ff, 0.9);
  g.fillCircle(4, 10, 3);
  g.fillCircle(10, 4, 3);
  g.fillCircle(16, 10, 3);
  g.lineStyle(1, 0xff88ff, 0.6);
  g.lineBetween(4, 10, 10, 4);
  g.lineBetween(10, 4, 16, 10);
  g.generateTexture('tripleShot', 20, 14);

  // --- Wall tissue texture tile ---
  g.clear();
  g.fillStyle(0xcc4466, 1);
  g.fillRect(0, 0, 32, 32);
  g.fillStyle(0xaa3355, 0.6);
  g.fillCircle(8, 8, 6);
  g.fillCircle(24, 24, 6);
  g.fillStyle(0xdd5577, 0.4);
  g.fillCircle(20, 8, 4);
  g.fillCircle(8, 24, 4);
  g.generateTexture('wallTile', 32, 32);

  // --- Background tile ---
  g.clear();
  g.fillStyle(0x330022, 1);
  g.fillRect(0, 0, 64, 64);
  g.fillStyle(0x440033, 0.3);
  g.fillCircle(16, 16, 8);
  g.fillCircle(48, 48, 8);
  g.fillStyle(0x220011, 0.4);
  g.fillCircle(40, 12, 6);
  g.fillCircle(12, 44, 6);
  g.generateTexture('bgTile', 64, 64);

  // --- The Egg ---
  g.clear();
  g.fillStyle(0xffffcc, 0.3);
  g.fillCircle(40, 40, 38);
  g.fillStyle(0xffffdd, 0.5);
  g.fillCircle(40, 40, 30);
  g.fillStyle(0xffffee, 0.7);
  g.fillCircle(40, 40, 22);
  g.fillStyle(0xffffff, 0.9);
  g.fillCircle(40, 40, 14);
  g.generateTexture('egg', 80, 80);

  // --- Debris clouds (unchanged) ---
  g.clear();
  g.fillStyle(0xcc8822, 0.18);
  g.fillCircle(48, 40, 38);
  g.fillCircle(36, 50, 30);
  g.fillCircle(58, 34, 28);
  g.fillStyle(0xddaa33, 0.15);
  g.fillCircle(46, 42, 24);
  g.fillCircle(38, 36, 18);
  g.fillStyle(0xcc9933, 0.12);
  g.fillCircle(30, 30, 16);
  g.fillCircle(60, 50, 16);
  g.fillCircle(50, 56, 14);
  g.generateTexture('slowCloud', 96, 80);

  g.clear();
  g.fillStyle(0x4488cc, 0.14);
  g.fillCircle(48, 40, 36);
  g.fillCircle(34, 48, 28);
  g.fillCircle(60, 36, 28);
  g.fillStyle(0x66aaff, 0.12);
  g.fillCircle(44, 38, 20);
  g.fillCircle(52, 46, 18);
  g.lineStyle(1, 0xaaddff, 0.25);
  g.beginPath();
  g.moveTo(24, 30); g.lineTo(38, 36); g.lineTo(30, 44); g.lineTo(46, 50);
  g.stroke();
  g.beginPath();
  g.moveTo(56, 24); g.lineTo(50, 38); g.lineTo(62, 42); g.lineTo(54, 56);
  g.stroke();
  g.fillStyle(0xffffff, 0.2);
  g.fillCircle(38, 36, 4);
  g.fillCircle(54, 44, 3);
  g.fillCircle(46, 28, 3);
  g.generateTexture('turbulentCloud', 96, 80);

  // --- Particle ---
  g.clear();
  g.fillStyle(0xffffff, 1);
  g.fillCircle(3, 3, 3);
  g.generateTexture('particle', 6, 6);

  // --- Rating stars ---
  g.clear();
  g.fillStyle(0xffdd00, 1);
  g.beginPath();
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? 20 : 8;
    const angle = (Math.PI / 2 * 3) + (i * Math.PI / 5);
    const x = 20 + Math.cos(angle) * radius;
    const y = 20 + Math.sin(angle) * radius;
    if (i === 0) g.moveTo(x, y);
    else g.lineTo(x, y);
  }
  g.closePath();
  g.fillPath();
  g.generateTexture('starFull', 40, 40);

  g.clear();
  g.lineStyle(2, 0x666666, 0.8);
  g.beginPath();
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? 20 : 8;
    const angle = (Math.PI / 2 * 3) + (i * Math.PI / 5);
    const x = 20 + Math.cos(angle) * radius;
    const y = 20 + Math.sin(angle) * radius;
    if (i === 0) g.moveTo(x, y);
    else g.lineTo(x, y);
  }
  g.closePath();
  g.strokePath();
  g.generateTexture('starEmpty', 40, 40);

  // --- Turret ---
  g.clear();
  g.fillStyle(0x556677, 1);
  g.fillCircle(12, 12, 10);
  g.fillStyle(0x778899, 1);
  g.fillCircle(12, 12, 6);
  g.fillStyle(0x445566, 1);
  g.fillRect(9, 12, 6, 12);
  g.fillStyle(0xff4444, 0.8);
  g.fillCircle(12, 24, 3);
  g.generateTexture('turret', 24, 28);

  g.clear();
  g.fillStyle(0x333333, 0.6);
  g.fillCircle(12, 12, 10);
  g.fillStyle(0x444444, 0.4);
  g.fillCircle(12, 12, 5);
  g.generateTexture('turretDead', 24, 24);

  // ===================================================
  // ANIMATION FRAME TEXTURES
  // ===================================================

  // --- Per-character swim frames ---
  CHARACTER_IDS.forEach((id) => {
    const ch = CHARACTERS[id];
    const { head, nucleus, tail } = ch.colors;

    for (let f = 0; f < ANIM_FRAMES; f++) {
      const phase = (f / ANIM_FRAMES) * Math.PI * 2;
      g.clear();
      drawSpermHead(g, 16, 12, head, nucleus, 18, 22, 10, 12);
      drawSpermTail(g, 16, 23, phase, tail, 0.9, 8, 4, 6);
      g.generateTexture(`player_${id}_${f}`, 32, 56);
    }

    for (let f = 0; f < ANIM_FRAMES; f++) {
      const phase = (f / ANIM_FRAMES) * Math.PI * 2;
      g.clear();
      g.fillStyle(0x44aaff, 0.25);
      g.fillCircle(20, 32, 20);
      g.lineStyle(2, 0x44aaff, 0.6);
      g.strokeCircle(20, 32, 20);
      drawSpermHead(g, 20, 26, head, nucleus, 18, 22, 10, 12);
      drawSpermTail(g, 20, 37, phase, tail, 0.9, 6, 4, 5);
      g.generateTexture(`playerShield_${id}_${f}`, 40, 64);
    }
  });

  // --- Rival sperm swim frames ---
  for (let f = 0; f < ANIM_FRAMES; f++) {
    const phase = (f / ANIM_FRAMES) * Math.PI * 2;
    g.clear();
    drawSpermHead(g, 12, 10, 0xff8888, 0xcc6666, 14, 18, 8, 10);
    drawSpermTail(g, 12, 19, phase, 0xff8888, 0.8, 7, 3.5, 5);
    g.generateTexture(`rivalSperm_${f}`, 24, 46);
  }

  // --- White blood cell pulse frames ---
  // Pseudopods extend and retract in a cycle
  for (let f = 0; f < ENEMY_ANIM_FRAMES; f++) {
    const t = (f / ENEMY_ANIM_FRAMES) * Math.PI * 2;
    g.clear();
    g.fillStyle(0xeedd99, 0.8);
    // Main body
    g.fillCircle(18, 18, 16);
    // Pseudopods that pulse outward in sequence
    const p0 = 10 + Math.sin(t) * 3;
    const p1 = 10 + Math.sin(t + Math.PI * 0.5) * 3;
    const p2 = 10 + Math.sin(t + Math.PI) * 3;
    const p3 = 10 + Math.sin(t + Math.PI * 1.5) * 3;
    g.fillCircle(12, 12, p0);  // top-left
    g.fillCircle(24, 14, p1);  // top-right
    g.fillCircle(14, 24, p2);  // bottom-left
    g.fillCircle(22, 24, p3);  // bottom-right
    // Nucleus wobble
    const nw = 14 + Math.sin(t * 0.5) * 2;
    const nh = 10 + Math.cos(t * 0.5) * 2;
    g.fillStyle(0x886644, 0.7);
    g.fillEllipse(18, 18, nw, nh);
    g.generateTexture(`whiteBloodCell_${f}`, 36, 36);
  }

  // --- Antibody wobble frames ---
  // Arms sway left/right
  for (let f = 0; f < ENEMY_ANIM_FRAMES; f++) {
    const t = (f / ENEMY_ANIM_FRAMES) * Math.PI * 2;
    const sway = Math.sin(t) * 3;
    g.clear();
    g.fillStyle(0xff6666, 0.9);
    // Central stem
    g.fillRect(8, 12, 4, 16);
    // Left arm (sways)
    g.fillRect(0 + sway, 4, 4, 12);
    g.fillCircle(2 + sway, 4, 4);
    // Right arm (sways opposite)
    g.fillRect(16 - sway, 4, 4, 12);
    g.fillCircle(18 - sway, 4, 4);
    // Stem base
    g.fillCircle(10, 28, 5);
    // Binding tips glow
    g.fillStyle(0xff9999, 0.6);
    g.fillCircle(2 + sway, 4, 2);
    g.fillCircle(18 - sway, 4, 2);
    g.generateTexture(`antibody_${f}`, 22, 34);
  }

  // --- Mucus blob pulse frames ---
  // Sub-blobs shift around and pulse
  for (let f = 0; f < ENEMY_ANIM_FRAMES; f++) {
    const t = (f / ENEMY_ANIM_FRAMES) * Math.PI * 2;
    g.clear();
    g.fillStyle(0x88cc66, 0.7);
    // Main body pulses
    const mainR = 18 + Math.sin(t) * 2;
    g.fillCircle(20, 20, mainR);
    // Sub-blobs orbit slightly
    g.fillCircle(12 + Math.sin(t) * 2, 14 + Math.cos(t) * 1.5, 12);
    g.fillCircle(28 + Math.cos(t) * 2, 16 + Math.sin(t) * 1.5, 12);
    g.fillCircle(16 + Math.sin(t + 1) * 2, 28 + Math.cos(t + 1) * 1.5, 12);
    g.fillCircle(26 + Math.cos(t + 1) * 2, 26 + Math.sin(t + 1) * 1.5, 12);
    // Inner nucleus
    g.fillStyle(0x66aa44, 0.5);
    const innerR = 10 + Math.sin(t + Math.PI) * 2;
    g.fillCircle(20, 20, innerR);
    // Drip detail
    g.fillStyle(0x99dd77, 0.3);
    g.fillCircle(20, 20 + mainR - 4, 4);
    g.generateTexture(`mucusBlob_${f}`, 40, 40);
  }

  g.destroy();

  // ===================================================
  // CREATE ANIMATIONS
  // ===================================================

  // Per-character swim & shield animations
  CHARACTER_IDS.forEach((id) => {
    scene.anims.create({
      key: `playerSwim_${id}`,
      frames: Array.from({ length: ANIM_FRAMES }, (_, i) => ({ key: `player_${id}_${i}` })),
      frameRate: 10,
      repeat: -1,
    });

    scene.anims.create({
      key: `playerShieldSwim_${id}`,
      frames: Array.from({ length: ANIM_FRAMES }, (_, i) => ({ key: `playerShield_${id}_${i}` })),
      frameRate: 10,
      repeat: -1,
    });
  });

  // Rival sperm swim
  scene.anims.create({
    key: 'rivalSpermSwim',
    frames: Array.from({ length: ANIM_FRAMES }, (_, i) => ({ key: `rivalSperm_${i}` })),
    frameRate: 10,
    repeat: -1,
  });

  // White blood cell pulse
  scene.anims.create({
    key: 'wbcPulse',
    frames: Array.from({ length: ENEMY_ANIM_FRAMES }, (_, i) => ({ key: `whiteBloodCell_${i}` })),
    frameRate: 4,
    repeat: -1,
  });

  // Antibody wobble
  scene.anims.create({
    key: 'antibodyWobble',
    frames: Array.from({ length: ENEMY_ANIM_FRAMES }, (_, i) => ({ key: `antibody_${i}` })),
    frameRate: 6,
    repeat: -1,
  });

  // Mucus blob pulse
  scene.anims.create({
    key: 'mucusBlobPulse',
    frames: Array.from({ length: ENEMY_ANIM_FRAMES }, (_, i) => ({ key: `mucusBlob_${i}` })),
    frameRate: 3,
    repeat: -1,
  });
}
