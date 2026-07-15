"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ParticleSystemProps {
  count?: number;
}

export default function ParticleSystem({ count = 120 }: ParticleSystemProps) {
  const pointsRef = useRef<THREE.Points>(null);

  // Generate random positions and velocities
  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Position inside a sphere-like boundary
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6;

      // Slow velocities
      vel[i * 3] = (Math.random() - 0.5) * 0.005;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.005;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.005;
    }
    return [pos, vel];
  }, [count]);

  useFrame(() => {
    if (!pointsRef.current) return;
    const geometry = pointsRef.current.geometry;
    const positionAttr = geometry.attributes.position;
    const array = positionAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      // Update coordinates
      array[i * 3] += velocities[i * 3];
      array[i * 3 + 1] += velocities[i * 3 + 1];
      array[i * 3 + 2] += velocities[i * 3 + 2];

      // Bounce back/loop if particles go out of range
      if (Math.abs(array[i * 3]) > 6) array[i * 3] = -array[i * 3];
      if (Math.abs(array[i * 3 + 1]) > 5) array[i * 3 + 1] = -array[i * 3 + 1];
      if (Math.abs(array[i * 3 + 2]) > 4) array[i * 3 + 2] = -array[i * 3 + 2];
    }
    positionAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#FF6B00"
        transparent
        opacity={0.35}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </points>
  );
}
