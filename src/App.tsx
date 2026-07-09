import { useCallback, useState, useEffect, useRef } from "react";
import { glossaryTokens, engineMetrics, type GlossaryToken } from "@/data/samples";
import { GlossaryModal } from "@/components/GlossaryModal";
import { FloatingAvatar } from "@/components/FloatingAvatar";
import { SignAvatar } from "@/components/SignAvatar";
import { useMediaPipe } from "@/hooks/useMediaPipe";
import { useSlidingWindow } from "@/hooks/useSlidingWindow";
import { useTFLiteWorker } from "@/hooks/useTFLiteWorker";
import { useSpeechToSign } from "@/hooks/useSpeechToSign";
import { convertToSignGloss } from "@/utils/glossMapper";
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
  GlobeIcon,
  MicIcon
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

// Level meter for mic input visualization
function LevelMeter({ active }: { active: boolean }) {
  return (
    <div className="flex h-7 items-center justify-center gap-[3px]">
      {Array.from({ length: 28 }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "w-[3px] origin-center rounded-full transition-all duration-300",
            active ? "bg-red-400 animate-[wave-bar_0.6s_ease-in-out_infinite]" : "bg-zinc-700"
          )}
          style={{
            height: active ? "100%" : "20%",
            animationDelay: active ? `${(i % 7) * 0.08}s` : undefined,
            opacity: active ? 0.9 : 0.4,
          }}
        />
      ))}
    </div>
  );
}

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

