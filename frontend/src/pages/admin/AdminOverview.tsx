import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useSse } from '../../context/SseContext';
import {
  Clock,
  TrendingUp,
  Users,
  Flame,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { PixelIcon } from '../../services/pixelSprites';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { StatusDot } from '../../components/ui/StatusDot';

export const AdminOverview: React.FC = () => {
  const { lastEvent } = useSse();
  const [metrics, setMetrics] = useState<any>(null);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const [m, t, s] = await Promise.allSettled([
        api.admin.getMetrics(),
        api.technicians.list(),
        api.services.getTopology(),
      ]);
      if (m.status === 'fulfilled') setMetrics(m.value);
      if (t.status === 'fulfilled') setTechnicians(t.value || []);
      if (s.status === 'fulfilled') setServices(s.value.nodes || []);
    } catch (e) {
      console.error('Failed to load admin metrics', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    if (lastEvent?.type?.startsWith('incident.') || lastEvent?.type === 'storm.progress') {
      fetchDashboard();
    }
  }, [lastEvent]);

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
              Real-time BITS Pilani campus IT health metrics, SLA compliance, and on-call technician utilization.
            </p>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs shrink-0">
            <span className="chip s-DONE font-bold px-3 py-1 shadow-[2px_2px_0_#1B1530]">
              <StatusDot state="CONNECTED" pulse />
              <span>LIVE TELEMETRY</span>
            </span>
          </div>
        </div>
      </div>

      {/* Executive KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Campus Volume', val: metrics?.totalVolume ?? 0, delta: 'Verified incident records', icon: <Users className="w-4 h-4 text-[#1B1530]" />, col: 'bg-[#59C9F5]' },
          { label: 'Active Major P1', val: metrics?.activeMajorP1 ?? 0, delta: 'P1 War Room active', icon: <Flame className="w-4 h-4 text-[#FFF8DC]" />, col: 'bg-[#FF4D3D] text-[#FFF8DC]' },
          { label: 'SLA Compliance', val: metrics?.slaCompliance ?? '100.0%', delta: 'Non-breached tickets', icon: <Clock className="w-4 h-4 text-[#1B1530]" />, col: 'bg-[#43D17A]' },
          { label: 'MTTR (Resolution)', val: metrics?.mttrMinutes ?? '0.0m', delta: 'Average resolution time', icon: <TrendingUp className="w-4 h-4 text-[#1B1530]" />, col: 'bg-[#FFD84D]' },
        ].map((kpi) => (
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
              CAMPUS SERVICES STATUS ({services.length} SERVICES)
            </span>
            <span className="text-[var(--soft)]">LIVE OUTAGE TELEMETRY</span>
          </div>

          <div className="divide-y-2 divide-[var(--line)]/20 text-xs font-mono max-h-96 overflow-y-auto">
            {services.map((svc) => (
              <div key={svc.id} className="py-2.5 flex items-center justify-between pr-2">
                <div className="flex items-center gap-3">
                  <StatusDot state={svc.status} />
                  <div>
                    <div className="font-bold text-[var(--fg)]">{svc.code}</div>
                    <div className="text-[11px] text-[var(--soft)]">{svc.name}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 tabular-nums">
                  <span className="text-[var(--soft)]">{svc.openIncidents} Open</span>
                  <StatusBadge label={svc.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right (5 cols): Technician Capacity */}
        <div className="lg:col-span-5 pixel-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b-2 border-[var(--line)] pb-2 font-mono text-xs font-bold">
            <span className="text-[var(--fg)] uppercase">
              TECHNICIAN LOAD & CAPACITY
            </span>
            <span className="text-[#43D17A]">ON-CALL STATUS</span>
          </div>

          <div className="space-y-3 text-xs">
            {technicians.map((t) => {
              const ratio = Math.min(1.0, t.loadPoints / Math.max(1.0, t.capacity));
              const pct = Math.round(ratio * 100);
              return (
                <div key={t.id} className="p-3 bg-white border-2 border-[#1B1530] space-y-1.5 shadow-[2px_2px_0_#1B1530]">
                  <div className="flex items-center justify-between font-mono font-bold">
                    <span className="text-[#1B1530]">{t.name}</span>
                    <span className="text-[var(--soft)]">{t.supportTier} · {t.teamCode}</span>
                  </div>
                  <div className="w-full bg-[#1B1530] h-2 border border-[#1B1530] overflow-hidden">
                    <div
                      className={`h-full ${pct > 80 ? 'bg-[#FF4D3D]' : pct > 50 ? 'bg-[#FFD84D]' : 'bg-[#43D17A]'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-[var(--soft)]">
                    <span>Load: {t.loadPoints.toFixed(1)} / {t.capacity.toFixed(1)} pts</span>
                    <span className="font-bold text-[#1B1530]">{pct}% utilized</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
