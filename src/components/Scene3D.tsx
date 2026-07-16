"use client";

import { useState } from "react";
import { Environment } from "@react-three/drei";
import SupplementJar3D from "./SupplementJar3D";
import ParticleSystem from "./ParticleSystem";

interface Scene3DProps {
  activeCategory?: string;
}

export default function Scene3D({ activeCategory = "all" }: Scene3DProps) {
  const [hovered, setHovered] = useState(false);

  // Layout the jars in 3D space replicating the mockup product stack
  // Jars will rotate and respond to mouse pointer movements

  return (
    <>
      {/* Cinematic Studio Lighting */}
      <ambientLight intensity={0.7} />
      
      {/* Key Light (casts shadows) */}
      <directionalLight 
        position={[4, 6, 3]} 
        intensity={1.8} 
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={15}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
      />
      
      {/* Backlight (orange aura glow) */}
      <pointLight 
        position={[0, 0, -3]} 
        intensity={2.5} 
        distance={10} 
        color="#FF6B00" 
      />

      {/* Rim Light (warm highlight from side) */}
      <spotLight 
        position={[-5, 3, 2]} 
        angle={0.6} 
        penumbra={1} 
        intensity={1.2} 
        color="#FFF3E0" 
      />

      {/* Ambient HDRI Studio Environment reflections */}
      <Environment preset="studio" />

      {/* WebGL Particle Background */}
      <ParticleSystem count={150} />

      {/* Supplement 3D Stack */}
      <group
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {/* 1. Whey Isolate Jar (Center-tall focus) */}
        <SupplementJar3D
          category="Protein"
          image="/assets/whey_isolate.png"
          position={[0, -0.7, 0]}
          rotation={[0.05, -Math.PI / 12, 0]}
          scale={1.15}
          hovered={hovered}
        />
      </group>

      {/* Flat Shadow Catcher plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.8, 0]} receiveShadow>
        <planeGeometry args={[15, 15]} />
        <shadowMaterial opacity={0.15} />
      </mesh>
    </>
  );
}

