import React, { useState } from 'react';
import { GitBranch, ShieldCheck, CheckCircle2, AlertCircle, Info, RefreshCw, Layers, Cpu, Eye } from 'lucide-react';
import { ActionButton } from '../../components/ui/ActionButton';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { StatusDot } from '../../components/ui/StatusDot';
import { TopologyBlastRadius3D } from '../../components/three/TopologyBlastRadius3D';

interface ServiceNode {
  id: string;
  code: string;
  name: string;
  tier: 'T0' | 'T1' | 'T2' | 'T3';
  status: 'HEALTHY' | 'DEGRADED' | 'OUTAGE';
  team: string;
  x: number;
  y: number;
}

const CAMPUS_SERVICES: ServiceNode[] = [
  // Tier 0
  { id: '1', code: 'CORE-ROUTER', name: 'Campus Core Backbone Gateway', tier: 'T0', status: 'HEALTHY', team: 'NOC Network', x: 140, y: 70 },
  { id: '2', code: 'DNS-DHCP', name: 'Campus Infoblox DNS & DHCP', tier: 'T0', status: 'HEALTHY', team: 'NOC Network', x: 380, y: 70 },
  { id: '3', code: 'AUTH-LDAP', name: 'Active Directory / LDAP SSO', tier: 'T0', status: 'OUTAGE', team: 'Identity & Sec', x: 620, y: 70 },
  { id: '4', code: 'DB-PRIMARY', name: 'PostgreSQL Serverless Cluster', tier: 'T0', status: 'HEALTHY', team: 'Database Team', x: 860, y: 70 },

  // Tier 1
  { id: '5', code: 'APP-ERP', name: 'Campus ERP & AUGSD Records', tier: 'T1', status: 'DEGRADED', team: 'ERP Team', x: 180, y: 220 },
  { id: '6', code: 'APP-LMS', name: 'Nalanda Moodle Academic Portal', tier: 'T1', status: 'OUTAGE', team: 'Academic IT', x: 420, y: 220 },
  { id: '7', code: 'HOSTEL-WIFI', name: 'Bhawan Mesh Network', tier: 'T1', status: 'HEALTHY', team: 'NOC Network', x: 660, y: 220 },
  { id: '8', code: 'FEE-PORTAL', name: 'Student Fee & Payment Gateway', tier: 'T1', status: 'DEGRADED', team: 'Finance Team', x: 900, y: 220 },

  // Tier 2
  { id: '9', code: 'APP-LIB', name: 'Library Koha & EZProxy', tier: 'T2', status: 'DEGRADED', team: 'Library Team', x: 200, y: 370 },
  { id: '10', code: 'CAFETERIA-POS', name: 'Mess POS Payment Terminals', tier: 'T2', status: 'DEGRADED', team: 'Commercial IT', x: 440, y: 370 },
  { id: '11', code: 'LAB-VDI', name: 'GPU Cluster Academic VDI', tier: 'T2', status: 'HEALTHY', team: 'Lab Systems', x: 680, y: 370 },
  { id: '12', code: 'SECURITY-CCTV', name: 'Campus Surveillance Network', tier: 'T2', status: 'HEALTHY', team: 'Security Ops', x: 920, y: 370 },

  // Tier 3
  { id: '13', code: 'BIOMETRIC-GATE', name: 'Hostel Turnstile Biometrics', tier: 'T3', status: 'DEGRADED', team: 'Estate Office', x: 260, y: 520 },
  { id: '14', code: 'PRINT-FLEET', name: 'PaperCut Student Printing', tier: 'T3', status: 'HEALTHY', team: 'Reprographics', x: 500, y: 520 },
  { id: '15', code: 'HEALTH-CENTER', name: 'Medical Center Records', tier: 'T3', status: 'HEALTHY', team: 'Health IT', x: 740, y: 520 },
];

const DEPENDENCY_EDGES = [
  { from: 'APP-ERP', to: 'AUTH-LDAP' },
  { from: 'APP-ERP', to: 'DB-PRIMARY' },
  { from: 'APP-LMS', to: 'AUTH-LDAP' },
  { from: 'APP-LMS', to: 'DB-PRIMARY' },
  { from: 'FEE-PORTAL', to: 'DB-PRIMARY' },
  { from: 'HOSTEL-WIFI', to: 'CORE-ROUTER' },
  { from: 'APP-LIB', to: 'AUTH-LDAP' },
  { from: 'CAFETERIA-POS', to: 'AUTH-LDAP' },
  { from: 'BIOMETRIC-GATE', to: 'AUTH-LDAP' },
  { from: 'DNS-DHCP', to: 'CORE-ROUTER' },
];

