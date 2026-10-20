/**
 * Web Audio API Chime Synthesizer
 * Plays an instant, crisp, high-quality pleasant chime alert for new incoming orders
 * Zero external audio files required. Works 100% reliably in any modern browser.
 */

export function playOrderChime(): void {
  if (typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    
    // Notes: C6 (1046.5Hz) -> E6 (1318.5Hz) -> G6 (1567.98Hz)
    const notes = [
      { freq: 1046.5, time: 0.0, dur: 0.18 },
      { freq: 1318.5, time: 0.12, dur: 0.22 },
      { freq: 1567.98, time: 0.24, dur: 0.5 },
    ];

    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(n.freq, ctx.currentTime + n.time);

      gain.gain.setValueAtTime(0, ctx.currentTime + n.time);
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + n.time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + n.time + n.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + n.time);
      osc.stop(ctx.currentTime + n.time + n.dur + 0.05);
    });
  } catch (err) {
    console.warn('Audio chime playback failed:', err);
  }
}
