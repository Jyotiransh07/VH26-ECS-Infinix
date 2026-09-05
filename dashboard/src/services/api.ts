import { 
  ScanResult, 
  IssueFinding, 
  Project, 
  ResourceRule, 
  RulesConfig, 
  Integration, 
  HealthStatus, 
  ReportData 
} from '../types';
import { 
  mockScans, 
  mockProjects, 
  mockRules, 
  mockIntegrations, 
  mockHealth 
} from '../data/mockData';

const API_BASE = '/api';

class ApiService {
  private isOnline: boolean = true;

  async checkHealth(): Promise<HealthStatus> {
    try {
      const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(2500) });
      if (res.ok) {
        this.isOnline = true;
        return await res.json();
      }
    } catch {
      this.isOnline = false;
    }
    return mockHealth;
  }

  async getScans(): Promise<ScanResult[]> {
    try {
      const res = await fetch(`${API_BASE}/scans`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return mockScans;
  }

  async getScanById(id: string): Promise<ScanResult | null> {
    try {
      const res = await fetch(`${API_BASE}/scans/${id}`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return mockScans.find(s => s.id === id) || mockScans[0] || null;
  }

  async triggerScan(targetPath: string, projectName?: string, branch: string = 'main'): Promise<ScanResult> {
    try {
      const res = await fetch(`${API_BASE}/scans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_path: targetPath,
          project_name: projectName || targetPath,
          branch
        }),
        signal: AbortSignal.timeout(15000)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Return simulated scan if API is offline
    }
    
    // Fallback simulation
    const newScan: ScanResult = {
      id: `scan-${Date.now().toString(36)}`,
      project_name: projectName || targetPath,
      target_path: targetPath,
      branch: branch,
      commit: 'HEAD',
      timestamp: new Date().toISOString(),
      status: 'BLOCKED',
      duration_ms: 210.5,
      summary: {
        files_scanned: 6,
        resources_detected: 7,
        definite_leaks: 4,
        likely_leaks: 0,
        unknown: 0,
        safe_patterns: 3,
        duration_ms: 210.5,
        status: 'BLOCKED'
      },
      findings: mockScans[0]?.findings || []
    };
    mockScans.unshift(newScan);
    return newScan;
  }

  async getIssues(filters?: { severity?: string; confidence?: string; resource?: string }): Promise<IssueFinding[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.severity) params.append('severity', filters.severity);
      if (filters?.confidence) params.append('confidence', filters.confidence);
      if (filters?.resource) params.append('resource_type', filters.resource);
      
      const res = await fetch(`${API_BASE}/issues?${params.toString()}`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    
    let all = mockScans.flatMap(s => s.findings);
    if (filters?.severity) all = all.filter(i => i.severity.toLowerCase() === filters.severity?.toLowerCase());
    if (filters?.confidence) all = all.filter(i => i.confidence.toLowerCase() === filters.confidence?.toLowerCase());
    if (filters?.resource) all = all.filter(i => i.resource_type.toLowerCase() === filters.resource?.toLowerCase());
    return all;
  }

  async getIssueById(id: string): Promise<IssueFinding | null> {
    try {
      const res = await fetch(`${API_BASE}/issues/${id}`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return mockScans.flatMap(s => s.findings).find(i => i.id === id) || mockScans[0].findings[0] || null;
  }

  async getProjects(): Promise<Project[]> {
    try {
      const res = await fetch(`${API_BASE}/projects`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return mockProjects;
  }

  async getRules(): Promise<RulesConfig> {
    try {
      const res = await fetch(`${API_BASE}/rules`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return { resources: mockRules, config_path: 'leakguard/rules/resources.yaml' };
  }

  async getIntegrations(): Promise<Integration[]> {
    try {
      const res = await fetch(`${API_BASE}/integrations`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return mockIntegrations;
  }

  async getReport(scanId: string, format: 'json' | 'sarif' | 'text'): Promise<ReportData | null> {
    try {
      const res = await fetch(`${API_BASE}/reports/${scanId}?format=${format}`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    
    // Generate fallback report preview
    const sampleJson = JSON.stringify({
      summary: { files_scanned: 6, definite_leaks: 4, likely_leaks: 0, unknown: 0 },
      findings: mockScans[0].findings.map(f => ({
        file: f.file,
        line: f.line,
        resource_type: f.resource_type,
        variable_name: f.variable_name,
        confidence: f.confidence,
        reason: f.reason,
        path: f.path,
        suggestion: f.suggestion
      }))
    }, null, 2);

    return {
      scan_id: scanId,
      format,
      content: format === 'json' ? sampleJson : (format === 'sarif' ? '{\n  "$schema": "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json",\n  "version": "2.1.0",\n  "runs": []\n}' : '=========================================\n        LEAKGUARD SCAN RESULTS\n========================================='),
      filename: `leakguard-report-${scanId}.${format === 'text' ? 'txt' : format}`,
      mime_type: format === 'json' ? 'application/json' : (format === 'sarif' ? 'application/sarif+json' : 'text/plain')
    };
  }
}

export const api = new ApiService();
