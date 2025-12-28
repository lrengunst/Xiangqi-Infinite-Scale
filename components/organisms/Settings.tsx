
import React from 'react';
import { Palette, Typography, Layer } from '../../design/tokens';
import { Button } from '../atoms/Button';
import { Tuning } from '../../engine/types';
import { DEFAULTS } from '../../engine/search';

export type Pilot = 'human' | 'ai';

interface Props {
  volume: number; 
  pace: number;   
  haptics: boolean; 
  autoFlip: boolean;
  coords: boolean; 
  fx: boolean;     
  
  assist: boolean;
  book: boolean;
  monitor: boolean; 
  depth: number;
  study: number;
  theme: 'war' | 'zen';
  pilots: { red: Pilot; black: Pilot };
  tuning: Tuning; 
  
  setVolume: (v: number) => void;
  setPace: (v: number) => void;
  setHaptics: (v: boolean) => void; 
  setAutoFlip: (v: boolean) => void; 
  setCoords: (v: boolean) => void; 
  setFx: (v: boolean) => void;     
  
  toggleAssist: () => void;
  toggleBook: () => void;
  display: () => void; 
  level: (v: number) => void;
  tutor: (v: number) => void;
  style: () => void;
  pilot: (side: 'red' | 'black') => void;
  tune: (key: keyof Tuning, val: number) => void; 
  close: () => void;

  // NEW: Thread Control
  threads?: number;
  cores?: number;
  setThreads?: (n: number) => void;
  mode?: 'worker' | 'main'; // NEW PROP
}

const PRESETS = {
    BLITZ: { window: 15, margin: 500, lmrDepth: 2, lmrCount: 3 }, 
    STD: DEFAULTS, 
    DEEP: { window: 100, margin: 1500, lmrDepth: 4, lmrCount: 6 } 
};

const DIFFICULTIES = {
    NOVICE: { depth: 2, tuning: { window: 10, margin: 200, lmrDepth: 1, lmrCount: 2 } },
    EASY:   { depth: 4, tuning: { window: 20, margin: 500, lmrDepth: 2, lmrCount: 3 } },
    NORMAL: { depth: 6, tuning: DEFAULTS },
    HARD:   { depth: 8, tuning: { window: 60, margin: 1200, lmrDepth: 4, lmrCount: 5 } },
    EXTREME:{ depth: 10, tuning: { window: 100, margin: 2000, lmrDepth: 5, lmrCount: 8 } }
};

