
/**
 * @description  Worker Entry Point.
 * @context      Isolated Thread (No DOM access).
 */

import * as Engine from '../engine/index';
import { Command, Signal, Inbox, Outbox } from './protocol';

const scope: Worker = self as any;

const post = (message: Outbox) => scope.postMessage(message);

scope.onmessage = (event) => {
  const data = event.data;

  switch (data.command) {
    case Command.Think:
      try {
        // STRESS TEST PROTOCOL: Wipe memory if requested (NEW GAME)
        if (data.purge) {
            Engine.Table.clear();
            Engine.Search.reset(); // Clear Heuristics (Killers, History)
        }

        Engine.Codex.refresh();

        const start = performance.now();
        const result = Engine.Search.search(
            data.board, 
            data.side, 
            data.depth,
            (stats) => {
                const now = performance.now();
                post({
                    signal: Signal.Feedback,
                    telemetry: {
                        nodes: stats.nodes,
                        depth: stats.depth,
                        score: stats.score,
                        best: stats.best,
                        line: stats.line,
                        time: now - start,
                        rate: Math.round((stats.nodes / Math.max(1, now - start)) * 1000),
                        hits: stats.hits,
                        probes: stats.probes
                    }
                });
            },
            1, 
            data.history,
            data.book,
            data.tuning,
            data.candidates // PASS CANDIDATES
        );
        const end = performance.now();

        if (result !== null) {
          post({ 
            signal: Signal.Moved, 
            move: result.move,
            score: result.score,
            telemetry: {
                nodes: result.nodes,
                time: end - start,
                depth: data.depth,
                score: result.score,
                best: result.move,
                line: result.line,
                isBook: result.isBook, 
                rate: Math.round((result.nodes / Math.max(1, end - start)) * 1000),
                hits: result.hits,
                probes: result.probes
            }
          });
        } else {
          post({ signal: Signal.Error, reason: "No moves available (Mate/Stale)" });
        }
      } catch (error) {
        post({ signal: Signal.Error, reason: String(error) });
      }
      break;

    case Command.Abort:
      break;
  }
};

post({ signal: Signal.Ready });
