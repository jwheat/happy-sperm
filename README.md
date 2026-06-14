# Happy Sperm

A retro-style arcade shooter built with [Phaser 3](https://phaser.io/) and [Vite](https://vitejs.dev/).

## About

Happy Sperm is a vertically-scrolling arcade shooter where you guide a determined sperm through increasingly difficult stages. All game assets — textures, sound effects, and music — are procedurally generated at runtime using the Phaser Graphics API, Web Audio API, and a real-time chiptune synthesizer. No external asset files required!

### Features

- Procedurally generated sprites, sounds, and chiptune music
- Multiple stages with increasing difficulty
- Bonus rounds
- Speed/position-based scoring system — move higher on screen to go faster
- Collectible power-ups and speed boosts
- HUD with score, timer, and stage info
- Fully playable in any modern browser

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)

### Install

```bash
npm install
```

### Run (Development)

```bash
npm run dev
```

This starts a local Vite dev server with hot reload. Open the URL shown in the terminal (typically `http://localhost:5173`).

### Build for Production

```bash
npm run build
```

Output goes to the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Package for Distribution

```bash
npm run package
```

Builds and creates a versioned `.zip` file ready for upload (e.g. to itch.io).

## Tech Stack

- **Phaser 3.90** — game framework
- **Vite 7** — build tool / dev server
- **Vanilla JavaScript** — no framework, ES modules throughout

## Project Structure

```
src/
  main.js              # Phaser game config & entry point
  config.js            # Game constants and tuning values
  scenes/
    BootScene.js        # Asset generation / preload
    TitleScene.js       # Title screen
    InstructionsScene.js
    GameScene.js        # Core gameplay
    HudScene.js         # Score / timer overlay
    StageClearScene.js  # Stage transition
    BonusRoundScene.js  # Bonus round
    GameOverScene.js    # Game over screen
  entities/
    Player.js
    Enemy.js
    Bullet.js
    Collectible.js
    DebrisCloud.js
  utils/
    TextureGenerator.js # Procedural sprite generation
    SoundGenerator.js   # Procedural SFX via Web Audio
    MusicPlayer.js      # Real-time chiptune synthesizer
```
