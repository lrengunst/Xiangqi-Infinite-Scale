
import { useState, useLayoutEffect, useRef } from 'react';
import { WIDTH, HEIGHT } from '../engine/consts';

interface Metric {
  scale: number;
  width: number;
  height: number;
}

/**
 * @description  Liquid Interface Calculator.
 * @purpose      Calculate optimal board dimensions based on container size.
 * @model        Preserve Aspect Ratio (9:10) within bounding box.
 * @complexity   O(1) - Simple Math on Resize Event.
 */
export const useViewport = () => {
  // REFACTOR: 'containerRef' -> 'scope' (The observation scope)
  const scope = useRef<HTMLDivElement>(null);
  
  const [metric, setMetric] = useState<Metric>({
    scale: 1,
    width: 0,
    height: 0
  });

  useLayoutEffect(() => {
    if (!scope.current) return;

    // Zero Allocation Resize Handler
    const measure = (entries: ResizeObserverEntry[]) => {
      const entry = entries[0];
      if (!entry) return;

      // Get available space
      const availableWidth = entry.contentRect.width;
      const availableHeight = entry.contentRect.height;

      // Target Aspect Ratio: 9 / 10
      // We want to maximize size while keeping ratio
      const ratio = WIDTH / HEIGHT; // 0.9
      const containerRatio = availableWidth / availableHeight;

      let finalWidth = 0;
      let finalHeight = 0;

      if (containerRatio > ratio) {
        // Container is wider than board -> Height is the limiting factor
        finalHeight = availableHeight;
        finalWidth = finalHeight * ratio;
      } else {
        // Container is taller than board -> Width is the limiting factor
        finalWidth = availableWidth;
        finalHeight = finalWidth / ratio;
      }

      // Add a small padding buffer (safety margin)
      const buffer = 0.95; 
      
      setMetric({
        scale: (finalWidth / (WIDTH * 100)) * buffer, // Base unit size reference (optional)
        width: finalWidth * buffer,
        height: finalHeight * buffer
      });
    };

    const observer = new ResizeObserver(measure);
    observer.observe(scope.current);

    return () => observer.disconnect();
  }, []);

  return { scope, metric };
};
