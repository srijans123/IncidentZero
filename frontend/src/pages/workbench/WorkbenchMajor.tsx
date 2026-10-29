import React, { useEffect, useState } from 'react';
import { Incident, RcaResult } from '../../types';
import { api } from '../../services/api';
import { useSse } from '../../context/SseContext';
import {
  Flame,
  ChevronLeft,
  AlertTriangle,
  GitBranch,
  Layers,
  CheckCircle2,
  RefreshCw,
  Clock,
  Shield,
  Zap,
} from 'lucide-react';
import { ActionButton } from '../../components/ui/ActionButton';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { StatusDot } from '../../components/ui/StatusDot';
import { TopologyBlastRadius3D } from '../../components/three/TopologyBlastRadius3D';

interface WorkbenchMajorProps {
  incidentId: string;
  onBack: () => void;
}

export const WorkbenchMajor: React.FC<WorkbenchMajorProps> = ({ incidentId, onBack }) => {
  const { lastEvent, stormProgress } = useSse();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [rca, setRca] = useState<RcaResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCascading, setIsCascading] = useState(false);
  const [cascadedSuccess, setCascadedSuccess] = useState(false);

  const fetchMajor = async () => {
    try {
      setLoading(true);
      const inc = await api.incidents.get(incidentId);
      setIncident(inc);
      const r = await api.incidents.rca(incidentId);
      setRca(r);
    } catch (err) {
      console.error('Failed to load major incident details', err);
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
    if (!confirm('Resolve this Major Incident and automatically cascade resolution to all linked child tickets?')) {
      return;
    }

    try {
      setIsCascading(true);
      await api.incidents.command(incidentId, 'resolve', {
        resolutionCode: 'FIXED',
        resolutionNotes: 'Expanded LDAP pool max connections to 250 and cleared deadlock queue.',
        rootCauseCategory: 'LDAP_POOL',
      });
      setCascadedSuccess(true);
      fetchMajor();
    } catch (err: any) {
      alert('Cascade resolution error: ' + (err.message || 'Unknown'));
    } finally {
      setIsCascading(false);
    }
  };

  if (loading && !incident) {
    return (
      <div className="p-16 text-center text-[#9BA1AE] text-xs">
        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#F43F5E]" />
        <span>Connecting to Major Incident Command Stream...</span>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="surface-panel p-8 text-center text-xs text-[#9BA1AE]">
        <p className="text-slate-300 font-semibold mb-2">Major incident not found</p>
        <ActionButton size="standard" variant="secondary" onClick={onBack}>
          Back to Queue
        </ActionButton>
      </div>
    );
  }

  const childCount = (incident as any).childIncidentIds?.length ?? 0;
  const isDone = ['RESOLVED', 'VERIFIED', 'CLOSED'].includes(incident.state);

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Status */}
      <div className="flex items-center justify-between">
        <ActionButton
          size="standard"
          variant="secondary"
          icon={<ChevronLeft className="w-4 h-4" />}
          onClick={onBack}
        >
          Back to Technician Queue
        </ActionButton>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F43F5E]/15 border border-[#F43F5E]/30 text-xs font-mono font-bold text-[#FDA4AF] animate-pulse">
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>MAJOR INCIDENT COMMAND ACTIVE</span>
          </span>
          <ActionButton
            size="compact"
            variant="outline"
            icon={<RefreshCw className="w-3 h-3" />}
            onClick={fetchMajor}
          >
            Sync
          </ActionButton>
        </div>
      </div>

      {/* Main War Room Console */}
      <div className="surface-panel p-6 bg-[#101217] border border-[#F43F5E]/30 shadow-[inset_0_1px_0_0_rgba(244,63,94,0.15)] space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#FDA4AF] mb-1">
              <span className="text-sm font-bold text-[#F43F5E]">{incident.number}</span>
              <span>•</span>
              <span className="text-slate-200">{incident.serviceCode || 'SVC-ERP'}</span>
              <span>•</span>
              <span>Tier 0/1 Campus Outage</span>
            </div>
            <h1 className="text-2xl font-bold text-[#F3F4F6] tracking-tight">{incident.title}</h1>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge label="P1 CRITICAL" variant="crit" isMono />
            <StatusBadge label={incident.state} showDot />
          </div>
        </div>

        {/* Major Incident KPI Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 rounded-lg bg-[#161920] border border-white/[0.06] text-xs">
          <div>
            <div className="text-[#9BA1AE] text-[11px] font-mono">Aggregated Child Tickets</div>
            <div className="text-lg font-bold text-[#38BDF8] mt-1 flex items-center gap-1.5 font-mono">
              <Layers className="w-4 h-4" />
              <span>{childCount} Linked</span>
            </div>
          </div>
          <div>
            <div className="text-[#9BA1AE] text-[11px] font-mono">B2 Root Cause (DAG)</div>
            <div className="text-lg font-bold text-[#F43F5E] mt-1 flex items-center gap-1.5 font-mono">
              <Zap className="w-4 h-4" />
              <span>AUTH-LDAP</span>
            </div>
          </div>
          <div>
            <div className="text-[#9BA1AE] text-[11px] font-mono">Primary Blast Radius</div>
            <div className="text-lg font-bold text-[#F59E0B] mt-1 font-mono">4 Services (T0/T1)</div>
          </div>
          <div>
            <div className="text-[#9BA1AE] text-[11px] font-mono">Major Target SLA</div>
            <div className="text-lg font-bold text-[#10B981] mt-1 flex items-center gap-1.5 font-mono">
              <Clock className="w-4 h-4" />
              <span>30m Response (24x7)</span>
            </div>
          </div>
        </div>

        {/* 3D Holographic Blast-Radius Topology Core */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-[#9BA1AE] px-1">
            <span className="flex items-center gap-1.5 text-slate-300">
              <GitBranch className="w-3.5 h-3.5 text-[#F43F5E]" />
              <span>LIVE BLAST-RADIUS TOPOLOGY & ROOT CAUSE HOLOGRAPH</span>
            </span>
            <span>19-Node Campus Dependency Graph</span>
          </div>

          <TopologyBlastRadius3D
            isStormActive={true}
            className="h-[380px]"
          />
        </div>

        {/* Cascade Resolution Control */}
        <div className="p-4 rounded-lg bg-[#161920] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-xs text-[#F3F4F6]">One-Click Multi-Ticket Cascade Resolution</h3>
            <p className="text-xs text-[#9BA1AE] mt-0.5">
              Resolving this Major Incident will automatically verify and cascade resolution status across all {childCount} child incidents.
            </p>
          </div>

          <ActionButton
            size="cta"
            variant="primary"
            isLoading={isCascading}
            disabled={isDone || isCascading}
            icon={<CheckCircle2 className="w-4 h-4 text-[#10B981]" />}
            onClick={handleCascadeResolve}
          >
            {isDone ? `Resolved (${childCount} Tickets Cascaded)` : `Cascade Resolve (${childCount} Tickets)`}
          </ActionButton>
        </div>
      </div>
    </div>
  );
};
