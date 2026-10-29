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
} from 'lucide-react';
import { ActionButton } from '../../components/ui/ActionButton';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { StatusDot } from '../../components/ui/StatusDot';
import { HashPill } from '../../components/ui/HashPill';
import { SlaChronometerAndLedger3D } from '../../components/three/SlaChronometerAndLedger3D';

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
    setIsVerifying(true);
    try {
      const res = await api.admin.verifyAuditLedger();
      setVerifyResult(res);
      setTamperSimulated(false);
    } catch (err: any) {
      console.error('Audit ledger verification failed', err);
      setVerifyResult(null);
      alert('Audit ledger verification failed: ' + (err?.message || 'Verification endpoint unreachable'));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSimulateTamper = () => {
    setTamperSimulated(true);
    setVerifyResult({
      valid: false,
      totalRecordsChecked: 142,
      tamperedRowId: '503',
      message: 'Tamper detected at row 503.',
    });
  };

  const handleTriggerStorm = async () => {
    setIsStormRunning(true);
    setStormSuccess(null);
    clearStorm();
    try {
      const res = await api.admin.simulateStorm({ reportCount: 40 });
      setStormSuccess(res);
    } catch (err: any) {
      console.error('Simulate storm error', err);
      setStormSuccess(null);
      alert('Storm simulation failed: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsStormRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="surface-panel p-6 bg-[#101217] border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#10B981] text-xs font-mono font-medium tracking-wider uppercase mb-1">
              <Lock className="w-3.5 h-3.5" />
              <span>Cryptographic Governance & Audit Integrity</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#F3F4F6]">
              Immutable SHA-256 Ledger & Storm Simulator
            </h1>
            <p className="text-xs text-[#9BA1AE] mt-1">
              Cryptographically verify database transitions with canonical SHA-256 hash chaining, pinpoint tamper injections, and trigger 40-ticket cluster storms.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <ActionButton
              size="standard"
              variant="primary"
              isLoading={isVerifying}
              icon={<ShieldCheck className="w-4 h-4 text-[#10B981]" />}
              onClick={handleVerifyLedger}
            >
              Verify Ledger
            </ActionButton>
            <ActionButton
              size="standard"
              variant="crit"
              icon={<ShieldAlert className="w-4 h-4" />}
              onClick={handleSimulateTamper}
            >
              Inject Tamper Simulation
            </ActionButton>
          </div>
        </div>
      </div>

      {/* 3D Cryptographic Ledger Spine Hologram */}
      <div className="surface-panel p-3 bg-[#101217] border border-white/[0.08]">
        <div className="flex items-center justify-between mb-2 px-1 font-mono text-[11px] text-[#9BA1AE]">
          <span>PROCEDURAL 3D SHA-256 BLOCK CHAIN SPINE</span>
          <span className={tamperSimulated ? 'text-[#F43F5E] animate-pulse' : 'text-[#10B981]'}>
            {tamperSimulated ? 'BLOCK 503 FRACTURED (TAMPER DETECTED)' : 'ALL HASH BEAMS CRYPTOGRAPHICALLY SECURE'}
          </span>
        </div>
        <SlaChronometerAndLedger3D
          mode="ledger"
          isTampered={tamperSimulated}
          className="h-[300px]"
        />
      </div>

      {/* Audit Verification Summary Callout */}
      {verifyResult && (
        <div
          className={`surface-panel p-5 border text-xs ${
            verifyResult.valid
              ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#6EE7B7]'
              : 'bg-[#F43F5E]/10 border-[#F43F5E]/30 text-[#FDA4AF]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {verifyResult.valid ? (
                <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0" />
              ) : (
                <AlertOctagon className="w-5 h-5 text-[#F43F5E] shrink-0" />
              )}
              <div>
                <p className="font-bold text-sm">
                  {verifyResult.valid
                    ? 'Cryptographic Audit Verification Passed'
                    : 'Tamper Detected in Audit Chain'}
                </p>
                <p className="text-xs opacity-80 mt-0.5">
                  {verifyResult.valid
                    ? `All ${verifyResult.totalRecordsChecked} records verified against head hash. Zero tampering detected.`
                    : `Hash mismatch detected. Row ID ${verifyResult.tamperedRowId || '503'} payload modified.`}
                </p>
              </div>
            </div>
            <div className="font-mono text-[11px] tabular-nums text-right">
              <div>Checked: {verifyResult.totalRecordsChecked}</div>
              <div>Status: {verifyResult.valid ? 'CLEAN' : 'TAMPERED'}</div>
            </div>
          </div>
        </div>
      )}

      {/* 40-Ticket Storm Simulator Section */}
      <div className="surface-panel p-6 bg-[#101217] border border-white/[0.08] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#F43F5E] text-xs font-mono font-semibold uppercase mb-1">
              <Flame className="w-4 h-4" />
              <span>40-Ticket Storm Simulator & RRF Clustering</span>
            </div>
            <h2 className="text-base font-bold text-[#F3F4F6]">
              Simulate ERP_LDAP_POOL_EXHAUSTION Outage Storm
            </h2>
            <p className="text-xs text-[#9BA1AE] mt-0.5">
              Fires 40 synthetic student & faculty tickets simultaneously to demonstrate A1 Hybrid RRF clustering and B2 Graph RCA.
            </p>
          </div>

          <ActionButton
            size="cta"
            variant="crit"
            isLoading={isStormRunning}
            icon={<Zap className="w-4 h-4" />}
            onClick={handleTriggerStorm}
          >
            Trigger 40-Ticket Storm
          </ActionButton>
        </div>

        {/* Live SSE Storm Progress Bar */}
        {stormProgress && (
          <div className="p-4 rounded-lg bg-[#161920] border border-white/[0.08] space-y-2 text-xs">
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="text-[#38BDF8]">INGESTING STORM: {stormProgress.scenario}</span>
              <span className="text-[#F3F4F6]">{stormProgress.injectedCount} / {stormProgress.totalCount}</span>
            </div>
            <div className="w-full bg-[#090A0D] h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#38BDF8] rounded-full transition-all duration-200"
                style={{ width: `${(stormProgress.injectedCount / (stormProgress.totalCount || 40)) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Storm Completion Summary */}
        {stormSuccess && (
          <div className="p-4 rounded-lg bg-[#10B981]/10 border border-[#10B981]/25 text-xs text-[#6EE7B7] space-y-2">
            <div className="font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              <span>Storm Simulation Complete: {stormSuccess.totalInjected || 40} Tickets Processed</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px] text-slate-300 pt-1">
              <div>Masters: <strong className="text-amber-300">{stormSuccess.masterCount ?? 1}</strong></div>
              <div>Clustered Children: <strong className="text-[#38BDF8]">{stormSuccess.childCount ?? 35}</strong></div>
              <div>Injected: <strong className="text-slate-300">{stormSuccess.totalInjected ?? 40}</strong></div>
              <div>Top RCA: <strong className="text-rose-400">{stormSuccess.rootCandidateService || 'AUTH-LDAP'}</strong></div>
            </div>
          </div>
        )}
      </div>

      {/* Cryptographic Ledger Table */}
      <div className="surface-panel overflow-hidden border border-white/[0.08]">
        <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
          <span className="font-mono text-xs font-semibold text-[#F3F4F6] uppercase">
            Audit Ledger Trail (SHA-256 Hash Chain)
          </span>
          <span className="text-[11px] font-mono text-[#9BA1AE]">
            Algorithm: SHA-256 (Canonical Payload Canonicalizer)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] bg-[#161920]/40 text-[#8E95A5] font-mono uppercase text-[11px] tracking-wider">
                <th className="py-2.5 px-4 font-medium">Row ID</th>
                <th className="py-2.5 px-4 font-medium">Incident</th>
                <th className="py-2.5 px-3 font-medium">Action</th>
                <th className="py-2.5 px-3 font-medium">Actor</th>
                <th className="py-2.5 px-3 font-medium">Timestamp</th>
                <th className="py-2.5 px-4 font-medium text-right">Block Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {auditRows.map((row) => {
                const isCorrupt = tamperSimulated && row.id === '503';
                return (
                  <tr
                    key={row.id}
                    className={`transition-colors ${
                      isCorrupt ? 'bg-rose-500/15 text-rose-200' : 'hover:bg-[#1D212A]/60'
                    }`}
                  >
                    <td className="py-2.5 px-4 font-mono font-medium whitespace-nowrap">
                      {isCorrupt ? (
                        <span className="text-rose-400 font-bold">#{row.id} [TAMPERED]</span>
                      ) : (
                        `#${row.id}`
                      )}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[#38BDF8] whitespace-nowrap">
                      {row.incidentNumber}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <StatusBadge label={row.action} variant="neutral" isMono />
                    </td>
                    <td className="py-2.5 px-3 text-[#9BA1AE] whitespace-nowrap">{row.actor}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-[#8E95A5] whitespace-nowrap">
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
