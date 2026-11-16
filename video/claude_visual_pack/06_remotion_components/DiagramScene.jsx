import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import diagramSvgs from '../public/diagram_svgs.json';

export const DiagramScene = ({ scene }) => {
  const frame = useCurrentFrame();

  const diagramId = scene.diagram_id || 'hexagonal_architecture';
  const svgContent = diagramSvgs[diagramId] || diagramSvgs['hexagonal_architecture'] || '';

  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  // Subtle cinematic zoom (1.0 to 1.03 over scene duration)
  const scale = interpolate(frame, [0, 300], [1.0, 1.03], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#07090e',
        justifyContent: 'center',
        alignItems: 'center',
        opacity,
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          transform: `scale(${scale})`,
          transition: 'transform 0.1s linear'
        }}
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    </AbsoluteFill>
  );
};

