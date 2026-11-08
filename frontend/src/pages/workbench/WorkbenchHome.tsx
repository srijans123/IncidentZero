import React, { useEffect, useState } from 'react';
import { Incident } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSse } from '../../context/SseContext';
import { sound } from '../../services/sound';
import { PixelIcon, SlaHearts } from '../../services/pixelSprites';
import {
  Wrench,
  Search,
  RefreshCw,
  Keyboard,
  Flame,
} from 'lucide-react';
import { StatusDot } from '../../components/ui/StatusDot';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ActionButton } from '../../components/ui/ActionButton';

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

  // Keyboard shortcut listener: 'a' to acknowledge first open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea'].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) return;

      const firstOpen = incidents.find(
        (i) => !['RESOLVED', 'VERIFIED', 'CLOSED', 'CANCELLED'].includes(i.state)
      );
      if (!firstOpen) return;

      if (e.key === 'a' || e.key === 'A') {
        if (firstOpen.allowedCommands.includes('ACKNOWLEDGE')) {
          sound.pick();
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
    <div className="space-y-8">
      {/* Top War Room Header */}
      <div className="pixel-card-offset" style={{ '--b': '#FF4D3D' } as any}>
        <span className="pixel-tag-badge">
          <PixelIcon name="wrench" scale={1.6} />
          <span>ROM 02 · TECHNICIAN WAR ROOM DISPATCH</span>
        </span>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--fg)]">
              War Room Dispatch — {currentUser.name}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--soft)] mt-1.5 font-mono">
              Active Tier: <span className="text-[var(--fg)] font-bold">{currentUser.supportTier || 'L1 / NOC'}</span> | Hungarian Capacity: <span className="text-[#43D17A] font-bold">0.0 / 8.0 PTS</span> (Multi-Pass Engine)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-white text-[#1B1530] border-2 border-[#1B1530] text-xs font-mono font-bold shadow-[2px_2px_0_#1B1530]">
              <Keyboard className="w-3.5 h-3.5 text-[#FF4D3D]" />
              <span>[A] Quick-Ack First</span>
            </div>
            <ActionButton
              size="standard"
              variant="outline"
              icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
              onClick={() => {
                sound.pick();
                fetchQueue();
              }}
            >
              Sync Queue
            </ActionButton>
          </div>
        </div>
      </div>

      {/* Queue Tabs and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {(
            [
              { id: 'ALL', label: 'All Incidents', count: incidents.length },
              { id: 'MY', label: 'My Assigned', count: incidents.filter((i) => i.assigneeId === currentUser.id).length },
              { id: 'P1', label: 'P1 Critical', count: incidents.filter((i) => i.priority === 'P1').length },
              { id: 'MAJOR', label: 'Major Outages', count: incidents.filter((i) => i.isMajor).length },
              { id: 'TRIAGE', label: 'Unassigned', count: incidents.filter((i) => ['NEW', 'CLASSIFIED'].includes(i.state)).length },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                sound.blip();
                setActiveQueue(tab.id);
              }}
              className={`btn sm ${activeQueue === tab.id ? 'y' : 'w'} flex items-center gap-1.5`}
            >
              <span>{tab.label}</span>
              <span className="px-1.5 py-0.2 bg-[#1B1530] text-[#FFD84D] font-mono text-[10px]">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#1B1530] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search tickets, services, IDs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-9 pr-3 text-xs font-mono font-bold bg-white text-[#1B1530] border-[3px] border-[var(--line)] shadow-[3px_3px_0_var(--shadow-col)] focus:outline-none"
          />
        </div>
      </div>

      {/* High-Density Incident Queue Table */}
      <div className="pixel-card overflow-hidden p-0 border-[3px] border-[var(--line)] shadow-[6px_6px_0_var(--shadow-col)]">
        {loading && incidents.length === 0 ? (
          <div className="p-12 text-center text-xs font-mono font-bold text-[var(--soft)] space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#FF4D3D]" />
            <p>CONNECTING TO CCIT DISPATCH STREAM...</p>
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div className="p-12 text-center text-xs font-mono text-[var(--soft)] space-y-2">
            <p className="font-bold text-base text-[var(--fg)]">QUEUE IS CLEAR · ZERO INCIDENTS</p>
            <p>No tickets match the selected technician filter.</p>
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
                  <th className="py-3 px-3">SLA Hearts & Status</th>
                  <th className="py-3 px-4 text-right">Permitted Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[var(--line)]/20 font-medium">
                {filteredIncidents.map((inc) => {
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
                        <div className="flex items-center gap-1.5">
                          {inc.isMajor && (
                            <span className="chip s-BRC text-[10px] py-0 px-1">MAJOR</span>
                          )}
                          <span className="group-hover:text-[#FF4D3D] transition-colors">{inc.number}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[var(--fg)] max-w-sm truncate font-bold">
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
                          <span
                            className={
                              inc.slaStatus === 'BREACHED'
                                ? 'text-[#FF4D3D] font-bold'
                                : inc.slaStatus === 'AT_RISK'
                                ? 'text-[#FF9F43] font-bold'
                                : 'text-[#43D17A] font-bold'
                            }
                          >
                            {inc.slaStatus || 'ON_TRACK'}
                          </span>
                        </div>
                      </td>
                      <td
                        className="py-3 px-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {inc.isMajor ? (
                          <ActionButton
                            size="compact"
                            variant="crit"
                            onClick={() => {
                              sound.slot();
                              onOpenMajor(inc.id);
                            }}
                          >
                            Major Commander
                          </ActionButton>
                        ) : inc.allowedCommands.includes('ACKNOWLEDGE') ? (
                          <ActionButton
                            size="compact"
                            variant="primary"
                            onClick={async () => {
                              sound.fix();
                              try {
                                await api.incidents.command(inc.id, 'acknowledge');
                              } catch (err: any) {
                                sound.err();
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
                            variant="secondary"
                            onClick={() => {
                              sound.pick();
                              onSelectIncident(inc.id);
                            }}
                          >
                            Inspect
                          </ActionButton>
                        )}
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
