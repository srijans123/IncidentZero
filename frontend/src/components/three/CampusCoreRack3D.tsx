import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';
import { Layers, Server, Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ActionButton } from '../ui/ActionButton';

export interface ServerBladeInfo {
  id: string;
  name: string;
  category: string;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  tickets: number;
  latencyMs: number;
}

const SEEDED_BLADES: ServerBladeInfo[] = [
  { id: 'APP-LMS', name: 'Nalanda Moodle LMS', category: 'Academic Apps', status: 'CRITICAL', tickets: 14, latencyMs: 382 },
  { id: 'AUTH-LDAP', name: 'Campus SSO & LDAP', category: 'Identity Core', status: 'CRITICAL', tickets: 26, latencyMs: 910 },
  { id: 'DB-PRIMARY', name: 'PostgreSQL Serverless', category: 'Data Tier-0', status: 'HEALTHY', tickets: 0, latencyMs: 14 },
  { id: 'SVC-ERP', name: 'Campus ERP & Finance', category: 'Core Business', status: 'WARNING', tickets: 8, latencyMs: 145 },
  { id: 'NET-CORE', name: 'NOC Edge Gateway', category: 'Network T0', status: 'HEALTHY', tickets: 1, latencyMs: 3 },
];

interface BladeMeshProps {
  blade: ServerBladeInfo;
  index: number;
  total: number;
  isExploded: boolean;
  isSelected: boolean;
  onSelect: (blade: ServerBladeInfo) => void;
}

const BladeMesh: React.FC<BladeMeshProps> = ({
  blade,
  index,
  total,
  isExploded,
  isSelected,
  onSelect,
}) => {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Z-offset for explosion effect
  const targetZ = isExploded ? (index - total / 2) * 1.4 : 0;
  const targetY = (total / 2 - index) * 0.75;

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.position.z = THREE.MathUtils.damp(meshRef.current.position.z, targetZ, 4, delta);
    meshRef.current.position.y = THREE.MathUtils.damp(meshRef.current.position.y, targetY, 4, delta);
  });

  const statusColor = useMemo(() => {
    if (blade.status === 'CRITICAL') return '#F43F5E';
    if (blade.status === 'WARNING') return '#F59E0B';
    return '#10B981';
  }, [blade.status]);

  return (
    <group
      ref={meshRef}
      position={[0, targetY, targetZ]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(blade);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      {/* Blade Chassis */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[3.2, 0.58, 2.2]} />
        <meshPhysicalMaterial
          color={isSelected ? '#1E293B' : hovered ? '#1A202C' : '#11151D'}
          metalness={0.85}
          roughness={0.25}
          clearcoat={0.3}
          clearcoatRoughness={0.1}
          emissive={isSelected ? '#38BDF8' : '#000000'}
          emissiveIntensity={isSelected ? 0.15 : 0}
        />
      </mesh>

      {/* Front Bevel Bezel */}
      <mesh position={[0, 0, 1.11]}>
        <boxGeometry args={[3.15, 0.54, 0.04]} />
        <meshStandardMaterial
          color="#161B22"
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>

      {/* Telemetry LED Bar */}
      <mesh position={[-1.2, 0, 1.14]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshBasicMaterial color={statusColor} />
      </mesh>

      {/* Fiber-Optic Conduit Ports */}
      {[-0.8, -0.4, 0, 0.4, 0.8, 1.2].map((x, i) => (
        <mesh key={i} position={[x, 0, 1.13]}>
          <boxGeometry args={[0.22, 0.16, 0.03]} />
          <meshStandardMaterial
            color="#090A0D"
            roughness={0.8}
            emissive={isSelected || hovered ? '#38BDF8' : '#10B981'}
            emissiveIntensity={isSelected || hovered ? 0.6 : 0.2}
          />
        </mesh>
      ))}

      {/* Specular Highlight Edge */}
      <mesh position={[0, 0.28, 1.12]}>
        <boxGeometry args={[3.1, 0.02, 0.02]} />
        <meshBasicMaterial color="rgba(255,255,255,0.4)" transparent opacity={0.6} />
      </mesh>
    </group>
  );
};

function RackCabinet({ isExploded }: { isExploded: boolean }) {
  return (
    <group>
      {/* 42U Outer Frame Corner Posts */}
      {[
        [-1.75, 0, -1.2],
        [1.75, 0, -1.2],
        [-1.75, 0, 1.2],
        [1.75, 0, 1.2],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <boxGeometry args={[0.12, 4.8, 0.12]} />
          <meshStandardMaterial color="#1E232E" metalness={0.9} roughness={0.3} />
        </mesh>
      ))}

      {/* Top & Bottom Solid Plates */}
      <mesh position={[0, 2.45, 0]}>
        <boxGeometry args={[3.6, 0.12, 2.5]} />
        <meshStandardMaterial color="#161A22" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, -2.45, 0]}>
        <boxGeometry args={[3.6, 0.12, 2.5]} />
        <meshStandardMaterial color="#161A22" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Smoked Acrylic Glass Door (Translucent) */}
      {!isExploded && (
        <mesh position={[0, 0, 1.28]}>
          <boxGeometry args={[3.45, 4.7, 0.04]} />
          <meshPhysicalMaterial
            color="#090A0D"
            transparent
            opacity={0.35}
            roughness={0.1}
            transmission={0.7}
            ior={1.5}
            metalness={0.1}
          />
        </mesh>
      )}
    </group>
  );
}

