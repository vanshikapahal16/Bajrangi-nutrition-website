"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

interface SupplementJar3DProps {
  category: "Protein" | "Pre-Workout" | "Creatine" | "Accessories" | "Vitamins";
  image: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  hovered?: boolean;
}

export default function SupplementJar3D({
  category,
  image,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1.0,
  hovered = false
}: SupplementJar3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const capRef = useRef<THREE.Mesh>(null);

  // Load the product mockup image as a texture
  // Fallback to logo if no image path exists
  const texturePath = image || "/assets/logo.png";
  const texture = useTexture(texturePath);

  // Animate jar: float, rotate gently, and follow mouse/hover states
  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    
    // Smooth floating
    groupRef.current.position.y = position[1] + Math.sin(time * 1.5) * 0.12;
    
    // Slow rotational spin
    if (hovered) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y, 
        state.pointer.x * 0.8, 
        0.05
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x, 
        -state.pointer.y * 0.4, 
        0.05
      );
    } else {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y, 
        rotation[1] + Math.sin(time * 0.3) * 0.15, 
        0.02
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x, 
        rotation[0] + Math.cos(time * 0.2) * 0.05, 
        0.02
      );
    }
  });

  // Material properties based on supplement category
  const themeColor = category === "Protein" 
    ? "#FF6B00" // Vibrant Orange
    : category === "Pre-Workout"
    ? "#FF2A00" // Intense Red
    : category === "Creatine"
    ? "#00E676" // Clean Green
    : "#FFA000"; // Accessories / Vitamins - Gold

  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
      {/* 1. Main Canister Jar Body */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.9, 0.9, 2.0, 32]} />
        <meshPhysicalMaterial
          color="#161616" // Sleek dark canister base
          roughness={0.4}
          metalness={0.1}
          clearcoat={0.3}
          clearcoatRoughness={0.2}
        />
      </mesh>

      {/* 2. Jar Cap / Lid (Metallic Screw Top) */}
      <mesh ref={capRef} position={[0, 1.1, 0]} castShadow>
        <cylinderGeometry args={[0.82, 0.82, 0.25, 32]} />
        <meshStandardMaterial
          color={themeColor} // Accent screw lid
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>

      {/* 3. Neck Ring (Under lid) */}
      <mesh position={[0, 0.95, 0]}>
        <cylinderGeometry args={[0.8, 0.85, 0.1, 32]} />
        <meshStandardMaterial color="#0A0A0A" roughness={0.7} />
      </mesh>

      {/* 4. Product Sticker Label (Wraps front cylinder face) */}
      <mesh position={[0, -0.05, 0.015]} rotation={[0, 0, 0]}>
        {/* Slightly wider cylinder segment representing the label wrap */}
        <cylinderGeometry args={[0.915, 0.915, 1.45, 32, 1, true, -Math.PI / 1.7, Math.PI * 1.18]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.25}
          metalness={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 5. Base Ring */}
      <mesh position={[0, -1.02, 0]}>
        <cylinderGeometry args={[0.88, 0.88, 0.05, 32]} />
        <meshStandardMaterial color="#0D0D0D" roughness={0.6} />
      </mesh>
    </group>
  );
}
