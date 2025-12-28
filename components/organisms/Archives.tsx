
import React, { useState, useMemo } from 'react';
import { Palette, Typography, Effects } from '../../design/tokens';
import { Button } from '../atoms/Button';
import { Frame } from '../atoms/Frame';
import { Scenarios, Library, Snapshot, Flow, Factory, Types, Space, Codec } from '../../engine';
import { LogEntry } from '../../hooks/match';

interface Props {
    close: () => void;
    load: (sequence: string[], logs: LogEntry[]) => void; // UPDATED SIGNATURE
}

export const Archives: React.FC<Props> = React.memo(({ close, load }) => {
    const [tab, setTab] = useState<'openings' | 'endgames'>('openings');
    
    // Group Openings by Type
    const openingGroups = useMemo(() => {
        const groups: Record<string, Library.Opening[]> = {};
        Library.OPENINGS.forEach(op => {
            if (!groups[op.group]) groups[op.group] = [];
            groups[op.group].push(op);
        });
        return groups;
    }, []);

    const playOpening = (moves: number[][]) => {
        // Simulate moves to get FULL HISTORY SEQUENCE
        const board = Factory.genesis();
        let turn = Types.Side.Red;
        
        const history: string[] = [Snapshot.serialize(board)]; // Init with Genesis
        const logs: LogEntry[] = [];

        for (const [fx, fy, tx, ty] of moves) {
            const source = Space.flatten(fx, fy);
            const target = Space.flatten(tx, ty);
            const piece = board[source];
            const role = Codec.role(piece);
            
            // Generate Log
            const sideStr = turn === Types.Side.Red ? "RED" : "BLACK";
            const text = `${sideStr}: ${role} (${fx},${fy}) > (${tx},${ty})`;
            logs.push({ text });

            // Execute
            Flow.commit(board, source, target);
            turn = turn === Types.Side.Red ? Types.Side.Black : Types.Side.Red;
            
            // Snapshot
            const fen = Snapshot.serialize(board);
            history.push(fen);
        }
        
        load(history, logs);
        close();
    };

    const loadEndgame = (fen: string) => {
        // Endgames are single state, no history needed
        // Construct a pseudo-history of 1 item
        load([fen], []);
        close();
    };

    return (
        <div className="w-full h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in bg-black/90 text-white">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <div>
                    <h1 className={`${Typography.Font.Mono} text-3xl text-yellow-500 font-bold tracking-widest`}>
                        ARCHIVES
                    </h1>
                    <p className="text-xs text-neutral-500 font-mono">
                        STRATEGIC KNOWLEDGE BASE
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button label="CLOSE" action={close} variant="secondary" />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4">
                <Button 
                    label="OPENINGS (KHAI CUỘC)" 
                    action={() => setTab('openings')} 
                    variant={tab === 'openings' ? 'primary' : 'secondary'}
                    size="small"
                />
                <Button 
                    label="ENDGAMES (TÀN CUỘC)" 
                    action={() => setTab('endgames')} 
                    variant={tab === 'endgames' ? 'primary' : 'secondary'}
                    size="small"
                />
            </div>

            {/* Content Area */}
            <div className="flex-1 min-h-0 overflow-y-auto pr-2 scrollbar-hide">
                {tab === 'openings' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(openingGroups).map(([group, list]) => (
                            <Frame key={group} label={group} active={true}>
                                <div className="p-3 flex flex-col gap-2">
                                    {(list as Library.Opening[]).map((op, i) => (
                                        <div 
                                            key={i} 
                                            className="p-3 rounded border border-white/5 hover:border-yellow-500/50 bg-white/5 transition-all cursor-pointer group"
                                            onClick={() => playOpening(op.moves)}
                                        >
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-sm font-bold text-white group-hover:text-yellow-500">
                                                    {op.name}
                                                </span>
                                                <span className="text-[9px] font-mono text-neutral-500">
                                                    {op.moves.length} MOVES
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-neutral-400 font-mono leading-relaxed">
                                                {op.desc}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </Frame>
                        ))}
                    </div>
                )}

                {tab === 'endgames' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Scenarios.COLLECTION.map((s, i) => (
                            <div 
                                key={i}
                                className="p-4 rounded border border-white/10 hover:border-green-500/50 bg-black/40 transition-all cursor-pointer group flex flex-col gap-2 relative overflow-hidden"
                                onClick={() => loadEndgame(s.fen)}
                            >
                                <div className="flex justify-between items-start z-10">
                                    <span className="text-sm font-bold text-white group-hover:text-green-400">
                                        {s.name}
                                    </span>
                                    <div className="flex gap-0.5">
                                        {Array.from({ length: 5 }).map((_, star) => (
                                            <div 
                                                key={star} 
                                                className={`w-1 h-1 rounded-full ${star < s.difficulty ? 'bg-red-500' : 'bg-white/10'}`} 
                                            />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-[10px] text-neutral-400 font-mono z-10">
                                    {s.description}
                                </p>
                                <div className="text-[9px] font-mono text-neutral-600 bg-black/50 p-1 rounded z-10 truncate">
                                    ID: {s.id}
                                </div>
                                
                                {/* Decor */}
                                <div className="absolute right-0 bottom-0 text-[60px] opacity-5 font-black leading-none -mb-4 -mr-2">
                                    {i + 1}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
});

Archives.displayName = 'Archives';
