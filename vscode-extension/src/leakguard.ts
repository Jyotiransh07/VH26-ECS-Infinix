/**
 * LeakGuard data models matching the Python CLI JSON report schema.
 */

export type Severity = 'HIGH' | 'MEDIUM' | 'INFO' | 'LOW';

export type Confidence = 'DEFINITE' | 'LIKELY' | 'UNKNOWN' | 'SAFE';

export interface Finding {
    file: string;
    line: number;
    column: number;
    resource_type: string;
    variable_name: string;
    severity: Severity;
    confidence: Confidence;
    reason: string;
    path: number[];
    suggestion: string;
}

export interface ScanSummary {
    files_scanned: number;
    definite_leaks: number;
    likely_leaks: number;
    unknown: number;
}

export interface ScanReport {
    summary: ScanSummary;
    findings: Finding[];
}

export interface ScanOptions {
    configPath?: string;
    cwd?: string;
}
