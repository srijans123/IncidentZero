// video_v3/04_capture/lib/recorder.mjs
// Accurate CDP screencast recorder per ANTIGRAVITY_MASTER_BRIEF.md Section C8
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

export async function startRecorder(page, outBase) {
  const dir = outBase + '_frames';
  fs.mkdirSync(dir, { recursive: true });
  const cdp = await page.context().newCDPSession(page);
  const frames = [];
  const events = [];
  let n = 0;

  cdp.on('Page.screencastFrame', async (f) => {
    const file = path.join(dir, `f_${String(n++).padStart(6, '0')}.jpg`);
    fs.writeFileSync(file, Buffer.from(f.data, 'base64'));
    frames.push({ file, t: f.metadata.timestamp }); // seconds since epoch
    await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
  });

  await cdp.send('Page.startScreencast', {
    format: 'jpeg',
    quality: 92,
    maxWidth: 1920,
    maxHeight: 992,
    everyNthFrame: 1
  });

  const t0 = Date.now() / 1000;

  return {
    mark(type, data = {}) {
      events.push({ t: Date.now() / 1000 - t0, type, url: page.url(), ...data });
    },
    async stop() {
      const tEnd = Date.now() / 1000;
      await cdp.send('Page.stopScreencast').catch(() => {});
      const lines = ['ffconcat version 1.0'];
      frames.forEach((fr, i) => {
        const next = frames[i + 1];
        const dur = next ? Math.max(0.01, next.t - fr.t) : Math.max(0.01, tEnd - fr.t);
        lines.push(`file '${path.basename(fr.file)}'`);
        lines.push(`duration ${dur.toFixed(4)}`);
      });
      if (frames.length) {
        lines.push(`file '${path.basename(frames[frames.length - 1].file)}'`);
      }
      const concatFile = path.join(dir, 'frames.concat');
      fs.writeFileSync(concatFile, lines.join('\n'));
      const mp4 = outBase + '.mp4';
      execFileSync('ffmpeg', [
        '-y', '-f', 'concat', '-safe', '0', '-i', concatFile,
        '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p',
        '-r', '30', mp4
      ]);
      fs.writeFileSync(outBase + '_events.json', JSON.stringify({ t0, tEnd, events }, null, 2));
      return { mp4, frames: frames.length, events: events.length };
    }
  };
}
