import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Network, ShieldAlert, Cpu, Radio, Sparkles } from 'lucide-react';
import { ActionButton } from '../ui/ActionButton';

export interface ServiceNode3D {
  id: string;
  name: string;
  tier: 'T0' | 'T1' | 'T2' | 'T3';
  isRcaRoot?: boolean;
  isImpacted?: boolean;
  status: 'HEALTHY' | 'DEGRADED' | 'OUTAGE';
  activeTickets: number;
}

export interface DependencyEdge3D {
  source: string;
  target: string;
  kind: 'HARD' | 'SOFT';
}

// 19 Seeded BITS Campus Services
const SEEDED_NODES: ServiceNode3D[] = [
  { id: 'NET-CORE', name: 'Campus Core Gateway', tier: 'T0', status: 'HEALTHY', activeTickets: 0 },
  { id: 'AUTH-LDAP', name: 'Active Directory / LDAP SSO', tier: 'T0', isRcaRoot: true, isImpacted: true, status: 'OUTAGE', activeTickets: 26 },
  { id: 'DB-PRIMARY', name: 'PostgreSQL Serverless Core', tier: 'T0', status: 'HEALTHY', activeTickets: 0 },
  { id: 'NET-DNS', name: 'Internal BITS DNS', tier: 'T0', status: 'HEALTHY', activeTickets: 0 },

  { id: 'APP-ERP', name: 'ERP Student Records', tier: 'T1', isImpacted: true, status: 'DEGRADED', activeTickets: 12 },
  { id: 'APP-LMS', name: 'Nalanda Moodle LMS', tier: 'T1', isImpacted: true, status: 'OUTAGE', activeTickets: 14 },
  { id: 'APP-PORTAL', name: 'Student Academic Portal', tier: 'T1', isImpacted: true, status: 'DEGRADED', activeTickets: 9 },
  { id: 'NET-WIFI-HOSTEL', name: 'Hostel WiFi Mesh', tier: 'T1', status: 'HEALTHY', activeTickets: 2 },
  { id: 'APP-PAYMENT', name: 'Fee & Payment Gateway', tier: 'T1', isImpacted: true, status: 'DEGRADED', activeTickets: 5 },

  { id: 'APP-LIB', name: 'Library Koha System', tier: 'T2', isImpacted: true, status: 'DEGRADED', activeTickets: 4 },
  { id: 'NET-LABS', name: 'CS/EEE Computer Labs', tier: 'T2', status: 'HEALTHY', activeTickets: 1 },
  { id: 'SVC-CAFETERIA', name: 'Mess POS Terminals', tier: 'T2', isImpacted: true, status: 'DEGRADED', activeTickets: 7 },
  { id: 'SVC-HEALTH', name: 'Medical Center Portal', tier: 'T2', status: 'HEALTHY', activeTickets: 0 },
  { id: 'SVC-HOSTEL-ALLOT', name: 'Hostel Allotment System', tier: 'T2', status: 'HEALTHY', activeTickets: 1 },

  { id: 'EXT-MAIL', name: 'Campus Google Suite', tier: 'T3', status: 'HEALTHY', activeTickets: 0 },
  { id: 'EXT-ZOOM', name: 'Virtual Classrooms', tier: 'T3', status: 'HEALTHY', activeTickets: 0 },
  { id: 'SVC-BIOMETRIC', name: 'Gate Entry Attendance', tier: 'T3', isImpacted: true, status: 'DEGRADED', activeTickets: 3 },
  { id: 'SVC-PRINTERS', name: 'Central Reprographics', tier: 'T3', status: 'HEALTHY', activeTickets: 1 },
  { id: 'APP-ALUMNI', name: 'Alumni Network Portal', tier: 'T3', status: 'HEALTHY', activeTickets: 0 },
];

const SEEDED_EDGES: DependencyEdge3D[] = [
  { source: 'AUTH-LDAP', target: 'APP-ERP', kind: 'HARD' },
  { source: 'AUTH-LDAP', target: 'APP-LMS', kind: 'HARD' },
  { source: 'AUTH-LDAP', target: 'APP-PORTAL', kind: 'HARD' },
  { source: 'AUTH-LDAP', target: 'APP-LIB', kind: 'HARD' },
  { source: 'AUTH-LDAP', target: 'SVC-CAFETERIA', kind: 'HARD' },
  { source: 'AUTH-LDAP', target: 'SVC-BIOMETRIC', kind: 'HARD' },
  { source: 'DB-PRIMARY', target: 'APP-ERP', kind: 'HARD' },
  { source: 'DB-PRIMARY', target: 'APP-LMS', kind: 'HARD' },
  { source: 'DB-PRIMARY', target: 'APP-PAYMENT', kind: 'HARD' },
  { source: 'NET-CORE', target: 'NET-DNS', kind: 'HARD' },
  { source: 'NET-CORE', target: 'NET-WIFI-HOSTEL', kind: 'HARD' },
  { source: 'NET-CORE', target: 'NET-LABS', kind: 'HARD' },
  { source: 'NET-DNS', target: 'APP-PORTAL', kind: 'SOFT' },
  { source: 'APP-ERP', target: 'SVC-HOSTEL-ALLOT', kind: 'HARD' },
  { source: 'APP-ERP', target: 'APP-PAYMENT', kind: 'HARD' },
];

