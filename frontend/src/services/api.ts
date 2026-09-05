import { 
  ScanResult, 
  IssueFinding, 
  Project, 
  HealthStatus, 
  ReportData,
  LogEntry,
  LogFilters,
  BaselineSnapshot,
  BaselineComparisonResult
} from '../types';
import { 
  mockScans, 
  mockProjects, 
  mockRules, 
  mockIntegrations, 
  mockHealth 
} from '../data/mockData';

const NODE_API_BASE = 'http://127.0.0.1:3001/api';

export interface DashboardStats {
  summary: {
    files_scanned: number;
    resources_detected: number;
    open_leaks: number;
    definite_leaks: number;
    likely_leaks: number;
    resolved_leaks: number;
    repository_health: number;
    resolution_rate: number;
  };
  latest_scans: ScanResult[];
  recent_leaks: IssueFinding[];
  activity: Array<{ id: string; timestamp: string; user: string; action: string; resource: string; status: string }>;
  repository_breakdown: Array<{ name: string; health: number; open_leaks: number; files: number; branch: string }>;
}

class ApiService {
  async checkHealth(): Promise<HealthStatus> {
    try {
      const res = await fetch(`${NODE_API_BASE}/health`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const data = await res.json();
        return {
          status: 'ok',
          engine_online: true,
          api_online: true,
          rules_loaded: 3,
          version: '1.0.0',
          active_scans: 0,
          system_time: data.timestamp
        };
      }
    } catch {
      // Fallback
    }
    return mockHealth;
  }

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const res = await fetch(`${NODE_API_BASE}/dashboard/stats`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('[API] Fallback to computed stats', e);
    }
    return {
      summary: {
        files_scanned: 6,
        resources_detected: 10,
        open_leaks: 4,
        definite_leaks: 4,
        likely_leaks: 0,
        resolved_leaks: 0,
        repository_health: 40,
        resolution_rate: 92
      },
      latest_scans: mockScans,
      recent_leaks: mockScans[0]?.findings || [],
      activity: [
        { id: '1', timestamp: new Date().toISOString(), user: 'Janson Williams', action: 'Executed static scan on sample-repo-python', resource: '4 leaks detected', status: 'COMPLETED' },
        { id: '2', timestamp: new Date(Date.now() - 900000).toISOString(), user: 'Elena Rostova', action: 'Triaged finding early_return.py', resource: 'File descriptor', status: 'TRIAGED' }
      ],
      repository_breakdown: [
        { name: 'sample-repo-python', health: 40, open_leaks: 4, files: 6, branch: 'main' },
        { name: 'demo-project', health: 95, open_leaks: 1, files: 1, branch: 'main' },
        { name: 'payment-service', health: 98, open_leaks: 0, files: 14, branch: 'production' }
      ]
    };
  }

  async getRepositories(): Promise<Project[]> {
    try {
      const res = await fetch(`${NODE_API_BASE}/repositories`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return mockProjects;
  }

  async getScans(): Promise<ScanResult[]> {
    try {
      const res = await fetch(`${NODE_API_BASE}/scans`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return mockScans;
  }

  async triggerScan(targetPath: string = 'sample-repo-python', projectName?: string, branch?: string): Promise<ScanResult> {
    try {
      const res = await fetch(`${NODE_API_BASE}/scans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          target_path: targetPath,
          repository_name: projectName || targetPath,
          branch: branch || 'main'
        })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error('[API] Scan failed', e);
    }
    return mockScans[0];
  }

  async getFindings(): Promise<IssueFinding[]> {
    try {
      const res = await fetch(`${NODE_API_BASE}/findings`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return mockScans.flatMap(s => s.findings);
  }

  async updateFindingStatus(findingId: string, status: string, assignedTo?: string): Promise<IssueFinding | null> {
    try {
      const res = await fetch(`${NODE_API_BASE}/findings/${findingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, assigned_to: assignedTo })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return null;
  }

  // Phase 8: Comprehensive Logs API
  async getLogs(filters?: Partial<LogFilters>): Promise<{ total: number; logs: LogEntry[] }> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        if (filters.repository && filters.repository !== 'ALL') params.append('repository', filters.repository);
        if (filters.developer && filters.developer !== 'ALL') params.append('developer', filters.developer);
        if (filters.severity && filters.severity !== 'ALL') params.append('severity', filters.severity);
        if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);
        if (filters.event && filters.event !== 'ALL') params.append('event', filters.event);
        if (filters.date && filters.date !== 'ALL') params.append('date', filters.date);
        if (filters.search) params.append('search', filters.search);
      }
      const res = await fetch(`${NODE_API_BASE}/logs?${params.toString()}`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('[API] Logs fetch failed, fallback', e);
    }
    return { total: 0, logs: [] };
  }

  async createLog(entry: Partial<LogEntry>): Promise<LogEntry | null> {
    try {
      const res = await fetch(`${NODE_API_BASE}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  }

  // Phase 8: Baselines API
  async getBaselines(): Promise<BaselineSnapshot[]> {
    try {
      const res = await fetch(`${NODE_API_BASE}/baselines`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) return await res.json();
    } catch {}
    return [];
  }

  async createBaseline(data: { name: string; repository_name: string; description?: string }): Promise<BaselineSnapshot | null> {
    try {
      const res = await fetch(`${NODE_API_BASE}/baselines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  }

  async compareBaseline(baselineId?: string): Promise<BaselineComparisonResult | null> {
    try {
      const param = baselineId ? `?baseline_id=${baselineId}` : '';
      const res = await fetch(`${NODE_API_BASE}/baselines/compare${param}`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  }

  async getReport(scanId: string, format: 'json' | 'sarif' | 'text' = 'json'): Promise<ReportData> {
    try {
      const res = await fetch(`${NODE_API_BASE}/reports/${scanId}?format=${format}`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) return await res.json();
    } catch {}
    return {
      scan_id: scanId,
      format,
      filename: `leakguard-report.${format}`,
      mime_type: 'application/json',
      content: JSON.stringify({ message: 'Offline report fallback' }, null, 2)
    };
  }

  async getRules() { return mockRules; }
  async getIntegrations() { return mockIntegrations; }
}

export const api = new ApiService();
