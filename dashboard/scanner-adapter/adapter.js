const { spawn } = require('child_process');
const path = require('path');
const crypto = require('crypto');

class LeakGuardScannerAdapter {
  constructor(options = {}) {
    this.pythonCommand = options.pythonCommand || 'python';
    this.workspaceRoot = options.workspaceRoot || path.resolve(__dirname, '../../');
    this.persistedScans = new Map();
    this.persistedFindings = new Map();
  }

  /**
   * Invokes the authoritative existing LeakGuard CLI:
   * python -m leakguard.cli scan <target_path> --format json
   */
  async executeScan(targetPath, metadata = {}) {
    const scanId = metadata.id || `scan-${crypto.randomUUID().slice(0, 8)}`;
    const repositoryId = metadata.repositoryId || 'repo-sample-python';
    const branch = metadata.branch || 'main';
    const commitSha = metadata.commitSha || 'f4a9b1c';
    const triggeredBy = metadata.triggeredBy || 'usr-101-janson';

    const scanRecord = {
      id: scanId,
      repository_id: repositoryId,
      target_path: targetPath,
      branch: branch,
      commit_sha: commitSha,
      triggered_by: triggeredBy,
      status: 'RUNNING',
      start_time: new Date().toISOString(),
      duration_ms: 0,
      summary: {
        files_scanned: 0,
        definite_leaks: 0,
        likely_leaks: 0,
        unknown: 0
      },
      findings: []
    };

    this.persistedScans.set(scanId, scanRecord);

    const startTime = Date.now();
    const resolvedTarget = path.isAbsolute(targetPath) ? targetPath : path.resolve(this.workspaceRoot, targetPath);

    return new Promise((resolve, reject) => {
      // Execute the EXACT existing command: python -m leakguard.cli scan <target> --format json
      const child = spawn(
        this.pythonCommand,
        ['-m', 'leakguard.cli', 'scan', resolvedTarget, '--format', 'json'],
        {
          cwd: this.workspaceRoot,
          env: { ...process.env, PYTHONPATH: this.workspaceRoot }
        }
      );

      let stdoutData = '';
      let stderrData = '';

      child.stdout.on('data', (data) => {
        stdoutData += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderrData += data.toString();
      });

      child.on('close', (code) => {
        const durationMs = Date.now() - startTime;
        scanRecord.duration_ms = durationMs;
        scanRecord.completed_at = new Date().toISOString();

        // Note: LeakGuard returns exit code 1 when definite leaks are found (security gate)
        // and exit code 0 when 0 definite leaks exist.
        if (code === 2) {
          scanRecord.status = 'FAILED';
          scanRecord.error = `Target path does not exist: ${targetPath}`;
          return resolve(scanRecord);
        }

        try {
          const parsed = JSON.parse(stdoutData.trim());
          scanRecord.status = 'COMPLETED';
          scanRecord.summary = {
            files_scanned: parsed.summary?.files_scanned || 0,
            definite_leaks: parsed.summary?.definite_leaks || 0,
            likely_leaks: parsed.summary?.likely_leaks || 0,
            unknown: parsed.summary?.unknown || 0
          };

          // Transform and persist authoritative findings with dashboard lifecycle metadata
          scanRecord.findings = (parsed.findings || []).map((f, idx) => {
            const findingId = `find-${scanId}-${idx + 1}`;
            const dashboardFinding = {
              id: findingId,
              scan_id: scanId,
              repository_id: repositoryId,
              file: f.file,
              line: f.line,
              column: f.column,
              resource_type: f.resource_type,
              variable_name: f.variable_name,
              severity: f.severity,
              confidence: f.confidence,
              reason: f.reason,
              leaking_path: f.path || [],
              suggestion: f.suggestion,
              // Dashboard Lifecycle metadata
              status: 'OPEN',
              assigned_to: null,
              created_at: new Date().toISOString()
            };
            this.persistedFindings.set(findingId, dashboardFinding);
            return dashboardFinding;
          });

          this.persistedScans.set(scanId, scanRecord);
          resolve(scanRecord);
        } catch (err) {
          scanRecord.status = 'FAILED';
          scanRecord.error = `Failed to parse JSON output: ${err.message}. Raw output: ${stdoutData}`;
          resolve(scanRecord);
        }
      });

      child.on('error', (err) => {
        scanRecord.status = 'FAILED';
        scanRecord.error = `Failed to spawn process: ${err.message}`;
        resolve(scanRecord);
      });
    });
  }

  getScan(scanId) {
    return this.persistedScans.get(scanId) || null;
  }

  getAllScans() {
    return Array.from(this.persistedScans.values()).reverse();
  }

  getFindings() {
    return Array.from(this.persistedFindings.values());
  }

  updateFindingStatus(findingId, newStatus, assignedTo = null) {
    const finding = this.persistedFindings.get(findingId);
    if (finding) {
      finding.status = newStatus;
      if (assignedTo !== null) finding.assigned_to = assignedTo;
      finding.updated_at = new Date().toISOString();
      return finding;
    }
    return null;
  }
}

module.exports = { LeakGuardScannerAdapter };
