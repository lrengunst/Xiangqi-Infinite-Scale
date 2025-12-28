
import React, { useMemo } from 'react';
import { Palette, Typography } from '../../design/tokens';
import { Format, Snapshot, Score } from '../../engine';
import { Telemetry } from '../../worker/protocol';

interface Props {
    fen: string;
    stats: Telemetry | null;
}

/**
 * @description  Visualizer for the AI's Neural Cortex (Inference Tree & Reasoning).
 * @purpose      Explain "Why" the AI made the decision.
 * @atomic       MOLECULE
 */
export const Cortex: React.FC<Props> = React.memo(({ fen, stats }) => {
    
    // O(N) Analysis of the current position (Fast enough for UI render)
    const diagnosis = useMemo(() => {
        if (!fen) return null;
        const board = Snapshot.parse(fen);
        return Score.report(board);
    }, [fen]);

    if (!stats || !diagnosis) return null;

    // Cache Efficiency Calculation
    const hitRate = stats.probes && stats.probes > 0 
        ? Math.round((stats.hits || 0) / stats.probes * 100) 
        : 0;
    
    const optimization = stats.nodes > 0 
        ? Math.min(100, Math.round(((stats.hits || 0) * 10) / stats.nodes * 100))
        : 0;

    const redPower = diagnosis.red.total;
    const blackPower = diagnosis.black.total;
    const maxPower = Math.max(redPower, blackPower, 1);
    
    const Bar = ({ value, color, label, max = maxPower }: { value: number, color: string, label: string, max?: number }) => (
        <div className="flex items-center gap-2 w-full group">
            <span className="text-[9px] font-mono opacity-50 w-6 group-hover:opacity-100 transition-opacity">{label}</span>
            <div className="flex-1 h-1.5 bg-white/5 rounded-sm overflow-hidden border border-white/5">
                <div 
                    className="h-full transition-all duration-500 ease-out"
                    style={{ 
                        width: `${Math.min(100, (value / max) * 100)}%`,
                        backgroundColor: color 
                    }}
                />
            </div>
            <span className="text-[9px] font-mono font-bold w-8 text-right text-white opacity-80">{value}</span>
        </div>
    );

    const PatternTag: React.FC<{ label: string }> = ({ label }) => (
        <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-neutral-300">
            {label}
        </span>
    );

    const StrategyLabel: React.FC<{ agg: number, mat: number }> = ({ agg, mat }) => {
        const ratio = agg / (mat || 1);
        let label = "BALANCED";
        let color = Palette.Signal.Target;
        
        if (ratio > 0.15) { label = "AGGRESSIVE"; color = Palette.Signal.Danger; }
        else if (ratio < 0.05) { label = "DEFENSIVE"; color = Palette.Signal.Active; }
        
        return <span style={{ color }} className="font-bold">{label}</span>;
    };

    return (
        <div className="flex flex-col gap-3 mt-3 pt-3 border-t border-white/10 animate-fade-in">
            <div className="flex justify-between items-center">
                <h5 className={`${Typography.Font.Mono} text-[10px] font-bold text-yellow-500 tracking-widest`}>
                    CORTEX_COGNITION_V2
                </h5>
                <div className="flex gap-1">
                    {stats.isBook && <span className="text-[9px] text-green-500 font-bold font-mono">LIBRARY_HIT</span>}
                </div>
            </div>

            {/* SECTOR 0: CONFIDENCE (WIN PROBABILITY) */}
            <div className="flex flex-col gap-1 bg-black/20 p-2 rounded border border-white/5 relative overflow-hidden">
                <div className="flex justify-between items-end z-10">
                    <span className="text-[9px] font-mono text-neutral-500">WIN_PROBABILITY</span>
                    <span className={`text-xl font-bold font-mono ${diagnosis.winRate > 50 ? 'text-red-500' : 'text-neutral-300'}`}>
                        {diagnosis.winRate}% <span className="text-[9px] opacity-50">RED</span>
                    </span>
                </div>
                {/* Probability Bar */}
                <div className="w-full h-2 bg-white/10 rounded-full mt-1 overflow-hidden z-10 flex">
                    <div 
                        className="h-full bg-red-600 transition-all duration-700" 
                        style={{ width: `${diagnosis.winRate}%` }} 
                    />
                    <div className="h-full bg-neutral-700 flex-1" />
                </div>
                {/* Background Decor */}
                <div className="absolute -right-2 -bottom-4 text-[40px] opacity-5 font-black">
                    {diagnosis.winRate}
                </div>
            </div>

            {/* SECTOR 1: MEMORY EFFICIENCY (CACHE) */}
            {!stats.isBook && (
                <div className="grid grid-cols-3 gap-2 bg-black/30 p-2 rounded border border-white/5">
                    <div className="flex flex-col items-center">
                        <span className="text-[8px] text-neutral-500 font-mono">HITS</span>
                        <span className="text-white font-mono font-bold text-xs">{Format.metric(stats.hits || 0)}</span>
                    </div>
                    <div className="flex flex-col items-center border-l border-white/5">
                        <span className="text-[8px] text-neutral-500 font-mono">EFFICIENCY</span>
                        <span className={`font-mono font-bold text-xs ${hitRate > 40 ? 'text-green-500' : 'text-yellow-500'}`}>
                            {hitRate}%
                        </span>
                    </div>
                    <div className="flex flex-col items-center border-l border-white/5">
                        <span className="text-[8px] text-neutral-500 font-mono">PRUNING</span>
                        <span className="text-blue-400 font-mono font-bold text-xs">~{optimization}%</span>
                    </div>
                </div>
            )}

            {/* SECTOR 2: INFERENCE TREE (FACTOR BREAKDOWN) */}
            <div className="flex flex-col gap-2 p-2 rounded border border-white/5 bg-black/20">
                <div className="grid grid-cols-2 gap-4">
                    {/* RED FACTION */}
                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-end border-b border-white/5 pb-1 mb-1">
                            <span className="text-[9px] text-red-400 font-mono font-bold">RED_FORCE</span>
                            <span className="text-[8px] font-mono opacity-50">
                                <StrategyLabel agg={diagnosis.red.aggression} mat={diagnosis.red.material} />
                            </span>
                        </div>
                        <Bar value={diagnosis.red.material} color={Palette.Faction.Red} label="MAT" />
                        <Bar value={diagnosis.red.position} color={Palette.Signal.Active} label="POS" />
                        <Bar value={diagnosis.red.aggression} color={Palette.Signal.Danger} label="AGG" />
                        
                        <div className="flex flex-wrap gap-1 mt-2 content-start min-h-[20px]">
                            {diagnosis.red.patterns.length > 0 ? (
                                diagnosis.red.patterns.map(p => <PatternTag key={p} label={p} />)
                            ) : <span className="text-[8px] text-neutral-700 font-mono italic">NO_FORMATION</span>}
                        </div>
                    </div>

                    {/* BLACK FACTION */}
                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-end border-b border-white/5 pb-1 mb-1 text-right">
                            <span className="text-[8px] font-mono opacity-50">
                                <StrategyLabel agg={diagnosis.black.aggression} mat={diagnosis.black.material} />
                            </span>
                            <span className="text-[9px] text-neutral-400 font-mono font-bold">BLACK_FORCE</span>
                        </div>
                        <Bar value={diagnosis.black.material} color={Palette.App.Text} label="MAT" />
                        <Bar value={diagnosis.black.position} color={Palette.Signal.Active} label="POS" />
                        <Bar value={diagnosis.black.aggression} color={Palette.Signal.Danger} label="AGG" />

                        <div className="flex flex-wrap gap-1 mt-2 justify-end content-start min-h-[20px]">
                            {diagnosis.black.patterns.length > 0 ? (
                                diagnosis.black.patterns.map(p => <PatternTag key={p} label={p} />)
                            ) : <span className="text-[8px] text-neutral-700 font-mono italic">NO_FORMATION</span>}
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTOR 3: SEARCH DEPTH VISUALIZATION */}
            <div className="flex items-center gap-1 opacity-50">
                <span className="text-[8px] font-mono text-neutral-500">SEARCH_DEPTH:</span>
                {Array.from({ length: 16 }).map((_, i) => (
                    <div 
                        key={i} 
                        className={`h-1 flex-1 rounded-full ${i < (stats.depth || 0) ? 'bg-yellow-500 shadow-[0_0_5px_#eab308]' : 'bg-white/10'}`} 
                    />
                ))}
            </div>
        </div>
    );
});

Cortex.displayName = 'Cortex';
