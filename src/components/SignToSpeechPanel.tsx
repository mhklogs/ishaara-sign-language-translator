import { useCallback, useRef, useState } from "react";
import cameraFeed from "@/assets/camera-feed.jpg";
import { signerPhrases } from "@/data/samples";
import { useTypewriter } from "@/hooks/useTypewriter";
import { CameraIcon, FlipIcon, HandIcon, SpeakerIcon, WaveIcon } from "./icons";
import { SkeletonOverlay } from "./SkeletonOverlay";
import { PanelHeader, SectionLabel, StatusDot } from "./ui";
import { cn } from "@/utils/cn";
import { useMediaPipe } from "@/hooks/useMediaPipe";
import { useSlidingWindow } from "@/hooks/useSlidingWindow";
import { useTFLiteWorker } from "@/hooks/useTFLiteWorker";

function Bars({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-end gap-[3px]", className)}>
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className="w-[3px] origin-bottom rounded-full bg-current"
          style={{
            height: "16px",
            animation: "wave-bar 0.7s ease-in-out infinite",
            animationDelay: `${i * 0.09}s`,
          }}
        />
      ))}
    </span>
  );
}

export function SignToSpeechPanel({ proficiency = "Expert" }: { proficiency?: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [predictedGloss, setPredictedGloss] = useState<string>("");
  const [inferenceConfidence, setInferenceConfidence] = useState<number>(0);

  const onPredictionReceived = useCallback((gloss: string, confidence: number) => {
    setPredictedGloss(gloss);
    setInferenceConfidence(confidence);
  }, []);

  const { engineReady, runInference } = useTFLiteWorker(onPredictionReceived);

  const handleWindowReady = useCallback((windowTensor: number[][]) => {
    runInference(windowTensor);
  }, [runInference]);

  const { pushFrame } = useSlidingWindow(handleWindowReady, { windowSize: 30, stride: 5 });

  const { isLoading, isTracking, startTracking, stopTracking } = useMediaPipe(
    videoRef,
    pushFrame
  );

  const {
    text,
    full,
    typing,
    paused,
    togglePause,
    nextPhrase,
    prevPhrase,
    selectPhrase,
    index,
  } = useTypewriter(signerPhrases, {
    typeSpeed: 38,
    deleteSpeed: 16,
    holdDelay: 2600,
  });
  const [broadcasting, setBroadcasting] = useState(false);
  const [lang, setLang] = useState<"EN" | "UR">("EN");
  const [cam, setCam] = useState<"front" | "rear">("front");
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  const stop = useCallback(() => {
    try {
      window.speechSynthesis?.cancel();
    } catch {
      /* noop */
    }
    utterRef.current = null;
    setBroadcasting(false);
  }, []);

  const broadcast = useCallback(() => {
    if (broadcasting) {
      stop();
      return;
    }
    setBroadcasting(true);
    let handled = false;
    try {
      const synth = window.speechSynthesis;
      if (synth) {
        synth.cancel();
        const u = new SpeechSynthesisUtterance(full);
        u.rate = 0.98;
        u.pitch = 1;
        u.volume = 1;
        const voices = synth.getVoices();
        const want = lang === "UR" ? /ur|hi/i : /en/i;
        const v = voices.find((vv) => want.test(vv.lang));
        if (v) u.voice = v;
        if (lang === "UR") u.lang = "ur-PK";
        u.onend = () => setBroadcasting(false);
        u.onerror = () => setBroadcasting(false);
        utterRef.current = u;
        synth.speak(u);
        handled = true;
      }
    } catch {
      handled = false;
    }
    if (!handled) {
      window.setTimeout(() => setBroadcasting(false), 2800);
    }
  }, [broadcasting, full, lang, stop]);

  const words = text.trim().split(/\s+/).filter(Boolean);
  const latency = proficiency === "Beginner" ? 84 : proficiency === "Intermediate" ? 54 : 32;

  return (
    <section className="rounded-3xl border border-white/[0.07] bg-zinc-900/40 p-3.5 shadow-xl shadow-black/30">
      <PanelHeader
        icon={<HandIcon className="h-5 w-5" />}
        eyebrow="Stream A · Giving"
        title="Sign → Speech"
        subtitle="Signing Workspace"
        right={
          <span className={cn(
            "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1",
            isTracking
              ? "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/30"
              : "bg-zinc-500/10 text-zinc-400 ring-white/10"
          )}>
            <StatusDot tone={isTracking ? "emerald" : "sky"} pulse={isTracking} />
            {isTracking ? "Recognizing" : "Standby"}
          </span>
        }
      />

      {/* camera feed */}
      <div className="relative mt-3 aspect-[3/4] overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-950">
        <video
          ref={videoRef}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-all duration-500",
            cam === "front" ? "scale-x-[-1]" : "scale-x-100",
            isTracking ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          playsInline
          muted
        />
        <img
          src={cameraFeed}
          alt="Live camera feed"
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-all duration-500",
            cam === "front" ? "scale-x-[-1]" : "scale-x-100",
            isTracking ? "opacity-0 pointer-events-none" : "opacity-100"
          )}
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/10 to-zinc-950/30" />
        <SkeletonOverlay />

        {/* top controls */}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-2.5">
          <span className="flex items-center gap-1.5 rounded-md bg-black/45 px-2 py-1 font-tech text-[9px] font-semibold uppercase tracking-wider text-zinc-200 backdrop-blur-sm">
            <span className={cn("h-2 w-2 rounded-full animate-rec", isTracking ? "bg-red-500" : "bg-zinc-500")} />
            <CameraIcon className="h-3.5 w-3.5 text-emerald-300" />
            {cam} cam · {isTracking ? "543 lm" : "idle"}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={isTracking ? stopTracking : startTracking}
              className={cn(
                "flex items-center gap-1 rounded-md px-2.5 py-1 font-tech text-[9px] font-bold uppercase tracking-wider backdrop-blur-sm transition border",
                isTracking
                  ? "bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30"
                  : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30"
              )}
            >
              {isLoading ? "loading..." : isTracking ? "stop camera" : "start camera"}
            </button>
            <button
              onClick={() => setLang((l) => (l === "EN" ? "UR" : "EN"))}
              className="flex items-center gap-1 rounded-md bg-black/45 px-2 py-1 font-tech text-[9px] font-semibold uppercase tracking-wider text-zinc-200 backdrop-blur-sm transition hover:bg-black/60"
            >
              out · <span className={lang === "UR" ? "text-emerald-300" : "text-sky-300"}>{lang}</span>
            </button>
            <button
              onClick={() => setCam((c) => (c === "front" ? "rear" : "front"))}
              className="flex items-center gap-1 rounded-md bg-black/45 p-1.5 text-zinc-200 backdrop-blur-sm transition hover:bg-black/60"
              aria-label="Flip camera"
            >
              <FlipIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* streaming subtitles */}
        <div className="absolute inset-x-0 bottom-0 p-2.5">
          <div className="rounded-xl border border-white/10 bg-black/65 p-3 backdrop-blur-md">
            <div className="mb-1 flex items-center justify-between">
              <SectionLabel icon={<WaveIcon className="h-3 w-3" />}>
                Sign → Text · {engineReady ? "TFLite Active" : "TFLite Loading..."}
              </SectionLabel>
              <span className="font-tech text-[9px] tabular-nums text-emerald-300">
                {words.length} wd
              </span>
            </div>
            <p className="min-h-[2.6em] text-[13px] leading-snug text-zinc-50">
              {text}
              <span
                className={cn(
                  "ml-0.5 inline-block h-3.5 w-[2px] translate-y-[2px] bg-emerald-400",
                  typing ? "animate-pulse" : "opacity-30"
                )}
              />
            </p>
            {predictedGloss && (
              <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between font-tech text-[10px]">
                <span className="text-zinc-500">TFLite Predict:</span>
                <span className="text-emerald-300 font-bold uppercase">
                  {predictedGloss} ({(inferenceConfidence * 100).toFixed(0)}%)
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Typewriter playback & manual selection controls */}
      <div className="mt-3 rounded-2xl border border-white/[0.05] bg-zinc-950/40 p-2.5">
        <div className="flex items-center justify-between mb-2">
          <SectionLabel>Webcam Gesture Stream Controls</SectionLabel>
          <div className="flex items-center gap-1.5">
            <button
              onClick={prevPhrase}
              className="rounded-md bg-white/[0.05] px-2 py-1 font-tech text-[10px] text-zinc-300 hover:bg-white/[0.08]"
              title="Previous phrase"
            >
              PREV
            </button>
            <button
              onClick={togglePause}
              className="rounded-md bg-white/[0.05] px-2.5 py-1 font-tech text-[10px] font-bold text-emerald-300 hover:bg-white/[0.08]"
            >
              {paused ? "PLAY" : "PAUSE"}
            </button>
            <button
              onClick={nextPhrase}
              className="rounded-md bg-white/[0.05] px-2 py-1 font-tech text-[10px] text-zinc-300 hover:bg-white/[0.08]"
              title="Next phrase"
            >
              NEXT
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-1 max-h-24 overflow-y-auto no-scrollbar">
          {signerPhrases.map((phrase, idx) => {
            const isActive = idx === index;
            return (
              <button
                key={idx}
                onClick={() => selectPhrase(idx)}
                className={cn(
                  "w-full text-left rounded-lg px-2.5 py-1 text-[11px] transition truncate",
                  isActive
                    ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                    : "bg-white/[0.02] text-zinc-400 hover:bg-white/[0.04] border border-transparent"
                )}
              >
                {isActive ? "● " : ""} {phrase}
              </button>
            );
          })}
        </div>
      </div>

      {/* broadcast trigger */}
      <button
        onClick={broadcast}
        className={cn(
          "group mt-3 flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl px-4 py-3.5 text-[14px] font-bold transition active:scale-[0.99]",
          broadcasting
            ? "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/40"
            : "bg-gradient-to-b from-emerald-400 to-emerald-600 text-zinc-950 shadow-lg shadow-emerald-500/25 hover:from-emerald-300 hover:to-emerald-500"
        )}
      >
        {broadcasting ? (
          <>
            <Bars />
            <span>Speaking to panel… tap to stop</span>
          </>
        ) : (
          <>
            <SpeakerIcon className="h-5 w-5" strokeWidth={2} />
            <span>Broadcast Audio / Speak</span>
          </>
        )}
        <span
          className={cn(
            "ml-1 rounded-md px-1.5 py-0.5 font-tech text-[10px] font-bold",
            broadcasting ? "bg-emerald-400/15 text-emerald-300" : "bg-zinc-950/15 text-zinc-900/80"
          )}
        >
          TTS · {lang}
        </span>
      </button>

      <div className="mt-2 flex items-center justify-between px-1 font-tech text-[9.5px] uppercase tracking-wider text-zinc-600">
        <span>gloss → phoneme → speech</span>
        <span>latency {latency} ms · {lang === "UR" ? "اردو" : "english"}</span>
      </div>
    </section>
  );
}
