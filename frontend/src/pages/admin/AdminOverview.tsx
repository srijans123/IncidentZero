import React from 'react';
import {
  ShieldAlert,
  Clock,
  TrendingUp,
  Cpu,
  Users,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Zap,
  Server,
  Activity,
  Layers,
} from 'lucide-react';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { StatusDot } from '../../components/ui/StatusDot';

export const AdminOverview: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="surface-panel p-6 bg-[#101217] border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#38BDF8] text-xs font-mono font-medium tracking-wider uppercase mb-1">
              <Activity className="w-3.5 h-3.5" />
              <span>Campus IT Executive Governance</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#F3F4F6]">
              Operational Command Center
            </h1>
            <p className="text-xs text-[#9BA1AE] mt-1">
              Real-time campus IT health metrics, SLA compliance, AI triage performance, and on-call technician utilization.
            </p>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#161920] border border-white/[0.08] text-[#10B981]">
              <StatusDot state="CONNECTED" pulse />
              <span>TELEMETRY LIVE (60 FPS)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Executive KPI Grid (5 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="surface-panel p-4 bg-[#101217] border border-white/[0.08] space-y-2">
          <div className="text-[#9BA1AE] text-xs font-medium flex items-center justify-between">
            <span>Total Campus Volume</span>
            <Users className="w-3.5 h-3.5 text-[#38BDF8]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#F3F4F6] tabular-nums">1,428</div>
          <div className="text-[11px] text-[#10B981] font-mono flex items-center gap-1">
            <span className="font-serif italic text-xs">↑ 12%</span> vs last exam week
          </div>
        </div>

        <div className="surface-panel p-4 bg-rose-500/10 border border-rose-500/30 space-y-2">
          <div className="text-rose-400 text-xs font-medium flex items-center justify-between">
            <span>Active Major P1</span>
            <Flame className="w-3.5 h-3.5 text-rose-400 fill-current" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-200 tabular-nums">1</div>
          <div className="text-[11px] text-rose-300 font-mono">
            War room active (AUTH-LDAP)
          </div>
        </div>

        <div className="surface-panel p-4 bg-[#101217] border border-white/[0.08] space-y-2">
          <div className="text-[#9BA1AE] text-xs font-medium flex items-center justify-between">
            <span>SLA Compliance</span>
            <Clock className="w-3.5 h-3.5 text-[#10B981]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#10B981] tabular-nums">96.8%</div>
          <div className="text-[11px] text-[#9BA1AE] font-mono">
            Target SLA: 95.0%
          </div>
        </div>

        <div className="surface-panel p-4 bg-[#101217] border border-white/[0.08] space-y-2">
          <div className="text-[#9BA1AE] text-xs font-medium flex items-center justify-between">
            <span>MTTR (Resolution)</span>
            <TrendingUp className="w-3.5 h-3.5 text-[#38BDF8]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#38BDF8] tabular-nums">24.2m</div>
          <div className="text-[11px] text-[#10B981] font-mono">
            <span className="font-serif italic text-xs">-18%</span> faster with A1 RRF
          </div>
        </div>

        <div className="surface-panel p-4 bg-[#101217] border border-white/[0.08] space-y-2">
          <div className="text-[#9BA1AE] text-xs font-medium flex items-center justify-between">
            <span>AI Deflection Rate</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300 tabular-nums">34.6%</div>
          <div className="text-[11px] text-amber-400 font-mono">
            494 tickets deflected via A6
          </div>
        </div>
      </div>

      {/* Middle Section: Service Health Grid & Technician Load */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (7 cols): Campus Service Health Roster */}
        <div className="lg:col-span-7 surface-panel p-5 bg-[#101217] border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-semibold text-[#F3F4F6] uppercase">
              Core Campus Services Status (Tier 0 & Tier 1)
            </span>
            <span className="text-[11px] font-mono text-[#9BA1AE]">19 Catalog Services Active</span>
          </div>

          <div className="divide-y divide-white/[0.04] text-xs">
            {[
              { code: 'AUTH-LDAP', name: 'Active Directory / LDAP SSO', tier: 'T0', status: 'CRITICAL', latency: '910ms', tickets: 26 },
              { code: 'APP-LMS', name: 'Nalanda Moodle Academic Portal', tier: 'T1', status: 'CRITICAL', latency: '382ms', tickets: 14 },
              { code: 'APP-ERP', name: 'Student Records & AUGSD Portal', tier: 'T1', status: 'WARNING', latency: '145ms', tickets: 8 },
              { code: 'DB-PRIMARY', name: 'PostgreSQL Serverless Core', tier: 'T0', status: 'HEALTHY', latency: '14ms', tickets: 0 },
              { code: 'NET-CORE', name: 'NOC Edge Gateway', tier: 'T0', status: 'HEALTHY', latency: '3ms', tickets: 1 },
              { code: 'HOSTEL-WIFI', name: 'Bhawan Mesh Subnet', tier: 'T1', status: 'HEALTHY', latency: '28ms', tickets: 2 },
            ].map((svc) => (
              <div key={svc.code} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <StatusDot state={svc.status} />
                  <div>
                    <div className="font-mono font-bold text-slate-200">{svc.code}</div>
                    <div className="text-[11px] text-[#9BA1AE]">{svc.name}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 font-mono text-[11px] tabular-nums">
                  <span className="text-[#9BA1AE]">Latency: {svc.latency}</span>
                  <StatusBadge label={svc.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right (5 cols): Technician Capacity & Hungarian Load */}
        <div className="lg:col-span-5 surface-panel p-5 bg-[#101217] border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-semibold text-[#F3F4F6] uppercase">
              Technician On-Call Capacity (8.0 Max)
            </span>
            <span className="text-[11px] font-mono text-[#10B981]">Hungarian Multi-Pass</span>
          </div>

          <div className="space-y-3 text-xs">
            {[
              { name: 'Rohan Kulkarni', tier: 'SENIOR', load: 3.5, tickets: 3, avatar: '👨‍💻' },
              { name: 'Vikram Rao', tier: 'L1', load: 4.0, tickets: 4, avatar: '🛠️' },
              { name: 'Priya Menon', tier: 'TEAM_LEAD', load: 1.5, tickets: 1, avatar: '👩‍💼' },
              { name: 'Ananya Iyer', tier: 'L1 (NOC)', load: 2.0, tickets: 2, avatar: '📡' },
            ].map((tech) => (
              <div key={tech.name} className="p-3 rounded bg-[#161920] border border-white/[0.06] space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{tech.avatar}</span>
                    <span className="font-medium text-slate-200">{tech.name}</span>
                    <span className="px-1.5 py-0.5 rounded text-[11px] font-mono bg-white/[0.06] text-[#9BA1AE]">
                      {tech.tier}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-[#38BDF8] tabular-nums">
                    {tech.load} / 8.0 pts ({tech.tickets} active)
                  </span>
                </div>
                <div className="w-full bg-[#090A0D] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#38BDF8] rounded-full"
                    style={{ width: `${(tech.load / 8.0) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
