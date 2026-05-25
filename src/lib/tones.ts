export type PadColor = 'blue' | 'green' | 'red' | 'yellow';

export const padColors: PadColor[] = ['blue', 'green', 'red', 'yellow'];

export const toneFrequencies: Record<PadColor, number> = {
  blue: 329.63,
  green: 392,
  red: 261.63,
  yellow: 493.88,
};

export const padLabels: Record<PadColor, string> = {
  blue: 'Blue',
  green: 'Green',
  red: 'Red',
  yellow: 'Yellow',
};
