/** Neon-green holistic tracking mesh: face tesselation + dual 21-pt hand rigs + pose. */
function HandSkeleton({
  x,
  y,
  scale = 0.7,
  rotate = 0,
  mirror = false,
}: {
  x: number;
  y: number;
  scale: number;
  rotate: number;
  mirror?: boolean;
}) {
  // Local coords: wrist at (0,0), fingers point up (-y). 21 MediaPipe landmarks.
  const P: Record<string, [number, number]> = {
    W: [0, 0],
    T1: [-7, -7], T2: [-13, -13], T3: [-19, -17], T4: [-24, -19],
    I1: [-3, -27], I2: [-4, -41], I3: [-4, -53], I4: [-4, -61],
    M1: [5, -29], M2: [6, -45], M3: [7, -57], M4: [8, -66],
    R1: [12, -28], R2: [14, -42], R3: [16, -52], R4: [18, -59],
    P1: [19, -25], P2: [22, -35], P3: [25, -42], P4: [27, -47],
  };
  const links: [string, string][] = [
    ["W", "T1"], ["T1", "T2"], ["T2", "T3"], ["T3", "T4"],
    ["W", "I1"], ["I1", "I2"], ["I2", "I3"], ["I3", "I4"],
    ["W", "M1"], ["M1", "M2"], ["M2", "M3"], ["M3", "M4"],
    ["W", "R1"], ["R1", "R2"], ["R2", "R3"], ["R3", "R4"],
    ["W", "P1"], ["P1", "P2"], ["P2", "P3"], ["P3", "P4"],
    ["I1", "M1"], ["M1", "R1"], ["R1", "P1"],
  ];
  return (
    <g transform={`translate(${x} ${y}) scale(${scale * (mirror ? -1 : 1)} ${scale}) rotate(${rotate})`}>
      {links.map(([a, b], i) => (
        <line
          key={i}
          x1={P[a][0]}
          y1={P[a][1]}
          x2={P[b][0]}
          y2={P[b][1]}
          stroke="#34d399"
          strokeWidth={2.4}
          strokeLinecap="round"
          opacity={0.55}
        />
      ))}
      {Object.entries(P).map(([k, [px, py]]) => (
        <circle
          key={k}
          cx={px}
          cy={py}
          r={k === "W" ? 3.4 : 2.3}
          fill="#6ee7b7"
          className="animate-pulse-soft"
          style={{ animationDelay: `${(parseInt(k.slice(1)) || 0) * 0.08}s` }}
        />
      ))}
    </g>
  );
}