export const AdminTopology: React.FC = () => {
  const [viewMode, setViewMode] = useState<'3D' | '2D'>('3D');
  const [selectedNode, setSelectedNode] = useState<ServiceNode | null>(CAMPUS_SERVICES[2]); // AUTH-LDAP

  return (
    <div className="space-y-6">
      {/* Top Header & View Switcher */}
      <div className="surface-panel p-6 bg-[#101217] border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#38BDF8] text-xs font-mono font-medium tracking-wider uppercase mb-1">
              <GitBranch className="w-3.5 h-3.5" />
              <span>Campus Service Dependency DAG (B2 Engine)</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#F3F4F6]">
              Campus Service Topology & Blast Radius
            </h1>
            <p className="text-xs text-[#9BA1AE] mt-1">
              {CAMPUS_SERVICES.length} catalog services and {DEPENDENCY_EDGES.length} directed dependency edges with automated cycle detection and Leaf-Safe root cause analysis.
            </p>
          </div>

          {/* Segmented 3D / 2D Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-md bg-[#161920] border border-white/[0.08]">
            <button
              type="button"
              onClick={() => setViewMode('3D')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                viewMode === '3D'
                  ? 'bg-[#1D212A] text-[#F3F4F6] shadow-sm border border-white/[0.12]'
                  : 'text-[#9BA1AE] hover:text-[#F3F4F6]'
              }`}
            >
              3D Orbital Core
            </button>
            <button
              type="button"
              onClick={() => setViewMode('2D')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                viewMode === '2D'
                  ? 'bg-[#1D212A] text-[#F3F4F6] shadow-sm border border-white/[0.12]'
                  : 'text-[#9BA1AE] hover:text-[#F3F4F6]'
              }`}
            >
              2D Schematic DAG
            </button>
          </div>
        </div>
      </div>

      {/* Main Visualization Canvas */}
      {viewMode === '3D' ? (
        <TopologyBlastRadius3D
          className="h-[520px]"
          isStormActive={true}
          onSelectService={(svcCode) => {
            const found = CAMPUS_SERVICES.find((s) => s.code === svcCode);
            if (found) setSelectedNode(found);
          }}
        />
      ) : (
        <div className="surface-panel p-4 bg-[#101217] border border-white/[0.08] overflow-x-auto">
          <div className="min-w-[1000px] h-[520px] relative bg-[#090A0D] rounded-lg border border-white/[0.06] p-4">
            <svg className="w-full h-full absolute inset-0 pointer-events-none">
              <defs>
                <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#0284C7" stopOpacity="0.2" />
                </linearGradient>
              </defs>
              {DEPENDENCY_EDGES.map((edge, idx) => {
                const s = CAMPUS_SERVICES.find((n) => n.code === edge.from);
                const t = CAMPUS_SERVICES.find((n) => n.code === edge.to);
                if (!s || !t) return null;
                return (
                  <line
                    key={idx}
                    x1={s.x + 80}
                    y1={s.y + 30}
                    x2={t.x + 80}
                    y2={t.y + 30}
                    stroke="url(#edgeGrad)"
                    strokeWidth="2"
                    strokeDasharray={edge.to === 'CORE-ROUTER' ? '4,4' : undefined}
                  />
                );
              })}
            </svg>

            {CAMPUS_SERVICES.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              const isRca = node.code === 'AUTH-LDAP';
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  style={{ left: node.x, top: node.y }}
                  className={`absolute w-44 p-2.5 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#1D212A] border-[#38BDF8] shadow-lg ring-1 ring-[#38BDF8]'
                      : isRca
                      ? 'bg-[#161920] border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                      : 'bg-[#161920] border-white/[0.08] hover:border-white/[0.16]'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-[11px] text-[#9BA1AE] mb-1">
                    <span>{node.tier}</span>
                    <StatusDot state={node.status} />
                  </div>
                  <div className="font-mono font-bold text-xs text-[#F3F4F6] truncate">{node.code}</div>
                  <div className="text-[11px] text-[#9BA1AE] truncate">{node.name}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Service Detail Drawer */}
      {selectedNode && (
        <div className="surface-panel p-5 bg-[#101217] border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono font-bold text-sm text-[#F3F4F6]">{selectedNode.code}</span>
              <StatusBadge label={selectedNode.tier} variant="neutral" isMono />
              <StatusBadge label={selectedNode.status} showDot />
              {selectedNode.code === 'AUTH-LDAP' && (
                <span className="px-2 py-0.5 rounded text-[11px] bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono font-semibold">
                  ★ TOP B2 ROOT CAUSE (Score 1.05)
                </span>
              )}
            </div>
            <p className="text-[#9BA1AE]">{selectedNode.name} • Assigned Team: <span className="text-slate-200">{selectedNode.team}</span></p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="px-3 py-1.5 rounded bg-[#161920] border border-white/[0.06] text-slate-300">
              Downstream Dependents: <strong className="text-[#38BDF8]">{DEPENDENCY_EDGES.filter((e) => e.to === selectedNode.code).length} Services</strong>
            </div>
            <div className="px-3 py-1.5 rounded bg-[#161920] border border-white/[0.06] text-slate-300">
              Upstream Dependencies: <strong className="text-[#F43F5E]">{DEPENDENCY_EDGES.filter((e) => e.from === selectedNode.code).length} Direct</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
