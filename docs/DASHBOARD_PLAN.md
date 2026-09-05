# LEAKGUARD DASHBOARD — MASTER ARCHITECTURE & AUDIT PLAN

## 1. Existing Architecture & Complete Audit Findings

### Package Structure
```
leakguard/
├── __init__.py
├── cli.py                         # CLI entry point (argparse)
├── rules/
│   └── resources.yaml             # Configured resource rules (file, socket, sqlite_connection)
├── parser/
│   ├── __init__.py
│   └── python_parser.py           # AST parser producing ast.Module
├── detection/
│   ├── __init__.py
│   ├── resource_registry.py       # Loads YAML rules
│   ├── resource_detector.py       # Detects resource allocations from AST
│   └── cleanup_detector.py        # Detects explicit and context manager releases
├── analysis/
│   ├── __init__.py
│   ├── cfg.py                     # BasicBlock & ControlFlowGraph models
│   ├── cfg_builder.py             # AST -> CFG constructor
│   ├── path_analyzer.py           # BFS path analysis across CFG branches
│   └── analyzer.py                # High-level file/directory orchestrator
├── models/
│   ├── __init__.py
│   ├── location.py                # Location(line, column)
│   ├── resource.py                # Resource, ResourceState, Ownership, Confidence
│   └── finding.py                 # Finding model
└── reporting/
    ├── __init__.py
    ├── console.py                 # Text formatting
    ├── json_report.py             # Structured JSON serializer
    └── sarif.py                   # SARIF v2.1.0 serializer
```

### CLI Entry Point & Scan Command
- **Entry point**: `leakguard.cli:main` (callable via `python -m leakguard.cli` or `leakguard` command)
- **Scan command**:
  ```bash
  python -m leakguard.cli scan <target_path> --format [text|json|sarif] --config [config_path]
  ```
- **Exit codes**:
  - `0`: Scan completed with 0 definite leaks.
  - `1`: Scan completed with definite leaks found (security gate failure).
  - `2`: Path does not exist.

### Data Formats & Models
- **Resource Types** (defined in `leakguard/rules/resources.yaml`):
  1. `file` (acquired by `open`, released by `close`)
  2. `socket` (acquired by `socket.socket`, released by `close`)
  3. `sqlite_connection` (acquired by `sqlite3.connect`, released by `close`)
- **Severity Values**:
  - `HIGH`
  - `MEDIUM`
  - `LOW`
- **Confidence Values**:
  - `DEFINITE` (all paths or unconditional path lacks cleanup)
  - `LIKELY` (conditional branch bypasses cleanup or escaped reference)
  - `SAFE` (all paths guarantee cleanup)
  - `UNKNOWN` (unresolvable dynamic reflection)
- **Finding Structure**:
  - `file`: string (relative or absolute file path)
  - `line`: integer (1-indexed acquisition line)
  - `column`: integer (0-indexed column)
  - `resource_type`: string (`file` | `socket` | `sqlite_connection`)
  - `variable_name`: string (identifier name, e.g. `f`, `conn`, `s`)
  - `severity`: string (`HIGH` | `MEDIUM` | `LOW`)
  - `confidence`: string (`DEFINITE` | `LIKELY` | `UNKNOWN`)
  - `reason`: string (explanation of leak mechanism)
  - `path`: integer array (line numbers traversed, e.g. `[4, 5, 6]`)
  - `suggestion`: string (actionable remediation advice)

### JSON Output Format
```json
{
  "summary": {
    "files_scanned": 6,
    "definite_leaks": 4,
    "likely_leaks": 0,
    "unknown": 0
  },
  "findings": [
    {
      "file": "sample-repo-python\\early_return.py",
      "line": 2,
      "column": 4,
      "resource_type": "file",
      "variable_name": "f",
      "severity": "HIGH",
      "confidence": "DEFINITE",
      "reason": "Early return or branch bypasses resource cleanup.",
      "path": [4, 5, 6],
      "suggestion": "Consider using a context manager (`with` statement) to automatically manage this resource."
    }
  ]
}
```

### SARIF Output Format
- Schema: SARIF v2.1.0 (`https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json`)
- Rule ID: `RESOURCE_LEAK`
- Level: `error` (for `DEFINITE`) or `warning` (for `LIKELY`)

