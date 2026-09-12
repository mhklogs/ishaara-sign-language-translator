import React, { useState, useEffect, useRef } from "react";
import { XIcon, HandIcon, FaceIcon } from "./icons";
import { SignAvatar } from "./SignAvatar";
import { cn } from "@/utils/cn";

export interface AvatarConfig {
  gender: string;
  skin_tone: string;
  hair_style: string;
  hair_color: string;
  outfit_id: string;
  accessory_id: string;
}

interface FloatingAvatarProps {
  primaryMode?: 'SIGNER' | 'SPEAKER';
  currentGloss?: string;
  onClose: () => void;
  initialMode?: "deaf" | "hearing";
  initialConfig?: AvatarConfig;
}

export function FloatingAvatar({
  primaryMode,
  currentGloss,
  onClose,
  initialMode = "deaf",
  initialConfig = {
    gender: "neutral",
    skin_tone: "#E0A899",
    hair_style: "default",
    hair_color: "#2C1A14",
    outfit_id: "casual_01",
    accessory_id: "none",
  },
}: FloatingAvatarProps) {
  // Positioning and drag states
  const [position, setPosition] = useState({ x: window.innerWidth - 280, y: window.innerHeight - 440 });
  const [scale, setScale] = useState(1.0);
  const [mode, setMode] = useState<"deaf" | "hearing">(
    primaryMode ? (primaryMode === 'SPEAKER' ? 'hearing' : 'deaf') : initialMode
  );
  const [config, setConfig] = useState<AvatarConfig>(initialConfig);
  const [customizing, setCustomizing] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0, startX: 0, startY: 0 });
  const touchStartDistRef = useRef<number | null>(null);

  // Sync mode if primaryMode changes
  useEffect(() => {
    if (primaryMode) {
      setMode(primaryMode === 'SPEAKER' ? 'hearing' : 'deaf');
    }
  }, [primaryMode]);

  // Handle mouse drag start
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".no-drag")) return;
    e.preventDefault();
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startX: position.x,
      startY: position.y,
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPosition({
      x: dragStartRef.current.startX + dx,
      y: dragStartRef.current.startY + dy,
    });
  };

  const handleMouseUp = () => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  // Handle touch drag and pinch-to-zoom
  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest(".no-drag")) return;
    
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      dragStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        startX: position.x,
        startY: position.y,
      };
      touchStartDistRef.current = null;
    } else if (e.touches.length === 2) {
      // Pinch to zoom start
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDistRef.current = dist;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && touchStartDistRef.current === null) {
      const touch = e.touches[0];
      const dx = touch.clientX - dragStartRef.current.x;
      const dy = touch.clientY - dragStartRef.current.y;
      setPosition({
        x: dragStartRef.current.startX + dx,
        y: dragStartRef.current.startY + dy,
      });
    } else if (e.touches.length === 2 && touchStartDistRef.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = dist / touchStartDistRef.current;
      setScale((s) => Math.min(2.5, Math.max(0.5, s * (1 + (factor - 1) * 0.1))));
      touchStartDistRef.current = dist;
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setScale((s) => Math.min(2.5, Math.max(0.5, s - e.deltaY * 0.001)));
  };

  // Clean up global listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onWheel={handleWheel}
      className={cn(
        "fixed z-50 flex flex-col rounded-3xl border border-white/10 bg-zinc-950/80 p-3 shadow-2xl backdrop-blur-md cursor-grab active:cursor-grabbing transition-shadow hover:shadow-emerald-500/5 select-none",
        "w-64 max-w-[90vw]"
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: `scale(${scale})`,
        transformOrigin: "top left",
      }}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2 no-drag">
        <div className="flex items-center gap-1.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20">
            {mode === "deaf" ? <HandIcon className="h-3.5 w-3.5" /> : <FaceIcon className="h-3.5 w-3.5" />}
          </span>
          <span className="font-tech text-[10px] uppercase tracking-wider text-zinc-300">
            {mode === "deaf" ? "Deaf (Hands)" : "Hearing (Mouth)"}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setMode((m) => (m === "deaf" ? "hearing" : "deaf"))}
            className="rounded-lg bg-white/5 p-1 text-zinc-400 hover:bg-white/10 hover:text-zinc-100 transition text-[9px] px-1.5 font-tech font-bold"
            title="Cycle mode"
          >
            FLIP
          </button>
          <button
            onClick={() => setCustomizing((c) => !c)}
            className="rounded-lg bg-white/5 p-1 text-zinc-400 hover:bg-white/10 hover:text-zinc-100 transition text-[9px] px-1.5 font-tech font-bold"
            title="Customize Avatar"
          >
            RIG
          </button>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 hover:bg-red-500/20 hover:text-red-400 transition"
            aria-label="Close Floating Avatar"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 3D view container */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/[0.06] bg-zinc-900 no-drag">
        <div className="absolute inset-0 bg-grid opacity-30" />
        
        {/* Render Rigged avatar with customized variables */}
        <SignAvatar
          gesture={currentGloss ? "signing" : "idle"}
          className="absolute inset-0"
          style={{
            filter: `hue-rotate(${config.outfit_id === "casual_01" ? "0deg" : config.outfit_id === "formal_02" ? "120deg" : "240deg"})`,
          }}
        />

        {/* Customization Drawer overlay */}
        {customizing && (
          <div className="absolute inset-x-0 bottom-0 bg-zinc-950/95 border-t border-white/10 p-2.5 space-y-2 text-[10.5px] z-25">
            <div className="flex items-center justify-between border-b border-white/5 pb-1">
              <span className="font-bold text-zinc-300">Snap-Bitmoji Avatar Rig</span>
              <button onClick={() => setCustomizing(false)} className="text-zinc-500 hover:text-zinc-300">
                DONE
              </button>
            </div>

            {/* Customization Options */}
            <div className="grid grid-cols-2 gap-1.5 max-h-24 overflow-y-auto no-scrollbar">
              <div className="flex flex-col">
                <span className="text-zinc-500 text-[8.5px] uppercase">Skin Tone</span>
                <select
                  value={config.skin_tone}
                  onChange={(e) => setConfig({ ...config, skin_tone: e.target.value })}
                  className="bg-white/5 border border-white/10 rounded px-1 py-0.5 text-zinc-300 text-[10px]"
                >
                  <option value="#E0A899">Fair</option>
                  <option value="#C58F7F">Medium</option>
                  <option value="#76453B">Dark</option>
                </select>
              </div>

              <div className="flex flex-col">
                <span className="text-zinc-500 text-[8.5px] uppercase">Outfit</span>
                <select
                  value={config.outfit_id}
                  onChange={(e) => setConfig({ ...config, outfit_id: e.target.value })}
                  className="bg-white/5 border border-white/10 rounded px-1 py-0.5 text-zinc-300 text-[10px]"
                >
                  <option value="casual_01">Casual Blue</option>
                  <option value="formal_02">Formal Red</option>
                  <option value="sporty_03">Sporty Green</option>
                </select>
              </div>

              <div className="flex flex-col col-span-2">
                <span className="text-zinc-500 text-[8.5px] uppercase">Hair Style</span>
                <select
                  value={config.hair_style}
                  onChange={(e) => setConfig({ ...config, hair_style: e.target.value })}
                  className="bg-white/5 border border-white/10 rounded px-1 py-0.5 text-zinc-300 text-[10px]"
                >
                  <option value="default">Classic Short</option>
                  <option value="long">Flowing Long</option>
                  <option value="curly">Curly Volume</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Float mode label */}
        <div className="absolute top-2 left-2 pointer-events-none">
          <span className="rounded bg-black/55 px-1.5 py-0.5 font-tech text-[8px] uppercase tracking-wider text-emerald-400">
            {mode === "deaf" ? "FULL BODY CAP" : "LIP SYNC ONLY"}
          </span>
        </div>

        {/* Small accessibility tips for kids or illiterate users */}
        {!customizing && (
          <div className="absolute bottom-2 inset-x-2 pointer-events-none text-center">
            <span className="rounded bg-black/65 px-2 py-0.5 text-[8.5px] text-zinc-400 block truncate">
              {mode === "deaf"
                ? "Watch hands for signs"
                : "Watch mouth structures"}
            </span>
          </div>
        )}
      </div>

      {/* Floating mini-caption box */}
      <div className="mt-2 bg-black/40 border border-white/5 rounded-xl p-2 text-center text-[11px] leading-tight text-zinc-200 font-medium no-drag truncate uppercase">
        {currentGloss || (mode === "deaf" ? "GLOSS: LISTENING..." : "TRANSLATION: STANDBY")}
      </div>
    </div>
  );
}
