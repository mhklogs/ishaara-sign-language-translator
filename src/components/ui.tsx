import type { ReactNode } from "react";
import { cn } from "@/utils/cn";
import { HandIcon } from "./icons";

export const toneMap: Record<
  string,
  { text: string; bg: string; ring: string; dot: string }
> = {
  emerald: {
    text: "text-emerald-300",
    bg: "bg-emerald-500/10",
    ring: "ring-emerald-500/30",
    dot: "bg-emerald-400",
  },
  sky: {
    text: "text-sky-300",
    bg: "bg-sky-500/10",
    ring: "ring-sky-500/30",
    dot: "bg-sky-400",
  },
  violet: {
    text: "text-violet-300",
    bg: "bg-violet-500/10",
    ring: "ring-violet-500/30",
    dot: "bg-violet-400",
  },
  red: {
    text: "text-red-300",
    bg: "bg-red-500/10",
    ring: "ring-red-500/30",
    dot: "bg-red-400",
  },
  amber: {
    text: "text-amber-300",
    bg: "bg-amber-500/10",
    ring: "ring-amber-500/30",
    dot: "bg-amber-400",
  },
};

export function StatusDot({
  tone = "emerald",
  className,
  pulse = true,
}: {
  tone?: keyof typeof toneMap;
  className?: string;
  pulse?: boolean;
}) {
  return (
    <span className={cn("relative flex h-2.5 w-2.5", className)}>
      {pulse && (
        <span
          className={cn(
            "absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping",
            toneMap[tone].dot
          )}
        />
      )}
      <span className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", toneMap[tone].dot)} />
    </span>
  );
}

export function MetricBadge({
  icon,
  label,
  value,
  hint,
  tone = "emerald",
}: {
  icon?: ReactNode;
  label: string;
  value: string;
  hint?: string;
  tone?: keyof typeof toneMap;
}) {
  const t = toneMap[tone];
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2">
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1",
          t.bg,
          t.text,
          t.ring
        )}
      >
        {icon}
      </span>
      <div className="min-w-0 leading-tight">
        <div className="flex items-center gap-1.5">
          <span className="font-tech text-[9px] uppercase tracking-[0.14em] text-zinc-500">
            {label}
          </span>
          {tone === "emerald" && <StatusDot tone="emerald" className="h-1.5 w-1.5" />}
        </div>
        <div className="truncate text-[12px] font-semibold text-zinc-100">{value}</div>
        {hint && <div className="truncate font-tech text-[10px] text-zinc-500">{hint}</div>}
      </div>
    </div>
  );
}

export function Pill({
  icon,
  children,
  tone = "zinc",
  className,
}: {
  icon?: ReactNode;
  children: ReactNode;
  tone?: keyof typeof toneMap | "zinc";
  className?: string;
}) {
  const t = tone === "zinc" ? null : toneMap[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium",
        t
          ? cn(t.bg, t.text, "border-transparent ring-1", t.ring)
          : "border-white/10 bg-white/[0.04] text-zinc-300",
        className
      )}
    >
      {icon}
      {children}
    </span>
  );
}

export function PanelHeader({
  icon,
  eyebrow,
  title,
  subtitle,
  right,
  tone = "emerald",
}: {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  subtitle: string;
  right?: ReactNode;
  tone?: keyof typeof toneMap;
}) {
  const t = toneMap[tone];
  return (
    <div className="flex items-start gap-3">
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1",
          t.bg,
          t.text,
          t.ring
        )}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-tech text-[10px] uppercase tracking-[0.16em] text-zinc-500">
          {eyebrow}
        </div>
        <h2 className="text-[15px] font-semibold leading-tight text-zinc-50">{title}</h2>
        <p className="text-[11.5px] text-zinc-400">{subtitle}</p>
      </div>
      {right}
    </div>
  );
}

export function SectionLabel({
  children,
  icon,
}: {
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5 text-zinc-400">
      {icon && <span className="text-zinc-500">{icon}</span>}
      <span className="font-tech text-[10px] uppercase tracking-[0.18em]">{children}</span>
    </div>
  );
}

export function HandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 w-5 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30",
        className
      )}
    >
      <HandIcon className="h-3.5 w-3.5" />
    </span>
  );
}
