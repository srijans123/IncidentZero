import React, { useState, useEffect } from 'react';
import { useAuth, SEEDED_USERS, PredefinedUser } from '../context/AuthContext';
import { useSse } from '../context/SseContext';
import { api } from '../services/api';
import { sound } from '../services/sound';
import { PixelIcon } from '../services/pixelSprites';
import { StatusDot } from './ui/StatusDot';
import logoDark from '../assets/logo/incident-zero-logo.png';
import logoLight from '../assets/logo/incident-zero-logo-light.png';

export type ActiveTab = 'stage' | 'portal' | 'workbench' | 'admin' | 'specs';

interface HeaderProps {
  currentTab: ActiveTab;
  setCurrentTab: (tab: ActiveTab) => void;
  openCount?: number;
  score?: number;
  combo?: number;
  bestScore?: number;
}

const SKY_MODES = [
  { id: 'day', label: 'Sky: Day', dark: false, meta: '#FFE680' },
  { id: 'sunset', label: 'Sky: Sunset', dark: false, meta: '#FFB870' },
  { id: 'night', label: 'Sky: Night', dark: true, meta: '#1E1646' },
  { id: 'rain', label: 'Sky: Monsoon', dark: true, meta: '#2C3B4D' },
];

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  openCount = 4,
  score = 0,
  combo = 1,
  bestScore = 600,
}) => {
  const { currentUser, switchUser } = useAuth();
  const { isConnected } = useSse();
  const [isDemoClockFast, setIsDemoClockFast] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showStationMenu, setShowStationMenu] = useState(false);
  const [skyIdx, setSkyIdx] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // Cycle skies
  const handleCycleSky = () => {
    sound.blip();
    const nextIdx = (skyIdx + 1) % SKY_MODES.length;
    setSkyIdx(nextIdx);
    const m = SKY_MODES[nextIdx];
    document.documentElement.setAttribute('data-sky', m.id);
    document.documentElement.setAttribute('data-theme', m.dark ? 'dark' : 'light');
    const tc = document.getElementById('themeColorMeta');
    if (tc) tc.setAttribute('content', m.meta);
  };

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const toggleDemoClock = async () => {
    sound.pick();
    const newFactor = isDemoClockFast ? 1 : 30;
    try {
      await api.admin.setDemoClock(newFactor);
      setIsDemoClockFast(!isDemoClockFast);
    } catch {
      setIsDemoClockFast(!isDemoClockFast);
    }
  };

  // Esc closes menus
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowUserDropdown(false);
        setShowStationMenu(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const navCartridges: { id: ActiveTab; label: string; icon: string; cartNum: string }[] = [
    { id: 'stage', label: 'Campus Stage', icon: 'building', cartNum: '00' },
    { id: 'portal', label: 'Student Portal', icon: 'megaphone', cartNum: '01' },
    { id: 'workbench', label: 'Workbench', icon: 'wrench', cartNum: '02' },
    { id: 'admin', label: 'Command DAG', icon: 'wifi', cartNum: '03' },
    { id: 'specs', label: 'System Specs', icon: 'book', cartNum: '04' },
  ];

  return (
    <div className="sticky top-2 z-40 max-w-7xl w-full mx-auto px-2 sm:px-4 filter drop-shadow-[5px_5px_0_var(--shadow-col)]">
      <div className="navo">
        <div className="navi flex items-center justify-between gap-2 flex-wrap">
          {/* Left: Official Brand Logos & BPHC Tag */}
          <div
            className="flex items-center gap-2 cursor-pointer select-none shrink-0"
            onClick={() => {
              sound.pick();
              window.location.href = './';
            }}
            title="Incident-Zero — Return to Homepage"
          >
            <img
              className="brand-img light-only h-7 w-auto object-contain"
              src={logoDark}
              alt="Incident-Zero"
            />
            <img
              className="brand-img dark-only h-7 w-auto object-contain"
              src={logoLight}
              alt="Incident-Zero"
            />
            <span className="font-mono text-xs font-bold bg-[#FFD84D] text-[#1B1530] border-2 border-[#1B1530] px-1.5 py-0.5 shadow-[2px_2px_0_#1B1530]">
              BPHC
            </span>
          </div>

          {/* Real-time Arcade HUD Counters */}
          <div className="hidden lg:flex items-center gap-3 shrink-0 text-xs font-mono font-bold">
            <span className="inline-flex items-center gap-1.5 bg-[var(--card)] px-2 py-1 border-2 border-[var(--line)]">
              <PixelIcon name="bug" scale={1.8} />
              <span>OPEN</span>
              <span className="text-[#FF4D3D] mono-num">{openCount}</span>
            </span>

            <span className="inline-flex items-center gap-1.5 bg-[var(--card)] px-2 py-1 border-2 border-[var(--line)]">
              <PixelIcon name="coin" scale={1.8} />
              <span>SCORE</span>
              <span className="text-[#7C5CFF] mono-num">{String(Math.round(score)).padStart(4, '0')}</span>
            </span>

            <div className="combo-wrap">
              <span className="inline-flex items-center gap-1 text-[11px]">
                <PixelIcon name="bolt" scale={1.5} />
                <span>COMBO</span>
                <span className="text-[#FF4D3D] mono-num">{combo}x</span>
              </span>
              <div className="combo-meter">
                <div
                  className="combo-fill"
                  style={{ width: `${Math.min(100, Math.max(20, combo * 25))}%` }}
                />
              </div>
            </div>

            <span className="hidden xl:inline-flex items-center gap-1.5 bg-[var(--card)] px-2 py-1 border-2 border-[var(--line)]">
              <PixelIcon name="trophy" scale={1.8} />
              <span>BEST</span>
              <span className="text-[#43D17A] mono-num">{String(Math.round(bestScore)).padStart(4, '0')}</span>
            </span>
          </div>

          {/* Center: 5 ROM Cartridge Station Nav Buttons */}
          <nav className="flex items-center gap-1 overflow-x-auto py-1">
            {navCartridges.map((cart) => {
              const isActive = currentTab === cart.id;
              return (
                <button
                  key={cart.id}
                  type="button"
                  onClick={() => {
                    sound.slot();
                    setCurrentTab(cart.id);
                  }}
                  className={`btn sm ${isActive ? 'y' : 'w'} flex items-center gap-1.5 whitespace-nowrap`}
                >
                  <PixelIcon name={cart.icon} scale={1.6} />
                  <span>{cart.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right: Weather/Sky, Sound, Persona Switcher */}
          <div className="flex items-center gap-1.5 shrink-0 ml-auto sm:ml-0">
            {/* Sky Cycle Toggle */}
            <button
              type="button"
              onClick={handleCycleSky}
              className="btn sm w flex items-center gap-1"
              title="Cycle campus sky & weather (Day, Sunset, Night, Monsoon)"
            >
              <PixelIcon name="sun" scale={1.6} />
              <span className="hidden sm:inline">{SKY_MODES[skyIdx].label}</span>
            </button>

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={handleToggleSound}
              className={`btn sm ${isMuted ? 'w' : 'y'} flex items-center gap-1`}
              title="Toggle 8-bit chiptune sound effects"
            >
              <PixelIcon name="bell" scale={1.6} />
              <span className="hidden md:inline">{isMuted ? 'Muted' : 'Audio On'}</span>
            </button>

            {/* Virtual Clock Toggle */}
            <button
              type="button"
              onClick={toggleDemoClock}
              className={`btn sm ${isDemoClockFast ? 'r' : 'w'} hidden xl:flex items-center gap-1`}
              title="Toggle Demo Clock (1x vs 30x SLA drain)"
            >
              <PixelIcon name="clock" scale={1.6} />
              <span>{isDemoClockFast ? '30x SLA' : '1x SLA'}</span>
            </button>

            {/* Station Menu Toggle */}
            <button
              type="button"
              onClick={() => {
                sound.pick();
                setShowStationMenu(!showStationMenu);
              }}
              className="btn sm flex items-center gap-1"
              title="Open Campus Station Quick-Jump Menu"
            >
              <PixelIcon name="gamepad" scale={1.6} />
              <span>Menu</span>
            </button>

            {/* Persona Switcher Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  sound.blip();
                  setShowUserDropdown(!showUserDropdown);
                }}
                className="btn sm y flex items-center gap-1.5"
                title="Switch BITS Pilani Demo Persona"
              >
                <span>{currentUser.avatar}</span>
                <span className="hidden sm:inline font-mono truncate max-w-[80px]">
                  {currentUser.name.split(' ')[0]}
                </span>
                <span className="text-[10px] bg-[#1B1530] text-[#FFD84D] px-1 py-0.2">
                  {currentUser.role}
                </span>
              </button>

              {/* Persona Modal */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-[var(--card)] border-[3px] border-[var(--line)] shadow-[6px_6px_0_var(--shadow-col)] p-2 z-50 text-xs">
                  <div className="p-2 border-b-2 border-[var(--line)] bg-[#FFD84D] text-[#1B1530] font-bold font-mono">
                    🕹️ SWITCH BITS PILANI PERSONA
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y-2 divide-[var(--line)]/20 mt-1">
                    {SEEDED_USERS.map((user) => {
                      const isSelected = user.id === currentUser.id;
                      return (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => {
                            sound.pick();
                            switchUser(user);
                            setShowUserDropdown(false);
                          }}
                          className={`w-full text-left p-2 flex items-center justify-between hover:bg-[#FFD84D]/40 transition-colors cursor-pointer ${
                            isSelected ? 'bg-[#FFD84D]/60 font-bold' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-base">{user.avatar}</span>
                            <div className="truncate">
                              <p className="text-[var(--fg)] truncate">{user.name}</p>
                              <p className="text-[11px] text-[var(--soft)] font-mono truncate">
                                {user.email}
                              </p>
                            </div>
                          </div>
                          <span className="chip s-ASG ml-2 text-[10px]">{user.role}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Station Jump Menu Drawer */}
      {showStationMenu && (
        <div className="mt-2 bg-[var(--card)] border-[3px] border-[var(--line)] shadow-[6px_6px_0_var(--shadow-col)] p-4 text-xs">
          <div className="flex items-center justify-between border-b-2 border-[var(--line)] pb-2 mb-3">
            <span className="font-mono font-bold text-sm text-[var(--fg)]">
              SELECT BPHC STATION (ESC TO CLOSE)
            </span>
            <button
              type="button"
              onClick={() => setShowStationMenu(false)}
              className="btn sm r"
            >
              ✕ Close
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="btn y"
              type="button"
              onClick={() => {
                sound.pick();
                setCurrentTab('stage');
                setShowStationMenu(false);
              }}
            >
              <PixelIcon name="building" scale={1.8} />
              <span>Campus Stage</span>
            </button>
            <button
              className="btn"
              type="button"
              onClick={() => {
                sound.pick();
                setCurrentTab('portal');
                setShowStationMenu(false);
              }}
            >
              <PixelIcon name="megaphone" scale={1.8} />
              <span>Student Portal (ROM 01)</span>
            </button>
            <button
              className="btn r"
              type="button"
              onClick={() => {
                sound.pick();
                setCurrentTab('workbench');
                setShowStationMenu(false);
              }}
            >
              <PixelIcon name="wrench" scale={1.8} />
              <span>Technician Workbench (ROM 02)</span>
            </button>
            <button
              className="btn g"
              type="button"
              onClick={() => {
                sound.pick();
                setCurrentTab('admin');
                setShowStationMenu(false);
              }}
            >
              <PixelIcon name="wifi" scale={1.8} />
              <span>Command Center (ROM 03)</span>
            </button>
            <button
              className="btn p"
              type="button"
              onClick={() => {
                sound.pick();
                setCurrentTab('specs');
                setShowStationMenu(false);
              }}
            >
              <PixelIcon name="book" scale={1.8} />
              <span>System Specs (ROM 04)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
