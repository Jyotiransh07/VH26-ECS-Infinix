# LeakGuard for VS Code

**Find the leak before production does.**

LeakGuard is a static analysis extension for Visual Studio Code that automatically detects, traces, and fixes resource leaks in Python code directly inside the developer's editor.

---

## Overview

Resource leaks (unclosed file descriptors, lingering network sockets, orphaned database connections) are among the most pernicious bugs in backend engineering. They frequently pass unit tests because programs work initially, only to cause resource exhaustion, cascading timeouts, and server outages once deployed to production.

The **LeakGuard VS Code Extension** integrates directly with the Python LeakGuard static analysis engine. It provides immediate in-editor squiggles, rich hover explanations, an interactive visual security dashboard, Activity Bar sidebar navigation, and safe one-click Quick Fixes.

---

## Why LeakGuard?

Most linting tools simply tell you:
> *"Resource leak detected."*

**LeakGuard tells you:**
1. **WHAT** leaked: Variable name and resource type (`File 'f'`, `Socket 's'`, `SQLite 'conn'`).
2. **WHERE** it leaked: The exact file, line number, and column where the resource was acquired.
3. **WHY** it leaked: The structural reason (e.g. *"Early return or branch bypasses resource cleanup"*).
4. **HOW** execution reached the leak: The full Control Flow Graph (CFG) execution path leading to function exit without cleanup (`4 → 5 → EXIT`).
5. **HOW** to fix it: Actionable context manager recommendations and safe one-click Quick Fixes.

---

## Features

- 🛡️ **Zero-Runtime Static Analysis**: Analyzes Python AST and Control Flow Graphs without executing untrusted code or introducing runtime overhead.
- ⚡ **Real-Time Diagnostics**: Inline problem markers highlighting leaks with severity mapping (`HIGH` → Error, `MEDIUM` → Warning, `INFO` → Information).
- 🔍 **Execution Path Inspection**: Each step along the leaking execution path is linked directly into VS Code's Problems panel via `DiagnosticRelatedInformation`.
- 📊 **Interactive Security Dashboard**: Native VS Code Webview with real-time issue statistics, resource health breakdown, top issues table, and interactive leak path flowcharts.
- 📂 **Activity Bar & Sidebar Explorer**: Dedicated sidebar tree view categorizing issues into Overview, Critical, Warnings, and Suggestions with click-to-line editor navigation.
- 💡 **Safe Quick Fixes**: One-click refactoring from unsafe resource assignments (`f = open(...)`) to managed Python context managers (`with open(...) as f:`).
- 💬 **Rich Markdown Hovers**: Hover over any flagged resource to see opened lines, severity, leak paths, reasons, and remediation guidance.
- 💾 **Automated Scan on Save**: Asynchronously scans saved Python files with 350ms debouncing and active process concurrency locks.
- 📤 **SARIF 2.1.0 Export**: Full compatibility with GitHub Code Scanning, SonarQube, and CI/CD security pipelines.

---

## Architecture

The extension is designed around a clean client-engine architecture:

```
┌────────────────────────────────────────────────────────┐
│                   VS Code Extension                    │
│      (Diagnostics, Hover, Sidebar, Dashboard, Fix)    │
└───────────────────────────┬────────────────────────────┘
                            │ triggers
                            ▼
┌────────────────────────────────────────────────────────┐
│                   TypeScript Scanner                   │
│   (Locates Python / venv / CLI, manages child process) │
└───────────────────────────┬────────────────────────────┘
                            │ executes: leakguard scan <target> --format json
                            ▼
┌────────────────────────────────────────────────────────┐
│                Existing LeakGuard CLI                  │
│        (Python AST Parser + CFG Path Analyzer)         │
└───────────────────────────┬────────────────────────────┘
                            │ returns structured JSON / SARIF stdout
                            ▼
┌────────────────────────────────────────────────────────┐
│                   TypeScript Parser                    │
│    (Validates schema, normalizes paths, maps errors)   │
└───────────────────────────┬────────────────────────────┘
                            │ updates
                            ▼
┌────────────────────────────────────────────────────────┐
│                     VS Code APIs                       │
│  - vscode.languages.DiagnosticCollection               │
│  - vscode.window.createWebviewPanel (Dashboard)        │
│  - vscode.window.registerTreeDataProvider (Sidebar)    │
│  - vscode.languages.registerCodeActionsProvider (Fix)  │
│  - vscode.window.createStatusBarItem                   │
└────────────────────────────────────────────────────────┘
```

