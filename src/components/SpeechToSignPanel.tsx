import { useEffect, useRef, useState, useCallback } from "react";
import { interviewQuestions } from "@/data/samples";
import { useInterval } from "@/hooks/useInterval";
import { SignAvatar } from "./SignAvatar";
import { GlossAnalyzer } from "./GlossAnalyzer";
import { ActivityIcon, CubeIcon, MicIcon } from "./icons";
import { PanelHeader, Pill, SectionLabel, StatusDot } from "./ui";
import { cn } from "@/utils/cn";
import { useSpeechToSign } from "@/hooks/useSpeechToSign";

type Phase = "listen" | "map" | "hold";

function LevelMeter({ active }: { active: boolean }) {
  return (
    <div className="flex h-7 items-center justify-center gap-[3px]">
      {Array.from({ length: 28 }).map((_, i) => (
        <span
          key={i}
          className={cn("w-[3px] origin-center rounded-full", active ? "bg-red-400" : "bg-zinc-700")}
          style={{
            height: active ? "100%" : "20%",
            animation: active ? "wave-bar 0.6s ease-in-out infinite" : undefined,
            animationDelay: `${(i % 7) * 0.08}s`,
            opacity: active ? 0.9 : 0.4,
          }}
        />
      ))}
    </div>
  );
}

