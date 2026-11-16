import React from 'react';

export const Captions = ({ text, currentWord }) => {
  if (!text) return null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 145, // Cleanly above bottom 12% player controls
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
          background: 'rgba(5, 7, 12, 0.94)',
          backdropFilter: 'blur(16px)',
          border: '1.5px solid rgba(0, 240, 255, 0.5)',
          borderRadius: 14,
          padding: '16px 36px',
          maxWidth: 1450,
          textAlign: 'center',
          boxShadow: '0 10px 32px rgba(0, 0, 0, 0.9), 0 0 20px rgba(0, 240, 255, 0.2)'
        }}
      >
        <span
          style={{
            fontFamily: "'Segoe UI', -apple-system, sans-serif",
            fontSize: 28,
            fontWeight: 700,
            color: '#ffffff',
            lineHeight: 1.4,
            letterSpacing: 0.5,
            textShadow: '0 2px 10px rgba(0,0,0,1.0)'
          }}
        >
          {text}
        </span>
      </div>
    </div>
  );
};

