import { useCallback, useEffect, useRef, useState } from "react";

// Frequencies for musical notes (in Hz)
const NOTES: Record<string, number> = {
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  Bb4: 466.16,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
};

// "Happy Birthday to You" melody: [note, beats]
const MELODY: Array<[string, number]> = [
  ["C4", 0.75],
  ["C4", 0.25],
  ["D4", 1],
  ["C4", 1],
  ["F4", 1],
  ["E4", 2],
  ["C4", 0.75],
  ["C4", 0.25],
  ["D4", 1],
  ["C4", 1],
  ["G4", 1],
  ["F4", 2],
  ["C4", 0.75],
  ["C4", 0.25],
  ["C5", 1],
  ["A4", 1],
  ["F4", 1],
  ["E4", 1],
  ["D4", 2],
  ["Bb4", 0.75],
  ["Bb4", 0.25],
  ["A4", 1],
  ["F4", 1],
  ["G4", 1],
  ["F4", 2],
];

const BEAT_DURATION = 0.42; // seconds per beat

export function useBirthdayMusic() {
  const [isPlaying, setIsPlaying] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stoppedRef = useRef(false);

  const playOnce = useCallback((ctx: AudioContext, startTime: number) => {
    let t = startTime;
    const master = ctx.createGain();
    master.gain.value = 0.28;
    master.connect(ctx.destination);

    for (const [note, beats] of MELODY) {
      const freq = NOTES[note];
      const dur = beats * BEAT_DURATION;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;

      // Simple ADSR envelope for a pleasant tone
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.9, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.3, t + dur * 0.6);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.95);

      osc.connect(gain);
      gain.connect(master);
      osc.start(t);
      osc.stop(t + dur);

      t += dur;
    }

    return t - startTime; // total duration
  }, []);

  const scheduleLoop = useCallback(
    (ctx: AudioContext) => {
      if (stoppedRef.current) return;
      const total = playOnce(ctx, ctx.currentTime + 0.05);
      timeoutRef.current = setTimeout(() => {
        scheduleLoop(ctx);
      }, (total + 1.2) * 1000);
    },
    [playOnce]
  );

  const start = useCallback(() => {
    let ctx = ctxRef.current;
    if (!ctx) {
      ctx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();
      ctxRef.current = ctx;
    }
    if (ctx.state === "suspended") ctx.resume();
    stoppedRef.current = false;
    setIsPlaying(true);
    scheduleLoop(ctx);
  }, [scheduleLoop]);

  const stop = useCallback(() => {
    stoppedRef.current = true;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (ctxRef.current && ctxRef.current.state === "running") {
      ctxRef.current.suspend();
    }
    setIsPlaying(false);
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) stop();
    else start();
  }, [isPlaying, start, stop]);

  useEffect(() => {
    return () => {
      stoppedRef.current = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (ctxRef.current) ctxRef.current.close();
    };
  }, []);

  return { isPlaying, start, stop, toggle };
}
