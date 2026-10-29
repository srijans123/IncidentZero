import React, { useState } from 'react';
import { GitBranch, ShieldCheck, CheckCircle2, AlertCircle, Info, RefreshCw } from 'lucide-react';

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
  // Layer 0: Core Network & Identity (T0)
  { id: '1', code: 'CORE-ROUTER', name: 'Campus Core Backbone Router', tier: 'T0', status: 'HEALTHY', team: 'NOC Network', x: 120, y: 80 },
  { id: '2', code: 'DNS-DHCP', name: 'Campus Infoblox DNS & DHCP', tier: 'T0', status: 'HEALTHY', team: 'NOC Network', x: 380, y: 80 },
  { id: '3', code: 'AUTH-LDAP', name: 'Central LDAP & Single Sign-On', tier: 'T0', status: 'DEGRADED', team: 'Identity & Sec', x: 640, y: 80 },

  // Layer 1: Core Connectivity & Gateways (T1)
  { id: '4', code: 'CAMPUS-WIFI', name: 'Aruba Academic Wi-Fi', tier: 'T1', status: 'HEALTHY', team: 'NOC Network', x: 100, y: 220 },
  { id: '5', code: 'HOSTEL-NET', name: 'Bhawan Wired & Wireless Subnet', tier: 'T2', status: 'HEALTHY', team: 'NOC Network', x: 260, y: 220 },
  { id: '6', code: 'VPN-GATEWAY', name: 'Fortinet Remote Access VPN', tier: 'T2', status: 'HEALTHY', team: 'NOC Network', x: 440, y: 220 },
  { id: '7', code: 'MAIL-EXCHANGE', name: 'BITS Campus Exchange & O365', tier: 'T1', status: 'HEALTHY', team: 'IT Services', x: 620, y: 220 },
  { id: '8', code: 'SECURITY-CCTV', name: 'Axis Surveillance Grid', tier: 'T3', status: 'HEALTHY', team: 'Campus Security', x: 780, y: 220 },

  // Layer 2: Academic & Student Applications (T1)
  { id: '9', code: 'APP-ERP', name: 'PeopleSoft Campus ERP / AUGSD', tier: 'T1', status: 'DEGRADED', team: 'ERP Team', x: 140, y: 360 },
  { id: '10', code: 'APP-LMS', name: 'Nalanda Moodle LMS Portal', tier: 'T1', status: 'DEGRADED', team: 'Academic IT', x: 320, y: 360 },
  { id: '11', code: 'APP-LIB', name: 'Library EZProxy & Catalog', tier: 'T2', status: 'DEGRADED', team: 'Library Services', x: 500, y: 360 },
  { id: '12', code: 'FEE-PORTAL', name: 'SWD Student Fee & FinAid', tier: 'T1', status: 'HEALTHY', team: 'Accounts Team', x: 680, y: 360 },

  // Layer 3: Auxiliary & Labs (T2/T3)
  { id: '13', code: 'LAB-VDI', name: 'Nvidia GPU Academic VDI Pods', tier: 'T2', status: 'HEALTHY', team: 'Lab Systems', x: 100, y: 500 },
  { id: '14', code: 'RESEARCH-GRID', name: 'HPC Supercomputing Cluster', tier: 'T2', status: 'HEALTHY', team: 'Research IT', x: 260, y: 500 },
  { id: '15', code: 'PRINT-SVR', name: 'PaperCut Campus Print Fleet', tier: 'T2', status: 'HEALTHY', team: 'IT Services', x: 420, y: 500 },
  { id: '16', code: 'ROOM-BOOKING', name: 'Campus Auditoriums & Labs', tier: 'T2', status: 'HEALTHY', team: 'Admin Services', x: 580, y: 500 },
  { id: '17', code: 'SPORTS-PORTAL', name: 'SAC Gym & Courts Reservation', tier: 'T3', status: 'HEALTHY', team: 'Sports Board', x: 740, y: 500 },
  { id: '18', code: 'STUDENT-PORTAL', name: 'SWD Student Life & Hostels', tier: 'T1', status: 'HEALTHY', team: 'SWD Team', x: 200, y: 640 },
  { id: '19', code: 'WEB-PORTAL', name: 'Public Campus Homepage & CMS', tier: 'T1', status: 'HEALTHY', team: 'Web Team', x: 540, y: 640 },
];

