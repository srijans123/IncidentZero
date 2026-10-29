import React, { useEffect, useState } from 'react';
import { Incident } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSse } from '../../context/SseContext';
import {
  Wrench,
  Search,
  Filter,
  Clock,
  AlertTriangle,
  Flame,
  CheckCircle,
  ExternalLink,
  RefreshCw,
  Keyboard,
  ShieldAlert,
} from 'lucide-react';
import { StatusDot } from '../../components/ui/StatusDot';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ActionButton } from '../../components/ui/ActionButton';
import { HashPill } from '../../components/ui/HashPill';

interface WorkbenchHomeProps {
  onSelectIncident: (id: string) => void;
  onOpenMajor: (id: string) => void;
}

export const WorkbenchHome: React.FC<WorkbenchHomeProps> = ({ onSelectIncident, onOpenMajor }) => {
  const { currentUser } = useAuth();
  const { lastEvent } = useSse();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeQueue, setActiveQueue] = useState<'ALL' | 'MY' | 'TRIAGE' | 'P1' | 'MAJOR'>('ALL');

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await api.incidents.list({ limit: 60 });
      setIncidents(res.items || []);
    } catch (err) {
      console.error('Failed to load workbench queue', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [currentUser]);

  useEffect(() => {
    if (lastEvent?.type?.startsWith('incident.')) {
      fetchQueue();
    }
  }, [lastEvent]);

  // Keyboard shortcut listener: 'a' to acknowledge first open, 's' to start
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea'].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) return;

      const firstOpen = incidents.find(
        (i) => !['RESOLVED', 'VERIFIED', 'CLOSED', 'CANCELLED'].includes(i.state)
      );
      if (!firstOpen) return;

      if (e.key === 'a' || e.key === 'A') {
        if (firstOpen.allowedCommands.includes('ACKNOWLEDGE')) {
          api.incidents.command(firstOpen.id, 'acknowledge').then(fetchQueue);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [incidents]);

  const filteredIncidents = incidents.filter((inc) => {
    const matchesSearch =
      inc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.serviceCode?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    switch (activeQueue) {
      case 'MY':
        return inc.assigneeId === currentUser.id;
      case 'TRIAGE':
        return ['NEW', 'CLASSIFIED'].includes(inc.state);
      case 'P1':
        return inc.priority === 'P1';
      case 'MAJOR':
        return inc.isMajor;
      case 'ALL':
      default:
        return true;
    }
  });

  return (
    <div className="space-y-6">
      {/* Top War Room Header & Live Telemetry Summary */}
      <div className="surface-panel p-6 bg-[#101217] border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#38BDF8] text-xs font-mono font-medium tracking-wider uppercase mb-1">
              <Wrench className="w-3.5 h-3.5" />
              <span>CCIT High-Density Technician Queue</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#F3F4F6]">
              War Room Dispatch — {currentUser.name}
            </h1>
            <p className="text-xs text-[#9BA1AE] mt-1">
              Active Tier: <span className="text-slate-200 font-mono">{currentUser.supportTier || 'L1 / NOC'}</span> | Capacity Points: <span className="text-[#10B981] font-mono">0.0 / 8.0</span> (Hungarian Multi-Pass Active)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#161920] border border-white/[0.08] text-[11px] font-mono text-[#9BA1AE]">
              <Keyboard className="w-3 h-3 text-[#38BDF8]" />
              <span>[A] Auto-Ack First Open</span>
            </div>
            <ActionButton
              size="standard"
              variant="outline"
              icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
              onClick={fetchQueue}
            >
              Sync Queue
            </ActionButton>
          </div>
        </div>
      </div>

      {/* Queue Tabs and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {(
            [
              { id: 'ALL', label: 'All Incidents', count: incidents.length },
              { id: 'MY', label: 'My Assigned', count: incidents.filter((i) => i.assigneeId === currentUser.id).length },
              { id: 'P1', label: 'P1 Critical', count: incidents.filter((i) => i.priority === 'P1').length },
              { id: 'MAJOR', label: 'Major Outages', count: incidents.filter((i) => i.isMajor).length },
              { id: 'TRIAGE', label: 'Unassigned Triage', count: incidents.filter((i) => ['NEW', 'CLASSIFIED'].includes(i.state)).length },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveQueue(tab.id)}
              className={`h-8 px-3 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer border flex items-center gap-1.5 ${
                activeQueue === tab.id
                  ? 'bg-[#1D212A] text-[#F3F4F6] border-white/[0.16] shadow-sm'
                  : 'bg-transparent text-[#9BA1AE] border-transparent hover:border-white/[0.08] hover:text-[#F3F4F6]'
              }`}
            >
              <span>{tab.label}</span>
              <span className="px-1.5 py-0.5 rounded text-[11px] font-mono bg-white/[0.06] text-[#9BA1AE]">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-[#8E95A5] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tickets, services, IDs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-8 pl-8 pr-3 text-xs rounded bg-[#101217] border border-white/[0.08] text-[#F3F4F6] placeholder-[#8E95A5] focus:outline-none focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8]"
          />
        </div>
      </div>

      {/* High-Density Incident Queue Table */}
      <div className="surface-panel overflow-hidden border border-white/[0.08]">
        {loading && incidents.length === 0 ? (
          <div className="p-12 text-center text-[#9BA1AE] text-xs">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#38BDF8]" />
            <span>Loading active technician dispatch queue...</span>
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div className="p-12 text-center text-[#9BA1AE] text-xs">
            <p className="font-medium text-slate-300 mb-1">Queue is empty</p>
            <p className="text-xs text-[#8E95A5]">No tickets match the selected filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/[0.08] bg-[#161920]/40 text-[#8E95A5] font-mono uppercase text-[11px] tracking-wider">
                  <th className="py-2.5 px-4 font-medium">Incident</th>
                  <th className="py-2.5 px-4 font-medium">Summary / Title</th>
                  <th className="py-2.5 px-3 font-medium">Service</th>
                  <th className="py-2.5 px-3 font-medium">Priority</th>
                  <th className="py-2.5 px-3 font-medium">State</th>
                  <th className="py-2.5 px-3 font-medium">SLA Resolution</th>
                  <th className="py-2.5 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredIncidents.map((inc) => (
                  <tr
                    key={inc.id}
                    onClick={() => onSelectIncident(inc.id)}
                    className="hover:bg-[#1D212A]/60 transition-colors cursor-pointer group"
                  >
                    <td className="py-2.5 px-4 font-mono font-medium text-[#F3F4F6] whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {inc.isMajor && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#F43F5E] shadow-[0_0_6px_rgba(244,63,94,0.8)] shrink-0" />
                        )}
                        <span className="group-hover:text-[#38BDF8] transition-colors">{inc.number}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-[#F3F4F6] max-w-sm truncate font-medium">
                      {inc.title}
                    </td>
                    <td className="py-2.5 px-3 text-[#9BA1AE] whitespace-nowrap font-mono text-[11px]">
                      {inc.serviceCode || 'SVC-GENERAL'}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <StatusBadge label={inc.priority || 'P3'} isMono />
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5">
                        <StatusDot state={inc.state} />
                        <span className="text-[#9BA1AE] font-medium text-[11px]">{inc.state}</span>
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono tabular-nums text-[11px] whitespace-nowrap">
                      {inc.slaStatus === 'BREACHED' ? (
                        <span className="text-[#F43F5E] font-semibold">BREACHED</span>
                      ) : inc.slaStatus === 'AT_RISK' ? (
                        <span className="text-[#F59E0B] font-semibold">AT RISK</span>
                      ) : (
                        <span className="text-[#10B981]">ON TRACK</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      {inc.isMajor ? (
                        <ActionButton
                          size="compact"
                          variant="crit"
                          onClick={() => onOpenMajor(inc.id)}
                        >
                          Major Commander
                        </ActionButton>
                      ) : inc.allowedCommands.includes('ACKNOWLEDGE') ? (
                        <ActionButton
                          size="compact"
                          variant="secondary"
                          onClick={async () => {
                            try {
                              await api.incidents.command(inc.id, 'acknowledge');
                            } catch (err: any) {
                              alert('Acknowledge failed: ' + (err?.message || 'Unknown error'));
                            } finally {
                              fetchQueue();
                            }
                          }}
                        >
                          Acknowledge
                        </ActionButton>
                      ) : (
                        <ActionButton
                          size="compact"
                          variant="outline"
                          onClick={() => onSelectIncident(inc.id)}
                        >
                          Inspect
                        </ActionButton>
                      )}
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
