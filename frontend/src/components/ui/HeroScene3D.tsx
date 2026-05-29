'use client';

/**
 * HeroScene3D — Full-viewport Three.js cinematic background.
 * Floating icosahedra crystals + particle field + volumetric violet lighting.
 * Mouse parallax + scroll-driven camera pull-back.
 */

import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Icosahedron, Sphere } from '@react-three/drei';
import * as THREE from 'three';

/* ─── Particle field ─────────────────────────────────────────────────────────
   2 000 randomly placed points forming a diffuse star-field / volume fog
──────────────────────────────────────────────────────────────────────────── */
function ParticleField() {
  const ref = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const count = 2000;
    const pos   = new Float32Array(count * 3);
    const col   = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Spread in a sphere of radius 14
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = 8 + Math.random() * 6;

      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      // Lavender → white tint
      const t = Math.random();
      col[i * 3]     = 0.55 + t * 0.45;   // R
      col[i * 3 + 1] = 0.40 + t * 0.35;   // G
      col[i * 3 + 2] = 0.85 + t * 0.15;   // B
    }
    return { positions: pos, colors: col };
  }, []);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.025;
      ref.current.rotation.x += delta * 0.01;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color"    args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        vertexColors
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  );
}

/* ─── Single floating crystal ────────────────────────────────────────────────
   Wireframe + transparent fill so the inside glows through.
──────────────────────────────────────────────────────────────────────────── */
interface CrystalProps {
  position: [number, number, number];
  scale:    number;
  speed:    number;
  phase:    number;
  color:    string;
}

function Crystal({ position, scale, speed, phase, color }: CrystalProps) {
  const meshRef      = useRef<THREE.Mesh>(null);
  const wireRef      = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.x = t * speed * 0.4;
      meshRef.current.rotation.y = t * speed * 0.6;
      meshRef.current.position.y = position[1] + Math.sin(t * 0.4 + phase) * 0.35;
    }
    if (wireRef.current) {
      wireRef.current.rotation.x = meshRef.current?.rotation.x ?? 0;
      wireRef.current.rotation.y = meshRef.current?.rotation.y ?? 0;
      wireRef.current.position.y = meshRef.current?.position.y ?? position[1];
    }
  });

  return (
    <group position={position}>
      {/* Solid fill — semi-transparent */}
      <Icosahedron ref={meshRef} args={[1, 1]} scale={scale}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.35}
          transparent
          opacity={0.12}
          side={THREE.DoubleSide}
        />
      </Icosahedron>

      {/* Wireframe — brighter edges */}
      <Icosahedron ref={wireRef} args={[1, 1]} scale={scale * 1.01}>
        <meshBasicMaterial
          color={color}
          wireframe
          transparent
          opacity={0.55}
        />
      </Icosahedron>
    </group>
  );
}

/* ─── Scene lights ───────────────────────────────────────────────────────── */
function SceneLights() {
  const light1 = useRef<THREE.PointLight>(null);
  const light2 = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (light1.current) {
      light1.current.position.x = Math.sin(t * 0.3) * 4;
      light1.current.position.y = Math.cos(t * 0.2) * 3;
    }
    if (light2.current) {
      light2.current.position.x = Math.cos(t * 0.25) * 5;
      light2.current.position.z = Math.sin(t * 0.3) * 4;
    }
  });

  return (
    <>
      <ambientLight intensity={0.08} color="#7c3aed" />
      <pointLight ref={light1} intensity={6}   color="#a855f7" distance={14} decay={2} />
      <pointLight ref={light2} intensity={4}   color="#3b82f6" distance={12} decay={2} position={[3, -2, 4]} />
      <pointLight               intensity={2.5} color="#ec4899" distance={10} decay={2} position={[-4, 3, -3]} />
    </>
  );
}

/* ─── Camera rig — mouse parallax + scroll pull-back ─────────────────────── */
function CameraRig({ mouseX, mouseY, scrollY }: {
  mouseX: React.MutableRefObject<number>;
  mouseY: React.MutableRefObject<number>;
  scrollY: React.MutableRefObject<number>;
}) {
  const { camera } = useThree();
  const targetPos  = useRef(new THREE.Vector3(0, 0, 7));

  useFrame(() => {
    // Mouse parallax — subtle lateral drift
    const mx = mouseX.current * 1.8;
    const my = mouseY.current * 1.2;
    const sz = scrollY.current;

    // Scroll: camera retreats and tilts slightly
    targetPos.current.set(mx * 0.4, my * 0.3, 7 + sz * 0.01);
    camera.position.lerp(targetPos.current, 0.04);
    camera.lookAt(mx * 0.1, my * 0.05, 0);
  });

  return null;
}

/* ─── Crystals data ──────────────────────────────────────────────────────── */
const crystals: CrystalProps[] = [
  { position: [ 3.5,  1.2, -1.5], scale: 0.9, speed: 0.5, phase: 0,    color: '#7c3aed' },
  { position: [-3.2,  0.8, -2.0], scale: 0.7, speed: 0.7, phase: 1.2,  color: '#a855f7' },
  { position: [ 1.8, -2.0, -0.5], scale: 0.55, speed: 0.9, phase: 2.4, color: '#3b82f6' },
  { position: [-1.5,  2.2, -1.0], scale: 0.45, speed: 1.1, phase: 0.8, color: '#c084fc' },
  { position: [ 0.2, -1.2,  1.0], scale: 0.35, speed: 1.4, phase: 3.1, color: '#818cf8' },
];

/* ─── Exported scene wrapper ─────────────────────────────────────────────── */
export default function HeroScene3D({
  mouseX,
  mouseY,
  scrollY,
}: {
  mouseX:  React.MutableRefObject<number>;
  mouseY:  React.MutableRefObject<number>;
  scrollY: React.MutableRefObject<number>;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 60 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.5]}
      style={{ position: 'absolute', inset: 0 }}
    >
      <color attach="background" args={['#07070d']} />
      <fog attach="fog" args={['#07070d', 10, 22]} />

      <SceneLights />
      <ParticleField />

      {crystals.map((c, i) => (
        <Crystal key={i} {...c} />
      ))}

      <CameraRig mouseX={mouseX} mouseY={mouseY} scrollY={scrollY} />
    </Canvas>
  );
}
