import { ScanResult, Project, ResourceRule, Integration, HealthStatus } from '../types';

export const mockScans: ScanResult[] = [
  {
    id: 'scan-sample-01',
    project_name: 'sample-repo-python',
    target_path: 'sample-repo-python',
    branch: 'main',
    commit: 'f4a9b1c',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    status: 'BLOCKED',
    duration_ms: 184.2,
    summary: {
      files_scanned: 6,
      resources_detected: 7,
      definite_leaks: 4,
      likely_leaks: 0,
      unknown: 0,
      safe_patterns: 3,
      duration_ms: 184.2,
      status: 'BLOCKED',
    },
    findings: [
      {
        id: 'issue-sample-01',
        file: 'sample-repo-python/early_return.py',
        resource_type: 'file',
        variable_name: 'f',
        line: 2,
        column: 4,
        severity: 'HIGH',
        confidence: 'DEFINITE',
        reason: 'Early return or branch bypasses resource cleanup.',
        path: [4, 5, 6],
        suggestion: 'Consider using a context manager (`with` statement) to automatically manage this resource.',
        code_snippet: `def process_file(data_path, is_valid):\n    f = open(data_path, 'r')\n    header = f.readline()\n    if not is_valid:\n        return None\n    \n    content = f.read()\n    f.close()\n    return content`,
        snippet_start_line: 1,
        why_flagged: "The resource 'f' of type 'file' is acquired at line 2, but an execution path (Line 4 -> Line 5 -> Line 6 -> EXIT) can terminate or return from the function scope before reaching the close() statement at line 8.",
        cfg_nodes: [
          { id: 1, label: "Acquire File ('f')", type: 'acquisition', line: 2, is_exit: false, is_leaking: false, next_ids: [2, 99] },
          { id: 2, label: "Line 4: if not is_valid", type: 'branch', line: 4, is_exit: false, is_leaking: true, next_ids: [3] },
          { id: 3, label: "Line 5: return None (Early Return)", type: 'return', line: 5, is_exit: false, is_leaking: true, next_ids: [4] },
          { id: 4, label: "EXIT: Resource 'f' remains open!", type: 'exit', line: null, is_exit: true, is_leaking: true, next_ids: [] },
          { id: 99, label: "Line 8: f.close() [Safe Path]", type: 'cleanup', line: 8, is_exit: false, is_leaking: false, next_ids: [100] },
          { id: 100, label: "Normal Function Exit", type: 'exit', line: null, is_exit: true, is_leaking: false, next_ids: [] }
        ]
      },
      {
        id: 'issue-sample-02',
        file: 'sample-repo-python/exception_path.py',
        resource_type: 'sqlite_connection',
        variable_name: 'conn',
        line: 4,
        column: 4,
        severity: 'HIGH',
        confidence: 'DEFINITE',
        reason: 'Early return or branch bypasses resource cleanup.',
        path: [6, 7, 16],
        suggestion: 'Consider using a context manager (`with` statement) to automatically manage this resource.',
        code_snippet: `import sqlite3\n\ndef query_database(db_path):\n    conn = sqlite3.connect(db_path)\n    cursor = conn.cursor()\n    try:\n        cursor.execute("SELECT * FROM sensitive_records")\n        data = cursor.fetchall()\n    except Exception:\n        return []\n    \n    conn.close()\n    return data`,
        snippet_start_line: 1,
        why_flagged: "The SQLite connection 'conn' is initialized at line 4. An exception handled in the try block returns immediately at line 10 without releasing the active database descriptor.",
        cfg_nodes: [
          { id: 1, label: "Acquire sqlite_connection ('conn')", type: 'acquisition', line: 4, is_exit: false, is_leaking: false, next_ids: [2, 99] },
          { id: 2, label: "Line 6: try block exception", type: 'branch', line: 6, is_exit: false, is_leaking: true, next_ids: [3] },
          { id: 3, label: "Line 10: return []", type: 'return', line: 10, is_exit: false, is_leaking: true, next_ids: [4] },
          { id: 4, label: "EXIT: DB Connection Leaked", type: 'exit', line: null, is_exit: true, is_leaking: true, next_ids: [] },
          { id: 99, label: "Line 12: conn.close()", type: 'cleanup', line: 12, is_exit: false, is_leaking: false, next_ids: [100] },
          { id: 100, label: "Normal Exit", type: 'exit', line: null, is_exit: true, is_leaking: false, next_ids: [] }
        ]
      },
      {
        id: 'issue-sample-03',
        file: 'sample-repo-python/missing_close.py',
        resource_type: 'socket',
        variable_name: 's',
        line: 4,
        column: 4,
        severity: 'HIGH',
        confidence: 'DEFINITE',
        reason: 'Early return or branch bypasses resource cleanup.',
        path: [5, 6, 8],
        suggestion: 'Consider using a context manager (`with` statement) to automatically manage this resource.',
        code_snippet: `import socket\n\ndef send_telemetry(payload):\n    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)\n    s.connect(("telemetry.internal", 9000))\n    s.sendall(payload)\n    # Missing s.close()\n    return True`,
        snippet_start_line: 1,
        why_flagged: "The TCP socket 's' is opened at line 4 and used for packet transmission. The function returns at line 8 without ever calling s.close().",
        cfg_nodes: [
          { id: 1, label: "Acquire Socket ('s')", type: 'acquisition', line: 4, is_exit: false, is_leaking: false, next_ids: [2] },
          { id: 2, label: "Line 8: return True", type: 'return', line: 8, is_exit: false, is_leaking: true, next_ids: [3] },
          { id: 3, label: "EXIT: Socket Descriptor Leak", type: 'exit', line: null, is_exit: true, is_leaking: true, next_ids: [] }
        ]
      },
      {
        id: 'issue-sample-04',
        file: 'sample-repo-python/reassigned.py',
        resource_type: 'file',
        variable_name: 'f',
        line: 2,
        column: 4,
        severity: 'HIGH',
        confidence: 'DEFINITE',
        reason: 'Resource variable is reassigned before cleanup, losing the reference.',
        path: [4],
        suggestion: 'Consider using a context manager (`with` statement) to automatically manage this resource.',
        code_snippet: `def stream_records(path1, path2):\n    f = open(path1, 'r')\n    # f is reassigned before previous file handle is closed\n    f = open(path2, 'r')\n    data = f.read()\n    f.close()\n    return data`,
        snippet_start_line: 1,
        why_flagged: "The file handle 'f' allocated at line 2 is overwritten at line 4 by a new open() call before the original stream is closed, causing an irrecoverable resource descriptor leak.",
        cfg_nodes: [
          { id: 1, label: "Acquire File 1 ('f')", type: 'acquisition', line: 2, is_exit: false, is_leaking: false, next_ids: [2] },
          { id: 2, label: "Line 4: f = open(path2) [Reassigned]", type: 'statement', line: 4, is_exit: false, is_leaking: true, next_ids: [3] },
          { id: 3, label: "EXIT: Initial Handle Orphaned", type: 'exit', line: null, is_exit: true, is_leaking: true, next_ids: [] }
        ]
      }
    ]
  }
];

