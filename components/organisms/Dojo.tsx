
import React, { useRef, useState, useEffect } from 'react';
import { Palette, Typography, Effects, Spacing } from '../../design/tokens';
import { Button } from '../atoms/Button';
import { useTuner } from '../../hooks/tuner';
import { Frame } from '../atoms/Frame';

interface Props {
    close: () => void;
    depth: number;
}

export const Dojo: React.FC<Props> = React.memo(({ close, depth }) => {
    const { 
        active, stats, logs, status, start, stop, 
        exportWeights, importWeights, applyToEngine, resetMemory,
        mode, setMode, session, executor,
        customFen, setCustomFen 
    } = useTuner(depth);
    
    const fileInput = useRef<HTMLInputElement>(null);
    const [storageContent, setStorageContent] = useState<string>("LOADING...");

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            importWeights(e.target.files[0]);
        }
    };

    useEffect(() => {
        const poll = setInterval(() => {
            try {
                const raw = localStorage.getItem('ARES_GENOME');
                const codex = localStorage.getItem('ARES_CODEX_V1');
                
                let content = "";
                if (raw) content += "GENOME (WEIGHTS):\n" + JSON.stringify(JSON.parse(raw), null, 2) + "\n\n";
                if (codex) {
                    const c = JSON.parse(codex);
                    content += `CODEX (PATTERNS): ${Object.keys(c).length} entries\n`;
                }
                if (!raw && !codex) content = "STORAGE_EMPTY (Using Baseline)";
                
                setStorageContent(content);
            } catch (e) {
                setStorageContent("ERROR_READING_STORAGE");
            }
        }, 500); 
        return () => clearInterval(poll);
    }, []);

    return (
        <div className="w-full h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <div>
                    <h1 className={`${Typography.Font.Mono} text-3xl text-yellow-500 font-bold tracking-widest`}>
                        A.R.E.S DOJO
                    </h1>
                    <div className="flex gap-2 items-center">
                        <p className="text-xs text-neutral-500 font-mono">
                            AUTONOMOUS REINFORCEMENT TRAINING GROUND
                        </p>
                        <span className={`text-[9px] px-2 rounded border ${executor === 'worker' ? 'border-green-500 text-green-500' : 'border-yellow-500 text-yellow-500'}`}>
                            {executor === 'worker' ? 'WORKER_MODE' : 'MAIN_THREAD_MODE'}
                        </span>
                        <span className="text-[9px] px-2 rounded border border-yellow-500 text-yellow-500">
                            DEPTH {depth}
                        </span>
                    </div>
                </div>
                <div className="flex gap-4 items-center">
                    <div className="text-right hidden sm:block">
                        <span className="text-[10px] text-neutral-500 block">SYSTEM STATUS</span>
                        <span className={`text-sm font-mono font-bold ${active ? 'text-green-500 animate-pulse' : 'text-neutral-400'}`}>
                            {status}
                        </span>
                    </div>
                    <Button label="EXIT_SIMULATION" action={close} variant="secondary" />
                </div>
            </div>

            {/* Mode Switcher */}
            <div className="flex gap-4">
                <Button 
                    label="EVOLUTION (WEIGHTS)" 
                    action={() => setMode('evolution')} 
                    variant={mode === 'evolution' ? 'primary' : 'secondary'}
                    size="small"
                />
                <Button 
                    label="TACTICAL GYM (PUZZLES)" 
                    action={() => setMode('gym')} 
                    variant={mode === 'gym' ? 'primary' : 'secondary'}
                    size="small"
                />
                <Button 
                    label="EQUILIBRIUM (OPENING)" 
                    action={() => setMode('equilibrium')} 
                    variant={mode === 'equilibrium' ? 'primary' : 'secondary'}
                    size="small"
                />
            </div>

            {/* Main Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">
                
                {/* Column 1: Control & Stats */}
                <div className="flex flex-col gap-4">
                    <Frame label="CONTROL_DECK" active={active}>
                        <div className="p-4 flex flex-col gap-4">
                            
                            {/* FEN INPUT FOR EQUILIBRIUM */}
                            {mode === 'equilibrium' && (
                                <div className="flex flex-col gap-1">
                                    <span className="text-[9px] text-neutral-500 font-mono">TARGET_OPENING (FEN)</span>
                                    <input 
                                        type="text"
                                        placeholder="Paste FEN or leave empty for Genesis..."
                                        className="w-full bg-black/40 border border-white/10 rounded p-2 text-[10px] font-mono text-yellow-500 focus:border-yellow-500 focus:outline-none"
                                        value={customFen}
                                        onChange={(e) => setCustomFen(e.target.value)}
                                        disabled={active}
                                    />
                                    <p className="text-[9px] text-neutral-600 font-mono">
                                        System will play Red vs Black repeatedly. Winners teach the Codex.
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <Button 
                                    label={active ? "PAUSE" : "INITIALIZE"} 
                                    action={active ? stop : start} 
                                    variant={active ? "secondary" : "primary"}
                                    className="flex-1"
                                />
                            </div>
                            
                            {/* STATS DISPLAY */}
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                                <div>
                                    <span className="text-[9px] text-neutral-500 font-mono block">EPISODES</span>
                                    <span className="text-xl font-mono text-white">{stats.episodes}</span>
                                </div>
                                <div>
                                    <span className="text-[9px] text-neutral-500 font-mono block">RED WIN RATE</span>
                                    <span className="text-xl font-mono text-green-500">
                                        {stats.episodes > 0 ? ((stats.wins / stats.episodes) * 100).toFixed(1) : 0}%
                                    </span>
                                </div>
                                {mode === 'gym' && (
                                    <div className="col-span-2">
                                        <span className="text-[9px] text-neutral-500 font-mono block">PUZZLES SOLVED</span>
                                        <div className="flex justify-between items-end">
                                            <span className="text-xl font-mono text-yellow-500">{session.solved} / {session.total}</span>
                                            <span className="text-xs font-mono text-neutral-400">{session.target}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Frame>

                    {mode === 'evolution' && (
                        <Frame label="CURRENT_GENOME (LIVE)" className="flex-1">
                            <div className="p-4 font-mono text-xs flex flex-col gap-2 overflow-y-auto max-h-[200px]">
                                {Object.entries(stats.weights).map(([key, val]) => (
                                    <div key={key} className="flex justify-between border-b border-white/5 pb-1">
                                        <span className="text-neutral-400">{key.toUpperCase()}</span>
                                        <span className="text-yellow-500 transition-all duration-300">{val}</span>
                                    </div>
                                ))}
                            </div>
                        </Frame>
                    )}

                    <Frame label="DATA_MANAGEMENT">
                        <div className="p-4 grid grid-cols-2 gap-2">
                            <Button label="EXPORT JSON" action={exportWeights} variant="secondary" size="small" />
                            <Button label="IMPORT JSON" action={() => fileInput.current?.click()} variant="secondary" size="small" />
                            <input 
                                type="file" 
                                ref={fileInput} 
                                className="hidden" 
                                accept=".json" 
                                onChange={handleUpload}
                            />
                            <div className="col-span-2 mt-2 flex gap-2">
                                <Button label="APPLY TO ENGINE" action={applyToEngine} variant="primary" size="small" className="flex-1" />
                                <Button label="PURGE MEMORY" action={resetMemory} variant="danger" size="small" />
                            </div>
                        </div>
                    </Frame>
                </div>

                {/* Column 2: Terminal Output & Memory Inspector */}
                <div className="md:col-span-2 flex flex-col gap-4">
                    <Frame label="SIMULATION_LOGS" className="flex-1">
                        <div className="p-4 font-mono text-[10px] flex flex-col gap-1 h-full overflow-y-auto">
                            {logs.map((line, i) => (
                                <div key={i} className="opacity-80">
                                    <span className="text-neutral-500 mr-2">[{i}]</span>
                                    <span className={
                                        line.includes('WIN') || line.includes('SOLVED') || line.includes('UPDATED') ? 'text-green-500' :
                                        line.includes('FAIL') || line.includes('REVERT') ? 'text-red-500' :
                                        line.includes('GYM') || line.includes('EVOLVING') || line.includes('NASH') ? 'text-yellow-500' :
                                        'text-neutral-300'
                                    }>
                                        {line}
                                    </span>
                                </div>
                            ))}
                            {logs.length === 0 && (
                                <span className="opacity-20 text-center mt-10">SYSTEM_IDLE</span>
                            )}
                        </div>
                    </Frame>

                    <Frame label="PERSISTENT_MEMORY_INSPECTOR (Real-time Disk View)" className="h-[200px]">
                        <pre className="p-4 font-mono text-[10px] text-green-400 h-full overflow-y-auto whitespace-pre-wrap select-text bg-black/20">
                            {storageContent}
                        </pre>
                    </Frame>
                </div>
            </div>
        </div>
    );
});

Dojo.displayName = 'Dojo';
