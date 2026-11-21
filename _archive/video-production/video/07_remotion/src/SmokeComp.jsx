import React from 'react';
import { AbsoluteFill, Video, Audio, staticFile } from 'remotion';

export const SmokeComp = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#0c0e14', justifyContent: 'center', alignItems: 'center' }}>
      <Video
        src={staticFile('smoke_capture.mp4')}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      <Audio src={staticFile('smoke_test.wav')} />
      <div
        style={{
          position: 'absolute',
          bottom: 60,
          left: 60,
          background: 'rgba(12, 14, 20, 0.85)',
          border: '2px solid #00f0ff',
          borderRadius: 8,
          padding: '12px 24px',
          color: '#00f0ff',
          fontFamily: 'sans-serif',
          fontSize: 28,
          fontWeight: 'bold',
          boxShadow: '0 0 20px rgba(0, 240, 255, 0.4)'
        }}
      >
        INCIDENT-ZERO · PHASE 0 SMOKE TEST · GROUP 76
      </div>
    </AbsoluteFill>
  );
};

