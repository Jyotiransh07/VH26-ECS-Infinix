import * as vscode from 'vscode';
import * as path from 'path';
import { ScanReport, Finding } from './leakguard';

export class LeakGuardDashboardPanel {
    public static currentPanel: LeakGuardDashboardPanel | undefined;
    private readonly panel: vscode.WebviewPanel;
    private readonly extensionUri: vscode.Uri;
    private currentReport: ScanReport | undefined;
    private selectedFindingIndex = 0;
    private disposables: vscode.Disposable[] = [];

    public static createOrShow(
        extensionUri: vscode.Uri,
        report: ScanReport | undefined,
        onMessage: (message: any) => void
    ): LeakGuardDashboardPanel {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (LeakGuardDashboardPanel.currentPanel) {
            LeakGuardDashboardPanel.currentPanel.panel.reveal(column);
            if (report) {
                LeakGuardDashboardPanel.currentPanel.update(report);
            }
            return LeakGuardDashboardPanel.currentPanel;
        }

        const panel = vscode.window.createWebviewPanel(
            'leakguardDashboard',
            '🛡️ LeakGuard Dashboard',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'resources')]
            }
        );

        LeakGuardDashboardPanel.currentPanel = new LeakGuardDashboardPanel(
            panel,
            extensionUri,
            report,
            onMessage
        );
        return LeakGuardDashboardPanel.currentPanel;
    }

    private constructor(
        panel: vscode.WebviewPanel,
        extensionUri: vscode.Uri,
        report: ScanReport | undefined,
        onMessage: (message: any) => void
    ) {
        this.panel = panel;
        this.extensionUri = extensionUri;
        this.currentReport = report;

        this.renderHtml();

        this.panel.onDidDispose(() => this.dispose(), null, this.disposables);

        this.panel.webview.onDidReceiveMessage(
            message => {
                if (message.type === 'selectFinding') {
                    this.selectedFindingIndex = Number(message.index ?? 0);
                    this.renderHtml();
                } else {
                    onMessage(message);
                }
            },
            null,
            this.disposables
        );
    }

    public update(report: ScanReport | undefined): void {
        this.currentReport = report;
        this.selectedFindingIndex = 0;
        this.renderHtml();
    }

    public dispose(): void {
        LeakGuardDashboardPanel.currentPanel = undefined;
        this.panel.dispose();
        while (this.disposables.length) {
            const d = this.disposables.pop();
            if (d) {
                d.dispose();
            }
        }
    }

    private renderHtml(): void {
        this.panel.webview.html = this.getHtmlContent();
    }

    private getHtmlContent(): string {
        const report = this.currentReport;
        const findings = report ? report.findings : [];
        const summary = report ? report.summary : { files_scanned: 0, definite_leaks: 0, likely_leaks: 0, unknown: 0 };

        const totalIssues = findings.length;
        const criticalCount = findings.filter(f => f.severity === 'HIGH').length;
        const warningCount = findings.filter(f => f.severity === 'MEDIUM').length;
        const infoCount = findings.filter(f => f.severity === 'LOW' || f.severity === 'INFO').length;

        // Resource health counts
        let fileLeaks = 0;
        let socketLeaks = 0;
        let sqliteLeaks = 0;
        let otherLeaks = 0;

        for (const f of findings) {
            const rt = f.resource_type.toLowerCase();
            if (rt.includes('file')) {
                fileLeaks++;
            } else if (rt.includes('socket')) {
                socketLeaks++;
            } else if (rt.includes('sqlite')) {
                sqliteLeaks++;
            } else {
                otherLeaks++;
            }
        }

        const selectedFinding: Finding | undefined = findings[this.selectedFindingIndex] || findings[0];

        const nonce = this.getNonce();

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LeakGuard Security Dashboard</title>
    <style>
        :root {
            --bg-color: var(--vscode-editor-background, #1e1e1e);
            --text-color: var(--vscode-editor-foreground, #d4d4d4);
            --card-bg: var(--vscode-sideBar-background, #252526);
            --card-border: var(--vscode-panel-border, #3c3c3c);
            --button-bg: var(--vscode-button-background, #0e639c);
            --button-hover: var(--vscode-button-hoverBackground, #1177bb);
            --button-fg: var(--vscode-button-foreground, #ffffff);
            --sec-btn-bg: var(--vscode-button-secondaryBackground, #3a3d41);
            --sec-btn-hover: var(--vscode-button-secondaryHoverBackground, #45494e);
            --sec-btn-fg: var(--vscode-button-secondaryForeground, #ffffff);
            --error-color: var(--vscode-errorForeground, #f14c4c);
            --warn-color: var(--vscode-editorWarning-foreground, #cca700);
            --info-color: var(--vscode-editorInfo-foreground, #3794ff);
            --success-color: var(--vscode-testing-iconPassed, #73c991);
        }

        body {
            background-color: var(--bg-color);
            color: var(--text-color);
            font-family: var(--vscode-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
            margin: 0;
            padding: 24px;
            line-height: 1.5;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid var(--card-border);
            padding-bottom: 16px;
            margin-bottom: 20px;
        }

        .header-title {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .header-title h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }

        .subtitle {
            margin: 4px 0 0 0;
            opacity: 0.75;
            font-size: 13px;
        }

        .toolbar {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            margin-bottom: 24px;
        }

        button {
            background-color: var(--button-bg);
            color: var(--button-fg);
            border: 1px solid transparent;
            padding: 7px 14px;
            font-size: 12px;
            font-weight: 500;
            border-radius: 3px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            transition: background-color 0.15s ease;
        }

        button:hover {
            background-color: var(--button-hover);
        }

        button.secondary {
            background-color: var(--sec-btn-bg);
            color: var(--sec-btn-fg);
        }

        button.secondary:hover {
            background-color: var(--sec-btn-hover);
        }

        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
            gap: 12px;
            margin-bottom: 24px;
        }

        .metric-card {
            background-color: var(--card-bg);
            border: 1px solid var(--card-border);
            border-radius: 4px;
            padding: 14px;
            text-align: center;
        }

        .metric-value {
            font-size: 26px;
            font-weight: 700;
            margin-top: 4px;
        }

        .metric-label {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            opacity: 0.75;
        }

        .text-error { color: var(--error-color); }
        .text-warn { color: var(--warn-color); }
        .text-info { color: var(--info-color); }
        .text-success { color: var(--success-color); }

        .section-title {
            font-size: 15px;
            font-weight: 600;
            margin: 24px 0 12px 0;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .health-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
            gap: 12px;
            margin-bottom: 24px;
        }

        .health-card {
            background-color: var(--card-bg);
            border: 1px solid var(--card-border);
            border-radius: 4px;
            padding: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .health-type {
            font-weight: 500;
            font-size: 13px;
        }

        .health-badge {
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 11px;
            font-weight: 600;
        }

        .badge-clean {
            background-color: rgba(115, 201, 145, 0.15);
            color: var(--success-color);
        }

        .badge-leaking {
            background-color: rgba(241, 76, 76, 0.15);
            color: var(--error-color);
        }

        .issues-table {
            width: 100%;
            border-collapse: collapse;
            background-color: var(--card-bg);
            border: 1px solid var(--card-border);
            border-radius: 4px;
            overflow: hidden;
            font-size: 12px;
            margin-bottom: 24px;
        }

        .issues-table th {
            background-color: rgba(255, 255, 255, 0.04);
            text-align: left;
            padding: 10px 14px;
            border-bottom: 1px solid var(--card-border);
            font-weight: 600;
        }

        .issues-table td {
            padding: 10px 14px;
            border-bottom: 1px solid var(--card-border);
        }

        .issues-table tr.selected {
            background-color: rgba(14, 99, 156, 0.2);
        }

        .issues-table tr:hover {
            background-color: rgba(255, 255, 255, 0.03);
            cursor: pointer;
        }

        .pill {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 3px;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
        }

        .pill-high {
            background-color: rgba(241, 76, 76, 0.2);
            color: var(--error-color);
            border: 1px solid var(--error-color);
        }

        .pill-medium {
            background-color: rgba(204, 167, 0, 0.2);
            color: var(--warn-color);
            border: 1px solid var(--warn-color);
        }

        .flowchart-container {
            background-color: var(--card-bg);
            border: 1px solid var(--card-border);
            border-radius: 4px;
            padding: 20px;
            margin-bottom: 24px;
        }

        .flow-steps {
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 600px;
            margin: 0 auto;
        }

        .flow-node {
            background-color: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--card-border);
            border-radius: 4px;
            padding: 12px 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .flow-node.start {
            border-left: 4px solid var(--info-color);
        }

        .flow-node.branch {
            border-left: 4px solid var(--warn-color);
        }

        .flow-node.danger {
            border-left: 4px solid var(--error-color);
            background-color: rgba(241, 76, 76, 0.1);
        }

        .flow-arrow {
            text-align: center;
            font-size: 16px;
            opacity: 0.6;
            margin: -4px 0;
        }

        .recommendation-box {
            background-color: var(--card-bg);
            border: 1px solid var(--card-border);
            border-left: 4px solid var(--success-color);
            border-radius: 4px;
            padding: 16px;
            margin-bottom: 24px;
        }

        .recommendation-box h4 {
            margin: 0 0 8px 0;
            font-size: 13px;
        }

        pre {
            background-color: rgba(0, 0, 0, 0.25);
            padding: 10px;
            border-radius: 3px;
            font-family: var(--vscode-editor-font-family, monospace);
            font-size: 12px;
            overflow-x: auto;
        }

        .empty-state {
            text-align: center;
            padding: 40px 20px;
            background-color: var(--card-bg);
            border: 1px dashed var(--card-border);
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-title">
            <span style="font-size: 28px;">🛡️</span>
            <div>
                <h1>LeakGuard</h1>
                <div class="subtitle">Find the leak before production does.</div>
            </div>
        </div>
        <div>
            <span class="pill ${criticalCount > 0 ? 'pill-high' : 'pill-medium'}">
                ${criticalCount > 0 ? 'Action Required' : (totalIssues > 0 ? 'Review Needed' : 'Protected')}
            </span>
        </div>
    </div>

    <div class="toolbar">
        <button id="btnScanFile"><span>🔍</span> Scan Current File</button>
        <button id="btnScanWorkspace"><span>📁</span> Scan Workspace</button>
        <button id="btnClear" class="secondary"><span>🧹</span> Clear Results</button>
        <button id="btnExport" class="secondary"><span>📤</span> Export SARIF</button>
    </div>

    <div class="metrics-grid">
        <div class="metric-card">
            <div class="metric-label">Total Issues</div>
            <div class="metric-value ${totalIssues > 0 ? 'text-error' : 'text-success'}">${totalIssues}</div>
        </div>
        <div class="metric-card">
            <div class="metric-label">Critical (Definite)</div>
            <div class="metric-value text-error">${criticalCount}</div>
        </div>
        <div class="metric-card">
            <div class="metric-label">Warnings (Likely)</div>
            <div class="metric-value text-warn">${warningCount}</div>
        </div>
        <div class="metric-card">
            <div class="metric-label">Info / Low</div>
            <div class="metric-value text-info">${infoCount}</div>
        </div>
        <div class="metric-card">
            <div class="metric-label">Files Scanned</div>
            <div class="metric-value">${summary.files_scanned}</div>
        </div>
    </div>

    <div class="section-title"><span>📊</span> Resource Health</div>
    <div class="health-grid">
        <div class="health-card">
            <span class="health-type">📄 Files</span>
            <span class="health-badge ${fileLeaks > 0 ? 'badge-leaking' : 'badge-clean'}">${fileLeaks} leaking</span>
        </div>
        <div class="health-card">
            <span class="health-type">🌐 Sockets</span>
            <span class="health-badge ${socketLeaks > 0 ? 'badge-leaking' : 'badge-clean'}">${socketLeaks} leaking</span>
        </div>
        <div class="health-card">
            <span class="health-type">🗄️ SQLite Connections</span>
            <span class="health-badge ${sqliteLeaks > 0 ? 'badge-leaking' : 'badge-clean'}">${sqliteLeaks} leaking</span>
        </div>
        <div class="health-card">
            <span class="health-type">📦 Other Resources</span>
            <span class="health-badge ${otherLeaks > 0 ? 'badge-leaking' : 'badge-clean'}">${otherLeaks} leaking</span>
        </div>
    </div>

    <div class="section-title"><span>🚨</span> Top Detected Issues (${totalIssues})</div>
    ${totalIssues === 0 ? `
        <div class="empty-state">
            <h3 class="text-success" style="margin:0 0 8px 0;">✅ All Resources Safely Managed</h3>
            <p style="margin:0; opacity: 0.8; font-size: 13px;">No resource leaks detected in the last scan. Run a scan on another file or directory.</p>
        </div>
    ` : `
        <table class="issues-table">
            <thead>
                <tr>
                    <th>Severity</th>
                    <th>Resource</th>
                    <th>File</th>
                    <th>Line</th>
                    <th>Reason</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                ${findings.map((f, idx) => `
                    <tr class="${idx === this.selectedFindingIndex ? 'selected' : ''}" data-index="${idx}">
                        <td><span class="pill ${f.severity === 'HIGH' ? 'pill-high' : 'pill-medium'}">${f.severity}</span></td>
                        <td><strong>${f.resource_type}</strong> (<code>${f.variable_name}</code>)</td>
                        <td>${path.basename(f.file)}</td>
                        <td>Line ${f.line}</td>
                        <td>${f.reason}</td>
                        <td><button class="secondary btn-jump" data-file="${escapeHtml(f.file)}" data-line="${f.line}" data-col="${f.column}">Jump ↗</button></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `}

    ${selectedFinding ? `
        <div class="section-title"><span>🛤️</span> Leak Execution Path Flowchart</div>
        <div class="flowchart-container">
            <div style="margin-bottom: 12px; font-size: 12px; opacity: 0.8;">
                Analyzing: <strong>${path.basename(selectedFinding.file)}</strong> (Resource <code>${selectedFinding.variable_name}</code> opened at Line ${selectedFinding.line})
            </div>
            <div class="flow-steps">
                <div class="flow-node start">
                    <div>
                        <strong>1. Resource Acquired</strong>
                        <div style="font-size: 11px; opacity: 0.8;">${selectedFinding.resource_type.toUpperCase()} '<code>${selectedFinding.variable_name}</code>' allocated</div>
                    </div>
                    <span class="pill pill-high">Line ${selectedFinding.line}</span>
                </div>

                <div class="flow-arrow">↓</div>

                ${selectedFinding.path && selectedFinding.path.length > 0 ? selectedFinding.path.map((pLine, pIdx) => `
                    <div class="flow-node branch">
                        <div>
                            <strong>${pIdx + 2}. Execution Branch / Jump</strong>
                            <div style="font-size: 11px; opacity: 0.8;">Control flow reached conditional or early exit statement</div>
                        </div>
                        <span class="pill pill-medium">Line ${pLine}</span>
                    </div>
                    <div class="flow-arrow">↓</div>
                `).join('') : `
                    <div class="flow-node branch">
                        <div>
                            <strong>2. Execution Path</strong>
                            <div style="font-size: 11px; opacity: 0.8;">Unconditional flow towards function exit</div>
                        </div>
                    </div>
                    <div class="flow-arrow">↓</div>
                `}

                <div class="flow-node branch">
                    <div>
                        <strong>Cleanup Skipped</strong>
                        <div style="font-size: 11px; opacity: 0.8;"><code>.close()</code> was never invoked along this CFG path</div>
                    </div>
                    <span class="pill pill-high">BYPASSED</span>
                </div>

                <div class="flow-arrow">↓</div>

                <div class="flow-node danger">
                    <div>
                        <strong class="text-error">🚨 RESOURCE LEAK CONFIRMED</strong>
                        <div style="font-size: 11px; opacity: 0.8;">${selectedFinding.reason}</div>
                    </div>
                    <span class="pill pill-high">EXIT</span>
                </div>
            </div>
        </div>

        <div class="recommendation-box">
            <h4>💡 Recommended Fix</h4>
            <p style="margin: 0 0 8px 0; font-size: 12px;">${selectedFinding.suggestion}</p>
            <pre><code># Recommended pattern:
with open(...) as ${selectedFinding.variable_name}:
    # Python will automatically close the resource on all paths and exceptions!
    process_data()</code></pre>
        </div>
    ` : ''}

    <script nonce="${nonce}">
        const vscode = acquireVsCodeApi();

        document.getElementById('btnScanFile').addEventListener('click', () => {
            vscode.postMessage({ type: 'scanFile' });
        });

        document.getElementById('btnScanWorkspace').addEventListener('click', () => {
            vscode.postMessage({ type: 'scanWorkspace' });
        });

        document.getElementById('btnClear').addEventListener('click', () => {
            vscode.postMessage({ type: 'clearResults' });
        });

        document.getElementById('btnExport').addEventListener('click', () => {
            vscode.postMessage({ type: 'exportSarif' });
        });

        document.querySelectorAll('.issues-table tbody tr').forEach(row => {
            row.addEventListener('click', (e) => {
                if (e.target.classList.contains('btn-jump')) {
                    return;
                }
                const idx = row.getAttribute('data-index');
                if (idx !== null) {
                    vscode.postMessage({ type: 'selectFinding', index: parseInt(idx, 10) });
                }
            });
        });

        document.querySelectorAll('.btn-jump').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const file = btn.getAttribute('data-file');
                const line = parseInt(btn.getAttribute('data-line'), 10);
                const col = parseInt(btn.getAttribute('data-col'), 10);
                vscode.postMessage({ type: 'openFile', file, line, col });
            });
        });
    </script>
</body>
</html>`;
    }

    private getNonce(): string {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
}

function escapeHtml(unsafe: string): string {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
