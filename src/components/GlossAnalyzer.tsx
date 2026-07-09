import { ActivityIcon, ChevronRightIcon, WaveIcon } from "./icons";
import type { InterviewItem } from "@/data/samples";
import { cn } from "@/utils/cn";

const fmt = (t: string) => (t === "Q_MARK" ? "?" : t.replace(/-/g, " "));

export function GlossAnalyzer({
  item,
  spoken,
  revealed,
  active,
}: {
  item: InterviewItem | null;
  spoken: string;
  revealed: number;
  active: boolean;
}) {
  const glosses = item?.glosses ?? [];
  const shown = glosses.slice(0, revealed);

  return (
    <div className="flex flex-col gap-2.5 rounded-2xl border border-white/[0.07] bg-zinc-900/60 p-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10 text-violet-300 ring-1 ring-violet-500/30">
            <WaveIcon className="h-4 w-4" />
          </span>
          <div>
            <div className="text-[12.5px] font-semibold text-zinc-100">Sign Gloss Syntax Analyzer</div>
            <div className="font-tech text-[9px] uppercase tracking-wider text-zinc-500">
              NLP · tokenize · reorder
            </div>
          </div>
        </div>
        <span
          className={cn(
            "flex items-center gap-1 rounded-full px-2 py-0.5 font-tech text-[9px] uppercase tracking-wider",
            active ? "bg-red-500/15 text-red-300 ring-1 ring-red-500/30" : "bg-white/[0.04] text-zinc-500"
          )}
        >
          <ActivityIcon className={cn("h-3 w-3", active && "animate-pulse")} />
          {active ? "parsing" : "idle"}
        </span>
      </div>

      {/* spoken input */}
      <div className="rounded-xl border border-white/[0.06] bg-black/30 p-2.5">
        <div className="mb-1 flex items-center gap-1.5 font-tech text-[9px] uppercase tracking-wider text-zinc-500">
          <span>Input</span>
          <span className="rounded bg-sky-500/15 px-1 text-sky-300 ring-1 ring-sky-500/20">
            {item ? (item.source === "UR" ? "Urdu" : "English") : "—"}
          </span>
          <span className="text-zinc-600">spoken syntax</span>
        </div>
        <p className="min-h-[2.4em] font-tech text-[11.5px] leading-relaxed text-zinc-300">
          {active || spoken ? (
            <>
              <span className="text-zinc-500">“</span>
              {spoken}
              <span className="ml-0.5 inline-block h-3 w-[2px] -translate-y-[1px] animate-pulse bg-emerald-400 align-middle" />
              <span className="text-zinc-500">”</span>
            </>
          ) : (
            <span className="text-zinc-600">Awaiting interviewer audio…</span>
          )}
        </p>
      </div>

      {/* reorder arrow */}
      <div className="flex items-center justify-center gap-2 py-0.5">
        <span className="font-tech text-[8.5px] uppercase tracking-widest text-zinc-600">
          SVO split
        </span>
        <ChevronRightIcon className="h-3.5 w-3.5 text-emerald-400/70" />
        <span className="font-tech text-[8.5px] uppercase tracking-widest text-emerald-400/80">
          SOV gloss stream
        </span>
      </div>

      {/* gloss tokens */}
      <div className="flex min-h-[3.2rem] flex-wrap content-start gap-1.5">
        {shown.length === 0 ? (
          <div className="flex w-full items-center justify-center gap-2 py-3 text-zinc-600">
            <span className="font-tech text-[10px] uppercase tracking-wider">
              {active ? "segmenting phonemes…" : "no tokens"}
            </span>
          </div>
        ) : (
          shown.map((g, i) => (
            <span
              key={`${g}-${i}`}
              className="animate-token inline-flex items-center gap-1 rounded-lg border border-emerald-500/25 bg-emerald-500/[0.08] px-2 py-1 font-tech text-[11px] font-semibold text-emerald-200"
            >
              <span className="text-[8px] text-emerald-500/70">{String(i + 1).padStart(2, "0")}</span>
              {fmt(g).toUpperCase()}
            </span>
          ))
        )}
      </div>

      {/* footer stats */}
      <div className="mt-0.5 flex items-center justify-between border-t border-white/[0.06] pt-2 font-tech text-[9px] uppercase tracking-wider text-zinc-500">
        <span>
          tokens <span className="text-zinc-300">{shown.length}</span>/{glosses.length}
        </span>
        <span className="hidden xs:inline">grammar · subject–object–verb</span>
        <span>
          acc{" "}
          <span className="text-emerald-300">{active ? "98.7%" : "—"}</span>
        </span>
      </div>
    </div>
  );
}
