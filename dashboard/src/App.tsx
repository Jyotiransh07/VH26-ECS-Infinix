import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { ActiveScanModal } from './components/scans/ActiveScanModal';
import { OverviewPage } from './pages/OverviewPage';
import { ScansPage } from './pages/ScansPage';
import { IssuesPage } from './pages/IssuesPage';
import { IssueDetailsPage } from './pages/IssueDetailsPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { RulesPage } from './pages/RulesPage';
import { ControlFlowPage } from './pages/ControlFlowPage';
import { ReportsPage } from './pages/ReportsPage';
import { IntegrationsPage } from './pages/IntegrationsPage';
import { GitHubActionsPage } from './pages/GitHubActionsPage';
import { PreCommitPage } from './pages/PreCommitPage';
import { CliPage } from './pages/CliPage';
import { SettingsPage } from './pages/SettingsPage';

import { ScanResult, IssueFinding, Project, HealthStatus } from './types';
import { api } from './services/api';
import { mockHealth } from './data/mockData';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);

  const [scans, setScans] = useState<ScanResult[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [health, setHealth] = useState<HealthStatus>(mockHealth);
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);

  // Load initial data from API (or fallback)
  useEffect(() => {
    loadData();
    const interval = setInterval(checkEngineHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [healthRes, scansRes, projectsRes] = await Promise.all([
        api.checkHealth(),
        api.getScans(),
        api.getProjects()
      ]);
      setHealth(healthRes);
      setScans(scansRes);
      setProjects(projectsRes);
    } catch (e) {
      console.error("Error fetching initial dashboard data", e);
    }
  };

  const checkEngineHealth = async () => {
    const h = await api.checkHealth();
    setHealth(h);
  };

  const handleScanCompleted = (newScan: ScanResult) => {
    setScans(prev => [newScan, ...prev.filter(s => s.id !== newScan.id)]);
  };

  const handleSelectFinding = (findingId: string) => {
    setSelectedFindingId(findingId);
    setCurrentTab('issue-details');
  };

  const handleSelectScan = (scanId: string) => {
    const scan = scans.find(s => s.id === scanId);
    if (scan && scan.findings.length > 0) {
      setSelectedFindingId(scan.findings[0].id);
      setCurrentTab('issue-details');
    } else {
      setCurrentTab('reports');
    }
  };

  const allIssues: IssueFinding[] = scans.flatMap(s => s.findings);
  const selectedFinding = allIssues.find(i => i.id === selectedFindingId) || allIssues[0];

  const getPageTitle = () => {
    switch (currentTab) {
      case 'overview': return 'Security Overview';
      case 'scans': return 'Scans & Pipeline History';
      case 'issues': return 'Detected Issues Explorer';
      case 'issue-details': return 'Issue Root-Cause & Diagnostics';
      case 'projects': return 'Monitored Repositories';
      case 'rules': return 'Resource Rules Registry';
      case 'control-flow': return 'Control Flow Graph Visualizer';
      case 'reports': return 'Compliance & Export Reports';
      case 'integrations': return 'Integrations Hub';
      case 'github': return 'GitHub Actions CI/CD';
      case 'precommit': return 'Pre-commit Git Hook';
      case 'cli': return 'CLI Terminal Hub';
      case 'settings': return 'System Settings';
      case 'docs': return 'Engine Documentation';
      default: return 'LeakGuard Dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0d13] text-foreground flex flex-col font-sans">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onNavigate={(tab) => {
          if (tab === 'docs') {
            setCurrentTab('rules');
          } else {
            setCurrentTab(tab);
          }
        }}
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        engineOnline={health.engine_online}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <TopHeader
          title={getPageTitle()}
          subtitle="Static resource-leak detection & verification platform"
          onOpenMobileNav={() => setMobileNavOpen(true)}
          onTriggerScan={() => setIsScanModalOpen(true)}
          onOpenSettings={() => setCurrentTab('settings')}
          engineOnline={health.engine_online}
        />

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'overview' && (
            <OverviewPage
              scans={scans}
              projects={projects}
              onTriggerScan={() => setIsScanModalOpen(true)}
              onNavigateTab={(tab) => setCurrentTab(tab)}
              onSelectFinding={handleSelectFinding}
              onSelectScan={handleSelectScan}
            />
          )}

          {currentTab === 'scans' && (
            <ScansPage
              scans={scans}
              onTriggerScan={() => setIsScanModalOpen(true)}
              onSelectScan={handleSelectScan}
            />
          )}

          {currentTab === 'issues' && (
            <IssuesPage
              issues={allIssues}
              onSelectIssue={handleSelectFinding}
            />
          )}

          {currentTab === 'issue-details' && selectedFinding && (
            <IssueDetailsPage
              finding={selectedFinding}
              onBack={() => setCurrentTab('issues')}
              onReScan={() => setIsScanModalOpen(true)}
            />
          )}

          {currentTab === 'projects' && (
            <ProjectsPage
              projects={projects}
              onTriggerScan={() => setIsScanModalOpen(true)}
            />
          )}

          {currentTab === 'rules' && (
            <RulesPage />
          )}

          {currentTab === 'control-flow' && (
            <ControlFlowPage issues={allIssues} />
          )}

          {currentTab === 'reports' && (
            <ReportsPage scans={scans} />
          )}

          {currentTab === 'integrations' && (
            <IntegrationsPage onNavigateTab={(tab) => setCurrentTab(tab)} />
          )}

          {currentTab === 'github' && (
            <GitHubActionsPage />
          )}

          {currentTab === 'precommit' && (
            <PreCommitPage />
          )}

          {currentTab === 'cli' && (
            <CliPage />
          )}

          {currentTab === 'settings' && (
            <SettingsPage health={health} />
          )}
        </main>
      </div>

      {/* Active 10-Stage Pipeline Scan Modal */}
      <ActiveScanModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        onScanComplete={handleScanCompleted}
        onViewFinding={handleSelectFinding}
      />
    </div>
  );
};
