import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import { ActionButton } from '../../components/ui/ActionButton';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { StatusDot } from '../../components/ui/StatusDot';
import { TopologyBlastRadius3D, ServiceNode3D, DependencyEdge3D } from '../../components/three/TopologyBlastRadius3D';
import { sound } from '../../services/sound';

interface ServiceNode {
  id: string;
  code: string;
  name: string;
  tier: 'T0' | 'T1' | 'T2' | 'T3';
  status: 'HEALTHY' | 'DEGRADED' | 'OUTAGE';
  team: string;
  openIncidents?: number;
  x?: number;
  y?: number;
}

interface ServiceEdge {
  from: string;
  to: string;
  type?: string;
}

const DEFAULT_SERVICES: ServiceNode[] = [
  { id: '1', code: 'NET-CORE', name: 'Campus Core Fiber & Backbone Switch', tier: 'T0', status: 'HEALTHY', team: 'NOC Network' },
  { id: '2', code: 'AUTH-LDAP', name: 'Central LDAP & Campus SSO', tier: 'T0', status: 'HEALTHY', team: 'Identity & Sec' },
  { id: '3', code: 'DB-PRIMARY', name: 'Primary PostgreSQL/Oracle DB Cluster', tier: 'T0', status: 'HEALTHY', team: 'Database Team' },
  { id: '4', code: 'NET-DNS', name: 'Campus DNS & DHCP Cluster', tier: 'T0', status: 'HEALTHY', team: 'NOC Network' },
  { id: '5', code: 'FAC-HVAC', name: 'Data Center Power & Cooling', tier: 'T1', status: 'HEALTHY', team: 'Estate Facilities' },
  { id: '6', code: 'APP-ERP', name: 'Student ERP & Course Registration Portal', tier: 'T1', status: 'HEALTHY', team: 'ERP Team' },
  { id: '7', code: 'APP-LMS', name: 'Moodle LMS', tier: 'T1', status: 'HEALTHY', team: 'Academic IT' },
  { id: '8', code: 'APP-MAIL', name: 'Campus Email & Google Workspace Bridge', tier: 'T1', status: 'HEALTHY', team: 'Identity & Sec' },
  { id: '9', code: 'NET-WIFI-HOSTEL', name: 'Hostel Bhawan Aruba Wi-Fi Controllers', tier: 'T1', status: 'HEALTHY', team: 'NOC Network' },
  { id: '10', code: 'NET-LAN-ACAD', name: 'Academic Block Wired LAN & Wi-Fi', tier: 'T1', status: 'HEALTHY', team: 'NOC Network' },
  { id: '11', code: 'APP-MESS-PAY', name: 'SWD Mess & Fee Payment Gateway', tier: 'T1', status: 'HEALTHY', team: 'ERP Team' },
  { id: '12', code: 'APP-LIB', name: 'Digital Library EZProxy & Journals', tier: 'T2', status: 'HEALTHY', team: 'ERP Team' },
  { id: '13', code: 'APP-SWD', name: 'Student Welfare Division (SWD) Intranet', tier: 'T2', status: 'HEALTHY', team: 'ERP Team' },
  { id: '14', code: 'APP-MESS-BIO', name: 'Biometric Mess Attendance Terminals', tier: 'T2', status: 'HEALTHY', team: 'Estate Facilities' },
  { id: '15', code: 'FAC-CCTV', name: 'Campus IP CCTV Surveillance Grid', tier: 'T2', status: 'HEALTHY', team: 'Estate Facilities' },
  { id: '16', code: 'NET-VPN', name: 'Remote Access Campus VPN', tier: 'T2', status: 'HEALTHY', team: 'NOC Network' },
  { id: '17', code: 'HW-AV', name: 'Smart Classroom AV & LTC Projectors', tier: 'T3', status: 'HEALTHY', team: 'Estate Facilities' },
  { id: '18', code: 'HW-LAB', name: 'IPC Computing Lab Workstations', tier: 'T3', status: 'HEALTHY', team: 'Estate Facilities' },
  { id: '19', code: 'HW-PRINT', name: 'Department Network Printers & Scanners', tier: 'T3', status: 'HEALTHY', team: 'Estate Facilities' },
];

