import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, OrbitControls, Sparkles } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

type Star = { id: string; x: number; y: number; z: number };

/** Create a radial-gradient halo texture once (no external deps) */
function useHaloTexture(color = "#a78bfa") {
  return useMemo(() => {
    const size = 256;
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const g = c.getContext("2d")!;
    const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0.0, `${color}`);
    grad.addColorStop(0.15, `${color}`);
    grad.addColorStop(0.35, "rgba(167,139,250,0.65)");
    grad.addColorStop(0.6, "rgba(167,139,250,0.2)");
    grad.addColorStop(1.0, "rgba(167,139,250,0.0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(c);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
    return tex;
  }, [color]);
}

function HeroStar({ pos }: { pos: [number, number, number] }) {
  const ref = useRef<THREE.Sprite>(null);
  const texture = useHaloTexture("#c4b5fd"); // soft violet

  // keep sprites always visible & rendered last
  useEffect(() => {
    if (!ref.current) return;
    ref.current.frustumCulled = false; // never culled when off-axis
    ref.current.renderOrder = 9999;    // draw after background
  }, []);

  // gentle drift + breathing pulse
  const base = useMemo(() => new THREE.Vector3(...pos), [pos]);
  const speed = useMemo(() => 0.3 + Math.random() * 0.4, []);
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.position.set(
      base.x + Math.sin(t * 0.25 + base.y) * 0.6,
      base.y + Math.sin(t * 0.33 + base.z) * 0.4,
      base.z + Math.cos(t * 0.22 + base.x) * 0.6
    );
    const s = 1.8 + Math.sin(t * speed + phase) * 0.35; // a bit bigger
    ref.current.scale.setScalar(s);
    (ref.current.material as THREE.SpriteMaterial).opacity = 0.95;
  });

  // IMPORTANT: depthTest=false & depthWrite=false so they render on top
  const material = useMemo(
    () =>
      new THREE.SpriteMaterial({
        map: texture,
        color: new THREE.Color("#ffffff"),
        transparent: true,
        depthTest: false,          // <- always visible over starfield
        depthWrite: false,         // <- don't affect depth buffer
        blending: THREE.AdditiveBlending,
      }),
    [texture]
  );

  return <sprite ref={ref} material={material} position={pos} scale={[2, 2, 2]} />;
}

export default function Galaxy({ stars = [] }: { stars?: Star[] }) {
  const bg = "#030510";

  // Fallback cluster if none provided (so scene isn't empty during first load)
  const fallback: Star[] = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        id: `fallback-${i}`,
        x: (Math.random() * 2 - 1) * 4,
        y: (Math.random() * 2 - 1) * 2.2,
        z: (Math.random() * 2 - 1) * 4,
      })),
    []
  );

  // Scale & lift hero stars so they stand proud of the background field
  const display = (stars.length ? stars : fallback).map((s) => ({
    ...s,
    x: s.x * 10,
    y: s.y * 10,
    z: s.z * 10,
  }));

  return (
    <Canvas
      camera={{ position: [0, 10, 36], fov: 60 }}
      style={{ position: "fixed", inset: 0, background: bg }}
    >
      <color attach="background" args={[bg]} />
      <ambientLight intensity={0.35} />
      <pointLight position={[20, 30, 10]} intensity={1.1} />

      {/* Softer, less busy background so hero stars pop */}
      <Stars radius={230} depth={70} count={2500} factor={3.2} saturation={0} fade />
      <Sparkles count={120} scale={[260, 90, 260]} size={2} speed={0.18} />

      {display.map((s) => (
        <HeroStar key={s.id} pos={[s.x, s.y, s.z]} />
      ))}

      <OrbitControls enablePan={false} minDistance={10} maxDistance={120} />
    </Canvas>
  );
}