The Python LeakGuard engine remains the **single source of truth**. The TypeScript extension does not duplicate any static analysis or CFG logic.

---

## Installation

### From VSIX Package
1. Download the latest `leakguard-vscode-0.0.1.vsix` package.
2. In VS Code, open the Extensions panel (`Ctrl+Shift+X` / `Cmd+Shift+X`).
3. Click the `...` menu in the top-right corner of the Extensions panel and select **Install from VSIX...**.
4. Select `leakguard-vscode-0.0.1.vsix`.

Alternatively, install via terminal:
```bash
code --install-extension leakguard-vscode-0.0.1.vsix
```

---

## Requirements

- **Visual Studio Code**: `v1.85.0` or higher.
- **Python**: Python 3.8+ installed on your system.
- **LeakGuard**: The Python `leakguard` package installed in your active virtual environment or global Python environment:
  ```bash
  pip install .
  # or
  pip install leakguard
  ```

---

## Configuration

Customize LeakGuard under **Settings (`Ctrl+,` / `Cmd+,`) → Extensions → LeakGuard**:

| Setting | Type | Default | Description |
|---|---|---|---|
| `leakguard.enabled` | `boolean` | `true` | Enable or disable LeakGuard static analysis. |
| `leakguard.scanOnSave` | `boolean` | `true` | Automatically scan Python files when saved. |
| `leakguard.scanWorkspaceOnOpen` | `boolean` | `false` | Automatically scan the entire workspace when opened. |
| `leakguard.pythonPath` | `string` | `""` | Custom path to the Python interpreter. |
| `leakguard.cliPath` | `string` | `""` | Custom path to the `leakguard` CLI executable or script. |
| `leakguard.severityThreshold` | `string` | `"INFO"` | Minimum severity to display (`"INFO"`, `"MEDIUM"`, or `"HIGH"`). |
| `leakguard.showStatusBar` | `boolean` | `true` | Show status indicator and issue counts in the status bar. |
| `leakguard.autoOpenDashboard` | `boolean` | `false` | Automatically open the dashboard when critical leaks are found. |
| `leakguard.configPath` | `string` | `""` | Optional path to a custom `resources.yaml` configuration. |
| `leakguard.timeout` | `number` | `15000` | Process execution timeout in milliseconds. |

---

## Commands

