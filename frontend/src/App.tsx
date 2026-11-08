import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SseProvider } from './context/SseContext';
import { Header, ActiveTab } from './components/Header';
import { sound } from './services/sound';

// Stage view (ROM 00)
import { CampusStage } from './pages/stage/CampusStage';

// Portal views (ROM 01)
import { PortalHome } from './pages/portal/PortalHome';
import { PortalReport } from './pages/portal/PortalReport';
import { PortalDetail } from './pages/portal/PortalDetail';

// Workbench views (ROM 02)
import { WorkbenchHome } from './pages/workbench/WorkbenchHome';
import { WorkbenchDetail } from './pages/workbench/WorkbenchDetail';
import { WorkbenchMajor } from './pages/workbench/WorkbenchMajor';

// Admin views (ROM 03)
import { AdminOverview } from './pages/admin/AdminOverview';
import { AdminTopology } from './pages/admin/AdminTopology';
import { AdminAudit } from './pages/admin/AdminAudit';
import { AdminConfig } from './pages/admin/AdminConfig';

// Specs view (ROM 04)
import { SystemSpecs } from './pages/specs/SystemSpecs';

import {
  LayoutDashboard,
  GitBranch,
  ShieldCheck,
  Sliders,
  AlertCircle,
  ExternalLink,
  Volume2,
  VolumeX,
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentUser } = useAuth();

  // Navigation state (defaults to stage, supports URL hash/query)
  const [currentTab, setCurrentTab] = useState<ActiveTab>(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab') as ActiveTab;
    const hashParam = window.location.hash.replace('#', '') as ActiveTab;
    const initial = tabParam || hashParam;
    if (['stage', 'portal', 'workbench', 'admin', 'specs'].includes(initial)) {
      return initial;
    }
    return 'stage';
  });

  // HUD Game Stats (synced between CampusStage and Header)
  const [hudStats, setHudStats] = useState({
    openCount: 4,
    score: 0,
    combo: 1,
    bestScore: 600,
  });

  // Sub-navigation state
  const [portalView, setPortalView] = useState<'home' | 'report' | 'detail'>('home');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);

  const [workbenchView, setWorkbenchView] = useState<'home' | 'detail' | 'major'>('home');
  const [adminSubTab, setAdminSubTab] = useState<'overview' | 'topology' | 'audit' | 'config'>('overview');

  // Sync tab changes with URL hash
  const handleSetTab = (tab: ActiveTab) => {
    sound.pick();
    setCurrentTab(tab);
    window.history.replaceState(null, '', `?tab=${tab}`);
    if (tab === 'portal') setPortalView('home');
    if (tab === 'workbench') setWorkbenchView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sub-navigation handlers
  const handlePortalSelectIncident = (id: string) => {
    setSelectedIncidentId(id);
    setPortalView('detail');
  };

  const handleWorkbenchSelectIncident = (id: string) => {
    setSelectedIncidentId(id);
    setWorkbenchView('detail');
  };

  const handleWorkbenchOpenMajor = (id: string) => {
    setSelectedIncidentId(id);
    setWorkbenchView('major');
  };

  const handleStageUpdateScore = (score: number, combo: number, open: number) => {
    setHudStats((prev) => ({
      ...prev,
      score,
      combo,
      openCount: open,
      bestScore: Math.max(prev.bestScore, score),
    }));
  };

  return (
    <div className="min-h-screen text-[var(--fg)] flex flex-col font-pixel w-full max-w-full overflow-x-clip selection:bg-[var(--line)] selection:text-[var(--bg)]">
      {/* Top Floating Notched Header Navigation */}
      <Header
        currentTab={currentTab}
        setCurrentTab={handleSetTab}
        openCount={hudStats.openCount}
        score={hudStats.score}
        combo={hudStats.combo}
        bestScore={hudStats.bestScore}
      />

      {/* Role Notice Banner if Student visits Admin Center */}
      {currentTab === 'admin' && currentUser.role === 'EMPLOYEE' && (
        <div className="max-w-7xl w-full mx-auto px-4 mt-3">
          <div className="bg-[var(--card)] border-[3px] border-[var(--line)] px-4 py-2 text-xs text-[var(--fg)] text-center flex items-center justify-center gap-2 shadow-[3px_3px_0_var(--shadow-col)]">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              CAMPUS DEMO MODE: Signed in as student <strong>{currentUser.name}</strong> with Admin Command clearance.
            </span>
          </div>
        </div>
      )}

      {/* Main Workspace Router */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-2 sm:px-4 lg:px-6 py-5 overflow-x-hidden">
        {/* Workspace 0: Campus Stage (ROM 00) */}
        {currentTab === 'stage' && (
          <CampusStage
            onSelectCartridge={handleSetTab}
            onUpdateScore={handleStageUpdateScore}
          />
        )}

        {/* Workspace 1: Student Portal (ROM 01) */}
        {currentTab === 'portal' && (
          <div>
            {portalView === 'home' && (
              <PortalHome
                onSelectIncident={handlePortalSelectIncident}
                onOpenReport={() => {
                  sound.pick();
                  setPortalView('report');
                }}
              />
            )}
            {portalView === 'report' && (
              <PortalReport
                onBack={() => {
                  sound.pick();
                  setPortalView('home');
                }}
                onSubmitSuccess={(id) => {
                  setSelectedIncidentId(id);
                  setPortalView('detail');
                }}
              />
            )}
            {portalView === 'detail' && selectedIncidentId && (
              <PortalDetail
                incidentId={selectedIncidentId}
                onBack={() => {
                  sound.pick();
                  setPortalView('home');
                }}
              />
            )}
          </div>
        )}

        {/* Workspace 2: Technician Workbench (ROM 02) */}
        {currentTab === 'workbench' && (
          <div>
            {workbenchView === 'home' && (
              <WorkbenchHome
                onSelectIncident={handleWorkbenchSelectIncident}
                onOpenMajor={handleWorkbenchOpenMajor}
              />
            )}
            {workbenchView === 'detail' && selectedIncidentId && (
              <WorkbenchDetail
                incidentId={selectedIncidentId}
                onBack={() => {
                  sound.pick();
                  setWorkbenchView('home');
                }}
                onOpenMajor={handleWorkbenchOpenMajor}
              />
            )}
            {workbenchView === 'major' && selectedIncidentId && (
              <WorkbenchMajor
                incidentId={selectedIncidentId}
                onBack={() => {
                  sound.pick();
                  setWorkbenchView('home');
                }}
              />
            )}
          </div>
        )}

        {/* Workspace 3: Admin Command Center (ROM 03) */}
        {currentTab === 'admin' && (
          <div className="space-y-6">
            {/* Chunky Pixel Sub-nav for Admin Center */}
            <div className="flex items-center gap-2 border-b-[3px] border-[var(--line)] pb-3 overflow-x-auto">
              <button
                type="button"
                onClick={() => {
                  sound.pick();
                  setAdminSubTab('overview');
                }}
                className={`btn ${adminSubTab === 'overview' ? 'y' : 'w'} text-xs`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 inline mr-1.5" />
                <span>Executive KPI Overview</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.pick();
                  setAdminSubTab('topology');
                }}
                className={`btn ${adminSubTab === 'topology' ? 'y' : 'w'} text-xs`}
              >
                <GitBranch className="w-3.5 h-3.5 inline mr-1.5" />
                <span>19-Node Service DAG</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.pick();
                  setAdminSubTab('audit');
                }}
                className={`btn ${adminSubTab === 'audit' ? 'y' : 'w'} text-xs`}
              >
                <ShieldCheck className="w-3.5 h-3.5 inline mr-1.5" />
                <span>SHA-256 Audit Ledger</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.pick();
                  setAdminSubTab('config');
                }}
                className={`btn ${adminSubTab === 'config' ? 'y' : 'w'} text-xs`}
              >
                <Sliders className="w-3.5 h-3.5 inline mr-1.5" />
                <span>SLA Policy & Engine Config</span>
              </button>
            </div>

            {/* Sub-view rendering */}
            {adminSubTab === 'overview' && <AdminOverview />}
            {adminSubTab === 'topology' && <AdminTopology />}
            {adminSubTab === 'audit' && <AdminAudit />}
            {adminSubTab === 'config' && <AdminConfig />}
          </div>
        )}

        {/* Workspace 4: System Specs (ROM 04) */}
        {currentTab === 'specs' && <SystemSpecs />}
      </main>

      {/* Retro Pixel Arcade Footer */}
      <footer className="border-t-[3px] border-[var(--line)] bg-[var(--card)] py-6 mt-12 text-center text-xs font-pixel shadow-[0_-4px_0_var(--shadow-col)]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 bg-[var(--ribbon)] border border-[var(--line)] inline-block"></span>
            <span className="font-bold tracking-wide">
              INCIDENT-ZERO // ZERO OPEN INCIDENTS (v2.2)
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-center">
            <a
              href="./"
              className="btn w text-xs"
              onClick={() => sound.pick()}
            >
              <ExternalLink className="w-3.5 h-3.5 inline mr-1" />
              CAMPUS ARCADE HOMEPAGE
            </a>
          </div>

          <div className="text-[var(--soft)] font-mono text-[11px]">
            BITS PILANI HYDERABAD CAMPUS • CCIT SERVICE DESK
          </div>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <SseProvider>
        <AppContent />
      </SseProvider>
    </AuthProvider>
  );
};

export default App;
