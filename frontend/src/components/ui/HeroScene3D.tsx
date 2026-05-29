'use client';

/**
 * HeroScene3D — "The Mark on Stage"
 *
 * One dramatic idea: the three horizontal bars from the Logo3D's custom "E"
 * rendered as large architectural slabs floating in a dark, dramatically lit space.
 * No particles. No orbs. No scattered crystals.
 * Just the mark, a single spotlight, and the void.
 *
 * Camera sits slightly low and tilts up — scale is created through angle, not size.
 */

import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/* ─── The three architectural slabs — the E motif ─────────────────────────
   Full / 70% / Full width — exactly the proportions of Logo3D's custom E.
   Each slab is a bevelled box: wide and thin, like a stone lintel.
──────────────────────────────────────────────────────────────────────────── */

const SLABS = [
  { y:  1.55, w: 3.2, h: 0.32, d: 0.55, full: true  }, // top    — full
  { y:  0,    w: 2.24, h: 0.32, d: 0.55, full: false }, // middle — 70 %
  { y: -1.55, w: 3.2, h: 0.32, d: 0.55, full: true  }, // bottom — full
];

function TheMark({ mouseX, mouseY }: {
  mouseX: React.MutableRefObject<number>;
  mouseY: React.MutableRefObject<number>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const target   = useRef(new THREE.Euler(0, 0, 0));

  // Dark metallic material — catches the light dramatically
  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color:            new THREE.Color('#1a1028'),
    emissive:         new THREE.Color('#7c3aed'),
    emissiveIntensity: 0.04,
    metalness:        0.92,
    roughness:        0.12,
    side:             THREE.DoubleSide,
  }), []);

  // Edge glow material — thin top-face plane, brighter emissive
  const edgeMat = useMemo(() => new THREE.MeshStandardMaterial({
    color:            new THREE.Color('#a855f7'),
    emissive:         new THREE.Color('#7c3aed'),
    emissiveIntensity: 1.2,
    metalness:        0.5,
    roughness:        0.3,
  }), []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    // Slow ambient rotation
    target.current.y += delta * 0.06;
    // Mouse tilt — very subtle, adds life without being distracting
    target.current.x = THREE.MathUtils.lerp(target.current.x, -mouseY.current * 0.18, 0.04);
    target.current.y = THREE.MathUtils.lerp(target.current.y, mouseX.current * 0.22 + delta * 0.06, 0.04);

    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, target.current.x, 0.05);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, target.current.y, 0.05);
  });

  return (
    <group ref={groupRef} position={[0.3, 0, 0]}>
      {SLABS.map((s, i) => (
        <group key={i} position={[0, s.y, 0]}>
          {/* Main slab body */}
          <mesh material={material} castShadow receiveShadow>
            <boxGeometry args={[s.w, s.h, s.d]} />
          </mesh>
          {/* Top edge — bright emissive strip, very thin */}
          <mesh material={edgeMat} position={[0, s.h / 2, 0]}>
            <boxGeometry args={[s.w, 0.018, s.d]} />
          </mesh>
          {/* Front face accent — catches the spotlight */}
          <mesh material={edgeMat} position={[0, 0, s.d / 2]}>
            <boxGeometry args={[s.w, s.h, 0.006]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ─── Reflective ground plane ─────────────────────────────────────────────
   Barely visible, just catches the violet uplighting as a subtle pool.
──────────────────────────────────────────────────────────────────────────── */
function Stage() {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color:     new THREE.Color('#0a0814'),
    metalness: 0.7,
    roughness: 0.6,
    envMapIntensity: 0.3,
  }), []);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.6, 0]} receiveShadow>
      <planeGeometry args={[30, 30]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

/* ─── Lighting — one dramatic concept ─────────────────────────────────────
   Primary: violet uplighter below and slightly front. This is the key light.
   Fill:    very dim blue from the opposite direction. No more.
   Rim:     faint cool white from behind-above.
──────────────────────────────────────────────────────────────────────────── */
function Lighting() {
  const primaryRef = useRef<THREE.SpotLight>(null);
  const targetRef  = useRef<THREE.Object3D>(null);

  useFrame(({ scene }) => {
    if (primaryRef.current && !primaryRef.current.target.parent) {
      scene.add(primaryRef.current.target);
    }
  });

  return (
    <>
      {/* Scene base — almost nothing, just stops full black */}
      <ambientLight intensity={0.04} color="#0d0520" />

      {/* PRIMARY: violet uplighter — the dramatic key light */}
      <spotLight
        ref={primaryRef}
        position={[0.5, -3.5, 3.5]}
        intensity={90}
        color="#9333ea"
        angle={Math.PI / 5}
        penumbra={0.65}
        distance={22}
        castShadow
        shadow-mapSize={[2048, 2048]}
        target-position={[0.3, 0, 0]}
      />

      {/* FILL: cool blue from upper-left, very dim */}
      <pointLight
        position={[-5, 4, 2]}
        intensity={4}
        color="#3b82f6"
        distance={14}
        decay={2}
      />

      {/* RIM: faint warm white from directly behind */}
      <pointLight
        position={[0, 2, -6]}
        intensity={2.5}
        color="#ede9fe"
        distance={12}
        decay={2}
      />
    </>
  );
}

/* ─── Camera rig — mouse parallax + framing ──────────────────────────────
   Camera sits slightly low (y = -1) and tilts up to look at the mark.
   This angle creates scale — the slabs feel monumental.
──────────────────────────────────────────────────────────────────────────── */
function CameraRig({ mouseX, mouseY, scrollY }: {
  mouseX:  React.MutableRefObject<number>;
  mouseY:  React.MutableRefObject<number>;
  scrollY: React.MutableRefObject<number>;
}) {
  const { camera } = useThree();
  const pos = useRef(new THREE.Vector3(0, -0.8, 6.5));

  useFrame(() => {
    const scroll = scrollY.current;
    pos.current.set(
      mouseX.current * 0.6,
      -0.8 + mouseY.current * 0.3,
      6.5 + scroll * 0.008
    );
    camera.position.lerp(pos.current, 0.04);
    camera.lookAt(0.3, 0.2, 0);
  });

  return null;
}

/* ─── Exported wrapper ──────────────────────────────────────────────────── */
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
      shadows
      camera={{ position: [0, -0.8, 6.5], fov: 52 }}
      gl={{ antialias: true, alpha: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
      dpr={[1, 2]}
      style={{ position: 'absolute', inset: 0 }}
    >
      <color attach="background" args={['#06050f']} />
      <fog attach="fog" args={['#06050f', 8, 20]} />

      <Lighting />
      <Stage />
      <TheMark mouseX={mouseX} mouseY={mouseY} />
      <CameraRig mouseX={mouseX} mouseY={mouseY} scrollY={scrollY} />
    </Canvas>
  );
}
