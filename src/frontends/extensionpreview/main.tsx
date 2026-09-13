import "../../index.css";
import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { SignAvatar } from "../../components/SignAvatar";
import { cn } from "../../utils/cn";
import { CopyIcon, CloseIcon, HandIcon, LockIcon, SpeakIcon } from "./icons";

const GLOSS = ["COMPUTER-SCIENCE", "HIGH-VALUE", "CURRICULUM", "ALL-UNIVERSITIES", "QUESTION", "MARK"];

function ExtensionPreview() {
  const [speaking, setSpeaking] = useState(false);
  const [selected, setSelected] = useState(false);

  const speak = () => {
    setSpeaking((s) => {
      if (s) window.speechSynthesis?.cancel();
      return !s;
    });
    if (!speaking) {
      const u = new SpeechSynthesisUtterance(GLOSS.join(" "));
      u.rate = 0.95;
      u.onend = () => setSpeaking(false);
      window.speechSynthesis?.speak(u);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900">
      {/* browser chrome */}
      <div className="flex items-center gap-3 border-b border-zinc-200 bg-white px-5 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="h-3 w-3 rounded-full bg-amber-400" />
          <span className="h-3 w-3 rounded-full bg-emerald-400" />
        </div>
        <div className="flex flex-1 items-center gap-2 rounded-lg bg-zinc-100 px-3 py-1.5">
          <LockIcon className="h-3.5 w-3.5 text-emerald-600" />
          <span className="font-tech text-[11px] text-zinc-600">ishaara.edu.pk/news/proposal</span>
        </div>
        <span className="rounded-md bg-violet-500 px-2.5 py-1 font-tech text-[9px] font-bold uppercase tracking-wider text-white">
          ishaara ext · active
        </span>
      </div>

      {/* article viewport */}
      <div className="relative mx-auto max-w-[1100px] overflow-hidden">
        <div className="grid grid-cols-[1fr_360px]">
          {/* article */}
          <article className="mx-auto max-w-[620px] px-8 py-12">
            <div className="font-tech text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">
              academia · national curriculum
            </div>
            <h1 className="mt-4 font-serif text-[34px] font-semibold leading-tight tracking-tight">
              New Computer Science Course Work Approved For Universities
            </h1>
            <div className="mt-4 flex items-center gap-3 text-[12px] text-zinc-500">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 font-black text-zinc-700">
                KA
              </span>
              <div>
                <div className="font-semibold text-zinc-800">By Khubaib Ahmed · Education Desk</div>
                <div>September 12, 2026 · 4 min read</div>
              </div>
            </div>

            <p className="mt-6 text-[15px] leading-[1.7] text-zinc-600">
              The Higher Education Commission has approved a new computer science curriculum that
              will be introduced across all public universities from the next session. The revised
              syllabus places a strong emphasis on AI, accessibility and human-computer interaction.
            </p>
            <p className="mt-4 text-[15px] leading-[1.7] text-zinc-600">
              Officials said the course was finalised after two years of consultation with industry
              experts and university faculty. “This is a high-value milestone for our education
              system,” a spokesperson told reporters.
            </p>

            <div
              onMouseUp={() => setSelected(true)}
              className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 transition"
            >
              <div className="font-tech text-[9px] uppercase tracking-[0.2em] text-zinc-400">
                selected text
              </div>
              <p className={cn("mt-2 text-[15px] leading-[1.7]", selected ? "selection-like text-emerald-800" : "text-zinc-700")}>
                Computer Science is now an important subject — every question stands as an
                examination question across all universities.
              </p>
            </div>
          </article>

          {/* extension player panel */}
          <aside className="relative h-[calc(100vh-46px)] border-l border-zinc-200 bg-zinc-50">
            <div className="flex h-full flex-col">
              <div className="flex items-center gap-3 border-b border-zinc-200 bg-white px-4 py-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 text-zinc-50">
                  <HandIcon className="h-4 w-4" />
                </span>
                <div>
                  <div className="font-tech text-[10px] font-black uppercase tracking-[0.18em] text-zinc-900">
                    ISHAARA<span className="text-emerald-600">.</span>
                  </div>
                  <div className="font-tech text-[8px] uppercase tracking-[0.15em] text-zinc-500">
                    sign any page
                  </div>
                </div>
                <span className="flex-1" />
                <button className="grid h-8 w-8 place-items-center rounded-lg bg-zinc-100 text-zinc-500" title="Copy gloss">
                  <CopyIcon className="h-4 w-4" />
                </button>
                <button className="grid h-8 w-8 place-items-center rounded-lg bg-zinc-100 text-zinc-500" title="Close">
                  <CloseIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="relative flex-1">
                <SignAvatar gesture="signing" style={{ width: "100%", height: "100%" }} />
                <div className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full border border-zinc-200 bg-white px-3 py-1 font-tech text-[9px] font-bold uppercase tracking-[0.15em] text-emerald-700">
                  <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 align-middle animate-pulse" />
                  signing
                </div>
              </div>

              <div className="border-t border-zinc-200 bg-white p-4">
                <div className="flex flex-wrap gap-1.5">
                  {GLOSS.map((g) => (
                    <span
                      key={g}
                      className="rounded-lg border border-violet-200 bg-violet-50 px-2 py-1 font-tech text-[10px] font-bold tracking-wider text-violet-700"
                    >
                      {g}
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={speak}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[12px] font-bold transition",
                      speaking ? "bg-zinc-100 text-zinc-600" : "bg-violet-600 text-white hover:bg-violet-500"
                    )}
                  >
                    <SpeakIcon className="h-4 w-4" />
                    {speaking ? "Stop" : "Speak gloss"}
                  </button>
                  <span className="font-tech text-[9px] uppercase tracking-widest text-zinc-400">
                    on-device · no cloud
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* floating bubble */}
        <div className="fixed bottom-5 left-5 z-20 flex items-center gap-2 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 px-5 py-3 font-bold text-zinc-950 shadow-xl shadow-emerald-600/30">
          ✋ Sign it
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ExtensionPreview />
  </StrictMode>
);