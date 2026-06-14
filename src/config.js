// Display
export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 720;

// Scrolling
export const SCROLL_SPEED = 120;           // pixels/sec base scroll speed
export const SCROLL_SPEED_INCREMENT = 10;  // increase per level
export const SCROLL_SPEED_BOOST_MULT = 3.5; // multiplier when speed boost active
export const SCROLL_POSITION_BONUS = 2.8;  // max multiplier bonus for being at top of screen

// Player
export const PLAYER_SPEED = 250;
export const PLAYER_LIVES = 3;
export const PLAYER_FIRE_RATE = 300;       // ms between shots
export const PLAYER_INVULN_TIME = 2000;    // ms invulnerability after hit
export const PLAYER_BULLET_SPEED = 450;

// Enemies
export const ENEMY_TYPES = {
  WHITE_BLOOD_CELL: {
    key: 'whiteBloodCell',
    hp: 2,
    speed: 80,
    score: 100,
    size: 20,
  },
  ANTIBODY: {
    key: 'antibody',
    hp: 1,
    speed: 150,
    score: 150,
    zigzag: true,
  },
  RIVAL_SPERM: {
    key: 'rivalSperm',
    hp: 1,
    speed: 100,
    score: 200,
    chase: true,
  },
  MUCUS_BLOB: {
    key: 'mucusBlob',
    hp: 3,
    speed: 40,
    score: 75,
    size: 32,
    shoots: true,
    fireRate: 2000,
  },
};

// Spawn rates (ms between spawns)
export const BASE_SPAWN_INTERVAL = 1200;
export const MIN_SPAWN_INTERVAL = 400;
export const SPAWN_INTERVAL_DECREASE = 50; // per level

// Collectibles
export const POWERUP_TYPES = {
  ENERGY: { key: 'energy', score: 25 },
  SPEED_BOOST: { key: 'speedBoost', duration: 5000 },
  RAPID_FIRE: { key: 'rapidFire', duration: 5000, fireRate: 120 },
  SHIELD: { key: 'shield', duration: 8000 },
  TRIPLE_SHOT: { key: 'tripleShot', duration: 6000 },
};
export const POWERUP_DROP_CHANCE = 0.25;
export const ENERGY_SPAWN_INTERVAL = 3000;

// Levels / stages
export const STAGES = [
  { name: 'The Uterus', color: 0xff6688, bgColor: 0x330011, length: 180 },
  { name: 'The Narrows', color: 0xff8866, bgColor: 0x331100, length: 180 },
  { name: 'Fallopian Tube', color: 0xffaa88, bgColor: 0x332200, length: 270 },
  { name: 'The Egg', color: 0xffffcc, bgColor: 0x333300, length: 120 },
];

// Scoring
export const SCORE_ENERGY = 25;
export const SCORE_STAGE_CLEAR = 1000;

// Bullet pool
export const BULLET_POOL_SIZE = 30;
export const ENEMY_BULLET_SPEED = 200;
export const ENEMY_BULLET_POOL_SIZE = 20;

// Bonus Round
export const BONUS_WAVE_COUNT = 4;
export const BONUS_WAVE_SPACING = 200;
export const BONUS_GATE_MIN_WIDTH = 120;
export const BONUS_GATE_MAX_WIDTH = 180;
export const BONUS_WALL_HEIGHT = 20;
export const BONUS_TURRET_HP = 2;
export const BONUS_TURRET_FIRE_RATE = 1400;
export const BONUS_TURRET_SCORE = 150;
export const BONUS_SCORE_MULTIPLIER = 2;
export const BONUS_COMPLETE_SCORE = 500;
export const BONUS_SCROLL_SPEED = 100;

// Debris clouds (environmental hazards)
export const DEBRIS_CLOUD_TYPES = {
  SLOW: {
    key: 'slowCloud',
    scrollMult: 0.4,       // scroll speed multiplier while inside
    moveMult: 0.4,         // player movement multiplier while inside
    minStage: 1,           // first appears in stage 1
  },
  TURBULENT: {
    key: 'turbulentCloud',
    scrollMult: 1.0,       // no scroll change
    moveMult: 1.8,         // oversensitive controls
    drag: 0.92,            // momentum/inertia factor (lower = more sliding)
    minStage: 2,           // first appears in stage 2
  },
};
export const DEBRIS_SPAWN_INTERVAL = 8000;   // ms between cloud spawns
export const DEBRIS_MIN_SPAWN_INTERVAL = 5000;
export const DEBRIS_SPAWN_DECREASE = 500;    // per stage

