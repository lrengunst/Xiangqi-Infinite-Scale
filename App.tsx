
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Arena } from './components/organisms/Arena';
import { Hud } from './components/organisms/Hud';
import { Network } from './components/organisms/Network';
import { History } from './components/organisms/History';
import { Monitor } from './components/organisms/Monitor';
import { Terminal } from './components/organisms/Terminal';
import { Settings, Pilot } from './components/organisms/Settings';
import { Analyzer } from './components/organisms/Analyzer';
import { Dojo } from './components/organisms/Dojo'; 
import { Auditor } from './components/organisms/Auditor';
import { Archives } from './components/organisms/Archives'; 
import { Frame } from './components/atoms/Frame';
import { Map } from './components/molecules/Map';
import { Wire } from './components/molecules/Wire';
import { Palette, Typography } from './design/tokens';
import { useWorker } from './hooks/worker';
import { useMatch } from './hooks/match';
import { useMesh } from './hooks/mesh';
import * as Theme from './design/theme';
import * as Sound from './design/sound'; 
import { Telemetry } from './worker/protocol';
import { Tuning, Side } from './engine/types';
import { DEFAULTS } from './engine/search';

type Route = 'arena' | 'dojo' | 'auditor' | 'archives'; 

export const App: React.FC = () => {
  const [route, navigate] = useState<Route>('arena'); 
  
  const [panel, configure] = useState(false);
  const [terminal, setup] = useState(false);
  
  // SENSORY STATE
  const [volume, setVolume] = useState(50);
  const [pace, setPace] = useState(300);
  const [haptics, setHaptics] = useState(true); 
  
  // VISUAL STATE
  const [coords, setCoords] = useState(true); 
  const [fx, setFx] = useState(true);         

  // GAMEPLAY STATE
  const [assist, help] = useState(false); 
  const [book, setBook] = useState(true); 
  const [flip, invert] = useState(false); 
  const [autoFlip, setAutoFlip] = useState(false); 
  
  const [tuning, setTuning] = useState<Tuning>(DEFAULTS);

  const [monitor, setMonitor] = useState(() => {
      try {
          const saved = localStorage.getItem('ARES_HUD');
          return saved !== null ? JSON.parse(saved) : true;
      } catch { return true; }
  });

  const [depth, level] = useState(6); 
  const [study, tutor] = useState(12);
  const [theme, style] = useState<Theme.Mode>('war');
  const [pilots, drive] = useState<{ red: Pilot; black: Pilot }>({
    red: 'human',
    black: 'ai',
  });

  const toggleMonitor = useCallback(() => {
      setMonitor((prev: boolean) => {
          const next = !prev;
          localStorage.setItem('ARES_HUD', JSON.stringify(next));
          return next;
      });
  }, []);

  const updateTuning = useCallback((key: keyof Tuning, val: number) => {
      setTuning(prev => ({ ...prev, [key]: val }));
  }, []);

  const match = useMatch();
  const brain = useWorker();

  const [events, log] = useState<string[]>(["SYSTEM_READY", "WAR_PROTOCOL_ACTIVE"]);

  const push = useCallback((message: string) => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    log(prev => [...prev, `[${time}] ${message}`]);
  }, []);

  const mesh = useMesh(useCallback((packet) => {
    if (packet.type === 'move') {
        match.sync(packet.payload);
        push("REMOTE_PACKET_RECEIVED");
    }
  }, [match, push]));

  const step = useCallback((source: number, target: number, text: string, stats?: Telemetry) => {
    match.move(source, target, text, stats);
    push(`LOCAL_STEP: ${text.split(':')[1].trim()}`);
  }, [match, push]);

  const analyze = useCallback(() => {
      if (brain.thinking) return;
      const useBook = false; 
      const forcePurge = true;
      push(`MANUAL_COMPUTE: DEPTH_${study} [RAW_MODE]`);
      brain.think(match.board, match.turn, study, match.hashes, useBook, () => {
          push("COMPUTATION_COMPLETE");
      }, forcePurge, tuning);
  }, [brain, match.board, match.turn, match.hashes, study, push, tuning]);

  // EFFECTS
  useEffect(() => {
      if (mesh.status === 'connected') push("MESH_LINK_ESTABLISHED");
      if (mesh.status === 'gathering') push("GATHERING_ICE_CANDIDATES");
  }, [mesh.status, push]);

  useEffect(() => {
      if (brain.thinking) push(`AI_THINKING`);
      if (brain.error) push(`AI_FAILURE: ${brain.error.toUpperCase()}`);
  }, [brain.thinking, brain.error, push]);

  useEffect(() => {
    if (mesh.status === 'connected' && match.history.length > 1) {
      const last = match.history[match.history.length - 1];
      mesh.send({ type: 'move', payload: last });
    }
  }, [match.history, mesh.status]);

  // SENSORY TUNING
  useEffect(() => {
    Theme.apply(theme);
    push(`THEME_CHANGED: ${theme.toUpperCase()}`);
  }, [theme, push]);

  useEffect(() => {
      Sound.level(volume);
  }, [volume]);

  useEffect(() => {
      Theme.pace(pace);
  }, [pace]);

  // AUTO FLIP LOGIC
  useEffect(() => {
      if (autoFlip) {
          invert(match.turn === Side.Black);
      }
  }, [match.turn, autoFlip]);

  if (route === 'dojo') {
      return (
        <div 
            className={`min-h-screen ${Typography.Font.Sans}`}
            style={{ backgroundColor: Palette.App.Background, color: Palette.App.Text }}
        >
            {monitor && <Monitor />}
            <Dojo close={() => navigate('arena')} depth={depth} />
        </div>
      );
  }

  if (route === 'auditor') {
      return (
        <div 
            className={`min-h-screen ${Typography.Font.Sans}`}
            style={{ backgroundColor: Palette.App.Background, color: Palette.App.Text }}
        >
            {monitor && <Monitor />}
            <Auditor close={() => navigate('arena')} depth={depth} />
        </div>
      );
  }

  if (route === 'archives') {
      return (
        <div 
            className={`min-h-screen ${Typography.Font.Sans}`}
            style={{ backgroundColor: Palette.App.Background, color: Palette.App.Text }}
        >
            {monitor && <Monitor />}
            <Archives 
                close={() => navigate('arena')} 
                load={(history, logs) => {
                    match.load(history, logs);
                    push("LIBRARY_SEQUENCE_LOADED");
                }}
            />
        </div>
      );
  }

  return (
    <div 
      className={`min-h-screen ${Typography.Font.Sans} p-4 sm:p-6 lg:p-12 flex flex-col gap-6`}
      style={{ backgroundColor: Palette.App.Background, color: Palette.App.Text }}
    >
      {monitor && <Monitor />}
      
      <div className="absolute top-0 right-0 p-4 z-50 flex gap-2">
          <button 
            onClick={() => navigate('auditor')}
            className="text-[10px] font-mono text-red-500 border border-red-500/30 px-2 py-1 rounded hover:bg-red-500/10 transition-colors"
          >
              AUDITOR
          </button>
          <button 
            onClick={() => navigate('dojo')}
            className="text-[10px] font-mono text-yellow-500 border border-yellow-500/30 px-2 py-1 rounded hover:bg-yellow-500/10 transition-colors"
          >
              DOJO
          </button>
      </div>
      
      <div className="w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        <div className="lg:col-span-8 flex flex-col gap-6">
          <Hud 
            pilots={pilots}
            reset={match.reset} 
            connect={() => setup(true)} 
            config={() => configure(true)}
            library={() => navigate('archives')} 
            flip={flip}
            toggleFlip={() => {
                if (autoFlip) setAutoFlip(false); 
                invert(!flip);
            }}
          />
          
          <Arena 
            board={match.board}
            turn={match.turn}
            over={match.over}
            depth={depth}
            book={book} 
            pilots={pilots}
            worker={brain}
            step={step}
            trace={match.trace} 
            assist={assist} 
            history={match.hashes}
            flip={flip}
            tuning={tuning}
            haptics={haptics}
            coords={coords} 
            fx={fx}         
          />

          <Network 
            ready={brain.ready} 
            thinking={brain.thinking} 
            mode={brain.mode}
            error={brain.error}
            progress={brain.progress}
            stats={brain.stats} 
          />
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          
          <div className="grid grid-cols-2 gap-4 h-[180px]">
             <Frame label="TACTICAL_MAP" active={brain.thinking} className="h-full">
                <Map board={match.board} focus={match.trace?.to} />
             </Frame>
             <Frame label="EVENT_WIRE" active={mesh.status === 'connected'} className="h-full">
                <Wire events={events} />
             </Frame>
          </div>

          <Frame label="TELEMETRY" active={true}>
              <div className="p-4 flex flex-col gap-2">
                 <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="opacity-50">MESH_LINK:</span>
                    <span style={{ color: mesh.status === 'connected' ? Palette.Signal.Target : Palette.Signal.Danger }}>
                      {mesh.status.toUpperCase()}
                    </span>
                 </div>
                 <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="opacity-50">BRAIN_LOAD:</span>
                    <span className={brain.thinking ? 'text-yellow-500' : 'text-white'}>
                        {brain.thinking ? `CRITICAL (${brain.threads} THREADS)` : 'IDLE'}
                    </span>
                 </div>
                 <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="opacity-50">SESSION_ID:</span>
                    <span className="truncate w-24 text-right">0x{match.hashes[match.cursor]?.toString(16).slice(0, 8)}</span>
                 </div>
              </div>
          </Frame>

          <History 
            moves={match.logs}
            history={match.history}
            current={match.cursor}
            jump={match.jump}
            resume={match.resume}
          />
        </div>
      </div>

      <Analyzer 
        stats={brain.stats} 
        progress={brain.progress} 
        targetDepth={study}       
        fen={match.history[match.cursor]} 
        logs={match.logs}
        history={match.history}
        thinking={brain.thinking}
        compute={analyze} 
      />

      {panel && (
        <Settings 
          volume={volume}
          pace={pace}
          haptics={haptics} 
          autoFlip={autoFlip}
          coords={coords} 
          fx={fx}         
          assist={assist}
          book={book}
          monitor={monitor}
          depth={depth}
          study={study}
          theme={theme}
          pilots={pilots}
          tuning={tuning}
          
          setVolume={setVolume}
          setPace={setPace}
          setHaptics={setHaptics} 
          setAutoFlip={setAutoFlip}
          setCoords={setCoords} 
          setFx={setFx}         
          
          toggleAssist={() => help(!assist)}
          toggleBook={() => setBook(!book)}
          display={toggleMonitor}
          level={level}
          tutor={tutor}
          style={() => style(Theme.toggle(theme))}
          pilot={(side) => drive(d => ({ ...d, [side]: d[side] === 'human' ? 'ai' : 'human' }))}
          tune={updateTuning}
          close={() => configure(false)}
          threads={brain.threads} 
          cores={brain.cores}     
          setThreads={brain.setThreads} 
          mode={brain.mode} 
        />
      )}

      {terminal && (
        <Terminal 
          status={mesh.status}
          code={mesh.token}
          host={mesh.host}
          join={mesh.join}
          accept={mesh.accept}
          close={() => setup(false)}
        />
      )}
    </div>
  );
};

export default App;
