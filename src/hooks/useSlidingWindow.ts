import { useRef, useCallback } from 'react';

interface UseSlidingWindowOptions {
  windowSize?: number; // Number of frames to hold (e.g., 30)
  stride?: number; // How many new frames to wait for before triggering inference (e.g., 5)
  coordinateCount?: number; // 543 points * 3 coordinates (x,y,z) = 1629
}

export function useSlidingWindow(
  onWindowReady: (windowTensor: number[][]) => void,
  options: UseSlidingWindowOptions = {}
) {
  const { windowSize = 30, stride = 5, coordinateCount = 1629 } = options;

  // Using refs to hold the fast-mutating frame buffer to prevent UI re-renders 60 times a second
  const frameBufferRef = useRef<number[][]>([]);
  const strideCounterRef = useRef<number>(0);

  const pushFrame = useCallback((flattenedFrame: number[]) => {
    // Safety check to ensure the frame matches expected 543 (x,y,z) size
    if (flattenedFrame.length !== coordinateCount) return;

    const buffer = frameBufferRef.current;
    buffer.push(flattenedFrame);

    // If the buffer exceeds our target window size, drop the oldest frame
    if (buffer.length > windowSize) {
      buffer.shift();
    }

    // Instead of running inference every single frame (which crushes mobile CPUs),
    // we use a stride step to stagger the execution payload.
    strideCounterRef.current += 1;
    if (buffer.length === windowSize && strideCounterRef.current >= stride) {
      strideCounterRef.current = 0;
      // Pass a deep copy of the current 2D window matrix [30 frames x 1629 coordinates]
      onWindowReady([...buffer]);
    }
  }, [windowSize, stride, coordinateCount, onWindowReady]);

  const clearBuffer = useCallback(() => {
    frameBufferRef.current = [];
    strideCounterRef.current = 0;
  }, []);

  return { pushFrame, clearBuffer };
}
