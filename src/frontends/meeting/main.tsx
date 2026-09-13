import "../../index.css";
import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { SignAvatar } from "../../components/SignAvatar";
import { cn } from "../../utils/cn";
import { MicIcon, SpeakerIcon, VideoIcon, RecordIcon, PhoneIcon, HandIcon } from "./icons";

type Turn = {
  who: string;
  tone: "emerald" | "violet" | "sky";
  init: string;
  transcript: string;
  gloss: string[];
  time: string;
  live?: boolean;
};

const TURNS: Turn[] = [
  {
    who: "Dr. Adnan (Chair)",
    tone: "emerald",
    init: "DA",
    transcript: "Let's review the mid-term progress on the accessibility project.",
    gloss: ["REVIEW", "MID-TERM", "PROGRESS", "ACCESSIBILITY", "PROJECT"],
    time: "00:12",
  },
  {
    who: "Maha (Student)",
    tone: "violet",
    init: "MH",
    transcript: "I have completed the sign dataset collection stage. 120 takes recorded.",
    gloss: ["FINISH", "SIGN", "DATA", "COLLECT", "120"],
    time: "00:31",
    live: true,
  },
  {
    who: "Sir Bilal (Supervisor)",
    tone: "sky",
    init: "SB",
    transcript: "Excellent. Training next — target 96% accuracy on-device.",
    gloss: ["GOOD", "TRAIN", "NEXT", "TARGET", "96", "PERCENT"],
    time: "00:44",
  },
];

