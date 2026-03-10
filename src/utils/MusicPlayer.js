/**
 * Procedural chiptune music player using Web Audio API.
 * Creates retro-style background music with bass, lead, and drums.
 */
export class MusicPlayer {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.playing = false;
    this.currentTrack = null;
    this.intervalId = null;
    this.step = 0;
    this.bpm = 140;
    this.nodes = [];
  }

  init(audioContext) {
    this.ctx = audioContext;
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.35;
    this.masterGain.connect(this.ctx.destination);
  }

  /**
   * Start playing a named track.
   */
  play(trackName) {
    if (this.currentTrack === trackName && this.playing) return;
    this.stop();
    this.currentTrack = trackName;
    this.playing = true;
    this.step = 0;

    const track = TRACKS[trackName];
    if (!track) return;

    this.bpm = track.bpm || 140;
    const msPerStep = (60 / this.bpm / 4) * 1000; // 16th notes

    this.intervalId = setInterval(() => {
      if (!this.playing) return;
      this.playStep(track);
      this.step++;
      if (this.step >= track.length) this.step = 0;
    }, msPerStep);
  }

  stop() {
    this.playing = false;
    this.currentTrack = null;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    // Kill lingering notes
    this.nodes.forEach((n) => {
      try { n.stop(); } catch (e) { /* already stopped */ }
    });
    this.nodes = [];
  }

  setVolume(v) {
    if (this.masterGain) this.masterGain.gain.value = v;
  }

  playStep(track) {
    const t = this.ctx.currentTime;

    // Bass line
    if (track.bass) {
      const note = track.bass[this.step % track.bass.length];
      if (note > 0) this.playTone(note, 'square', 0.12, 0.18);
    }

    // Lead melody
    if (track.lead) {
      const note = track.lead[this.step % track.lead.length];
      if (note > 0) this.playTone(note, 'square', 0.08, 0.1);
    }

    // Arpeggio / harmony
    if (track.arp) {
      const note = track.arp[this.step % track.arp.length];
      if (note > 0) this.playTone(note, 'triangle', 0.06, 0.08);
    }

    // Drums (noise hits)
    if (track.drums) {
      const hit = track.drums[this.step % track.drums.length];
      if (hit === 'K') this.playKick();
      else if (hit === 'S') this.playSnare();
      else if (hit === 'H') this.playHihat();
    }
  }

  playTone(freq, type, duration, volume) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + duration + 0.01);
    this.nodes.push(osc);
    this.cleanNodes();
  }

  playKick() {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.16);
    this.nodes.push(osc);
    this.cleanNodes();
  }

  playSnare() {
    const bufSize = this.ctx.sampleRate * 0.08;
    const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
    // Add a tonal hit
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = 200;
    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    src.connect(gain);
    gain.connect(this.masterGain);
    src.start();
    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
    src.stop(this.ctx.currentTime + 0.09);
    this.nodes.push(src, osc);
    this.cleanNodes();
  }

  playHihat() {
    const bufSize = this.ctx.sampleRate * 0.03;
    const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);
    // High-pass filter for tinny sound
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 8000;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    src.start();
    src.stop(this.ctx.currentTime + 0.04);
    this.nodes.push(src);
    this.cleanNodes();
  }

  cleanNodes() {
    // Keep node list from growing forever
    if (this.nodes.length > 50) {
      this.nodes = this.nodes.slice(-20);
    }
  }
}

// --- Note frequencies ---
const C3=131, D3=147, E3=165, F3=175, G3=196, A3=220, B3=247;
const C4=262, D4=294, E4=330, F4=349, G4=392, A4=440, B4=494;
const C5=523, D5=587, E5=659, F5=698, G5=784, A5=880, B5=988;
const _=0; // rest

