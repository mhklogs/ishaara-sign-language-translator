import { useCallback, useState, useEffect } from "react";
import { glossaryTokens, engineMetrics, type GlossaryToken } from "@/data/samples";
import { SignToSpeechPanel } from "@/components/SignToSpeechPanel";
import { SpeechToSignPanel } from "@/components/SpeechToSignPanel";
import { GlossaryModal } from "@/components/GlossaryModal";
import { FloatingAvatar } from "@/components/FloatingAvatar";
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
  const [floatingAvatarOpen, setFloatingAvatarOpen] = useState(false);
  
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
      el.classList.remove("dark");
      el.classList.add("light");
    } else {
      el.classList.remove("light");
      el.classList.add("dark");
    }
  }, [theme]);

  return (
    <div className={cn(
      "relative flex min-h-screen flex-col lg:flex-row transition-colors duration-300",
      theme === "dark" ? "bg-[var(--bg-main)] text-[var(--text-primary)]" : "bg-[var(--bg-main)] text-[var(--text-primary)]"
    )}>
      {/* ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-grid opacity-[0.4]" />
        <div
          className="absolute inset-0"
          style={{
            background: theme === "dark"
              ? "radial-gradient(70% 50% at 50% -8%, rgba(16,185,129,0.14), transparent 65%), radial-gradient(60% 50% at 100% 100%, rgba(59,130,246,0.06), transparent 60%)"
              : "radial-gradient(70% 50% at 50% -8%, rgba(220,38,38,0.06), transparent 65%), radial-gradient(60% 50% at 100% 100%, rgba(10,25,47,0.04), transparent 60%)",
          }}
        />
      </div>

      {/* MOBILE TOP BAR / NAVBAR */}
      <header className={cn(
        "flex items-center justify-between border-b px-4 py-3 sticky top-0 z-30 lg:hidden backdrop-blur-md",
        "border-[var(--border-color)] bg-[var(--bg-surface)]/85"
      )}>
        <button
          onClick={() => setSidebarOpen(true)}
          className={cn(
            "rounded-xl p-2 transition border border-[var(--border-color)] bg-[var(--bg-main)] hover:bg-[var(--bg-surface)]"
          )}
          aria-label="Open navigation sidebar"
        >
          <MenuIcon className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-accent)] shadow-md">
            <HandIcon className="h-4.5 w-4.5 text-[var(--bg-main)]" strokeWidth={2.5} />
          </div>
          <span className="text-[14px] font-black uppercase tracking-wider">
            ISHAARA<span className="text-[var(--brand-accent)]">.</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            className="rounded-xl p-2 transition border border-[var(--border-color)] bg-[var(--bg-main)]"
            title="Toggle color theme"
          >
            {theme === "dark" ? <SunIcon className="h-4.5 w-4.5 text-amber-400" /> : <MoonIcon className="h-4.5 w-4.5 text-violet-600" />}
          </button>
          
          <button
            onClick={() => setLocked((l) => !l)}
            className={cn(
              "rounded-xl p-2 transition border",
              locked
                ? "bg-[var(--brand-primary)] text-[var(--bg-main)] border-transparent shadow-md"
                : "border-[var(--border-color)] bg-[var(--bg-main)]"
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
        "border-[var(--border-color)] bg-[var(--bg-surface)]/95 lg:bg-[var(--bg-surface)]/80 backdrop-blur-md",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Sidebar Header */}
        <div className={cn(
          "flex items-center justify-between border-b px-5 py-4 border-[var(--border-color)]"
        )}>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-accent)] shadow-md">
              <HandIcon className="h-5 w-5 text-[var(--bg-main)]" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-[14px] font-black uppercase tracking-wider">
                ISHAARA<span className="text-[var(--brand-accent)]">.</span>
              </h1>
              <p className="font-tech text-[8px] uppercase tracking-[0.15em] text-[var(--text-secondary)]">
                Bi-Directional Translator
              </p>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1 transition lg:hidden hover:bg-[var(--bg-main)]"
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
                      "flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-left transition active:scale-[0.98] border",
                      isActive
                        ? "bg-[var(--brand-primary)] text-[var(--bg-main)] border-transparent shadow-md font-bold"
                        : "bg-[var(--bg-main)] border-[var(--border-color)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)]"
                    )}
                  >
                    <span className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-lg ring-1 ring-[var(--border-color)] bg-[var(--bg-surface)]"
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
                      <div className="text-[9.5px] opacity-75">
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
                <label className="text-[9.5px] font-tech uppercase tracking-wider text-[var(--text-secondary)] mb-1">Dialect Preferred</label>
                <button
                  onClick={() => setDialect((d) => d === "Pakistani Sign Language" ? "Indian Sign Language" : "Pakistani Sign Language")}
                  className="w-full text-left rounded-xl px-3 py-2 text-[11px] font-medium border transition bg-[var(--bg-main)] border-[var(--border-color)] hover:bg-[var(--bg-surface)]"
                >
                  Dialect · <span className="font-semibold text-[var(--brand-primary)]">{dialect === "Pakistani Sign Language" ? "PSL" : "ISL"}</span> ⟳
                </button>
              </div>

              <div className="flex flex-col">
                <label className="text-[9.5px] font-tech uppercase tracking-wider text-[var(--text-secondary)] mb-1">Target Language</label>
                <button
                  onClick={() => setTargetLanguage((t) => t === "English / Urdu" ? "English / Hindi" : t === "English / Hindi" ? "Urdu / Hindi" : "English / Urdu")}
                  className="w-full text-left rounded-xl px-3 py-2 text-[11px] font-medium border transition bg-[var(--bg-main)] border-[var(--border-color)] hover:bg-[var(--bg-surface)]"
                >
                  Target · <span className="font-semibold text-[var(--brand-primary)]">{targetLanguage}</span> ⟳
                </button>
              </div>

              <div className="flex flex-col">
                <label className="text-[9.5px] font-tech uppercase tracking-wider text-[var(--text-secondary)] mb-1">Proficiency Depth</label>
                <button
                  onClick={() => setProficiency((p) => p === "Expert" ? "Intermediate" : p === "Intermediate" ? "Beginner" : "Expert")}
                  className="w-full text-left rounded-xl px-3 py-2 text-[11px] font-medium border transition bg-[var(--bg-main)] border-[var(--border-color)] hover:bg-[var(--bg-surface)]"
                >
                  Profile · <span className="font-semibold text-[var(--brand-primary)]">{proficiency}</span> ⟳
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
        <div className="border-t p-4 space-y-3 border-[var(--border-color)] bg-[var(--bg-surface)]">
          {/* Screen Overlay Trigger */}
          <button
            onClick={() => {
              setFloatingAvatarOpen(true);
              setSidebarOpen(false);
            }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-500/10 border border-violet-500/25 px-3 py-2.5 text-[12px] font-bold text-violet-500 hover:bg-violet-500/15 transition active:scale-[0.98]"
          >
            <CpuIcon className="h-4 w-4" />
            <span>Enter Screen Overlay</span>
          </button>

          {/* Glossary trigger */}
          <button
            onClick={() => {
              setGlossaryOpen(true);
              setSidebarOpen(false);
            }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 px-3 py-2.5 text-[12px] font-bold text-emerald-500 hover:bg-emerald-500/15 transition active:scale-[0.98]"
          >
            <BookIcon className="h-4 w-4" />
            <span>Vocabulary Glossary</span>
            {loaded.size > 0 && (
              <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 font-tech text-[9.5px] font-bold text-emerald-400">
                {loaded.size}
              </span>
            )}
          </button>

          {/* System status + clock */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <StatusDot tone={locked ? "emerald" : "sky"} pulse={!locked} />
              <div className="leading-tight">
                <span className="text-[10.5px] font-semibold">
                  {locked ? "Guarded" : "Live Stream"}
                </span>
                <span className="block text-[8px] font-tech uppercase tracking-wider text-[var(--text-secondary)]">
                  {locked ? "Locked" : "Standby"}
                </span>
              </div>
            </div>
            
            <div className="text-right">
              <span className="block font-tech text-[11px] font-bold tabular-nums">
                {clock}
              </span>
              <span className="block text-[8px] font-tech uppercase tracking-wider text-[var(--text-secondary)]">
                session clock
              </span>
            </div>
          </div>

          {/* Color theme swapper & locking controls */}
          <div className="flex items-center justify-between gap-2 pt-1.5">
            <button
              onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-[10.5px] font-bold border transition bg-[var(--bg-main)] border-[var(--border-color)] hover:bg-[var(--bg-surface)]"
            >
              {theme === "dark" ? (
                <>
                  <SunIcon className="h-3.5 w-3.5 text-amber-500" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <MoonIcon className="h-3.5 w-3.5 text-violet-600" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>

            <button
              onClick={() => setLocked((l) => !l)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-[10.5px] font-bold border transition",
                locked
                  ? "bg-[var(--brand-accent)] text-[var(--bg-main)] border-transparent font-bold shadow-md animate-pulse"
                  : "bg-[var(--bg-main)] border-[var(--border-color)]"
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
          "hidden items-center justify-between border-b px-6 py-3.5 lg:flex border-[var(--border-color)] bg-[var(--bg-surface)]/40"
        )}>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-tech uppercase tracking-wider text-[var(--text-secondary)]">active workspace:</span>
            <Pill tone={viewMode === "dual" ? "violet" : viewMode === "signer" ? "emerald" : "sky"}>
              {viewMode === "dual" ? "Dual Split View" : viewMode === "signer" ? "Sign-to-Speech Panel" : "Speech-to-Sign Panel"}
            </Pill>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-[10.5px] font-tech text-[var(--text-secondary)]">hklogs/ishaara-sign-language-translator</span>
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-primary)] animate-pulse" />
          </div>
        </div>

        {/* Central translation panels workspace container */}
        <div className="flex-1 px-4 py-4 sm:px-6 sm:py-5 overflow-y-auto">
          <div
            className={cn(
              "grid gap-4.5 transition-all duration-300",
              viewMode === "dual" ? "xl:grid-cols-2 max-w-7xl mx-auto" : "grid-cols-1 max-w-2xl mx-auto",
              locked && "pointer-events-none select-none opacity-65"
            )}
          >
            {(viewMode === "dual" || viewMode === "signer") && (
              <div className="animate-slide-left">
                <SignToSpeechPanel proficiency={proficiency} />
              </div>
            )}
            {(viewMode === "dual" || viewMode === "speaker") && (
              <div className="animate-slide-right">
                <SpeechToSignPanel dialect={dialect} />
              </div>
            )}
          </div>
        </div>

        {/* Lock alert indicator overlay */}
        {locked && (
          <div className="pointer-events-none fixed inset-0 z-20 flex items-center justify-center p-6 bg-black/15 backdrop-blur-xs">
            <div className="animate-fade-up flex flex-col items-center gap-2 rounded-2xl border border-[var(--brand-primary)] bg-[var(--bg-surface)] px-6 py-5 text-center shadow-2xl backdrop-blur-md max-w-xs">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] ring-1 ring-[var(--brand-primary)]/40">
                <LockIcon className="h-6 w-6" />
              </span>
              <p className="text-[14px] font-bold">Presentation Guarded</p>
              <p className="text-[11px] leading-relaxed text-[var(--text-secondary)]">
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

      {/* Floating Screen Overlay Avatar */}
      {floatingAvatarOpen && (
        <FloatingAvatar
          primaryMode={viewMode === "signer" ? "SIGNER" : "SPEAKER"}
          currentGloss="READY TO STREAM"
          onClose={() => setFloatingAvatarOpen(false)}
        />
      )}
    </div>
  );
}
