import { useEffect, useRef, useState, useCallback } from 'react';

export function useTFLiteWorker(onPredictionReceived: (gloss: string, confidence: number) => void) {
  const workerRef = useRef<Worker | null>(null);
  const [engineReady, setEngineReady] = useState(false);

  useEffect(() => {
    // Instantiate background thread worker
    workerRef.current = new Worker(
      new URL('../workers/tflite.worker.ts', import.meta.url),
      { type: 'module' }
    );

    workerRef.current.onmessage = (event) => {
      const { type, payload, error } = event.data;
      if (type === 'STATUS' && payload === 'READY') {
        setEngineReady(true);
      } else if (type === 'INFERENCE_RESULT' && !error) {
        onPredictionReceived(payload.gloss, payload.confidence);
      }
    };

    // Initialize model setup inside worker
    workerRef.current.postMessage({ type: 'INIT' });

    return () => {
      workerRef.current?.terminate();
    };
  }, [onPredictionReceived]);

  const runInference = useCallback((windowTensor: number[][]) => {
    if (workerRef.current && engineReady) {
      workerRef.current.postMessage({ type: 'INFERENCE_RUN', payload: windowTensor });
    }
  }, [engineReady]);

  return { engineReady, runInference };
}
