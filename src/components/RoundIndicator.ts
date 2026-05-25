export function createRoundIndicator() {
  const wrapper = document.createElement('section');
  wrapper.className = 'rounded-3xl border border-white/70 bg-white/75 p-5 shadow-xl shadow-orange-100/60 backdrop-blur';
  wrapper.innerHTML = `
    <p class="text-sm font-extrabold uppercase tracking-[0.25em] text-orange-500">Current round</p>
    <div class="mt-2 flex items-end gap-3">
      <span data-round class="text-6xl font-black tracking-tight text-slate-800">0</span>
      <span data-status class="pb-3 text-base font-bold text-slate-500">Tap Start to play</span>
    </div>
  `;

  return {
    element: wrapper,
    update(round: number, status: string) {
      const roundEl = wrapper.querySelector<HTMLElement>('[data-round]');
      const statusEl = wrapper.querySelector<HTMLElement>('[data-status]');
      if (roundEl) {
        roundEl.textContent = String(round);
      }
      if (statusEl) {
        statusEl.textContent = status;
      }
    },
  };
}
