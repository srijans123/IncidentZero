import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

export const TerminalCard = ({ scene, terminalData }) => {
  const frame = useCurrentFrame();

  const title = terminalData?.title || 'System Verification Terminal';
  const lines = terminalData?.lines || [];

  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  const scale = interpolate(frame, [0, 15], [0.98, 1.0], { extrapolateRight: 'clamp' });

  // Progressive line revelation based on frame
  // Reveal ~3 lines per second (every 10 frames)
  const visibleLineCount = Math.min(lines.length, Math.floor(frame / 6) + 2);

  const getLineColor = (type) => {
    switch (type) {
      case 'prompt':
        return '#00ff9d';
      case 'success':
        return '#00ff9d';
      case 'warn':
        return '#ffb800';
      case 'error':
        return '#ff3864';
      case 'info':
      default:
        return '#cbd5e1';
    }
  };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#07090e',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '50px 80px',
        opacity,
        transform: `scale(${scale})`
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(0, 255, 157, 0.05) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />

      {/* Terminal Window */}
      <div
        style={{
          width: '100%',
          maxWidth: 1760,
          height: 840,
          background: '#090d14',
          borderRadius: 16,
          border: '2px solid rgba(0, 255, 157, 0.35)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 35px rgba(0, 255, 157, 0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Terminal Header Bar */}
        <div
          style={{
            height: 52,
            background: '#121824',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px'
          }}
        >
          {/* Traffic lights */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#ff5f56' }} />
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#ffbd2e' }} />
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#27c93f' }} />
            
            <div
              style={{
                marginLeft: 20,
                color: '#94a3b8',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 14,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <span>💻</span>
              <span>group76@bits-hyd: ~/IncidentZero</span>
            </div>
          </div>

          {/* Right status badge */}
          <div
            style={{
              background: 'rgba(0, 240, 255, 0.1)',
              border: '1px solid rgba(0, 240, 255, 0.4)',
              borderRadius: 6,
              padding: '4px 14px',
              color: '#00f0ff',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 1
            }}
          >
            {title.toUpperCase()}
          </div>
        </div>

        {/* Terminal Body */}
        <div
          style={{
            flex: 1,
            padding: '30px 40px',
            overflow: 'hidden',
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: 21,
            lineHeight: 1.7
          }}
        >
          {lines.slice(0, visibleLineCount).map((l, i) => (
            <div
              key={i}
              style={{
                color: getLineColor(l.type),
                fontWeight: l.type === 'prompt' || l.type === 'error' || l.type === 'success' ? 700 : 400,
                whiteSpace: 'pre-wrap',
                marginBottom: 6
              }}
            >
              {l.text}
            </div>
          ))}

          {/* Blinking cursor at current position */}
          {visibleLineCount < lines.length && (
            <span
              style={{
                display: 'inline-block',
                width: 12,
                height: 24,
                background: '#00ff9d',
                verticalAlign: 'middle',
                opacity: Math.sin(frame * 0.3) > 0 ? 1 : 0
              }}
            />
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};