export const mockProjects: Project[] = [
  {
    id: 'proj-sample-python',
    name: 'sample-repo-python',
    path: 'sample-repo-python',
    repository: 'Jyotiransh07/VH26-ECS-Infinix',
    branch: 'main',
    last_scan: '2m ago',
    files_count: 6,
    issues_count: 4,
    definite_count: 4,
    status: 'BLOCKED',
    risk_level: 'High'
  },
  {
    id: 'proj-demo-project',
    name: 'demo-project',
    path: 'demo-project',
    repository: 'Jyotiransh07/VH26-ECS-Infinix',
    branch: 'feature/leak-fixes',
    last_scan: '10m ago',
    files_count: 1,
    issues_count: 1,
    definite_count: 1,
    status: 'BLOCKED',
    risk_level: 'Medium'
  },
  {
    id: 'proj-leakguard-core',
    name: 'leakguard-core',
    path: 'leakguard',
    repository: 'Jyotiransh07/VH26-ECS-Infinix',
    branch: 'main',
    last_scan: '1h ago',
    files_count: 18,
    issues_count: 0,
    definite_count: 0,
    status: 'PASS',
    risk_level: 'Low'
  }
];

export const mockRules: ResourceRule[] = [
  {
    name: 'file',
    acquire: ['open'],
    release: ['close'],
    status: 'Enabled',
    description: 'Tracks standard Python open() file streams and ensures close() is reached.'
  },
  {
    name: 'socket',
    acquire: ['socket.socket'],
    release: ['close'],
    status: 'Enabled',
    description: 'Tracks network socket allocations and guarantees descriptor cleanup.'
  },
  {
    name: 'sqlite_connection',
    acquire: ['sqlite3.connect'],
    release: ['close'],
    status: 'Enabled',
    description: 'Monitors SQLite database handles to prevent unclosed connection locks.'
  }
];

export const mockIntegrations: Integration[] = [
  {
    id: 'cli',
    name: 'LeakGuard CLI',
    status: 'Available',
    type: 'Command Line Tool',
    description: 'Run static resource leak analysis directly in your local terminal or CI script.',
    last_active: 'Active',
    details: {
      command: 'leakguard scan .',
      formats: ['text', 'json', 'sarif']
    }
  },
  {
    id: 'github',
    name: 'GitHub Actions',
    status: 'Connected',
    type: 'CI/CD Pipeline',
    description: 'Automatically scan pull requests and pushes, blocking PRs with definite resource leaks.',
    last_active: 'Configured (action.yml)',
    details: {
      workflow: '.github/workflows/leakguard.yml'
    }
  },
  {
    id: 'precommit',
    name: 'Pre-commit Hook',
    status: 'Available',
    type: 'Git Hook',
    description: 'Catch unclosed files, sockets, and connections before git commit completes.',
    last_active: 'Ready',
    details: { hook_id: 'leakguard' }
  },
  {
    id: 'sarif',
    name: 'SARIF Code Scanning',
    status: 'Available',
    type: 'Security Standard',
    description: 'OASIS standard SARIF v2.1.0 output for native GitHub Security tab alerts and IDEs.',
    last_active: 'Ready',
    details: { version: '2.1.0' }
  },
  {
    id: 'fastapi',
    name: 'FastAPI Engine Bridge',
    status: 'Connected',
    type: 'REST API',
    description: 'Programmatic REST API to trigger scans, inspect CFGs, and export reports in real-time.',
    last_active: 'Port 8000',
    details: { status: 'Online' }
  }
];

export const mockHealth: HealthStatus = {
  status: 'ok',
  engine_online: true,
  api_online: true,
  rules_loaded: 3,
  version: '0.1.0',
  active_scans: 0,
  system_time: new Date().toISOString()
};
