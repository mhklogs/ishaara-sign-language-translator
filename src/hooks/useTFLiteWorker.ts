import { useEffect, useRef, useState, useCallback } from 'react';

type EngineSource = 'model' | 'fallback';

export function useTFLiteWorker(onPredictionReceived: (gloss: string, confidence: number) => void) {
  const workerRef = useRef<Worker | null>(null);
  const [engineReady, setEngineReady] = useState(false);
  const [engineSource, setEngineSource] = useState<EngineSource | null>(null);
  const [labels, setLabels] = useState<string[]>([]);

  useEffect(() => {
    const worker = new Worker(
      new URL('../workers/tflite.worker.ts', import.meta.url),
      { type: 'module' }
    );
    workerRef.current = worker;

    worker.onmessage = (event) => {
      const { type, payload, error, source, labels: modelLabels } = event.data;
      if (type === 'STATUS' && payload === 'READY') {
        setEngineReady(true);
        if (source) setEngineSource(source);
        if (Array.isArray(modelLabels)) setLabels(modelLabels);
      } else if (type === 'INFERENCE_RESULT' && !error) {
        onPredictionReceived(payload.gloss, payload.confidence);
      }
    };

    worker.postMessage({ type: 'INIT' });

    return () => worker.terminate();
  }, [onPredictionReceived]);

  const runInference = useCallback((windowTensor: number[][]) => {
    if (workerRef.current && engineReady) {
      workerRef.current.postMessage({ type: 'INFERENCE_RUN', payload: windowTensor });
    }
  }, [engineReady]);

  return { engineReady, engineSource, labels, runInference };
}