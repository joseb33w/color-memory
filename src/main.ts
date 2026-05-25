import './style.css';
import type { Session } from '@supabase/supabase-js';
import { AudioCues } from './game/AudioCues';
import { Sequence } from './game/Sequence';
import { createColorPad } from './components/ColorPad';
import { createRoundIndicator } from './components/RoundIndicator';
import { createStatsCard, type RunStats } from './components/StatsCard';
import { padColors, type PadColor } from './lib/tones';
import { colorRunsTable, supabase } from './lib/supabase';

type Mode = 'idle' | 'watching' | 'input' | 'saving' | 'over';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('App root was not found.');
}

class ColorMemoryApp {
  private readonly sequence = new Sequence();
  private readonly audio = new AudioCues();
  private readonly roundIndicator = createRoundIndicator();
  private readonly statsCard = createStatsCard();
  private readonly pads = new Map<PadColor, HTMLButtonElement>();
  private session: Session | null = null;
  private mode: Mode = 'idle';
  private inputIndex = 0;
  private completedRounds = 0;
  private message = 'Sign in to save your runs.';
  private stats: RunStats = { best: 0, average: 0, total: 0 };

  constructor(private readonly root: HTMLElement) {}

  async init() {
    const { data } = await supabase.auth.getSession();
    this.session = data.session;
    supabase.auth.onAuthStateChange((_event, session) => {
      this.session = session;
      this.sequence.reset();
      this.completedRounds = 0;
      this.mode = 'idle';
      this.message = session ? 'Tap Start to play.' : 'Sign in to save your runs.';
      void this.loadStats();
      this.render();
    });
    await this.loadStats();
    this.render();
  }

  private render() {
    this.root.innerHTML = `
      <main class="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#bae6fd_0,#fff7ed_35%,#ffe4e6_70%,#fef3c7_100%)] px-4 py-6 text-slate-800 sm:px-6 lg:px-8">
        <div class="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col gap-6">
          <header class="rounded-[2rem] border border-white/70 bg-white/70 p-5 shadow-xl shadow-orange-100/70 backdrop-blur-xl sm:p-7">
            <div class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p class="text-sm font-extrabold uppercase tracking-[0.32em] text-orange-500">Simon-Says remix</p>
                <h1 class="mt-2 text-4xl font-black tracking-tight text-slate-900 sm:text-6xl">Color Memory</h1>
                <p class="mt-3 max-w-2xl text-lg font-semibold leading-relaxed text-slate-600">Watch the pastel pads glow, listen for their tones, then repeat the sequence. Every correct round adds one more color.</p>
              </div>
              <div data-auth-slot></div>
            </div>
          </header>
          <section class="grid flex-1 gap-6 lg:grid-cols-[1fr_22rem]">
            <div class="rounded-[2.2rem] border border-white/70 bg-white/45 p-4 shadow-2xl shadow-orange-100/70 backdrop-blur-xl sm:p-6">
              <div class="grid grid-cols-2 gap-4 sm:gap-5" data-pad-grid></div>
              <div class="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p data-message class="min-h-7 text-base font-extrabold text-slate-600">${this.message}</p>
                <button data-start type="button" class="rounded-2xl bg-gradient-to-r from-orange-400 to-pink-400 px-6 py-3 text-base font-black text-white shadow-lg shadow-pink-200 transition hover:scale-[1.02] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60">${this.mode === 'over' ? 'Play again' : 'Start'}</button>
              </div>
            </div>
            <aside class="flex flex-col gap-6"></aside>
          </section>
        </div>
      </main>
    `;

    this.renderAuth();
    this.renderPads();
    const aside = this.root.querySelector<HTMLElement>('aside');
    if (aside) {
      aside.append(this.roundIndicator.element, this.statsCard.element);
    }
    this.roundIndicator.update(this.sequence.length, this.statusText());
    this.statsCard.update(this.stats);
    this.updatePadState();

    const start = this.root.querySelector<HTMLButtonElement>('[data-start]');
    if (start) {
      start.disabled = !this.session || this.mode === 'watching' || this.mode === 'saving';
      start.addEventListener('click', () => void this.startGame());
    }
  }

