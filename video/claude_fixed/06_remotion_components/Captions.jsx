import React from 'react';

export const Captions = ({ text, currentWord }) => {
  if (!text) return null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 110,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 80px',
        pointerEvents: 'none',
        zIndex: 100
      }}
    >
      <div
        style={{
          background: '#1B1530',
          border: '4px solid #0B071E',
          outline: '2px solid #FFD84D',
          borderRadius: 0,
          padding: '14px 32px',
          maxWidth: 1520,
          textAlign: 'center',
          boxShadow: '6px 6px 0 #0B071E',
          overflow: 'hidden'
        }}
      >
        <span
          style={{
            fontFamily: "'Pixelify Sans', 'JetBrains Mono', monospace",
            fontSize: 26,
            fontWeight: 800,
            color: '#FFF3C4',
            lineHeight: 1.35,
            letterSpacing: 0.5,
            textShadow: '2px 2px 0 #0B071E',
            wordBreak: 'break-word'
          }}
        >
          {text}
        </span>
      </div>
    </div>
  );
};
