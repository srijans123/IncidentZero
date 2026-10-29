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
} from 'lucide-react';

export const AdminOverview: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="text-slate-400 text-xs font-semibold flex items-center justify-between">
            <span>Total Tickets</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">1,428</div>
          <div className="text-[11px] text-emerald-400 flex items-center space-x-1">
            <span>↑ 12% this week</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-rose-500/30 bg-rose-950/10 space-y-2">
          <div className="text-rose-400 text-xs font-semibold flex items-center justify-between">
            <span>Active P1 Critical</span>
            <Flame className="w-4 h-4 text-rose-400 fill-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-300">2</div>
          <div className="text-[11px] text-slate-400">War room active</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="text-slate-400 text-xs font-semibold flex items-center justify-between">
            <span>SLA Compliance</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">96.8%</div>
          <div className="text-[11px] text-slate-400">Target: 95.0%</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="text-slate-400 text-xs font-semibold flex items-center justify-between">
            <span>MTTR (Resolution)</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-300">24.2m</div>
          <div className="text-[11px] text-emerald-400">-18% vs baseline</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="text-slate-400 text-xs font-semibold flex items-center justify-between">
            <span>AI Deflection Rate</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300">38.4%</div>
          <div className="text-[11px] text-slate-400">Self-help KB (A6)</div>
        </div>
      </div>

      {/* High-Fidelity Analytic Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SLA Compliance by Service Tier */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>SLA Compliance by Service Tier</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">Last 30 Days</span>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { tier: 'T0 Campus Core (LDAP, Core Router)', pct: 99.4, color: 'bg-emerald-500' },
              { tier: 'T1 Academic Critical (ERP, Nalanda LMS)', pct: 97.2, color: 'bg-cyan-500' },
              { tier: 'T2 Campus Auxiliary (Library, VDI)', pct: 95.8, color: 'bg-indigo-500' },
              { tier: 'T3 Student Facilities (Hostel Wi-Fi)', pct: 92.6, color: 'bg-amber-500' },
            ].map((item, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">{item.tier}</span>
                  <span className="text-slate-200 font-mono font-bold">{item.pct}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`${item.color} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technician Workload Gini Distribution */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Technician Load Balancing (Hungarian Batch)</span>
            </h2>
            <span className="text-xs text-emerald-400 font-mono font-bold">Gini: 0.12 (Optimal)</span>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { name: 'Rohan Kulkarni (Senior Tech - ERP)', load: '6 / 15 slots (40%)', bar: '40%', color: 'bg-indigo-500' },
              { name: 'Vikram Joshi (L1 Tech - Desk)', load: '8 / 18 slots (44%)', bar: '44%', color: 'bg-cyan-500' },
              { name: 'Priya Nair (Lead - Applications)', load: '4 / 12 slots (33%)', bar: '33%', color: 'bg-emerald-500' },
              { name: 'Ananya Rao (Tech - NOC/Network)', load: '7 / 15 slots (46%)', bar: '46%', color: 'bg-purple-500' },
            ].map((tech, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">{tech.name}</span>
                  <span className="text-slate-400 font-mono text-[11px]">{tech.load}</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`${tech.color} h-full rounded-full transition-all duration-500`}
                    style={{ width: tech.bar }}
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
