import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Clock, ShieldCheck, ShieldAlert, Cpu } from 'lucide-react';

interface SlaChronometerProps {
  responseSecondsRemaining?: number;
  resolutionSecondsRemaining?: number;
  isPaused?: boolean;
  isBreached?: boolean;
  clockScale?: number;
}

function ChronometerMesh({
  responseSecondsRemaining = 300,
  resolutionSecondsRemaining = 1800,
  isPaused = false,
  isBreached = false,
  clockScale = 1,
}: SlaChronometerProps) {
  const outerRotorRef = useRef<THREE.Group>(null);
  const innerRotorRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!isPaused) {
      if (outerRotorRef.current) {
        outerRotorRef.current.rotation.z -= delta * 0.4 * clockScale;
      }
      if (innerRotorRef.current) {
        innerRotorRef.current.rotation.z -= delta * 0.9 * clockScale;
      }
    }
  });

  const resColor = isBreached ? '#F43F5E' : isPaused ? '#F59E0B' : '#38BDF8';
  const respColor = isBreached ? '#F43F5E' : '#10B981';

  return (
    <group position={[0, 0, 0]}>
      {/* Outer Dial Ring (Resolution Clock) */}
      <mesh>
        <ringGeometry args={[2.2, 2.45, 64]} />
        <meshStandardMaterial
          color="#0F172A"
          emissive={resColor}
          emissiveIntensity={0.6}
          roughness={0.2}
          metalness={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Outer Rotor Needle */}
      <group ref={outerRotorRef}>
        <mesh position={[0, 1.15, 0.05]}>
          <boxGeometry args={[0.04, 2.3, 0.04]} />
          <meshBasicMaterial color={resColor} />
        </mesh>
      </group>

      {/* Inner Dial Ring (Response Clock) */}
      <mesh>
        <ringGeometry args={[1.3, 1.5, 64]} />
        <meshStandardMaterial
          color="#0F172A"
          emissive={respColor}
          emissiveIntensity={0.8}
          roughness={0.2}
          metalness={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Inner Rotor Needle */}
      <group ref={innerRotorRef}>
        <mesh position={[0, 0.7, 0.08]}>
          <boxGeometry args={[0.03, 1.4, 0.04]} />
          <meshBasicMaterial color={respColor} />
        </mesh>
      </group>

      {/* Center Bezel Axis */}
      <mesh position={[0, 0, 0.1]}>
        <cylinderGeometry args={[0.22, 0.22, 0.15, 32]} />
        <meshStandardMaterial color="#1E293B" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Stasis Indicator Ring when Paused */}
      {isPaused && (
        <mesh position={[0, 0, 0.12]}>
          <ringGeometry args={[1.55, 1.62, 32]} />
          <meshBasicMaterial color="#F59E0B" />
        </mesh>
      )}

      {/* Center Digital Readout Label */}
      <Text
        position={[0, -0.02, 0.22]}
        fontSize={0.22}
        color={isBreached ? '#FDA4AF' : isPaused ? '#FCD34D' : '#F3F4F6'}
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_al061wqUwwwdpx.woff"
      >
        {isPaused
          ? 'PAUSED'
          : `${Math.floor(resolutionSecondsRemaining / 60)}:${(resolutionSecondsRemaining % 60)
              .toString()
              .padStart(2, '0')}`}
      </Text>
    </group>
  );
}

interface AuditRecord3D {
  chainIndex: number;
  rowId: number;
  action: string;
  hash: string;
  isTampered?: boolean;
}

