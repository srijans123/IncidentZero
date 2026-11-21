import React from 'react';
import { Composition } from 'remotion';
import { MasterVideo } from './MasterVideo.jsx';
import { ActPreview } from './ActPreview.jsx';
import { SmokeComp } from './SmokeComp.jsx';
import manifest from '../public/composition_manifest.json';

export const RemotionRoot = () => {
  const acts = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <>
      {/* 1. Full 15-20 Min Master Video */}
      <Composition
        id="MasterVideo"
        component={MasterVideo}
        durationInFrames={manifest.total_frames || 31016}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* 2. Act-by-Act Compositions (Rock-solid modular rendering) */}
      {acts.map((actNum) => {
        const actScenes = (manifest.scenes || []).filter((s) => s.act === actNum);
        const actFrames = actScenes.reduce((acc, s) => acc + s.duration_frames, 0) || 1800;
        return (
          <Composition
            key={`Act${actNum}`}
            id={`Act${actNum}`}
            component={ActPreview}
            defaultProps={{ actNum }}
            durationInFrames={actFrames}
            fps={30}
            width={1920}
            height={1080}
          />
        );
      })}

      {/* 3. Act 0 Fast Verification Preview */}
      <Composition
        id="Act0Preview"
        component={ActPreview}
        defaultProps={{ actNum: 0 }}
        durationInFrames={1617}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* 4. Smoke Test Composition */}
      <Composition
        id="SmokeTest"
        component={SmokeComp}
        durationInFrames={60}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
