"use client";

// Web Audio API chiptune synthesizer for interactive pet sound effects.
// Runs entirely in browser without external sound assets.

class PetAudioEngine {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  play(type: "pet" | "eat" | "play" | "click" | "celebrate" | "state") {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      switch (type) {
        case "click": {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(600, now);
          osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.05);
          break;
        }

        case "pet": {
          // Warm double arpeggio (happy purr sound)
          const notes = [440, 554.37, 659.25, 880];
          notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "triangle";
            osc.frequency.setValueAtTime(freq, now + i * 0.06);
            gain.gain.setValueAtTime(0.1, now + i * 0.06);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.12);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + i * 0.06);
            osc.stop(now + i * 0.06 + 0.12);
          });
          break;
        }

        case "eat": {
          // Crunch crunch sound
          [0, 0.08, 0.16].forEach((delay) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "square";
            osc.frequency.setValueAtTime(220 + Math.random() * 80, now + delay);
            gain.gain.setValueAtTime(0.12, now + delay);
            gain.gain.exponentialRampToValueAtTime(0.005, now + delay + 0.06);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + delay);
            osc.stop(now + delay + 0.06);
          });
          break;
        }

        case "play": {
          // Bounce sound (frequency sweep)
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(300, now);
          osc.frequency.exponentialRampToValueAtTime(700, now + 0.12);
          osc.frequency.exponentialRampToValueAtTime(400, now + 0.22);
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.22);
          break;
        }

        case "celebrate": {
          // Victory fan-fare melody
          const fanfare = [
            { freq: 523.25, time: 0, duration: 0.1 },
            { freq: 659.25, time: 0.1, duration: 0.1 },
            { freq: 783.99, time: 0.2, duration: 0.1 },
            { freq: 1046.50, time: 0.32, duration: 0.25 },
          ];
          fanfare.forEach((n) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "triangle";
            osc.frequency.setValueAtTime(n.freq, now + n.time);
            gain.gain.setValueAtTime(0.15, now + n.time);
            gain.gain.exponentialRampToValueAtTime(0.001, now + n.time + n.duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + n.time);
            osc.stop(now + n.time + n.duration);
          });
          break;
        }

        case "state": {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(400, now);
          osc.frequency.linearRampToValueAtTime(520, now + 0.08);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.08);
          break;
        }
      }
    } catch {
      // Gracefully ignore audio errors if blocked by browser policy
    }
  }
}

export const petAudio = new PetAudioEngine();
