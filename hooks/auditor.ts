
import { useState, useRef, useEffect, useCallback } from 'react';

export interface Report {
    turn: number;
    played: string;
    playedScore: number;
    best: string;
    bestScore: number;
    bestMoveInt: number; // Raw move for Codex
    hash: bigint;        // Position Hash for Codex
    diff: number;
    fen: string;
    pv: number[];
}

export const useAuditor = () => {
    const worker = useRef<Worker | null>(null);
    const [reports, setReports] = useState<Report[]>([]);
    const [progress, setProgress] = useState(0);
    const [total, setTotal] = useState(0);
    const [running, setRunning] = useState(false);

    useEffect(() => {
        return () => worker.current?.terminate();
    }, []);

    const audit = useCallback(async (logText: string, depth: number) => {
        if (worker.current) worker.current.terminate();
        
        setReports([]);
        setRunning(true);
        setProgress(0);

        try {
            // STANDARD WORKER LOADING
            // We trust the bundler (Vite/Webpack) to handle the URL correctly.
            // The previous Blob approach fails because browsers cannot execute raw TypeScript.
            worker.current = new Worker(new URL('../worker/auditor.ts', import.meta.url), { type: 'module' });
            
            worker.current.onmessage = (e) => {
                const { signal, payload, current, total } = e.data;
                
                if (signal === 'MISTAKE') {
                    setReports(prev => [...prev, payload]);
                }
                if (signal === 'PROGRESS') {
                    setProgress(current);
                    setTotal(total);
                }
                if (signal === 'DONE') {
                    setRunning(false);
                    worker.current?.terminate();
                }
                if (signal === 'ERROR') {
                    console.error("AUDIT ERROR:", payload);
                }
            };

            worker.current.onerror = (e) => {
                console.warn("Auditor Worker Error. Switching to Fallback.", e);
                worker.current?.terminate();
                fallbackToMainThread(logText, depth);
            };

            worker.current.postMessage({ command: 'AUDIT', log: logText, depth: depth });

        } catch (e) {
            console.warn("Auditor Worker Boot Failed. Using Main Thread Fallback.", e);
            fallbackToMainThread(logText, depth);
        }
    }, []);

    const fallbackToMainThread = async (logText: string, depth: number) => {
        try {
            const module = await import('../worker/auditor');
            
            // Allow UI to update "Running" state before blocking
            await new Promise(resolve => setTimeout(resolve, 50));

            await module.analyze(logText, depth, {
                mistake: (payload) => setReports(prev => [...prev, payload]),
                progress: (current, total) => {
                    setProgress(current);
                    setTotal(total);
                },
                done: () => setRunning(false),
                error: (msg) => {
                    console.error("AUDIT LOGIC ERROR:", msg);
                    // Critical: In fallback mode, errors must stop the run too
                    setRunning(false); 
                }
            });

        } catch (err) {
            console.error("Main Thread Audit Failed", err);
            setRunning(false);
        }
    };

    const stop = () => {
        worker.current?.terminate();
        setRunning(false);
    };

    return { audit, stop, reports, progress, total, running };
};
