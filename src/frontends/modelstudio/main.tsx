import "../../index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { cn } from "../../utils/cn";
import {
  CpuIcon,
  DownloadIcon,
  PlayIcon,
  PlusIcon,
  SignalIcon,
  SparkEtcIcon,
} from "./icons";

type Vocab = {
  label: string;
  takes: number;
  target: number;
  duration: string;
  trained: boolean;
};

const VOCAB: Vocab[] = [
  { label: "HELLO", takes: 12, target: 20, duration: "00:16", trained: true },
  { label: "THANK-YOU", takes: 10, target: 20, duration: "00:13", trained: true },
  { label: "YES", takes: 8, target: 20, duration: "00:11", trained: true },
  { label: "MY-NAME", takes: 6, target: 20, duration: "00:09", trained: false },
  { label: "PLEASE", takes: 3, target: 20, duration: "00:04", trained: false },
  { label: "HELP", takes: 0, target: 20, duration: "00:00", trained: false },
];

const ACC_POINTS = [41, 52, 60, 66, 71, 78, 84, 88, 92, 95, 97, 98];

function Sparkline() {
  const w = 320;
  const h = 110;
  const pts = ACC_POINTS.map((v, i) => {
    const x = (i / (ACC_POINTS.length - 1)) * w;
    const y = h - (v / 100) * h;
    return [x, y];
  });
  const line = pts.map((p) => p.join(",")).join(" ");
  const area = `0 ${h} ${line} ${w} ${h}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>
      <line x1="0" y1={h} x2={w} y2={h} stroke="rgba(255,255,255,0.08)" />
      <polygon points={area} fill="url(#grad)" />
      <polyline
        points={line}
        fill="none"
        stroke="#34d399"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === pts.length - 1 ? 3.5 : 2} fill="#34d399" />
      ))}
    </svg>
  );
}

function ModelStudio() {
  return (
    <div
      className="min-h-screen bg-zinc-950 text-zinc-100"
      style={{
        background:
          "radial-gradient(60% 45% at 0% 0%, rgba(16,185,129,0.09), transparent 55%), radial-gradient(55% 45% at 100% 100%, rgba(16,185,129,0.06), transparent 60%)",
      }}
    >
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.06] bg-zinc-950/80 px-6 py-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-md shadow-emerald-500/20">
            <CpuIcon className="h-4.5 w-4.5 text-zinc-50" />
          </span>
          <div>
            <div className="text-[14px] font-black tracking-tight text-zinc-50">
              Model Studio
            </div>
            <div className="font-tech text-[9px] uppercase tracking-[0.18em] text-zinc-500">
              dataset · training · deployment console
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 font-tech text-[10px] font-bold uppercase tracking-widest text-emerald-300 ring-1 ring-emerald-500/30">
            <SignalIcon className="h-3.5 w-3.5" />
            engine: on-device
          </span>
          <button className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-[12px] font-bold text-zinc-950 transition hover:bg-emerald-400">
            <PlusIcon className="h-4 w-4" /> Record signs
          </button>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1400px] gap-6 p-6 lg:grid-cols-[1.05fr_0.95fr]">
        {/* vocabulary */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-black tracking-tight text-zinc-50">Captured Vocabulary</h2>
            <span className="font-tech text-[11px] tabular-nums text-zinc-500">
              39 / 120 takes
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {VOCAB.map((v) => {
              const pct = Math.round((v.takes / v.target) * 100);
              return (
                <div
                  key={v.label}
                  className={cn(
                    "rounded-3xl border p-5 transition",
                    v.trained
                      ? "border-emerald-500/25 bg-emerald-500/[0.04]"
                      : "border-white/[0.07] bg-white/[0.02]"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-tech text-[15px] font-black tracking-widest text-zinc-50">
                      {v.label}
                    </span>
                    {v.trained ? (
                      <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 font-tech text-[8.5px] font-bold uppercase tracking-wider text-emerald-300 ring-1 ring-emerald-500/30">
                        in model ✓
                      </span>
                    ) : (
                      <span className="rounded-md bg-white/[0.05] px-2 py-0.5 font-tech text-[8.5px] font-bold uppercase tracking-wider text-zinc-500 ring-1 ring-white/10">
                        pending
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex items-center gap-3 font-tech text-[11px] tabular-nums text-zinc-400">
                    <span className={cn(v.takes === 0 ? "text-zinc-600" : "text-zinc-200")}>
                      {v.takes}/{v.target} takes
                    </span>
                    <span className="text-zinc-600">·</span>
                    <span>{v.duration}</span>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        v.trained ? "bg-emerald-400" : "bg-zinc-600"
                      )}
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>

                  <div className="mt-2.5 flex gap-1">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <span
                        key={i}
                        className={cn(
                          "h-1.5 w-full rounded-full",
                          i * 2.5 < v.takes ? "bg-emerald-500/70" : "bg-white/[0.06]"
                        )}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* training console */}
        <section className="flex flex-col gap-4">
          <div className="rounded-3xl border border-white/[0.08] bg-zinc-900/60 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-black tracking-tight text-zinc-50">Training Run</h2>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 font-tech text-[9px] font-bold uppercase tracking-wider text-emerald-300 ring-1 ring-emerald-500/30">
                <PlayIcon className="h-3 w-3" />
                running
              </span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <Metric label="Epoch" value="34 / 80" />
              <Metric label="Train Loss" value="0.042" />
              <Metric label="Val Acc" value="98.0%" />
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between font-tech text-[9px] uppercase tracking-[0.18em] text-zinc-500">
                <span>validation accuracy</span>
                <span className="text-emerald-300">98.0%</span>
              </div>
              <div className="mt-2">
                <Sparkline />
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between font-tech text-[9px] uppercase tracking-[0.18em] text-zinc-500">
                <span>epoch progress</span>
                <span>34/80 · 42%</span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
                <div className="h-full w-[42%] rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400" />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/[0.08] bg-zinc-900/60 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-[14px] font-bold text-zinc-50">Model packaging</h3>
              <span className="font-tech text-[9px] uppercase tracking-widest text-zinc-500">
                1 trained · 0 exported
              </span>
            </div>
            <div className="mt-3 flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/25">
                <SparkEtcIcon className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <div className="font-tech text-[12px] font-bold text-zinc-100">
                  sign_model_v1 · ishaara-mlp-v1
                </div>
                <div className="font-tech text-[9px] uppercase tracking-widest text-zinc-500">
                  3 classes · 64 KB · cpu-trained
                </div>
              </div>
              <button className="inline-flex items-center gap-1.5 rounded-xl bg-white/[0.06] px-3.5 py-2 text-[11px] font-bold text-zinc-200 ring-1 ring-white/10 transition hover:bg-white/[0.1]">
                <DownloadIcon className="h-3.5 w-3.5" />
                Export JSON
              </button>
            </div>

            <div className="mt-3 flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] px-4 py-3">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[12px] font-semibold text-emerald-200">
                Ready to deploy → workspace live inference
              </span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] px-3 py-3 text-center">
      <div className="font-tech text-[15px] font-black tabular-nums text-zinc-50">{value}</div>
      <div className="font-tech text-[8.5px] uppercase tracking-[0.18em] text-zinc-500">{label}</div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ModelStudio />
  </StrictMode>
);