  private renderAuth() {
    const slot = this.root.querySelector<HTMLElement>('[data-auth-slot]');
    if (!slot) {
      return;
    }

    if (this.session) {
      slot.innerHTML = `
        <div class="rounded-3xl border border-white/80 bg-white/80 p-4 shadow-lg">
          <p class="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-400">Signed in</p>
          <p class="mt-1 max-w-56 truncate text-sm font-black text-slate-700">${this.session.user.email ?? 'Player'}</p>
          <button data-sign-out type="button" class="mt-3 w-full rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-black text-white transition hover:scale-[1.02]">Sign out</button>
        </div>
      `;
      slot.querySelector('[data-sign-out]')?.addEventListener('click', () => void this.signOut());
      return;
    }

    slot.innerHTML = `
      <form data-auth-form class="grid gap-3 rounded-3xl border border-white/80 bg-white/80 p-4 shadow-lg sm:min-w-80">
        <div>
          <label class="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-400" for="email">Email</label>
          <input id="email" name="email" type="email" autocomplete="email" required class="mt-1 w-full rounded-2xl border border-orange-100 bg-white px-4 py-2.5 font-bold outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-100" />
        </div>
        <div>
          <label class="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-400" for="password">Password</label>
          <input id="password" name="password" type="password" autocomplete="current-password" required minlength="6" class="mt-1 w-full rounded-2xl border border-orange-100 bg-white px-4 py-2.5 font-bold outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-100" />
        </div>
        <p data-auth-message class="min-h-5 text-sm font-bold text-slate-500"></p>
        <div class="grid grid-cols-2 gap-2">
          <button data-action="sign-in" type="submit" class="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-black text-white transition hover:scale-[1.02]">Sign in</button>
          <button data-action="sign-up" type="submit" class="rounded-2xl bg-gradient-to-r from-orange-400 to-pink-400 px-4 py-2.5 text-sm font-black text-white transition hover:scale-[1.02]">Sign up</button>
        </div>
        <button data-reset type="button" class="text-sm font-extrabold text-orange-500 transition hover:text-pink-500">Forgot password?</button>
      </form>
    `;

    const form = slot.querySelector<HTMLFormElement>('[data-auth-form]');
    const reset = slot.querySelector<HTMLButtonElement>('[data-reset]');
    form?.addEventListener('submit', (event) => void this.handleAuthSubmit(event));
    reset?.addEventListener('click', () => void this.resetPassword());
  }

  private renderPads() {
    const grid = this.root.querySelector<HTMLElement>('[data-pad-grid]');
    if (!grid) {
      return;
    }
    this.pads.clear();
    for (const color of padColors) {
      const pad = createColorPad(color, (pressed) => void this.handlePadPress(pressed));
      this.pads.set(color, pad);
      grid.append(pad);
    }
  }

