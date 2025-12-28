
import React, { useEffect, useRef } from 'react';
import { Palette, Layer } from '../../design/tokens';

export const Monitor: React.FC = React.memo(() => {
  const canvas = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const context = canvas.current?.getContext('2d');
    if (!context) return;

    let frame = 0;
    let lastTime = performance.now();
    let fps = 60;
    const history = new Uint8Array(100); 
    let head = 0;
    
    const getThemeColor = () => {
        const style = getComputedStyle(document.documentElement);
        return style.getPropertyValue('--signal-target').trim() || '#22c55e';
    };
    let stroke = getThemeColor();

    const loop = () => {
      frame++;
      const now = performance.now();
      
      if (now - lastTime >= 500) {
        fps = Math.round((frame * 1000) / (now - lastTime));
        frame = 0;
        lastTime = now;
        history[head] = fps;
        head = (head + 1) % 100;
        stroke = getThemeColor();
      }

      const width = 120;
      const height = 50;
      
      context.clearRect(0, 0, width, height);
      context.fillStyle = 'rgba(0, 0, 0, 0.8)'; // Darker background
      context.fillRect(0, 0, width, height);
      
      context.beginPath();
      context.strokeStyle = stroke;
      context.lineWidth = 1.5;

      for (let index = 0; index < 100; index++) {
        const pointer = (head + index) % 100;
        const value = history[pointer];
        const y = height - (value / 60) * (height - 10); 
        if (index === 0) context.moveTo(index * 1.2, y);
        else context.lineTo(index * 1.2, y);
      }
      context.stroke();

      context.fillStyle = stroke;
      context.font = 'bold 10px monospace';
      context.fillText(`FPS: ${fps}`, 6, 14);
      
      const memory = (performance as any).memory;
      if (memory) {
          const used = Math.round(memory.usedJSHeapSize / 1024 / 1024);
          context.fillStyle = '#888';
          context.fillText(`MEM: ${used} MB`, 6, 26);
      }
      
      context.strokeStyle = 'rgba(255,255,255,0.15)';
      context.strokeRect(0.5, 0.5, width - 1, height - 1);

      requestAnimationFrame(loop);
    };

    const id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div 
      className="fixed bottom-0 right-0 pointer-events-none"
      style={{ zIndex: Layer.Monitor }}
    >
      <canvas 
        ref={canvas} 
        width={120} 
        height={50} 
        className="rounded-tl-xl border-t border-l border-white/10 backdrop-blur-sm"
      />
    </div>
  );
});

Monitor.displayName = 'Monitor';
