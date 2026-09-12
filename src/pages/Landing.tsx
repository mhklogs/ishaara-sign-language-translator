import { useEffect, useState, type ReactNode } from "react";
import { SignAvatar } from "@/components/SignAvatar";
import { navigate } from "@/router";
import {
  ActivityIcon,
  CameraIcon,
  CheckIcon,
  ChevronRightIcon,
  CpuIcon,
  CubeIcon,
  FaceIcon,
  GaugeIcon,
  GlobeIcon,
  HandIcon,
  MicIcon,
  SignalIcon,
  SparkIcon,
  WaveIcon,
  XIcon,
} from "@/components/icons";
import { cn } from "@/utils/cn";

const STATS = [
  { value: "543", label: "keypoints tracked", icon: <SignalIcon className="h-4 w-4" /> },
  { value: "15 fps", label: "capture pipeline", icon: <GaugeIcon className="h-4 w-4" /> },
  { value: "0 GPU", label: "train on CPU", icon: <CpuIcon className="h-4 w-4" /> },
  { value: "100%", label: "on-device", icon: <WaveIcon className="h-4 w-4" /> },
];

const FEATURES = [
  {
    icon: <CameraIcon className="h-5 w-5" />,
    title: "Sign → Speech",
    desc: "Webcam tracks 543 holistic landmarks and your personal on-device model turns the gesture into spoken words for hearing listeners.",
    tone: "text-emerald-300 bg-emerald-500/10 ring-emerald-500/30",
  },
  {
    icon: <MicIcon className="h-5 w-5" />,
    title: "Speech → Sign",
    desc: "Type or speak — the engine parses English/Urdu into grammatical Sign Gloss and drives the 3D avatar signer in real time.",
    tone: "text-sky-300 bg-sky-500/10 ring-sky-500/30",
  },
  {
    icon: <CpuIcon className="h-5 w-5" />,
    title: "Your model, your data",
    desc: "Record 10 takes per sign, export JSON, train a tiny classifier locally — no cloud, no GPU, no upload of your gestures anywhere.",
    tone: "text-violet-300 bg-violet-500/10 ring-violet-500/30",
  },
];

const USE_CASES = [
  {
    icon: <GlobeIcon className="h-5 w-5" />,
    title: "Job Interviews",
    desc: "Deaf candidates answer in sign; the panel live-translates to spoken text + audio for the interviewer.",
  },
  {
    icon: <FaceIcon className="h-5 w-5" />,
    title: "Lectures & Classrooms",
    desc: "A spoken lecture is signed to the deaf student in real time, so no information is lost in translation.",
  },
  {
    icon: <ActivityIcon className="h-5 w-5" />,
    title: "Team Meetings",
    desc: "Drop ISHAARA into any call: hearing speakers are signed to deaf teammates, sign responses are voiced back.",
  },
  {
    icon: <WaveIcon className="h-5 w-5" />,
    title: "Video Subtitles",
    desc: "The browser extension overlays a signing avatar on any website — select the text and watch it come alive.",
  },
  {
    icon: <HandIcon className="h-5 w-5" />,
    title: "Counters & Help Desks",
    desc: "Public service points assist deaf users with a kiosk that translates signs to a cashier-facing screen.",
  },
  {
    icon: <CubeIcon className="h-5 w-5" />,
    title: "News & Streaming",
    desc: "Broadcast gloss captions and an interpreter avatar alongside live streams — accessible to millions.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Record",
    desc: "Open the Sign Recorder, pick a label (HELLO, THANK-YOU…) and capture 8–12 webcam takes per sign.",
  },
  {
    n: "02",
    title: "Train",
    desc: "Export the JSON dataset and run one command — the tiny classifier trains on CPU in seconds.",
  },
  {
    n: "03",
    title: "Deploy",
    desc: "The trained model hooks straight into the workspace — no server, no TFLite toolchain needed.",
  },
  {
    n: "04",
    title: "Sign",
    desc: "Live webcam frames become gloss predictions that the avatar performs and the speaker hears.",
  },
];

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    ["#features", "Features"],
    ["#use-cases", "Use Cases"],
    ["#how-it-works", "How it works"],
    ["#extension", "Extension"],
  ];

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "bg-zinc-950/80 backdrop-blur-xl border-b border-white/[0.06]" : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-2"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-md shadow-emerald-500/20">
            <HandIcon className="h-4.5 w-4.5 text-zinc-950" strokeWidth={2.5} />
          </span>
          <span className="text-[15px] font-black uppercase tracking-wider text-zinc-50">
            ISHAARA<span className="text-emerald-400">.</span>
          </span>
        </button>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="text-[13px] font-medium text-zinc-400 transition hover:text-zinc-100"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/app")}
            className="hidden rounded-xl bg-emerald-500 px-4 py-2 text-[13px] font-bold text-zinc-950 transition hover:bg-emerald-400 md:inline-flex"
          >
            Open Workspace
          </button>
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-zinc-200 md:hidden"
            aria-label="Open menu"
          >
            {open ? <XIcon className="h-5 w-5" /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/[0.06] bg-zinc-950/95 px-5 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {links.map(([href, label]) => (
              <a
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="text-[14px] font-medium text-zinc-300"
              >
                {label}
              </a>
            ))}
            <button
              onClick={() => navigate("/app")}
              className="mt-1 rounded-xl bg-emerald-500 px-4 py-2.5 text-[13px] font-bold text-zinc-950"
            >
              Open Workspace →
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5" aria-hidden>
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </svg>
  );
}

