export type Severity = 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
export type Confidence = 'DEFINITE' | 'LIKELY' | 'SAFE' | 'UNKNOWN';
export type ScanStatus = 'PASS' | 'BLOCKED' | 'WARNING' | 'RUNNING';

export interface CFGNode {
  id: number;
  label: string;
  type: 'acquisition' | 'branch' | 'return' | 'cleanup' | 'exit' | 'statement';
  line?: number | null;
  is_exit?: boolean;
  is_leaking?: boolean;
  next_ids?: number[];
  exception_ids?: number[];
}

export interface IssueFinding {
  id: string;
  file: string;
  resource_type: string;
  variable_name: string;
  line: number;
  column: number;
  severity: Severity;
  confidence: Confidence;
  reason: string;
  path: number[];
  suggestion: string;
  code_snippet?: string;
  snippet_start_line?: number;
  why_flagged?: string;
  cfg_nodes?: CFGNode[];
  status?: string;
  assigned_to?: string | null;
}

export interface ScanSummary {
  files_scanned: number;
  resources_detected: number;
  definite_leaks: number;
  likely_leaks: number;
  unknown: number;
  safe_patterns: number;
  duration_ms: number;
  status: ScanStatus;
}

export interface ScanResult {
  id: string;
  project_name: string;
  target_path: string;
  branch: string;
  commit: string;
  timestamp: string;
  status: ScanStatus;
  duration_ms: number;
  summary: ScanSummary;
  findings: IssueFinding[];
}

export interface Project {
  id: string;
  name: string;
  path: string;
  repository: string;
  branch: string;
  last_scan?: string;
  files_count: number;
  issues_count: number;
  definite_count: number;
  status: ScanStatus;
  risk_level: 'Low' | 'Medium' | 'High';
}

export interface ResourceRule {
  name: string;
  acquire: string[];
  release: string[];
  status: string;
  description: string;
}

export interface RulesConfig {
  resources: ResourceRule[];
  config_path: string;
}

export interface Integration {
  id: string;
  name: string;
  status: 'Available' | 'Connected' | 'Configured' | 'Not Configured';
  type: string;
  description: string;
  last_active?: string;
  details: Record<string, any>;
}

export interface HealthStatus {
  status: string;
  engine_online: boolean;
  api_online: boolean;
  rules_loaded: number;
  version: string;
  active_scans: number;
  system_time: string;
}

export interface ReportData {
  scan_id: string;
  format: 'json' | 'sarif' | 'text';
  content: string;
  filename: string;
  mime_type: string;
}

// Phase 8: Log Entry Model
export type LogEventType = 
  | 'SCAN_STARTED' 
  | 'SCAN_COMPLETED' 
  | 'FINDING_DETECTED' 
  | 'FINDING_ASSIGNED' 
  | 'STATUS_CHANGED' 
  | 'FINDING_FIXED' 
  | 'FINDING_VERIFIED' 
  | 'REPOSITORY_CONNECTED' 
  | 'GITHUB_EVENT';

export interface DeveloperProfile {
  name: string;
  email: string;
  avatar: string;
  role: string;
}

export interface LogEntry {
  id: string;
  event: LogEventType;
  event_label: string;
  repository: string;
  developer: DeveloperProfile;
  severity: Severity;
  status: string;
  message: string;
  target_resource: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface LogFilters {
  repository: string;
  developer: string;
  severity: string;
  status: string;
  event: string;
  date: string;
  search: string;
}

// Phase 8: Baseline Models
export interface BaselineFinding {
  fingerprint: string;
  file: string;
  full_path?: string;
  line: number;
  column: number;
  resource_type: string;
  variable_name: string;
  severity: Severity;
  confidence: Confidence;
  reason: string;
  differential_status?: 'BASELINE_UNCHANGED' | 'NEW_REGRESSION' | 'RESOLVED_FIXED';
}

export interface BaselineSnapshot {
  id: string;
  name: string;
  repository_id: string;
  repository_name: string;
  branch: string;
  commit_sha: string;
  created_at: string;
  created_by: string;
  description: string;
  findings: BaselineFinding[];
}

export interface BaselineComparisonResult {
  baseline: {
    id: string;
    name: string;
    repository_name: string;
    created_at: string;
  };
  summary: {
    total_baseline_recorded: number;
    current_scan_total: number;
    baseline_findings_count: number;
    new_findings_count: number;
    resolved_findings_count: number;
  };
  baseline_findings: BaselineFinding[];
  new_findings: BaselineFinding[];
  resolved_findings: BaselineFinding[];
}
