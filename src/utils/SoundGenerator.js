/**
 * Procedurally generates all game sounds using Web Audio API.
 * Called once during BootScene.
 */
export function generateSounds(scene) {
  const audioCtx = scene.sound.context;

  // Helper: render an offline buffer from a builder function
  function createSound(duration, sampleRate, builder) {
    const offline = new OfflineAudioContext(1, sampleRate * duration, sampleRate);
    builder(offline);
    return offline.startRendering().then((buffer) => {
      scene.cache.audio.add(arguments[3], buffer);
    });
  }

  const promises = [];

  // --- Player shoot: short bright "pew" ---
  promises.push(
    renderBuffer(audioCtx.sampleRate, 0.12, (buf) => {
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        const t = i / buf.sampleRate;
        const freq = 1200 - t * 8000; // descending chirp
        data[i] = Math.sin(2 * Math.PI * freq * t) * (1 - t / 0.12) * 0.3;
      }
    }).then((buffer) => {
      scene.cache.audio.add('sfxShoot', buffer);
    })
  );

  // --- Triple shot: wider "pew" ---
  promises.push(
    renderBuffer(audioCtx.sampleRate, 0.15, (buf) => {
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        const t = i / buf.sampleRate;
        const freq = 1400 - t * 9000;
        const freq2 = 900 - t * 5000;
        const env = (1 - t / 0.15);
        data[i] = (Math.sin(2 * Math.PI * freq * t) + Math.sin(2 * Math.PI * freq2 * t)) * env * 0.2;
      }
    }).then((buffer) => {
      scene.cache.audio.add('sfxTripleShoot', buffer);
    })
  );

  // --- Enemy explosion: crunchy burst ---
  promises.push(
    renderBuffer(audioCtx.sampleRate, 0.25, (buf) => {
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        const t = i / buf.sampleRate;
        const noise = Math.random() * 2 - 1;
        const tone = Math.sin(2 * Math.PI * (150 - t * 400) * t);
        const env = Math.max(0, 1 - t / 0.25);
        data[i] = (noise * 0.4 + tone * 0.6) * env * env * 0.35;
      }
    }).then((buffer) => {
      scene.cache.audio.add('sfxExplosion', buffer);
    })
  );

  // --- Enemy dive/kamikaze: descending angry buzz ---
  promises.push(
    renderBuffer(audioCtx.sampleRate, 0.4, (buf) => {
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        const t = i / buf.sampleRate;
        const freq = 600 - t * 800;
        const buzz = Math.sign(Math.sin(2 * Math.PI * freq * t)); // square wave
        const mod = Math.sin(2 * Math.PI * 30 * t); // tremolo
        const env = Math.max(0, 1 - t / 0.4);
        data[i] = buzz * (0.5 + 0.5 * mod) * env * 0.2;
      }
    }).then((buffer) => {
      scene.cache.audio.add('sfxDive', buffer);
    })
  );

  // --- Player hit: painful thud ---
  promises.push(
    renderBuffer(audioCtx.sampleRate, 0.3, (buf) => {
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        const t = i / buf.sampleRate;
        const noise = Math.random() * 2 - 1;
        const tone = Math.sin(2 * Math.PI * (80 - t * 100) * t);
        const env = Math.max(0, 1 - t / 0.3);
        data[i] = (noise * 0.3 + tone * 0.7) * env * env * 0.4;
      }
    }).then((buffer) => {
      scene.cache.audio.add('sfxHit', buffer);
    })
  );

  // --- Pickup collect: happy ascending blip ---
  promises.push(
    renderBuffer(audioCtx.sampleRate, 0.15, (buf) => {
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        const t = i / buf.sampleRate;
        const freq = 600 + t * 3000; // ascending
        const env = (1 - t / 0.15);
        data[i] = Math.sin(2 * Math.PI * freq * t) * env * 0.25;
      }
    }).then((buffer) => {
      scene.cache.audio.add('sfxPickup', buffer);
    })
  );

  // --- Powerup collect: sparkly arpeggio ---
  promises.push(
    renderBuffer(audioCtx.sampleRate, 0.3, (buf) => {
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        const t = i / buf.sampleRate;
        const step = Math.floor(t * 12); // 4 notes in 0.3s
        const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
        const freq = notes[Math.min(step % 4, 3)];
        const env = (1 - t / 0.3);
        data[i] = Math.sin(2 * Math.PI * freq * t) * env * 0.2;
      }
    }).then((buffer) => {
      scene.cache.audio.add('sfxPowerup', buffer);
    })
  );

  // --- Enemy shoot: lower "bwop" ---
  promises.push(
    renderBuffer(audioCtx.sampleRate, 0.1, (buf) => {
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        const t = i / buf.sampleRate;
        const freq = 400 - t * 2000;
        data[i] = Math.sin(2 * Math.PI * freq * t) * (1 - t / 0.1) * 0.2;
      }
    }).then((buffer) => {
      scene.cache.audio.add('sfxEnemyShoot', buffer);
    })
  );

  return Promise.all(promises);
}

/**
 * Render a procedural audio buffer offline.
 */
function renderBuffer(sampleRate, duration, fillFn) {
  const length = Math.floor(sampleRate * duration);
  const buffer = new AudioBuffer({
    numberOfChannels: 1,
    length,
    sampleRate,
  });
  fillFn(buffer);
  return Promise.resolve(buffer);
}
