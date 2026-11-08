// Real 8-Bit Chiptune Web Audio Synthesizer (No external assets required)

class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  constructor() {
    // Lazily initialized on first user gesture
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(val: boolean) {
    this.muted = val;
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    if (!this.muted) {
      this.blip();
    }
    return this.muted;
  }

  private tone(
    freq: number,
    duration = 0.1,
    type: OscillatorType = 'square',
    slide = 0,
    volume = 0.05,
    when = 0
  ) {
    if (this.muted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      const now = this.ctx.currentTime + when;

      o.type = type;
      o.frequency.setValueAtTime(freq, now);
      if (slide) {
        o.frequency.exponentialRampToValueAtTime(slide, now + duration);
      }
      g.gain.setValueAtTime(volume, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      o.connect(g);
      g.connect(this.ctx.destination);
      o.start(now);
      o.stop(now + duration);
    } catch {
      // Audio playback restricted before interaction
    }
  }

  public blip() {
    this.tone(660, 0.07);
  }

  public pick() {
    this.tone(523, 0.08);
    this.tone(784, 0.1, 'square', 0, 0.06, 0.08);
  }

  public slot() {
    this.tone(190, 0.07, 'sawtooth', 95, 0.08);
    this.tone(587, 0.09, 'square', 880, 0.06, 0.07);
  }

  public fix() {
    [523, 659, 784, 1047].forEach((f, i) =>
      this.tone(f, 0.1, 'square', 0, 0.06, i * 0.08)
    );
  }

  public err() {
    this.tone(180, 0.4, 'sawtooth', 60, 0.09);
  }

  public win() {
    [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) =>
      this.tone(f, 0.14, 'square', 0, 0.06, i * 0.1)
    );
  }
}

export const sound = new SoundEngine();

