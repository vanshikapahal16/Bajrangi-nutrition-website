"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import Scene3D from "./Scene3D";

interface Canvas3DProps {
  activeCategory?: string;
}

export default function Canvas3D({ activeCategory = "all" }: Canvas3DProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-[400px] md:min-h-[550px]">
        {/* Sleek Light preloader spinner */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <span className="text-sm font-semibold tracking-widest uppercase text-text-muted">Loading 3D Scene...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[400px] md:min-h-[550px] relative z-10">
      <Canvas
        shadows
        camera={{ position: [0, 0, 4.8], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 2]} // Performance optimization: Adaptive Device Pixel Ratio
      >
        <Suspense fallback={null}>
          <Scene3D activeCategory={activeCategory} />
        </Suspense>
      </Canvas>
    </div>
  );
}
