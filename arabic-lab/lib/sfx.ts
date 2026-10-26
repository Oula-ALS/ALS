// Short success / error sounds made with Web Audio (no sound files).
let ctx: AudioContext | null = null;

function tone(freqs: number[], type: OscillatorType, step = 0.09) {
  try {
    ctx ??= new AudioContext();
    const t0 = ctx.currentTime;
    freqs.forEach((f, i) => {
      const osc = ctx!.createOscillator();
      const gain = ctx!.createGain();
      osc.type = type;
      osc.frequency.value = f;
      const t = t0 + i * step;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.15, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + step + 0.12);
      osc.connect(gain).connect(ctx!.destination);
      osc.start(t);
      osc.stop(t + step + 0.15);
    });
  } catch {}
}

export const playSuccess = () => tone([660, 880], "sine");
export const playError = () => tone([220, 180], "triangle", 0.12);
export const playFanfare = () => tone([523, 659, 784, 1047], "sine", 0.1);