function Meeting() {
  const [muted, setMuted] = useState(false);
  const [cam, setCam] = useState(true);

  return (
    <div
      className="min-h-screen bg-zinc-950 text-zinc-100"
      style={{
        background:
          "radial-gradient(60% 45% at 85% 0%, rgba(139,92,246,0.09), transparent 60%), radial-gradient(55% 45% at 0% 100%, rgba(16,185,129,0.07), transparent 60%)",
      }}
    >
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.06] bg-zinc-950/80 px-6 py-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 shadow-md shadow-violet-500/20">
            <VideoIcon className="h-4.5 w-4.5 text-white" />
          </span>
          <div>
            <div className="text-[14px] font-black tracking-tight text-zinc-50">
              FYP Weekly Review — Session 11
            </div>
            <div className="font-tech text-[9px] uppercase tracking-[0.18em] text-zinc-500">
              meeting companion · live captions
            </div>
          </div>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 font-tech text-[10px] font-bold uppercase tracking-widest text-emerald-300 ring-1 ring-emerald-500/30">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          3 participants · 00:41
        </span>
      </header>

      <main className="mx-auto grid max-w-[1400px] gap-6 p-6 lg:grid-cols-[1.3fr_0.7fr]">
        {/* signer side */}
        <section className="flex flex-col gap-4">
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-zinc-900/60">
            <div className="absolute inset-x-0 top-4 z-10 flex items-center justify-center">
              <span className="rounded-full border border-white/10 bg-black/70 px-4 py-1.5 font-tech text-[10px] font-bold uppercase tracking-[0.2em] text-green-400">
                signing · MAHA·COMPLETED·SIGN·DATA·COLLECTION…
              </span>
            </div>
            <div className="relative aspect-video">
              <SignAvatar gesture="signing" style={{ width: "100%", height: "100%" }} />
            </div>
            <div className="absolute bottom-3 left-4 flex items-center gap-2 rounded-xl bg-black/60 px-3 py-2 backdrop-blur">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/80 text-[10px] font-black text-white">
                MH
              </span>
              <div>
                <div className="text-[11px] font-bold text-zinc-100">Maha · signing live</div>
                <div className="font-tech text-[8.5px] uppercase tracking-widest text-emerald-400">
                  speaking → sign relay
                </div>
              </div>
            </div>
          </div>

          {/* caption stream */}
          <div className="space-y-2.5">
            {TURNS.map((t, i) => {
              const toneBg =
                t.tone === "emerald"
                  ? "text-emerald-400 bg-emerald-500/10"
                  : t.tone === "violet"
                    ? "text-violet-300 bg-violet-500/10"
                    : "text-sky-300 bg-sky-500/10";
              return (
                <div
                  key={i}
                  className={cn(
                    "rounded-2xl border p-4 transition",
                    t.live
                      ? "border-emerald-500/30 bg-emerald-500/[0.05]"
                      : "border-white/[0.06] bg-white/[0.02]"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className={cn("flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black", toneBg)}>
                      {t.init}
                    </span>
                    <span className="text-[12px] font-bold text-zinc-200">{t.who}</span>
                    {t.live && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-red-500/10 px-1.5 py-0.5 font-tech text-[8px] font-bold uppercase tracking-wider text-red-400 ring-1 ring-red-500/25">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                        live
                      </span>
                    )}
                    <span className="ml-auto font-tech text-[10px] tabular-nums text-zinc-500">{t.time}</span>
                  </div>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-zinc-300">{t.transcript}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {t.gloss.map((g) => (
                      <span
                        key={g}
                        className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 font-tech text-[10px] font-bold tracking-wider text-zinc-300"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* sign back + controls */}
        <section className="flex flex-col gap-4">
          <div className="rounded-3xl border border-white/[0.08] bg-zinc-900/60 p-5">
            <div className="flex items-center justify-between">
              <div className="font-tech text-[9px] uppercase tracking-[0.2em] text-zinc-500">
                sign back · hearing → deaf
              </div>
              <SpeakerIcon className="h-4 w-4 text-violet-400" />
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-zinc-200">
              “Maha, your progress is excellent. Start the training stage and share the chart next
              meeting.”
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {["MAHA", "PROGRESS", "GOOD", "TRAIN", "START", "CHART", "SHARE", "NEXT"].map((g) => (
                <span
                  key={g}
                  className="rounded-lg border border-violet-500/25 bg-violet-500/10 px-2 py-1 font-tech text-[10px] font-bold tracking-wider text-violet-300"
                >
                  {g}
                </span>
              ))}
            </div>
          </div>

          {/* meeting controls */}
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5">
            <div className="font-tech text-[9px] uppercase tracking-[0.2em] text-zinc-500">
              call controls
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <ControlButton
                label={muted ? "Unmute" : "Mute"}
                icon={<MicIcon muted={muted} />}
                active={muted}
                onClick={() => setMuted((m) => !m)}
              />
              <ControlButton
                label={cam ? "Stop cam" : "Start cam"}
                icon={<VideoIcon />}
                active={!cam}
                onClick={() => setCam((c) => !c)}
              />
              <ControlButton label="Sign on" icon={<HandIcon />} active={false} highlighted
                onClick={() => {}}
              />
              <button className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white shadow-lg shadow-red-600/30 transition hover:bg-red-500">
                <PhoneIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/[0.04] p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30">
                <RecordIcon className="h-4 w-4" />
              </span>
              <div>
                <div className="text-[13px] font-bold text-zinc-100">Live transcription active</div>
                <div className="font-tech text-[9px] uppercase tracking-widest text-zinc-500">
                  English + Urdu gloss · on-device
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function ControlButton({
  label,
  icon,
  active,
  highlighted,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  highlighted?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1.5 rounded-2xl border px-4 py-3 transition",
        active
          ? "border-white/10 bg-white/[0.06]"
          : highlighted
            ? "border-emerald-500/40 bg-emerald-500/10"
            : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05]"
      )}
    >
      <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", highlighted ? "text-emerald-300" : "text-zinc-300")}>
        {icon}
      </span>
      <span className="font-tech text-[8.5px] font-bold uppercase tracking-wider text-zinc-400">
        {label}
      </span>
    </button>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Meeting />
  </StrictMode>
);