// --- Track definitions ---
const TRACKS = {
  // Title screen: upbeat and catchy
  title: {
    bpm: 150,
    length: 64,
    bass: [
      C3,_,C3,_,  G3,_,G3,_,  A3,_,A3,_,  F3,_,G3,_,
      C3,_,C3,_,  G3,_,G3,_,  A3,_,A3,_,  F3,_,F3,_,
      C3,_,C3,_,  E3,_,E3,_,  F3,_,F3,_,  G3,_,G3,_,
      A3,_,A3,_,  G3,_,F3,_,  E3,_,E3,_,  G3,_,G3,_,
    ],
    lead: [
      E5,_,G5,_,  A5,_,G5,_,  E5,_,D5,_,  C5,_,D5,_,
      E5,_,G5,_,  A5,_,B5,_,  A5,_,G5,_,  E5,_,_,_,
      C5,_,E5,_,  G5,_,A5,_,  G5,_,E5,_,  D5,_,C5,_,
      E5,_,D5,_,  C5,_,D5,_,  E5,_,G5,_,  A5,_,_,_,
    ],
    drums: [
      'K',_,'H',_,  'S',_,'H',_,  'K',_,'H',_,  'S',_,'H','H',
      'K',_,'H',_,  'S',_,'H',_,  'K','K','H',_,  'S',_,'H',_,
      'K',_,'H',_,  'S',_,'H',_,  'K',_,'H',_,  'S',_,'H','H',
      'K',_,'H',_,  'S',_,'H','H', 'K','K','S',_,  'S',_,'K',_,
    ],
  },

  // Gameplay: driving and intense, gets you pumping
  game: {
    bpm: 160,
    length: 64,
    bass: [
      A3,_,A3,_,  A3,_,A3,_,  C4,_,C4,_,  D4,_,D4,_,
      A3,_,A3,_,  G3,_,G3,_,  F3,_,F3,_,  G3,_,A3,_,
      A3,_,A3,_,  A3,_,A3,_,  C4,_,C4,_,  D4,_,D4,_,
      F3,_,F3,_,  G3,_,G3,_,  A3,_,A3,_,  A3,_,_,_,
    ],
    lead: [
      A5,_,_,_,  C5,_,D5,_,  E5,_,_,_,  D5,_,C5,_,
      A4,_,_,_,  G4,_,A4,_,  C5,_,_,_,  D5,_,_,_,
      E5,_,_,_,  G5,_,E5,_,  D5,_,_,_,  C5,_,A4,_,
      C5,_,D5,_,  E5,_,D5,_,  C5,_,A4,_,  A4,_,_,_,
    ],
    arp: [
      A4,C5,E5,A4,  C5,E5,A4,C5,  C5,E5,G5,C5,  D5,F5,A5,D5,
      A4,C5,E5,A4,  G4,B4,D5,G4,  F4,A4,C5,F4,  G4,B4,D5,G4,
      A4,C5,E5,A4,  C5,E5,A4,C5,  C5,E5,G5,C5,  D5,F5,A5,D5,
      F4,A4,C5,F4,  G4,B4,D5,G4,  A4,C5,E5,A4,  A4,C5,E5,_,
    ],
    drums: [
      'K',_,'H',_,  'S',_,'H',_,  'K','K','H',_,  'S',_,'H','H',
      'K',_,'H',_,  'S',_,'H','H', 'K',_,'H',_,  'S',_,'K',_,
      'K',_,'H',_,  'S',_,'H',_,  'K','K','H',_,  'S',_,'H','H',
      'K',_,'H','H', 'S',_,'H',_,  'K','K','S','S', 'K',_,'S',_,
    ],
  },

  // Game over (loss): somber and slow
  gameOver: {
    bpm: 80,
    length: 32,
    bass: [
      A3,_,_,_,  _,_,E3,_,  F3,_,_,_,  _,_,E3,_,
      D3,_,_,_,  _,_,E3,_,  A3,_,_,_,  _,_,_,_,
    ],
    lead: [
      A4,_,_,C5,  _,_,A4,_,  F4,_,_,E4,  _,_,_,_,
      D4,_,_,E4,  _,_,C4,_,  A3,_,_,_,  _,_,_,_,
    ],
    drums: [
      'K',_,_,_,  _,_,_,_,  'S',_,_,_,  _,_,_,_,
      'K',_,_,_,  _,_,_,_,  'S',_,_,_,  _,_,_,_,
    ],
  },

  // Game over (win): triumphant fanfare
  victory: {
    bpm: 130,
    length: 64,
    bass: [
      C3,_,C3,_,  G3,_,G3,_,  A3,_,A3,_,  E3,_,E3,_,
      F3,_,F3,_,  C3,_,C3,_,  G3,_,G3,_,  C4,_,C4,_,
      C3,_,C3,_,  G3,_,G3,_,  A3,_,A3,_,  E3,_,E3,_,
      F3,_,F3,_,  G3,_,G3,_,  C4,_,_,_,  C4,_,_,_,
    ],
    lead: [
      C5,_,E5,_,  G5,_,A5,_,  G5,_,E5,_,  C5,_,E5,_,
      F5,_,E5,_,  C5,_,E5,_,  G5,_,B5,_,  C5,_,_,_,
      C5,_,E5,_,  G5,_,A5,_,  B5,_,A5,_,  G5,_,E5,_,
      F5,_,G5,_,  A5,_,G5,_,  C5,_,_,_,  _,_,_,_,
    ],
    arp: [
      C5,E5,G5,C5,  G4,B4,D5,G4,  A4,C5,E5,A4,  E4,G4,B4,E4,
      F4,A4,C5,F4,  C4,E4,G4,C4,  G4,B4,D5,G4,  C5,E5,G5,C5,
      C5,E5,G5,C5,  G4,B4,D5,G4,  A4,C5,E5,A4,  E4,G4,B4,E4,
      F4,A4,C5,F4,  G4,B4,D5,G4,  C5,E5,G5,_,  _,_,_,_,
    ],
    drums: [
      'K',_,'H',_,  'S',_,'H',_,  'K',_,'H',_,  'S',_,'H','H',
      'K',_,'H',_,  'S',_,'H',_,  'K','K','H',_,  'S',_,'S',_,
      'K',_,'H',_,  'S',_,'H',_,  'K',_,'H',_,  'S',_,'H','H',
      'K',_,'H',_,  'S',_,'H','H', 'K','K','S','S', 'K',_,_,_,
    ],
  },
};