const SAMPLE_LEDGER: AuditRecord3D[] = [
  { chainIndex: 0, rowId: 501, action: 'INCIDENT_INTAKE', hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' },
  { chainIndex: 1, rowId: 502, action: 'ASSIGNED', hash: '87298351d387ec42a8b9f71c42f042e92c2a3928192348572194857219842719' },
  { chainIndex: 2, rowId: 503, action: 'ACKNOWLEDGED', hash: '9482710385729184712039847120938471209384710293847102938471029384' },
  { chainIndex: 3, rowId: 504, action: 'REQUEST_INFO', hash: '1029384710293847102938471029384710293847102938471029384710293847' },
  { chainIndex: 4, rowId: 505, action: 'RESOLVED', hash: '4958201948572019485720194857201948572019485720194857201948572019' },
];

function LedgerSpineMesh({ isTampered = false, tamperedRow = 2 }: { isTampered?: boolean; tamperedRow?: number }) {
  return (
    <group position={[0, 0, 0]}>
      {SAMPLE_LEDGER.map((record, idx) => {
        const y = (SAMPLE_LEDGER.length / 2 - idx) * 0.95;
        const tamperedThis = isTampered && idx === tamperedRow;
        const xOffset = tamperedThis ? 0.45 : 0;
        const color = tamperedThis ? '#F43F5E' : '#10B981';

        return (
          <group key={idx} position={[xOffset, y, 0]}>
            {/* 3D Cryptographic Block */}
            <mesh castShadow>
              <boxGeometry args={[3.2, 0.65, 0.4]} />
              <meshPhysicalMaterial
                color={tamperedThis ? '#2D1217' : '#0F172A'}
                emissive={color}
                emissiveIntensity={tamperedThis ? 0.8 : 0.25}
                roughness={0.2}
                metalness={0.8}
                clearcoat={0.4}
              />
            </mesh>

            {/* Glowing Interlocking Hash Beam to Next Block */}
            {idx < SAMPLE_LEDGER.length - 1 && (
              <mesh position={[0, -0.48, 0]}>
                <cylinderGeometry args={[0.04, 0.04, 0.35, 16]} />
                <meshBasicMaterial color={tamperedThis ? '#F43F5E' : '#38BDF8'} />
              </mesh>
            )}

            {/* Block Action & Index Label */}
            <Text
              position={[-0.8, 0.1, 0.22]}
              fontSize={0.16}
              color="#F3F4F6"
              anchorX="left"
              anchorY="middle"
              font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_al061wqUwwwdpx.woff"
            >
              {`#${record.chainIndex} ${record.action}`}
            </Text>

            {/* Truncated Hash Text */}
            <Text
              position={[-0.8, -0.12, 0.22]}
              fontSize={0.12}
              color={tamperedThis ? '#FDA4AF' : '#94A3B8'}
              anchorX="left"
              anchorY="middle"
              font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_al061wqUwwwdpx.woff"
            >
              {`hash: ${record.hash.substring(0, 16)}...`}
            </Text>
          </group>
        );
      })}
    </group>
  );
}

interface SlaChronometerAndLedger3DProps {
  mode?: 'chronometer' | 'ledger';
  isPaused?: boolean;
  isBreached?: boolean;
  clockScale?: number;
  isTampered?: boolean;
  className?: string;
}

export const SlaChronometerAndLedger3D: React.FC<SlaChronometerAndLedger3DProps> = ({
  mode = 'chronometer',
  isPaused = false,
  isBreached = false,
  clockScale = 1,
  isTampered = false,
  className = 'h-[320px]',
}) => {
  return (
    <div className={`relative w-full rounded-lg overflow-hidden border border-white/[0.08] bg-[#090A0D] ${className}`}>
      <Canvas
        camera={{ position: [0, 0, mode === 'chronometer' ? 5.2 : 6.0], fov: 42 }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[4, 5, 6]} intensity={1.5} />
        <pointLight position={[-3, 2, 3]} intensity={0.8} color="#38BDF8" />

        <Float speed={1.0} rotationIntensity={0.05} floatIntensity={0.08}>
          {mode === 'chronometer' ? (
            <ChronometerMesh
              isPaused={isPaused}
              isBreached={isBreached}
              clockScale={clockScale}
            />
          ) : (
            <LedgerSpineMesh isTampered={isTampered} tamperedRow={2} />
          )}
        </Float>

        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>

      {/* Top Header Label */}
      <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#101217]/90 backdrop-blur-md border border-white/[0.08] text-xs font-mono text-slate-300">
          {mode === 'chronometer' ? (
            <>
              <Clock className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>COAXIAL SLA CHRONOMETER (DUAL-RING)</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
              <span>SHA-256 CRYPTOGRAPHIC LEDGER SPINE</span>
            </>
          )}
        </span>
        {isTampered && (
          <span className="flex items-center gap-1 px-2 py-1 rounded bg-rose-500/15 border border-rose-500/30 text-[11px] font-mono text-rose-400 animate-pulse">
            <ShieldAlert className="w-3 h-3" />
            <span>TAMPER DETECTED: ROW 503 FRACTURED</span>
          </span>
        )}
      </div>
    </div>
  );
};
