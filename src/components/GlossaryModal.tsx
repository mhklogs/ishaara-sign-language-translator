import { useEffect, useState } from "react";
import type { GlossaryToken } from "@/data/samples";
import { BookIcon, CheckIcon, PlusIcon, SparkIcon, XIcon } from "./icons";
import { cn } from "@/utils/cn";

const catColor: Record<string, string> = {
  Concept: "text-violet-300 bg-violet-500/10 ring-violet-500/30",
  Database: "text-sky-300 bg-sky-500/10 ring-sky-500/30",
  Backend: "text-emerald-300 bg-emerald-500/10 ring-emerald-500/30",
  Frontend: "text-cyan-300 bg-cyan-500/10 ring-cyan-500/30",
  Testing: "text-amber-300 bg-amber-500/10 ring-amber-500/30",
  Ops: "text-rose-300 bg-rose-500/10 ring-rose-500/30",
  Language: "text-teal-300 bg-teal-500/10 ring-teal-500/30",
  Custom: "text-fuchsia-300 bg-fuchsia-500/10 ring-fuchsia-500/30",
};

function Toggle({ on }: { on: boolean }) {
  return (
    <span
      className={cn(
        "relative h-5 w-9 shrink-0 rounded-full transition-colors",
        on ? "bg-emerald-500" : "bg-zinc-700"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all",
          on ? "left-[18px]" : "left-0.5"
        )}
      />
    </span>
  );
}

export function GlossaryModal({
  open,
  onClose,
  tokens,
  loaded,
  onToggle,
  onAddCustom,
}: {
  open: boolean;
  onClose: () => void;
  tokens: GlossaryToken[];
  loaded: Set<string>;
  onToggle: (token: string) => void;
  onAddCustom: (token: string, full: string) => void;
}) {
  const [q, setQ] = useState("");
  const [custom, setCustom] = useState("");

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  if (!open) return null;

  const filtered = tokens.filter(
    (t) =>
      t.token.toLowerCase().includes(q.toLowerCase()) ||
      t.full.toLowerCase().includes(q.toLowerCase())
  );

  const add = () => {
    const v = custom.trim();
    if (!v) return;
    onAddCustom(v, "Custom token");
    setCustom("");
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-up"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[88vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-zinc-900 shadow-2xl sm:rounded-3xl animate-fade-up">
        {/* header */}
        <div className="flex items-start gap-3 border-b border-white/[0.07] p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/30">
            <BookIcon className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-[15px] font-semibold text-zinc-50">Technical Vocabulary Glossary</h3>
            <p className="text-[11.5px] text-zinc-400">
              Pre-load tokens &amp; acronyms to boost translation accuracy.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-white/5 hover:text-zinc-100"
            aria-label="Close"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* loaded summary */}
        <div className="flex items-center justify-between gap-2 px-4 py-2.5">
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 ring-1 ring-emerald-500/30">
            <SparkIcon className="h-3.5 w-3.5" />
            {loaded.size} token{loaded.size === 1 ? "" : "s"} loaded
          </span>
          <span className="font-tech text-[10px] uppercase tracking-wider text-zinc-500">
            recognition boost +
            {Math.min(12, loaded.size * 2)}%
          </span>
        </div>

        {/* search + add */}
        <div className="flex gap-2 px-4 pb-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search tokens…"
            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-[13px] text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500/40 focus:outline-none"
          />
        </div>
        <div className="flex gap-2 px-4 pb-3">
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Add custom token (e.g. K8s)"
            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-[13px] text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500/40 focus:outline-none"
          />
          <button
            onClick={add}
            className="flex items-center gap-1 rounded-xl bg-emerald-500 px-3 py-2 text-[13px] font-semibold text-zinc-950 transition hover:bg-emerald-400"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        </div>

        {/* list */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="flex flex-col gap-1.5">
            {filtered.map((t) => {
              const on = loaded.has(t.token);
              return (
                <button
                  key={t.token}
                  onClick={() => onToggle(t.token)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition",
                    on
                      ? "border-emerald-500/30 bg-emerald-500/[0.07]"
                      : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-9 min-w-[3rem] items-center justify-center rounded-lg px-2 font-tech text-[12px] font-bold",
                      on ? "bg-emerald-500/15 text-emerald-200" : "bg-white/[0.04] text-zinc-300"
                    )}
                  >
                    {t.token}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-medium text-zinc-100">{t.full}</div>
                    <span
                      className={cn(
                        "mt-0.5 inline-block rounded px-1.5 py-0.5 font-tech text-[8.5px] uppercase tracking-wider ring-1",
                        catColor[t.category] ?? catColor.Custom
                      )}
                    >
                      {t.category}
                    </span>
                  </div>
                  <Toggle on={on} />
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div className="py-8 text-center text-[12px] text-zinc-500">No tokens match “{q}”.</div>
            )}
          </div>
        </div>

        {/* footer */}
        <div className="flex items-center justify-between border-t border-white/[0.07] p-3">
          <span className="flex items-center gap-1.5 text-[11px] text-zinc-500">
            <CheckIcon className="h-4 w-4 text-emerald-400" />
            Loaded tokens persist for this session
          </span>
          <button
            onClick={onClose}
            className="rounded-xl bg-white/[0.06] px-4 py-2 text-[13px] font-semibold text-zinc-100 transition hover:bg-white/10"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