export const AdminTopology: React.FC = () => {
  const [viewMode, setViewMode] = useState<'3D' | '2D'>('3D');
  const [rawNodes, setRawNodes] = useState<ServiceNode[]>(DEFAULT_SERVICES);
  const [edges, setEdges] = useState<ServiceEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<ServiceNode | null>(null);

  useEffect(() => {
    let active = true;
    const fetchTopology = async () => {
      try {
        const data = await api.services.getTopology();
        if (active && data) {
          if (Array.isArray(data.nodes) && data.nodes.length > 0) {
            setRawNodes(data.nodes as ServiceNode[]);
          }
          if (Array.isArray(data.edges) && data.edges.length > 0) {
            setEdges(data.edges as ServiceEdge[]);
          }
        }
      } catch (err) {
        console.error('Failed to load topology from backend, using defaults', err);
      }
    };
    fetchTopology();
    return () => {
      active = false;
    };
  }, []);

  // Compute 2D coordinates arranged cleanly by tiers
  const positionedNodes = useMemo(() => {
    const tierOrder: ('T0' | 'T1' | 'T2' | 'T3')[] = ['T0', 'T1', 'T2', 'T3'];
    const tierYMap: Record<string, number> = { T0: 50, T1: 180, T2: 320, T3: 460 };

    const grouped: Record<string, ServiceNode[]> = { T0: [], T1: [], T2: [], T3: [] };
    rawNodes.forEach((node) => {
      const t = node.tier || 'T3';
      if (!grouped[t]) grouped[t] = [];
      grouped[t].push(node);
    });

    const result: ServiceNode[] = [];
    tierOrder.forEach((tier) => {
      const list = grouped[tier];
      const y = tierYMap[tier] || 50;
      list.forEach((node, idx) => {
        const x = 40 + idx * 210;
        result.push({ ...node, x, y });
      });
    });
    return result;
  }, [rawNodes]);

  useEffect(() => {
    if (!selectedNode && positionedNodes.length > 0) {
      const authLdap = positionedNodes.find((n) => n.code === 'AUTH-LDAP') || positionedNodes[0];
      setSelectedNode(authLdap);
    }
  }, [positionedNodes, selectedNode]);

  // Transform nodes for 3D component
  const nodes3D: ServiceNode3D[] = useMemo(() => {
    return rawNodes.map((n) => ({
      id: n.code,
      name: n.name,
      tier: n.tier,
      status: n.status,
      isRcaRoot: n.code === 'AUTH-LDAP' && n.status === 'OUTAGE',
      isImpacted: n.status === 'DEGRADED' || n.status === 'OUTAGE',
      activeTickets: n.openIncidents || (n.status === 'OUTAGE' ? 26 : n.status === 'DEGRADED' ? 6 : 0),
    }));
  }, [rawNodes]);

  const edges3D: DependencyEdge3D[] = useMemo(() => {
    return edges.map((e) => ({
      source: e.from,
      target: e.to,
      kind: e.type === 'SOFT' ? 'SOFT' : 'HARD',
    }));
  }, [edges]);

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
              {rawNodes.length} campus services • {edges.length} directed dependency edges • Leaf-Safe Cycle Detection
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
              isStormActive={rawNodes.some((n) => n.status === 'OUTAGE')}
              nodes={nodes3D}
              edges={edges3D}
              onSelectService={(svcCode) => {
                const found = positionedNodes.find((s) => s.code === svcCode);
                if (found) setSelectedNode(found);
              }}
            />
          ) : (
            <div className="p-4 overflow-x-auto min-h-[580px]">
              <div className="min-w-[1550px] h-[600px] relative bg-[#130E26] border-2 border-dashed border-[var(--card)]/40 p-4">
                <svg className="w-full h-full absolute inset-0 pointer-events-none">
                  <defs>
                    <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#59C9F5" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#7C5CFF" stopOpacity="0.3" />
                    </linearGradient>
                  </defs>
                  {edges.map((edge, idx) => {
                    const s = positionedNodes.find((n) => n.code === edge.from);
                    const t = positionedNodes.find((n) => n.code === edge.to);
                    if (!s || !t || s.x === undefined || s.y === undefined || t.x === undefined || t.y === undefined) return null;
                    return (
                      <line
                        key={idx}
                        x1={s.x + 85}
                        y1={s.y + 25}
                        x2={t.x + 85}
                        y2={t.y + 25}
                        stroke="url(#edgeGrad)"
                        strokeWidth="2.5"
                        strokeDasharray={edge.type === 'SOFT' ? '5,5' : undefined}
                      />
                    );
                  })}
                </svg>

                {positionedNodes.map((node) => {
                  const isSelected = selectedNode?.id === node.id || selectedNode?.code === node.code;
                  const isRca = node.code === 'AUTH-LDAP' && node.status === 'OUTAGE';
                  return (
                    <div
                      key={node.id || node.code}
                      onClick={() => {
                        sound.blip();
                        setSelectedNode(node);
                      }}
                      style={{ left: node.x, top: node.y }}
                      className={`absolute w-44 p-2 border-[3px] transition-all cursor-pointer font-pixel ${
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
              {selectedNode.code === 'AUTH-LDAP' && selectedNode.status === 'OUTAGE' && (
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
              Downstream: <strong className="text-[var(--sky)]">{edges.filter((e) => e.to === selectedNode.code).length} Services</strong>
            </div>
            <div className="px-3 py-1.5 border-[2px] border-[var(--line)] bg-[var(--bg)] shadow-[2px_2px_0_var(--shadow-col)] text-[var(--fg)]">
              Upstream: <strong className="text-[var(--red)]">{edges.filter((e) => e.from === selectedNode.code).length} Direct</strong>
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
