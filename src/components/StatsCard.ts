export type RunStats = {
  best: number;
  average: number;
  total: number;
};

export function createStatsCard() {
  const wrapper = document.createElement('section');
  wrapper.className = 'rounded-3xl border border-white/70 bg-white/75 p-5 shadow-xl shadow-pink-100/60 backdrop-blur';
  wrapper.innerHTML = `
    <div class="flex items-center justify-between gap-3">
      <div>
        <p class="text-sm font-extrabold uppercase tracking-[0.25em] text-fuchsia-500">Your stats</p>
        <h2 class="text-2xl font-black text-slate-800">Memory streaks</h2>
      </div>
      <span data-total class="rounded-full bg-fuchsia-100 px-3 py-1 text-sm font-extrabold text-fuchsia-700">0 runs</span>
    </div>
    <div class="mt-5 grid grid-cols-2 gap-3">
      <div class="rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 p-4">
        <p class="text-xs font-extrabold uppercase tracking-[0.2em] text-indigo-500">Best</p>
        <p data-best class="mt-1 text-4xl font-black text-indigo-900">0</p>
      </div>
      <div class="rounded-2xl bg-gradient-to-br from-cyan-100 to-teal-100 p-4">
        <p class="text-xs font-extrabold uppercase tracking-[0.2em] text-teal-600">Average</p>
        <p data-average class="mt-1 text-4xl font-black text-teal-900">0.0</p>
      </div>
    </div>
  `;

  return {
    element: wrapper,
    update(stats: RunStats) {
      const best = wrapper.querySelector<HTMLElement>('[data-best]');
      const average = wrapper.querySelector<HTMLElement>('[data-average]');
      const total = wrapper.querySelector<HTMLElement>('[data-total]');
      if (best) {
        best.textContent = String(stats.best);
      }
      if (average) {
        average.textContent = stats.average.toFixed(1);
      }
      if (total) {
        total.textContent = `${stats.total} ${stats.total === 1 ? 'run' : 'runs'}`;
      }
    },
  };
}