function calculateNodePositions(nodes: ServiceNode3D[]) {
  const map: Record<string, [number, number, number]> = {};
  const tiers: Record<string, ServiceNode3D[]> = { T0: [], T1: [], T2: [], T3: [] };
  nodes.forEach((n) => tiers[n.tier]?.push(n));

  const radii = { T0: 1.8, T1: 3.6, T2: 5.4, T3: 7.0 };
  const heights = { T0: 0, T1: -0.4, T2: -0.8, T3: -1.2 };

  Object.entries(tiers).forEach(([tier, tierNodes]) => {
    const r = radii[tier as keyof typeof radii];
    const h = heights[tier as keyof typeof heights];
    const len = tierNodes.length;
    tierNodes.forEach((node, idx) => {
      const angle = (idx / len) * Math.PI * 2 + (tier === 'T1' ? 0.3 : 0);
      map[node.id] = [Math.cos(angle) * r, h, Math.sin(angle) * r];
    });
  });

  return map;
}

function FiberConduit({
  start,
  end,
  isHard,
  isCrimson,
}: {
  start: [number, number, number];
  end: [number, number, number];
  isHard: boolean;
  isCrimson: boolean;
}) {
  const curve = useMemo(() => {
    const vStart = new THREE.Vector3(...start);
    const vEnd = new THREE.Vector3(...end);
    const mid = new THREE.Vector3().addVectors(vStart, vEnd).multiplyScalar(0.5);
    mid.y += isHard ? 0.5 : 0.2;
    return new THREE.CatmullRomCurve3([vStart, mid, vEnd]);
  }, [start, end, isHard]);

  return (
    <mesh>
      <tubeGeometry args={[curve, 32, isHard ? 0.04 : 0.02, 8, false]} />
      <meshStandardMaterial
        color={isCrimson ? '#F43F5E' : isHard ? '#38BDF8' : '#64748B'}
        emissive={isCrimson ? '#F43F5E' : isHard ? '#0284C7' : '#334155'}
        emissiveIntensity={isCrimson ? 1.2 : 0.4}
        transparent
        opacity={isCrimson ? 0.9 : 0.6}
      />
    </mesh>
  );
}

function NodeOrb({
  node,
  pos,
  isSelected,
  onSelect,
}: {
  node: ServiceNode3D;
  pos: [number, number, number];
  isSelected: boolean;
  onSelect: (node: ServiceNode3D) => void;
}) {
  const meshRef = useRef<THREE.Group>(null);
  const shockwaveRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (node.isRcaRoot && shockwaveRef.current) {
      shockwaveRef.current.rotation.z += delta * 1.5;
      const s = 1.0 + Math.sin(Date.now() * 0.006) * 0.25;
      shockwaveRef.current.scale.set(s, s, s);
    }
  });

  const color = node.isRcaRoot
    ? '#F43F5E'
    : node.isImpacted
    ? '#F59E0B'
    : '#10B981';

  return (
    <group
      ref={meshRef}
      position={pos}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(node);
      }}
    >
      {/* Node Core Orb */}
      <mesh castShadow>
        <sphereGeometry args={[node.tier === 'T0' ? 0.38 : 0.26, 24, 24]} />
        <meshPhysicalMaterial
          color="#0F172A"
          emissive={color}
          emissiveIntensity={node.isRcaRoot ? 1.6 : node.isImpacted ? 0.8 : 0.3}
          roughness={0.2}
          metalness={0.8}
          clearcoat={0.6}
        />
      </mesh>

      {/* Pulsing Shockwave for RCA Root (AUTH-LDAP) */}
      {node.isRcaRoot && (
        <mesh ref={shockwaveRef} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.45, 0.65, 32]} />
          <meshBasicMaterial color="#F43F5E" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Floating 3D Text Label */}
      <Text
        position={[0, node.tier === 'T0' ? 0.55 : 0.42, 0]}
        fontSize={0.24}
        color={isSelected ? '#38BDF8' : node.isRcaRoot ? '#FDA4AF' : '#E2E8F0'}
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_al061wqUwwwdpx.woff"
      >
        {node.id}
      </Text>
    </group>
  );
}

