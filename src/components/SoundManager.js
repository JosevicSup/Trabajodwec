class SoundManager {
  constructor() {
    this.audioCtx = null;
    this.muted = localStorage.getItem('snake_muted') === 'true';
  }

  init() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('snake_muted', this.muted ? 'true' : 'false');
    return this.muted;
  }

  playEatNormal() {
    if (this.muted) return;
    this.init();
    
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, this.audioCtx.currentTime); // C5
    osc.frequency.exponentialRampToValueAtTime(880, this.audioCtx.currentTime + 0.1); // A5

    gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    
    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.15);
  }

  playEatGolden() {
    if (this.muted) return;
    this.init();

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, this.audioCtx.currentTime); // D5
    osc.frequency.setValueAtTime(880.00, this.audioCtx.currentTime + 0.08); // A5
    osc.frequency.exponentialRampToValueAtTime(1174.66, this.audioCtx.currentTime + 0.22); // D6

    gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.25);
  }

  playEatPoison() {
    if (this.muted) return;
    this.init();

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(329.63, this.audioCtx.currentTime); // E4
    osc.frequency.linearRampToValueAtTime(110.00, this.audioCtx.currentTime + 0.3); // A2

    gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.32);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.32);
  }

  playGameOver() {
    if (this.muted) return;
    this.init();

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, this.audioCtx.currentTime); // A3
    osc.frequency.setValueAtTime(164.81, this.audioCtx.currentTime + 0.15); // E3
    osc.frequency.setValueAtTime(110, this.audioCtx.currentTime + 0.3); // A2

    gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.55);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.55);
  }
}

export const soundManager = new SoundManager();
