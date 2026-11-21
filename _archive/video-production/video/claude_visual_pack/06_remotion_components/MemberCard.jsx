import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

const MEMBER_ROLES = {
  'Srijan Shukla': {
    role: 'Lead Architect & Domain Core Engineer',
    deliverables: [
      'Pure Domain Aggregate & 11-State Finite State Machine (520k Transitions)',
      'Cryptographic SHA-256 Merkle Audit Ledger & Tamper Detection',
      'ArchUnit Invariant Enforcement (R1–R9) & Zero Framework Leaks'
    ]
  },
  'Suhani Agarwal': {
    role: 'SLA Engine & Temporal Chronometer Architect',
    deliverables: [
      'Dual-Clock SLA Engine (Wall-Clock vs Paused Business Calendar)',
      'Deterministic Pause Interval Accumulator (WAITING_FOR_CLIENT)',
      'Sticky Breach Enforcement & Automatic Multi-Tier Escalations'
    ]
  },
  'Kartikey Negi': {
    role: 'Graph Topology & Resilience Systems Engineer',
    deliverables: [
      'Campus Service Dependency Directed Acyclic Graph (12 Services)',
      'Tarjan Strongly Connected Components (SCC) O(V+E) Cycle Validator',
      'Cascading Blast Radius Analysis & HNSW Vector Storm Correlation'
    ]
  },
  'Hairsh Kumar': {
    role: 'Routing Algorithms & Realtime Stream Engineer',
    deliverables: [
      'Seven Pluggable Technician Dispatch Strategies (Round-Robin to Skill-Match)',
      'Hungarian Optimal Bipartite Matching for Batch Assignments',
      'Realtime Server-Sent Events (SSE) Bus & Reactive Campus HUD'
    ]
  }
};

export const MemberCard = ({ scene }) => {
  const frame = useCurrentFrame();

  const name = scene.member || 'Group Member';
  const idNum = scene.id_num || '2025A7PS0000H';
  const memberInfo = MEMBER_ROLES[name] || {
    role: 'Core Systems Developer',
    deliverables: ['System Implementation', 'Testing & Verification', 'Architecture Design']
  };

  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  const scale = interpolate(frame, [0, 20], [0.97, 1.0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#070a12',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '60px 100px',
        opacity,
        transform: `scale(${scale})`
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          width: 1400,
          height: 800,
          background: 'radial-gradient(circle, rgba(0, 240, 255, 0.08) 0%, rgba(0, 255, 157, 0.04) 50%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none'
        }}
      />

      {/* Main Glass Card */}
      <div
        style={{
          width: '100%',
          maxWidth: 1680,
          height: 800,
          background: 'rgba(16, 22, 38, 0.75)',
          backdropFilter: 'blur(16px)',
          borderRadius: 24,
          border: '2px solid rgba(0, 240, 255, 0.3)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(0, 240, 255, 0.15)',
          padding: '60px 80px',
          display: 'flex',
          gap: 70,
          alignItems: 'center'
        }}
      >
        {/* Left: Avatar / Webcam Slot */}
        <div
          style={{
            width: 440,
            height: 580,
            borderRadius: 20,
            background: 'linear-gradient(180deg, #131c2e 0%, #0a0f1a 100%)',
            border: '2px dashed rgba(0, 240, 255, 0.6)',
            boxShadow: 'inset 0 0 30px rgba(0, 240, 255, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 30,
            textAlign: 'center',
            position: 'relative'
          }}
        >
          {/* Avatar Icon */}
          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #00f0ff, #7000ff)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: 60,
              color: '#ffffff',
              boxShadow: '0 0 30px rgba(0, 240, 255, 0.5)',
              marginBottom: 24
            }}
          >
            👤
          </div>

          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 16,
              fontWeight: 700,
              color: '#00f0ff',
              letterSpacing: 2,
              marginBottom: 8
            }}
          >
            TEAM MEMBER CLIP SLOT
          </div>

          <div
            style={{
              fontFamily: "'Segoe UI', sans-serif",
              fontSize: 13,
              color: '#94a3b8',
              lineHeight: 1.5
            }}
          >
            (1080p webcam feed or photo overlay placeholder for final submission)
          </div>

          {/* Corner badge */}
          <div
            style={{
              position: 'absolute',
              bottom: 20,
              background: 'rgba(0, 255, 157, 0.15)',
              border: '1px solid rgba(0, 255, 157, 0.4)',
              borderRadius: 20,
              padding: '6px 16px',
              color: '#00ff9d',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              fontWeight: 700
            }}
          >
            VERIFIED CONTRIBUTOR
          </div>
        </div>

        {/* Right: Info & Responsibilities */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {/* Group & Course Eyebrow */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              marginBottom: 16
            }}
          >
            <span
              style={{
                background: 'rgba(0, 240, 255, 0.15)',
                color: '#00f0ff',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 14,
                fontWeight: 800,
                padding: '4px 12px',
                borderRadius: 4
              }}
            >
              GROUP 76
            </span>
            <span
              style={{
                color: '#64748b',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 14,
                fontWeight: 600
              }}
            >
              BITS PILANI HYDERABAD CAMPUS
            </span>
          </div>

          {/* Member Name */}
          <h2
            style={{
              fontFamily: "'JetBrains Mono', sans-serif",
              fontSize: 54,
              fontWeight: 900,
              color: '#ffffff',
              margin: '0 0 10px 0',
              letterSpacing: 1
            }}
          >
            {name.toUpperCase()}
          </h2>

          {/* ID Number & Role */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 36 }}>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 24,
                fontWeight: 800,
                color: '#ffb800'
              }}
            >
              {idNum}
            </span>
            <span style={{ color: '#475569', fontSize: 20 }}>|</span>
            <span
              style={{
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: 22,
                fontWeight: 600,
                color: '#00ff9d'
              }}
            >
              {memberInfo.role}
            </span>
          </div>

          {/* Divider */}
          <div
            style={{
              width: '100%',
              height: 2,
              background: 'linear-gradient(90deg, rgba(0, 240, 255, 0.4), transparent)',
              marginBottom: 36
            }}
          />

          {/* Core Architectural Deliverables */}
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 15,
              fontWeight: 800,
              color: '#00f0ff',
              letterSpacing: 2,
              marginBottom: 20
            }}
          >
            CORE ARCHITECTURAL CONTRIBUTIONS:
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {memberInfo.deliverables.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <span
                  style={{
                    color: '#00ff9d',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 20,
                    lineHeight: 1
                  }}
                >
                  ✓
                </span>
                <span
                  style={{
                    fontFamily: "'Segoe UI', sans-serif",
                    fontSize: 19,
                    color: '#e2e8f0',
                    lineHeight: 1.4
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