interface TopologyBlastRadius3DProps {
  onSelectService?: (serviceId: string) => void;
  className?: string;
  isStormActive?: boolean;
}

export const TopologyBlastRadius3D: React.FC<TopologyBlastRadius3DProps> = ({
  onSelectService,
  className = 'h-[440px]',
  isStormActive = false,
}) => {
  const [selectedNode, setSelectedNode] = useState<ServiceNode3D | null>(SEEDED_NODES[1]); // AUTH-LDAP default
  const nodePositions = useMemo(() => calculateNodePositions(SEEDED_NODES), []);

  const handleSelect = (node: ServiceNode3D) => {
    setSelectedNode(node);
    if (onSelectService) {
      onSelectService(node.id);
    }
  };

  return (
    <div className={`relative w-full rounded-lg overflow-hidden border border-white/[0.08] bg-[#090A0D] ${className}`}>
      <Canvas
        camera={{ position: [0, 8.5, 9.5], fov: 45 }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 15, 10]} intensity={1.4} />
        <pointLight position={[0, 0, 0]} intensity={1.5} color="#38BDF8" />

        <Float speed={0.8} rotationIntensity={0.04} floatIntensity={0.06}>
          <group position={[0, 0, 0]}>
            {/* Concentric Orbital Decks */}
            {[1.8, 3.6, 5.4, 7.0].map((r, i) => (
              <mesh key={i} rotation={[Math.PI / 2, 0, 0]} position={[0, -0.4 * i, 0]}>
                <ringGeometry args={[r - 0.015, r + 0.015, 64]} />
                <meshBasicMaterial color="#38BDF8" transparent opacity={0.12} side={THREE.DoubleSide} />
              </mesh>
            ))}

            {/* Directed Dependency Edges */}
            {SEEDED_EDGES.map((edge, idx) => {
              const start = nodePositions[edge.source];
              const end = nodePositions[edge.target];
              if (!start || !end) return null;
              const isCrimson = edge.source === 'AUTH-LDAP';
              return (
                <FiberConduit
                  key={idx}
                  start={start}
                  end={end}
                  isHard={edge.kind === 'HARD'}
                  isCrimson={isCrimson}
                />
              );
            })}

            {/* Service Nodes */}
            {SEEDED_NODES.map((node) => {
              const pos = nodePositions[node.id];
              if (!pos) return null;
              return (
                <NodeOrb
                  key={node.id}
                  node={node}
                  pos={pos}
                  isSelected={selectedNode?.id === node.id}
                  onSelect={handleSelect}
                />
              );
            })}
          </group>
        </Float>

        <OrbitControls
          enableZoom={true}
          maxDistance={22}
          minDistance={5}
          maxPolarAngle={Math.PI / 2.1}
          minPolarAngle={Math.PI / 6}
        />
      </Canvas>

      {/* Top Left Header */}
      <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#101217]/90 backdrop-blur-md border border-white/[0.08] text-xs font-mono text-slate-300">
          <Network className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span>3D ORBITAL TOPOLOGY (19 SERVICES, 26 EDGES)</span>
        </span>
        {isStormActive && (
          <span className="flex items-center gap-1 px-2 py-1 rounded bg-rose-500/15 border border-rose-500/30 text-[11px] font-mono text-rose-400 animate-pulse">
            <ShieldAlert className="w-3 h-3" />
            <span>40-TICKET STORM BLAST RADIUS ACTIVE</span>
          </span>
        )}
      </div>

      {/* Bottom Floating Node HUD Inspector */}
      {selectedNode && (
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-3.5 py-2.5 rounded-md bg-[#101217]/90 backdrop-blur-md border border-white/[0.08] shadow-lg text-xs pointer-events-auto">
          <div className="flex items-center gap-3">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                selectedNode.isRcaRoot
                  ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                  : selectedNode.isImpacted
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
            />
            <div>
              <span className="font-semibold text-slate-100 mr-2">{selectedNode.id}</span>
              <span className="text-slate-400">{selectedNode.name}</span>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[11px] bg-white/[0.06] text-slate-300 font-mono">
              Tier: {selectedNode.tier}
            </span>
            {selectedNode.isRcaRoot && (
              <span className="px-1.5 py-0.5 rounded text-[11px] bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono font-semibold">
                ★ TOP GRAPH RCA ROOT CAUSE (Score 1.05)
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 font-mono text-[11px] tabular-nums">
            <span className="text-slate-400">
              Active Tickets:{' '}
              <strong className={selectedNode.activeTickets > 0 ? 'text-amber-400' : 'text-slate-200'}>
                {selectedNode.activeTickets}
              </strong>
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                selectedNode.status === 'OUTAGE'
                  ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                  : selectedNode.status === 'DEGRADED'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {selectedNode.status}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
