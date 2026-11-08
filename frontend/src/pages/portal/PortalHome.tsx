import React, { useEffect, useState } from 'react';
import { Incident } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSse } from '../../context/SseContext';
import { sound } from '../../services/sound';
import { PixelIcon, SlaHearts } from '../../services/pixelSprites';
import { PlusCircle, Search, RefreshCw, Server } from 'lucide-react';
import { StatusDot } from '../../components/ui/StatusDot';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ActionButton } from '../../components/ui/ActionButton';
import { HashPill } from '../../components/ui/HashPill';
import { CampusCoreRack3D } from '../../components/three/CampusCoreRack3D';

interface PortalHomeProps {
  onSelectIncident: (id: string) => void;
  onOpenReport: () => void;
}

export const PortalHome: React.FC<PortalHomeProps> = ({ onSelectIncident, onOpenReport }) => {
  const { currentUser } = useAuth();
  const { lastEvent } = useSse();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'RESOLVED'>('ALL');
  const [selectedService, setSelectedService] = useState<string | undefined>(undefined);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const res = await api.incidents.list({ limit: 50 });
      setIncidents(res.items || []);
    } catch (err) {
      console.error('Failed to load portal incidents', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [currentUser]);

  useEffect(() => {
    if (lastEvent?.type?.startsWith('incident.')) {
      fetchIncidents();
    }
  }, [lastEvent]);

  const filtered = incidents.filter((inc) => {
    const matchesSearch =
      inc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.serviceCode?.toLowerCase().includes(searchTerm.toLowerCase());
    if (statusFilter === 'ALL') return matchesSearch;
    if (statusFilter === 'OPEN')
      return (
        matchesSearch &&
        !['RESOLVED', 'VERIFIED', 'CLOSED', 'CANCELLED'].includes(inc.state)
      );
    if (statusFilter === 'RESOLVED')
      return matchesSearch && ['RESOLVED', 'VERIFIED', 'CLOSED'].includes(inc.state);
    return matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Top Welcome & Mission Header */}
      <div className="pixel-card-offset" style={{ '--b': '#59C9F5' } as any}>
        <span className="pixel-tag-badge">
          <PixelIcon name="megaphone" scale={1.6} />
          <span>ROM 01 · STUDENT & FACULTY PORTAL</span>
        </span>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--fg)]">
              Operational Console — {currentUser.name}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--soft)] mt-1.5 max-w-xl leading-relaxed">
              Report connectivity, ERP, or LMS issues across campus. Monitor real-time resolution SLAs, heart meters, and inspect active 3D server hardware telemetry.
            </p>
          </div>
          <ActionButton
            size="cta"
            variant="primary"
            icon={<PlusCircle className="w-5 h-5" />}
            onClick={() => {
              sound.pick();
              onOpenReport();
            }}
          >
            Report New Incident
          </ActionButton>
        </div>
      </div>

      {/* 3D Hardware Telemetry Core Banner in CRT Monitor Frame */}
      <div className="crt-frame">
        <div className="flex items-center justify-between mb-2 px-1 text-xs font-mono font-bold text-[#FFF8DC]">
          <span className="flex items-center gap-1.5">
            <PixelIcon name="building" scale={1.6} />
            <span>CAMPUS CORE SERVER BLADE TELEMETRY (3D PROCEDURAL RACK)</span>
          </span>
          <span className="text-[#FFD84D]">60 FPS WEAPONIZED RENDERER</span>
        </div>
        <div className="crt-screen">
          <CampusCoreRack3D
            selectedServiceId={selectedService}
            onSelectService={(svcId) => setSelectedService(svcId)}
            className="h-[320px]"
          />
        </div>
      </div>

      {/* Control Bar: Search & Status Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#1B1530] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by ID, title, or service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-9 pr-3 text-xs font-mono font-bold bg-white text-[#1B1530] border-[3px] border-[var(--line)] shadow-[3px_3px_0_var(--shadow-col)] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'OPEN', 'RESOLVED'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => {
                sound.blip();
                setStatusFilter(filter);
              }}
              className={`btn sm ${statusFilter === filter ? 'y' : 'w'}`}
            >
              {filter === 'ALL' ? 'All Incidents' : filter === 'OPEN' ? 'Active / In-Flight' : 'Resolved'}
            </button>
          ))}
          <ActionButton
            size="compact"
            variant="outline"
            icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
            onClick={() => {
              sound.pick();
              fetchIncidents();
            }}
          >
            Sync
          </ActionButton>
        </div>
      </div>

      {/* Incidents Telemetry Table */}
      <div className="pixel-card overflow-hidden p-0 border-[3px] border-[var(--line)] shadow-[6px_6px_0_var(--shadow-col)]">
        {loading && incidents.length === 0 ? (
          <div className="p-12 text-center text-xs font-mono font-bold text-[var(--soft)] space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#FF4D3D]" />
            <p>SYNCHRONIZING LIVE BITS HYDERABAD INCIDENTS...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs font-mono text-[var(--soft)] space-y-2">
            <p className="font-bold text-base text-[var(--fg)]">ZERO MATCHING TICKETS IN QUEUE</p>
            <p>{searchTerm ? 'Try adjusting your search criteria.' : 'No active incidents reported in this zone.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b-[3px] border-[var(--line)] bg-[#FFD84D] text-[#1B1530] font-mono uppercase text-[11px] font-bold">
                  <th className="py-3 px-4">Incident Code</th>
                  <th className="py-3 px-4">Subject / Title</th>
                  <th className="py-3 px-3">Service</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">State</th>
                  <th className="py-3 px-3">SLA Hearts & Due</th>
                  <th className="py-3 px-4 text-right">Audit Block</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[var(--line)]/20 font-medium">
                {filtered.map((inc) => {
                  const hp =
                    inc.slaStatus === 'BREACHED' ? 0
                    : inc.slaStatus === 'AT_RISK' ? 1
                    : 3;
                  return (
                    <tr
                      key={inc.id}
                      onClick={() => {
                        sound.pick();
                        onSelectIncident(inc.id);
                      }}
                      className="hover:bg-[#FFD84D]/20 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-[var(--fg)] whitespace-nowrap">
                        <span className="group-hover:text-[#FF4D3D] transition-colors">{inc.number}</span>
                      </td>
                      <td className="py-3 px-4 text-[var(--fg)] max-w-xs md:max-w-md truncate font-bold">
                        {inc.title}
                      </td>
                      <td className="py-3 px-3 text-[var(--soft)] whitespace-nowrap font-mono text-[11px] font-bold">
                        {inc.serviceCode || 'SVC-GENERAL'}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <StatusBadge label={inc.priority || 'P3'} isMono />
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[var(--fg)]">
                          <StatusDot state={inc.state} />
                          <span>{inc.state}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono tabular-nums text-xs whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <SlaHearts hp={hp} maxHp={3} scale={1.6} />
                          <span className={hp === 0 ? 'text-[#FF4D3D] font-bold' : 'text-[var(--soft)]'}>
                            {inc.resolutionDueAt
                              ? new Date(inc.resolutionDueAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : 'ON TIME'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <HashPill hash={inc.id} truncateLength={6} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