export function SkeletonOverlay() {
  const faceCx = 180;
  const faceCy = 120;
  const rx = 46;
  const ry = 58;

  const ring = (count: number, rxx: number, ryy: number, phase = 0) =>
    Array.from({ length: count }, (_, i) => {
      const a = (i / count) * Math.PI * 2 + phase;
      return [faceCx + Math.cos(a) * rxx, faceCy + Math.sin(a) * ryy] as const;
    });
  const outer = ring(24, rx, ry);
  const inner = ring(16, rx * 0.62, ry * 0.62, 0.2);

  const glow = "drop-shadow(0 0 2.6px rgba(52,211,153,0.55))";

  // shoulder + arm bone points
  const lShoulder: [number, number] = [120, 205];
  const rShoulder: [number, number] = [240, 205];
  const lElbow: [number, number] = [104, 250];
  const rElbow: [number, number] = [256, 248];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* depth vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/15 via-transparent to-black/50" />

      {/* scanning sweep */}
      <div className="absolute inset-x-0 top-0 h-28 animate-scanline bg-gradient-to-b from-transparent via-emerald-400/12 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-px animate-scanline shadow-[0_0_14px_3px_rgba(52,211,153,0.55)] bg-emerald-300" />

      {/* viewfinder corners */}
      {[
        "left-3 top-3 border-l-2 border-t-2 rounded-tl-lg",
        "right-3 top-3 border-r-2 border-t-2 rounded-tr-lg",
        "left-3 bottom-3 border-l-2 border-b-2 rounded-bl-lg",
        "right-3 bottom-3 border-r-2 border-b-2 rounded-br-lg",
      ].map((c, i) => (
        <div key={i} className={`absolute h-6 w-6 border-emerald-400/70 ${c}`} />
      ))}

      <svg
        viewBox="0 0 360 480"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        style={{ filter: glow }}
      >
        {/* ---- FACE TESSELATION ---- */}
        <ellipse cx={faceCx} cy={faceCy} rx={rx} ry={ry} fill="none" stroke="#34d399" strokeWidth={1.6} opacity={0.65} />
        <ellipse cx={faceCx} cy={faceCy} rx={rx * 0.74} ry={ry * 0.74} fill="none" stroke="#34d399" strokeWidth={1} opacity={0.28} />
        {outer.map((p, i) =>
          i % 3 === 0 ? (
            <line key={`f${i}`} x1={faceCx} y1={faceCy} x2={p[0]} y2={p[1]} stroke="#34d399" strokeWidth={0.8} opacity={0.18} />
          ) : null
        )}
        {/* eyes */}
        <ellipse cx={faceCx - 17} cy={faceCy - 12} rx={9} ry={5} fill="none" stroke="#34d399" strokeWidth={1.4} opacity={0.6} />
        <ellipse cx={faceCx + 17} cy={faceCy - 12} rx={9} ry={5} fill="none" stroke="#34d399" strokeWidth={1.4} opacity={0.6} />
        <circle cx={faceCx - 17} cy={faceCy - 12} r={2.4} fill="#a7f3d0" className="animate-pulse-soft" />
        <circle cx={faceCx + 17} cy={faceCy - 12} r={2.4} fill="#a7f3d0" className="animate-pulse-soft" />
        {/* nose + mouth */}
        <line x1={faceCx} y1={faceCy - 2} x2={faceCx} y2={faceCy + 16} stroke="#34d399" strokeWidth={1.3} opacity={0.5} />
        <path d={`M ${faceCx - 16} ${faceCy + 30} Q ${faceCx} ${faceCy + 38} ${faceCx + 16} ${faceCy + 30}`} fill="none" stroke="#34d399" strokeWidth={1.4} opacity={0.55} />
        {/* face landmark dots */}
        {outer.map((p, i) => (
          <circle key={`o${i}`} cx={p[0]} cy={p[1]} r={1.7} fill="#6ee7b7" className="animate-pulse-soft" style={{ animationDelay: `${i * 0.05}s` }} />
        ))}
        {inner.map((p, i) => (
          <circle key={`in${i}`} cx={p[0]} cy={p[1]} r={1.3} fill="#34d399" opacity={0.7} />
        ))}

        {/* ---- POSE: shoulders + arms ---- */}
        <line x1={lShoulder[0]} y1={lShoulder[1]} x2={rShoulder[0]} y2={rShoulder[1]} stroke="#34d399" strokeWidth={2.6} opacity={0.5} strokeLinecap="round" />
        <line x1={faceCx} y1={lShoulder[1]} x2={faceCx} y2={lShoulder[1] + 70} stroke="#34d399" strokeWidth={1} opacity={0.2} strokeDasharray="3 5" />
        <line x1={lShoulder[0]} y1={lShoulder[1]} x2={lElbow[0]} y2={lElbow[1]} stroke="#34d399" strokeWidth={2.4} opacity={0.5} strokeLinecap="round" />
        <line x1={lElbow[0]} y1={lElbow[1]} x2={98} y2={286} stroke="#34d399" strokeWidth={2.4} opacity={0.5} strokeLinecap="round" />
        <line x1={rShoulder[0]} y1={rShoulder[1]} x2={rElbow[0]} y2={rElbow[1]} stroke="#34d399" strokeWidth={2.4} opacity={0.5} strokeLinecap="round" />
        <line x1={rElbow[0]} y1={rElbow[1]} x2={262} y2={282} stroke="#34d399" strokeWidth={2.4} opacity={0.5} strokeLinecap="round" />
        {[lShoulder, rShoulder, lElbow, rElbow, [98, 286], [262, 282]].map((p, i) => (
          <circle key={`j${i}`} cx={p[0]} cy={p[1]} r={3.2} fill="#a7f3d0" />
        ))}

        {/* ---- HANDS ---- */}
        <HandSkeleton x={98} y={286} scale={0.66} rotate={-12} />
        <HandSkeleton x={262} y={282} scale={0.66} rotate={14} />
      </svg>

      {/* shoulder-width normalization ruler */}
      <div className="absolute left-[31%] right-[31%] top-[42.5%] flex items-center">
        <span className="h-2 w-px bg-emerald-300/70" />
        <div className="mx-1 h-px flex-1 border-t border-dashed border-emerald-300/50" />
        <span className="whitespace-nowrap rounded bg-emerald-500/15 px-1 font-tech text-[7px] text-emerald-300 ring-1 ring-emerald-400/30">
          Δ SHOULDER = 1.0×
        </span>
        <div className="mx-1 h-px flex-1 border-t border-dashed border-emerald-300/50" />
        <span className="h-2 w-px bg-emerald-300/70" />
      </div>

    </div>
  );
}
