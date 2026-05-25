import { toneFrequencies, type PadColor } from '../lib/tones';

export class AudioCues {
  private context: AudioContext | null = null;

  async play(color: PadColor, duration = 0.24) {
    const context = this.getContext();
    if (context.state === 'suspended') {
      await context.resume();
    }

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(toneFrequencies[color], now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.2, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    oscillator.connect(gain).connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.03);
  }

  private getContext() {
    this.context ??= new AudioContext();
    return this.context;
  }
}
