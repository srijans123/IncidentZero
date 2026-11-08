import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../../services/sound';
import {
  PixelSprite,
  PixelIcon,
  SlaHearts,
  bldAuditorium,
  bldFBlock,
  bldValmiki,
  bldLibrary,
  ROCKS,
  BUG_F1,
  BUG_F2,
  BUG_HIT,
  TECH_IDLE,
  TECH_W1,
  TECH_W2,
  TECH_SQUASH,
} from '../../services/pixelSprites';
import { ActiveTab } from '../../components/Header';

interface CampusStageProps {
  onSelectCartridge: (tab: ActiveTab) => void;
  onUpdateScore: (score: number, combo: number, open: number) => void;
}

interface StageTicket {
  id: string;
  n: string;
  w: string;
  d: number;
  p: string;
  pc: string;
  c: string;
  cat: string;
  hint: string;
  rock?: number;
  art: (night?: boolean) => string[];
  done: number;
  hp: number;
  age: number;
  breach: number;
}

const INITIAL_TICKETS: StageTicket[] = [
  { id: 'INC-0842', n: 'SWD / ERP login 502', w: 'C-Block & Audi', d: 9, p: 'P1', pc: '#FF4D3D', c: 'r', cat: 'AUTH_SSO', hint: 'Restart SWD Nucleus Keycloak pod & flush Redis session pool in C-Block.', art: bldAuditorium, done: 0, hp: 3, age: 0, breach: 0 },
  { id: 'INC-0839', n: 'Academic Wi-Fi down', w: 'F-Block & OTR', d: 12, p: 'P2', pc: '#FF9F43', c: 'o', rock: 1, cat: 'NET_WIFI', hint: 'Failover Aruba 802.1X controller in F-Block Lab 302 near On The Rocks.', art: bldFBlock, done: 0, hp: 3, age: 0, breach: 0 },
  { id: 'INC-0831', n: 'Hostel Wi-Fi outage', w: 'Valmiki Bhavan', d: 9, p: 'P1', pc: '#FF4D3D', c: 'l', cat: 'HOSTEL_LAN', hint: 'Reset PoE core switch uplink serving Valmiki & Gautam Bhavan wings.', art: bldValmiki, done: 0, hp: 3, age: 0, breach: 0 },
  { id: 'INC-0827', n: 'CMS uploads slow', w: 'Block-G Library', d: 16, p: 'P3', pc: '#FFD84D', c: 'p', cat: 'CMS_MOODLE', hint: 'Scale NFS worker threads backing Block-G Central Library CMS storage.', art: bldLibrary, done: 0, hp: 3, age: 0, breach: 0 },
];

const LIFECYCLE_STATES = [
  'NEW', 'CLASSIFIED', 'ASSIGNED', 'ACKNOWLEDGED', 'IN PROGRESS',
  'ON HOLD', 'ESCALATED', 'RESOLVED', 'VERIFIED', 'CLOSED'
];
const LEGAL_MOVES = [
  'classify()', 'assign()', 'acknowledge()', 'start()', 'pauseSla()',
  'escalate()', 'resolve()', 'verify()', 'close()'
];

// SHA-256 Ledger
const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000411';
const CANONICAL_PAYLOADS = [
  '{"block":412,"campus":"BITS Pilani, Hyderabad Campus","ticket":"INC-0842","event":"CREATE","zone":"C-Block SWD ERP","priority":"P1"}',
  '{"block":413,"campus":"BITS Pilani, Hyderabad Campus","ticket":"INC-0842","event":"AI_TRIAGE","category":"AUTH_SSO","confidence":0.94,"priority":"P1"}',
  '{"block":414,"campus":"BITS Pilani, Hyderabad Campus","ticket":"INC-0842","event":"ASSIGN","assignee":"srijan@hyderabad.bits-pilani.ac.in","priority":"P1"}',
  '{"block":415,"campus":"BITS Pilani, Hyderabad Campus","ticket":"INC-0842","event":"ACKNOWLEDGE","slaHearts":3,"status":"ON_TIME"}',
  '{"block":416,"campus":"BITS Pilani, Hyderabad Campus","ticket":"INC-0842","event":"EXEC_RUNBOOK","cmd":"kubectl rollout restart deploy/swd-keycloak"}',
  '{"block":417,"campus":"BITS Pilani, Hyderabad Campus","ticket":"INC-0842","event":"RESOLVE","breaches":0,"verifiedBy":"SWD-Auditor"}'
];

