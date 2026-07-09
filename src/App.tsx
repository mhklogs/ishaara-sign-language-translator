import { useCallback, useState } from "react";
import { glossaryTokens, type GlossaryToken } from "@/data/samples";
import { SystemHeader } from "@/components/SystemHeader";
import { SignToSpeechPanel } from "@/components/SignToSpeechPanel";
import { SpeechToSignPanel } from "@/components/SpeechToSignPanel";
import { LockBar } from "@/components/LockBar";
import { GlossaryModal } from "@/components/GlossaryModal";
import { LockIcon } from "@/components/icons";
import { cn } from "@/utils/cn";

export default function App() {
  const [locked, setLocked] = useState(false);
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [allTokens, setAllTokens] = useState<GlossaryToken[]>(glossaryTokens);
  const [loaded, setLoaded] = useState<Set<string>>(new Set(["SQL", "AI", "QA Testing"]));

  const [dialect, setDialect] = useState("Pakistani Sign Language");
  const [proficiency, setProficiency] = useState("Expert");
  const [targetLanguage, setTargetLanguage] = useState("English / Urdu");
  const [viewMode, setViewMode] = useState<"dual" | "signer" | "speaker">("dual");

  const toggleToken = useCallback((token: string) => {
    setLoaded((prev) => {
      const next = new Set(prev);
      if (next.has(token)) next.delete(token);
      else next.add(token);
      return next;
    });
  }, []);

  const addCustom = useCallback((token: string, full: string) => {
    setAllTokens((prev) =>
      prev.some((t) => t.token.toLowerCase() === token.toLowerCase())
        ? prev
        : [...prev, { token, full, category: "Custom" }]
    );
    setLoaded((prev) => new Set(prev).add(token));
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      {/* ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-grid opacity-[0.5]" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(70% 50% at 50% -8%, rgba(16,185,129,0.18), transparent 60%), radial-gradient(60% 50% at 100% 100%, rgba(59,130,246,0.08), transparent 60%)",
          }}
        />
      </div>

      {/* sticky system header */}
      <div className="sticky top-0 z-30">
        <SystemHeader
          boostCount={loaded.size}
          dialect={dialect}
          setDialect={setDialect}
          proficiency={proficiency}
          setProficiency={setProficiency}
          targetLanguage={targetLanguage}
          setTargetLanguage={setTargetLanguage}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
      </div>

      {/* unified dual-stream workspace */}
      <main className="relative mx-auto w-full max-w-6xl flex-1 px-3 py-4 sm:px-4">
        <div
          className={cn(
            "grid gap-3.5 transition-opacity",
            viewMode === "dual" ? "lg:grid-cols-2" : "grid-cols-1 max-w-2xl mx-auto",
            locked && "pointer-events-none select-none opacity-60"
          )}
        >
          {(viewMode === "dual" || viewMode === "signer") && (
            <SignToSpeechPanel proficiency={proficiency} />
          )}
          {(viewMode === "dual" || viewMode === "speaker") && (
            <SpeechToSignPanel dialect={dialect} />
          )}
        </div>

        {/* presentation lock guard */}
        {locked && (
          <div className="pointer-events-none fixed inset-0 z-20 flex items-center justify-center p-6">
            <div className="animate-fade-up flex flex-col items-center gap-2 rounded-2xl border border-emerald-500/30 bg-zinc-950/85 px-6 py-5 text-center shadow-2xl backdrop-blur-md">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/40">
                <LockIcon className="h-6 w-6" />
              </span>
              <p className="text-[14px] font-semibold text-zinc-100">Presentation Locked</p>
              <p className="max-w-[16rem] text-[11.5px] leading-relaxed text-zinc-400">
                All stream controls are guarded against accidental touches. Unlock from the bar below.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* persistent utility bar */}
      <LockBar
        locked={locked}
        onToggleLock={() => setLocked((v) => !v)}
        onOpenGlossary={() => setGlossaryOpen(true)}
        loadedCount={loaded.size}
      />

      {/* vocabulary glossary */}
      <GlossaryModal
        open={glossaryOpen}
        onClose={() => setGlossaryOpen(false)}
        tokens={allTokens}
        loaded={loaded}
        onToggle={toggleToken}
        onAddCustom={addCustom}
      />
    </div>
  );
}