interface CampusCoreRack3DProps {
  selectedServiceId?: string;
  onSelectService?: (serviceId: string) => void;
  className?: string;
}

export const CampusCoreRack3D: React.FC<CampusCoreRack3DProps> = ({
  selectedServiceId,
  onSelectService,
  className = 'h-[360px]',
}) => {
  const [isExploded, setIsExploded] = useState(false);
  const [activeBlade, setActiveBlade] = useState<ServerBladeInfo | null>(
    SEEDED_BLADES.find((b) => b.id === selectedServiceId) || SEEDED_BLADES[0]
  );

  const handleSelectBlade = (blade: ServerBladeInfo) => {
    setActiveBlade(blade);
    if (onSelectService) {
      onSelectService(blade.id);
    }
  };

  return (
    <div
      className={`relative w-full rounded-lg overflow-hidden border border-white/[0.08] bg-[#090A0D] ${className}`}
    >
      {/* 3D WebGL Canvas */}
      <Canvas
        shadows
        camera={{ position: [4.2, 2.0, 5.0], fov: 42 }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[6, 8, 5]} intensity={1.5} castShadow />
        <pointLight position={[-4, 2, -2]} intensity={0.8} color="#38BDF8" />
        <pointLight position={[3, -2, 2]} intensity={0.6} color="#10B981" />

        <Float speed={1.2} rotationIntensity={0.08} floatIntensity={0.12}>
          <group position={[0, 0, 0]}>
            <RackCabinet isExploded={isExploded} />
            {SEEDED_BLADES.map((blade, idx) => (
              <BladeMesh
                key={blade.id}
                blade={blade}
                index={idx}
                total={SEEDED_BLADES.length}
                isExploded={isExploded}
                isSelected={activeBlade?.id === blade.id}
                onSelect={handleSelectBlade}
              />
            ))}
          </group>
        </Float>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.7}
        />
      </Canvas>

      {/* Top Left Telemetry Header */}
      <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#101217]/90 backdrop-blur-md border border-white/[0.08] text-xs font-mono text-slate-300">
          <Server className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span>BITS CCIT CORE 42U RACK</span>
        </span>
        <span className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-emerald-400">
          <Activity className="w-3 h-3 animate-pulse" />
          <span>60 FPS PROCEDURAL</span>
        </span>
      </div>

      {/* Top Right Explode View Controls */}
      <div className="absolute top-3 right-3 flex items-center gap-2">
        <ActionButton
          size="compact"
          variant={isExploded ? 'accent' : 'secondary'}
          icon={<Layers className="w-3.5 h-3.5" />}
          onClick={() => setIsExploded(!isExploded)}
        >
          {isExploded ? 'Compact Rack' : 'Explode View'}
        </ActionButton>
      </div>

      {/* Bottom Floating Blade HUD Inspector */}
      {activeBlade && (
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-3.5 py-2.5 rounded-md bg-[#101217]/90 backdrop-blur-md border border-white/[0.08] shadow-lg text-xs pointer-events-auto">
          <div className="flex items-center gap-3">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                activeBlade.status === 'CRITICAL'
                  ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                  : activeBlade.status === 'WARNING'
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
            />
            <div>
              <span className="font-semibold text-slate-100 mr-2">{activeBlade.id}</span>
              <span className="text-slate-400">{activeBlade.name}</span>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[11px] bg-white/[0.06] text-slate-300 font-mono">
              {activeBlade.category}
            </span>
          </div>

          <div className="flex items-center gap-4 font-mono text-[11px] tabular-nums">
            <span className="text-slate-400">
              Active Incidents:{' '}
              <strong className={activeBlade.tickets > 0 ? 'text-amber-400' : 'text-slate-200'}>
                {activeBlade.tickets}
              </strong>
            </span>
            <span className="text-slate-400">
              Latency: <strong className="text-slate-200">{activeBlade.latencyMs}ms</strong>
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                activeBlade.status === 'CRITICAL'
                  ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                  : activeBlade.status === 'WARNING'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {activeBlade.status}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
