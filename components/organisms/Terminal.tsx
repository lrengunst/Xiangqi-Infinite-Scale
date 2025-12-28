
import React, { useState } from 'react';
import { Palette, Typography, Spacing, Effects, Layer } from '../../design/tokens';
import { Button } from '../atoms/Button';

interface Props {
  status: string;
  code: string; // The generated token to share
  host: () => void;
  join: (code: string) => void;
  accept: (code: string) => void;
  close: () => void;
}

/**
 * @description  The Connection Terminal.
 * @style        Cyberpunk / Command Line Interface.
 * @atomic       ORGANISM
 */
export const Terminal: React.FC<Props> = ({ status, code, host, join, accept, close }) => {
  const [input, entry] = useState('');
  const [mode, style] = useState<'menu' | 'host' | 'join'>('menu');

  // Copy to clipboard
  const copy = () => {
      navigator.clipboard.writeText(code);
      alert("SECURE TOKEN COPIED TO CLIPBOARD");
  };

  const submit = () => {
      if (mode === 'join') join(input);
      if (mode === 'host') accept(input); // Host accepts Guest's answer
      entry('');
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4"
      onClick={close}
      style={{ zIndex: Layer.Modal }}
    >
      <div 
        className="w-full max-w-[500px] p-6 rounded-xl border border-neutral-600 shadow-2xl flex flex-col gap-4"
        style={{ backgroundColor: Palette.App.Panel }}
        onClick={event => event.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-neutral-700 pb-2">
           <h2 className={`${Typography.Font.Mono} text-xl text-yellow-500`}>
             > PROTOCOL
           </h2>
           <span className="text-xs text-neutral-400 font-mono uppercase">{status}</span>
        </div>

        {/* MENU MODE */}
        {mode === 'menu' && (
            <div className="flex flex-col sm:flex-row gap-4 py-8">
                <Button label="HOST" action={() => { host(); style('host'); }} size="medium" />
                <Button label="JOIN" action={() => style('join')} variant="secondary" size="medium" />
            </div>
        )}

        {/* HOST MODE */}
        {mode === 'host' && (
            <div className="flex flex-col gap-4">
                <p className="text-sm text-neutral-400 font-mono">
                    1. SEND TOKEN:
                </p>
                <div 
                    className="p-2 bg-black/50 border border-neutral-700 font-mono text-xs break-all cursor-pointer hover:border-yellow-500 overflow-y-auto max-h-24"
                    onClick={copy}
                >
                    {code || "GENERATING..."}
                </div>
                
                <p className="text-sm text-neutral-400 font-mono mt-4">
                    2. PASTE RESPONSE:
                </p>
                <textarea 
                    className="w-full h-20 bg-black/30 border border-neutral-600 p-2 text-xs font-mono text-white focus:outline-none focus:border-yellow-500 resize-none"
                    placeholder="TOKEN..."
                    value={input}
                    onChange={event => entry(event.target.value)}
                />
                <Button label="ESTABLISH" action={submit} disabled={!input} />
            </div>
        )}

        {/* JOIN MODE */}
        {mode === 'join' && (
             <div className="flex flex-col gap-4">
                 <p className="text-sm text-neutral-400 font-mono">
                     1. PASTE HOST TOKEN:
                 </p>
                 <textarea 
                     className="w-full h-20 bg-black/30 border border-neutral-600 p-2 text-xs font-mono text-white focus:outline-none focus:border-yellow-500 resize-none"
                     placeholder="TOKEN..."
                     value={input}
                     onChange={event => entry(event.target.value)}
                 />
                 <Button label="GENERATE" action={submit} disabled={!input} />
                 
                 {code && (
                     <>
                        <p className="text-sm text-neutral-400 font-mono mt-2">
                            2. SEND TO HOST:
                        </p>
                        <div 
                            className="p-2 bg-black/50 border border-neutral-700 font-mono text-xs break-all cursor-pointer hover:border-yellow-500 overflow-y-auto max-h-24"
                            onClick={copy}
                        >
                            {code}
                        </div>
                        <p className="text-xs text-green-500 font-mono text-center">
                            WAITING...
                        </p>
                     </>
                 )}
             </div>
        )}
      </div>
    </div>
  );
};

Terminal.displayName = 'Terminal';
