import React, { useState, useEffect } from 'react';
import { AppSidebar } from './components/layout/AppSidebar';
import { AppTopHeader } from './components/layout/AppTopHeader';
import { AdminLayout } from './components/admin/AdminLayout';

// User Pages
import { DashboardOverviewPage } from './pages/DashboardOverviewPage';
import { ScansHistoryPage } from './pages/ScansHistoryPage';
import { FindingsListPage } from './pages/FindingsListPage';
import { FindingDetailPage } from './pages/FindingDetailPage';
import { WorkflowPage } from './pages/WorkflowPage';
import { RepositoriesListPage } from './pages/RepositoriesListPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ReportsHubPage } from './pages/ReportsHubPage';
import { IntegrationsHubPage } from './pages/IntegrationsHubPage';
import { SettingsPage } from './pages/SettingsPage';

// Admin Pages
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage';
import { AdminScalabilityPage } from './pages/admin/AdminScalabilityPage';
import { AdminCostEconomicsPage } from './pages/admin/AdminCostEconomicsPage';
import { AdminUserInteractionsPage } from './pages/admin/AdminUserInteractionsPage';
import { AdminSystemHealthPage } from './pages/admin/AdminSystemHealthPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminUnauthorizedPage } from './pages/AdminUnauthorizedPage';

// Modals
import { ActiveScanModal } from './components/scans/ActiveScanModal';
import { SearchModal } from './components/docs/SearchModal';
import { LoadingSkeleton } from './components/common/LoadingSkeleton';

import { ScanResult, IssueFinding, Project } from './types';
import { api, DashboardStats } from './services/api';
import { mockHealth, mockScans, mockProjects } from './data/mockData';
import { searchIndex } from './data/docsContent';

