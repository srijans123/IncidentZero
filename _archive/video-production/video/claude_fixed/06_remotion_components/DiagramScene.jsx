import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import diagramSvgs from '../01_15_diagrams/diagram_svgs.json';

export const DiagramScene = ({ scene }) => {
  const frame = useCurrentFrame();

  const diagramId = scene?.diagram_id || 'hexagonal_architecture';
  const svgContent = diagramSvgs[diagramId] || diagramSvgs['hexagonal_architecture'] || '';

  const opacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#1E1646',
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
          imageRendering: 'pixelated'
        }}
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    </AbsoluteFill>
  );
};
