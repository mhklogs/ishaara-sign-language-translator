import { useCallback, useState, useEffect } from "react";
import { glossaryTokens, engineMetrics, type GlossaryToken } from "@/data/samples";
import { SignToSpeechPanel } from "@/components/SignToSpeechPanel";
import { SpeechToSignPanel } from "@/components/SpeechToSignPanel";
import { GlossaryModal } from "@/components/GlossaryModal";
import {
  BookIcon,
  LockIcon,
  LockOpenIcon,
  SunIcon,
  MoonIcon,
  MenuIcon,
  XIcon,
  HandIcon,
  CpuIcon,
  GaugeIcon,
  SignalIcon,
  GlobeIcon
} from "@/components/icons";
import { Pill, StatusDot, SectionLabel, MetricBadge } from "@/components/ui";
import { cn } from "@/utils/cn";

// Clock hook for system telemetry
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

const metricIcons = [
  <HandIcon className="h-4 w-4" />,
  <GaugeIcon className="h-4 w-4" />,
  <CpuIcon className="h-4 w-4" />
];
const metricTones = ["emerald", "sky", "violet"] as const;

export default function App() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [locked, setLocked] = useState(false);
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [allTokens, setAllTokens] = useState<GlossaryToken[]>(glossaryTokens);
  const [loaded, setLoaded] = useState<Set<string>>(new Set(["SQL", "AI", "QA Testing"]));

  const [dialect, setDialect] = useState("Pakistani Sign Language");
  const [proficiency, setProficiency] = useState("Expert");
  const [targetLanguage, setTargetLanguage] = useState("English / Urdu");
  const [viewMode, setViewMode] = useState<"dual" | "signer" | "speaker">("dual");

  const clock = useSessionClock();

  const toggleToken = useCallback((token: string) => {
    setLoaded((prev) => {
      const next = new Set(prev);
      if (next.has(token)) next.delete(token);
      else next.add(token);
      return next;
    });
  }, []);

  const addCustom = useCallback((token: string, full: string) => {
    setAllTokens((prev) =>
      prev.some((t) => t.token.toLowerCase() === token.toLowerCase())
        ? prev
        : [...prev, { token, full, category: "Custom" }]
    );
    setLoaded((prev) => new Set(prev).add(token));
  }, []);

  // Sync theme class to document body for standard integrations
  useEffect(() => {
    const el = document.documentElement;
    if (theme === "light") {
      el.classList.add("light-theme");
    } else {
      el.classList.remove("light-theme");
    }
  }, [theme]);

  return (
    <div className={cn(
      "relative flex min-h-screen flex-col lg:flex-row transition-colors duration-300",
      theme === "dark" ? "bg-zinc-950 text-zinc-100" : "bg-slate-50 text-zinc-900"
    )}>
      {/* ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-grid opacity-[0.5]" />
        <div
          className="absolute inset-0"
          style={{
            background: theme === "dark"
              ? "radial-gradient(70% 50% at 50% -8%, rgba(16,185,129,0.18), transparent 60%), radial-gradient(60% 50% at 100% 100%, rgba(59,130,246,0.08), transparent 60%)"
              : "radial-gradient(70% 50% at 50% -8%, rgba(16,185,129,0.08), transparent 60%), radial-gradient(60% 50% at 100% 100%, rgba(59,130,246,0.04), transparent 60%)",
          }}
        />
      </div>

      {/* MOBILE TOP BAR / NAVBAR */}
      <header className={cn(
        "flex items-center justify-between border-b px-4 py-3 sticky top-0 z-30 lg:hidden backdrop-blur-md",
        theme === "dark" ? "border-white/5 bg-zinc-950/80" : "border-slate-200 bg-white/80"
      )}>
        <button
          onClick={() => setSidebarOpen(true)}
          className={cn(
            "rounded-xl p-2 transition",
            theme === "dark" ? "bg-white/5 text-zinc-200 hover:bg-white/10" : "bg-slate-200/50 text-slate-800 hover:bg-slate-200"
          )}
          aria-label="Open navigation sidebar"
        >
          <MenuIcon className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 shadow-md shadow-emerald-500/10">
            <HandIcon className="h-4.5 w-4.5 text-zinc-950" strokeWidth={2.5} />
          </div>
          <span className="text-[14px] font-black uppercase tracking-wider">
            ISHAARA<span className="text-emerald-500">.</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            className={cn(
              "rounded-xl p-2 transition",
              theme === "dark" ? "bg-white/5 text-zinc-300" : "bg-slate-200/50 text-slate-700"
            )}
            title="Toggle color theme"
          >
            {theme === "dark" ? <SunIcon className="h-4.5 w-4.5" /> : <MoonIcon className="h-4.5 w-4.5" />}
          </button>
          
          <button
            onClick={() => setLocked((l) => !l)}
            className={cn(
              "rounded-xl p-2 transition",
              locked
                ? "bg-emerald-500 text-zinc-950 shadow-md"
                : theme === "dark" ? "bg-white/5 text-zinc-300" : "bg-slate-200/50 text-slate-700"
            )}
            title={locked ? "Unlock presentation" : "Lock presentation"}
          >
            {locked ? <LockIcon className="h-4.5 w-4.5" /> : <LockOpenIcon className="h-4.5 w-4.5" />}
          </button>
        </div>
      </header>

      {/* COLLAPSIBLE SIDEBAR / DRAWER FOR MOBILE & PERSISTENT FOR DESKTOP */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-76 flex-col border-r transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
        theme === "dark" ? "border-white/5 bg-zinc-950/95 lg:bg-zinc-950/80" : "border-slate-200 bg-white/95 lg:bg-white/80",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Sidebar Header */}
        <div className={cn(
          "flex items-center justify-between border-b px-5 py-4",
          theme === "dark" ? "border-white/5" : "border-slate-200"
        )}>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-md shadow-emerald-500/10">
              <HandIcon className="h-5 w-5 text-zinc-950" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-[14px] font-black uppercase tracking-wider">
                ISHAARA<span className="text-emerald-500">.</span>
              </h1>
              <p className="font-tech text-[8px] uppercase tracking-[0.15em] text-zinc-500">
                Bi-Directional Translator
              </p>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className={cn(
              "rounded-lg p-1 transition lg:hidden",
              theme === "dark" ? "hover:bg-white/5 text-zinc-400 hover:text-zinc-200" : "hover:bg-slate-100 text-slate-600 hover:text-slate-900"
            )}
            aria-label="Close navigation sidebar"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Sidebar Navigation Links & Mode Swappers */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {/* Active Workspace Stream Selectors (Children & Elderly Accessible) */}
          <div className="space-y-2">
            <SectionLabel>Stream Workspace Mode</SectionLabel>
            <div className="grid gap-1.5">
              {(["dual", "signer", "speaker"] as const).map((mode) => {
                const isActive = viewMode === mode;
                return (
                  <button
                    key={mode}
                    onClick={() => {
                      setViewMode(mode);
                      setSidebarOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-left transition active:scale-[0.98]",
                      isActive
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-zinc-950 shadow-md font-bold"
                        : theme === "dark"
                          ? "bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] text-zinc-300"
                          : "bg-slate-100 border border-slate-200 hover:bg-slate-200/80 text-slate-800"
                    )}
                  >
                    <span className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-lg ring-1",
                      isActive
                        ? "bg-zinc-950/20 text-zinc-950 ring-transparent"
                        : theme === "dark" ? "bg-white/5 text-emerald-300 ring-white/10" : "bg-white text-emerald-600 ring-slate-200"
                    )}>
                      {mode === "signer" ? (
                        <HandIcon className="h-4 w-4" />
                      ) : mode === "speaker" ? (
                        <GlobeIcon className="h-4 w-4" />
                      ) : (
                        <CpuIcon className="h-4 w-4" />
                      )}
                    </span>
                    <div className="leading-tight">
                      <div className="text-[12px] font-semibold">
                        {mode === "signer" ? "Signer Panel" : mode === "speaker" ? "Speaker Panel" : "Split Dual View"}
                      </div>
                      <div className={cn(
                        "text-[9.5px]",
                        isActive ? "text-zinc-900/80" : "text-zinc-500"
                      )}>
                        {mode === "signer" ? "Sign → Speech stream" : mode === "speaker" ? "Speech → Sign stream" : "Simultaneous translate"}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Config & Dialect parameters (Click to cycle, easily accessible) */}
          <div className="space-y-3.5">
            <SectionLabel>Translation Binds</SectionLabel>
            
            <div className="grid gap-2">
              <div className="flex flex-col">
                <label className="text-[9.5px] font-tech uppercase tracking-wider text-zinc-500 mb-1">Dialect Preferred</label>
                <button
                  onClick={() => setDialect((d) => d === "Pakistani Sign Language" ? "Indian Sign Language" : "Pakistani Sign Language")}
                  className={cn(
                    "w-full text-left rounded-xl px-3 py-2 text-[11px] font-medium border transition",
                    theme === "dark" ? "bg-white/[0.02] border-white/5 text-zinc-300 hover:bg-white/[0.05]" : "bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100"
                  )}
                >
                  Dialect · <span className="font-semibold text-emerald-500">{dialect === "Pakistani Sign Language" ? "PSL" : "ISL"}</span> ⟳
                </button>
              </div>

              <div className="flex flex-col">
                <label className="text-[9.5px] font-tech uppercase tracking-wider text-zinc-500 mb-1">Target Language</label>
                <button
                  onClick={() => setTargetLanguage((t) => t === "English / Urdu" ? "English / Hindi" : t === "English / Hindi" ? "Urdu / Hindi" : "English / Urdu")}
                  className={cn(
                    "w-full text-left rounded-xl px-3 py-2 text-[11px] font-medium border transition",
                    theme === "dark" ? "bg-white/[0.02] border-white/5 text-zinc-300 hover:bg-white/[0.05]" : "bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100"
                  )}
                >
                  Target · <span className="font-semibold text-emerald-500">{targetLanguage}</span> ⟳
                </button>
              </div>

              <div className="flex flex-col">
                <label className="text-[9.5px] font-tech uppercase tracking-wider text-zinc-500 mb-1">Proficiency Depth</label>
                <button
                  onClick={() => setProficiency((p) => p === "Expert" ? "Intermediate" : p === "Intermediate" ? "Beginner" : "Expert")}
                  className={cn(
                    "w-full text-left rounded-xl px-3 py-2 text-[11px] font-medium border transition",
                    theme === "dark" ? "bg-white/[0.02] border-white/5 text-zinc-300 hover:bg-white/[0.05]" : "bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100"
                  )}
                >
                  Profile · <span className="font-semibold text-emerald-500">{proficiency}</span> ⟳
                </button>
              </div>
            </div>
          </div>

          {/* Engine telemetry metrics */}
          <div className="space-y-2">
            <SectionLabel>Engine Latency telemetry</SectionLabel>
            <div className="flex flex-col gap-1.5">
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
        </div>

        {/* Sidebar Footer Details & Theme Toggles */}
        <div className={cn(
          "border-t p-4 space-y-3",
          theme === "dark" ? "border-white/5 bg-zinc-950/40" : "border-slate-200 bg-slate-50"
        )}>
          {/* Glossary trigger */}
          <button
            onClick={() => {
              setGlossaryOpen(true);
              setSidebarOpen(false);
            }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 px-3 py-2.5 text-[12px] font-bold text-emerald-400 hover:bg-emerald-500/15 transition active:scale-[0.98]"
          >
            <BookIcon className="h-4 w-4" />
            <span>Vocabulary Glossary</span>
            {loaded.size > 0 && (
              <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 font-tech text-[9.5px] font-bold text-emerald-300">
                {loaded.size}
              </span>
            )}
          </button>

          {/* System status + clock */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StatusDot tone={locked ? "emerald" : "sky"} pulse={!locked} />
              <div className="leading-tight">
                <span className="text-[10.5px] font-semibold">
                  {locked ? "Guarded" : "Live Stream"}
                </span>
                <span className="block text-[8px] font-tech uppercase tracking-wider text-zinc-500">
                  {locked ? "Locked" : "Standby"}
                </span>
              </div>
            </div>
            
            <div className="text-right">
              <span className="block font-tech text-[11px] font-bold tabular-nums">
                {clock}
              </span>
              <span className="block text-[8px] font-tech uppercase tracking-wider text-zinc-500">
                session clock
              </span>
            </div>
          </div>

          {/* Color theme swapper & locking controls */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-[10.5px] font-bold border transition",
                theme === "dark" ? "bg-white/[0.02] border-white/5 text-zinc-300 hover:bg-white/[0.06]" : "bg-white border-slate-200 text-slate-800 hover:bg-slate-100"
              )}
            >
              {theme === "dark" ? (
                <>
                  <SunIcon className="h-3.5 w-3.5 text-amber-400" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <MoonIcon className="h-3.5 w-3.5 text-violet-500" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>

            <button
              onClick={() => setLocked((l) => !l)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-[10.5px] font-bold border transition",
                locked
                  ? "bg-emerald-500 border-transparent text-zinc-950 font-bold shadow-md"
                  : theme === "dark" ? "bg-white/[0.02] border-white/5 text-zinc-300" : "bg-white border-slate-200 text-slate-800"
              )}
            >
              {locked ? (
                <>
                  <LockIcon className="h-3.5 w-3.5" />
                  <span>Locked</span>
                </>
              ) : (
                <>
                  <LockOpenIcon className="h-3.5 w-3.5" />
                  <span>Unlock</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE DRAWER BACKDROP */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* WORKSPACE MAIN WORK AREA */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Desktop Mini Header bar */}
        <div className={cn(
          "hidden items-center justify-between border-b px-6 py-3.5 lg:flex",
          theme === "dark" ? "border-white/5 bg-zinc-950/40" : "border-slate-200 bg-white/40"
        )}>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-tech uppercase tracking-wider text-zinc-500">active workspace:</span>
            <Pill tone={viewMode === "dual" ? "violet" : viewMode === "signer" ? "emerald" : "sky"}>
              {viewMode === "dual" ? "Dual Split View" : viewMode === "signer" ? "Sign-to-Speech Panel" : "Speech-to-Sign Panel"}
            </Pill>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-[10.5px] font-tech text-zinc-500">hklogs/ishaara-sign-language-translator</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>

        {/* Central translation panels workspace container */}
        <div className="flex-1 px-4 py-4 sm:px-6 sm:py-5 overflow-y-auto">
          <div
            className={cn(
              "grid gap-4.5 transition-all duration-300",
              viewMode === "dual" ? "xl:grid-cols-2 max-w-7xl mx-auto" : "grid-cols-1 max-w-2xl mx-auto",
              locked && "pointer-events-none select-none opacity-60"
            )}
          >
            {(viewMode === "dual" || viewMode === "signer") && (
              <SignToSpeechPanel proficiency={proficiency} />
            )}
            {(viewMode === "dual" || viewMode === "speaker") && (
              <SpeechToSignPanel dialect={dialect} />
            )}
          </div>
        </div>

        {/* Lock alert indicator overlay */}
        {locked && (
          <div className="pointer-events-none fixed inset-0 z-20 flex items-center justify-center p-6 bg-black/10 backdrop-blur-xs">
            <div className="animate-fade-up flex flex-col items-center gap-2 rounded-2xl border border-emerald-500/30 bg-zinc-950/90 px-6 py-5 text-center shadow-2xl backdrop-blur-md max-w-xs">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/40">
                <LockIcon className="h-6 w-6" />
              </span>
              <p className="text-[14px] font-bold text-zinc-100">Presentation Guarded</p>
              <p className="text-[11px] leading-relaxed text-zinc-400">
                Controls are locked to prevent accidental clicks. Unlock from the sidebar menu to proceed.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Vocabulary Glossary Modal overlay */}
      <GlossaryModal
        open={glossaryOpen}
        onClose={() => setGlossaryOpen(false)}
        tokens={allTokens}
        loaded={loaded}
        onToggle={toggleToken}
        onAddCustom={addCustom}
      />
    </div>
  );
}