export const App: React.FC = () => {
  // Path state initialized from browser URL
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const path = window.location.pathname;
    return path === '/' || path === '' ? '/app' : path;
  });

  const [userRole, setUserRole] = useState<'USER' | 'ADMIN'>(() => {
    const path = window.location.pathname;
    return path.startsWith('/admin') ? 'ADMIN' : 'USER';
  });

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('leakguard-theme');
    return saved ? saved === 'dark' : false;
  });

  const [stats, setStats] = useState<DashboardStats>({
    summary: {
      files_scanned: 6,
      resources_detected: 10,
      open_leaks: 4,
      definite_leaks: 2,
      likely_leaks: 2,
      resolved_leaks: 0,
      repository_health: 40,
      resolution_rate: 92
    },
    latest_scans: mockScans,
    recent_leaks: mockScans[0]?.findings || [],
    activity: [],
    repository_breakdown: []
  });

  const [scans, setScans] = useState<ScanResult[]>(mockScans);
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);

  // Sync browser URL & history
  const navigateTo = (path: string) => {
    if (path.startsWith('/admin') && userRole !== 'ADMIN') {
      setUserRole('ADMIN');
    }
    if ((path === '/app' || path === '/') && userRole === 'ADMIN') {
      setUserRole('USER');
    }
    setCurrentPath(path);
    window.history.pushState({}, '', path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const cleanPath = path === '/' || path === '' ? '/app' : path;
      setCurrentPath(cleanPath);
      if (cleanPath.startsWith('/admin')) {
        setUserRole('ADMIN');
      } else {
        setUserRole('USER');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('leakguard-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('leakguard-theme', 'light');
    }
  }, [darkMode]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch real data
  const loadRealData = async () => {
    try {
      const [fetchedStats, fetchedScans, fetchedProjects] = await Promise.all([
        api.getDashboardStats(),
        api.getScans(),
        api.getRepositories()
      ]);
      if (fetchedStats) setStats(fetchedStats);
      if (fetchedScans && fetchedScans.length > 0) setScans(fetchedScans);
      if (fetchedProjects && fetchedProjects.length > 0) setProjects(fetchedProjects);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    loadRealData();
  }, []);

  const handleSelectFinding = (findingId: string) => {
    setSelectedFindingId(findingId);
    navigateTo('/findings/detail');
  };

  const handleScanCompleted = (newScan: ScanResult) => {
    setScans(prev => [newScan, ...prev]);
    loadRealData();
  };

  const handleToggleUserRole = () => {
    if (userRole === 'USER') {
      setUserRole('ADMIN');
      navigateTo('/admin');
    } else {
      setUserRole('USER');
      navigateTo('/app');
    }
  };

  const allIssues: IssueFinding[] = scans.flatMap(s => s.findings || []);
  const selectedFinding = allIssues.find(i => i.id === selectedFindingId) || allIssues[0] || {
    id: 'f-101',
    scan_id: 'scan-1',
    rule_id: 'LG001',
    file: 'early_return.py',
    line: 2,
    column: 4,
    resource_type: 'file',
    variable_name: 'f',
    confidence: 'DEFINITE',
    severity: 'HIGH',
    status: 'OPEN',
    reason: 'Resource opened without deterministic close on branching path.'
  };

  const isAdminRoute = currentPath.startsWith('/admin');
  const isUnauthorized = isAdminRoute && userRole !== 'ADMIN';

  // User Page Title/Subtitle Meta
  const getUserPageMeta = () => {
    switch (currentPath) {
      case '/app':
      case '/dashboard':
      case '/':
        return { title: 'Dashboard', subtitle: 'Monitor resource leaks, scans, and repository health.' };
      case '/scans':
        return { title: 'Scans', subtitle: 'Run and review static analysis repository scans.' };
      case '/findings':
        return { title: 'Findings', subtitle: 'Review resource leaks detected across your repositories.' };
      case '/findings/detail':
        return { title: 'Finding Details', subtitle: 'Security analysis and control-flow execution path.' };
      case '/workflow':
        return { title: 'Mission Workflow', subtitle: 'Static analysis and leak detection pipeline stages.' };
      case '/repositories':
        return { title: 'Repositories', subtitle: 'Monitored codebases and branch health status.' };
      case '/how-it-works':
      case '/app/how-it-works':
      case '/rules':
        return { title: 'How It Works', subtitle: 'Understand how LeakGuard analyzes Python resource lifecycles without executing your application.' };
      case '/analytics':
        return { title: 'Analytics', subtitle: 'Code health metrics and resolution trends.' };
      case '/reports':
        return { title: 'Reports', subtitle: 'Export JSON and SARIF static analysis diagnostics.' };
      case '/actions':
        return { title: 'GitHub Actions', subtitle: 'Automate static checks on pull requests and commits.' };
      case '/precommit':
        return { title: 'Pre-commit', subtitle: 'Inspect staged Python files before git commit.' };
      case '/cli':
        return { title: 'CLI', subtitle: 'Direct command-line execution and local development.' };
      case '/settings':
        return { title: 'Settings', subtitle: 'Manage workspace configuration and scanner options.' };
      default:
        return { title: 'Dashboard', subtitle: 'Security & Resource Analysis' };
    }
  };

  // Admin Page Title/Subtitle Meta
  const getAdminPageMeta = () => {
    switch (currentPath) {
      case '/admin':
      case '/admin/':
        return { title: 'Admin Overview', subtitle: 'Platform-wide security telemetry and resource metrics.' };
      case '/admin/scalability':
        return { title: 'Scalability Architecture', subtitle: 'Horizontal worker scaling, job queue depth, and throughput.' };
      case '/admin/cost-economics':
        return { title: 'Cost Economics', subtitle: 'Compute usage, estimated infrastructure cost, and AST pruning savings.' };
      case '/admin/user-interactions':
        return { title: 'User Interactions', subtitle: 'Audit log of scan executions, triaged findings, and rule changes.' };
      case '/admin/system-health':
        return { title: 'System Health', subtitle: 'Live operational telemetry, health checks, and service response times.' };
      case '/admin/settings':
        return { title: 'Admin Settings', subtitle: 'Manage platform security policies, scanner thresholds, and RBAC.' };
      default:
        return { title: 'Admin Console', subtitle: 'Platform Management' };
    }
  };

  return (
    <>
      {/* ADMIN CONSOLE VIEW */}
      {isAdminRoute ? (
        isUnauthorized ? (
          <AdminUnauthorizedPage
            onBackToApp={() => navigateTo('/app')}
            onElevateAdmin={() => {
              setUserRole('ADMIN');
              navigateTo('/admin');
            }}
          />
        ) : (
          <AdminLayout
            currentPath={currentPath}
            onNavigate={navigateTo}
            title={getAdminPageMeta().title}
            subtitle={getAdminPageMeta().subtitle}
            userRole={userRole}
            onToggleUserRole={handleToggleUserRole}
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode(prev => !prev)}
            onTriggerScan={() => setIsScanModalOpen(true)}
            onOpenSearch={() => setIsSearchOpen(true)}
          >
            {(currentPath === '/admin' || currentPath === '/admin/') && (
              <AdminOverviewPage
                onNavigate={navigateTo}
                onTriggerScan={() => setIsScanModalOpen(true)}
              />
            )}
            {currentPath === '/admin/scalability' && (
              <AdminScalabilityPage />
            )}
            {currentPath === '/admin/cost-economics' && (
              <AdminCostEconomicsPage />
            )}
            {currentPath === '/admin/user-interactions' && (
              <AdminUserInteractionsPage />
            )}
            {currentPath === '/admin/system-health' && (
              <AdminSystemHealthPage />
            )}
            {currentPath === '/admin/settings' && (
              <AdminSettingsPage />
            )}
          </AdminLayout>
        )
      ) : (
        /* USER / DEVELOPER VIEW */
        <div className="min-h-screen bg-slate-50 dark:bg-[#070a11] text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased transition-colors duration-200">
          <AppSidebar
            currentTab={currentPath === '/app' ? 'dashboard' : currentPath.replace('/', '')}
            onNavigate={(tab) => navigateTo(tab === 'dashboard' ? '/app' : `/${tab}`)}
            userRole={userRole}
            isOpen={mobileNavOpen}
            onClose={() => setMobileNavOpen(false)}
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode(prev => !prev)}
          />

          <div className="lg:pl-60 flex flex-col flex-1">
            <AppTopHeader
              title={getUserPageMeta().title}
              subtitle={getUserPageMeta().subtitle}
              userRole={userRole}
              onToggleUserRole={handleToggleUserRole}
              onOpenMobileNav={() => setMobileNavOpen(true)}
              onOpenSearch={() => setIsSearchOpen(true)}
              onTriggerScan={() => setIsScanModalOpen(true)}
            />

            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
              {loading ? (
                <LoadingSkeleton />
              ) : (
                <>
                  {(currentPath === '/app' || currentPath === '/dashboard' || currentPath === '/') && (
                    <DashboardOverviewPage
                      stats={stats}
                      scans={scans}
                      projects={projects}
                      onTriggerScan={() => setIsScanModalOpen(true)}
                      onNavigateTab={(tab) => navigateTo(`/${tab}`)}
                      onSelectFinding={handleSelectFinding}
                    />
                  )}

                  {currentPath === '/scans' && (
                    <ScansHistoryPage
                      scans={scans}
                      onTriggerScan={() => setIsScanModalOpen(true)}
                      onSelectScan={() => setIsScanModalOpen(true)}
                    />
                  )}

                  {currentPath === '/findings' && (
                    <FindingsListPage
                      issues={allIssues}
                      onSelectIssue={handleSelectFinding}
                    />
                  )}

                  {currentPath === '/findings/detail' && (
                    <FindingDetailPage
                      finding={selectedFinding}
                      onBack={() => navigateTo('/findings')}
                      onReScan={() => setIsScanModalOpen(true)}
                    />
                  )}

                  {currentPath === '/workflow' && (
                    <WorkflowPage
                      onTriggerScan={() => setIsScanModalOpen(true)}
                    />
                  )}

                  {currentPath === '/repositories' && (
                    <RepositoriesListPage
                      projects={projects}
                      onTriggerScan={() => setIsScanModalOpen(true)}
                    />
                  )}

                  {(currentPath === '/how-it-works' || currentPath === '/app/how-it-works' || currentPath === '/rules') && (
                    <HowItWorksPage
                      onTriggerScan={() => setIsScanModalOpen(true)}
                      onNavigateTab={(tab) => navigateTo(`/${tab}`)}
                    />
                  )}

                  {currentPath === '/analytics' && (
                    <AnalyticsPage viewMode="health" />
                  )}

                  {currentPath === '/reports' && (
                    <ReportsHubPage />
                  )}

                  {(currentPath === '/actions' || currentPath === '/precommit' || currentPath === '/cli') && (
                    <IntegrationsHubPage />
                  )}

                  {currentPath === '/settings' && (
                    <SettingsPage health={mockHealth} />
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      )}

      {/* Active Scan Modal */}
      <ActiveScanModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        onScanComplete={handleScanCompleted}
        onViewFinding={handleSelectFinding}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelect={(secId) => {
          navigateTo(secId.startsWith('/') ? secId : `/${secId}`);
          setIsSearchOpen(false);
        }}
        searchIndex={searchIndex}
      />
    </>
  );
};
