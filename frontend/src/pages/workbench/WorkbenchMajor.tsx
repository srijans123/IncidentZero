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
        resolutionNotes: 'Root cause in central LDAP authentication pool remediated. All child sessions verified restored.',
        rootCauseCategory: 'LDAP_POOL',
      });
      setCascadedSuccess(true);
      await fetchMajor();
    } catch (err: any) {
      alert('Cascade resolution failed: ' + err.message);
    } finally {
      setIsCascading(false);
    }
  };

  if (loading && !incident) {
    return (
      <div className="p-16 text-center text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-rose-500" />
        Loading Major Incident Commander Console...
      </div>
    );
  }

  if (!incident) return null;

  const childCount = stormProgress?.childCount || 36;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Workbench Queue</span>
        </button>

        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-1 rounded-xl bg-rose-600/20 text-rose-300 border border-rose-500/40 text-xs font-mono font-bold animate-pulse flex items-center space-x-1.5">
            <Flame className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
            <span>MAJOR INCIDENT COMMAND ACTIVE</span>
          </span>
          <button
            onClick={fetchMajor}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main War Room Console */}
      <div className="glass-panel rounded-2xl p-6 border border-rose-500/30 bg-gradient-to-r from-slate-950 via-rose-950/20 to-slate-950 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs text-rose-400 font-semibold mb-1">
              <span className="font-mono text-sm">{incident.number || `INC-${incident.id.slice(0, 8)}`}</span>
              <span>•</span>
              <span className="font-mono text-slate-200">{incident.serviceCode || 'APP-ERP'}</span>
              <span>•</span>
              <span>Primary Blast Radius: Campus Critical Tier 1</span>
            </div>
            <h1 className="text-2xl font-black text-white">{incident.title}</h1>
          </div>

          <div className="flex items-center space-x-3">
            <span className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-extrabold text-xs shadow-lg shadow-rose-600/40">
              P1 CRITICAL
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-mono text-xs font-bold">
              {incident.state}
            </span>
          </div>
        </div>

        {/* Major Incident KPI Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
          <div>
            <div className="text-slate-400 text-[11px]">Aggregated Child Reports</div>
            <div className="text-xl font-black text-indigo-400 mt-1 flex items-center space-x-2">
              <Layers className="w-5 h-5" />
              <span>{childCount} Linked Tickets</span>
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-[11px]">B2 Root Cause Candidate</div>
            <div className="text-xl font-black text-rose-400 mt-1 flex items-center space-x-2 font-mono">
              <Zap className="w-5 h-5" />
              <span>AUTH-LDAP</span>
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-[11px]">Primary Blast Radius</div>
            <div className="text-xl font-black text-amber-400 mt-1">4 Services (T0/T1)</div>
          </div>
          <div>
            <div className="text-slate-400 text-[11px]">Major SLA Target</div>
            <div className="text-xl font-black text-emerald-400 mt-1 flex items-center space-x-1.5">
              <Clock className="w-4 h-4" />
              <span>30m Target (24x7)</span>
            </div>
          </div>
        </div>

        {/* Live Blast-Radius Topology Graph */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
              <GitBranch className="w-4 h-4 text-rose-400" />
              <span>Impact Propagation & Root Cause DAG (B2 Graph Engine)</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">19-Node Campus Topology</span>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 overflow-x-auto">
            <div className="min-w-[650px] flex items-center justify-between relative py-6">
              {/* Node 1: AUTH-LDAP (Root Candidate) */}
              <div className="p-4 rounded-2xl bg-rose-950/40 border-2 border-rose-500 text-center space-y-1 shadow-lg shadow-rose-500/20 relative z-10 w-44">
                <span className="px-2 py-0.5 rounded bg-rose-500 text-white font-mono text-[10px] font-bold">
                  ROOT CAUSE #1
                </span>
                <div className="text-base font-black text-white font-mono">AUTH-LDAP</div>
                <div className="text-[11px] text-rose-300 font-medium">SSO Directory Broker</div>
                <div className="text-[10px] font-mono text-slate-400 mt-1">Score: 1.05 • T0</div>
              </div>

              {/* Connecting Edges */}
              <div className="flex-1 flex flex-col justify-between h-32 px-4 relative">
                <div className="border-t-2 border-dashed border-rose-500/60 w-full translate-y-4" />
                <div className="border-t-2 border-dashed border-amber-500/60 w-full" />
                <div className="border-t-2 border-dashed border-amber-500/60 w-full -translate-y-4" />
              </div>

              {/* Dependent Services */}
              <div className="space-y-3 w-48 relative z-10">
                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/50 text-xs">
                  <div className="font-bold text-white font-mono">APP-ERP</div>
                  <div className="text-[10px] text-amber-300">Course Registration (22 reports)</div>
                </div>
                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/50 text-xs">
                  <div className="font-bold text-white font-mono">APP-LMS</div>
                  <div className="text-[10px] text-amber-300">Nalanda Portal (10 reports)</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs">
                  <div className="font-bold text-slate-200 font-mono">APP-LIB</div>
                  <div className="text-[10px] text-slate-400">Library EZProxy (4 reports)</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Master Cascade Actions */}
        <div className="p-6 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-white flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-400" />
              <span>Cascading Master Incident Resolution</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Resolving this master incident executes <code className="text-indigo-300 font-mono">resolveWithMaster</code> on all {childCount} linked child incidents in a single atomic transaction. Students can verify or reject individually from their portals.
            </p>
          </div>

          <button
            onClick={handleCascadeResolve}
            disabled={isCascading || incident.state === 'RESOLVED' || incident.state === 'CLOSED'}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50 flex items-center space-x-2 whitespace-nowrap"
          >
            {isCascading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Cascading to {childCount} Tickets...</span>
              </>
            ) : cascadedSuccess || incident.state === 'RESOLVED' ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Master & Children Resolved!</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Resolve Master & Cascade ({childCount})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