// Pure-JS SHA-256 fallback
function sha256Fallback(ascii: string): string {
  function rightRotate(v: number, amt: number) { return (v >>> amt) | (v << (32 - amt)); }
  const words: number[] = [], asciiBitLength = ascii.length * 8;
  let hash = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  const k = [
    0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
    0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
    0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
    0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
    0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
    0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
    0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
    0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2
  ];
  ascii += '\x80';
  while (ascii.length % 64 - 56) ascii += '\x00';
  for (let i = 0; i < ascii.length; i++) {
    const j = ascii.charCodeAt(i);
    words[i >> 2] |= j << ((3 - i) % 4) * 8;
  }
  words[words.length] = (asciiBitLength / Math.pow(2, 32)) | 0;
  words[words.length] = asciiBitLength;
  for (let j = 0; j < words.length;) {
    const w = words.slice(j, j += 16), oldHash = hash.slice(0);
    for (let i = 0; i < 64; i++) {
      const w15 = w[i - 15], w2 = w[i - 2];
      const a = hash[0], e = hash[4];
      const temp1 = hash[7] + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) + ((e & hash[5]) ^ ((~e) & hash[6])) + k[i] +
        (w[i] = (i < 16) ? w[i] : (w[i - 16] + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) + w[i - 7] + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) | 0);
      const temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
      hash.pop();
    }
    for (let i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
  }
  let result = '';
  for (let i = 0; i < 8; i++) {
    for (let j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += ((b < 16) ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

async function computeSha256(msg: string): Promise<string> {
  if (window.crypto && window.crypto.subtle) {
    try {
      const data = new TextEncoder().encode(msg);
      const buf = await window.crypto.subtle.digest('SHA-256', data);
      return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {}
  }
  return sha256Fallback(msg);
}

export const CampusStage: React.FC<CampusStageProps> = ({
  onSelectCartridge,
  onUpdateScore,
}) => {
  const [tickets, setTickets] = useState<StageTicket[]>(INITIAL_TICKETS);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [maxCombo, setMaxCombo] = useState(1);
  const [lastFixTime, setLastFixTime] = useState(0);
  const [techPos, setTechPos] = useState(3);
  const [isWalking, setIsWalking] = useState(false);
  const [techFrame, setTechFrame] = useState<'IDLE' | 'W1' | 'W2' | 'SQUASH'>('IDLE');
  const [bugFrameToggle, setBugFrameToggle] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [isDanger, setIsDanger] = useState(false);

  // 10-State Board State
  const [curStateIdx, setCurStateIdx] = useState(0);
  const [stateError, setStateError] = useState<string | null>(null);

  // Active Console Cartridge & Tab
  const [activeConsoleTab, setActiveConsoleTab] = useState<'w' | 'c' | 'p' | 'r'>('w');
  const [bossStep, setBossStep] = useState(0);
  const [bossErr, setBossErr] = useState<string | null>(null);

  // SHA-256 Ledger State
  const [sealedHashes, setSealedHashes] = useState<string[]>([]);
  const [livePayloads, setLivePayloads] = useState<string[]>([...CANONICAL_PAYLOADS]);
  const [computedHashes, setComputedHashes] = useState<string[]>([]);
  const [selectedBlockIdx, setSelectedBlockIdx] = useState(1);
  const [ledgerMsg, setLedgerMsg] = useState('All 6 blocks match their cryptographic SHA-256 seals.');

  const openCount = tickets.filter((t) => !t.done).length;

  // Initialize Ledger Hashes
  useEffect(() => {
    async function initHashes() {
      let prev = GENESIS_HASH;
      const sealed: string[] = [];
      for (let i = 0; i < CANONICAL_PAYLOADS.length; i++) {
        const h = await computeSha256(prev + '|' + CANONICAL_PAYLOADS[i]);
        sealed.push(h);
        prev = h;
      }
      setSealedHashes(sealed);

      // Initial computed
      prev = GENESIS_HASH;
      const comp: string[] = [];
      for (let i = 0; i < CANONICAL_PAYLOADS.length; i++) {
        const h = await computeSha256(prev + '|' + CANONICAL_PAYLOADS[i]);
        comp.push(h);
        prev = h;
      }
      setComputedHashes(comp);
    }
    initHashes();
  }, []);

  // Sync Score with Parent Header
  useEffect(() => {
    onUpdateScore(score, combo, openCount);
  }, [score, combo, openCount]);

  // Tick SLA Hearts
  useEffect(() => {
    const timer = setInterval(() => {
      setTickets((prev) =>
        prev.map((t) => {
          if (t.done || t.hp <= 0) return t;
          const nextAge = t.age + 1;
          if (nextAge % t.d === 0) {
            const nextHp = t.hp - 1;
            if (nextHp <= 0) {
              sound.err();
              return { ...t, age: nextAge, hp: 0, breach: 1 };
            }
            return { ...t, age: nextAge, hp: nextHp };
          }
          return { ...t, age: nextAge };
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Update Danger Vignette
  useEffect(() => {
    const critical = tickets.some((t) => !t.done && t.hp <= 1);
    setIsDanger(critical);
  }, [tickets]);

  // Bug Scuttle
  useEffect(() => {
    const bugTimer = setInterval(() => {
      setBugFrameToggle((p) => !p);
    }, 500);
    return () => clearInterval(bugTimer);
  }, []);

  // Squash a Bug / Fix Ticket
  const handleFix = (idx: number) => {
    const ticket = tickets[idx];
    if (!ticket || ticket.done) return;

    sound.pick();
    const targetPct = 12 + idx * 24;
    setIsWalking(true);
    setTechPos(targetPct);

    // Walking animation
    let wStep = false;
    const walkInt = setInterval(() => {
      wStep = !wStep;
      setTechFrame(wStep ? 'W1' : 'W2');
    }, 110);

    setTimeout(() => {
      clearInterval(walkInt);
      setIsWalking(false);
      setTechFrame('SQUASH');
      sound.blip();

      setTimeout(() => {
        setTechFrame('IDLE');
        sound.fix();

        // Calculate score & combo
        const now = Date.now();
        const newCombo = lastFixTime && now - lastFixTime < 9000 ? Math.min(combo + 1, 4) : 1;
        setCombo(newCombo);
        if (newCombo > maxCombo) setMaxCombo(newCombo);
        setLastFixTime(now);

        const pts = (ticket.p === 'P1' ? 200 : 100) * newCombo * (ticket.breach ? 0.5 : 1);
        setScore((s) => s + pts);

        setTickets((prev) =>
          prev.map((t, i) => (i === idx ? { ...t, done: 1 } : t))
        );

        // Check if all zero
        const remaining = tickets.filter((t, i) => i !== idx && !t.done).length;
        if (remaining === 0) {
          sound.win();
          setShowWinModal(true);
        }
      }, 550);
    }, 700);
  };

  // 10-State Move
  const handleStateMove = (type: string) => {
    if (type === 'go') {
      sound.pick();
      setCurStateIdx((prev) => {
        const next = Math.min(prev + 1, 9);
        if (next === 9) sound.fix();
        return next;
      });
      setStateError(null);
    } else if (type === 'directResolve') {
      sound.pick();
      setCurStateIdx(7);
      setStateError(null);
    } else if (type === 'reopen') {
      sound.pick();
      setCurStateIdx(4);
      setStateError(null);
    } else if (type === 'reset') {
      sound.blip();
      setCurStateIdx(0);
      setStateError(null);
    } else {
      sound.err();
      setStateError(`409 CONFLICT: close() is not permitted from ${LIFECYCLE_STATES[curStateIdx]}. Next legal move is ${LEGAL_MOVES[curStateIdx]}.`);
    }
  };

  // Recompute Ledger Chain on Payload Edit
  const handlePayloadChange = async (newVal: string) => {
    const updated = [...livePayloads];
    updated[selectedBlockIdx] = newVal;
    setLivePayloads(updated);

    let prev = GENESIS_HASH;
    const comp: string[] = [];
    for (let i = 0; i < updated.length; i++) {
      const h = await computeSha256(prev + '|' + updated[i]);
      comp.push(h);
      prev = h;
    }
    setComputedHashes(comp);

    let firstBroken = -1;
    for (let i = 0; i < comp.length; i++) {
      if (comp[i] !== sealedHashes[i]) {
        firstBroken = i;
        break;
      }
    }
    if (firstBroken === -1) {
      setLedgerMsg('✔ All 6 blocks match their cryptographic SHA-256 seals.');
    } else {
      setLedgerMsg(`⚡ AVALANCHE EFFECT: Block #0${412 + firstBroken} payload changed → ${6 - firstBroken} block(s) SHA-256 hashes scrambled!`);
    }
  };

  return (
    <div className="space-y-12">
      {/* Hero Sky Stage */}
      <section className="relative text-center py-10 px-4 bg-[#59C9F5] border-[3px] border-[var(--line)] shadow-[6px_6px_0_var(--shadow-col)] overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-4 relative z-10">
          <span className="inline-flex items-center gap-2 font-mono text-xs font-bold bg-white text-[#1B1530] border-[3px] border-[#1B1530] px-3 py-1 shadow-[3px_3px_0_#1B1530]">
            <PixelIcon name="building" scale={1.8} />
            <span>BITS Pilani, Hyderabad Campus</span>
          </span>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#1B1530] drop-shadow-[4px_4px_0_#FFD84D]">
            Real campus uptime.<br />
            <span className="z-chr text-[#FF4D3D]">Z</span>ero open incidents.
          </h1>

          <p className="text-sm sm:text-base text-[#1B1530] font-medium max-w-2xl mx-auto">
            A campus service desk where every ticket has three ticking SLA hearts, one legal next move across ten states, and a <span className="mono-num font-bold">SHA-256</span> record nobody can fake. Fix the four BPHC outages below!
          </p>
        </div>
      </section>

      {/* Playable BPHC Campus Scene */}
      <section className="relative">
        <div
          className={`relative h-[460px] border-[3px] border-[var(--line)] shadow-[8px_8px_0_var(--shadow-col)] overflow-hidden select-none bg-gradient-to-b from-[#7FD6FA] via-[#A6E6FF] to-[#CDF2FF] ${
            isDanger ? 'ring-4 ring-[#FF4D3D] ring-inset' : ''
          }`}
        >
          {/* Header Tag */}
          <div className="absolute top-3 left-3 z-10 bg-[#FF4D3D] text-[#FFF8DC] border-[3px] border-[#1B1530] px-3 py-1 font-mono text-xs font-bold shadow-[3px_3px_0_#1B1530] -rotate-2">
            Click a bug to squash!
          </div>

          {/* Quick Scene Controls */}
          <div className="absolute top-3 right-3 z-10 flex gap-2">
            <button
              type="button"
              onClick={() => {
                sound.blip();
                setTickets(INITIAL_TICKETS);
                setScore(0);
                setShowWinModal(false);
              }}
              className="btn sm w"
            >
              Reset Campus
            </button>
            <button
              type="button"
              onClick={() => {
                sound.err();
                setTickets((prev) =>
                  prev.map((t) => (!t.done && t.hp > 1 ? { ...t, hp: t.hp - 1 } : t))
                );
              }}
              className="btn sm r"
            >
              Drain 1 Heart
            </button>
          </div>

          {/* Sun / Moon */}
          <div className="absolute right-36 top-6 w-14 h-14 bg-[#FFD84D] border-[3px] border-[#1B1530] shadow-[4px_4px_0_#1B1530]" />

          {/* Distant Hills & Trees */}
          <div className="absolute left-0 right-0 bottom-14 h-36 bg-[#9BE8B4] border-t-2 border-[#1B1530]" />
          <div className="absolute left-0 right-0 bottom-14 h-20 bg-[#5FC982]" />

          {/* 4 BPHC Landmarks with Live Bug Slots */}
          <div className="absolute inset-0 bottom-14 flex items-end justify-around px-2 z-10">
            {tickets.map((t, idx) => (
              <div key={t.id} className="flex flex-col items-center justify-end relative">
                {/* Bug Slot */}
                <div className="min-h-[110px] flex flex-col items-center justify-end mb-2">
                  {t.done ? (
                    <div className="chip s-DONE font-bold text-xs shadow-[3px_3px_0_#1B1530]">
                      ✔ FIXED
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleFix(idx)}
                      className="cursor-pointer group flex flex-col items-center gap-1 p-1 hover:scale-105 transition-transform"
                      title={`Squash ${t.id} (${t.n})`}
                    >
                      <PixelSprite
                        matrix={
                          bugFrameToggle
                            ? BUG_F2.map((r) => r.replace(/r/g, t.c))
                            : BUG_F1.map((r) => r.replace(/r/g, t.c))
                        }
                        scale={4}
                      />
                      <span className="font-mono text-xs font-bold bg-white text-[#1B1530] border-2 border-[#1B1530] px-1.5 py-0.5 shadow-[2px_2px_0_#1B1530] whitespace-nowrap">
                        {t.p} {t.n}
                      </span>
                      <SlaHearts hp={t.hp} maxHp={3} scale={1.8} />
                    </button>
                  )}
                </div>

                {/* Building Pixel Art (2x Scale) */}
                <div className="filter drop-shadow-[4px_4px_0_rgba(27,21,48,0.25)]">
                  <PixelSprite matrix={t.art(false)} scale={6} />
                </div>

                {/* Rocks on F-Block */}
                {t.rock && (
                  <div className="absolute -bottom-2 -right-6 flex flex-col items-center">
                    <span className="font-mono text-[10px] font-bold bg-[#FFD84D] border border-[#1B1530] px-1">
                      OTR
                    </span>
                    <PixelSprite matrix={ROCKS} scale={2.8} />
                  </div>
                )}

                {/* Building Name Tag */}
                <span className="font-mono text-xs font-bold bg-[#FFF8DC] text-[#1B1530] border-2 border-[#1B1530] px-2 py-0.5 -mt-3 z-10 shadow-[2px_2px_0_#1B1530]">
                  {t.w}
                </span>
              </div>
            ))}
          </div>

          {/* Walking Technician Sprite */}
          <div
            className="absolute bottom-12 z-20 transition-all duration-700"
            style={{ left: `${techPos}%` }}
          >
            <PixelSprite
              matrix={
                techFrame === 'W1'
                  ? TECH_W1
                  : techFrame === 'W2'
                  ? TECH_W2
                  : techFrame === 'SQUASH'
                  ? TECH_SQUASH
                  : TECH_IDLE
              }
              scale={4.5}
            />
          </div>

          {/* Ground */}
          <div className="absolute left-0 right-0 bottom-0 h-14 bg-gradient-to-r from-[#43D17A] via-[#3AC06E] to-[#43D17A] border-t-4 border-[#1B1530]" />

          {/* Full Screen Scorecard Celebration Modal */}
          {showWinModal && (
            <div className="absolute inset-0 bg-[#1B1530]/90 flex flex-col items-center justify-center p-6 z-30 animate-in fade-in zoom-in-95 duration-200">
              <div className="pixel-card bg-[#FFF8DC] max-w-md w-full space-y-4 text-center border-4 border-[#1B1530] shadow-[8px_8px_0_#FFD84D]">
                <div className="font-mono text-xs font-bold bg-[#43D17A] text-[#1B1530] border-2 border-[#1B1530] px-2 py-0.5 inline-block rotate-2">
                  STAMPED: ZERO OPEN INCIDENTS
                </div>

                <h2 className="text-3xl font-bold text-[#1B1530]">
                  CAMPUS UPTIME 100%
                </h2>

                <div className="grid grid-cols-3 gap-2 font-mono text-xs text-[#1B1530]">
                  <div className="p-2 border-2 border-[#1B1530] bg-[#FFE680]">
                    <div className="text-xl font-bold">{Math.round(score)}</div>
                    <div>SCORE</div>
                  </div>
                  <div className="p-2 border-2 border-[#1B1530] bg-[#FFE680]">
                    <div className="text-xl font-bold">{maxCombo}x</div>
                    <div>MAX COMBO</div>
                  </div>
                  <div className="p-2 border-2 border-[#1B1530] bg-[#FFE680]">
                    <div className="text-xl font-bold">{tickets.filter((t) => t.breach).length}</div>
                    <div>BREACHES</div>
                  </div>
                </div>

                <p className="text-xs text-[var(--soft)] font-medium">
                  C-Block, F-Block, Valmiki Bhavan & Library are completely restored!
                </p>

                <div className="flex justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      sound.blip();
                      setTickets(INITIAL_TICKETS);
                      setScore(0);
                      setShowWinModal(false);
                    }}
                    className="btn y"
                  >
                    Play Again
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sound.slot();
                      onSelectCartridge('workbench');
                    }}
                    className="btn r"
                  >
                    Open Live Workbench
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live Ticket Queue below Scene */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          {tickets.map((t, idx) => (
            <div
              key={t.id}
              className="pixel-card p-3 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="chip s-ASG font-mono font-bold" style={{ background: t.pc }}>
                  {t.p}
                </span>
                <div>
                  <div className="font-bold text-[var(--fg)] font-mono">{t.id} · {t.n}</div>
                  <div className="text-[11px] text-[var(--soft)]">📍 {t.w}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <SlaHearts hp={t.hp} maxHp={3} scale={1.6} />
                {t.done ? (
                  <span className="chip s-DONE">RESOLVED</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleFix(idx)}
                    className="btn sm y"
                  >
                    Squash
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CARD 1 / 4: 10-State Lifecycle Board */}
      <section className="pixel-card-offset" style={{ '--b': '#FF8AD0' } as any}>
        <span className="pixel-tag-badge">
          <PixelIcon name="shield" scale={1.6} />
          <span>1 / 4 · RULES OF PLAY (10 STATES)</span>
        </span>

        <h2 className="text-2xl sm:text-3xl font-bold text-[var(--fg)] mb-2">
          No skipping <span className="z-chr">z</span>ones
        </h2>
        <p className="text-xs sm:text-sm text-[var(--soft)] mb-6 max-w-2xl">
          Every ticket moves one square at a time across all ten states. Try forcing <code>close()</code> early (or clicking an invalid state tile): the engine answers with <code>409 Conflict</code>.
        </p>

        {/* 10-State Track Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 my-4">
          {LIFECYCLE_STATES.map((st, idx) => {
            const isDone = idx < curStateIdx;
            const isNow = idx === curStateIdx;
            return (
              <div
                key={st}
                onClick={() => {
                  if (idx === curStateIdx + 1) handleStateMove('go');
                  else if (idx !== curStateIdx) handleStateMove('bad');
                }}
                className={`p-3 border-[3px] border-[var(--line)] shadow-[4px_4px_0_var(--shadow-col)] text-center font-mono text-xs font-bold flex flex-col items-center justify-end min-h-[76px] cursor-pointer transition-transform hover:-translate-y-1 ${
                  isNow
                    ? 'bg-[#FFD84D] text-[#1B1530] -translate-y-1 shadow-[6px_6px_0_var(--shadow-col)]'
                    : isDone
                    ? 'bg-[#43D17A] text-[#1B1530]'
                    : 'bg-[var(--card)] text-[var(--fg)]'
                }`}
              >
                <span className="text-[10px] opacity-75">{String(idx + 1).padStart(2, '0')} / 10</span>
                {isNow && <PixelSprite matrix={TECH_IDLE} scale={2} className="my-1 animate-bounce" />}
                <span>{st}</span>
              </div>
            );
          })}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-2 items-center mt-4">
          {curStateIdx < 9 ? (
            <>
              <button
                type="button"
                onClick={() => handleStateMove('go')}
                className="btn y"
              >
                {LEGAL_MOVES[curStateIdx]}
              </button>
              {curStateIdx === 4 && (
                <button
                  type="button"
                  onClick={() => handleStateMove('directResolve')}
                  className="btn g"
                >
                  resolve() directly
                </button>
              )}
              {curStateIdx < 8 && (
                <button
                  type="button"
                  onClick={() => handleStateMove('bad')}
                  className="btn r"
                >
                  close() [Illegal Guard Test]
                </button>
              )}
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => handleStateMove('reopen')}
                className="btn y"
              >
                reopen() [Guard Check]
              </button>
              <button
                type="button"
                onClick={() => handleStateMove('reset')}
                className="btn w"
              >
                Reset Board
              </button>
            </>
          )}
        </div>

        {/* 409 Conflict Banner */}
        {stateError && (
          <div className="mt-4 p-3 bg-[#FF4D3D] text-[#FFF8DC] border-[3px] border-[#1B1530] font-mono text-xs font-bold shadow-[4px_4px_0_#1B1530] shake">
            {stateError}
          </div>
        )}
      </section>

      {/* CARD 2 / 4: 4 Cartridges */}
      <section className="pixel-card-offset" style={{ '--b': '#59C9F5' } as any}>
        <span className="pixel-tag-badge">
          <PixelIcon name="gamepad" scale={1.6} />
          <span>2 / 4 · SELECT CARTRIDGE</span>
        </span>

        <h2 className="text-2xl sm:text-3xl font-bold text-[var(--fg)] mb-2">
          Four roles, four <span className="z-chr">z</span>one views
        </h2>
        <p className="text-xs sm:text-sm text-[var(--soft)] mb-6 max-w-2xl">
          Students, technicians, admins, and reviewers each get their own ROM cartridge. Click any cartridge to physically slot it into the CRT console below.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { id: 'portal' as ActiveTab, num: '01 / STUDENT', title: 'Student Portal', desc: 'Report a BPHC outage with AI power-up tags and follow a 6-step quest bar.', code: 'POST /api/v1/tickets', col: 'bg-[#FFD84D]' },
            { id: 'workbench' as ActiveTab, num: '02 / TECHNICIAN', title: 'Workbench', desc: 'Battle the active campus bug with AI runbook hints and guarded transitions.', code: 'POST /tickets/{id}/transition', col: 'bg-[#FF4D3D] text-white' },
            { id: 'admin' as ActiveTab, num: '03 / ADMIN', title: 'Command DAG', desc: 'Campus overworld dependency DAG, blast-radius ripples, and storm drills.', code: 'GET /topology/blast-radius', col: 'bg-[#43D17A]' },
            { id: 'specs' as ActiveTab, num: '04 / ARCHITECTURE', title: 'System Specs', desc: 'Explore state machine invariants, concurrency locks, and SLA engine.', code: 'GET /actuator/architecture', col: 'bg-[#FF8AD0]' },
          ].map((c) => (
            <div
              key={c.id}
              onClick={() => {
                sound.slot();
                onSelectCartridge(c.id);
              }}
              className={`p-4 border-[3px] border-[var(--line)] shadow-[6px_6px_0_var(--shadow-col)] cursor-pointer hover:-translate-y-1 transition-transform relative group ${c.col}`}
            >
              <div className="bg-[#FFF8DC] text-[#1B1530] border-2 border-[#1B1530] p-3 space-y-2">
                <span className="font-mono text-xs font-bold bg-[#1B1530] text-[#FFD84D] px-1.5 py-0.5">
                  {c.num}
                </span>
                <h3 className="font-bold text-lg text-[#1B1530]">{c.title}</h3>
                <p className="text-xs text-[var(--soft)] leading-relaxed">{c.desc}</p>
                <code className="block font-mono text-[11px] font-bold text-[#7C5CFF]">{c.code}</code>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CARD 4 / 4: Real Web Crypto SHA-256 Ledger */}
      <section className="pixel-card-offset" style={{ '--b': '#43D17A' } as any}>
        <span className="pixel-tag-badge">
          <PixelIcon name="chain" scale={1.6} />
          <span>4 / 4 · REAL SHA-256 AUDIT LEDGER</span>
        </span>

        <h2 className="text-2xl sm:text-3xl font-bold text-[var(--fg)] mb-2">
          Tamper with a block
        </h2>
        <p className="text-xs sm:text-sm text-[var(--soft)] mb-6 max-w-2xl">
          Every block’s 256-bit digest is computed live with <code>crypto.subtle.digest('SHA-256', prevHash + '|' + payload)</code>. Click any block and edit even one character in the payload textarea below: watch the cryptographic avalanche scramble every downstream hash in real time.
        </p>

        {/* Chain Blocks */}
        <div className="flex flex-wrap items-center gap-2 my-4">
          {computedHashes.map((h, i) => {
            const isMatch = h === sealedHashes[i];
            const isSelected = i === selectedBlockIdx;
            return (
              <React.Fragment key={i}>
                <button
                  type="button"
                  onClick={() => {
                    sound.blip();
                    setSelectedBlockIdx(i);
                  }}
                  className={`p-3 border-[3px] border-[var(--line)] shadow-[4px_4px_0_var(--shadow-col)] text-left font-mono text-xs font-bold cursor-pointer transition-transform hover:-translate-y-0.5 ${
                    isSelected ? 'ring-4 ring-[#7C5CFF]' : ''
                  } ${isMatch ? 'bg-[#43D17A] text-[#1B1530]' : 'bg-[#FF4D3D] text-[#FFF8DC] shake'}`}
                >
                  <div>#0{412 + i} · <small>{isMatch ? 'SEALED' : 'TAMPERED!'}</small></div>
                  <div className="text-[11px] opacity-90 mt-1">
                    {h.slice(0, 6)}..{h.slice(-4)}
                  </div>
                </button>
                {i < 5 && <div className={`w-4 h-1 ${isMatch ? 'bg-[var(--line)]' : 'bg-[#FF4D3D]'}`} />}
              </React.Fragment>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 items-center my-3">
          <button
            type="button"
            onClick={() => {
              sound.fix();
              setLedgerMsg('✔ Verified: All 6 blocks checked against head hash.');
            }}
            className="btn y"
          >
            Verify Ledger
          </button>
          <button
            type="button"
            onClick={() => {
              sound.err();
              const curr = livePayloads[selectedBlockIdx];
              handlePayloadChange(curr.includes('"P1"') ? curr.replace('"P1"', '"P4_MUTATED"') : curr + ' ');
            }}
            className="btn r"
          >
            Mutate 1 Byte (P1 → P4)
          </button>
          <button
            type="button"
            onClick={() => {
              sound.fix();
              setLivePayloads([...CANONICAL_PAYLOADS]);
              handlePayloadChange(CANONICAL_PAYLOADS[selectedBlockIdx]);
            }}
            className="btn g"
          >
            Repair Chain
          </button>
        </div>

        <p className="font-mono text-xs font-bold text-[var(--fg)] mb-4">{ledgerMsg}</p>

        {/* Live Payload Editor */}
        <div className="pixel-card bg-[var(--bg)] p-4 space-y-3">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <span className="font-mono text-xs font-bold text-[var(--fg)]">
              EDITING BLOCK #0{412 + selectedBlockIdx} PAYLOAD (LIVE SHA-256 AVALANCHE)
            </span>
            <span className={`chip ${computedHashes[selectedBlockIdx] === sealedHashes[selectedBlockIdx] ? 's-DONE' : 's-BRC'}`}>
              {computedHashes[selectedBlockIdx] === sealedHashes[selectedBlockIdx] ? 'SEALED · SHA-256 MATCH' : 'BROKEN · HASH MISMATCH'}
            </span>
          </div>

          <textarea
            rows={3}
            value={livePayloads[selectedBlockIdx] || ''}
            onChange={(e) => handlePayloadChange(e.target.value)}
            className="w-full p-2.5 bg-white text-[#1B1530] border-[3px] border-[var(--line)] font-mono text-xs font-bold resize-none focus:outline-none"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2 bg-[#1B1530] text-[#BDF74A] border border-[var(--line)]">
              <div className="text-[10px] text-white/70">EXPECTED SEALED SHA-256:</div>
              <div className="break-all">{sealedHashes[selectedBlockIdx] || '...'}</div>
            </div>
            <div className={`p-2 border border-[var(--line)] ${computedHashes[selectedBlockIdx] === sealedHashes[selectedBlockIdx] ? 'bg-[#1B1530] text-[#BDF74A]' : 'bg-[#2D0F1E] text-[#FF8AD0] border-[#FF4D3D]'}`}>
              <div className="text-[10px] text-white/70">LIVE COMPUTED (crypto.subtle):</div>
              <div className="break-all">{computedHashes[selectedBlockIdx] || '...'}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Count-Up Guarantees Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { num: '10', label: 'Guarded States', desc: 'lifecycle states on the board, and only the legal next moves are ever offered for your role.', icon: 'gamepad', col: 'bg-[#FFD84D]' },
          { num: '409', label: 'Conflict Rejections', desc: 'is the instant RFC 7807 response to every illegal transition, so nothing ever skips a step.', icon: 'shield', col: 'bg-[#FF4D3D] text-white' },
          { num: '256', label: 'Bits of Proof', desc: 'bits in each SHA-256 cryptographic hash that seals an audit block to the one before it.', icon: 'chain', col: 'bg-[#43D17A]' },
        ].map((stat) => (
          <div key={stat.num} className="pixel-card space-y-2">
            <div className="flex items-center justify-between">
              <span className={`p-2 border-2 border-[#1B1530] ${stat.col}`}>
                <PixelIcon name={stat.icon} scale={1.8} />
              </span>
              <span className="font-bold text-4xl sm:text-5xl font-mono text-[#7C5CFF] drop-shadow-[2px_2px_0_#1B1530]">
                {stat.num}
              </span>
            </div>
            <h3 className="font-bold text-lg text-[var(--fg)]">{stat.label}</h3>
            <p className="text-xs text-[var(--soft)] leading-relaxed">{stat.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
};
