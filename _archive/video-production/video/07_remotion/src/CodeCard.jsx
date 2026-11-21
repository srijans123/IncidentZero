import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

export const CodeCard = ({ scene, codeData }) => {
  const frame = useCurrentFrame();

  const title = codeData?.title || scene?.title || 'Source Code Inspection';
  const fileName = codeData?.display_file || codeData?.file || scene?.file || 'Source.java';
  const linesRange = codeData?.lines || scene?.lines || '1-30';
  const rawCode = codeData?.code || '// Code snippet loading...';

  const startLine = parseInt(String(linesRange).split('-')[0], 10) || 1;
  const rawLines = rawCode.replace(/\s+$/, '').split('\n');

  const fontSize = rawLines.length > 30 ? 14 : rawLines.length > 24 ? 15 : 16;
  const lineHeight = rawLines.length > 30 ? 20 : rawLines.length > 24 ? 22 : 24;

  const renderLine = (line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('--') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
      return <span style={{ color: '#9D8FD9', fontStyle: 'italic' }}>{line}</span>;
    }
    if (trimmed.startsWith('@')) {
      return <span style={{ color: '#FFD84D', fontWeight: 'bold' }}>{line}</span>;
    }

    const keywords = [
      'package', 'import', 'public', 'private', 'protected', 'final', 'static',
      'class', 'interface', 'record', 'enum', 'void', 'return', 'new', 'throws',
      'throw', 'extends', 'implements', 'boolean', 'int', 'long', 'if', 'else',
      'for', 'while', 'try', 'catch', 'default', 'SELECT', 'FROM', 'WHERE',
      'CREATE', 'TABLE', 'CONSTRAINT', 'PRIMARY', 'KEY', 'REFERENCES', 'FOR', 'UPDATE'
    ];
    const parts = line.split(/(\b(?:package|import|public|private|protected|final|static|class|interface|record|enum|void|return|new|throws|throw|extends|implements|boolean|int|long|if|else|for|while|try|catch|default|SELECT|FROM|WHERE|CREATE|TABLE|CONSTRAINT|PRIMARY|KEY|REFERENCES|FOR|UPDATE)\b|"[^"]*"|'[^']*')/g);

    return parts.map((part, idx) => {
      if (keywords.includes(part)) {
        return <span key={idx} style={{ color: '#59C9F5', fontWeight: 700 }}>{part}</span>;
      }
      if (part.startsWith('"') || part.startsWith("'")) {
        return <span key={idx} style={{ color: '#7CE356' }}>{part}</span>;
      }
      if (/^[A-Z][A-Za-z0-9_]+$/.test(part)) {
        return <span key={idx} style={{ color: '#FFD84D' }}>{part}</span>;
      }
      return <span key={idx} style={{ color: '#FFF3C4' }}>{part}</span>;
    });
  };

  const opacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' });

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
          background: '#120C2C',
          borderRadius: 0,
          border: '4px solid #0B071E',
          outline: '2px solid #59C9F5',
          boxShadow: '8px 8px 0 #0B071E',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* 16-Bit Pixel Editor Header Bar */}
        <div
          style={{
            height: 48,
            background: '#2B2060',
            borderBottom: '4px solid #0B071E',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', overflow: 'hidden' }}>
            <div style={{ width: 14, height: 14, background: '#FF4D3D', border: '2px solid #0B071E' }} />
            <div style={{ width: 14, height: 14, background: '#FFD84D', border: '2px solid #0B071E' }} />
            <div style={{ width: 14, height: 14, background: '#43D17A', border: '2px solid #0B071E' }} />

            <div
              style={{
                marginLeft: 16,
                background: '#1B1530',
                padding: '4px 14px',
                border: '2px solid #59C9F5',
                color: '#FFFFFF',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 14,
                fontWeight: 800,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {fileName} <span style={{ color: '#FFD84D' }}>[{linesRange}]</span>
            </div>
          </div>

          <div
            style={{
              background: '#FFD84D',
              border: '2px solid #0B071E',
              boxShadow: '3px 3px 0 #0B071E',
              padding: '4px 14px',
              color: '#1B1530',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 13,
              fontWeight: 900,
              letterSpacing: 1,
              flexShrink: 0
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
            padding: '18px 0',
            overflow: 'hidden',
            fontFamily: "'JetBrains Mono', 'DejaVu Sans Mono', monospace",
            fontSize,
            lineHeight: `${lineHeight}px`
          }}
        >
          {/* Line Numbers */}
          <div
            style={{
              width: 76,
              background: '#171136',
              color: '#9D8FD9',
              textAlign: 'right',
              paddingRight: 16,
              userSelect: 'none',
              borderRight: '2px solid #32266E',
              flexShrink: 0
            }}
          >
            {rawLines.map((_, i) => (
              <div key={i} style={{ fontWeight: 700 }}>{startLine + i}</div>
            ))}
          </div>

          {/* Code Lines with Pre-Wrap so nothing overflows */}
          <div style={{ flex: 1, paddingLeft: 20, paddingRight: 20, overflow: 'hidden' }}>
            {rawLines.map((line, i) => (
              <div
                key={i}
                style={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  backgroundColor: i % 2 === 1 ? 'rgba(27, 21, 48, 0.45)' : 'transparent'
                }}
              >
                {renderLine(line)}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Status Bar */}
        <div
          style={{
            height: 36,
            background: '#1B1530',
            borderTop: '2px solid #59C9F5',
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
          <span>■ COMPILED & VERIFIED // ARCHUNIT R1–R9 PASSED</span>
          <span style={{ color: '#D4CBF7' }}>INCIDENT-ZERO v2.2 · GROUP 76</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
