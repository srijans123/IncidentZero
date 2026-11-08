import React from 'react';
import {
  Clock,
  TrendingUp,
  Users,
  Flame,
  Zap,
  Activity,
} from 'lucide-react';
import { PixelIcon } from '../../services/pixelSprites';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { StatusDot } from '../../components/ui/StatusDot';

export const AdminOverview: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="pixel-card-offset" style={{ '--b': '#43D17A' } as any}>
        <span className="pixel-tag-badge">
          <PixelIcon name="wifi" scale={1.6} />
          <span>ROM 03 · CAMPUS COMMAND CENTER</span>
        </span>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--fg)]">
              Operational Command Center
            </h1>
            <p className="text-xs sm:text-sm text-[var(--soft)] mt-1.5 font-medium">
              Real-time BITS Pilani campus IT health metrics, SLA compliance, AI triage performance, and on-call technician utilization.
            </p>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs shrink-0">
            <span className="chip s-DONE font-bold px-3 py-1 shadow-[2px_2px_0_#1B1530]">
              <StatusDot state="CONNECTED" pulse />
              <span>LIVE TELEMETRY (60 FPS)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Executive KPI Grid (5 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Campus Volume', val: '1,428', delta: '↑ 12% vs mid-sem', icon: <Users className="w-4 h-4 text-[#1B1530]" />, col: 'bg-[#59C9F5]' },
          { label: 'Active Major P1', val: '1', delta: 'War room active (AUTH-LDAP)', icon: <Flame className="w-4 h-4 text-[#FFF8DC]" />, col: 'bg-[#FF4D3D] text-[#FFF8DC]' },
          { label: 'SLA Compliance', val: '96.8%', delta: 'Target SLA: 95.0%', icon: <Clock className="w-4 h-4 text-[#1B1530]" />, col: 'bg-[#43D17A]' },
          { label: 'MTTR (Resolution)', val: '24.2m', delta: '-18% faster via RRF', icon: <TrendingUp className="w-4 h-4 text-[#1B1530]" />, col: 'bg-[#FFD84D]' },
          { label: 'AI Deflection Rate', val: '34.6%', delta: '494 tickets deflected', icon: <Zap className="w-4 h-4 text-[#FFF8DC]" />, col: 'bg-[#7C5CFF] text-[#FFF8DC]' },
        ].map((kpi, idx) => (
          <div
            key={kpi.label}
            className="pixel-card p-4 space-y-2 hover:-translate-y-1 transition-transform"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[var(--soft)] uppercase">
                {kpi.label}
              </span>
              <span className={`p-1.5 border-2 border-[#1B1530] shadow-[2px_2px_0_#1B1530] ${kpi.col}`}>
                {kpi.icon}
              </span>
            </div>
            <div className="text-3xl font-bold font-mono text-[var(--fg)] tabular-nums">
              {kpi.val}
            </div>
            <div className="text-[11px] font-mono font-bold text-[var(--soft)]">
              {kpi.delta}
            </div>
          </div>
        ))}
      </div>

      {/* Middle Section: Service Health Grid & Technician Load */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (7 cols): Campus Service Health Roster */}
        <div className="lg:col-span-7 pixel-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b-2 border-[var(--line)] pb-2 font-mono text-xs font-bold">
            <span className="text-[var(--fg)] uppercase">
              CORE CAMPUS SERVICES STATUS (TIER 0 & TIER 1)
            </span>
            <span className="text-[var(--soft)]">19 CATALOG SERVICES ACTIVE</span>
          </div>

          <div className="divide-y-2 divide-[var(--line)]/20 text-xs font-mono">
            {[
              { code: 'AUTH-LDAP', name: 'Active Directory / LDAP SSO', tier: 'T0', status: 'CRITICAL', latency: '910ms', tickets: 26 },
              { code: 'APP-LMS', name: 'Campus Moodle Academic LMS', tier: 'T1', status: 'CRITICAL', latency: '382ms', tickets: 14 },
              { code: 'APP-ERP', name: 'Student Records & AUGSD Portal', tier: 'T1', status: 'WARNING', latency: '145ms', tickets: 8 },
              { code: 'DB-PRIMARY', name: 'PostgreSQL Serverless Core', tier: 'T0', status: 'HEALTHY', latency: '14ms', tickets: 0 },
              { code: 'NET-CORE', name: 'NOC Edge Gateway', tier: 'T0', status: 'HEALTHY', latency: '3ms', tickets: 1 },
              { code: 'HOSTEL-WIFI', name: 'Bhawan Mesh Subnet', tier: 'T1', status: 'HEALTHY', latency: '28ms', tickets: 2 },
            ].map((svc) => (
              <div key={svc.code} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <StatusDot state={svc.status} />
                  <div>
                    <div className="font-bold text-[var(--fg)]">{svc.code}</div>
                    <div className="text-[11px] text-[var(--soft)]">{svc.name}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 tabular-nums">
                  <span className="text-[var(--soft)]">Latency: {svc.latency}</span>
                  <StatusBadge label={svc.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right (5 cols): Technician Capacity & Hungarian Load */}
        <div className="lg:col-span-5 pixel-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b-2 border-[var(--line)] pb-2 font-mono text-xs font-bold">
            <span className="text-[var(--fg)] uppercase">
              TECHNICIAN ON-CALL CAPACITY (8.0 MAX)
            </span>
            <span className="text-[#43D17A]">HUNGARIAN MULTI-PASS</span>
          </div>

          <div className="space-y-3 text-xs">
            {[
              { name: 'Rohan Kulkarni', tier: 'SENIOR', load: 3.5, tickets: 3, avatar: '👨‍💻' },
              { name: 'Vikram Rao', tier: 'L1', load: 4.0, tickets: 4, avatar: '🛠️' },
              { name: 'Priya Menon', tier: 'TEAM_LEAD', load: 1.5, tickets: 1, avatar: '👩‍💼' },
              { name: 'Ananya Iyer', tier: 'L1 (NOC)', load: 2.0, tickets: 2, avatar: '📡' },
            ].map((tech) => (
              <div key={tech.name} className="p-3 border-2 border-[var(--line)] bg-[var(--card)] space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{tech.avatar}</span>
                    <span className="font-bold text-[var(--fg)]">{tech.name}</span>
                    <span className="chip s-ASG text-[10px] py-0 px-1">
                      {tech.tier}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold text-[var(--fg)] tabular-nums">
                    {tech.load} / 8.0 pts ({tech.tickets} active)
                  </span>
                </div>
                <div className="w-full bg-[#1B1530] h-2.5 border-2 border-[#1B1530] overflow-hidden">
                  <div
                    className="h-full bg-[#FFD84D]"
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
