
import React, { useState, useEffect } from 'react';
import { Palette, Typography, Spacing, Effects } from '../../design/tokens';
import { Button } from '../atoms/Button';
import { Frame } from '../atoms/Frame';
import { useAuditor, Report } from '../../hooks/auditor';
import { Space, Codex } from '../../engine/index';

interface Props {
    close: () => void;
    depth: number;
}

export const Auditor: React.FC<Props> = React.memo(({ close, depth }) => {
    const [input, setInput] = useState('');
    const { audit, stop, reports, progress, total, running } = useAuditor();
    // Track memory size for UI feedback
    const [memorySize, setMemorySize] = useState(Codex.size());

    useEffect(() => {
        const interval = setInterval(() => {
            setMemorySize(Codex.size());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const percentage = total > 0 ? Math.round((progress / total) * 100) : 0;

    const teachOne = (report: Report) => {
        Codex.imprint(report.hash, report.bestMoveInt);
        setMemorySize(Codex.size());
    };

    const teachAll = () => {
        if (reports.length === 0) return;
        if (!confirm(`Are you sure you want to imprint ${reports.length} patterns into AI memory?`)) return;
        
        // OPTIMIZATION: Use Batch Imprint to save to disk only ONCE
        const batch = reports.map(r => ({ hash: r.hash, move: r.bestMoveInt }));
        const added = Codex.imprintBatch(batch);
        
        setMemorySize(Codex.size());
        
        if (added > 0) {
            alert(`SUCCESS: Absorbed ${added} new tactical patterns.\n(Skipped ${reports.length - added} duplicates)`);
        } else {
            alert("NO NEW KNOWLEDGE.\nAll these patterns were already in memory.");
        }
    };

    const dumpSource = () => {
        if (memorySize === 0) {
            if (reports.length > 0) {
                if (confirm("Memory is empty. You haven't taught the AI any patterns yet.\n\nDo you want to 'Teach All' detected mistakes first?")) {
                    teachAll();
                    // Proceed to dump after teaching
                } else {
                    return;
                }
            } else {
                alert("Memory is empty. Nothing to dump.\nRun an audit and 'Teach' the AI first.");
                return;
            }
        }
        
        const code = Codex.dump();
        navigator.clipboard.writeText(code);
        alert(`SOURCE CODE COPIED (${Codex.size()} entries)!\n\nINSTRUCTIONS:\n1. Open 'engine/library.ts'\n2. Replace 'const KNOWLEDGE = {...}'\n3. Commit changes.`);
    };

    return (
        <div className="w-full h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in bg-black/90 text-white">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <div>
                    <h1 className={`${Typography.Font.Mono} text-3xl text-red-500 font-bold tracking-widest`}>
                        A.R.E.S AUDITOR
                    </h1>
                    <div className="flex gap-2 items-center">
                        <p className="text-xs text-neutral-500 font-mono">
                            POST-MORTEM TACTICAL ANALYSIS
                        </p>
                        <span className="text-[9px] px-2 rounded border border-yellow-500 text-yellow-500 font-mono">
                            DEPTH {depth}
                        </span>
                        <span className="text-[9px] px-2 rounded border border-green-500 text-green-500 font-mono">
                            MEMORY: {memorySize}
                        </span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button label="CLOSE" action={close} variant="secondary" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
                {/* Input Panel */}
                <div className="flex flex-col gap-4">
                    <Frame label="BATTLE_LOG_INPUT" active={true} className="flex-1">
                        <textarea 
                            className="w-full h-full bg-transparent border-none p-4 font-mono text-[10px] text-neutral-300 focus:outline-none resize-none"
                            placeholder="PASTE LOG HERE (e.g. 1. RED: 6 (7,7) > (4,7)...)"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                        />
                    </Frame>
                    <div className="flex gap-2">
                        <Button 
                            label={running ? `ANALYZING ${percentage}%` : "RUN AUDIT"} 
                            action={() => running ? stop() : audit(input, depth)} 
                            variant={running ? "secondary" : "primary"}
                            disabled={!input || (running && progress === total)}
                            className="flex-1"
                        />
                    </div>
                </div>

                {/* Report Panel */}
                <div className="flex flex-col gap-4">
                    <Frame label="DETECTED_INEFFICIENCIES" active={reports.length > 0} className="flex-1">
                        <div className="absolute inset-0 overflow-y-auto p-4 flex flex-col gap-3">
                            {reports.length === 0 && !running && (
                                <div className="text-center text-neutral-600 font-mono text-xs mt-10">
                                    NO DATA. SYSTEM READY.
                                </div>
                            )}
                            
                            {reports.map((r, i) => (
                                <div 
                                    key={i} 
                                    className="p-3 rounded border border-white/5 bg-white/5 flex flex-col gap-1 hover:border-red-500/50 transition-colors group"
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="text-yellow-500 font-bold font-mono text-xs">TURN {r.turn}</span>
                                        <div className="flex gap-2 items-center">
                                            <span className="text-red-400 font-mono text-[10px] font-bold">LOSS: {r.diff}</span>
                                            <button 
                                                onClick={() => teachOne(r)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] bg-green-900 text-green-300 px-2 rounded border border-green-700 hover:bg-green-800"
                                            >
                                                TEACH
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center text-[10px] font-mono mt-1">
                                        <div className="opacity-50 line-through text-red-300">{r.played}</div>
                                        <div className="text-center text-yellow-500">➔</div>
                                        <div className="text-green-400 font-bold">{r.best}</div>
                                    </div>

                                    {/* PV Line */}
                                    <div className="mt-2 pt-2 border-t border-white/5 text-[9px] text-neutral-500 font-mono truncate">
                                        PV: {r.pv.map(m => {
                                            const f = Space.expand(m >> 8);
                                            const t = Space.expand(m & 0xFF);
                                            return `${f.x}${f.y}-${t.x}${t.y}`;
                                        }).join(' ')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Frame>
                    <div className="flex gap-2 justify-end">
                        <span className="text-xs font-mono text-neutral-500 self-center">
                            {reports.length} MISTAKES
                        </span>
                        <Button label="TEACH ALL" action={teachAll} variant="primary" size="small" disabled={reports.length === 0}/>
                        <Button label="DUMP SOURCE" action={dumpSource} variant="secondary" size="small" />
                    </div>
                </div>
            </div>
        </div>
    );
});

Auditor.displayName = 'Auditor';
