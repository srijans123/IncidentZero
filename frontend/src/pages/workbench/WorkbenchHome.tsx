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
  const [activeQueue, setActiveQueue] = useState<'MY' | 'TRIAGE' | 'P1' | 'MAJOR' | 'ALL'>('ALL');

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

  // Global Keyboard shortcuts: 'a' for ack, 's' for start, 'r' for resolve on first selected
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
      } else if (e.key === 's' || e.key === 'S') {
        if (firstOpen.allowedCommands.includes('START_INVESTIGATION')) {
          api.incidents.command(firstOpen.id, 'start').then(fetchQueue);
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

  const getPriorityStyle = (p: string) => {
    switch (p) {
      case 'P1':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm shadow-rose-500/20 animate-pulse';
      case 'P2':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'P3':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600/30';
    }
  };

  const getSlaRiskRing = (status: string) => {
    switch (status) {
      case 'BREACHED':
        return {
          color: 'text-rose-400',
          bg: 'bg-rose-500/10 border-rose-500/30',
          label: 'Breached',
        };
      case 'AT_RISK':
        return {
          color: 'text-amber-400',
          bg: 'bg-amber-500/10 border-amber-500/30',
          label: 'Risk (>75%)',
        };
      default:
        return {
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/10 border-emerald-500/30',
          label: 'On Track',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Workbench Header & Shortcuts Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 bg-gradient-to-r from-slate-900/90 via-indigo-950/20 to-slate-900/90">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Wrench className="w-4 h-4" />
              <span>Technician Operations Console</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">Technician War Room & Queues</h1>
            <p className="text-xs text-slate-400 mt-1">
              Logged in as <span className="text-slate-200 font-semibold">{currentUser.name}</span> ({currentUser.supportTier || 'SENIOR'} • {currentUser.teamName})
            </p>
          </div>

          {/* Keyboard Shortcuts Hint */}
          <div className="flex items-center space-x-2 px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-400">
            <Keyboard className="w-4 h-4 text-indigo-400" />
            <span>Shortcuts:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 font-mono text-[11px] border border-slate-700">A</kbd>
            <span>Ack</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 font-mono text-[11px] border border-slate-700">S</kbd>
            <span>Start</span>
          </div>
        </div>
      </div>

      {/* Queue Tabs and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1">
          {[
            { id: 'ALL', label: 'All Incidents' },
            { id: 'MY', label: 'My Queue' },
            { id: 'TRIAGE', label: 'Unassigned / Triage' },
            { id: 'P1', label: 'P1 Critical', icon: AlertTriangle },
            { id: 'MAJOR', label: 'Major Incidents', icon: Flame },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveQueue(tab.id as any)}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeQueue === tab.id
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search queue..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            onClick={fetchQueue}
            title="Refresh queue"
            className="p-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-slate-400 hover:text-slate-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        {loading && incidents.length === 0 ? (
          <div className="p-16 text-center text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
            Loading engineering queue...
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div className="p-16 text-center text-slate-400 text-xs">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-400/60" />
            No incidents found in this queue view.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Incident</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Summary</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">State</th>
                  <th className="py-3 px-4">SLA Risk (A5)</th>
                  <th className="py-3 px-4">Assignee</th>
                  <th className="py-3 px-4 text-right">War Room</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {filteredIncidents.map((inc) => {
                  const ring = getSlaRiskRing(inc.slaStatus);
                  return (
                    <tr
                      key={inc.id}
                      onClick={() => {
                        if (inc.isMajor) {
                          onOpenMajor(inc.id);
                        } else {
                          onSelectIncident(inc.id);
                        }
                      }}
                      className="hover:bg-slate-850/60 cursor-pointer transition-colors group"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-400 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          {inc.isMajor && (
                            <Flame className="w-3.5 h-3.5 text-rose-400 fill-rose-400 animate-pulse" />
                          )}
                          <span>{inc.number || `INC-${inc.id.slice(0, 8)}`}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${getPriorityStyle(
                            inc.priority
                          )}`}
                        >
                          {inc.priority}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors line-clamp-1 max-w-sm">
                          {inc.title}
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">
                          {inc.description}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300 whitespace-nowrap">
                        {inc.serviceCode || 'CAMPUS-NET'}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {inc.state}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[10px] border ${ring.bg}`}>
                          <Clock className={`w-3 h-3 ${ring.color}`} />
                          <span className={`font-mono font-semibold ${ring.color}`}>{ring.label}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                        {inc.assigneeName || (
                          <span className="text-amber-400/80 font-mono text-[11px]">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (inc.isMajor) onOpenMajor(inc.id);
                            else onSelectIncident(inc.id);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-[11px] font-semibold transition-all inline-flex items-center space-x-1"
                        >
                          <span>Enter</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
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