Access all commands from the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`):

| Command | Identifier | Shortcut | Description |
|---|---|---|---|
| **LeakGuard: Scan Current File** | `leakguard.scanFile` | `Ctrl+Shift+L` | Scans the currently active Python file. |
| **LeakGuard: Scan Workspace** | `leakguard.scanWorkspace` | — | Scans all Python files across the workspace. |
| **LeakGuard: Open Dashboard** | `leakguard.openDashboard` | — | Opens the interactive visual security dashboard. |
| **LeakGuard: Clear Results** | `leakguard.clearResults` | — | Clears all diagnostics and resets counts. |
| **LeakGuard: Export Report** | `leakguard.exportReport` | — | Exports findings as SARIF 2.1.0 or JSON. |
| **LeakGuard: Export SARIF Report** | `leakguard.exportSarif` | — | Directly exports scan results in SARIF format. |

---

## Usage

### Scanning a File
1. Open any Python file (e.g. `demo-project/example.py`).
2. Press **`Ctrl+Shift+L`** (or `Cmd+Shift+L` on macOS).
3. LeakGuard scans the file and displays inline error squiggles on unclosed resources.

### Viewing the Dashboard
- Click the `$(shield) LeakGuard` status bar item in the bottom-left corner, or run **LeakGuard: Open Dashboard**.
- View metrics, resource health counters, top issues, and interactive CFG execution flowcharts.

---

## Dashboard

The dashboard provides a developer-first security overview:
- **Metrics Grid**: Real counts of Total Issues, Critical Leaks, Warnings, Info, and Scanned Files.
- **Resource Breakdown**: Categorized tracking for Files, Network Sockets, SQLite Connections, and custom resources.
- **Top Issues Table**: Click any row or the `Jump ↗` button to navigate directly to the offending line in the editor.
- **Execution Path Flowchart**: Visualizes the path step-by-step:
  ```
  📦 1. Resource Acquired (Line 2: open())
       ↓
  🔀 2. Execution Branch (Line 4: if error)
       ↓
  🔀 3. Early Return (Line 5: return)
       ↓
  ⚠️ 4. Cleanup Skipped (.close() bypassed)
       ↓
  🚨 5. RESOURCE LEAK CONFIRMED
  ```
- **Action Toolbar**: Quickly scan the current file, scan the workspace, clear results, or export SARIF.

---

## Diagnostics

LeakGuard reports issues directly into the VS Code Problems panel:
- **HIGH (DEFINITE)**: Early return, branching, or reassignment guarantees that cleanup is bypassed. Displayed as an **Error**.
- **MEDIUM (LIKELY)**: Ownership was transferred to another function or exit is reachable without exception guarantees. Displayed as a **Warning**.
- **INFO (LOW)**: Informational notice or unverified path. Displayed as **Information**.

Each diagnostic contains:
- The resource variable and type
- The reason cleanup was bypassed
- The exact execution line path (`4 → 5 → EXIT`)
- Actionable remediation advice

---

## Quick Fix

Place your cursor on any flagged line and press **`Ctrl+.`** (or `Cmd+.` on macOS):
- **`LeakGuard: Refactor to Context Manager`**: Automatically refactors raw allocations (`f = open(...)`) into safe Python context managers (`with open(...) as f:`).
- **`LeakGuard: Open Fix Suggestion`**: Shows detailed remediation advice in an informational dialog.
- **`LeakGuard: Inspect Leaking Path in Dashboard`**: Opens the security dashboard focused on the selected issue.

*Note: Automated code transformations are only generated for safe, unambiguous assignments to prevent code corruption.*

---

## SARIF

LeakGuard natively outputs standard **SARIF 2.1.0** (Static Analysis Results Interchange Format):
- Export directly from VS Code via **LeakGuard: Export Report → SARIF**.
- Compatible with GitHub Code Scanning, SonarQube, DefectDojo, and Azure DevOps.

---

## GitHub Actions

The same LeakGuard engine that powers this VS Code extension runs seamlessly in CI/CD pipelines.

Example workflow (`.github/workflows/leakguard.yml`):
```yaml
name: LeakGuard Security Gate

on: [push, pull_request]

permissions:
  contents: read
  security-events: write

jobs:
  leakguard:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - name: Install dependencies
        run: pip install .
      - name: Scan with LeakGuard (SARIF)
        run: leakguard scan . --format sarif > leakguard-results.sarif
        continue-on-error: true
      - name: Upload to GitHub Code Scanning
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: leakguard-results.sarif
      - name: Enforce Security Gate
        run: leakguard scan .
```

---

## Development

```bash
# Clone the repository
git clone https://github.com/Jyotiransh07/VH26-ECS-Infinix.git
cd VH26-ECS-Infinix/vscode-extension

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Run in watch mode during development
npm run watch
```

Press **`F5`** in VS Code to launch the **Extension Development Host**.

---

## Testing

```bash
# Run extension unit and integration tests
npm run test

# Run Python engine tests
pytest tests
```

---

## Packaging

To package into a standalone VSIX installer:
```bash
npm run package
```
This produces `leakguard-vscode-0.0.1.vsix`.

---

## Troubleshooting

### LeakGuard Executable Not Found
1. Ensure Python 3.8+ is installed.
2. Ensure LeakGuard is installed in your active virtualenv: `pip install .`
3. If using a custom virtual environment, specify its path in `leakguard.pythonPath` or `leakguard.cliPath`.

### Unicode Issues on Windows
LeakGuard automatically sets `PYTHONUTF8=1` in child processes to ensure UTF-8 emoji and terminal characters are decoded cleanly without Windows `cp1252` encoding errors.

### Checking Extension Logs
Open the **Output panel (`Ctrl+Shift+U`)** and select **LeakGuard** from the dropdown menu to inspect real-time logs, process invocations, and error details.
