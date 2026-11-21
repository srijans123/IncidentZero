import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, staticFile } from 'remotion';

export const CodeCard = ({ scene, codeData }) => {
  const frame = useCurrentFrame();

  const title = codeData?.title || scene.title || 'Source Code Inspection';
  const fileName = codeData?.display_file || scene.file || 'Source.java';
  const linesRange = codeData?.lines || scene.lines || '1-30';
  const rawCode = codeData?.code || '// Code snippet loading...';

  const lines = rawCode.split('\n');

  // Syntax colorizer helper
  const renderLine = (line) => {
    // Basic regex-based token coloring for Java/SQL
    if (line.trim().startsWith('//') || line.trim().startsWith('--')) {
      return <span style={{ color: '#6b7280', fontStyle: 'italic' }}>{line}</span>;
    }
    if (line.trim().startsWith('@')) {
      return <span style={{ color: '#ffb800', fontWeight: 'bold' }}>{line}</span>;
    }

    // Replace keywords
    const keywords = ['package', 'import', 'public', 'private', 'protected', 'final', 'static', 'class', 'interface', 'record', 'void', 'return', 'new', 'throws', 'extends', 'implements', 'boolean', 'int', 'long', 'SELECT', 'FROM', 'WHERE', 'CREATE', 'TABLE', 'CONSTRAINT', 'PRIMARY', 'KEY', 'REFERENCES', 'FOR', 'UPDATE'];
    const parts = line.split(/(\b(?:package|import|public|private|protected|final|static|class|interface|record|void|return|new|throws|extends|implements|boolean|int|long|SELECT|FROM|WHERE|CREATE|TABLE|CONSTRAINT|PRIMARY|KEY|REFERENCES|FOR|UPDATE)\b|"[^"]*"|'[^']*')/g);

    return parts.map((part, idx) => {
      if (keywords.includes(part)) {
        return <span key={idx} style={{ color: '#00f0ff', fontWeight: '600' }}>{part}</span>;
      }
      if (part.startsWith('"') || part.startsWith("'")) {
        return <span key={idx} style={{ color: '#00ff9d' }}>{part}</span>;
      }
      if (/^[A-Z][A-Za-z0-9_]+$/.test(part)) {
        return <span key={idx} style={{ color: '#ffb800' }}>{part}</span>;
      }
      return <span key={idx} style={{ color: '#e2e8f0' }}>{part}</span>;
    });
  };

  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  const scale = interpolate(frame, [0, 15], [0.98, 1.0], { extrapolateRight: 'clamp' });

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
      {/* Background cyber grid */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(0, 240, 255, 0.05) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />

      {/* Code Editor Window */}
      <div
        style={{
          width: '100%',
          maxWidth: 1760,
          height: 840,
          background: '#0d111a',
          borderRadius: 16,
          border: '2px solid rgba(0, 240, 255, 0.4)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 240, 255, 0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Editor Title Bar */}
        <div
          style={{
            height: 52,
            background: '#141a26',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px'
          }}
        >
          {/* Traffic light buttons */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#ff5f56' }} />
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#ffbd2e' }} />
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#27c93f' }} />
            
            {/* File Tab */}
            <div
              style={{
                marginLeft: 20,
                background: '#0d111a',
                padding: '6px 16px',
                borderRadius: '6px 6px 0 0',
                border: '1px solid rgba(0, 240, 255, 0.3)',
                borderBottom: 'none',
                color: '#00f0ff',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 14,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <span>📄</span>
              <span>{fileName}</span>
              <span style={{ color: '#718096', fontSize: 12 }}>({linesRange})</span>
            </div>
          </div>

          {/* Right badge */}
          <div
            style={{
              background: 'rgba(0, 255, 157, 0.1)',
              border: '1px solid rgba(0, 255, 157, 0.4)',
              borderRadius: 6,
              padding: '4px 14px',
              color: '#00ff9d',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 1
            }}
          >
            {title.toUpperCase()}
          </div>
        </div>

        {/* Code Content Area */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            padding: '24px 0',
            overflow: 'hidden',
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: 20,
            lineHeight: 1.6
          }}
        >
          {/* Line Numbers */}
          <div
            style={{
              width: 80,
              color: '#4b5563',
              textAlign: 'right',
              paddingRight: 20,
              userSelect: 'none',
              borderRight: '1px solid rgba(255, 255, 255, 0.06)'
            }}
          >
            {lines.map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>

          {/* Code Lines */}
          <div style={{ flex: 1, paddingLeft: 24, overflowX: 'hidden' }}>
            {lines.map((line, i) => (
              <div key={i} style={{ whiteSpace: 'pre' }}>
                {renderLine(line)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

