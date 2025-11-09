import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, OrbitControls, Sparkles } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function StarMesh({ pos }: { pos: [number, number, number] }) {
  const ref = useRef<THREE.Points>(null);
  const speed = useMemo(() => 0.001 + Math.random()*0.003, []);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() * speed;
    ref.current.position.x = pos[0] + Math.sin(t + pos[1]) * 0.5;
    ref.current.position.y = pos[1] + Math.sin(t + pos[2]) * 0.3;
    ref.current.position.z = pos[2] + Math.cos(t + pos[0]) * 0.5;
  });
  const geom = useMemo(() => new THREE.BufferGeometry().setAttribute(
    "position", new THREE.Float32BufferAttribute([0,0,0], 3)
  ), []);
  const mat = useMemo(() => new THREE.PointsMaterial({ size: 0.08, sizeAttenuation: true, transparent: true, opacity: 0.95 }), []);
  return <points ref={ref} geometry={geom} material={mat} position={pos} />;
}

export default function Galaxy({ stars }: { stars: { x:number;y:number;z:number; id:string }[] }) {
  const bg = "#030510";
  return (
    <Canvas camera={{ position: [0, 15, 40], fov: 65 }} style={{ position: "fixed", inset: 0, background: bg }}>
      <color attach="background" args={[bg]} />
      <ambientLight intensity={0.3} />
      <pointLight position={[20, 30, 10]} intensity={1.2} />
      <Stars radius={300} depth={80} count={8000} factor={4} saturation={0} fade />
      <Sparkles count={200} scale={[300, 100, 300]} size={2} speed={0.2} />
      {stars.map(s => <StarMesh key={s.id} pos={[s.x, s.y, s.z]} />)}
      <OrbitControls enablePan={false} minDistance={10} maxDistance={120} />
    </Canvas>
  );
}