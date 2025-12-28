import { useState, useRef, useEffect, useCallback } from 'react';
import * as Engine from '../engine/index';

interface Stats {
    episodes: number;
    wins: number; // Red wins
    loss: number; // Black wins
    draws: number;
    weights: Record<string, number>; // Best weights
}

interface Session {
    solved: number;
    total: number;
    target: string; // Current Puzzle ID
}

const BASELINE: Record<string, number> = {
    Horse: 270,
    Chariot: 600,
    Cannon: 285,
    Advisor: 120,
    Elephant: 120,
    Soldier: 30
};

export type TunerMode = 'evolution' | 'gym' | 'equilibrium';

export const useTuner = (depth: number) => {
    const [active, setActive] = useState(false);
    const [mode, setMode] = useState<TunerMode>('evolution');
    const [executor, setExecutor] = useState<'worker' | 'main'>('worker');
    const [logs, setLogs] = useState<string[]>([]);
    const [status, setStatus] = useState("IDLE");
    const [customFen, setCustomFen] = useState<string>(""); 
    
    // Draw Streak Tracker to inject Chaos
    const drawStreak = useRef(0);
    
    const depthRef = useRef(depth);
    useEffect(() => { depthRef.current = depth; }, [depth]);

    const [session, setSession] = useState<Session>({ 
        solved: 0, 
        total: Engine.Scenarios.COLLECTION.length, 
        target: '' 
    });

    const [stats, setStats] = useState<Stats>({
        episodes: 0,
        wins: 0,
        loss: 0,
        draws: 0,
        weights: { ...BASELINE }
    });

    const mutation = useRef<{
        param: string;
        delta: number;
        baseline: number; 
        size: number;     
        score: number;    
        count: number;    
        candidateWeights: Record<string, number>; 
    } | null>(null);

    const worker = useRef<Worker | null>(null);
    const activeRef = useRef(active);
    const modeRef = useRef(mode);
    const executorRef = useRef(executor);
    const customFenRef = useRef(customFen);

    useEffect(() => { activeRef.current = active; }, [active]);
    useEffect(() => { modeRef.current = mode; }, [mode]);
    useEffect(() => { executorRef.current = executor; }, [executor]);
    useEffect(() => { customFenRef.current = customFen; }, [customFen]);

    const log = useCallback((msg: string) => setLogs(prev => [msg, ...prev].slice(0, 30)), []);

    // INIT
    useEffect(() => {
        try {
            const memory = localStorage.getItem('ARES_GENOME');
            if (memory) {
                const saved = JSON.parse(memory);
                setStats(s => ({ ...s, weights: { ...BASELINE, ...saved } }));
                log("SYSTEM: MEMORY_LOADED");
            }
        } catch (e) {}
        
        return () => worker.current?.terminate();
    }, [log]);

    const boot = () => {
        if (worker.current) return;
        try {
            // STANDARD WORKER LOADING
            // Uses import.meta.url to resolve relative path correctly through Bundler
            worker.current = new Worker(new URL('../worker/trainer.ts', import.meta.url), { type: 'module' });
            
            worker.current.onmessage = (e) => {
                if (e.data.signal === 'RESULT') handleResult(e.data.result);
                if (e.data.signal === 'SOLUTION') handleSolution(e.data.result);
            };

            worker.current.onerror = (e) => {
                console.warn("Worker Failed:", e);
                log("WARN: WORKER_DIED. FALLBACK_TO_MAIN.");
                worker.current?.terminate();
                worker.current = null;
                setExecutor('main');
            };

            log("WORKER: ONLINE");
            setExecutor('worker');

        } catch (e) {
            console.warn("Worker Init Blocked:", e);
            log("WARN: ENV_RESTRICTED. FALLBACK_TO_MAIN.");
            setExecutor('main');
        }
    };

    const start = () => {
        if (!worker.current && executorRef.current === 'worker') boot();
        setActive(true);
        setStatus("STARTING...");
        
        setTimeout(() => {
            if (modeRef.current === 'evolution') {
                if (!mutation.current) prepareMutation();
                else next(); 
            } else if (modeRef.current === 'equilibrium') {
                trainEquilibrium();
            } else {
                trainTactics();
            }
        }, 100);
    };

    const stop = () => {
        setActive(false);
        setStatus("PAUSED");
        log("TRAINING PAUSED");
    };

    // --- EXECUTION ENGINE ---
    const dispatch = (payload: any) => {
        if (executorRef.current === 'main') {
            // Non-blocking yield for UI updates
            setTimeout(async () => {
                if (!activeRef.current) return;
                
                // Breathing room for UI render
                await new Promise(r => setTimeout(r, 20));

                if (payload.command === 'SIMULATE') {
                    const result = Engine.Simulator.run(payload.config);
                    handleResult(result);
                } else if (payload.command === 'SOLVE') {
                    const result = Engine.Simulator.solve(payload.config);
                    handleSolution(result);
                }
            }, 10);
        } else {
            if (worker.current) {
                worker.current.postMessage(payload);
            } else {
                boot();
                if (!worker.current) {
                    setExecutor('main');
                    dispatch(payload); 
                } else {
                    worker.current.postMessage(payload);
                }
            }
        }
    };

    // --- GYM LOGIC ---
    const pointer = useRef(0);

    const trainTactics = () => {
        if (!activeRef.current) return;
        
        const scenarios = Engine.Scenarios.COLLECTION;
        if (pointer.current >= scenarios.length) {
            pointer.current = 0;
            log("GYM: CYCLE_COMPLETE");
        }

        const puzzle = scenarios[pointer.current];
        setSession(p => ({ ...p, target: puzzle.id }));
        setStatus(`SOLVING: ${puzzle.id}`);
        
        dispatch({
            command: 'SOLVE',
            config: {
                fen: puzzle.fen,
                depth: depthRef.current
            }
        });
    };

    // --- EQUILIBRIUM LOGIC (NASH SEEKER) ---
    const trainEquilibrium = () => {
        if (!activeRef.current) return;
        
        // Chaos Injection: If we drew last time, inject chaos to break the loop.
        const useChaos = drawStreak.current > 0;
        const statusMsg = useChaos ? `EQUILIBRIUM: FORCING_DEVIATION (${drawStreak.current})` : "EQUILIBRIUM: SEEKING...";
        setStatus(statusMsg);
        
        const startFen = customFenRef.current.trim() || undefined;

        dispatch({
            command: 'SIMULATE',
            config: { 
                depth: depthRef.current,
                limit: 300, 
                weights: stats.weights,
                fen: startFen,
                chaos: useChaos, // Dynamic Chaos
                minMoves: useChaos ? 10 : 60 // If chaotic, allow early results
            }
        });
    };

    const handleSolution = (result: { move: number, score: number } | null) => {
        if (modeRef.current === 'gym') {
            const puzzle = Engine.Scenarios.COLLECTION[pointer.current];
            const isMate = result && result.score > 5000;
            const isSolution = result && puzzle.solution && result.move === puzzle.solution;

            if (isMate || isSolution) {
                 const fenBoard = Engine.Snapshot.parse(puzzle.fen);
                 const parts = puzzle.fen.split(' ');
                 const turn = parts[1] === 'b' ? Engine.Types.Side.Black : Engine.Types.Side.Red;
                 const hash = Engine.Hash.compute(fenBoard, turn);
                 Engine.Codex.imprint(hash, result!.move);
                 log(`SOLVED: ${puzzle.id}`);
                 setSession(p => ({ ...p, solved: p.solved + 1 }));
            } else {
                 log(`FAILED: ${puzzle.id}`);
            }
            pointer.current++;
            if (activeRef.current) setTimeout(trainTactics, 50);
        } else if (modeRef.current === 'evolution' && mutation.current) {
             const passed = result && result.score > 5000;
            if (passed) {
                const newWeights = mutation.current.candidateWeights;
                setStats(s => ({ ...s, weights: newWeights }));
                localStorage.setItem('ARES_GENOME', JSON.stringify(newWeights));
                log(`SUCCESS: ${mutation.current.param} UPDATED`);
            } else {
                log(`REJECT: ${mutation.current.param} FAILED IQ TEST`);
            }
            mutation.current = null;
            if (activeRef.current) setTimeout(prepareMutation, 50);
        }
    };

    // --- EVOLUTION LOGIC ---
    const prepareMutation = () => {
        if (!activeRef.current) return;

        const keys = Object.keys(stats.weights);
        const key = keys[Math.floor(Math.random() * keys.length)];
        const magnitude = [5, 10, 20][Math.floor(Math.random() * 3)];
        const sign = Math.random() > 0.5 ? 1 : -1;
        const delta = magnitude * sign;
        const baselineRate = stats.episodes > 0 ? (stats.wins / stats.episodes) : 0.5;

        const candidate = { ...stats.weights };
        candidate[key] += delta;

        mutation.current = {
            param: key,
            delta: delta,
            baseline: baselineRate,
            size: 10, 
            score: 0,
            count: 0,
            candidateWeights: candidate
        };

        log(`EVOLVING: ${key} ${delta > 0 ? '+' : ''}${delta}`);
        setStatus(`BATCH: ${key}`);
        setTimeout(next, 10);
    };

    const next = () => {
        if (!activeRef.current) return;
        if (!mutation.current) return;

        const useScenario = Math.random() > 0.7;
        const scenarios = Engine.Scenarios.COLLECTION;
        const fen = useScenario 
            ? scenarios[Math.floor(Math.random() * scenarios.length)].fen 
            : undefined;

        dispatch({
            command: 'SIMULATE',
            config: { 
                depth: depthRef.current,
                limit: 200, 
                weights: mutation.current.candidateWeights,
                fen: fen,
                chaos: true 
            }
        });
    };

    const handleResult = (result: Engine.Simulator.SimulationResult) => {
        if (!activeRef.current) return; 
        
        const outcome = result.winner;

        setStats(s => {
            const nextStats = { ...s, episodes: s.episodes + 1 };
            if (outcome === 'RED_WIN') nextStats.wins++;
            if (outcome === 'BLACK_WIN') nextStats.loss++;
            if (outcome === 'DRAW') nextStats.draws++;
            return nextStats;
        });

        // --- EQUILIBRIUM LEARNING ---
        if (modeRef.current === 'equilibrium') {
            if (outcome !== 'DRAW') {
                // VICTORY: Learn and Reset Chaos
                drawStreak.current = 0; // Reset streak
                const winnerSide = outcome === 'RED_WIN' ? 0 : 1; 
                const history = result.history;
                
                const lessons: { hash: bigint, move: number }[] = [];
                history.forEach((step, index) => {
                    const stepSide = index % 2; 
                    if (stepSide === winnerSide) {
                        lessons.push(step);
                    }
                });

                const count = Engine.Codex.imprintBatch(lessons);
                log(`NASH: ${outcome} -> LEARNED ${count} PATTERNS`);
            } else {
                // DRAW: Increase Chaos to force deviation next time
                drawStreak.current += 1;
                log(`NASH: DRAW (CHAOS LVL ${drawStreak.current})`);
            }
            
            if (activeRef.current) setTimeout(trainEquilibrium, 0);
            return;
        }

        // --- EVOLUTION LEARNING ---
        if (mutation.current) {
            mutation.current.count++;
            if (outcome === 'RED_WIN') mutation.current.score++;
            else if (outcome === 'DRAW') mutation.current.score += 0.5;

            if (mutation.current.count >= mutation.current.size) {
                const rate = mutation.current.score / mutation.current.count;
                const success = rate > 0.55; 
                if (success) {
                     const testScenario = Engine.Scenarios.COLLECTION[0];
                     dispatch({
                        command: 'SOLVE',
                        config: {
                            fen: testScenario.fen,
                            depth: depthRef.current, 
                            weights: mutation.current?.candidateWeights
                        }
                    });
                } else {
                    log(`REVERT: ${mutation.current.param} LOW WINRATE`);
                    mutation.current = null;
                    if (activeRef.current) setTimeout(prepareMutation, 50);
                }
            } else {
                if (activeRef.current) setTimeout(next, 0);
            }
        } else {
            prepareMutation();
        }
    };

    const exportWeights = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(stats.weights, null, 2));
        const anchor = document.createElement('a');
        anchor.setAttribute("href", dataStr);
        anchor.setAttribute("download", "ares_genome.json");
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
    };

    const importWeights = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target?.result as string);
                setStats(s => ({ ...s, weights: { ...s.weights, ...json } }));
                localStorage.setItem('ARES_GENOME', JSON.stringify(json));
                log(`SYSTEM: IMPORTED`);
            } catch (err) {
                log("ERR: INVALID_FILE");
            }
        };
        reader.readAsText(file);
    };

    const applyToEngine = () => {
        Engine.Score.recalibrate(stats.weights);
        log("SYSTEM: APPLIED_TO_ENGINE");
        alert("A.R.E.S ENGINE UPDATED!");
    };

    const resetMemory = () => {
        if (!confirm("WARNING: FACTORY RESET.\nThis will wipe all learned Weights (Genome) and Patterns (Codex).\n\nAre you sure?")) return;
        
        // 1. Wipe Disk
        localStorage.removeItem('ARES_GENOME');
        Engine.Codex.wipe();

        // 2. Reset RAM
        setStats({
            episodes: 0,
            wins: 0,
            loss: 0,
            draws: 0,
            weights: { ...BASELINE }
        });
        
        log("SYSTEM: FACTORY_RESET_COMPLETE");
    };

    return { 
        active, 
        stats, 
        logs, 
        status, 
        start, 
        stop, 
        exportWeights, 
        importWeights, 
        applyToEngine, 
        resetMemory,
        mode, 
        setMode, 
        session, 
        executor,
        customFen,
        setCustomFen
    };
};