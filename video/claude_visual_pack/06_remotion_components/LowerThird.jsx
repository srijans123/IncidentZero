import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

export const LowerThird = ({ actTitle, sceneTitle, sceneType }) => {
  const frame = useCurrentFrame();

  // Subtle slide in over 15 frames
  const translateX = interpolate(frame, [0, 15], [-50, 0], { extrapolateRight: 'clamp' });
  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        position: 'absolute',
        top: 36,
        left: 48,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        background: 'rgba(8, 12, 22, 0.85)',
        backdropFilter: 'blur(10px)',
        border: '1.5px solid rgba(0, 240, 255, 0.4)',
        borderRadius: 10,
        padding: '10px 20px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6), 0 0 15px rgba(0, 240, 255, 0.15)',
        transform: `translateX(${translateX}px)`,
        opacity,
        pointerEvents: 'none',
        zIndex: 90
      }}
    >
      {/* Category indicator icon/badge */}
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: sceneType === 'code' ? '#00f0ff' : sceneType === 'diagram' ? '#00ff9d' : '#ffb800',
          boxShadow: `0 0 10px ${sceneType === 'code' ? '#00f0ff' : sceneType === 'diagram' ? '#00ff9d' : '#ffb800'}`
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            fontWeight: 800,
            color: '#00f0ff',
            letterSpacing: 1.5,
            textTransform: 'uppercase'
          }}
        >
          {sceneTitle ? actTitle : 'INCIDENT-ZERO (I-ITSM v2.2)'}
        </span>
        <span
          style={{
            fontFamily: "'Segoe UI', sans-serif",
            fontSize: 15,
            fontWeight: 700,
            color: '#ffffff',
            marginTop: 2
          }}
        >
          {sceneTitle || actTitle || 'Architecture & Implementation'}
        </span>
      </div>

      {/* Group Pill */}
      <div
        style={{
          marginLeft: 12,
          paddingLeft: 12,
          borderLeft: '1px solid rgba(255, 255, 255, 0.15)',
          color: '#00ff9d',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 12,
          fontWeight: 800
        }}
      >
        GRP 76
      </div>
    </div>
  );
};

