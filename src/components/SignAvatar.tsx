import { Component, useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { cn } from "@/utils/cn";

export type AvatarGesture = "idle" | "signing";

const { damp } = THREE.MathUtils;

function Humanoid({ gesture }: { gesture: AvatarGesture }) {
  const root = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const sL = useRef<THREE.Group>(null);
  const sR = useRef<THREE.Group>(null);
  const fL = useRef<THREE.Group>(null);
  const fR = useRef<THREE.Group>(null);

  const g = useRef(gesture);
  g.current = gesture;

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const d = Math.min(delta, 0.05);
    const mode = g.current;

    if (root.current)
      root.current.position.y = damp(root.current.position.y, 0.02 * Math.sin(t * 1.3), 6, d);

    if (mode === "signing") {
      if (sL.current)
        sL.current.rotation.x = damp(sL.current.rotation.x, -1.55 + 0.2 * Math.sin(t * 2.2), 7, d);
      if (sR.current)
        sR.current.rotation.x = damp(sR.current.rotation.x, -1.55 + 0.2 * Math.sin(t * 2.2 + 0.6), 7, d);
      if (fL.current) {
        fL.current.rotation.x = damp(fL.current.rotation.x, -1.05 + 0.26 * Math.sin(t * 3.1), 7, d);
        fL.current.rotation.y = damp(fL.current.rotation.y, 0.5 * Math.sin(t * 4), 7, d);
      }
      if (fR.current) {
        fR.current.rotation.x = damp(fR.current.rotation.x, -1.05 + 0.26 * Math.sin(t * 3.1 + 0.7), 7, d);
        fR.current.rotation.y = damp(fR.current.rotation.y, 0.5 * Math.sin(t * 4 + 1), 7, d);
      }
      if (head.current)
        head.current.rotation.y = damp(head.current.rotation.y, 0.26 * Math.sin(t * 2), 6, d);
    } else {
      if (sL.current)
        sL.current.rotation.x = damp(sL.current.rotation.x, -0.2 + 0.04 * Math.sin(t * 1.1), 4, d);
      if (sR.current)
        sR.current.rotation.x = damp(sR.current.rotation.x, -0.2 + 0.04 * Math.sin(t * 1.1 + 0.5), 4, d);
      if (fL.current) {
        fL.current.rotation.x = damp(fL.current.rotation.x, -0.16, 4, d);
        fL.current.rotation.y = damp(fL.current.rotation.y, 0.05 * Math.sin(t * 0.9), 4, d);
      }
      if (fR.current) {
        fR.current.rotation.x = damp(fR.current.rotation.x, -0.16, 4, d);
        fR.current.rotation.y = damp(fR.current.rotation.y, 0.05 * Math.sin(t * 0.9 + 0.6), 4, d);
      }
      if (head.current)
        head.current.rotation.y = damp(head.current.rotation.y, 0.08 * Math.sin(t * 0.7), 4, d);
    }
  });

  const skin = "#cbd5e1";
  const limb = "#64748b";
  const joint = "#94a3b8";
  const torso = "#475569";
  const accent = "#34d399";

  return (
    <group ref={root}>
      {/* legs */}
      {[-0.16, 0.16].map((x) => (
        <mesh key={x} position={[x, -0.6, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.1, 1.15, 16]} />
          <meshStandardMaterial color="#1e293b" roughness={0.85} />
        </mesh>
      ))}
      {/* pelvis */}
      <mesh position={[0, 0.18, 0]} castShadow>
        <boxGeometry args={[0.5, 0.34, 0.3]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>
      {/* torso */}
      <mesh position={[0, 0.78, 0]} castShadow>
        <boxGeometry args={[0.62, 0.9, 0.32]} />
        <meshStandardMaterial color={torso} roughness={0.75} />
      </mesh>
      {/* chest core */}
      <mesh position={[0, 0.96, 0.165]}>
        <boxGeometry args={[0.34, 0.34, 0.02]} />
        <meshStandardMaterial color={accent} emissive="#064e3b" emissiveIntensity={0.7} roughness={0.35} />
      </mesh>
      {/* neck */}
      <mesh position={[0, 1.32, 0]}>
        <cylinderGeometry args={[0.1, 0.12, 0.18, 16]} />
        <meshStandardMaterial color={skin} roughness={0.7} />
      </mesh>

      {/* head */}
      <group ref={head} position={[0, 1.58, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.23, 32, 32]} />
          <meshStandardMaterial color={skin} roughness={0.6} />
        </mesh>
        <mesh position={[-0.085, 0.02, 0.2]}>
          <sphereGeometry args={[0.028, 16, 16]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <mesh position={[0.085, 0.02, 0.2]}>
          <sphereGeometry args={[0.028, 16, 16]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <mesh position={[-0.085, 0.075, 0.205]}>
          <boxGeometry args={[0.062, 0.012, 0.012]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        <mesh position={[0.085, 0.075, 0.205]}>
          <boxGeometry args={[0.062, 0.012, 0.012]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
      </group>

      {/* arms */}
      {(
        [
          { ref: sL, x: -0.42, fref: fL },
          { ref: sR, x: 0.42, fref: fR },
        ] as const
      ).map((arm, i) => (
        <group key={i} ref={arm.ref as never} position={[arm.x, 1.06, 0]}>
          <mesh position={[0, -0.25, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.085, 0.5, 16]} />
            <meshStandardMaterial color={limb} roughness={0.7} />
          </mesh>
          <mesh position={[0, -0.02, 0]}>
            <sphereGeometry args={[0.095, 16, 16]} />
            <meshStandardMaterial color={joint} roughness={0.6} />
          </mesh>
          <group ref={arm.fref as never} position={[0, -0.5, 0]}>
            <mesh position={[0, -0.225, 0]} castShadow>
              <cylinderGeometry args={[0.058, 0.07, 0.45, 16]} />
              <meshStandardMaterial color={limb} roughness={0.7} />
            </mesh>
            <mesh position={[0, -0.5, 0]}>
              <sphereGeometry args={[0.12, 24, 24]} />
              <meshStandardMaterial color={accent} emissive="#064e3b" emissiveIntensity={0.8} roughness={0.35} />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  );
}

class GLBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function AvatarFallback() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-center">
      <div className="flex h-20 w-20 animate-float items-center justify-center rounded-full bg-emerald-500/10 text-4xl ring-1 ring-emerald-400/30">
        🧏
      </div>
      <p className="font-tech text-[10px] uppercase tracking-widest text-zinc-500">
        3D Engine Idle
      </p>
    </div>
  );
}

export function SignAvatar({
  gesture,
  className,
}: {
  gesture: AvatarGesture;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <GLBoundary fallback={<AvatarFallback />}>
        <Canvas
          dpr={[1, 2]}
          camera={{ position: [0, 0.7, 3.7], fov: 38 }}
          gl={{ alpha: true, antialias: true }}
        >
          <ambientLight intensity={0.6} />
          <hemisphereLight args={["#cbd5e1", "#0b1120", 0.7]} />
          <directionalLight
            position={[3, 5, 4]}
            intensity={1.7}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <pointLight position={[-2.5, 1.6, -1]} intensity={11} color="#34d399" distance={11} />
          <Humanoid gesture={gesture} />
          <OrbitControls
            target={[0, 0.75, 0]}
            enablePan={false}
            enableZoom={false}
            minPolarAngle={Math.PI / 3.2}
            maxPolarAngle={Math.PI / 1.85}
            autoRotate
            autoRotateSpeed={0.7}
          />
        </Canvas>
      </GLBoundary>
    </div>
  );
}
