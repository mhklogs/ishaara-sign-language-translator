import { useCallback, useEffect, useRef, useState } from "react";
import { useLandmarkCapture } from "@/hooks/useLandmarkCapture";
import {
  CAPTURE_FPS,
  COORDINATE_COUNT,
  WINDOW_SIZE,
} from "@/hooks/useSignDataset";
import { CameraIcon, CheckIcon, PlusIcon, XIcon } from "./icons";
import { cn } from "@/utils/cn";

const STARTER_LABELS = ["HELLO", "THANK-YOU", "PLEASE", "SORRY", "YES", "NO", "GOOD", "BAD", "NAME", "WATER"];

const MIN_VALID_FRAMES = 14;

export function SignRecorder({
  open,
  labels,
  counts,
  total,
  onAddSample,
  onClearLabel,
  onExport,
  onImport,
  onClose,
}: {
  open: boolean;
  labels: string[];
  counts: Record<string, number>;
  total: number;
  onAddSample: (label: string, frames: number[][]) => void;
  onClearLabel: (label: string) => void;
  onExport: () => void;
  onImport: (file: File) => Promise<number>;
  onClose: () => void;
}) {
  const { videoRef, isRunning, error, startCapture, stopCapture, requestFrame } =
    useLandmarkCapture();

  const [activeLabel, setActiveLabel] = useState<string>(STARTER_LABELS[0]);
  const [custom, setCustom] = useState("");
  const [recording, setRecording] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lastSaved, setLastSaved] = useState<{ label: string; frames: number } | null>(null);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState<string | null>(null);

  const framesRef = useRef<number[][]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const stopRecording = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRecording(false);
    setProgress(0);
  }, []);

  const commitFrames = useCallback(
    (label: string) => {
      const frames = framesRef.current;
      framesRef.current = [];
      if (frames.length >= MIN_VALID_FRAMES) {
        onAddSample(label, frames.slice(0, WINDOW_SIZE));
        setLastSaved({ label, frames: frames.length });
      } else {
        setLastSaved(null);
      }
    },
    [onAddSample]
  );

  const startRecording = useCallback(async () => {
    if (recording) return;
    if (!isRunning) {
      const ok = await startCapture();
      if (!ok) return;
    }
    setLastSaved(null);
    framesRef.current = [];
    setRecording(true);
    setProgress(0);

    const timer = setInterval(async () => {
      const frame = await requestFrame();
      if (frame && frame.length === COORDINATE_COUNT) {
        framesRef.current.push(frame);
        setProgress(framesRef.current.length);
        if (framesRef.current.length >= WINDOW_SIZE) {
          clearInterval(timer);
          intervalRef.current = null;
          setRecording(false);
          commitFrames(activeLabel);
        }
      }
    }, Math.round(1000 / CAPTURE_FPS));

    setTimeout(() => {
      if (intervalRef.current === timer && framesRef.current.length > 0) {
        clearInterval(timer);
        intervalRef.current = null;
        setRecording(false);
        commitFrames(activeLabel);
      }
    }, 6500);

    intervalRef.current = timer;
  }, [recording, isRunning, startCapture, requestFrame, commitFrames, activeLabel]);

  useEffect(() => {
    if (!open) return;
    startCapture();
    return () => {
      stopRecording();
      stopCapture();
    };
  }, [open, startCapture, stopCapture, stopRecording]);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  if (!open) return null;

  const allLabels = Array.from(new Set([...STARTER_LABELS, custom.trim(), ...labels])).filter(Boolean);

  const addCustom = () => {
    const v = custom.trim().toUpperCase();
    if (!v) return;
    setActiveLabel(v);
    setCustom("");
  };

  const handleImport = async (file: File) => {
    setImporting(true);
    setImportMsg(null);
    try {
      const n = await onImport(file);
      setImportMsg(`Imported ${n} sequence${n === 1 ? "" : "s"}`);
    } catch (e: any) {
      setImportMsg(`Import failed: ${e?.message ?? "invalid file"}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-up" onClick={onClose} />

      <div className="relative z-10 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-zinc-900 shadow-2xl sm:rounded-3xl animate-fade-up">
        {/* header */}
        <div className="flex items-start gap-3 border-b border-white/[0.07] p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/30">
            <CameraIcon className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-[15px] font-semibold text-zinc-50">Sign Sample Recorder</h3>
            <p className="text-[11.5px] text-zinc-400">
              Record webcam keypoints to build your own training dataset. Aim for 8–12 takes per sign.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-white/5 hover:text-zinc-100"
            aria-label="Close"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 overflow-y-auto p-4 md:grid-cols-2">
          {/* LEFT: labels + dataset */}
          <div className="space-y-4">
            <div>
              <span className="mb-1.5 block font-tech text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                Active Sign Label
              </span>
              <div className="flex flex-wrap gap-1.5">
                {allLabels.map((l) => {
                  const active = l === activeLabel;
                  const n = counts[l] ?? 0;
                  return (
                    <button
                      key={l}
                      onClick={() => setActiveLabel(l)}
                      className={cn(
                        "rounded-full border px-2.5 py-1.5 text-[11px] font-semibold transition",
                        active
                          ? "border-rose-500/50 bg-rose-500/15 text-rose-200"
                          : "border-white/[0.08] bg-white/[0.03] text-zinc-300 hover:bg-white/[0.06]"
                      )}
                    >
                      {l}
                      {n > 0 && (
                        <span
                          className={cn(
                            "ml-1.5 rounded-full px-1.5 py-px font-tech text-[9px]",
                            active ? "bg-rose-500/25 text-rose-100" : "bg-white/10 text-zinc-400"
                          )}
                        >
                          {n}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2">
              <input
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCustom()}
                placeholder="New sign label (e.g. EID-MUBARAK)"
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-[12px] text-zinc-100 placeholder:text-zinc-600 focus:border-rose-500/40 focus:outline-none"
              />
              <button
                onClick={addCustom}
                className="flex items-center gap-1 rounded-xl bg-zinc-700/60 px-3 py-2 text-[12px] font-semibold text-zinc-100 transition hover:bg-zinc-600"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>

            {/* dataset summary + management */}
            <div className="rounded-xl border border-white/[0.07] bg-black/20 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-tech text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                  Local Dataset
                </span>
                <span className="font-tech text-[11px] font-bold text-zinc-200">
                  {total} seq · {labels.length} signs
                </span>
              </div>

              {labels.length === 0 && (
                <p className="text-[11px] leading-relaxed text-zinc-500">
                  Empty. Record your first takes on the right, then export JSON for training. The
                  faster you hit <span className="text-zinc-300">12+ takes per sign</span>, the
                  better the model.
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={onExport}
                  disabled={total === 0}
                  className="flex-1 rounded-xl bg-emerald-500 px-3 py-2 text-[12px] font-semibold text-zinc-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Export JSON
                </button>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex-1 rounded-xl bg-zinc-800 px-3 py-2 text-[12px] font-semibold text-zinc-100 transition hover:bg-zinc-700"
                >
                  {importing ? "Importing…" : "Import JSON"}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/json"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleImport(f);
                    e.target.value = "";
                  }}
                />
              </div>

              {importMsg && (
                <p className="text-[11px] text-zinc-400">
                  {importMsg.startsWith("Imported") ? (
                    <span className="inline-flex items-center gap-1 text-emerald-300">
                      <CheckIcon className="h-3.5 w-3.5" /> {importMsg}
                    </span>
                  ) : (
                    importMsg
                  )}
                </p>
              )}

              {labels.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {labels.map((l) => (
                    <button
                      key={`clear-${l}`}
                      onClick={() => onClearLabel(l)}
                      className="rounded-md border border-white/[0.07] bg-white/[0.02] px-2 py-1 text-[10px] text-zinc-400 transition hover:border-rose-500/40 hover:text-rose-300"
                      title={`Clear all ${counts[l]} "${l}" samples`}
                    >
                      ✕ {l}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: camera + record */}
          <div className="space-y-3">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-white/10 bg-black">
              <video
                ref={videoRef}
                className="absolute inset-0 h-full w-full object-cover scale-x-[-1]"
                playsInline
                muted
              />
              {!isRunning && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/70 p-4 text-center">
                  <CameraIcon className="h-8 w-8 text-zinc-600" />
                  <span className="text-[11px] font-bold text-zinc-400">
                    {error ?? "Camera standby — press record"}
                  </span>
                </div>
              )}
              {isRunning && (
                <>
                  <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2 py-1 backdrop-blur-sm">
                    <span className={cn("h-2 w-2 rounded-full", recording ? "animate-rec bg-rose-500" : "bg-emerald-400")} />
                    <span className="font-tech text-[9px] uppercase tracking-wider text-zinc-200">
                      {recording ? "rec · pose locked" : isRunning ? "tracking" : "standby"}
                    </span>
                  </div>
                  <div className="absolute right-3 top-3 rounded-full bg-black/60 px-2 py-1 font-tech text-[9px] tracking-wider text-zinc-300 backdrop-blur-sm">
                    {recording ? `${framesRef.current.length}/${WINDOW_SIZE}` : "543 lm"}
                  </div>
                </>
              )}
            </div>

            {/* record button */}
            <button
              onClick={startRecording}
              disabled={!!error}
              className={cn(
                "w-full rounded-xl py-3 text-[13px] font-bold transition active:scale-[0.98]",
                recording
                  ? "bg-rose-500 text-white animate-pulse"
                  : "bg-zinc-200 text-zinc-950 hover:bg-white disabled:opacity-40",
                !!error && "opacity-40"
              )}
            >
              {recording ? "Capturing… keep signing" : "● Record Sign"}
            </button>

            {/* progress */}
            {recording && (
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-rose-500 transition-all duration-150"
                  style={{ width: `${(progress / WINDOW_SIZE) * 100}%` }}
                />
              </div>
            )}

            {lastSaved && (
              <div className="flex items-center justify-between rounded-xl border border-emerald-500/25 bg-emerald-500/[0.07] px-3 py-2 text-[11px]">
                <span className="font-semibold text-emerald-300">
                  Saved {lastSaved.frames} frames → {lastSaved.label}
                </span>
                <span className="font-tech text-[10px] text-emerald-400/80">+1 take</span>
              </div>
            )}

            <p className="text-[10.5px] leading-relaxed text-zinc-500">
              Hold the sign at the marker for the full take. Keep your face + shoulders visible —
              keypoints are normalized to shoulder width. 15 fps · {WINDOW_SIZE} frames/take.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}