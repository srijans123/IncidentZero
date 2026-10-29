import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SseProvider } from './context/SseContext';
import { Header } from './components/Header';

// Portal views
import { PortalHome } from './pages/portal/PortalHome';
import { PortalReport } from './pages/portal/PortalReport';
import { PortalDetail } from './pages/portal/PortalDetail';

// Workbench views
import { WorkbenchHome } from './pages/workbench/WorkbenchHome';
import { WorkbenchDetail } from './pages/workbench/WorkbenchDetail';
import { WorkbenchMajor } from './pages/workbench/WorkbenchMajor';

// Admin views
import { AdminOverview } from './pages/admin/AdminOverview';
import { AdminTopology } from './pages/admin/AdminTopology';
import { AdminAudit } from './pages/admin/AdminAudit';
import { AdminConfig } from './pages/admin/AdminConfig';

import {
  LayoutDashboard,
  GitBranch,
  ShieldCheck,
  Sliders,
  AlertCircle,
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentUser } = useAuth();

  // Navigation state
  const [currentTab, setCurrentTab] = useState<'portal' | 'workbench' | 'admin'>('portal');

  // Sub-navigation state
  const [portalView, setPortalView] = useState<'home' | 'report' | 'detail'>('home');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);

  const [workbenchView, setWorkbenchView] = useState<'home' | 'detail' | 'major'>('home');
  const [adminSubTab, setAdminSubTab] = useState<'overview' | 'topology' | 'audit' | 'config'>('overview');

  // Navigation handlers
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          if (tab === 'portal') setPortalView('home');
          if (tab === 'workbench') setWorkbenchView('home');
        }}
      />

      {/* Role Notice Banner if Employee visits Admin Center */}
      {currentTab === 'admin' && currentUser.role === 'EMPLOYEE' && (
        <div className="bg-amber-950/40 border-b border-amber-500/30 px-4 py-2 text-xs text-amber-300 text-center flex items-center justify-center space-x-2">
          <AlertCircle className="w-4 h-4" />
          <span>
            Campus Demo Mode: Logged in as student <code className="font-mono text-amber-200">{currentUser.name}</code> with Administrator viewing privileges.
          </span>
        </div>
      )}

      {/* Main Workspace Router */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Workspace 1: Employee Portal */}
        {currentTab === 'portal' && (
          <div>
            {portalView === 'home' && (
              <PortalHome
                onSelectIncident={handlePortalSelectIncident}
                onOpenReport={() => setPortalView('report')}
              />
            )}
            {portalView === 'report' && (
              <PortalReport
                onBack={() => setPortalView('home')}
                onSubmitSuccess={(id) => {
                  setSelectedIncidentId(id);
                  setPortalView('detail');
                }}
              />
            )}
            {portalView === 'detail' && selectedIncidentId && (
              <PortalDetail
                incidentId={selectedIncidentId}
                onBack={() => setPortalView('home')}
              />
            )}
          </div>
        )}

        {/* Workspace 2: Technician Workbench */}
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
                onBack={() => setWorkbenchView('home')}
                onOpenMajor={handleWorkbenchOpenMajor}
              />
            )}
            {workbenchView === 'major' && selectedIncidentId && (
              <WorkbenchMajor
                incidentId={selectedIncidentId}
                onBack={() => setWorkbenchView('home')}
              />
            )}
          </div>
        )}

        {/* Workspace 3: Admin Command Center */}
        {currentTab === 'admin' && (
          <div className="space-y-6">
            {/* Sub-nav tabs for Admin Center */}
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 overflow-x-auto">
              <button
                onClick={() => setAdminSubTab('overview')}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  adminSubTab === 'overview'
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Executive KPI Overview</span>
              </button>

              <button
                onClick={() => setAdminSubTab('topology')}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  adminSubTab === 'topology'
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <GitBranch className="w-3.5 h-3.5" />
                <span>19-Node Service Topology DAG</span>
              </button>

              <button
                onClick={() => setAdminSubTab('audit')}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  adminSubTab === 'audit'
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>SHA-256 Audit Ledger & Storm Engine</span>
              </button>

              <button
                onClick={() => setAdminSubTab('config')}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  adminSubTab === 'config'
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>SLA Policy Matrix & Strategies</span>
              </button>
            </div>

            {/* Sub-view rendering */}
            {adminSubTab === 'overview' && <AdminOverview />}
            {adminSubTab === 'topology' && <AdminTopology />}
            {adminSubTab === 'audit' && <AdminAudit />}
            {adminSubTab === 'config' && <AdminConfig />}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 text-center text-xs text-slate-500">
        Incident-Zero (I-ITSM v2.2) • Hexagonal Modular Monolith Architecture • BITS Pilani
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