export default function App() {
  // Global States
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
  
  // viewMode: 'dual' | 'signer' | 'speaker' (corresponds to Deaf + Hearing split, Deaf Signer mode only, or Hearing Speaker mode only)
  const [viewMode, setViewMode] = useState<"dual" | "signer" | "speaker">("dual");

  // Translation metrics & engine logs
  const [inputText, setInputText] = useState<string>('');
  const [translatedGloss, setTranslatedGloss] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [systemLogs, setSystemLogs] = useState<string[]>(['System initialized. Standing by.']);

  const clock = useSessionClock();

  // Voice/Speech recognition callback to drive sign gestures
  const onSpeechGlossReady = useCallback((tokens: string[]) => {
    setTranslatedGloss(tokens.join(' '));
    setSystemLogs(prev => [`Speech transcribed and mapped to Gloss: ${tokens.join(' ')}`, ...prev]);
  }, []);

  const {
    isListening: isMicListening,
    transcription: voiceTranscription,
    startListening: startVoiceCapture,
    stopListening: stopVoiceCapture,
  } = useSpeechToSign(onSpeechGlossReady, {
    dialect: dialect === "Pakistani Sign Language" ? "PSL" : "ISL",
    language: dialect === "Pakistani Sign Language" ? "ur-PK" : "en-US"
  });

  // TFLite / Sign-to-Speech prediction callback
  const onGesturePredicted = useCallback((gloss: string, confidence: number) => {
    setTranslatedGloss(gloss);
    setSystemLogs(prev => [`TFLite prediction: ${gloss} (${(confidence * 100).toFixed(0)}%)`, ...prev]);

    // Automatic TTS synthesis for predicted signs
    try {
      if (window.speechSynthesis && confidence > 0.65 && gloss && gloss !== "LISTENING...") {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(gloss.toLowerCase());
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.warn("SpeechSynthesis failed:", e);
    }
  }, []);

  const {
    predictGesture,
    isModelLoading: tfliteLoading,
    engineReady: tfliteReady
  } = useTFLiteWorker(onGesturePredicted);

  // Pipe MediaPipe coordinates to TFLite
  const onFrameCaptured = useCallback((coordinatesFlat: number[]) => {
    predictGesture(coordinatesFlat);
  }, [predictGesture]);

  const {
    videoRef,
    isTracking: isCamActive,
    isModelLoading: mediaPipeLoading,
    startTracking: startCamTracking,
    stopTracking: stopCamTracking,
  } = useMediaPipe(onFrameCaptured);

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

  // Sync theme class to document body
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

  // Clean up streams on unmount
  useEffect(() => {
    return () => {
      try {
        stopCamTracking();
        stopVoiceCapture();
      } catch (e) {}
    };
  }, [stopCamTracking, stopVoiceCapture]);

  // Gemini 2.5 Flash translation execution with automatic local reordering fallback
  const executeTextToSignGloss = async () => {
    const textTarget = viewMode === 'speaker' ? (voiceTranscription || inputText) : inputText;
    
    if (!textTarget.trim()) {
      alert("Please input a phrase or use the microphone to capture voice first.");
      return;
    }

    setIsProcessing(true);
    setSystemLogs(prev => [`Processing translation query...`, ...prev]);

    // Local fallback if Gemini API key is placeholder/missing
    if (!GEMINI_KEY || GEMINI_KEY === "your_actual_gemini_api_key_here") {
      setTimeout(() => {
        const localGloss = convertToSignGloss(textTarget, dialect === "Pakistani Sign Language" ? "PSL" : "ISL");
        setTranslatedGloss(localGloss.join(' '));
        setSystemLogs(prev => [
          `[Local Fallback Output] Mapped tokens: ${localGloss.join(' ')}`,
          `Warning: Gemini API Key placeholder detected. Local translation active.`,
          ...prev
        ]);
        setIsProcessing(false);
      }, 700);
      return;
    }

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Convert the following text into localized Sign Language grammatical Gloss structure (Caps, dropped particles, clear markers): "${textTarget}"`
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      const glossOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text || "FAILED_GLOSS_PARSE";
      setTranslatedGloss(glossOutput);
      setSystemLogs(prev => [`Success: Extracted gloss via Gemini 2.5 Flash.`, ...prev]);
    } catch (error: any) {
      console.error(error);
      const localGloss = convertToSignGloss(textTarget, dialect === "Pakistani Sign Language" ? "PSL" : "ISL");
      setTranslatedGloss(localGloss.join(' '));
      setSystemLogs(prev => [
        `[Local Fallback Output] Mapped tokens: ${localGloss.join(' ')}`,
        `API Call Failed: ${error.message}. Local translation active.`,
        ...prev
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const hasValidApiKey = GEMINI_KEY && GEMINI_KEY !== "your_actual_gemini_api_key_here";

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
          className="rounded-xl p-2 transition border border-[var(--border-color)] bg-[var(--bg-main)] hover:bg-[var(--bg-surface)]"
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
        <div className="flex items-center justify-between border-b px-5 py-4 border-[var(--border-color)]">
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
          {/* Active Workspace Stream Selectors */}
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
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg ring-1 ring-[var(--border-color)] bg-[var(--bg-surface)]">
                      {mode === "signer" ? (
                        <HandIcon className="h-4 w-4 text-[var(--brand-primary)]" />
                      ) : mode === "speaker" ? (
                        <GlobeIcon className="h-4 w-4 text-[var(--brand-primary)]" />
                      ) : (
                        <CpuIcon className="h-4 w-4 text-[var(--brand-primary)]" />
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

          {/* Config & Dialect parameters */}
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
            <span className="text-[10.5px] font-mono text-[var(--text-secondary)] bg-[var(--bg-surface)] px-2 py-0.5 rounded border border-[var(--border-color)]">
              API Status: {hasValidApiKey ? 'CONNECTED' : 'MOCK FALLBACK ACTIVE'}
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-primary)] animate-pulse" />
          </div>
        </div>

        {/* HERO TITLE SECTION */}
        <section className="max-w-4xl mx-auto px-6 pt-10 pb-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Bridging the Communication Barrier with <span className="text-[var(--brand-primary)]">Real-Time Translation</span>
          </h2>
          <p className="mt-2.5 text-xs sm:text-sm text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed">
            Process incoming natural spoken phrases, parse structural grammar models via Gemini 2.5 Flash, and review avatar kinematics inside an integrated pipeline.
          </p>
        </section>

        {/* STEP-BY-STEP VERTICAL FLOW CONTAINER (SCROLLDOWN FLOW NOT SIDEWAYS) */}
        <div className="flex-1 px-4 py-4 sm:px-6 sm:py-5 overflow-y-auto max-w-3xl mx-auto w-full space-y-8 pb-24">
          
          {/* STEP 1: INPUT STREAM CAPTURE */}
          <div className="animate-slide-left p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[var(--brand-accent)] tracking-widest font-mono">STEP 01</span>
                <h3 className="font-bold text-sm sm:text-base tracking-tight">Input Stream Capture</h3>
              </div>
              <span className="text-xs text-[var(--text-secondary)] font-tech">INPUT_CAPTURE</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Deaf Signer Side (Webcam Scanning) */}
              {(viewMode === "dual" || viewMode === "signer") && (
                <div className="space-y-3.5 border border-[var(--border-color)] bg-[var(--bg-main)] p-4 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">Deaf Signer Cam</span>
                    <span className="text-[9px] font-tech text-zinc-500">543 landmarks</span>
                  </div>

                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-[var(--border-color)] bg-zinc-950">
                    <video
                      ref={videoRef}
                      className="absolute inset-0 h-full w-full object-cover scale-x-[-1]"
                      playsInline
                      muted
                    />
                    {!isCamActive && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-3 bg-zinc-950/80">
                        <span className="text-2xl mb-1">📷</span>
                        <span className="text-[11px] font-bold text-zinc-300">Camera Standby</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={isCamActive ? stopCamTracking : startCamTracking}
                    className={cn(
                      "w-full font-bold py-2 px-3 rounded-xl transition text-xs",
                      isCamActive ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-[var(--brand-primary)] text-[var(--bg-main)]'
                    )}
                  >
                    {isCamActive ? 'Stop Camera' : 'Start Camera'}
                  </button>
                </div>
              )}

              {/* Hearing Speaker Side (Mic or Text input) */}
              {(viewMode === "dual" || viewMode === "speaker") && (
                <div className="space-y-3.5 border border-[var(--border-color)] bg-[var(--bg-main)] p-4 rounded-2xl flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[var(--text-secondary)] uppercase font-tech">Hearing Speaker Mic</span>
                      <span className="text-[9px] font-tech text-zinc-500">48kHz</span>
                    </div>
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Type a phrase or speak into mic..."
                      className="w-full h-16 bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-xl p-2 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={isMicListening ? stopVoiceCapture : startVoiceCapture}
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition",
                          isMicListening ? 'bg-red-500 text-white animate-pulse' : 'bg-[var(--brand-primary)] text-[var(--bg-main)]'
                        )}
                      >
                        <MicIcon className="h-4.5 w-4.5" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10.5px] font-medium block truncate">
                          {isMicListening ? 'Recording...' : voiceTranscription || 'Microphone standby'}
                        </span>
                        <LevelMeter active={isMicListening} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* STEP 2: GLOSS TRANSLATION */}
          <div className="animate-slide-right p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[var(--brand-accent)] tracking-widest font-mono">STEP 02</span>
                <h3 className="font-bold text-sm sm:text-base tracking-tight">Translation Engine</h3>
              </div>
              <span className="text-xs text-[var(--text-secondary)] font-tech">GLOSS_EXTRACTION</span>
            </div>

            <div className="space-y-4">
              <p className="text-[11px] sm:text-xs text-[var(--text-secondary)]">
                Parses inputs (typed text, speech transcriptions, or webcam keypoints) into sign grammatical gloss tokens.
              </p>

              {(viewMode === "dual" || viewMode === "speaker") && (
                <button
                  onClick={executeTextToSignGloss}
                  disabled={isProcessing}
                  className="w-full bg-[var(--brand-primary)] hover:opacity-90 text-[var(--bg-main)] font-bold py-2.5 px-4 rounded-xl transition text-xs flex items-center justify-center gap-2 shadow-sm"
                >
                  {isProcessing ? (
                    <span className="w-4 h-4 border-2 border-[var(--bg-main)] border-t-transparent rounded-full animate-spin" />
                  ) : 'Translate Voice / Typed Phrases'}
                </button>
              )}

              <div className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-3.5">
                <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block mb-1">Sign Gloss Sequence</span>
                <div className="font-tech text-xs text-[var(--brand-accent)] font-extrabold bg-[var(--bg-surface)] p-2.5 rounded-lg border border-[var(--border-color)] uppercase tracking-widest min-h-[40px]">
                  {translatedGloss || '[Awaiting input capture...]'}
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3: AVATAR VIEWPORT */}
          <div className="animate-slide-left p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[var(--brand-accent)] tracking-widest font-mono">STEP 03</span>
                <h3 className="font-bold text-sm sm:text-base tracking-tight">3D Sign Avatar Canvas</h3>
              </div>
              <span className="text-xs text-[var(--text-secondary)] font-tech">AVATAR_RENDER</span>
            </div>

            <div className="space-y-4">
              <p className="text-[11px] sm:text-xs text-[var(--text-secondary)]">
                Drives structural rig configurations based on the spatiotemporal coordinates window.
              </p>

              <div className="bg-black rounded-xl relative overflow-hidden flex flex-col items-center justify-center p-6 border border-zinc-800 shadow-inner min-h-[220px]">
                <SignAvatar
                  gesture={translatedGloss ? 'signing' : 'idle'}
                  className="absolute inset-0"
                />
                
                {/* HUD Subtitle Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-zinc-950/95 border-t border-zinc-800 p-2.5 text-center">
                  <span className="text-[10.5px] text-green-400 font-mono tracking-widest font-bold block uppercase">
                    {translatedGloss || '[AWAITING TRANSLATION]'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 4: SYSTEM LOGS */}
          <div className="animate-slide-right p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[var(--brand-accent)] tracking-widest font-mono">STEP 04</span>
                <h3 className="font-bold text-sm sm:text-base tracking-tight">System Operations Logs</h3>
              </div>
              <span className="text-xs text-[var(--text-secondary)] font-tech">ANALYTICS_LOG</span>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block tracking-wider">System Diagnostics telemetry</span>
              <div className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-3 font-mono text-[10.5px] overflow-y-auto space-y-2 shadow-inner max-h-[140px]">
                {systemLogs.map((log, idx) => (
                  <div key={idx} className="text-[var(--text-secondary)] border-b border-[var(--border-color)] pb-1.5 last:border-0 last:pb-0">
                    <span className="text-[var(--brand-accent)] font-bold mr-1.5">»</span> {log}
                  </div>
                ))}
              </div>
            </div>
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
          currentGloss={translatedGloss}
          onClose={() => setFloatingAvatarOpen(false)}
        />
      )}
    </div>
  );
}
