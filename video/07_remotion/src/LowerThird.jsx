import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

export const LowerThird = ({ actTitle, sceneTitle, sceneType }) => {
  const frame = useCurrentFrame();

  const translateX = interpolate(frame, [0, 12], [-48, 0], { extrapolateRight: 'clamp' });
  const opacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' });

  const badgeColor =
    sceneType === 'code' ? '#59C9F5' : sceneType === 'diagram' ? '#43D17A' : '#FFD84D';

  return (
    <div
      style={{
        position: 'absolute',
        top: 32,
        left: 44,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        background: '#1B1530',
        border: '4px solid #0B071E',
        borderRadius: 0,
        padding: '10px 20px',
        boxShadow: '6px 6px 0 #0B071E',
        transform: `translateX(${Math.round(translateX)}px)`,
        opacity,
        pointerEvents: 'none',
        zIndex: 90,
        maxWidth: 920
      }}
    >
      {/* 16-Bit Square Pixel LED */}
      <div
        style={{
          width: 14,
          height: 14,
          borderRadius: 0,
          background: badgeColor,
          border: '2px solid #0B071E',
          flexShrink: 0
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <span
          style={{
            fontFamily: "'Silkscreen', 'JetBrains Mono', monospace",
            fontSize: 11,
            fontWeight: 800,
            color: '#FFD84D',
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {sceneTitle ? actTitle : 'INCIDENT-ZERO (I-ITSM v2.2)'}
        </span>
        <span
          style={{
            fontFamily: "'Pixelify Sans', 'JetBrains Mono', sans-serif",
            fontSize: 16,
            fontWeight: 800,
            color: '#FFFFFF',
            marginTop: 2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {sceneTitle || actTitle || 'Architecture & Implementation'}
        </span>
      </div>

      {/* Group 76 Pixel Pill */}
      <div
        style={{
          marginLeft: 10,
          padding: '4px 10px',
          background: '#FFD84D',
          border: '2px solid #0B071E',
          color: '#1B1530',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 12,
          fontWeight: 900,
          flexShrink: 0
        }}
      >
        GRP 76
      </div>
    </div>
  );
};
