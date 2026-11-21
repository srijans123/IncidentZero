import React from 'react';
import { AbsoluteFill, Sequence, Audio, staticFile } from 'remotion';
import manifest from '../public/composition_manifest.json';
import { CodeCard } from './CodeCard.jsx';
import { TerminalCard } from './TerminalCard.jsx';
import { DiagramScene } from './DiagramScene.jsx';
import { ScreenScene } from './ScreenScene.jsx';
import { TitleCard } from './TitleCard.jsx';
import { MemberCard } from './MemberCard.jsx';
import { Captions } from './Captions.jsx';
import { LowerThird } from './LowerThird.jsx';

export const ActPreview = ({ actNum = 0 }) => {
  const allScenes = manifest.scenes || [];
  const actScenes = allScenes.filter((s) => s.act === actNum);

  // Normalize frame offsets so act starts at frame 0
  const firstFrame = actScenes[0]?.start_frame || 0;

  return (
    <AbsoluteFill style={{ backgroundColor: '#06080d' }}>
      {actScenes.map((sc) => {
        const localFrom = sc.start_frame - firstFrame;

        return (
          <Sequence
            key={sc.id}
            from={localFrom}
            durationInFrames={sc.duration_frames}
          >
            {/* Audio Narration */}
            <Audio src={staticFile(`audio/scenes/${sc.id}.wav`)} />

            {/* Visual Content based on Scene Type */}
            {sc.type === 'screen' && <ScreenScene scene={sc} />}
            {sc.type === 'diagram' && <DiagramScene scene={sc} />}
            {sc.type === 'code' && <CodeCard scene={sc} codeData={sc.code_data} />}
            {sc.type === 'terminal' && <TerminalCard scene={sc} terminalData={sc.terminal_data} />}
            {sc.type === 'title' && <TitleCard scene={sc} />}
            {sc.type === 'member_slot' && <MemberCard scene={sc} />}

            {/* Top LowerThird HUD */}
            {sc.type !== 'title' && sc.type !== 'member_slot' && (
              <LowerThird
                actTitle={`ACT ${sc.act}: ${sc.act_title}`}
                sceneTitle={sc.title || ''}
                sceneType={sc.type}
              />
            )}

            {/* Bottom Captions */}
            <Captions text={sc.text} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

