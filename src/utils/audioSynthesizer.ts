/**
 * Web Audio API Sound Synthesizer for Heirloom Entrance
 * Synthesizes 100% in-browser realistic sound effects without any external MP3 files:
 * 1. Brass latch click & lock pop
 * 2. Soothing vintage music box piano chimes
 * 3. Soft hearth fire crackle
 */

class HeirloomAudioSynthesizer {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  playUnlockSequence() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // 1. Brass Latch Click & Lock Pop
      this.playLatchClick(ctx, now);

      // 2. Vintage Music Box Piano Chimes
      this.playMusicBox(ctx, now + 0.12);

      // 3. Gentle Hearth Fireplace Crackle
      this.playHearthCrackle(ctx, now + 0.05);
    } catch (err) {
      console.warn('Audio synthesis not permitted or supported:', err);
    }
  }

  private playLatchClick(ctx: AudioContext, time: number) {
    // 1a. Metallic brass latch snap
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1600, time);
    osc.frequency.exponentialRampToValueAtTime(340, time + 0.07);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, time);
    filter.Q.setValueAtTime(5, time);

    gain.gain.setValueAtTime(0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(time);
    osc.stop(time + 0.09);

    // 1b. Deep wooden chest lock thud
    const thudOsc = ctx.createOscillator();
    const thudGain = ctx.createGain();
    thudOsc.type = 'sine';
    thudOsc.frequency.setValueAtTime(260, time);
    thudOsc.frequency.exponentialRampToValueAtTime(45, time + 0.14);

    thudGain.gain.setValueAtTime(0.5, time);
    thudGain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

    thudOsc.connect(thudGain);
    thudGain.connect(ctx.destination);

    thudOsc.start(time);
    thudOsc.stop(time + 0.16);
  }

  private playMusicBox(ctx: AudioContext, startTime: number) {
    // Elegant warm pentatonic music box chord sequence (C5, E5, G5, C6, E6, G6)
    const notes = [
      { freq: 523.25, time: 0 },
      { freq: 659.25, time: 0.14 },
      { freq: 783.99, time: 0.28 },
      { freq: 1046.5, time: 0.44 },
      { freq: 1318.51, time: 0.62 },
      { freq: 1567.98, time: 0.82 },
    ];

    notes.forEach(({ freq, time }) => {
      const noteTime = startTime + time;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      // Delicate bell envelope
      gain.gain.setValueAtTime(0.25, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 1.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 1.3);

      // Sweet harmonic bell chime overtone (2x octave)
      const overtone = ctx.createOscillator();
      const overtoneGain = ctx.createGain();
      overtone.type = 'sine';
      overtone.frequency.setValueAtTime(freq * 2, noteTime);

      overtoneGain.gain.setValueAtTime(0.07, noteTime);
      overtoneGain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.6);

      overtone.connect(overtoneGain);
      overtoneGain.connect(ctx.destination);

      overtone.start(noteTime);
      overtone.stop(noteTime + 0.65);
    });
  }

  private playHearthCrackle(ctx: AudioContext, startTime: number) {
    // Generate gentle hearth fire warmth crackle
    const duration = 2.4;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const isPop = Math.random() < 0.0025;
      data[i] = isPop ? (Math.random() * 2 - 1) * 0.65 : (Math.random() * 2 - 1) * 0.025;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(750, startTime);
    filter.Q.setValueAtTime(1.2, startTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.14, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(startTime);
    noise.stop(startTime + duration);
  }
}

export const heirloomAudio = new HeirloomAudioSynthesizer();
