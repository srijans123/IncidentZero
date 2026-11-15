import React, { useEffect, useState } from 'react';
import { Incident, RcaResult } from '../../types';
import { api } from '../../services/api';
import { useSse } from '../../context/SseContext';
import { useToast } from '../../components/ui/Toast';
import { Modal } from '../../components/ui/Modal';
import { sound } from '../../services/sound';
import { PixelIcon } from '../../services/pixelSprites';
import {
  ChevronLeft,
  Flame,
  CheckCircle2,
  GitBranch,
  Layers,
  Zap,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ActionButton } from '../../components/ui/ActionButton';
import { StatusDot } from '../../components/ui/StatusDot';
import { TopologyBlastRadius3D } from '../../components/three/TopologyBlastRadius3D';

interface WorkbenchMajorProps {
  incidentId: string;
  onBack: () => void;
}

export const WorkbenchMajor: React.FC<WorkbenchMajorProps> = ({ incidentId, onBack }) => {
  const { lastEvent } = useSse();
  const toast = useToast();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [children, setChildren] = useState<Incident[]>([]);
  const [rca, setRca] = useState<RcaResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCascading, setIsCascading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const fetchMajor = async () => {
    try {
      setLoading(true);
      const inc = await api.incidents.get(incidentId);
      setIncident(inc);

      const [r, childRes] = await Promise.allSettled([
        api.incidents.rca(incidentId),
        api.incidents.list({ parentId: incidentId, limit: 100 }),
      ]);

      if (r.status === 'fulfilled') setRca(r.value);
      if (childRes.status === 'fulfilled') setChildren(childRes.value.items || []);
    } catch (err: any) {
      console.error('Failed to load major incident details', err);
      toast.error('Failed to load major incident: ' + (err?.message || 'Network error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMajor();
  }, [incidentId]);

  useEffect(() => {
    if (lastEvent?.type?.startsWith('incident.') || lastEvent?.type === 'storm.progress') {
      fetchMajor();
    }
  }, [lastEvent]);

  const handleCascadeResolve = async () => {
    setShowConfirmModal(false);
    sound.slot();
    try {
      setIsCascading(true);
      await api.incidents.command(incidentId, 'resolve', {
        resolutionCode: 'FIXED',
        resolutionNotes: 'Expanded LDAP pool max connections to 250 and cleared deadlock queue.',
        rootCauseCategory: 'LDAP_POOL',
      });
      sound.win();
      toast.success(`Major incident resolved! Cascaded to ${children.length} linked child tickets.`);
      await fetchMajor();
    } catch (err: any) {
      sound.err();
      toast.error('Cascade resolution error: ' + (err.message || 'Unknown error'));
    } finally {
      setIsCascading(false);
    }
  };

  if (loading && !incident) {
    return (
      <div className="p-16 text-center text-xs font-mono font-bold text-[var(--soft)] space-y-2">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#FF4D3D]" />
        <p>CONNECTING TO MAJOR INCIDENT COMMAND STREAM...</p>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="pixel-card p-8 text-center text-xs text-[var(--soft)] space-y-4">
        <p className="text-[var(--fg)] font-bold text-base">MAJOR INCIDENT DOSSIER NOT FOUND</p>
        <ActionButton size="standard" variant="secondary" onClick={onBack}>
          Back to Queue
        </ActionButton>
      </div>
    );
  }

  const childCount = incident.childCount ?? children.length;
  const isDone = ['RESOLVED', 'VERIFIED', 'CLOSED'].includes(incident.state);

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Status */}
      <div className="flex items-center justify-between">
        <ActionButton
          size="standard"
          variant="secondary"
          icon={<ChevronLeft className="w-4 h-4" />}
          onClick={() => {
            sound.blip();
            onBack();
          }}
        >
          Back to Technician Queue
        </ActionButton>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1 bg-[#FF4D3D] text-[#FFF8DC] border-2 border-[#1B1530] text-xs font-mono font-bold shadow-[2px_2px_0_#1B1530] animate-pulse">
            <Flame className="w-4 h-4 fill-current" />
            <span>MAJOR INCIDENT COMMAND ACTIVE</span>
          </span>
          <ActionButton
            size="compact"
            variant="outline"
            icon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={() => {
              sound.pick();
              fetchMajor();
            }}
          >
            Sync
          </ActionButton>
        </div>
      </div>

      {/* Main War Room Console */}
      <div className="pixel-card-offset" style={{ '--b': '#FF4D3D' } as any}>
        <span className="pixel-tag-badge">
          <PixelIcon name="shield" scale={1.6} />
          <span>MAJOR COMMAND WAR ROOM · P1 CRITICAL</span>
        </span>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#FF4D3D] mb-1">
              <span className="text-base font-bold">{incident.number}</span>
              <span>•</span>
              <span className="text-[var(--fg)]">{incident.serviceCode || 'APP-ERP'}</span>
              <span>•</span>
              <span>Tier 0/1 Campus Outage</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--fg)] tracking-tight">
              {incident.title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge label="P1 CRITICAL" variant="crit" isMono />
            <StatusBadge label={incident.state} showDot />
          </div>
        </div>

        {/* Major Incident KPI Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 bg-[var(--card)] border-2 border-[var(--line)] text-xs mb-6">
          <div>
            <div className="text-[var(--soft)] font-mono font-bold">Aggregated Children</div>
            <div className="text-xl font-bold text-[#59C9F5] mt-1 flex items-center gap-1.5 font-mono">
              <Layers className="w-4 h-4" />
              <span>{childCount} Linked</span>
            </div>
          </div>
          <div>
            <div className="text-[var(--soft)] font-mono font-bold">B2 Root Cause (DAG)</div>
            <div className="text-xl font-bold text-[#FF4D3D] mt-1 flex items-center gap-1.5 font-mono">
              <Zap className="w-4 h-4" />
              <span>AUTH-LDAP</span>
            </div>
          </div>
          <div>
            <div className="text-[var(--soft)] font-mono font-bold">Primary Blast Radius</div>
            <div className="text-xl font-bold text-[#FF9F43] mt-1 font-mono">4 Services (T0/T1)</div>
          </div>
          <div>
            <div className="text-[var(--soft)] font-mono font-bold">Major Target SLA</div>
            <div className="text-xl font-bold text-[#43D17A] mt-1 flex items-center gap-1.5 font-mono">
              <Clock className="w-4 h-4" />
              <span>30m Response</span>
            </div>
          </div>
        </div>

        {/* 3D Holographic Blast-Radius Topology Core in CRT Frame */}
        <div className="crt-frame space-y-2 mb-6">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-[#FFF8DC] px-1">
            <span className="flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5 text-[#FF4D3D]" />
              <span>LIVE BLAST-RADIUS TOPOLOGY & ROOT CAUSE HOLOGRAPH</span>
            </span>
            <span>19-Node Campus Dependency Graph</span>
          </div>
          <div className="crt-screen">
            <TopologyBlastRadius3D
              isStormActive={true}
              className="h-[360px]"
            />
          </div>
        </div>

        {/* Cascade Resolution Control */}
        <div className="p-4 bg-[var(--card)] border-2 border-[var(--line)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-bold text-sm text-[var(--fg)] font-mono">
              ONE-CLICK MULTI-TICKET CASCADE RESOLUTION
            </h3>
            <p className="text-xs text-[var(--soft)] mt-0.5">
              Resolving this Major Incident will automatically verify and cascade resolution status across all {childCount} child incidents.
            </p>
          </div>

          <ActionButton
            size="cta"
            variant={isDone ? 'ok' : 'crit'}
            isLoading={isCascading}
            disabled={isDone || isCascading}
            icon={<CheckCircle2 className="w-4 h-4" />}
            onClick={() => setShowConfirmModal(true)}
          >
            {isDone ? `Resolved (${childCount} Tickets Cascaded)` : `Cascade Resolve (${childCount} Tickets)`}
          </ActionButton>
        </div>

        {/* Real Linked Children Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between font-mono text-xs font-bold border-b-2 border-[var(--line)] pb-2">
            <span className="text-[var(--fg)] uppercase flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#59C9F5]" />
              <span>LINKED CHILD OUTAGE TICKETS ({children.length})</span>
            </span>
            <span className="text-[var(--soft)]">AUTOMATICALLY AGGREGATED UNDER MASTER</span>
          </div>

          {children.length === 0 ? (
            <p className="text-xs font-mono text-[var(--soft)] py-4 text-center">
              No child incidents linked to this master yet.
            </p>
          ) : (
            <div className="overflow-x-auto border-2 border-[var(--line)] bg-[var(--card)]">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="bg-[#1B1530] text-[#FFF8DC] border-b-2 border-[var(--line)]">
                    <th className="py-2 px-3">Ticket</th>
                    <th className="py-2 px-3">Title</th>
                    <th className="py-2 px-3">Service</th>
                    <th className="py-2 px-3">Priority</th>
                    <th className="py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]/20">
                  {children.map((child) => (
                    <tr key={child.id} className="hover:bg-[#FFD84D]/10">
                      <td className="py-2 px-3 font-bold text-[#FF4D3D]">{child.number}</td>
                      <td className="py-2 px-3 truncate max-w-xs">{child.title}</td>
                      <td className="py-2 px-3 text-[var(--soft)]">{child.serviceCode}</td>
                      <td className="py-2 px-3"><StatusBadge label={child.priority} isMono /></td>
                      <td className="py-2 px-3 flex items-center gap-1.5">
                        <StatusDot state={child.state} />
                        <span>{child.state}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="CONFIRM CASCADE RESOLUTION"
      >
        <div className="space-y-4 text-xs font-mono">
          <p className="text-[#1B1530]">
            Are you sure you want to resolve Major Incident <strong className="text-[#FF4D3D]">{incident.number}</strong>?
          </p>
          <div className="p-3 bg-[#FFF8DC] border-2 border-[#1B1530] text-[#1B1530] space-y-1">
            <p><strong>Action:</strong> Permanent Root Cause Remediation (FIXED)</p>
            <p><strong>Blast Radius:</strong> Cascade to <strong className="text-[#FF4D3D]">{childCount}</strong> open linked child incidents.</p>
            <p><strong>Root Cause:</strong> LDAP Connection Pool Exhaustion</p>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t-2 border-[#1B1530]">
            <ActionButton size="standard" variant="outline" type="button" onClick={() => setShowConfirmModal(false)}>
              Cancel
            </ActionButton>
            <ActionButton size="standard" variant="crit" type="button" onClick={handleCascadeResolve}>
              Confirm & Cascade Resolve
            </ActionButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};
