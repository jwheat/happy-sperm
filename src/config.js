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

// Wall / tube boundaries
export const TUBE_WALL_THICKNESS = 8;
export const TUBE_MIN_WIDTH = 200;
export const TUBE_MAX_WIDTH = 440;
export const TUBE_SEGMENT_HEIGHT = 120;