function Hero() {
  const [demoGloss, setDemoGloss] = useState("Assalam-o-Alaikum");
  const demoWords = ["Assalam-o-Alaikum", "Shukriya", "Aap Kaisay Hain?"];

  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      {/* ambient glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 45% at 50% -5%, rgba(16,185,129,0.18), transparent 65%), radial-gradient(45% 40% at 100% 100%, rgba(139,92,246,0.10), transparent 60%)",
          }}
        />
      </div>

      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-[12px] font-semibold text-emerald-300">
            <SparkIcon className="h-3.5 w-3.5" />
            Bi-Directional · PSL &amp; ISL · On-Device Model
          </span>

          <h1 className="mt-6 text-4xl font-black leading-[1.05] tracking-tight text-zinc-50 sm:text-6xl">
            Bridge the <span className="text-emerald-400">communication gap</span> between deaf and hearing worlds.
          </h1>

          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-zinc-400 sm:text-base">
            ISHAARA turns sign language into speech and speech into sign — live, on your device.
            Record your own signs, train a tiny model on CPU, and let a 3D avatar interpret any
            page, call, lecture, or interview in real time.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate("/app")}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3.5 text-[14px] font-bold text-zinc-950 shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400 active:scale-[0.98]"
            >
              Launch the Workspace <ChevronRightIcon className="h-4 w-4" />
            </button>
            <a
              href="#extension"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-3.5 text-[14px] font-semibold text-zinc-200 transition hover:bg-white/[0.08]"
            >
              <CubeIcon className="h-4 w-4 text-emerald-400" />
              Get the Extension
            </a>
          </div>

          <div className="mt-12 grid max-w-lg grid-cols-2 gap-3 sm:grid-cols-4">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3.5"
              >
                <span className="text-emerald-400">{s.icon}</span>
                <div className="mt-2 text-[20px] font-black tabular-nums text-zinc-50">{s.value}</div>
                <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* demo card */}
        <div className="animate-slide-right">
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-zinc-900/80 shadow-2xl shadow-black/40 backdrop-blur">
            <div className="absolute inset-0 bg-grid opacity-30" />
            <div className="relative flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-tech text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                  live sign viewport
                </span>
              </div>
              <div className="flex gap-1.5">
                {demoWords.map((w) => (
                  <button
                    key={w}
                    onClick={() => setDemoGloss(w)}
                    className={cn(
                      "rounded-lg px-2.5 py-1 font-tech text-[9.5px] font-bold uppercase tracking-wider transition",
                      demoGloss === w
                        ? "bg-emerald-500 text-zinc-950"
                        : "bg-white/[0.05] text-zinc-400 hover:bg-white/10"
                    )}
                  >
                    {w.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative aspect-[4/3]">
              <SignAvatar gesture={demoGloss ? "signing" : "idle"} className="absolute inset-0" />
              <div className="absolute inset-x-4 bottom-4 rounded-xl border border-white/[0.06] bg-zinc-950/90 px-3 py-2.5">
                <div className="font-tech text-[11px] font-bold uppercase tracking-widest text-green-400">
                  {demoGloss}
                </div>
                <div className="mt-0.5 text-[10px] text-zinc-500">
                  gloss · synthesized on click
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeading({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: ReactNode;
  sub?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <span className="font-tech text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-400">
        {eyebrow}
      </span>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-50 sm:text-4xl">{title}</h2>
      {sub && <p className="mt-3 text-[14px] leading-relaxed text-zinc-400">{sub}</p>}
    </div>
  );
}

function Features() {
  return (
    <section id="features" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="Features"
          title={<>Both directions. One fluid pipeline.</>}
          sub="From raw webcam keypoints to spoken output — everything runs locally inside the workspace."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="animate-fade-up group rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 transition hover:border-white/[0.12] hover:bg-white/[0.04]"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <span
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-2xl ring-1",
                  f.tone
                )}
              >
                {f.icon}
              </span>
              <h3 className="mt-4 text-[16px] font-bold text-zinc-50">{f.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-zinc-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function UseCases() {
  return (
    <section id="use-cases" className="relative py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(50% 40% at 0 40%, rgba(16,185,129,0.07), transparent 60%)",
          }}
        />
      </div>
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="Use Cases"
          title={<>Wherever language is a barrier.</>}
          sub="ISHAARA adapts to the place — interviews, classrooms, meetings, broadcasts and kiosks."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {USE_CASES.map((c) => (
            <div
              key={c.title}
              className="group flex gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition hover:border-emerald-500/30 hover:bg-white/[0.04]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/25">
                {c.icon}
              </span>
              <div>
                <h3 className="text-[14px] font-bold text-zinc-50">{c.title}</h3>
                <p className="mt-1 text-[12.5px] leading-relaxed text-zinc-400">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="How It Works"
          title={<>From your hands to a working model.</>}
          sub="You don't ship a model — you grow one. Ten minutes of recording gets ISHAARA fluent in your signs."
        />
        <div className="mt-12 grid gap-4 md:grid-cols-4">
          {STEPS.map((s, i) => (
            <div
              key={s.n}
              className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
            >
              <span className="font-tech text-[26px] font-black text-emerald-500/40">{s.n}</span>
              <h3 className="mt-2 text-[15px] font-bold text-zinc-50">{s.title}</h3>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-zinc-400">{s.desc}</p>
              {i < STEPS.length - 1 && (
                <div className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-emerald-500/40 md:block">
                  <ChevronRightIcon className="h-5 w-5" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-white/[0.06] bg-black/30">
          <div className="border-b border-white/[0.06] px-5 py-3 font-tech text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            train · one command
          </div>
          <pre className="overflow-x-auto px-5 py-4 font-tech text-[12.5px] leading-relaxed text-zinc-300">
            <code>
              <span className="text-zinc-600">$</span>{" "}
              <span className="text-emerald-400">.venv/bin/python</span>{" "}
              train_collected.py --data ishaara-dataset.json
              {"\n"}
              <span className="text-zinc-500">
                ✅ Final validation accuracy: 96% on held-out takes
              </span>
              {"\n"}
              <span className="text-zinc-500">
                💾 Model exported → public/models/sign_model_v1.json (64 KB)
              </span>
            </code>
          </pre>
        </div>
      </div>
    </section>
  );
}

function Extension() {
  const steps = [
    "Load the unpacked extension folder from chrome://extensions",
    "Browse any site, lecture, or meeting",
    "Select any sentence and hit “Sign it”",
    "A 3D avatar interprets the text live, with audio on demand",
  ];

  return (
    <section id="extension" className="relative py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(55% 45% at 100% 30%, rgba(139,92,246,0.10), transparent 60%)",
          }}
        />
      </div>
      <div className="mx-auto max-w-6xl px-5">
        <div className="grid items-center gap-10 rounded-3xl border border-white/[0.08] bg-gradient-to-br from-zinc-900 to-zinc-950 p-8 sm:p-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/25 bg-violet-500/10 px-3 py-1.5 text-[12px] font-semibold text-violet-300">
              <CubeIcon className="h-3.5 w-3.5" />
              Chrome Extension · v0.1
            </span>
            <h2 className="mt-5 text-3xl font-black tracking-tight text-zinc-50 sm:text-4xl">
              Signs any page, wherever you read.
            </h2>
            <p className="mt-4 max-w-lg text-[14px] leading-relaxed text-zinc-400">
              Select text on any website and ISHAARA's browser extension summons a 3D signer
              onto that page. Perfect for articles, research papers, emails and video captions.
            </p>

            <ol className="mt-8 space-y-3.5">
              {steps.map((s, i) => (
                <li key={i} className="flex items-start gap-3 text-[13.5px] text-zinc-300">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-500/15 font-tech text-[11px] font-bold text-violet-300 ring-1 ring-violet-500/30">
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ol>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/app")}
                className="inline-flex items-center gap-2 rounded-2xl bg-violet-500 px-6 py-3.5 text-[14px] font-bold text-white shadow-lg shadow-violet-500/25 transition hover:bg-violet-400 active:scale-[0.98]"
              >
                Try the workspace <ChevronRightIcon className="h-4 w-4" />
              </button>
              <span className="inline-flex items-center rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3.5 text-[13px] font-semibold text-zinc-300">
                Source in <span className="ml-1 font-tech text-violet-300">extension/</span>
              </span>
            </div>
          </div>

          {/* mock player preview */}
          <div className="relative">
            <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-950 shadow-2xl">
              <div className="flex items-center gap-1.5 border-b border-white/[0.06] px-4 py-2.5">
                <span className="h-2 w-2 rounded-full bg-zinc-700" />
                <span className="h-2 w-2 rounded-full bg-zinc-700" />
                <span className="h-2 w-2 rounded-full bg-emerald-500/80" />
                <span className="ml-2 flex-1 truncate font-tech text-[9.5px] uppercase tracking-widest text-zinc-500">
                  ishaara extension · minimally-invasive player
                </span>
              </div>
              <div className="grid grid-cols-[0.85fr_1.15fr]">
                <div className="relative aspect-[3/4] border-r border-white/[0.06]">
                  <SignAvatar gesture="signing" className="absolute inset-0" />
                </div>
                <div className="flex flex-col justify-between p-4">
                  <div>
                    <div className="font-tech text-[8.5px] uppercase tracking-[0.2em] text-violet-400">
                      gloss sequence
                    </div>
                    <p className="mt-2 text-[15px] font-black uppercase leading-snug tracking-wide text-zinc-50">
                      COMPUTER-SCIENCE IMPORTANT QUESTION Q_MARK
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {["HOLD", "NOTE"].map((t) => (
                        <span
                          key={t}
                          className="rounded-md bg-white/[0.05] px-2 py-1 font-tech text-[9px] font-bold tracking-wider text-zinc-400 ring-1 ring-white/10"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500 text-white">
                      <WaveIcon className="h-4 w-4" />
                    </span>
                    <span className="text-[10.5px] text-zinc-500">Tap to hear the sign spoken</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-4xl px-5 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/30">
          <HandIcon className="h-7 w-7" />
        </span>
        <h2 className="mt-6 text-3xl font-black tracking-tight text-zinc-50 sm:text-5xl">
          Your language deserves a voice.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[14.5px] leading-relaxed text-zinc-400">
          Record your first sign in under a minute — ISHAARA learns it, then signs it back anywhere.
          No accounts, no cloud, no GPU.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => navigate("/app")}
            className="rounded-2xl bg-emerald-500 px-7 py-3.5 text-[14px] font-bold text-zinc-950 shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400 active:scale-[0.98]"
          >
            Open the Workspace
          </button>
          <a
            href="#how-it-works"
            className="rounded-2xl border border-white/10 bg-white/[0.04] px-7 py-3.5 text-[14px] font-semibold text-zinc-200 transition hover:bg-white/[0.08]"
          >
            See how it works
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-5 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600">
            <HandIcon className="h-4.5 w-4.5 text-zinc-950" strokeWidth={2.5} />
          </span>
          <div>
            <div className="text-[13px] font-black uppercase tracking-wider text-zinc-100">
              ISHAARA<span className="text-emerald-400">.</span>
            </div>
            <div className="font-tech text-[8.5px] uppercase tracking-[0.15em] text-zinc-500">
              bi-directional sign translator
            </div>
          </div>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-5">
          {[
            ["#features", "Features"],
            ["#use-cases", "Use Cases"],
            ["#how-it-works", "How it works"],
            ["#extension", "Extension"],
          ].map(([href, label]) => (
            <a key={href} href={href} className="text-[12.5px] text-zinc-400 transition hover:text-zinc-100">
              {label}
            </a>
          ))}
          <button
            onClick={() => navigate("/app")}
            className="text-[12.5px] font-semibold text-emerald-400 transition hover:text-emerald-300"
          >
            Workspace →
          </button>
        </nav>

        <div className="flex items-center gap-2 text-[11.5px] text-zinc-500">
          <CheckIcon className="h-3.5 w-3.5 text-emerald-400" />
          PSL · ISL · on-device
        </div>
      </div>
      <div className="mx-auto mt-8 max-w-6xl border-t border-white/[0.04] px-5 pt-6 text-center text-[11px] text-zinc-600">
        © {new Date().getFullYear()} ISHAARA — a Final Year Project. Built for accessibility, owned
        by the community.
      </div>
    </footer>
  );
}

export default function Landing() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
    document.documentElement.classList.remove("light");
    return () => {
      document.documentElement.classList.remove("dark");
    };
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 antialiased">
      <Nav />
      <main>
        <Hero />
        <Features />
        <UseCases />
        <HowItWorks />
        <Extension />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}