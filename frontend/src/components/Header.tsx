import React, { useState } from 'react';
import { useAuth, SEEDED_USERS, PredefinedUser } from '../context/AuthContext';
import { useSse } from '../context/SseContext';
import { api } from '../services/api';
import {
  ShieldAlert,
  Radio,
  Clock,
  UserCheck,
  ChevronDown,
  LayoutDashboard,
  Wrench,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from 'lucide-react';

interface HeaderProps {
  currentTab: 'portal' | 'workbench' | 'admin';
  setCurrentTab: (tab: 'portal' | 'workbench' | 'admin') => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, setCurrentTab }) => {
  const { currentUser, switchUser } = useAuth();
  const { isConnected, stormProgress } = useSse();
  const [isDemoClockFast, setIsDemoClockFast] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [clockLoading, setClockLoading] = useState(false);

  const toggleDemoClock = async () => {
    setClockLoading(true);
    const newFactor = isDemoClockFast ? 1 : 30;
    try {
      await api.admin.setDemoClock(newFactor);
      setIsDemoClockFast(!isDemoClockFast);
    } catch (err) {
      console.warn('Clock acceleration api error, toggling UI state', err);
      setIsDemoClockFast(!isDemoClockFast);
    } finally {
      setClockLoading(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Version */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('portal')}>
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                  Incident-Zero
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded">
                  v2.2
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Campus ITSM • BITS Pilani</p>
            </div>
          </div>

          {/* Navigation Workspaces */}
          <nav className="flex items-center space-x-1 sm:space-x-2 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setCurrentTab('portal')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'portal'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Employee Portal</span>
            </button>

            <button
              onClick={() => setCurrentTab('workbench')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'workbench'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Tech Workbench</span>
            </button>

            <button
              onClick={() => setCurrentTab('admin')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'admin'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Admin Center</span>
            </button>
          </nav>

          {/* Controls: Demo Clock, SSE Status, User Switcher */}
          <div className="flex items-center space-x-3">
            {/* 30x Demo Clock Toggle */}
            <button
              onClick={toggleDemoClock}
              disabled={clockLoading}
              title="Toggle 30x Virtual Demo Clock for rapid SLA breach & timer testing"
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                isDemoClockFast
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/20 animate-pulse'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-300 hover:border-slate-700'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{isDemoClockFast ? '30× Active' : '1× Clock'}</span>
            </button>

            {/* SSE Stream Status Indicator */}
            <div
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border ${
                isConnected
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}
              title={isConnected ? 'SSE Live Stream Connected (15s Heartbeat)' : 'SSE Reconnecting...'}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'
                }`}
              />
              <span className="hidden md:inline">{isConnected ? 'Live SSE' : 'Offline'}</span>
            </div>

            {/* Demo User Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center space-x-2 pl-2 pr-3 py-1.5 bg-slate-900/90 hover:bg-slate-850 border border-slate-800 rounded-xl text-xs font-medium transition-colors"
              >
                <span className="text-base">{currentUser.avatar}</span>
                <div className="text-left hidden sm:block">
                  <div className="text-slate-200 font-semibold leading-tight">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-400 capitalize">{currentUser.role.toLowerCase()}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50">
                  <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Switch Campus Role
                  </div>
                  <div className="space-y-1 mt-1 max-h-80 overflow-y-auto">
                    {SEEDED_USERS.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => {
                          switchUser(user);
                          setShowUserDropdown(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors ${
                          currentUser.id === user.id
                            ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                            : 'hover:bg-slate-800/80 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <span className="text-lg">{user.avatar}</span>
                          <div>
                            <div className="font-semibold text-slate-200">{user.name}</div>
                            <div className="text-[10px] text-slate-400">
                              {user.email} • {user.role} {user.supportTier ? `(${user.supportTier})` : ''}
                            </div>
                          </div>
                        </div>
                        {currentUser.id === user.id && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Live Storm Progress Banner if active */}
      {stormProgress && (
        <div className="bg-gradient-to-r from-amber-600/30 via-rose-600/30 to-purple-600/30 border-t border-b border-amber-500/30 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-400 animate-bounce" />
              <span className="font-semibold text-amber-200">
                Storm Simulation Active ({stormProgress.scenario}):
              </span>
              <span className="text-slate-300">
                Injected {stormProgress.injectedCount} / {stormProgress.totalCount} reports
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-200 font-mono text-[11px]">
                {stormProgress.masterCount} Masters
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-200 font-mono text-[11px]">
                {stormProgress.childCount} Auto-Linked Children
              </span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
