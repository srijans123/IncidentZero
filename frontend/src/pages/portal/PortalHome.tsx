import React, { useEffect, useState } from 'react';
import { Incident } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSse } from '../../context/SseContext';
import {
  PlusCircle,
  Search,
  Filter,
  Clock,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Server,
  Layers,
} from 'lucide-react';
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
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
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
      return matchesSearch && ['RESOLVED', 'VERIFIED'].includes(inc.state);
    return matchesSearch && inc.state === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Welcome & Mission Header */}
      <div className="surface-panel p-6 bg-[#101217] border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#38BDF8] text-xs font-mono font-medium tracking-wider uppercase mb-1">
              <Server className="w-3.5 h-3.5" />
              <span>Campus IT Telemetry & Incident Portal</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#F3F4F6]">
              Operational Console — {currentUser.name}
            </h1>
            <p className="text-xs text-[#9BA1AE] mt-1 max-w-xl">
              Report connectivity, ERP, or LMS issues. Monitor real-time resolution SLAs and inspect active 3D server hardware telemetry.
            </p>
          </div>
          <ActionButton
            size="cta"
            variant="primary"
            icon={<PlusCircle className="w-4 h-4" />}
            onClick={onOpenReport}
          >
            Report New Incident
          </ActionButton>
        </div>
      </div>

      {/* 3D Hardware Telemetry Core Banner */}
      <CampusCoreRack3D
        selectedServiceId={selectedService}
        onSelectService={(svcId) => setSelectedService(svcId)}
        className="h-[340px]"
      />

      {/* Control Bar: Search & Status Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-[#8E95A5] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ID, title, or service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-8 pl-8 pr-3 text-xs rounded bg-[#101217] border border-white/[0.08] text-[#F3F4F6] placeholder-[#8E95A5] focus:outline-none focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'OPEN', 'RESOLVED'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setStatusFilter(filter)}
              className={`h-7 px-3 rounded text-xs font-medium whitespace-nowrap transition-colors cursor-pointer border ${
                statusFilter === filter
                  ? 'bg-[#1D212A] text-[#F3F4F6] border-white/[0.16] shadow-sm'
                  : 'bg-transparent text-[#9BA1AE] border-transparent hover:border-white/[0.08] hover:text-[#F3F4F6]'
              }`}
            >
              {filter === 'ALL' ? 'All Incidents' : filter === 'OPEN' ? 'Active / In-Flight' : 'Resolved'}
            </button>
          ))}
          <ActionButton
            size="compact"
            variant="outline"
            icon={<RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />}
            onClick={fetchIncidents}
          >
            Refresh
          </ActionButton>
        </div>
      </div>

      {/* Incidents Telemetry Grid */}
      <div className="surface-panel overflow-hidden border border-white/[0.08]">
        {loading && incidents.length === 0 ? (
          <div className="p-12 text-center text-[#9BA1AE] text-xs">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#38BDF8]" />
            <span>Synchronizing live campus incidents...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-[#9BA1AE] text-xs">
            <p className="font-medium text-slate-300 mb-1">No incidents found</p>
            <p className="text-xs text-[#8E95A5]">
              {searchTerm ? 'Try adjusting your search criteria.' : 'No reported incidents in this queue.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/[0.08] bg-[#161920]/40 text-[#8E95A5] font-mono uppercase text-[11px] tracking-wider">
                  <th className="py-2.5 px-4 font-medium">Incident Code</th>
                  <th className="py-2.5 px-4 font-medium">Subject / Title</th>
                  <th className="py-2.5 px-3 font-medium">Service</th>
                  <th className="py-2.5 px-3 font-medium">Priority</th>
                  <th className="py-2.5 px-3 font-medium">State</th>
                  <th className="py-2.5 px-3 font-medium">SLA Resolution</th>
                  <th className="py-2.5 px-4 font-medium text-right">Audit Block</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.map((inc) => (
                  <tr
                    key={inc.id}
                    onClick={() => onSelectIncident(inc.id)}
                    className="hover:bg-[#1D212A]/60 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4 font-mono font-medium text-[#F3F4F6] whitespace-nowrap">
                      <span className="group-hover:text-[#38BDF8] transition-colors">{inc.number}</span>
                    </td>
                    <td className="py-3 px-4 text-[#F3F4F6] max-w-xs md:max-w-md truncate font-medium">
                      {inc.title}
                    </td>
                    <td className="py-3 px-3 text-[#9BA1AE] whitespace-nowrap font-mono text-[11px]">
                      {inc.serviceCode || 'SVC-GENERAL'}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <StatusBadge label={inc.priority || 'P3'} isMono />
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5">
                        <StatusDot state={inc.state} />
                        <span className="text-[#9BA1AE] font-medium text-[11px]">{inc.state}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums text-[11px] text-[#9BA1AE] whitespace-nowrap">
                      {inc.resolutionDueAt ? (
                        <span>
                          {new Date(inc.resolutionDueAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      ) : (
                        <span className="text-[#8E95A5]">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <HashPill hash={inc.id} truncateLength={6} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
