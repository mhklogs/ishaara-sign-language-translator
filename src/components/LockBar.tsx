import { BookIcon, LockIcon, LockOpenIcon } from "./icons";
import { StatusDot } from "./ui";
import { cn } from "@/utils/cn";

export function LockBar({
  locked,
  onToggleLock,
  onOpenGlossary,
  loadedCount,
}: {
  locked: boolean;
  onToggleLock: () => void;
  onOpenGlossary: () => void;
  loadedCount: number;
}) {
  return (
    <div className="sticky bottom-0 z-40 border-t border-white/[0.07] bg-zinc-950/85 px-3 py-2.5 backdrop-blur-xl sm:px-4">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
      <div className="mx-auto mt-2.5 flex w-full max-w-6xl items-stretch gap-2.5">
        {/* lock toggle */}
        <button
          onClick={onToggleLock}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-2xl px-3 py-3 text-[12.5px] font-bold transition active:scale-[0.99]",
            locked
              ? "bg-gradient-to-b from-emerald-400 to-emerald-600 text-zinc-950 shadow-lg shadow-emerald-500/25"
              : "bg-white/[0.05] text-zinc-100 ring-1 ring-white/10 hover:bg-white/[0.08]"
          )}
        >
          {locked ? <LockIcon className="h-4 w-4" strokeWidth={2} /> : <LockOpenIcon className="h-4 w-4" strokeWidth={2} />}
          <span className="leading-tight">
            {locked ? "Locked — tap to unlock" : "Lock Presentation Mode"}
          </span>
        </button>

        {/* status chip (center) */}
        <div className="hidden items-center gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-3 sm:flex">
          <StatusDot tone={locked ? "emerald" : "sky"} pulse={locked} />
          <div className="leading-tight">
            <div className="text-[11px] font-semibold text-zinc-200">
              {locked ? "Presentation Locked" : "Unlocked"}
            </div>
            <div className="font-tech text-[8.5px] uppercase tracking-wider text-zinc-500">
              {locked ? "touches guarded" : "live editing"}
            </div>
          </div>
        </div>

        {/* glossary trigger */}
        <button
          onClick={onOpenGlossary}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white/[0.05] px-3 py-3 text-[12.5px] font-bold text-zinc-100 ring-1 ring-white/10 transition hover:bg-white/[0.08] active:scale-[0.99]"
        >
          <BookIcon className="h-4 w-4 text-emerald-300" strokeWidth={2} />
          <span className="leading-tight">Vocabulary Glossary</span>
          {loadedCount > 0 && (
            <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 font-tech text-[10px] font-bold text-emerald-300">
              {loadedCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
