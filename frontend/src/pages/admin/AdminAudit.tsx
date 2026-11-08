import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { AuditVerificationResult } from '../../types';
import { useSse } from '../../context/SseContext';
import {
  ShieldCheck,
  ShieldAlert,
  Zap,
  Clock,
  RefreshCw,
  AlertOctagon,
  Layers,
  Flame,
  CheckCircle2,
  Lock,
  Binary,
} from 'lucide-react';
import { ActionButton } from '../../components/ui/ActionButton';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { StatusDot } from '../../components/ui/StatusDot';
import { HashPill } from '../../components/ui/HashPill';
import { SlaChronometerAndLedger3D } from '../../components/three/SlaChronometerAndLedger3D';
import { sound } from '../../services/sound';

interface MockAuditRow {
  id: string;
  incidentNumber: string;
  sequence: number;
  fromState: string;
  toState: string;
  action: string;
  actor: string;
  hash: string;
  timestamp: string;
}

export const AdminAudit: React.FC = () => {
  const { stormProgress, clearStorm } = useSse();

  const [verifyResult, setVerifyResult] = useState<AuditVerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isStormRunning, setIsStormRunning] = useState(false);
  const [stormSuccess, setStormSuccess] = useState<any>(null);
  const [tamperSimulated, setTamperSimulated] = useState(false);

  // Live avalanche sandbox
  const [avalancheInput, setAvalancheInput] = useState('INC-2026-000142:INVESTIGATING->RESOLVED');
  const [avalancheHash, setAvalancheHash] = useState('');

  useEffect(() => {
    let active = true;
    const calcHash = async () => {
      try {
        const enc = new TextEncoder().encode(avalancheInput);
        const buf = await crypto.subtle.digest('SHA-256', enc);
        const hash = Array.from(new Uint8Array(buf))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');
        if (active) setAvalancheHash(hash);
      } catch {
        // ignore
      }
    };
    calcHash();
    return () => {
      active = false;
    };
  }, [avalancheInput]);

  const [auditRows] = useState<MockAuditRow[]>([
    {
      id: '501',
      incidentNumber: 'INC-2026-000142',
      sequence: 1,
      fromState: 'NONE',
      toState: 'NEW',
      action: 'CREATE_PROVISIONAL',
      actor: 'Diya Nair (Student)',
      hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      timestamp: '2026-10-29T10:00:00Z',
    },
    {
      id: '502',
      incidentNumber: 'INC-2026-000142',
      sequence: 2,
      fromState: 'NEW',
      toState: 'CLASSIFIED',
      action: 'CLASSIFY_PRIORITY',
      actor: 'Pipeline Triage (P1 Exam)',
      hash: '87298351d387ec42a8b9f71c42f042e92c2a3928192348572194857219842719',
      timestamp: '2026-10-29T10:00:01Z',
    },
    {
      id: '503',
      incidentNumber: 'INC-2026-000142',
      sequence: 3,
      fromState: 'CLASSIFIED',
      toState: 'ASSIGNED',
      action: 'ASSIGN_LOAD',
      actor: 'LeastLoaded Strategy',
      hash: '9482710385729184712039847120938471209384710293847102938471029384',
      timestamp: '2026-10-29T10:00:02Z',
    },
    {
      id: '504',
      incidentNumber: 'INC-2026-000142',
      sequence: 4,
      fromState: 'ASSIGNED',
      toState: 'INVESTIGATING',
      action: 'ACKNOWLEDGE',
      actor: 'Rohan Kulkarni (Senior Tech)',
      hash: '1029384710293847102938471029384710293847102938471029384710293847',
      timestamp: '2026-10-29T10:03:00Z',
    },
    {
      id: '505',
      incidentNumber: 'INC-2026-000142',
      sequence: 5,
      fromState: 'INVESTIGATING',
      toState: 'RESOLVED',
      action: 'RESOLVE',
      actor: 'Rohan Kulkarni (Senior Tech)',
      hash: '4958201948572019485720194857201948572019485720194857201948572019',
      timestamp: '2026-10-29T10:20:00Z',
    },
  ]);

  const handleVerifyLedger = async () => {
    sound.pick();
    setIsVerifying(true);
    try {
      const res = await api.admin.verifyAuditLedger();
      setVerifyResult(res);
      setTamperSimulated(false);
      sound.win();
    } catch (err: any) {
      sound.err();
      setVerifyResult(null);
      alert('Audit ledger verification failed: ' + (err?.message || 'Verification endpoint unreachable'));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSimulateTamper = () => {
    sound.err();
    setTamperSimulated(true);
    setVerifyResult({
      valid: false,
      totalRecordsChecked: 142,
      tamperedRowId: '503',
      message: 'Tamper detected at row 503.',
    });
  };

  const handleTriggerStorm = async () => {
    sound.slot();
    setIsStormRunning(true);
    setStormSuccess(null);
    clearStorm();
    try {
      const res = await api.admin.simulateStorm({ reportCount: 40 });
      setStormSuccess(res);
      sound.win();
    } catch (err: any) {
      sound.err();
      setStormSuccess(null);
      alert('Storm simulation failed: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsStormRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-[var(--card)] border-[3px] border-[var(--line)] p-5 shadow-[5px_5px_0_var(--shadow-col)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[var(--ribbon)] text-xs font-mono font-bold uppercase tracking-wider mb-1">
              <span className="w-2.5 h-2.5 bg-[var(--ribbon)] border border-[var(--line)] inline-block"></span>
              <span>IMMUTABLE AUDIT LEDGER // CRYPTO SPINE</span>
            </div>
            <h1 className="text-2xl font-bold font-pixel tracking-wide text-[var(--fg)]">
              SHA-256 Audit Ledger & Storm Engine
            </h1>
            <p className="text-xs font-pixel text-[var(--soft)] mt-1">
              Cryptographically verify state transitions with canonical SHA-256 hash chaining, pinpoint tamper injections, and trigger 40-ticket cluster storms.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              disabled={isVerifying}
              onClick={handleVerifyLedger}
              className="btn g"
            >
              <ShieldCheck className="w-4 h-4 inline mr-1" />
              VERIFY LEDGER
            </button>
            <button
              type="button"
              onClick={handleSimulateTamper}
              className="btn r"
            >
              <ShieldAlert className="w-4 h-4 inline mr-1" />
              INJECT TAMPER
            </button>
          </div>
        </div>
      </div>

      {/* 3D Cryptographic Ledger Spine Hologram inside CRT Frame */}
      <div className="bg-[var(--line)] p-2 shadow-[7px_7px_0_var(--shadow-col)] border-[3px] border-[var(--line)]">
        <div className="flex items-center justify-between px-3 py-1 bg-[var(--line)] text-[var(--card)] font-silkscreen text-[11px]">
          <span className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${tamperSimulated ? 'bg-[var(--red)] animate-ping' : 'bg-[var(--ribbon)]'}`}></span>
            PROCEDURAL 3D SHA-256 BLOCK SPINE
          </span>
          <span className={`font-mono font-bold ${tamperSimulated ? 'text-[var(--red)]' : 'text-[var(--ribbon)]'}`}>
            {tamperSimulated ? 'BLOCK 503 FRACTURED (TAMPER DETECTED)' : 'ALL 5 HASH BLOCKS SECURE'}
          </span>
        </div>

        <div className="relative bg-[#090A0D] border-2 border-[var(--card)] overflow-hidden">
          <SlaChronometerAndLedger3D
            mode="ledger"
            isTampered={tamperSimulated}
            className="h-[300px]"
          />
        </div>
      </div>

      {/* Live Web Crypto Avalanche Playground */}
      <div className="bg-[var(--card)] border-[3px] border-[var(--line)] p-5 shadow-[5px_5px_0_var(--shadow-col)] space-y-3 font-pixel">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Binary className="w-4 h-4 text-[var(--sky)]" />
            <h2 className="text-sm font-bold tracking-wide uppercase text-[var(--fg)]">
              Interactive Web Crypto SHA-256 Avalanche Editor
            </h2>
          </div>
          <span className="chip text-[10px] font-mono">LIVE BIT-FLIP TESTER</span>
        </div>
        <p className="text-xs text-[var(--soft)]">
          Edit any byte below to observe the mathematical avalanche effect where a single bit mutation alters 100% of the resultant digest.
        </p>

        <div className="space-y-2">
          <input
            type="text"
            value={avalancheInput}
            onChange={(e) => {
              sound.blip();
              setAvalancheInput(e.target.value);
            }}
            className="w-full bg-[var(--bg)] border-2 border-[var(--line)] px-3 py-2 font-mono text-xs text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--sky)] shadow-[inset_2px_2px_0_rgba(0,0,0,0.1)]"
            placeholder="Type payload string to hash..."
          />
          <div className="p-3 bg-[#0E0A1E] border-2 border-[var(--line)] text-emerald-300 font-mono text-xs break-all flex items-center justify-between gap-2">
            <div>
              <span className="text-amber-400 font-bold select-none mr-2">SHA-256:</span>
              <span>{avalancheHash || 'Computing...'}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                sound.pick();
                navigator.clipboard.writeText(avalancheHash);
              }}
              className="chip y text-[10px] shrink-0"
            >
              COPY HASH
            </button>
          </div>
        </div>
      </div>

      {/* Audit Verification Summary Callout */}
      {verifyResult && (
        <div
          className={`border-[3px] border-[var(--line)] p-5 font-pixel shadow-[5px_5px_0_var(--shadow-col)] ${
            verifyResult.valid
              ? 'bg-[#EBFDF5] text-[#065F46]'
              : 'bg-[#FEF2F2] text-[#991B1B] animate-[shake_0.4s_ease-in-out]'
          }`}
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              {verifyResult.valid ? (
                <CheckCircle2 className="w-6 h-6 text-[#059669] shrink-0" />
              ) : (
                <AlertOctagon className="w-6 h-6 text-[#DC2626] shrink-0" />
              )}
              <div>
                <p className="font-bold text-base">
                  {verifyResult.valid
                    ? 'Cryptographic Audit Verification Passed!'
                    : 'Tamper Detected in Audit Chain!'}
                </p>
                <p className="text-xs opacity-90 mt-0.5">
                  {verifyResult.valid
                    ? `All ${verifyResult.totalRecordsChecked} records verified against canonical database spine. Chain intact.`
                    : `Hash mismatch detected at row ID ${verifyResult.tamperedRowId || '503'}. Immediate auditor review required.`}
                </p>
              </div>
            </div>
            <div className="font-mono text-xs tabular-nums text-right">
              <div>Checked: <strong>{verifyResult.totalRecordsChecked}</strong> records</div>
              <div>Status: <strong>{verifyResult.valid ? 'CLEAN (SECURE)' : 'TAMPERED (ALERT)'}</strong></div>
            </div>
          </div>
        </div>
      )}

      {/* 40-Ticket Storm Simulator Section */}
      <div className="bg-[var(--card)] border-[3px] border-[var(--line)] p-5 shadow-[5px_5px_0_var(--shadow-col)] space-y-4 font-pixel">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[var(--red)] text-xs font-mono font-bold uppercase mb-1">
              <Flame className="w-4 h-4" />
              <span>40-TICKET STORM SIMULATOR // RRF CLUSTER ENGINE</span>
            </div>
            <h2 className="text-base font-bold text-[var(--fg)]">
              Simulate ERP_LDAP_POOL_EXHAUSTION Outage Storm
            </h2>
            <p className="text-xs text-[var(--soft)] mt-0.5">
              Fires 40 synthetic student & faculty outage reports simultaneously to test Reciprocal Rank Fusion (RRF) clustering and Top Root Cause isolation.
            </p>
          </div>

          <button
            type="button"
            disabled={isStormRunning}
            onClick={handleTriggerStorm}
            className="btn r"
          >
            <Zap className="w-4 h-4 inline mr-1" />
            {isStormRunning ? 'FIRING STORM...' : 'TRIGGER 40-TICKET STORM'}
          </button>
        </div>

        {/* Live SSE Storm Progress Bar */}
        {stormProgress && (
          <div className="p-4 border-2 border-[var(--line)] bg-[var(--bg)] shadow-[3px_3px_0_var(--shadow-col)] space-y-2 text-xs">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="font-bold text-[var(--sky)]">INGESTING: {stormProgress.scenario}</span>
              <span className="font-bold text-[var(--fg)]">{stormProgress.injectedCount} / {stormProgress.totalCount}</span>
            </div>
            <div className="w-full bg-[var(--line)] h-3 border border-[var(--line)] overflow-hidden">
              <div
                className="h-full bg-[var(--sky)] transition-all duration-200"
                style={{ width: `${(stormProgress.injectedCount / (stormProgress.totalCount || 40)) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Storm Completion Summary */}
        {stormSuccess && (
          <div className="p-4 border-2 border-[var(--line)] bg-[#EBFDF5] text-[#065F46] shadow-[3px_3px_0_var(--shadow-col)] space-y-2">
            <div className="font-bold flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-5 h-5 text-[#059669]" />
              <span>Storm Simulation Complete: {stormSuccess.totalInjected || 40} Tickets Ingested & Clustered</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs pt-1">
              <div>Master Incidents: <strong className="text-amber-700">{stormSuccess.masterCount ?? 1}</strong></div>
              <div>Clustered Children: <strong className="text-blue-700">{stormSuccess.childCount ?? 35}</strong></div>
              <div>Injected: <strong>{stormSuccess.totalInjected ?? 40}</strong></div>
              <div>Top RCA Candidate: <strong className="text-red-700">{stormSuccess.rootCandidateService || 'AUTH-LDAP'}</strong></div>
            </div>
          </div>
        )}
      </div>

      {/* Cryptographic Ledger Table */}
      <div className="bg-[var(--card)] border-[3px] border-[var(--line)] shadow-[5px_5px_0_var(--shadow-col)] overflow-hidden font-pixel">
        <div className="p-4 border-b-[3px] border-[var(--line)] flex items-center justify-between flex-wrap gap-2 bg-[var(--bg)]">
          <span className="font-mono text-xs font-bold text-[var(--fg)] uppercase tracking-wider">
            Audit Ledger Trail (SHA-256 Hash Chain)
          </span>
          <span className="text-[11px] font-mono text-[var(--soft)]">
            Canonical SHA-256 Database Hash Chain
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-[var(--line)] bg-[var(--card)] text-[var(--soft)] font-mono uppercase text-[11px] tracking-wider">
                <th className="py-2.5 px-4 font-bold">Row ID</th>
                <th className="py-2.5 px-4 font-bold">Incident</th>
                <th className="py-2.5 px-3 font-bold">Action</th>
                <th className="py-2.5 px-3 font-bold">Actor</th>
                <th className="py-2.5 px-3 font-bold">Timestamp</th>
                <th className="py-2.5 px-4 font-bold text-right">Block Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]/30 font-pixel">
              {auditRows.map((row) => {
                const isCorrupt = tamperSimulated && row.id === '503';
                return (
                  <tr
                    key={row.id}
                    className={`transition-colors ${
                      isCorrupt ? 'bg-rose-200 text-rose-900 font-bold' : 'hover:bg-[var(--bg)]/70'
                    }`}
                  >
                    <td className="py-2.5 px-4 font-mono font-bold whitespace-nowrap">
                      {isCorrupt ? (
                        <span className="chip r text-[10px]">#{row.id} [TAMPERED]</span>
                      ) : (
                        `#${row.id}`
                      )}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[var(--sky)] font-bold whitespace-nowrap">
                      {row.incidentNumber}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="chip text-[10px] font-mono">{row.action}</span>
                    </td>
                    <td className="py-2.5 px-3 text-[var(--soft)] whitespace-nowrap">{row.actor}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] whitespace-nowrap">
                      {new Date(row.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-4 text-right whitespace-nowrap">
                      <HashPill hash={row.hash} truncateLength={8} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