const DEPENDENCY_EDGES = [
  // Core Network Edges
  { from: 'CAMPUS-WIFI', to: 'CORE-ROUTER' },
  { from: 'CAMPUS-WIFI', to: 'DNS-DHCP' },
  { from: 'HOSTEL-NET', to: 'CORE-ROUTER' },
  { from: 'HOSTEL-NET', to: 'DNS-DHCP' },
  { from: 'VPN-GATEWAY', to: 'CORE-ROUTER' },
  { from: 'VPN-GATEWAY', to: 'AUTH-LDAP' },
  { from: 'MAIL-EXCHANGE', to: 'AUTH-LDAP' },
  { from: 'SECURITY-CCTV', to: 'CORE-ROUTER' },

  // Application to Auth / DB Edges
  { from: 'APP-ERP', to: 'AUTH-LDAP' },
  { from: 'APP-ERP', to: 'CORE-ROUTER' },
  { from: 'APP-LMS', to: 'AUTH-LDAP' },
  { from: 'APP-LMS', to: 'CORE-ROUTER' },
  { from: 'APP-LIB', to: 'AUTH-LDAP' },
  { from: 'FEE-PORTAL', to: 'APP-ERP' },
  { from: 'FEE-PORTAL', to: 'AUTH-LDAP' },

  // Auxiliary Edges
  { from: 'LAB-VDI', to: 'AUTH-LDAP' },
  { from: 'LAB-VDI', to: 'CAMPUS-WIFI' },
  { from: 'RESEARCH-GRID', to: 'AUTH-LDAP' },
  { from: 'PRINT-SVR', to: 'AUTH-LDAP' },
  { from: 'ROOM-BOOKING', to: 'AUTH-LDAP' },
  { from: 'SPORTS-PORTAL', to: 'AUTH-LDAP' },
  { from: 'STUDENT-PORTAL', to: 'APP-ERP' },
  { from: 'STUDENT-PORTAL', to: 'AUTH-LDAP' },
  { from: 'WEB-PORTAL', to: 'CORE-ROUTER' },
  { from: 'WEB-PORTAL', to: 'DNS-DHCP' },
  { from: 'APP-LMS', to: 'LAB-VDI' },
];

