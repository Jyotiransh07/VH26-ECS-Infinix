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
