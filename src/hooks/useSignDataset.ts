import { useCallback, useEffect, useState } from "react";

export interface SignSample {
  label: string;
  frames: number[][];
}

export interface SignDataset {
  version: number;
  meta: {
    fps: number;
    coordinateCount: number;
    windowSize: number;
    exportedAt: string;
  };
  samples: SignSample[];
}

const STORAGE_KEY = "ishaara.sign.dataset.v1";

export const COORDINATE_COUNT = 1629;
export const WINDOW_SIZE = 24;
export const CAPTURE_FPS = 15;

function loadInitial(): Record<string, number[][][]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: Record<string, number[][][]> = JSON.parse(raw);
    return parsed;
  } catch (e) {
    console.warn("Failed to load sign dataset:", e);
    return {};
  }
}

export function useSignDataset() {
  const [data, setData] = useState<Record<string, number[][][]>>(loadInitial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn("Failed to persist sign dataset:", e);
    }
  }, [data]);

  const labels = Object.keys(data);
  const totalSamples = labels.reduce((sum, l) => sum + (data[l]?.length ?? 0), 0);

  const counts: Record<string, number> = {};
  for (const l of labels) counts[l] = data[l].length;

  const addSample = useCallback((label: string, frames: number[][]) => {
    if (!label || frames.length === 0) return;
    setData((prev) => {
      const next: Record<string, number[][][]> = { ...prev };
      const existing: number[][][] = next[label] ?? [];
      next[label] = [...existing, frames];
      return next;
    });
  }, []);

  const clearLabel = useCallback((label: string) => {
    setData((prev) => {
      const next: Record<string, number[][][]> = { ...prev };
      delete next[label];
      return next;
    });
  }, []);

  const importSamples = useCallback((samples: SignSample[]) => {
    setData((prev) => {
      const next: Record<string, number[][][]> = { ...prev };
      for (const s of samples) {
        if (!s?.label || !Array.isArray(s.frames) || s.frames.length === 0) continue;
        const base: number[][][] = next[s.label] ?? [];
        next[s.label] = [...base, s.frames];
      }
      return next;
    });
  }, []);

  const exportJSON = useCallback(() => {
    const exported: SignSample[] = [];
    for (const label of labels) {
      const seqs: number[][][] = data[label] ?? [];
      for (const frames of seqs) {
        exported.push({ label, frames });
      }
    }
    const dataset: SignDataset = {
      version: 1,
      meta: {
        fps: CAPTURE_FPS,
        coordinateCount: COORDINATE_COUNT,
        windowSize: WINDOW_SIZE,
        exportedAt: new Date().toISOString(),
      },
      samples: exported,
    };
    const blob = new Blob([JSON.stringify(dataset)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ishaara-dataset-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [data, labels]);

  const importJSON = useCallback(
    async (file: File): Promise<number> => {
      const text = await file.text();
      const parsed = JSON.parse(text) as SignDataset;
      const samples = Array.isArray(parsed)
        ? (parsed as SignSample[])
        : Array.isArray(parsed?.samples)
          ? parsed.samples
          : [];
      if (samples.length === 0) return 0;
      importSamples(samples);
      return samples.length;
    },
    [importSamples]
  );

  return {
    data,
    labels,
    counts,
    totalSamples,
    addSample,
    clearLabel,
    exportJSON,
    importJSON,
    ready,
  };
}