### GitHub Action & Workflows
- `action.yml`: Composite GitHub Action running `pip install .` and `leakguard scan ${{ inputs.target_dir }}`.
- `.github/workflows/leakguard.yml`: CI workflow running pytest, SARIF generation, upload to GitHub Code Scanning (`github/codeql-action/upload-sarif@v3`), and security gate enforcement.

### Test Suites
- Unit tests: `tests/unit/test_parser.py`, `test_resource_detection.py`, `test_cleanup_detection.py`, `test_cfg.py`, `test_path_analysis.py`.
- Integration tests: `tests/integration/test_cli.py`, `test_cli_extras.py`.
- Test fixtures: `tests/fixtures/leaks/` (9 leak patterns) and `tests/fixtures/safe/` (7 safe patterns).

### Demo Projects
- `sample-repo-python/`: 6 sample files demonstrating early return, exception path, missing close, and variable reassignment.
- `demo-project/`: Single-file demonstration project.

---

## 2. Existing Files That Must Remain Untouched (IMMUTABLE)

All existing repository files are strictly read-only:
```
leakguard/**                  (All 15 Python modules, YAML rules, and subpackages)
tests/**                      (All unit, integration, and fixture files)
sample-repo-python/**         (Sample repository files)
demo-project/**               (Demo project files)
action.yml                    (GitHub Action composite definition)
.github/workflows/**          (GitHub Actions CI workflows)
benchmark.py                  (Performance benchmark suite)
debug_cfg.py                  (CFG debugging script)
pyproject.toml                (Python package configuration)
README.md                     (Original repository documentation)
docs/MVP_REPORT.md            (Existing documentation)
docs/PRESENTATION_GUIDE.md    (Existing documentation)
docs/architecture.md          (Existing documentation)
docs/benchmark.md             (Existing documentation)
docs/limitations.md           (Existing documentation)
docs/test-results.md          (Existing documentation)
```

---

## 3. Safe Integration Points
1. **CLI Execution**: Dashboard adapter executes `python -m leakguard.cli scan <target> --format json`.
2. **Authoritative JSON Parsing**: Consumes the unmodified `summary` and `findings` JSON schema.
3. **Source Code Inspection**: Reads scanned source files strictly in read-only mode to render line numbers and leaking paths in Monaco Editor.
4. **Metadata Overlay**: Dashboard database attaches lifecycle statuses (`OPEN`, `TRIAGED`, `ASSIGNED`, `IN_PROGRESS`, `IGNORED`, `FIXED`, `VERIFIED`) and assignee comments without altering core engine finding records.

---

## 4. Dashboard Architecture & Visual Design (Brisk CRM-Inspired)
```
                    EXISTING LEAKGUARD CORE (IMMUTABLE)
                                    |
                                    | CLI Execution (python -m leakguard.cli)
                                    v
                       DASHBOARD SCANNER ADAPTER
                                    |
                                    v
                     NODE.JS / EXPRESS BACKEND API
                                    |
                                    v
                       SUPABASE POSTGRESQL + RLS
                                    |
                                    v
            REACT + TS + TAILWIND + SHADCN/UI DASHBOARD
                 (Brisk CRM Design System & Views)
```

---

## 5. Proposed New Directory Layout
```
dashboard/
├── backend/                      # Node.js / Express / TypeScript API server
│   ├── src/
│   │   ├── routes/              # /api/repositories, /api/scans, /api/findings, /api/admin
│   │   ├── services/            # Supabase service, auth middleware, audit logger
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
├── scanner-adapter/              # Isolated adapter invoking python -m leakguard.cli
│   ├── adapter.ts
│   └── runner.py
└── frontend/                     # React + Vite + Tailwind + shadcn/ui Dashboard
    ├── src/
    │   ├── components/
    │   │   ├── brisk/           # Brisk CRM UI cards, charts, and header widgets
    │   │   ├── kanban/          # Finding lifecycle Kanban board (Deals layout)
    │   │   ├── table/           # Filterable repository/findings table (Companies layout)
    │   │   ├── editor/          # Monaco Editor code viewer & leaking path visualizer
    │   │   └── admin/           # Admin system health matrix & scalability visualizer
    │   ├── pages/               # Dashboard, Repositories, Scans, Leaks, Reports, Admin
    │   ├── App.tsx
    │   └── main.tsx
    ├── package.json
    └── vite.config.ts
```

---

## 6. Exact LeakGuard Command for Dashboard Adapter
```bash
python -m leakguard.cli scan <target_path> --format json
```
