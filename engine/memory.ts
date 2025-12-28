
/**
 * @description  Static Memory Pools & Buffers.
 * @purpose      Zero allocation during hot paths.
 * @model        Stack Memory
 */

// Max moves ~120. Max depth ~20. 120 * 20 = 2400.
// Safe buffer: 4096 integers.
export const BUFFER = new Int32Array(4096);

/**
 * @description  Reset memory pointer if needed (usually handled by stack logic).
 */
export const clear = (): void => {
  BUFFER.fill(0);
};