  private async handleAuthSubmit(event: SubmitEvent) {
    event.preventDefault();
    const submitter = event.submitter as HTMLButtonElement | null;
    const form = event.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');
    const action = submitter?.dataset.action;
    const message = form.querySelector<HTMLElement>('[data-auth-message]');

    if (!email || password.length < 6) {
      this.setAuthMessage(message, 'Use an email and a password with at least 6 characters.', true);
      return;
    }

    submitter?.setAttribute('disabled', 'true');
    const result = action === 'sign-up'
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });
    submitter?.removeAttribute('disabled');

    if (result.error) {
      this.setAuthMessage(message, result.error.message, true);
      return;
    }

    this.setAuthMessage(message, action === 'sign-up' && !result.data.session ? 'Account created. Confirm the email if your project requires it, then sign in.' : 'Signed in.', false);
  }

  private async resetPassword() {
    const emailInput = this.root.querySelector<HTMLInputElement>('#email');
    const message = this.root.querySelector<HTMLElement>('[data-auth-message]');
    const email = emailInput?.value.trim();
    if (!email) {
      this.setAuthMessage(message, 'Enter your email first.', true);
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email);
    this.setAuthMessage(message, error ? error.message : 'Password reset email sent.', Boolean(error));
  }

  private async signOut() {
    await supabase.auth.signOut();
  }

  private setAuthMessage(target: HTMLElement | null | undefined, text: string, isError: boolean) {
    if (!target) {
      return;
    }
    target.textContent = text;
    target.className = `min-h-5 text-sm font-bold ${isError ? 'text-red-500' : 'text-emerald-600'}`;
  }

  private async startGame() {
    if (!this.session || this.mode === 'watching' || this.mode === 'saving') {
      return;
    }
    this.sequence.reset();
    this.completedRounds = 0;
    this.sequence.addRandomStep();
    await this.playSequence();
  }

  private async advanceRound() {
    this.completedRounds += 1;
    this.sequence.addRandomStep();
    await new Promise((resolve) => window.setTimeout(resolve, 650));
    await this.playSequence();
  }

  private async playSequence() {
    this.mode = 'watching';
    this.inputIndex = 0;
    this.message = 'Watch closely.';
    this.syncUi();

    for (const color of this.sequence.toArray()) {
      await this.flash(color, 520);
      await new Promise((resolve) => window.setTimeout(resolve, 170));
    }

    this.mode = 'input';
    this.message = 'Your turn. Repeat the pattern.';
    this.syncUi();
  }

  private async handlePadPress(color: PadColor) {
    if (this.mode !== 'input') {
      return;
    }

    void this.flash(color, 180);
    const expected = this.sequence.at(this.inputIndex);
    if (expected !== color) {
      await this.endGame();
      return;
    }

    this.inputIndex += 1;
    if (this.inputIndex === this.sequence.length) {
      this.message = 'Perfect. Adding another color.';
      this.syncUi();
      await this.advanceRound();
    }
  }

  private async flash(color: PadColor, duration: number) {
    const pad = this.pads.get(color);
    if (pad) {
      pad.dataset.active = 'true';
    }
    await this.audio.play(color, Math.min(duration / 1000, 0.32));
    await new Promise((resolve) => window.setTimeout(resolve, duration));
    if (pad) {
      pad.dataset.active = 'false';
    }
  }

  private async endGame() {
    this.mode = 'saving';
    this.message = `Game over. You completed ${this.completedRounds} ${this.completedRounds === 1 ? 'round' : 'rounds'}.`;
    this.syncUi();

    const userId = this.session?.user.id;
    if (userId) {
      const { error } = await supabase.from(colorRunsTable).insert({
        user_id: userId,
        sequence_length: this.completedRounds,
        ended_at: new Date().toISOString(),
      });
      if (error) {
        this.message = `Could not save run: ${error.message}`;
      } else {
        await this.loadStats();
      }
    }

    this.mode = 'over';
    this.syncUi();
  }

  private async loadStats() {
    if (!this.session) {
      this.stats = { best: 0, average: 0, total: 0 };
      return;
    }

    const { data, error } = await supabase
      .from(colorRunsTable)
      .select('sequence_length')
      .order('ended_at', { ascending: false });

    if (error || !data) {
      this.stats = { best: 0, average: 0, total: 0 };
      return;
    }

    const scores = data.map((run) => Number(run.sequence_length));
    const total = scores.length;
    const sum = scores.reduce((value, score) => value + score, 0);
    this.stats = {
      best: total ? Math.max(...scores) : 0,
      average: total ? sum / total : 0,
      total,
    };
  }

  private syncUi() {
    const message = this.root.querySelector<HTMLElement>('[data-message]');
    const start = this.root.querySelector<HTMLButtonElement>('[data-start]');
    if (message) {
      message.textContent = this.message;
    }
    if (start) {
      start.textContent = this.mode === 'over' ? 'Play again' : 'Start';
      start.disabled = !this.session || this.mode === 'watching' || this.mode === 'saving';
    }
    this.roundIndicator.update(this.sequence.length, this.statusText());
    this.statsCard.update(this.stats);
    this.updatePadState();
  }

  private updatePadState() {
    const disabled = this.mode !== 'input';
    for (const pad of this.pads.values()) {
      pad.disabled = disabled;
    }
  }

  private statusText() {
    if (!this.session) {
      return 'Sign in first';
    }
    if (this.mode === 'watching') {
      return 'Watch';
    }
    if (this.mode === 'input') {
      return `${this.inputIndex}/${this.sequence.length} entered`;
    }
    if (this.mode === 'saving') {
      return 'Saving run';
    }
    if (this.mode === 'over') {
      return 'Game over';
    }
    return 'Ready';
  }
}

const colorMemoryApp = new ColorMemoryApp(app);
void colorMemoryApp.init();
