import React from 'react';
import { AbsoluteFill, Video, staticFile, useCurrentFrame, interpolate } from 'remotion';

export const ScreenScene = ({ scene, boxData }) => {
  const frame = useCurrentFrame();

  const clipUrl = staticFile(`clips/${scene.id}.mp4`);

  // Pulse effect for highlight glow
  const pulse = Math.sin(frame * 0.2) * 0.3 + 0.7;
  const slowZoom = interpolate(frame, [0, 450], [1.0, 1.025], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: '#1E1646', overflow: 'hidden' }}>
      {/* 16-Bit Pixel Fallback card behind video so black never reaches output */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#1E1646',
          backgroundImage: 'repeating-conic-gradient(#261C58 0% 25%, transparent 0% 50%)',
          backgroundSize: '48px 48px',
          color: '#FFD84D',
          fontFamily: "'JetBrains Mono', monospace"
        }}
      >
        <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 8, background: '#1B1530', border: '3px solid #0B071E', boxShadow: '6px 6px 0 #0B071E', padding: '8px 24px' }}>
          {scene.target_url || 'INCIDENT-ZERO WORKBENCH INTERFACE'}
        </div>
        <div style={{ fontSize: 14, color: '#FFF3C4', background: '#2B2060', padding: '4px 16px', border: '2px solid #0B071E' }}>
          BITS Pilani Hyderabad Campus · CS F213
        </div>
      </div>

      {/* Real Screen Recording Video with smooth zoom */}
      <Video
        src={clipUrl}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${slowZoom})`
        }}
      />

      {/* Dynamic 16-Bit Bounding Box Highlight */}
      {boxData && boxData.width > 0 && (
        <div
          style={{
            position: 'absolute',
            left: boxData.x - 4,
            top: boxData.y - 4,
            width: boxData.width + 8,
            height: boxData.height + 8,
            border: '3px solid #FFD84D',
            boxShadow: `4px 4px 0 #0B071E, 0 0 ${15 * pulse}px rgba(89, 201, 245, 0.8)`,
            pointerEvents: 'none',
            transition: 'all 0.1s ease-out'
          }}
        >
          {/* Square Pixel Reticle Corners */}
          <div style={{ position: 'absolute', top: -5, left: -5, width: 10, height: 10, background: '#FF4D3D', border: '1px solid #0B071E' }} />
          <div style={{ position: 'absolute', top: -5, right: -5, width: 10, height: 10, background: '#FF4D3D', border: '1px solid #0B071E' }} />
          <div style={{ position: 'absolute', bottom: -5, left: -5, width: 10, height: 10, background: '#43D17A', border: '1px solid #0B071E' }} />
          <div style={{ position: 'absolute', bottom: -5, right: -5, width: 10, height: 10, background: '#43D17A', border: '1px solid #0B071E' }} />
        </div>
      )}
    </AbsoluteFill>
  );
};

