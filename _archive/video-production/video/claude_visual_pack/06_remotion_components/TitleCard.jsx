import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

export const TitleCard = ({ scene }) => {
  const frame = useCurrentFrame();

  const title = scene.title || 'Incident-Zero (I-ITSM v2.2)';
  const subtitle = scene.subtitle || 'Autonomous Enterprise Campus Service Management';

  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const translateY = interpolate(frame, [0, 25], [30, 0], { extrapolateRight: 'clamp' });
  const glowIntensity = interpolate(frame, [0, 45], [0, 25], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#06080d',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 120px',
        opacity
      }}
    >
      {/* Background Radial Glow */}
      <div
        style={{
          position: 'absolute',
          width: 1200,
          height: 800,
          background: 'radial-gradient(circle, rgba(0, 240, 255, 0.12) 0%, rgba(112, 0, 255, 0.05) 50%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none'
        }}
      />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          transform: `translateY(${translateY}px)`
        }}
      >
        {/* Top Eyebrow Pill */}
        <div
          style={{
            background: 'rgba(0, 240, 255, 0.1)',
            border: '1.5px solid rgba(0, 240, 255, 0.5)',
            borderRadius: 30,
            padding: '8px 28px',
            color: '#00f0ff',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 16,
            fontWeight: 800,
            letterSpacing: 3,
            marginBottom: 36,
            boxShadow: `0 0 ${glowIntensity}px rgba(0, 240, 255, 0.3)`
          }}
        >
          BITS PILANI · HYDERABAD CAMPUS · GROUP 76
        </div>

        {/* Main Title */}
        <h1
          style={{
            fontFamily: "'JetBrains Mono', 'Segoe UI', monospace",
            fontSize: 76,
            fontWeight: 900,
            color: '#ffffff',
            letterSpacing: 2,
            margin: 0,
            textShadow: '0 0 40px rgba(0, 240, 255, 0.4), 0 4px 20px rgba(0,0,0,0.8)'
          }}
        >
          {title}
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontFamily: "'Segoe UI', sans-serif",
            fontSize: 32,
            fontWeight: 500,
            color: '#94a3b8',
            maxWidth: 1200,
            marginTop: 24,
            lineHeight: 1.4
          }}
        >
          {subtitle}
        </p>

        {/* Decorative Divider */}
        <div
          style={{
            width: 320,
            height: 4,
            background: 'linear-gradient(90deg, transparent, #00f0ff, #00ff9d, transparent)',
            marginTop: 40,
            borderRadius: 2
          }}
        />

        {/* Footer info */}
        <div
          style={{
            display: 'flex',
            gap: 40,
            marginTop: 48,
            color: '#64748b',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 16,
            fontWeight: 600
          }}
        >
          <span>CS F213 / MAC F212 OOP</span>
          <span>•</span>
          <span>SEMESTER-I 2026–2027</span>
          <span>•</span>
          <span>REACH ZERO</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

