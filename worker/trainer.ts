
/**
 * @description  Training Simulation Worker.
 * @purpose      Run fast games (Self-play) OR Solve Puzzles.
 */

import * as Simulator from '../engine/simulator';

const scope: Worker = self as any;

scope.onmessage = (event) => {
    const { command, config } = event.data;
    
    if (command === 'SIMULATE') {
        try {
            const result = Simulator.run(config);
            scope.postMessage({ signal: 'RESULT', result });
        } catch (e) {
            console.error("Trainer Runtime Error:", e);
            scope.postMessage({ signal: 'RESULT', result: 'DRAW' });
        }
    }
    
    if (command === 'SOLVE') {
        try {
            const result = Simulator.solve(config);
            scope.postMessage({ signal: 'SOLUTION', result });
        } catch (e) {
            scope.postMessage({ signal: 'SOLUTION', result: null });
        }
    }
};
