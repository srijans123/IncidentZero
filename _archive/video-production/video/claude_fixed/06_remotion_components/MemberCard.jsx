import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

const MEMBER_ROLES = {
  'Srijan Shukla': {
    player: 'PLAYER 01',
    accent: '#59C9F5',
    role: 'Lead System Architect & Core Domain Engine',
    deliverables: [
      'Pure Domain Aggregate & 11-State Finite State Machine (520,036 Transitions)',
      'Cryptographic SHA-256 Merkle Audit Ledger & Tamper Detection Engine',
      'ArchUnit Invariant Enforcement (Rules R1–R9) & Zero Framework Leaks',
      'Spring Modulith Sub-Domain Decoupling & Transactional Event Listeners'
    ]
  },
  'Suhani Agarwal': {
    player: 'PLAYER 02',
    accent: '#43D17A',
    role: 'Event-Driven Modulith & Cryptographic Audit Ledger',
    deliverables: [
      'Dual-Clock SLA Engine (Continuous Wall-Clock vs Paused Business Calendar)',
      'Deterministic Pause Interval Accumulator (WAITING_FOR_CLIENT Freeze)',
      'Sticky Breach State Enforcement & Multi-Tier Escalation Workflows',
      'Transactional Audit & SLA Event Listener Propagation (MANDATORY)'
    ]
  },
  'Kartikey Negi': {
    player: 'PLAYER 03',
    accent: '#FFD84D',
    role: 'Reactive State Machine & Dynamic SLA Engine',
    deliverables: [
      'Campus Service Dependency Directed Acyclic Graph (12 Core Services)',
      'Tarjan Strongly Connected Components (SCC) O(V+E) Cycle Validator',
      'Cascading Blast Radius Analysis & HNSW Semantic Storm Correlation',
      'Reactive State Machine Guards & Dynamic Priority Matrix Calculation'
    ]
  },
  'Hairsh Kumar': {
    player: 'PLAYER 04',
    accent: '#7C5CFF',
    role: 'Resilience, Chaos Testing & Test Suite Verification',
    deliverables: [
      'Seven Pluggable Technician Dispatch Strategies (Round-Robin to Skill-Match)',
      'Hungarian Optimal Bipartite Matching & Batch Assignment Scheduler',
      'Realtime Server-Sent Events (SSE) Broadcast Hub & 16-Bit Campus HUD',
      'Chaos Resilience Testing, Playwright E2E Suite & <10s DB Reset Engine'
    ]
  }
};

export const MemberCard = ({ scene }) => {
  const frame = useCurrentFrame();

  const name = scene?.member || scene?.name || 'Srijan Shukla';
  const idNum = scene?.id_num || scene?.bits_id || '2025A7PS0194H';
  const memberInfo = MEMBER_ROLES[name] || MEMBER_ROLES['Srijan Shukla'];

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
        padding: '50px 70px',
        opacity
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 1760,
          height: 880,
          background: '#1B1530',
          borderRadius: 0,
          border: '6px solid #0B071E',
          outline: `3px solid ${memberInfo.accent}`,
          boxShadow: '10px 10px 0 #0B071E',
          padding: '44px 56px',
          display: 'flex',
          gap: 48,
          alignItems: 'stretch',
          overflow: 'hidden'
        }}
      >
        {/* Left: 16-Bit Webcam Slot */}
        <div
          style={{
            width: 560,
            background: '#120C2C',
            border: `4px solid ${memberInfo.accent}`,
            boxShadow: '6px 6px 0 #0B071E',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 28,
            textAlign: 'center',
            position: 'relative',
            flexShrink: 0
          }}
        >
          <div
            style={{
              width: 132,
              height: 132,
              background: '#2B2060',
              border: `4px solid ${memberInfo.accent}`,
              boxShadow: '5px 5px 0 #0B071E',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 38,
              fontWeight: 900,
              color: '#FFD84D',
              marginBottom: 24
            }}
          >
            {memberInfo.player.split(' ')[1]}
          </div>

          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 18,
              fontWeight: 900,
              color: memberInfo.accent,
              letterSpacing: 2,
              marginBottom: 10
            }}
          >
            [ WEBCAM VIDEO SLOT ]
          </div>

          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 13,
              color: '#D4CBF7',
              lineHeight: 1.5
            }}
          >
            1080p Member Clip · Final Submission (§9)
          </div>

          <div
            style={{
              position: 'absolute',
              bottom: 24,
              background: '#43D17A',
              border: '3px solid #0B071E',
              boxShadow: '4px 4px 0 #0B071E',
              padding: '6px 18px',
              color: '#1B1530',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 13,
              fontWeight: 900
            }}
          >
            ★ VERIFIED CONTRIBUTOR · {memberInfo.player} ★
          </div>
        </div>

        {/* Right: Student Details & Deliverables */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden' }}>
          {/* Cream Header Card */}
          <div
            style={{
              background: '#FFF8DC',
              border: '4px solid #0B071E',
              boxShadow: '6px 6px 0 #0B071E',
              padding: '20px 28px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span
                style={{
                  fontFamily: "'Pixelify Sans', 'JetBrains Mono', sans-serif",
                  fontSize: 40,
                  fontWeight: 900,
                  color: '#1B1530',
                  letterSpacing: 1
                }}
              >
                {name.toUpperCase()}
              </span>
              <span
                style={{
                  background: '#FFD84D',
                  border: '3px solid #0B071E',
                  boxShadow: '3px 3px 0 #0B071E',
                  padding: '6px 14px',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 16,
                  fontWeight: 900,
                  color: '#1B1530'
                }}
              >
                ID: {idNum}
              </span>
            </div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 18,
                fontWeight: 800,
                color: '#4A3F6B'
              }}
            >
              {memberInfo.role}
            </div>
          </div>

          {/* Deliverables List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 16,
                fontWeight: 900,
                color: '#FFD84D',
                letterSpacing: 1.5
              }}
            >
              ■ INDIVIDUAL ENGINEERING DELIVERABLES & OWNERSHIP:
            </div>

            {memberInfo.deliverables.map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: '#2B2060',
                  border: '3px solid #0B071E',
                  boxShadow: '4px 4px 0 #0B071E',
                  padding: '14px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    background: '#43D17A',
                    border: '2px solid #0B071E',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 15,
                    fontWeight: 900,
                    color: '#1B1530',
                    flexShrink: 0
                  }}
                >
                  0{idx + 1}
                </div>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 16,
                    fontWeight: 700,
                    color: '#FFFFFF',
                    lineHeight: 1.35,
                    wordBreak: 'break-word'
                  }}
                >
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
