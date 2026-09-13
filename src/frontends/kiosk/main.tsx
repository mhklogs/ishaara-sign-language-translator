import "../../index.css";
import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { SignAvatar } from "../../components/SignAvatar";
import { cn } from "../../utils/cn";
import {
  CheckIcon,
  HandIcon,
  MicIcon,
  SignalIcon,
  SpeakerIcon,
  WaveIcon,
} from "../../components/icons";

const CATEGORIES = [
  { id: 1, label: "ID CARD", desc: "lost / new / renewal", active: true },
  { id: 2, label: "SIM ACTIVATION", desc: "mobile & data", active: false },
  { id: 3, label: "SCHOLARSHIP", desc: "application & status", active: false },
  { id: 4, label: "ONLINE PORTAL", desc: "login & navigation", active: false },
];

const INTERPRETED = ["ID-CARD", "LOST", "REPORT"];

function Kiosk() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="min-h-screen bg-zinc-950 text-zinc-100"
      style={{
        background:
          "radial-gradient(70% 50% at 15% 0%, rgba(16,185,129,0.10), transparent 60%), radial-gradient(60% 50% at 100% 100%, rgba(139,92,246,0.08), transparent 60%)",
      }}
    >
      {/* header */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.06] bg-zinc-950/80 px-6 py-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-md shadow-emerald-500/20">
            <HandIcon className="h-5 w-5 text-zinc-950" strokeWidth={2.5} />
          </span>
          <div>
            <div className="font-tech text-[13px] font-black uppercase tracking-[0.2em] text-zinc-50">
              ISHAARA<span className="text-emerald-400">.</span>
            </div>
            <div className="font-tech text-[9px] uppercase tracking-[0.2em] text-zinc-500">
              counter assistant · public kiosk
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 font-tech text-[10px] font-bold uppercase tracking-widest text-emerald-300">
            <SignalIcon className="h-3.5 w-3.5" />
            kiosk online
          </span>
          <span className="font-tech text-sm tabular-nums text-zinc-300">
            {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1400px] gap-6 p-6 lg:grid-cols-[1.15fr_0.85fr]">
        {/* visitor side */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-black tracking-tight text-zinc-50 sm:text-2xl">
              Deaf Visitor
            </h1>
            <span className="inline-flex items-center gap-2 rounded-full bg-red-500/10 px-3 py-1.5 font-tech text-[10px] font-bold uppercase tracking-widest text-red-400 ring-1 ring-red-500/30">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              LIVE SIGN
            </span>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-zinc-900/60">
            <div
              className="absolute inset-0"
              style={{ background: "radial-gradient(60% 60% at 50% 40%, rgba(16,185,129,0.08), transparent 70%)" }}
            />
            <div className="relative grid grid-cols-[1fr_1fr] items-center p-6">
              <div className="relative mx-auto aspect-[3/4] w-full max-w-[260px]">
                <SignAvatar gesture="signing" style={{ width: "100%", height: "100%" }} />
                <div className="absolute inset-x-0 bottom-0 rounded-xl border border-white/[0.06] bg-black/70 px-3 py-2 text-center font-tech text-[11px] font-bold uppercase tracking-widest text-green-400">
                  signing · ASSALAM-O-ALAIKUM
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="font-tech text-[9px] uppercase tracking-[0.2em] text-zinc-500">
                    interpreted request
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {INTERPRETED.map((w) => (
                      <span
                        key={w}
                        className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 font-tech text-sm font-bold tracking-wider text-emerald-300"
                      >
                        {w}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
                  <div className="text-[16px] font-bold text-zinc-50">
                    “My ID card is lost — I need a report please.”
                  </div>
                  <div className="mt-1 text-[12px] text-zinc-500">
                    shown to staff as text + spoken aloud
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <SpeakerIcon className="h-4 w-4 text-emerald-400" />
                    <span className="font-tech text-[10px] uppercase tracking-widest text-zinc-400">
                      spoken to hearing officer
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/10 px-2.5 py-1.5 font-tech text-[9px] font-bold uppercase tracking-wider text-red-400 ring-1 ring-red-500/25">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                    REC
                  </span>
                  <span className="shared-inline inline-flex items-center gap-1.5 rounded-lg bg-white/[0.05] px-2.5 py-1.5 font-tech text-[9px] font-bold uppercase tracking-wider text-zinc-400 ring-1 ring-white/10">
                    543 keypoints · 15 fps
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* staff side */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black tracking-tight text-zinc-50">Staff Response</h2>
            <MicIcon className="h-5 w-5 text-zinc-500" />
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-3xl border border-white/[0.08] bg-zinc-900/60 p-5">
              <div className="font-tech text-[9px] uppercase tracking-[0.2em] text-zinc-500">
                reply typed / spoken by officer
              </div>
              <p className="mt-2 text-[15px] font-semibold leading-relaxed text-zinc-100">
                “Sure — please fill this form, go to Desk 2, and bring your CNIC. We will issue the
                report in 10 minutes.”
              </p>
            </div>

            <div className="rounded-3xl border border-white/[0.08] bg-zinc-900/60 p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="font-tech text-[9px] uppercase tracking-[0.2em] text-zinc-500">
                  signed back to visitor
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 px-2.5 py-1 font-tech text-[9px] font-bold uppercase tracking-wider text-violet-300 ring-1 ring-violet-500/30">
                  <WaveIcon className="h-3 w-3" />
                  speech → sign
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {["FORM", "FILL", "DESK-2", "CNIC", "10-MINUTES", "REPORT", "OK"].map((w) => (
                  <span
                    key={w}
                    className="rounded-xl border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 font-tech text-sm font-bold tracking-wider text-violet-300"
                  >
                    {w}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-br from-zinc-900/60 to-zinc-950 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30">
                    <CheckIcon className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-[14px] font-bold text-zinc-50">Request resolved</div>
                    <div className="font-tech text-[9px] uppercase tracking-widest text-zinc-500">
                      00:42 · end-to-end · on-device
                    </div>
                  </div>
                </div>
                <span className="rounded-lg bg-emerald-500/10 px-2.5 py-1 font-tech text-[9px] font-bold uppercase tracking-wider text-emerald-300 ring-1 ring-emerald-500/25">
                  helped ✓
                </span>
              </div>
            </div>
          </div>

          {/* category quick-select */}
          <div className="mt-auto rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5">
            <div className="font-tech text-[9px] uppercase tracking-[0.2em] text-zinc-500">
              quick-select topics
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  className={cn(
                    "rounded-2xl border px-4 py-3 text-left transition",
                    c.active
                      ? "border-emerald-500/40 bg-emerald-500/10"
                      : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
                  )}
                >
                  <div
                    className={cn(
                      "font-tech text-[12px] font-bold tracking-wider",
                      c.active ? "text-emerald-300" : "text-zinc-300"
                    )}
                  >
                    {c.label}
                  </div>
                  <div className="text-[10px] text-zinc-500">{c.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Kiosk />
  </StrictMode>
);