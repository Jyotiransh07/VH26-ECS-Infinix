# Changelog

All notable changes to the **LeakGuard** extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.1] - Initial Release

### Added
- **Python Static Analysis Engine Bridge**: Seamless integration with the Python LeakGuard engine executing AST + CFG path analysis without runtime execution.
- **Diagnostics Provider**: Real-time problem squiggles in the editor highlighting exact resource acquisition locations with severity mapping (`HIGH` -> Error, `MEDIUM` -> Warning, `INFO` -> Information).
- **Execution Path Tracing**: Leaking execution paths linked directly into VS Code's Problems panel via `DiagnosticRelatedInformation`.
- **Interactive Security Dashboard**: Native VS Code Webview displaying overview metrics, resource health counters, top issues, and interactive CFG execution flowcharts.
- **Activity Bar & Sidebar TreeView**: Dedicated LeakGuard explorer grouping issues by Critical, Warnings, and Suggestions with click-to-line editor navigation.
- **Quick Fix Code Actions**: Safe one-click refactoring from raw resource assignments (`f = open(...)`) to managed context managers (`with open(...) as f:`).
- **Rich Markdown Hovers**: Inspect opened line numbers, severity, leaking path (`4 → 5 → EXIT`), reason, and remediation suggestions directly in code.
- **Status Bar Integration**: Live indicator displaying clean states (`$(check)`), warnings (`$(warning)`), or critical errors (`$(error)`).
- **Automated Scan on Save**: Asynchronous, debounced scanning triggered upon saving Python files.
- **SARIF 2.1.0 Export**: Full compatibility with GitHub Code Scanning and CI/CD security workflows.
- **Configurable Settings**: Support for `enabled`, `scanOnSave`, `scanWorkspaceOnOpen`, `pythonPath`, `cliPath`, `severityThreshold`, `showStatusBar`, `autoOpenDashboard`, and `timeout`.
- **Keyboard Shortcut**: `Ctrl+Shift+L` / `Cmd+Shift+L` to immediately scan the active Python file.
