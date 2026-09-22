'use client';

import React from 'react';
import { CinematicStarfield } from '@/components/ui/CinematicStarfield';

export function AmbientBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* 1. Base Layer: Procedural Multi-Depth Cinematic Starfield */}
      <CinematicStarfield variant="DASHBOARD" intensity="medium" density={1} parallax={true} />

      {/* 2. Top Ambient Halos */}
      <div
        className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full blur-[140px]"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.035) 0%, rgba(199, 255, 114, 0.015) 40%, transparent 75%)',
        }}
      />

      {/* 3. Subtle Bottom Accent Halo */}
      <div
        className="absolute -bottom-[25%] right-[-10%] w-[700px] h-[500px] rounded-full blur-[160px]"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(199, 255, 114, 0.03) 0%, transparent 70%)',
        }}
      />

      {/* 4. Rotating Orbital SVG Rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] opacity-[0.035] animate-spin-slow duration-[120s]">
        <svg viewBox="0 0 1000 1000" className="w-full h-full stroke-white fill-none">
          {/* Orbital Circle 1 */}
          <circle
            cx="500"
            cy="500"
            r="380"
            strokeWidth="1"
            strokeDasharray="6 12"
          />
          {/* Orbital Circle 2 */}
          <circle
            cx="500"
            cy="500"
            r="460"
            strokeWidth="1"
            strokeDasharray="2 18"
          />
          {/* Orbital Node Accent */}
          <circle
            cx="880"
            cy="500"
            r="4"
            fill="#C7FF72"
            className="opacity-80"
          />
        </svg>
      </div>

      {/* 5. Fine Background Dot Texture */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            'radial-gradient(rgba(255, 255, 255, 0.8) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      />
    </div>
  );
}
