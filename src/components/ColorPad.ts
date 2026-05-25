import { padLabels, type PadColor } from '../lib/tones';

const padClasses: Record<PadColor, string> = {
  blue: 'from-sky-200 to-blue-300 shadow-sky-200/70 data-[active=true]:from-sky-100 data-[active=true]:to-blue-200',
  green: 'from-emerald-200 to-green-300 shadow-emerald-200/70 data-[active=true]:from-emerald-100 data-[active=true]:to-green-200',
  red: 'from-rose-200 to-red-300 shadow-rose-200/70 data-[active=true]:from-rose-100 data-[active=true]:to-red-200',
  yellow: 'from-amber-100 to-yellow-300 shadow-yellow-200/70 data-[active=true]:from-yellow-50 data-[active=true]:to-amber-200',
};

export function createColorPad(color: PadColor, onPress: (color: PadColor) => void) {
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.color = color;
  button.dataset.active = 'false';
  button.className = `color-pad aspect-square rounded-[2rem] bg-gradient-to-br ${padClasses[color]} border border-white/80 text-2xl font-black uppercase tracking-[0.22em] text-white/90 shadow-2xl transition-all duration-150 hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 data-[active=true]:scale-105 data-[active=true]:brightness-125`;
  button.setAttribute('aria-label', `${padLabels[color]} pad`);
  button.textContent = padLabels[color];
  button.addEventListener('click', () => onPress(color));
  return button;
}