export function SpeechToSignPanel({ dialect = "Pakistani Sign Language" }: { dialect?: string }) {
  const [mode, setMode] = useState<"idle" | "simulate" | "live">("idle");
  const [idx, setIdx] = useState(0);
  const [spoken, setSpoken] = useState("");
  const [revealed, setRevealed] = useState(0);

  const charRef = useRef(0);
  const phaseRef = useRef<Phase>("listen");
  const holdRef = useRef(0);
  const mapTickRef = useRef(0);

  const item = interviewQuestions[idx % interviewQuestions.length];
  const dialectShort = dialect === "Pakistani Sign Language" ? "PSL" : "ISL";

  // callback when live speech-to-text parses a new gloss sequence
  const onGlossReady = useCallback((tokens: string[]) => {
    console.log("🎯 Live Speech Gloss parsed:", tokens);
  }, []);

  const {
    isListening: isMicListening,
    transcription,
    glossResult,
    startListening,
    stopListening,
  } = useSpeechToSign(onGlossReady, {
    dialect: dialectShort,
    language: dialectShort === "PSL" ? "ur-PK" : "en-US",
  });

  // restart the current item's simulation progress
  const resetSimulationProgress = () => {
    charRef.current = 0;
    phaseRef.current = "listen";
    holdRef.current = 0;
    mapTickRef.current = 0;
    setSpoken("");
    setRevealed(0);
  };

  useEffect(() => {
    if (mode === "simulate") {
      resetSimulationProgress();
    }
  }, [idx, mode]);

  // Simulated cycle loop
  useInterval(
    () => {
      const full = item.spoken;
      if (phaseRef.current === "listen") {
        charRef.current += 1;
        setSpoken(full.slice(0, charRef.current));
        if (charRef.current >= full.length) {
          phaseRef.current = "map";
          mapTickRef.current = 0;
        }
      } else if (phaseRef.current === "map") {
        mapTickRef.current += 1;
        if (mapTickRef.current % 3 === 0) {
          setRevealed((r) => {
            const nr = Math.min(r + 1, item.glosses.length);
            if (nr >= item.glosses.length) phaseRef.current = "hold";
            return nr;
          });
        }
      } else {
        holdRef.current += 1;
        if (holdRef.current > 20) {
          setIdx((i) => (i + 1) % interviewQuestions.length);
        }
      }
    },
    mode === "simulate" ? 55 : null
  );

  const handleToggleMic = () => {
    if (mode === "live") {
      stopListening();
      setMode("idle");
    } else {
      // cancel simulation if running
      resetSimulationProgress();
      setMode("live");
      startListening();
    }
  };

  const handleSelectQuestion = (qIdx: number) => {
    // stop microphone
    if (mode === "live") {
      stopListening();
    }
    setIdx(qIdx);
    setMode("simulate");
  };

  // Determine active display states based on mode
  const active = mode === "simulate" || mode === "live";
  const displayedSpokenText = mode === "live" ? (transcription || "Listening voice input...") : spoken;
  const displayedRevealedCount = mode === "live" ? glossResult.length : revealed;
  const displayItem = mode === "live"
    ? {
        id: "live",
        spoken: transcription || "Listening...",
        source: (dialectShort === "PSL" ? "UR" : "EN") as "EN" | "UR",
        topic: "Live Speech Translation",
        glosses: glossResult.length > 0 ? glossResult : ["LISTENING..."],
      }
    : item;

  return (
    <section className="rounded-3xl border border-white/[0.07] bg-zinc-900/40 p-3.5 shadow-xl shadow-black/30">
      <PanelHeader
        icon={<MicIcon className="h-5 w-5" />}
        eyebrow="Stream B · Listening"
        title="Speech → Sign"
        subtitle="Interpretation Workspace"
        tone={active ? "red" : "emerald"}
        right={
          <span
            className={cn(
              "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1",
              active
                ? "bg-red-500/10 text-red-300 ring-red-500/30"
                : "bg-zinc-500/10 text-zinc-400 ring-white/10"
            )}
          >
            <StatusDot tone={active ? "red" : "emerald"} pulse={active} />
            {mode === "live" ? "Live Mic" : mode === "simulate" ? "Simulating" : "Standby"}
          </span>
        }
      />

      <div className="mt-3 grid gap-3">
        {/* 3D avatar viewer */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-950">
          <div className="absolute inset-0 bg-grid opacity-60" />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 80% at 50% 18%, rgba(16,185,129,0.16), transparent 60%), radial-gradient(100% 60% at 50% 100%, rgba(2,6,23,0.9), transparent 70%)",
            }}
          />
          <SignAvatar gesture={active ? "signing" : "idle"} className="absolute inset-0" />

          {/* overlay labels */}
          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-2.5">
            <span className="flex items-center gap-1.5 rounded-md bg-black/45 px-2 py-1 font-tech text-[9px] font-semibold uppercase tracking-wider text-zinc-200 backdrop-blur-sm">
              <CubeIcon className="h-3.5 w-3.5 text-emerald-300" />
              3D Avatar · rigged
            </span>
            <Pill tone={active ? "red" : "emerald"} className="backdrop-blur-sm">
              {active ? "Signing" : "Idle"} · {dialectShort}
            </Pill>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between p-2.5">
            <SectionLabel icon={<ActivityIcon className="h-3 w-3" />}>
              {active ? "motion capture → rig" : "drag to orbit"}
            </SectionLabel>
            <span className="font-tech text-[9px] text-zinc-500">60 fps</span>
          </div>
        </div>

        {/* Quick select questions */}
        <div className="rounded-2xl border border-white/[0.05] bg-zinc-950/40 p-2.5">
          <SectionLabel>Quick Select Interview Questions</SectionLabel>
          <div className="mt-2 grid grid-cols-1 gap-1 max-h-24 overflow-y-auto no-scrollbar">
            {interviewQuestions.map((qItem, qIdx) => {
              const isActive = qIdx === idx % interviewQuestions.length && mode === "simulate";
              return (
                <button
                  key={qItem.id}
                  onClick={() => handleSelectQuestion(qIdx)}
                  className={cn(
                    "w-full text-left rounded-lg px-2.5 py-1 text-[11px] transition truncate",
                    isActive
                      ? "bg-red-500/10 text-red-300 border border-red-500/30"
                      : "bg-white/[0.02] text-zinc-400 hover:bg-white/[0.04] border border-transparent"
                  )}
                >
                  {isActive ? "● " : ""} [{qItem.topic}] {qItem.spoken}
                </button>
              );
            })}
          </div>
        </div>

        {/* gloss syntax analyzer */}
        <GlossAnalyzer item={displayItem} spoken={displayedSpokenText} revealed={displayedRevealedCount} active={active} />
      </div>

      {/* one-touch microphone bar */}
      <div className="mt-3">
        <button
          onClick={handleToggleMic}
          className={cn(
            "relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl px-4 py-3.5 text-[14px] font-bold transition active:scale-[0.99]",
            mode === "live"
              ? "bg-gradient-to-b from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30"
              : "bg-white/[0.05] text-zinc-100 ring-1 ring-white/10 hover:bg-white/[0.08]"
          )}
        >
          {mode === "live" && (
            <>
              <span className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-400/40 animate-ring" />
              <span className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-400/30 animate-ring" style={{ animationDelay: "0.4s" }} />
            </>
          )}
          <span className="relative z-10 flex items-center gap-2.5">
            <MicIcon className="h-5 w-5" strokeWidth={2} />
            {mode === "live" ? "Listening Live — tap to stop" : "Tap to Speak / Capture Interviewer Audio"}
          </span>
        </button>

        <div className="mt-2 flex items-center gap-2">
          <LevelMeter active={active} />
          <span
            className={cn(
              "shrink-0 font-tech text-[9.5px] uppercase tracking-wider",
              active ? "text-red-300" : "text-zinc-600"
            )}
          >
            {active ? `● ${displayItem.topic}` : `mic · 48kHz · denoise`}
          </span>
        </div>
      </div>
    </section>
  );
}
