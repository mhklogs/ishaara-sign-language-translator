import React, { useState, useRef, useEffect } from 'react';

interface FloatingAvatarProps {
  primaryMode: 'SIGNER' | 'SPEAKER';
  currentGloss: string;
  onClose: () => void;
}

export const FloatingAvatar: React.FC<FloatingAvatarProps> = ({ primaryMode, currentGloss, onClose }) => {
  const [position, setPosition] = useState({ x: window.innerWidth - 220, y: window.innerHeight - 320 });
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef({ x: 0, y: 0 });
  const baseDistRef = useRef<number | null>(null);

  // Drag and Drop Logic
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    offsetRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: Math.max(0, Math.min(window.innerWidth - 200 * scale, e.clientX - offsetRef.current.x)),
      y: Math.max(0, Math.min(window.innerHeight - 300 * scale, e.clientY - offsetRef.current.y)),
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Touch & Pinch-to-Zoom Logic for Mobile PWA
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      offsetRef.current = { x: e.touches[0].clientX - position.x, y: e.touches[0].clientY - position.y };
    } else if (e.touches.length === 2) {
      // Initialize pinch distance calculation
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      baseDistRef.current = dist;
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging && e.touches.length === 1) {
      setPosition({
        x: Math.max(0, Math.min(window.innerWidth - 200 * scale, e.touches[0].clientX - offsetRef.current.x)),
        y: Math.max(0, Math.min(window.innerHeight - 300 * scale, e.touches[0].clientY - offsetRef.current.y)),
      });
    } else if (e.touches.length === 2 && baseDistRef.current) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const delta = dist / baseDistRef.current;
      setScale((prev) => Math.max(0.5, Math.min(2.0, prev * delta)));
      baseDistRef.current = dist;
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={dragRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${200 * scale}px`,
        height: `${300 * scale}px`,
        transform: 'translate3d(0,0,0)',
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      className="bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl flex flex-col overflow-hidden z-[9999]"
    >
      {/* Widget Header Controls */}
      <div className="bg-slate-800 p-2 flex justify-between items-center text-white text-xs select-none">
        <span>{primaryMode === 'SPEAKER' ? 'AI Face Mode' : 'Full Body Avatar'}</span>
        <button onClick={onClose} className="hover:bg-red-600 px-2 py-0.5 rounded transition">✕</button>
      </div>

      {/* 3D Render Viewport Box */}
      <div className="flex-1 relative flex items-center justify-center bg-slate-950 text-slate-400 text-center text-xs p-4">
        {primaryMode === 'SPEAKER' ? (
          <div className="animate-pulse">🗣️ [Rigged AI Face Canvas]</div>
        ) : (
          <div className="animate-bounce">🧍 [Full Body Cartoon Rig]</div>
        )}
      </div>

      {/* Embedded Real-time Subtitles */}
      <div className="bg-black/80 text-center py-2 px-1 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider select-none">
        {currentGloss || 'LISTENING...'}
      </div>
    </div>
  );
};
