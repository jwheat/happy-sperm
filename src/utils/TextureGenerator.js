/**
 * Procedurally generates all game textures.
 * Called once during BootScene.
 */
export function generateTextures(scene) {
  const g = scene.make.graphics({ add: false });

  // --- Player sperm ---
  g.clear();
  // Head (oval)
  g.fillStyle(0xffffff, 1);
  g.fillEllipse(16, 12, 18, 22);
  // Nucleus
  g.fillStyle(0xccddff, 0.6);
  g.fillEllipse(16, 10, 10, 12);
  // Tail
  g.lineStyle(2, 0xccccff, 0.9);
  g.beginPath();
  g.moveTo(16, 23);
  g.lineTo(12, 32);
  g.lineTo(20, 40);
  g.lineTo(14, 48);
  g.lineTo(18, 54);
  g.stroke();
  g.generateTexture('player', 32, 56);

  // --- Player with shield ---
  g.clear();
  g.fillStyle(0x44aaff, 0.25);
  g.fillCircle(20, 32, 20);
  g.lineStyle(2, 0x44aaff, 0.6);
  g.strokeCircle(20, 32, 20);
  // Head
  g.fillStyle(0xffffff, 1);
  g.fillEllipse(20, 26, 18, 22);
  g.fillStyle(0xccddff, 0.6);
  g.fillEllipse(20, 24, 10, 12);
  // Tail
  g.lineStyle(2, 0xccccff, 0.9);
  g.beginPath();
  g.moveTo(20, 37);
  g.lineTo(16, 46);
  g.lineTo(24, 54);
  g.lineTo(18, 60);
  g.stroke();
  g.generateTexture('playerShield', 40, 64);

  // --- Player bullet ---
  g.clear();
  g.fillStyle(0xffffff, 1);
  g.fillCircle(4, 4, 4);
  g.fillStyle(0xeeeeff, 0.6);
  g.fillCircle(4, 4, 2);
  g.generateTexture('playerBullet', 8, 8);

  // --- Enemy: White blood cell ---
  g.clear();
  g.fillStyle(0xeedd99, 0.8);
  // Blobby irregular shape
  g.fillCircle(18, 18, 16);
  g.fillCircle(12, 12, 10);
  g.fillCircle(24, 14, 10);
  g.fillCircle(14, 24, 10);
  g.fillCircle(22, 24, 10);
  // Nucleus
  g.fillStyle(0x886644, 0.7);
  g.fillEllipse(18, 18, 14, 10);
  g.generateTexture('whiteBloodCell', 36, 36);

  // --- Enemy: Antibody ---
  g.clear();
  g.fillStyle(0xff6666, 0.9);
  // Y-shaped antibody
  g.fillRect(8, 12, 4, 16);
  // Left arm
  g.fillRect(0, 4, 4, 12);
  g.fillCircle(2, 4, 4);
  // Right arm
  g.fillRect(16, 4, 4, 12);
  g.fillCircle(18, 4, 4);
  // Stem
  g.fillCircle(10, 28, 5);
  g.generateTexture('antibody', 20, 34);

  // --- Enemy: Rival sperm ---
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

  // --- Enemy: Mucus blob ---
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
  // Draw a 5-pointed star manually
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
  // Arrow shape
  g.fillTriangle(10, 0, 0, 12, 20, 12);
  g.fillRect(6, 12, 8, 10);
  g.generateTexture('speedBoost', 20, 22);

  // --- Collectible: Rapid fire ---
  g.clear();
  g.fillStyle(0xff4444, 0.9);
  g.fillCircle(10, 10, 8);
  g.fillStyle(0xffff44, 1);
  // Lightning bolt
  g.fillTriangle(12, 2, 6, 12, 14, 10);
  g.fillTriangle(8, 10, 14, 18, 6, 12);
  g.generateTexture('rapidFire', 20, 20);

  // --- Collectible: Shield ---
  g.clear();
  g.fillStyle(0x4488ff, 0.9);
  // Shield shape
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

  // --- The Egg (boss / goal) ---
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

  // --- Debris cloud: Slow zone (thick amber honey) ---
  g.clear();
  // Main blob - translucent amber
  g.fillStyle(0xcc8822, 0.18);
  g.fillCircle(48, 40, 38);
  g.fillCircle(36, 50, 30);
  g.fillCircle(58, 34, 28);
  // Denser center
  g.fillStyle(0xddaa33, 0.15);
  g.fillCircle(46, 42, 24);
  g.fillCircle(38, 36, 18);
  // Thick honey streaks
  g.fillStyle(0xcc9933, 0.12);
  g.fillCircle(30, 30, 16);
  g.fillCircle(60, 50, 16);
  g.fillCircle(50, 56, 14);
  g.generateTexture('slowCloud', 96, 80);

  // --- Debris cloud: Turbulent zone (crackling blue/white) ---
  g.clear();
  // Outer turbulent haze
  g.fillStyle(0x4488cc, 0.14);
  g.fillCircle(48, 40, 36);
  g.fillCircle(34, 48, 28);
  g.fillCircle(60, 36, 28);
  // Inner crackling energy
  g.fillStyle(0x66aaff, 0.12);
  g.fillCircle(44, 38, 20);
  g.fillCircle(52, 46, 18);
  // Lightning crackle lines
  g.lineStyle(1, 0xaaddff, 0.25);
  g.beginPath();
  g.moveTo(24, 30); g.lineTo(38, 36); g.lineTo(30, 44); g.lineTo(46, 50);
  g.stroke();
  g.beginPath();
  g.moveTo(56, 24); g.lineTo(50, 38); g.lineTo(62, 42); g.lineTo(54, 56);
  g.stroke();
  // White sparks
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

  // --- Rating star (large, for stage clear screen) ---
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

  // Empty star (outline only)
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

  // --- Turret (for bonus round) ---
  g.clear();
  // Base circle
  g.fillStyle(0x556677, 1);
  g.fillCircle(12, 12, 10);
  // Inner ring
  g.fillStyle(0x778899, 1);
  g.fillCircle(12, 12, 6);
  // Barrel pointing down
  g.fillStyle(0x445566, 1);
  g.fillRect(9, 12, 6, 12);
  // Barrel tip
  g.fillStyle(0xff4444, 0.8);
  g.fillCircle(12, 24, 3);
  g.generateTexture('turret', 24, 28);

  // --- Turret destroyed ---
  g.clear();
  g.fillStyle(0x333333, 0.6);
  g.fillCircle(12, 12, 10);
  g.fillStyle(0x444444, 0.4);
  g.fillCircle(12, 12, 5);
  g.generateTexture('turretDead', 24, 24);

  g.destroy();
}
