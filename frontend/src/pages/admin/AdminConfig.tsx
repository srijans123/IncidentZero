import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Clock, Calendar, Cpu, CheckCircle2, RefreshCw } from 'lucide-react';
import { StatusBadge } from '../../components/ui/StatusBadge';

interface SlaPolicyItem {
  id?: string;
  tier?: string;
  priority?: string;
  response_target_min?: number;
  resolution_target_min?: number;
  responseTargetMin?: number;
  resolutionTargetMin?: number;
  mode?: string;
}

export const AdminConfig: React.FC = () => {
  const [policies, setPolicies] = useState<SlaPolicyItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const res = await api.admin.getSlaPolicies();
      if (Array.isArray(res)) {
        setPolicies(res as SlaPolicyItem[]);
      }
    } catch (err) {
      console.error('Failed to load SLA policies', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const formatMins = (mins?: number) => {
    if (mins === undefined || mins === null) return '—';
    if (mins < 60) return `${mins} min`;
    const hours = mins / 60;
    if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''}`;
    const days = hours / 24;
    return `${days} day${days > 1 ? 's' : ''} (${mins} min)`;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-[var(--card)] border-[3px] border-[var(--line)] p-5 shadow-[5px_5px_0_var(--shadow-col)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[var(--sky)] text-xs font-mono font-bold uppercase tracking-wider mb-1">
            <span className="w-2.5 h-2.5 bg-[var(--sky)] border border-[var(--line)] inline-block"></span>
            <span>POLICY & ENGINE CONFIG // COMPILED ARCHITECTURE</span>
          </div>
          <h1 className="text-2xl font-bold font-pixel tracking-wide text-[var(--fg)]">
            Active ITSM Policies & Engine Architecture
          </h1>
          <p className="text-xs font-pixel text-[var(--soft)] mt-1">
            Read-only configuration view of the 16 active database SLA policies, triage matrix, Kuhn-Munkres dispatch, and academic calendar overrides.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchPolicies}
          className="btn w"
        >
          <RefreshCw className="w-4 h-4 inline mr-1" />
          REFRESH POLICIES
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-pixel">
        {/* Left Column: Active Algorithms & Engine Specs */}
        <div className="space-y-6">
          <div className="bg-[var(--card)] border-[3px] border-[var(--line)] p-5 shadow-[5px_5px_0_var(--shadow-col)] space-y-5">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[var(--fg)] uppercase">
              <Cpu className="w-4 h-4 text-[var(--sky)]" />
              <span>Active Engine Algorithms</span>
            </div>

            {/* Active Priority Engine */}
            <div className="space-y-2 text-xs">
              <label className="block text-[var(--soft)] font-mono uppercase text-[11px] font-bold">
                Priority Classification Engine
              </label>
              <div className="p-3 bg-[var(--bg)] border-2 border-[var(--sky)] shadow-[3px_3px_0_var(--shadow-col)] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[var(--fg)]">ITIL 3×3 Priority Matrix</span>
                  <span className="chip g text-[10px]">ACTIVE COMPILER</span>
                </div>
                <p className="text-[11px] text-[var(--soft)] leading-relaxed">
                  Calculates priority from Impact (1–3) and Urgency (1–3), applying academic calendar priority bumps (+1) during active exam and registration windows.
                </p>
              </div>
            </div>

            {/* Active Assignment Strategy */}
            <div className="space-y-2 text-xs pt-3 border-t-2 border-[var(--line)]/30">
              <label className="block text-[var(--soft)] font-mono uppercase text-[11px] font-bold">
                Technician Dispatch Strategy
              </label>
              <div className="p-3 bg-[var(--bg)] border-2 border-[var(--ribbon)] shadow-[3px_3px_0_var(--shadow-col)] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[var(--fg)]">Least Loaded (Active Capacity Reservation)</span>
                  <span className="chip y text-[10px]">ACTIVE ENGINE</span>
                </div>
                <p className="text-[11px] text-[var(--soft)] leading-relaxed">
                  Dynamically queries active ticket loads across qualified service technicians, reserving capacity greedily to maintain sub-15 minute critical MTTA.
                </p>
              </div>
            </div>
          </div>

          {/* Academic Calendar Window Override Card */}
          <div className="bg-[var(--card)] border-[3px] border-[var(--line)] p-5 shadow-[5px_5px_0_var(--shadow-col)] space-y-3 font-pixel">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-mono text-xs font-bold text-[var(--sky)] uppercase flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Academic Calendar Window Governance</span>
              </span>
              <span className="chip g text-[10px] font-mono">
                EXAM WINDOW ACTIVE (BPHC)
              </span>
            </div>

            <p className="text-xs text-[var(--soft)] leading-relaxed">
              When an academic calendar window is active (Mid-Semesters, Comprehensive Exams, or Course Registration), all Campus LMS (<code className="font-mono text-[var(--fg)]">APP-LMS</code>) and Campus SSO (<code className="font-mono text-[var(--fg)]">AUTH-LDAP</code>) issues automatically receive a <strong>+1 Priority Bump</strong> in accordance with campus ITSM governance.
            </p>
          </div>
        </div>

        {/* Right Column: 16 SLA Policy Targets Matrix */}
        <div className="bg-[var(--card)] border-[3px] border-[var(--line)] p-5 shadow-[5px_5px_0_var(--shadow-col)] space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-[var(--fg)] uppercase flex items-center gap-2">
              <Clock className="w-4 h-4 text-[var(--ribbon)]" />
              <span>16 Canonical Database SLA Policies</span>
            </span>
            <span className="text-[11px] font-mono text-[var(--soft)]">
              {policies.length} Policies Loaded
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-pixel">
              <thead>
                <tr className="border-b-2 border-[var(--line)] bg-[var(--bg)] text-[var(--soft)] font-mono text-[11px]">
                  <th className="py-2.5 px-3 font-bold">Tier</th>
                  <th className="py-2.5 px-3 font-bold">Priority</th>
                  <th className="py-2.5 px-3 font-bold">Response Target</th>
                  <th className="py-2.5 px-3 font-bold">Resolution Target</th>
                  <th className="py-2.5 px-3 font-bold">Coverage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]/20 font-mono text-[11px]">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-xs text-[var(--soft)] font-mono">
                      LOADING SLA POLICIES...
                    </td>
                  </tr>
                ) : policies.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-xs text-[var(--soft)] font-mono">
                      NO POLICIES FOUND IN DATABASE
                    </td>
                  </tr>
                ) : (
                  policies.map((pol, idx) => {
                    const resp = pol.response_target_min ?? pol.responseTargetMin;
                    const res = pol.resolution_target_min ?? pol.resolutionTargetMin;
                    const prio = pol.priority || 'P3';
                    const isP1 = prio === 'P1';
                    const isP2 = prio === 'P2';
                    return (
                      <tr key={pol.id || idx} className="hover:bg-[var(--bg)]/40">
                        <td className="py-2 px-3 font-bold">{pol.tier || 'T1'}</td>
                        <td className="py-2 px-3">
                          <span className={`chip text-[10px] ${isP1 ? 'r' : isP2 ? 'y' : ''}`}>
                            {prio}
                          </span>
                        </td>
                        <td className={`py-2 px-3 font-bold ${isP1 ? 'text-red-600' : isP2 ? 'text-amber-700' : 'text-[var(--fg)]'}`}>
                          {formatMins(resp)}
                        </td>
                        <td className={`py-2 px-3 font-bold ${isP1 ? 'text-red-600' : isP2 ? 'text-amber-700' : 'text-[var(--fg)]'}`}>
                          {formatMins(res)}
                        </td>
                        <td className="py-2 px-3 text-[var(--soft)]">
                          {pol.mode || (isP1 ? '24x7 Continuous' : 'Campus (09:00 - 18:00)')}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
