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
  Zap,
} from 'lucide-react';
import { StatusDot } from './ui/StatusDot';
import { StatusBadge } from './ui/StatusBadge';
import { ActionButton } from './ui/ActionButton';

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

  const navItems = [
    { id: 'portal' as const, label: 'Reporter Portal', icon: LayoutDashboard },
    { id: 'workbench' as const, label: 'Technician War Room', icon: Wrench },
    { id: 'admin' as const, label: 'Command Center', icon: Sliders },
  ];

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-white/[0.07] bg-[#090A0D]/90 backdrop-blur-md w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 h-full flex items-center justify-between gap-1">
        {/* Left: Brand mark & Virtual Clock Badge */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div
            className="flex items-center gap-1.5 sm:gap-2 cursor-pointer select-none"
            onClick={() => setCurrentTab('portal')}
          >
            <div className="w-7 h-7 rounded flex items-center justify-center bg-[#161920] border border-white/[0.10] text-[#38BDF8] shrink-0">
              <ShieldAlert className="w-4 h-4 shrink-0" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-xs sm:text-sm tracking-tight text-[#F3F4F6] whitespace-nowrap">
                INCIDENT<span className="text-[#38BDF8]">—</span>ZERO
              </span>
              <span className="hidden sm:inline px-1.5 py-0.5 rounded text-[11px] font-mono font-medium bg-white/[0.06] text-[#9BA1AE] border border-white/[0.06]">
                v2.2
              </span>
            </div>
          </div>

          {/* SSE Connection Pill */}
          <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#101217] border border-white/[0.07] text-[11px] font-mono text-[#9BA1AE]">
            <StatusDot state={isConnected ? 'CONNECTED' : 'DISCONNECTED'} />
            <span>{isConnected ? 'LIVE SSE' : 'RECONNECTING'}</span>
          </div>

          {/* Virtual Clock Accelerator */}
          <button
            type="button"
            onClick={toggleDemoClock}
            disabled={clockLoading}
            className={`hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer border ${
              isDemoClockFast
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                : 'bg-white/[0.04] text-[#9BA1AE] border-white/[0.07] hover:border-white/[0.14]'
            }`}
            title="Toggle Demo Clock 1x / 30x scale factor"
          >
            <Clock className="w-3 h-3 text-[#38BDF8] shrink-0" />
            <span>CLOCK {isDemoClockFast ? '30x' : '1x'}</span>
          </button>
        </div>

        {/* Center: Workspace Navigation Tabs */}
        <nav className="flex items-center gap-0.5 sm:gap-1 h-full shrink-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setCurrentTab(item.id)}
                className={`relative h-full px-2 sm:px-3.5 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-[13px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'text-[#F3F4F6]'
                    : 'text-[#9BA1AE] hover:text-[#F3F4F6]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#38BDF8]' : 'opacity-60'}`} />
                <span className="hidden sm:inline">{item.label}</span>
                <span className="inline sm:hidden uppercase font-mono text-[11px]">{item.id}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#38BDF8] rounded-t" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Demo Persona Switcher Dropdown */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2.5 h-8 px-2.5 rounded-md bg-[#161920] hover:bg-[#1D212A] border border-white/[0.08] hover:border-white/[0.16] transition-all cursor-pointer select-none"
          >
            <span className="text-sm shrink-0 leading-none">{currentUser.avatar}</span>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-medium text-[#F3F4F6] leading-tight truncate max-w-[120px]">
                {currentUser.name}
              </span>
              <span className="text-[11px] text-[#9BA1AE] leading-tight font-mono">
                {currentUser.supportTier ? `${currentUser.role} · ${currentUser.supportTier}` : currentUser.role}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#9BA1AE] shrink-0" />
          </button>

          {/* User Switcher Modal / Dropdown */}
          {showUserDropdown && (
            <div className="absolute right-0 mt-1.5 w-72 rounded-lg bg-[#101217] border border-white/[0.12] shadow-2xl py-1 z-50 text-xs">
              <div className="px-3 py-2 border-b border-white/[0.07] bg-[#161920]/50">
                <p className="font-semibold text-slate-200">Switch Demo Persona</p>
                <p className="text-xs text-slate-300 font-mono">8 Pre-Seeded BITS Pilani Accounts</p>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-white/[0.04]">
                {SEEDED_USERS.map((user) => {
                  const isCurrent = user.id === currentUser.id;
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => {
                        switchUser(user);
                        setShowUserDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-white/[0.06] transition-colors cursor-pointer ${
                        isCurrent ? 'bg-[#38BDF8]/10' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-base shrink-0">{user.avatar}</span>
                        <div className="truncate">
                          <p className={`font-medium truncate ${isCurrent ? 'text-[#38BDF8]' : 'text-slate-200'}`}>
                            {user.name}
                          </p>
                          <p className="text-xs text-slate-300 font-mono truncate">{user.email}</p>
                        </div>
                      </div>
                      <span className="ml-2 px-1.5 py-0.5 rounded text-[11px] font-mono font-medium shrink-0 bg-white/[0.06] text-slate-300">
                        {user.role}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
