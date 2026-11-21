import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

export const TitleCard = ({ scene }) => {
  const frame = useCurrentFrame();

  const title = scene?.title || 'Incident-Zero (I-ITSM v2.2)';
  const subtitle = scene?.subtitle || 'Autonomous Enterprise Campus Service Management';

  const opacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' });
  const translateY = interpolate(frame, [0, 15], [20, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#1E1646',
        backgroundImage:
          'repeating-conic-gradient(#261C58 0% 25%, transparent 0% 50%)',
        backgroundSize: '48px 48px',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 100px',
        opacity
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 1500,
          background: '#1B1530',
          border: '6px solid #0B071E',
          outline: '3px solid #FFD84D',
          boxShadow: '10px 10px 0 #59C9F5, 18px 18px 0 #0B071E',
          padding: '64px 72px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          transform: `translateY(${Math.round(translateY)}px)`
        }}
      >
        {/* Top Butter Eyebrow Pill */}
        <div
          style={{
            background: '#FFD84D',
            border: '4px solid #0B071E',
            boxShadow: '4px 4px 0 #0B071E',
            padding: '8px 28px',
            color: '#1B1530',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 16,
            fontWeight: 900,
            letterSpacing: 2.5,
            marginBottom: 36
          }}
        >
          CS F213 / MAC F212 · GROUP 76 · BITS PILANI HYDERABAD
        </div>

        {/* Main Title with 16-Bit Hard Drop Shadow */}
        <h1
          style={{
            fontFamily: "'Pixelify Sans', 'JetBrains Mono', monospace",
            fontSize: 60,
            fontWeight: 900,
            color: '#FFFFFF',
            letterSpacing: 2,
            margin: 0,
            textShadow: '3px 3px 0 #FF4D3D, 6px 6px 0 #0B071E',
            lineHeight: 1.2,
            wordBreak: 'break-word'
          }}
        >
          {title}
        </h1>

        {/* Stepped Pixel Divider */}
        <div style={{ display: 'flex', width: 480, height: 8, margin: '32px 0', border: '2px solid #0B071E' }}>
          <div style={{ flex: 1, background: '#FF4D3D' }} />
          <div style={{ flex: 1, background: '#FFD84D' }} />
          <div style={{ flex: 1, background: '#43D17A' }} />
        </div>

        {/* Cream Subtitle Box */}
        <div
          style={{
            background: '#FFF8DC',
            border: '4px solid #0B071E',
            boxShadow: '6px 6px 0 #0B071E',
            padding: '16px 36px',
            maxWidth: 1180
          }}
        >
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 24,
              fontWeight: 900,
              color: '#1B1530',
              wordBreak: 'break-word'
            }}
          >
            {subtitle}
          </span>
        </div>

        {/* Bottom Chunky Pixel Pills */}
        <div style={{ display: 'flex', gap: 28, marginTop: 44 }}>
          {[
            { label: 'BITS PILANI HYDERABAD', bg: '#43D17A', fg: '#1B1530' },
            { label: 'SEMESTER-I 2026–2027', bg: '#59C9F5', fg: '#1B1530' },
            { label: 'REACH ZERO · I-ITSM v2.2', bg: '#7C5CFF', fg: '#FFFFFF' }
          ].map((p, i) => (
            <div
              key={i}
              style={{
                background: p.bg,
                color: p.fg,
                border: '4px solid #0B071E',
                boxShadow: '4px 4px 0 #0B071E',
                padding: '10px 24px',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 15,
                fontWeight: 900,
                letterSpacing: 1
              }}
            >
              {p.label}
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