export const Settings: React.FC<Props> = React.memo(({ 
  volume, pace, haptics, autoFlip, coords, fx, 
  assist, book, monitor, depth, study, theme, pilots, tuning,
  setVolume, setPace, setHaptics, setAutoFlip, setCoords, setFx,
  toggleAssist, toggleBook, display, level, tutor, style, pilot, tune, close,
  threads = 1, cores = 4, setThreads, mode = 'worker'
}) => {
  
  const applyPreset = (name: keyof typeof PRESETS) => {
      const p = PRESETS[name];
      tune('window', p.window);
      tune('margin', p.margin);
      tune('lmrDepth', p.lmrDepth);
      tune('lmrCount', p.lmrCount);
  };

  const applyDifficulty = (key: keyof typeof DIFFICULTIES) => {
      const preset = DIFFICULTIES[key];
      level(preset.depth);
      tune('window', preset.tuning.window);
      tune('margin', preset.tuning.margin);
      tune('lmrDepth', preset.tuning.lmrDepth);
      tune('lmrCount', preset.tuning.lmrCount);
  };

  const getSemantic = (prop: keyof Tuning, val: number): string => {
      if (prop === 'window') {
          if (val <= 20) return "SHARP"; 
          if (val >= 80) return "BROAD"; 
          return "BALANCED";
      }
      if (prop === 'margin') {
          if (val <= 600) return "RISKY"; 
          if (val >= 1200) return "SAFE"; 
          return "NORMAL";
      }
      if (prop === 'lmrDepth') {
          if (val <= 2) return "AGGR."; 
          if (val >= 5) return "LATE"; 
          return "MID";
      }
      return "";
  };

  const ExtremeRange = ({ label, value, action }: { label: string, value: number, action: (v: number) => void }) => (
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-end">
            <div>
                <h3 className="font-bold text-sm uppercase">{label}</h3>
                <p className="text-[10px] opacity-50 font-mono text-neutral-400">HARDWARE_STRESS_TEST</p>
            </div>
            <span className={`text-xs font-mono font-bold ${value >= 12 ? 'text-red-500 animate-pulse' : 'text-yellow-500'}`}>
                {value >= 12 ? 'EXTREME ' : ''}DEPTH {value}
            </span>
        </div>
        <div className="flex gap-4 items-center mt-2">
            <input 
                type="range" 
                min="2" 
                max="24" 
                step="2" 
                value={value > 24 ? 24 : value}
                onChange={(e) => action(parseInt(e.target.value))}
                className="flex-1 accent-yellow-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
            <input 
                type="number" 
                min="2" 
                max="2000" 
                value={value}
                onChange={(e) => action(Math.max(2, Math.min(2000, parseInt(e.target.value) || 2)))}
                className="w-16 bg-black/40 border border-white/10 rounded p-1 text-xs font-mono text-center text-yellow-500 focus:border-yellow-500 focus:outline-none"
            />
        </div>
        <p className="text-[9px] text-neutral-600 font-mono mt-1">
            WARNING: Values > 20 may freeze the browser indefinitely without a Quantum Computer.
        </p>
      </div>
  );

  const ParamSlider = ({ label, prop, min, max, step = 1, desc }: { label: string, prop: keyof Tuning, min: number, max: number, step?: number, desc: string }) => {
      const semantic = getSemantic(prop, tuning[prop]);
      return (
        <div className="flex flex-col gap-1 p-2 rounded border border-white/5 bg-black/20 hover:border-white/10 transition-colors">
            <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] font-mono font-bold text-neutral-300">{label}</span>
                <div className="flex items-center gap-2">
                    {semantic && <span className="text-[8px] font-mono text-neutral-500 uppercase">[{semantic}]</span>}
                    <span className="text-[9px] font-mono font-bold text-green-500">{tuning[prop]}</span>
                </div>
            </div>
            <input 
                type="range" 
                min={min} 
                max={max}
                step={step}
                value={tuning[prop]}
                onChange={(e) => tune(prop, parseInt(e.target.value))}
                className="w-full accent-green-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-[8px] text-neutral-500 font-mono mt-1">{desc}</p>
        </div>
      );
  };

  const Toggle = ({ label, desc, active, action }: { label: string, desc: string, active: boolean, action: () => void }) => (
    <div className="flex justify-between items-center">
        <div>
            <h3 className="font-bold text-sm">{label}</h3>
            <p className="text-[10px] opacity-50 font-mono text-neutral-400">{desc}</p>
        </div>
        <Button 
            label={active ? "ON" : "OFF"} 
            action={action} 
            variant={active ? "primary" : "secondary"}
            size="small"
        />
    </div>
  );

  const ValueSlider = ({ label, value, min, max, unit = "", step = 1, action }: any) => (
      <div className="flex flex-col gap-1">
          <div className="flex justify-between">
              <span className="text-[9px] font-mono text-neutral-400">{label}</span>
              <span className="text-[9px] font-mono font-bold text-white">{value}{unit}</span>
          </div>
          <input 
              type="range" min={min} max={max} step={step} value={value}
              onChange={(e) => action(parseInt(e.target.value))}
              className="w-full accent-yellow-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
          />
      </div>
  );

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4"
      onClick={close}
      style={{ zIndex: Layer.Modal }}
    >
      <div 
        className="w-full max-w-[420px] rounded-xl border flex flex-col shadow-2xl overflow-hidden max-h-[90vh]"
        style={{ 
            backgroundColor: Palette.App.Panel,
            borderColor: Palette.Board.Border,
            color: Palette.App.Text
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b" style={{ borderColor: Palette.App.Muted }}>
           <h2 className={`${Typography.Font.Mono} text-xl tracking-widest text-yellow-500`}>
             SYSTEM_CONFIG
           </h2>
           <Button label="X" action={close} size="small" variant="secondary"/>
        </div>

        <div className="p-6 flex flex-col gap-6 overflow-y-auto flex-1 scrollbar-hide">
            
            {/* Group: SYSTEM */}
            <div className="flex flex-col gap-3">
                <h4 className="text-[10px] font-mono text-neutral-500 border-b border-neutral-700 pb-1">SENSORY_INPUTS</h4>
                <Toggle label="HAPTIC_FEEDBACK" desc="DEVICE_VIBRATION" active={haptics} action={() => setHaptics(!haptics)} />
                <Toggle label="COORDINATES" desc="GRID_LABELS" active={coords} action={() => setCoords(!coords)} />
                <Toggle label="VISUAL_FX" desc="HIGH_QUALITY_RENDER" active={fx} action={() => setFx(!fx)} />
                <ValueSlider label="AUDIO_GAIN" value={volume} min={0} max={100} unit="%" action={setVolume} />
                <ValueSlider label="VISUAL_FLOW (PACE)" value={pace} min={0} max={1000} unit="ms" step={50} action={setPace} />
                
                <div className="flex justify-between items-center mt-2">
                    <div>
                        <h3 className="font-bold text-sm">VISUAL_THEME</h3>
                        <p className="text-[10px] opacity-50 font-mono text-neutral-400">{theme.toUpperCase()}_SCHEME</p>
                    </div>
                    <Button label="TOGGLE" action={style} size="small" variant="secondary" />
                </div>
            </div>

            {/* Group: CONCURRENCY */}
            <div className="flex flex-col gap-3">
                <h4 className="text-[10px] font-mono text-neutral-500 border-b border-neutral-700 pb-1">CONCURRENCY_CLUSTER</h4>
                <div className="flex flex-col gap-1">
                    <div className="flex justify-between">
                        <span className="text-[9px] font-mono text-neutral-400">WORKER_THREADS</span>
                        <span className={`text-[9px] font-mono font-bold ${mode === 'worker' ? 'text-green-500' : 'text-red-500'}`}>
                            {mode === 'worker' ? `${threads} / ${cores} CORES` : 'SANDBOX_LIMIT (1)'}
                        </span>
                    </div>
                    {setThreads && (
                        <input 
                            type="range" min={1} max={cores} step={1} value={threads}
                            onChange={(e) => setThreads(parseInt(e.target.value))}
                            disabled={mode === 'main'}
                            className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${mode === 'main' ? 'bg-red-900 accent-red-500 opacity-50 cursor-not-allowed' : 'bg-white/10 accent-green-500'}`}
                        />
                    )}
                    <p className="text-[8px] text-neutral-500 font-mono">
                        {mode === 'main' 
                            ? "CRITICAL: Browser environment blocks Web Workers. Single-thread fallback active. UI freeze expected."
                            : "WARNING: Higher thread count consumes more battery but speeds up Depth 7+."
                        }
                    </p>
                </div>
            </div>

            {/* Group: GAMEPLAY */}
            <div className="flex flex-col gap-3">
                <h4 className="text-[10px] font-mono text-neutral-500 border-b border-neutral-700 pb-1">TACTICAL_MODULES</h4>
                <Toggle label="AUTO_ORIENTATION" desc="PERSPECTIVE_SYNC" active={autoFlip} action={() => setAutoFlip(!autoFlip)} />
                <Toggle label="PERFORMANCE_HUD" desc="FPS_HEAP_TELEMETRY" active={monitor} action={display} />
                <Toggle label="TACTICAL_ASSIST" desc="PREDICTION_LAYER" active={assist} action={toggleAssist} />
                <Toggle label="OPENING_BOOK" desc="GRANDMASTER_LIBRARY" active={book} action={toggleBook} />
            </div>

            {/* Group: PILOTS */}
            <div className="flex flex-col gap-3">
                <h4 className="text-[10px] font-mono text-neutral-500 border-b border-neutral-700 pb-1">SIMULATION_PILOTS</h4>
                <div className="flex justify-between items-center">
                    <span className="font-mono text-xs text-red-400 font-bold">RED_FACTION</span>
                    <Button 
                        label={pilots.red === 'human' ? "MANUAL" : "A.R.E.S"} 
                        action={() => pilot('red')} 
                        variant={pilots.red === 'human' ? 'secondary' : 'primary'}
                        size="small"
                    />
                </div>
                <div className="flex justify-between items-center">
                    <span className="font-mono text-xs text-neutral-400 font-bold">BLACK_FACTION</span>
                    <Button 
                        label={pilots.black === 'human' ? "MANUAL" : "A.R.E.S"} 
                        action={() => pilot('black')} 
                        variant={pilots.black === 'human' ? 'secondary' : 'primary'}
                        size="small"
                    />
                </div>
            </div>

            {/* Group: DIFFICULTY */}
            <div className="flex flex-col gap-3">
                <h4 className="text-[10px] font-mono text-neutral-500 border-b border-neutral-700 pb-1">AI_DIFFICULTY</h4>
                <div className="grid grid-cols-3 gap-2">
                    {Object.keys(DIFFICULTIES).map(key => (
                        <Button 
                            key={key}
                            label={key} 
                            action={() => applyDifficulty(key as keyof typeof DIFFICULTIES)} 
                            variant="secondary"
                            size="small"
                        />
                    ))}
                </div>
            </div>

            {/* Group: HEURISTICS */}
            <div className="flex flex-col gap-3">
                <div className="flex justify-between items-end border-b border-neutral-700 pb-1">
                    <h4 className="text-[10px] font-mono text-neutral-500">NEURAL_TUNING (LAB)</h4>
                    <div className="flex gap-1">
                        {Object.keys(PRESETS).map(key => (
                            <button 
                                key={key}
                                onClick={() => applyPreset(key as keyof typeof PRESETS)}
                                className="text-[8px] font-mono px-2 py-0.5 rounded border border-white/10 hover:border-yellow-500 hover:text-yellow-500 transition-colors"
                            >
                                {key}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                    <ParamSlider label="ASPIRATION" prop="window" min={10} max={200} step={10} desc="Search Window"/>
                    <ParamSlider label="FUTILITY" prop="margin" min={100} max={2000} step={50} desc="Pruning Safety"/>
                    <ParamSlider label="LMR_DEPTH" prop="lmrDepth" min={1} max={6} desc="Reduction Start"/>
                    <ParamSlider label="LMR_COUNT" prop="lmrCount" min={1} max={10} desc="Moves before Red."/>
                </div>
            </div>

            {/* Group: INTELLIGENCE */}
            <div className="flex flex-col gap-4">
                <h4 className="text-[10px] font-mono text-neutral-500 border-b border-neutral-700 pb-1">NEURAL_DENSITY</h4>
                <ExtremeRange label="PILOT_INTELLECT" value={depth} action={level} />
                <ExtremeRange label="ADVISOR_INTELLECT" value={study} action={tutor} />
            </div>
        </div>
      </div>
    </div>
  );
});

Settings.displayName = 'Settings';
