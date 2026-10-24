// GAM-06 sound: every effect is synthesized with WebAudio at play time (no audio files, no network).
// Short, soft and low; volume 0 means silence and creates no AudioContext.
type Cue = 'click' | 'buy' | 'flash' | 'catch' | 'unlock' | 'hit' | 'miss';
let context: AudioContext | null = null, last = 0;
const NOTES: Record<Cue, { freq: number[]; length: number; type: OscillatorType; gap: number }> = {
  click: { freq: [520], length: .05, type: 'triangle', gap: 0 },
  buy: { freq: [440, 660], length: .09, type: 'sine', gap: .06 },
  flash: { freq: [880, 1175, 1568], length: .16, type: 'sine', gap: .07 },
  catch: { freq: [660, 990, 1320], length: .12, type: 'triangle', gap: .05 },
  unlock: { freq: [392, 523, 659, 784], length: .14, type: 'sine', gap: .08 },
  hit: { freq: [740], length: .06, type: 'triangle', gap: 0 },
  miss: { freq: [196], length: .09, type: 'sine', gap: 0 },
};
export function playCue(cue: Cue, volume: number, pitch = 0) {
  if (volume <= 0 || document.hidden) return;
  const now = performance.now();
  // Fast clicking keeps one short tick per 45 ms instead of stacking oscillators.
  if (cue === 'click' && now - last < 45) return; last = now;
  try {
    context ??= new AudioContext();
    if (context.state === 'suspended') void context.resume();
    const start = context.currentTime, spec = NOTES[cue], gain = context.createGain();
    gain.connect(context.destination);
    spec.freq.forEach((base, i) => {
      const osc = context!.createOscillator(), env = context!.createGain(), at = start + i * spec.gap, peak = .08 * Math.min(1, volume);
      osc.type = spec.type; osc.frequency.value = base * 2 ** (pitch / 12);
      env.gain.setValueAtTime(0, at); env.gain.linearRampToValueAtTime(peak, at + .008); env.gain.exponentialRampToValueAtTime(.0001, at + spec.length);
      osc.connect(env).connect(gain); osc.start(at); osc.stop(at + spec.length + .02);
    });
  } catch { /* Audio is decoration: a missing device never blocks the game. */ }
}