// Characters
export const CHARACTERS = {
  happy: {
    name: 'Happy',
    description: 'Balanced — well rounded for any situation',
    quote: '"A solid choice. The classics endure."',
    special: 'All-Rounder',
    specialDesc: 'No weaknesses, solid in every stat',
    stats: { speed: 3, accel: 3, health: 3, firepower: 3, special: 3 },
    speed: PLAYER_SPEED,
    fireRate: PLAYER_FIRE_RATE,
    bulletSpeed: PLAYER_BULLET_SPEED,
    lives: PLAYER_LIVES,
    colors: { head:    0xffffff,
              nucleus: 0xccddff,
              ribbon:  0x3399ff,
              tail:    0xddeeff },
    specialConfig: {},
  },
  zip: {
    name: 'Zip',
    description: 'Built for speed — fragile but blindingly fast',
    quote: 'Hold on to something.',
    special: 'Hyper Swim',
    specialDesc: 'Press SHIFT for an extreme speed burst',
    stats: { speed: 5, accel: 5, health: 2, firepower: 2, special: 4 },
    speed: PLAYER_SPEED * 1.4,
    fireRate: PLAYER_FIRE_RATE * 1.3,
    bulletSpeed: PLAYER_BULLET_SPEED * 0.85,
    lives: 2,
    colors: { head:    0xffe6f5,
              nucleus: 0xffb3dd,
              ribbon:  0xff44aa,
              tail:    0xff99dd },
    specialConfig: { duration: 1000, cooldown: 8000, speedMult: 3.0 },
  },
  tank: {
    name: 'Tank',
    description: 'Slow and tough — smashes through anything',
    quote: 'Property damage is expected.',
    special: 'Wall Breaker',
    specialDesc: 'Smash through obstacles and enemies',
    stats: { speed: 1, accel: 1, health: 5, firepower: 4, special: 4 },
    speed: PLAYER_SPEED * 0.7,
    fireRate: PLAYER_FIRE_RATE * 0.8,
    bulletSpeed: PLAYER_BULLET_SPEED * 1.1,
    lives: 5,
    colors: { head:    0xf2e6cc,
              nucleus: 0xccaa66,
              ribbon:  0xcc9900,
              tail:    0xe6d2aa },
    specialConfig: { ramDuration: 2000, ramCooldown: 10000 },
  },
  brainiac: {
    name: 'Brainiac',
    description: 'Smart swimmer — maximizes every pickup',
    quote: 'Prepare for a lecture and a victory.',
    special: 'Analyze',
    specialDesc: 'Powerups last 50% longer, +25% score bonus',
    stats: { speed: 2, accel: 3, health: 2, firepower: 3, special: 5 },
    speed: PLAYER_SPEED * 0.9,
    fireRate: PLAYER_FIRE_RATE,
    bulletSpeed: PLAYER_BULLET_SPEED,
    lives: 2,
    colors: { head:    0xf5fff5,
              nucleus: 0xccffcc,
              ribbon:  0x44cc44,
              tail:    0xccffdd },
    specialConfig: { durationMult: 1.5, scoreMult: 1.25 },
  },
  lucky: {
    name: 'Lucky',
    description: 'Fortune favors the bold — more drops and buffs',
    quote: 'This should be interesting.',
    special: 'Lucky Break',
    specialDesc: 'Double powerup drop chance & buff frequency',
    stats: { speed: 3, accel: 3, health: 3, firepower: 2, special: 5 },
    speed: PLAYER_SPEED,
    fireRate: PLAYER_FIRE_RATE * 1.1,
    bulletSpeed: PLAYER_BULLET_SPEED * 0.9,
    lives: PLAYER_LIVES,
    colors: { head:    0xfff4dd,
              nucleus: 0xffdd88,
              ribbon:  0xff9933,
              tail:    0xffcc88 },
    specialConfig: { dropMult: 2.0, energyIntervalMult: 0.6 },
  },
};

export const CHARACTER_IDS = Object.keys(CHARACTERS);

// Wall / tube boundaries
export const TUBE_WALL_THICKNESS = 8;
export const TUBE_MIN_WIDTH = 200;
export const TUBE_MAX_WIDTH = 440;
export const TUBE_SEGMENT_HEIGHT = 120;
