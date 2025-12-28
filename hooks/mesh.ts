
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Mesh, Status, Packet } from '../services/mesh';

export const useMesh = (onPacket: (p: Packet) => void) => {
  const mesh = useRef<Mesh | null>(null);
  const [status, setStatus] = useState<Status>('offline');
  const [token, setToken] = useState<string>('');
  
  // VITAL FIX: Keep a mutable reference to the latest callback.
  // This prevents "Stale Closure" where the socket listener uses an old version of 'onPacket'
  // that captures outdated state (e.g., old match history).
  const handler = useRef(onPacket);

  // Update the ref whenever the parent passes a new handler
  useEffect(() => {
      handler.current = onPacket;
  }, [onPacket]);

  // Initialize Mesh Service (Run ONCE)
  useEffect(() => {
    mesh.current = new Mesh();
    
    mesh.current.onStatus = (s) => setStatus(s);
    mesh.current.onSignal = (t) => setToken(t);
    
    // Delegate execution to the ref
    mesh.current.onData = (p) => {
        if (handler.current) handler.current(p);
    };

    return () => {
        // Cleanup if needed (Close connection)
        // mesh.current?.close();
    };
  }, []);

  const host = useCallback(() => {
    setToken(''); // Clear previous
    mesh.current?.host();
  }, []);

  const join = useCallback((hostToken: string) => {
    setToken('');
    mesh.current?.join(hostToken);
  }, []);

  const accept = useCallback((guestToken: string) => {
    mesh.current?.accept(guestToken);
  }, []);

  const send = useCallback((packet: Packet) => {
    mesh.current?.send(packet);
  }, []);

  // STABILIZATION: Prevents re-render cascades in App -> Network/Terminal components
  return useMemo(() => ({
    status,
    token,
    host,
    join,
    accept,
    send
  }), [status, token, host, join, accept, send]);
};
