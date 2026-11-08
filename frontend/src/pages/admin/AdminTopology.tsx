import React, { useState } from 'react';
import { GitBranch, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, Layers, Cpu, Eye, Network } from 'lucide-react';
import { ActionButton } from '../../components/ui/ActionButton';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { StatusDot } from '../../components/ui/StatusDot';
import { TopologyBlastRadius3D } from '../../components/three/TopologyBlastRadius3D';
import { sound } from '../../services/sound';

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
  { id: '6', code: 'APP-LMS', name: 'Campus Moodle Academic LMS', tier: 'T1', status: 'OUTAGE', team: 'Academic IT', x: 420, y: 220 },
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
      {/* Top Header Card */}
      <div className="bg-[var(--card)] border-[3px] border-[var(--line)] p-5 shadow-[5px_5px_0_var(--shadow-col)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[var(--sky)] text-xs font-mono font-bold uppercase tracking-wider mb-1">
              <span className="w-2.5 h-2.5 bg-[var(--sky)] border border-[var(--line)] inline-block"></span>
              <span>DAG OVERWORLD // B2 ENGINE</span>
            </div>
            <h1 className="text-2xl font-bold font-pixel tracking-wide text-[var(--fg)]">
              Campus Service Topology & Blast Radius
            </h1>
            <p className="text-xs font-pixel text-[var(--soft)] mt-1">
              {CAMPUS_SERVICES.length} campus services • {DEPENDENCY_EDGES.length} directed dependency edges • Leaf-Safe Cycle Detection
            </p>
          </div>

          {/* Segmented 3D / 2D Switcher */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                sound.pick();
                setViewMode('3D');
              }}
              className={`btn ${viewMode === '3D' ? 'y' : 'w'}`}
            >
              3D ORBITAL CORE
            </button>
            <button
              type="button"
              onClick={() => {
                sound.pick();
                setViewMode('2D');
              }}
              className={`btn ${viewMode === '2D' ? 'y' : 'w'}`}
            >
              2D SCHEMATIC DAG
            </button>
          </div>
        </div>
      </div>

      {/* Main Visualization Canvas inside CRT frame */}
      <div className="bg-[var(--line)] p-2 shadow-[7px_7px_0_var(--shadow-col)] border-[3px] border-[var(--line)]">
        {/* CRT Scanline Bezel */}
        <div className="flex items-center justify-between px-3 py-1 bg-[var(--line)] text-[var(--card)] font-silkscreen text-[11px]">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--ribbon)] animate-ping"></span>
            CRT MONITOR // PHOSPHOR DAG RASTER
          </span>
          <span className="font-mono text-[var(--card)]">1080p • 60 FPS • BITS PILANI</span>
        </div>

        <div className="relative bg-[#090A0D] border-2 border-[var(--card)] overflow-hidden">
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
            <div className="p-4 overflow-x-auto min-h-[520px]">
              <div className="min-w-[1020px] h-[500px] relative bg-[#130E26] border-2 border-dashed border-[var(--card)]/40 p-4">
                <svg className="w-full h-full absolute inset-0 pointer-events-none">
                  <defs>
                    <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#59C9F5" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#7C5CFF" stopOpacity="0.3" />
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
                        strokeWidth="3"
                        strokeDasharray={edge.to === 'CORE-ROUTER' ? '6,6' : undefined}
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
                      onClick={() => {
                        sound.blip();
                        setSelectedNode(node);
                      }}
                      style={{ left: node.x, top: node.y }}
                      className={`absolute w-44 p-2.5 border-[3px] transition-all cursor-pointer font-pixel ${
                        isSelected
                          ? 'bg-[var(--bg)] border-[var(--sky)] shadow-[4px_4px_0_var(--shadow-col)] scale-105 z-20'
                          : isRca
                          ? 'bg-[#3A1420] border-[var(--red)] shadow-[0_0_15px_rgba(255,77,61,0.6)] animate-pulse text-white'
                          : 'bg-[var(--card)] border-[var(--line)] shadow-[3px_3px_0_var(--shadow-col)] hover:scale-102 text-[var(--fg)]'
                      }`}
                    >
                      <div className="flex items-center justify-between font-mono text-[10px] mb-1">
                        <span className="font-bold uppercase tracking-wider">{node.tier}</span>
                        <StatusDot state={node.status} />
                      </div>
                      <div className="font-bold text-xs truncate tracking-wide">{node.code}</div>
                      <div className="text-[10px] opacity-80 truncate">{node.name}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selected Service Detail Drawer */}
      {selectedNode && (
        <div className="bg-[var(--card)] border-[3px] border-[var(--line)] p-5 shadow-[5px_5px_0_var(--shadow-col)] flex flex-col md:flex-row md:items-center justify-between gap-4 font-pixel text-xs">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-mono font-bold text-base text-[var(--fg)]">{selectedNode.code}</span>
              <span className="chip text-[11px] font-bold">{selectedNode.tier}</span>
              <StatusBadge label={selectedNode.status} showDot />
              {selectedNode.code === 'AUTH-LDAP' && (
                <span className="chip r text-[11px] font-bold animate-pulse">
                  ★ TOP B2 ROOT CAUSE (SCORE 1.05)
                </span>
              )}
            </div>
            <p className="text-[var(--soft)] font-pixel text-xs">
              {selectedNode.name} • Assigned Team: <strong className="text-[var(--fg)]">{selectedNode.team}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs flex-wrap">
            <div className="px-3 py-1.5 border-[2px] border-[var(--line)] bg-[var(--bg)] shadow-[2px_2px_0_var(--shadow-col)] text-[var(--fg)]">
              Downstream: <strong className="text-[var(--sky)]">{DEPENDENCY_EDGES.filter((e) => e.to === selectedNode.code).length} Services</strong>
            </div>
            <div className="px-3 py-1.5 border-[2px] border-[var(--line)] bg-[var(--bg)] shadow-[2px_2px_0_var(--shadow-col)] text-[var(--fg)]">
              Upstream: <strong className="text-[var(--red)]">{DEPENDENCY_EDGES.filter((e) => e.from === selectedNode.code).length} Direct</strong>
            </div>
            <ActionButton
              size="compact"
              variant="outline"
              onClick={() => sound.slot()}
            >
              ISOLATE NODE
            </ActionButton>
          </div>
        </div>
      )}
    </div>
  );
};