export const AdminTopology: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<ServiceNode | null>(CAMPUS_SERVICES[2]); // Default AUTH-LDAP

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'T0':
        return 'border-rose-500 bg-rose-950/40 text-rose-300';
      case 'T1':
        return 'border-indigo-500 bg-indigo-950/40 text-indigo-300';
      case 'T2':
        return 'border-cyan-500 bg-cyan-950/40 text-cyan-300';
      default:
        return 'border-slate-600 bg-slate-900 text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Topology Header & Cycle Check Badge */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <GitBranch className="w-4 h-4" />
            <span>Interactive Campus Service DAG</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white">
            19 Campus Services & 26 Dependency Edges
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Used by B2 Leaf-Safe RCA and A1 Cascade duplicate detection for root-cause ranking.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Acyclic DAG Verified (0 Cycles)</span>
          </div>
        </div>
      </div>

      {/* Main Canvas & Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Interactive SVG DAG Canvas (3 Cols) */}
        <div className="lg:col-span-3 glass-panel rounded-2xl p-4 border border-slate-800 bg-slate-950 overflow-auto">
          <div className="min-w-[880px] h-[720px] relative select-none">
            {/* Draw Dependency Edges */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="18"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#6366f1" opacity="0.6" />
                </marker>
              </defs>
              {DEPENDENCY_EDGES.map((edge, idx) => {
                const src = CAMPUS_SERVICES.find((s) => s.code === edge.from);
                const dst = CAMPUS_SERVICES.find((s) => s.code === edge.to);
                if (!src || !dst) return null;

                const isHighlight =
                  selectedNode &&
                  (selectedNode.code === edge.from || selectedNode.code === edge.to);

                return (
                  <line
                    key={idx}
                    x1={src.x + 60}
                    y1={src.y + 20}
                    x2={dst.x + 60}
                    y2={dst.y + 20}
                    stroke={isHighlight ? '#38bdf8' : '#334155'}
                    strokeWidth={isHighlight ? 2.5 : 1}
                    strokeDasharray={edge.to === 'AUTH-LDAP' ? '4 2' : undefined}
                    markerEnd="url(#arrow)"
                    className="transition-colors duration-200"
                  />
                );
              })}
            </svg>

            {/* Draw Service Nodes */}
            {CAMPUS_SERVICES.map((node) => {
              const isSelected = selectedNode?.code === node.code;
              return (
                <div
                  key={node.code}
                  onClick={() => setSelectedNode(node)}
                  style={{ left: `${node.x}px`, top: `${node.y}px` }}
                  className={`absolute w-32 p-2.5 rounded-xl border cursor-pointer transition-all ${getTierColor(
                    node.tier
                  )} ${
                    isSelected
                      ? 'ring-2 ring-cyan-400 scale-105 z-20 shadow-xl shadow-cyan-500/20'
                      : 'hover:scale-102 hover:border-slate-400 z-10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] font-bold px-1 rounded bg-black/40">
                      {node.tier}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        node.status === 'DEGRADED'
                          ? 'bg-amber-400 animate-ping'
                          : 'bg-emerald-400'
                      }`}
                    />
                  </div>
                  <div className="font-mono font-bold text-xs text-white mt-1 truncate">
                    {node.code}
                  </div>
                  <div className="text-[9px] text-slate-400 truncate mt-0.5">{node.team}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Node Inspector Panel (1 Col) */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center space-x-2">
            <Info className="w-4 h-4 text-indigo-400" />
            <span>Service Node Inspector</span>
          </h2>

          {selectedNode ? (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm text-cyan-300">
                    {selectedNode.code}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[10px] font-bold">
                    Tier {selectedNode.tier}
                  </span>
                </div>
                <div className="text-slate-200 font-semibold">{selectedNode.name}</div>
                <div className="text-[11px] text-slate-400">Team: {selectedNode.team}</div>
                <div className="pt-1 flex items-center space-x-2">
                  <span className="text-[11px] text-slate-400">Status:</span>
                  <span
                    className={`font-semibold text-[11px] ${
                      selectedNode.status === 'DEGRADED' ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    {selectedNode.status}
                  </span>
                </div>
              </div>

              {/* Dependencies Outgoing */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Depends On (Upstream):
                </div>
                {DEPENDENCY_EDGES.filter((e) => e.from === selectedNode.code).map((e, i) => (
                  <div key={i} className="p-2 bg-slate-900/80 rounded border border-slate-800 font-mono text-[11px] text-indigo-300">
                    → {e.to}
                  </div>
                ))}
                {DEPENDENCY_EDGES.filter((e) => e.from === selectedNode.code).length === 0 && (
                  <div className="text-slate-500 text-[11px]">No upstream dependencies (Root service).</div>
                )}
              </div>

              {/* Dependents Incoming */}
              <div className="space-y-1.5 pt-2">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Impacted Downstream Services:
                </div>
                {DEPENDENCY_EDGES.filter((e) => e.to === selectedNode.code).map((e, i) => (
                  <div key={i} className="p-2 bg-slate-900/80 rounded border border-slate-800 font-mono text-[11px] text-cyan-300">
                    ← {e.from}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-slate-500 text-xs py-8 text-center">
              Click any node in the canvas to inspect dependencies.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
