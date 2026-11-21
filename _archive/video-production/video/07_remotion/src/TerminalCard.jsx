import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

export const TerminalCard = ({ scene, terminalData }) => {
  const frame = useCurrentFrame();

  const title = terminalData?.title || 'System Verification Terminal';
  const command = terminalData?.command || 'mvn test';
  const lines = terminalData?.lines || [];

  const opacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' });
  const visibleLineCount = Math.min(lines.length, Math.floor(frame / 6) + 2);

  const getLineColor = (type) => {
    switch (type) {
      case 'prompt':
        return '#7CE356';
      case 'success':
        return '#43D17A';
      case 'warn':
        return '#FFD84D';
      case 'error':
        return '#FF4D3D';
      case 'info':
      default:
        return '#FFF3C4';
    }
  };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#1E1646',
        backgroundImage:
          'repeating-conic-gradient(#261C58 0% 25%, transparent 0% 50%)',
        backgroundSize: '48px 48px',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '48px 60px',
        opacity
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 1800,
          height: 920,
          background: '#0B071E',
          borderRadius: 0,
          border: '4px solid #0B071E',
          outline: '2px solid #43D17A',
          boxShadow: '8px 8px 0 #0B071E',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* 16-Bit Terminal Header */}
        <div
          style={{
            height: 48,
            background: '#1B1530',
            borderBottom: '4px solid #0B071E',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ width: 14, height: 14, background: '#FF4D3D', border: '2px solid #0B071E' }} />
            <div style={{ width: 14, height: 14, background: '#FFD84D', border: '2px solid #0B071E' }} />
            <div style={{ width: 14, height: 14, background: '#43D17A', border: '2px solid #0B071E' }} />
            <span
              style={{
                marginLeft: 16,
                color: '#FFF3C4',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 14,
                fontWeight: 800
              }}
            >
              group76@bits-hyd:~/IncidentZero — $ {command}
            </span>
          </div>

          <div
            style={{
              background: '#43D17A',
              border: '2px solid #0B071E',
              boxShadow: '3px 3px 0 #0B071E',
              padding: '4px 14px',
              color: '#1B1530',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              fontWeight: 900,
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
            padding: '24px 32px',
            overflow: 'hidden',
            fontFamily: "'JetBrains Mono', 'DejaVu Sans Mono', monospace",
            fontSize: 17,
            lineHeight: 1.65
          }}
        >
          {lines.slice(0, visibleLineCount).map((l, i) => (
            <div
              key={i}
              style={{
                color: getLineColor(l.type),
                fontWeight: l.type === 'prompt' || l.type === 'error' || l.type === 'success' ? 800 : 500,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                marginBottom: 6
              }}
            >
              {l.text}
            </div>
          ))}

          <span
            style={{
              display: 'inline-block',
              width: 12,
              height: 20,
              background: '#FFD84D',
              verticalAlign: 'middle',
              opacity: Math.sin(frame * 0.35) > 0 ? 1 : 0
            }}
          />
        </div>

        {/* Footer */}
        <div
          style={{
            height: 36,
            background: '#1B1530',
            borderTop: '2px solid #43D17A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            fontWeight: 800,
            color: '#7CE356',
            flexShrink: 0
          }}
        >
          <span>■ EXECUTION COMPLETE // EXIT CODE 0</span>
          <span style={{ color: '#FFD84D' }}>16-BIT CRT OPS CONSOLE</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
