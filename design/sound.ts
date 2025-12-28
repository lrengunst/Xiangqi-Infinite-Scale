
/**
 * @description  Procedural Audio Engine.
 * @purpose      Synthesize sound effects at runtime (Zero Assets).
 * @physics      Simulates wood impact and digital notifications.
 */

// Singleton Context (Lazy Init)
let context: AudioContext | null = null;
let master: GainNode | null = null;
let volume = 0.5; // Default 50%

const boot = () => {
  if (!context) {
    context = new (window.AudioContext || (window as any).webkitAudioContext)();
    // Create Master Gain Node
    master = context.createGain();
    master.connect(context.destination);
    master.gain.value = volume;
  }
  if (context.state === 'suspended') {
    context.resume();
  }
};

export const level = (value: number) => {
    // Value 0 to 100
    volume = Math.max(0, Math.min(100, value)) / 100;
    if (master) {
        // Smooth transition to prevent clicking artifacts
        master.gain.setTargetAtTime(volume, context!.currentTime, 0.1);
    }
};

export type Clip = 'select' | 'move' | 'capture' | 'check' | 'win';

export const play = (clip: Clip) => {
  if (volume <= 0) return;
  boot();
  if (!context || !master) return;

  const t = context.currentTime;
  const osc = context.createOscillator();
  const gain = context.createGain();

  // Connect to Master instead of Destination
  osc.connect(gain);
  gain.connect(master);

  switch (clip) {
    case 'select':
      // High pitch short blip
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.exponentialRampToValueAtTime(1200, t + 0.05);
      gain.gain.setValueAtTime(0.05, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      osc.start(t);
      osc.stop(t + 0.05);
      break;

    case 'move':
      // Wooden thud (Low sine + fast decay)
      osc.type = 'triangle'; 
      osc.frequency.setValueAtTime(300, t);
      osc.frequency.exponentialRampToValueAtTime(50, t + 0.1);
      
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      
      osc.start(t);
      osc.stop(t + 0.15);
      break;

    case 'capture':
      // Heavy impact (Add noise simulation via rapid freq modulation)
      osc.type = 'square'; 
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.exponentialRampToValueAtTime(40, t + 0.2);
      
      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      
      osc.start(t);
      osc.stop(t + 0.25);
      break;

    case 'check':
      // Alert sound
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, t);
      osc.frequency.linearRampToValueAtTime(400, t + 0.3);
      
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.linearRampToValueAtTime(0.001, t + 0.3);
      
      osc.start(t);
      osc.stop(t + 0.3);
      break;
      
    case 'win':
      // Success chord arpeggio
      const playNote = (freq: number, delay: number) => {
          const o = context!.createOscillator();
          const g = context!.createGain();
          o.connect(g);
          g.connect(master!); // Connect to master
          o.type = 'sine';
          o.frequency.value = freq;
          g.gain.setValueAtTime(0.1, t + delay);
          g.gain.exponentialRampToValueAtTime(0.001, t + delay + 1);
          o.start(t + delay);
          o.stop(t + delay + 1);
      };
      playNote(440, 0);   // A4
      playNote(554, 0.1); // C#5
      playNote(659, 0.2); // E5
      break;
  }
};
