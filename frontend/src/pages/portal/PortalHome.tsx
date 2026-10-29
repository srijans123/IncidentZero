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
  AlertCircle,
  CheckCircle,
  ExternalLink,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

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

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'P1':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse';
      case 'P2':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'P3':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600/30';
    }
  };

  const getStateBadge = (state: string) => {
    switch (state) {
      case 'NEW':
      case 'CLASSIFIED':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'ASSIGNED':
      case 'ACKNOWLEDGED':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'IN_PROGRESS':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
      case 'PENDING_USER':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold';
      case 'RESOLVED':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'VERIFIED':
      case 'CLOSED':
        return 'bg-slate-800 text-slate-400 border-slate-700';
      case 'REOPENED':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-indigo-950/40 via-slate-900/50 to-cyan-950/40 border border-indigo-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold tracking-wider uppercase mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Campus IT Helpdesk Copilot</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Hello, {currentUser.name}
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Track your campus IT tickets, review AI troubleshooting recommendations, or report a new connectivity, ERP, or LMS issue.
            </p>
          </div>
          <button
            onClick={onOpenReport}
            className="flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Report New Incident</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tickets, services, IDs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1">
          {['ALL', 'OPEN', 'RESOLVED'].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === filter
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {filter === 'ALL' ? 'All Tickets' : filter === 'OPEN' ? 'Active / In Progress' : 'Resolved'}
            </button>
          ))}
          <button
            onClick={fetchIncidents}
            title="Refresh list"
            className="p-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg text-slate-400 hover:text-slate-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Incidents Table / Cards */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        {loading && incidents.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
            Loading your campus incidents...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-400/60" />
            No campus incidents found matching your query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Summary</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">SLA Clock</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {filtered.map((inc) => (
                  <tr
                    key={inc.id}
                    onClick={() => onSelectIncident(inc.id)}
                    className="hover:bg-slate-850/60 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-400 whitespace-nowrap">
                      {inc.number || `INC-${inc.id.slice(0, 8)}`}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors line-clamp-1 max-w-md">
                        {inc.title}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">
                        {inc.description}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300">
                      {inc.serviceCode || 'CAMPUS-NET'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${getPriorityBadge(
                          inc.priority
                        )}`}
                      >
                        {inc.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium border ${getStateBadge(
                          inc.state
                        )}`}
                      >
                        {inc.state.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5 text-[11px]">
                        <Clock
                          className={`w-3.5 h-3.5 ${
                            inc.slaStatus === 'BREACHED'
                              ? 'text-rose-400 animate-bounce'
                              : inc.slaStatus === 'AT_RISK'
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        />
                        <span
                          className={`font-mono ${
                            inc.slaStatus === 'BREACHED'
                              ? 'text-rose-400 font-bold'
                              : inc.slaStatus === 'AT_RISK'
                              ? 'text-amber-400 font-semibold'
                              : 'text-slate-300'
                          }`}
                        >
                          {inc.slaStatus || 'ON_TRACK'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="text-slate-400 group-hover:text-indigo-400 inline-flex items-center space-x-1 text-xs">
                        <span>View</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </span>
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
