import { useEffect, useState } from "react";
import { engineMetrics } from "@/data/samples";
import { CpuIcon, GaugeIcon, GlobeIcon, HandIcon, SignalIcon } from "./icons";
import { MetricBadge, Pill, StatusDot } from "./ui";
import { cn } from "@/utils/cn";

function useSessionClock() {
  const [s, setS] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setS((v) => v + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

const metricIcons = [<HandIcon className="h-4 w-4" />, <GaugeIcon className="h-4 w-4" />, <CpuIcon className="h-4 w-4" />];
const metricTones = ["emerald", "sky", "violet"] as const;

export function SystemHeader({
  boostCount,
  dialect,
  setDialect,
  proficiency,
  setProficiency,
  targetLanguage,
  setTargetLanguage,
  viewMode,
  setViewMode,
}: {
  boostCount: number;
  dialect: string;
  setDialect: (d: string) => void;
  proficiency: string;
  setProficiency: (p: string) => void;
  targetLanguage: string;
  setTargetLanguage: (t: string) => void;
  viewMode: string;
  setViewMode: (v: string) => void;
}) {
  const clock = useSessionClock();

  return (
    <header className="relative overflow-hidden border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-xl">
      {/* top accent line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />

      <div className="px-4 pb-4 pt-3.5">
        {/* brand row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg shadow-emerald-500/20">
              <HandIcon className="h-5 w-5 text-zinc-950" strokeWidth={2.2} />
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-zinc-950 bg-emerald-300" />
            </div>
            <div className="leading-tight">
              <h1 className="text-[15px] font-bold tracking-tight text-zinc-50">
                ISHAARA<span className="text-emerald-400">.</span>
              </h1>
              <p className="font-tech text-[9px] uppercase tracking-[0.16em] text-zinc-500">
                Bi-Directional Sign Translator
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="hidden items-center gap-1 rounded-xl bg-white/[0.04] p-1 ring-1 ring-white/10 xs:flex">
              {(["dual", "signer", "speaker"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={cn(
                    "rounded-lg px-2 py-0.5 font-tech text-[9px] font-bold uppercase transition",
                    viewMode === mode
                      ? "bg-emerald-500 text-zinc-950 shadow-md"
                      : "text-zinc-400 hover:text-zinc-200"
                  )}
                >
                  {mode === "dual" ? "split" : mode}
                </button>
              ))}
            </div>

            <div className="text-right leading-tight">
              <div className="font-tech text-[10px] tabular-nums text-zinc-300">{clock}</div>
              <div className="font-tech text-[8px] uppercase tracking-wider text-zinc-600">session</div>
            </div>
          </div>
        </div>

        {/* mobile view mode toggle bar */}
        <div className="mt-2.5 flex items-center justify-center gap-1 rounded-xl bg-white/[0.02] p-1 ring-1 ring-white/5 xs:hidden">
          {(["dual", "signer", "speaker"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn(
                "flex-1 text-center rounded-lg py-1 font-tech text-[9px] font-bold uppercase transition",
                viewMode === mode
                  ? "bg-emerald-500 text-zinc-950 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              {mode === "dual" ? "split view" : `${mode} view`}
            </button>
          ))}
        </div>

        {/* scenario profile banner */}
        <div className="mt-3.5 rounded-xl border border-white/[0.07] bg-white/[0.025] p-1.5">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            <button
              onClick={() => {
                const next = proficiency === "Expert" ? "Intermediate" : proficiency === "Intermediate" ? "Beginner" : "Expert";
                setProficiency(next);
              }}
              className="hover:scale-[1.02] active:scale-95 transition"
              title="Click to cycle proficiency"
            >
              <Pill tone="emerald" className="shrink-0 cursor-pointer">
                <SignalIcon className="h-3 w-3" />
                Profile · {proficiency} ⟳
              </Pill>
            </button>
            <span className="text-zinc-700">|</span>
            <button
              onClick={() => {
                const next = dialect === "Pakistani Sign Language" ? "Indian Sign Language" : "Pakistani Sign Language";
                setDialect(next);
              }}
              className="hover:scale-[1.02] active:scale-95 transition"
              title="Click to cycle dialect"
            >
              <Pill className="shrink-0 cursor-pointer">Dialect · {dialect} ⟳</Pill>
            </button>
            <span className="text-zinc-700">|</span>
            <button
              onClick={() => {
                const next = targetLanguage === "English / Urdu" ? "English / Hindi" : targetLanguage === "English / Hindi" ? "Urdu / Hindi" : "English / Urdu";
                setTargetLanguage(next);
              }}
              className="hover:scale-[1.02] active:scale-95 transition"
              title="Click to cycle target language"
            >
              <Pill className="shrink-0 cursor-pointer">
                <GlobeIcon className="h-3 w-3" />
                Target · {targetLanguage} ⟳
              </Pill>
            </button>
            {boostCount > 0 && (
              <>
                <span className="text-zinc-700">|</span>
                <Pill tone="violet" className="shrink-0">
                  +{boostCount} lex tokens
                </Pill>
              </>
            )}
          </div>
        </div>

        {/* engine metrics */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          {engineMetrics.map((m, i) => (
            <MetricBadge
              key={m.label}
              icon={metricIcons[i]}
              label={m.label}
              value={m.value}
              hint={m.hint}
              tone={metricTones[i]}
            />
          ))}
        </div>
      </div>
    </header>
  );
}
