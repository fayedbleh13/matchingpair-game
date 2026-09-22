import { Storage } from './storage.js';

// Procedural Web Audio Engine + Custom Audio Track Player
// 100% Offline, Zero external asset delay, fully customizable volume & mute
class SoundManager {
  constructor() {
    this.ctx = null;
    const settings = Storage.getSettings();
    this.musicVolume = settings.musicVolume ?? 0.5;
    this.sfxVolume = settings.sfxVolume ?? 0.8;
    this.musicMuted = settings.musicMuted ?? false;
    this.sfxMuted = settings.sfxMuted ?? false;

    // BGM state
    this.bgmTimer = null;
    this.bgmRunning = false;
    this.bgmStep = 0;
    this.musicGain = null;
    this.sfxGain = null;

    // Dual-track audio engine: Menu (bgm.mp3) vs Game/Result (The_Final_Combo.mp3)
    this.currentTrack = null; // 'menu' | 'game'
    this.menuAudio = null;
    this.gameAudio = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.setValueAtTime(this.musicMuted ? 0 : this.musicVolume * 0.25, this.ctx.currentTime);
        this.musicGain.connect(this.ctx.destination);

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(this.sfxMuted ? 0 : this.sfxVolume, this.ctx.currentTime);
        this.sfxGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // --- Volume & Settings Controls ---
  setMusicVolume(vol) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(this.musicMuted ? 0 : this.musicVolume * 0.25, this.ctx.currentTime);
    }
    if (this.menuAudio) {
      this.menuAudio.volume = this.musicMuted ? 0 : this.musicVolume;
    }
    if (this.gameAudio) {
      this.gameAudio.volume = this.musicMuted ? 0 : this.musicVolume;
    }
    Storage.saveSettings({ musicVolume: this.musicVolume });
  }

  setSFXVolume(vol) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.sfxMuted ? 0 : this.sfxVolume, this.ctx.currentTime);
    }
    Storage.saveSettings({ sfxVolume: this.sfxVolume });
  }

  setMusicMuted(muted) {
    this.musicMuted = muted;
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(this.musicMuted ? 0 : this.musicVolume * 0.25, this.ctx.currentTime);
    }
    if (this.menuAudio) {
      this.menuAudio.volume = this.musicMuted ? 0 : this.musicVolume;
    }
    if (this.gameAudio) {
      this.gameAudio.volume = this.musicMuted ? 0 : this.musicVolume;
    }
    Storage.saveSettings({ musicMuted: this.musicMuted });
  }

  setSFXMuted(muted) {
    this.sfxMuted = muted;
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.sfxMuted ? 0 : this.sfxVolume, this.ctx.currentTime);
    }
    Storage.saveSettings({ sfxMuted: this.sfxMuted });
  }

  // --- 1. Start Menu Background Music: bgm.mp3 ---
  playMenuMusic() {
    this.init();
    if (this.currentTrack === 'menu' && this.menuAudio && !this.menuAudio.paused) return;
    this.currentTrack = 'menu';
    this.bgmRunning = true;

    // Pause game audio if running
    if (this.gameAudio) {
      this.gameAudio.pause();
      this.gameAudio.currentTime = 0;
    }

    if (!this.menuAudio) {
      this.menuAudio = new Audio('/assets/audio/bgm.mp3');
      this.menuAudio.loop = true;
    }

    this.menuAudio.volume = this.musicMuted ? 0 : this.musicVolume;
    const playPromise = this.menuAudio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.stopSynthBGM();
        })
        .catch(() => {
          this.startSynthBGM();
        });
    } else {
      this.startSynthBGM();
    }
  }

  // --- 2. Game & Result Screen Music: The_Final_Combo.mp3 ---
  playGameMusic() {
    this.init();
    if (this.currentTrack === 'game' && this.gameAudio && !this.gameAudio.paused) return;
    this.currentTrack = 'game';
    this.bgmRunning = true;

    // Pause menu audio if running
    if (this.menuAudio) {
      this.menuAudio.pause();
      this.menuAudio.currentTime = 0;
    }

    if (!this.gameAudio) {
      this.gameAudio = new Audio('/assets/audio/The_Final_Combo.mp3');
      this.gameAudio.loop = true;
    }

    this.gameAudio.volume = this.musicMuted ? 0 : this.musicVolume;
    const playPromise = this.gameAudio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.stopSynthBGM();
        })
        .catch(() => {
          this.startSynthBGM();
        });
    } else {
      this.startSynthBGM();
    }
  }

  // Alias for backward compatibility
  startBGM(track = 'menu') {
    if (track === 'game') {
      this.playGameMusic();
    } else {
      this.playMenuMusic();
    }
  }

  stopBGM() {
    this.bgmRunning = false;
    this.currentTrack = null;
    this.stopSynthBGM();
    if (this.menuAudio) {
      this.menuAudio.pause();
      this.menuAudio.currentTime = 0;
    }
    if (this.gameAudio) {
      this.gameAudio.pause();
      this.gameAudio.currentTime = 0;
    }
  }

  scheduleNextBGMBeat() {
    if (!this.bgmRunning || !this.ctx) return;

    // Tempo: 128 BPM -> 16th note = ~117ms
    const stepDuration = 0.12;

    const chordRoots = [130.81, 98.00, 110.00, 87.31]; // C3, G2, A2, F2
    const melodyNotes = [
      [523.25, 659.25, 783.99, 659.25], // C5, E5, G5, E5
      [392.00, 493.88, 587.33, 493.88], // G4, B4, D5, B4
      [440.00, 523.25, 659.25, 523.25], // A4, C5, E5, C5
      [349.23, 440.00, 523.25, 659.25]  // F4, A4, C5, E5
    ];

    const bar = Math.floor((this.bgmStep / 8) % 4);
    const sub = this.bgmStep % 8;

    if (!this.musicMuted && this.musicVolume > 0.01) {
      const now = this.ctx.currentTime;

      // Bouncy arcade bassline
      if (sub === 0 || sub === 3 || sub === 4 || sub === 6) {
        const root = chordRoots[bar];
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(sub === 3 ? root * 1.5 : root, now);
        bassGain.gain.setValueAtTime(0.3, now);
        bassGain.gain.exponentialRampToValueAtTime(0.01, now + stepDuration * 1.5);

        bassOsc.connect(bassGain);
        bassGain.connect(this.musicGain);
        bassOsc.start(now);
        bassOsc.stop(now + stepDuration * 1.5);
      }

      // Upbeat Arpeggio Lead
      if (sub % 2 === 0) {
        const noteIdx = (sub / 2) % 4;
        const noteFreq = melodyNotes[bar][noteIdx];
        const leadOsc = this.ctx.createOscillator();
        const leadGain = this.ctx.createGain();

        leadOsc.type = 'sine';
        leadOsc.frequency.setValueAtTime(noteFreq, now);
        leadGain.gain.setValueAtTime(0.18, now);
        leadGain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration * 0.9);

        leadOsc.connect(leadGain);
        leadGain.connect(this.musicGain);
        leadOsc.start(now);
        leadOsc.stop(now + stepDuration * 0.9);
      }

      // Hi-hat percussion
      if (sub % 2 === 1) {
        const noiseOsc = this.ctx.createOscillator();
        const noiseGain = this.ctx.createGain();
        noiseOsc.type = 'square';
        noiseOsc.frequency.setValueAtTime(1400 + Math.random() * 400, now);
        noiseGain.gain.setValueAtTime(0.04, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

        noiseOsc.connect(noiseGain);
        noiseGain.connect(this.musicGain);
        noiseOsc.start(now);
        noiseOsc.stop(now + 0.03);
      }
    }

    this.bgmStep = (this.bgmStep + 1) % 32;
    this.bgmTimer = setTimeout(() => this.scheduleNextBGMBeat(), stepDuration * 1000);
  }

  // --- Sound Effects ---
  playTap() {
    if (this.sfxMuted || !this.sfxVolume) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(640, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.025);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.025);
  }

  playClick() {
    if (this.sfxMuted || !this.sfxVolume) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  playDeal(index = 0) {
    if (this.sfxMuted || !this.sfxVolume) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320 + index * 20, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.06);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  playFlip() {
    if (this.sfxMuted || !this.sfxVolume) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(350, now);
    osc.frequency.exponentialRampToValueAtTime(750, now + 0.07);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.07);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.07);
  }

  playMatch() {
    if (this.sfxMuted || !this.sfxVolume) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);
      gain.gain.setValueAtTime(0.3, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.28);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.28);
    });
  }

  playMismatch() {
    if (this.sfxMuted || !this.sfxVolume) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(130, now + 0.15);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  // --- Unique Victory Fanfare ---
  playWin() {
    if (this.sfxMuted || !this.sfxVolume) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const run = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
    run.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.07);
      gain.gain.setValueAtTime(0.28, now + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.07 + 0.15);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + i * 0.07);
      osc.stop(now + i * 0.07 + 0.15);
    });

    const fanfareChords = [
      { time: 0.5, notes: [659.25, 783.99, 1046.50], dur: 0.25 },
      { time: 0.8, notes: [783.99, 987.77, 1318.51], dur: 0.65 }
    ];

    fanfareChords.forEach(chord => {
      chord.notes.forEach(freq => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + chord.time);
        gain.gain.setValueAtTime(0.2, now + chord.time);
        gain.gain.exponentialRampToValueAtTime(0.001, now + chord.time + chord.dur);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now + chord.time);
        osc.stop(now + chord.time + chord.dur);
      });
    });
  }

  playGameOver() {
    if (this.sfxMuted || !this.sfxVolume) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [420, 360, 300, 240];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.14);
      gain.gain.setValueAtTime(0.25, now + idx * 0.14);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.14 + 0.22);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + idx * 0.14);
      osc.stop(now + idx * 0.14 + 0.22);
    });
  }
}

export const sounds = new SoundManager();
if (typeof window !== 'undefined') {
  window.sounds = sounds;
}
