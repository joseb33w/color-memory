import { padColors, type PadColor } from '../lib/tones';

export class Sequence {
  private readonly steps: PadColor[] = [];

  addRandomStep() {
    const next = padColors[Math.floor(Math.random() * padColors.length)];
    if (!next) {
      return;
    }
    this.steps.push(next);
  }

  reset() {
    this.steps.length = 0;
  }

  at(index: number) {
    return this.steps[index];
  }

  toArray() {
    return [...this.steps];
  }

  get length() {
    return this.steps.length;
  }
}
