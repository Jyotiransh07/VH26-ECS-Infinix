import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { Scanner } from './scanner';
import { DiagnosticsManager } from './diagnostics';
import { StatusBarManager } from './statusBar';
import { LeakGuardTreeProvider } from './treeProvider';
import { LeakGuardDashboardPanel } from './dashboard';
import { LeakGuardHoverProvider } from './hoverProvider';
import { LeakGuardCodeActionProvider } from './codeActions';
import { ScanReport } from './leakguard';

let outputChannel: vscode.OutputChannel;
let scanner: Scanner;
let diagnosticsManager: DiagnosticsManager;
let statusBar: StatusBarManager;
let treeProvider: LeakGuardTreeProvider;

let currentReport: ScanReport | undefined;
let saveScanTimeout: NodeJS.Timeout | undefined;

export function activate(context: vscode.ExtensionContext): void {
    // 1. Output Channel
    outputChannel = vscode.window.createOutputChannel('LeakGuard');
    context.subscriptions.push(outputChannel);
    outputChannel.appendLine('[INFO] LeakGuard extension activated');

    // 2. Core Subsystems
    scanner = new Scanner(outputChannel);
    diagnosticsManager = new DiagnosticsManager(outputChannel);
    statusBar = new StatusBarManager();
    treeProvider = new LeakGuardTreeProvider();

    context.subscriptions.push(diagnosticsManager);
    context.subscriptions.push(statusBar);

    // 3. Register Sidebar TreeView
    const treeView = vscode.window.registerTreeDataProvider('leakguard.issuesView', treeProvider);
    context.subscriptions.push(treeView);

    // 4. Register Hover & CodeAction Providers
    const hoverProvider = vscode.languages.registerHoverProvider(
        'python',
        new LeakGuardHoverProvider(() => currentReport?.findings || [])
    );

    const codeActionProvider = vscode.languages.registerCodeActionsProvider(
        'python',
        new LeakGuardCodeActionProvider(() => currentReport?.findings || []),
        {
            providedCodeActionKinds: LeakGuardCodeActionProvider.providedCodeActionKinds
        }
    );

    context.subscriptions.push(hoverProvider, codeActionProvider);

    // 5. Register Commands
    const scanFileCommand = vscode.commands.registerCommand('leakguard.scanFile', async () => {
        await executeScanFile(context);
    });

    const scanWorkspaceCommand = vscode.commands.registerCommand('leakguard.scanWorkspace', async () => {
        await executeScanWorkspace(context);
    });

    const openDashboardCommand = vscode.commands.registerCommand('leakguard.openDashboard', () => {
        LeakGuardDashboardPanel.createOrShow(
            context.extensionUri,
            currentReport,
            handleDashboardMessage
        );
    });

    const clearResultsCommand = vscode.commands.registerCommand('leakguard.clearResults', () => {
        currentReport = undefined;
        diagnosticsManager.clearAll();
        statusBar.updateCounts({ total: 0, high: 0, medium: 0, info: 0 });
        treeProvider.updateReport(undefined);
        if (LeakGuardDashboardPanel.currentPanel) {
            LeakGuardDashboardPanel.currentPanel.update(undefined);
        }
    });

    const exportReportCommand = vscode.commands.registerCommand('leakguard.exportReport', async () => {
        await executeExportReport();
    });

    const exportSarifCommand = vscode.commands.registerCommand('leakguard.exportSarif', async () => {
        await executeExportSarif();
    });

    const showSuggestionCommand = vscode.commands.registerCommand('leakguard.showSuggestion', (suggestion: string) => {
        vscode.window.showInformationMessage(`💡 LeakGuard Remediation Suggestion:\n\n${suggestion}`, 'OK');
    });

    context.subscriptions.push(
        scanFileCommand,
        scanWorkspaceCommand,
        openDashboardCommand,
        clearResultsCommand,
        exportReportCommand,
        exportSarifCommand,
        showSuggestionCommand
    );

    // 6. Scan on Save
    const onSaveDisposable = vscode.workspace.onDidSaveTextDocument(async (document: vscode.TextDocument) => {
        const config = vscode.workspace.getConfiguration('leakguard');
        if (!config.get<boolean>('enabled', true)) {
            return;
        }

        if (!config.get<boolean>('scanOnSave', true)) {
            return;
        }

        if (document.languageId !== 'python' && !document.fileName.endsWith('.py')) {
            return;
        }

        // Debounce scan-on-save requests (350ms) to prevent overlapping child processes
        if (saveScanTimeout) {
            clearTimeout(saveScanTimeout);
        }

        saveScanTimeout = setTimeout(async () => {
            try {
                const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
                const workspaceRoot = workspaceFolder?.uri.fsPath;

                statusBar.setScanning(path.basename(document.fileName));
                const report = await scanner.runScan(document.fileName, workspaceRoot);

                currentReport = report;
                diagnosticsManager.updateFileDiagnostics(document.uri, report.findings);
                statusBar.updateCounts(diagnosticsManager.getCounts());
                treeProvider.updateReport(report);

                if (LeakGuardDashboardPanel.currentPanel) {
                    LeakGuardDashboardPanel.currentPanel.update(report);
                }

                if (config.get<boolean>('autoOpenDashboard', false) && report.summary.definite_leaks > 0) {
                    LeakGuardDashboardPanel.createOrShow(context.extensionUri, report, handleDashboardMessage);
                }
            } catch (err: any) {
                statusBar.updateCounts(diagnosticsManager.getCounts());
                outputChannel.appendLine(`[WARN] Scan on save skipped: ${err.message}`);
            }
        }, 350);
    });

    context.subscriptions.push(onSaveDisposable);

    // 7. Configuration change listener
    const onConfigChangeDisposable = vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration('leakguard.showStatusBar')) {
            statusBar.updateVisibility();
        }
        if (e.affectsConfiguration('leakguard.severityThreshold') && currentReport) {
            diagnosticsManager.updateWorkspaceDiagnostics(currentReport.findings);
            statusBar.updateCounts(diagnosticsManager.getCounts());
        }
        if (e.affectsConfiguration('leakguard.enabled')) {
            const enabled = vscode.workspace.getConfiguration('leakguard').get<boolean>('enabled', true);
            if (!enabled) {
                diagnosticsManager.clearAll();
                statusBar.updateCounts({ total: 0, high: 0, medium: 0, info: 0 });
                treeProvider.updateReport(undefined);
                outputChannel.appendLine('[INFO] LeakGuard disabled via settings');
            } else {
                outputChannel.appendLine('[INFO] LeakGuard enabled');
            }
        }
    });

    context.subscriptions.push(onConfigChangeDisposable);

    // 8. Auto-scan workspace on open if configured
    const config = vscode.workspace.getConfiguration('leakguard');
    if (config.get<boolean>('enabled', true) && config.get<boolean>('scanWorkspaceOnOpen', false)) {
        if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
            setTimeout(() => {
                vscode.commands.executeCommand('leakguard.scanWorkspace');
            }, 1200);
        }
    }
}

export function deactivate(): void {
    if (saveScanTimeout) {
        clearTimeout(saveScanTimeout);
    }
    if (outputChannel) {
        outputChannel.appendLine('[INFO] LeakGuard extension deactivated');
    }
}

/**
 * Handles incoming messages from the Webview Dashboard.
 */
function handleDashboardMessage(message: any): void {
    switch (message.type) {
        case 'scanFile':
            vscode.commands.executeCommand('leakguard.scanFile');
            break;
        case 'scanWorkspace':
            vscode.commands.executeCommand('leakguard.scanWorkspace');
            break;
        case 'clearResults':
            vscode.commands.executeCommand('leakguard.clearResults');
            break;
        case 'exportSarif':
            vscode.commands.executeCommand('leakguard.exportSarif');
            break;
        case 'openFile':
            if (message.file && message.line) {
                const uri = vscode.Uri.file(message.file);
                const line0 = Math.max(0, message.line - 1);
                const col0 = Math.max(0, message.col ?? 0);
                vscode.window.showTextDocument(uri, {
                    selection: new vscode.Range(line0, col0, line0, col0 + 10)
                });
            }
            break;
    }
}

/**
 * Command: LeakGuard: Scan Current File
 */
async function executeScanFile(context: vscode.ExtensionContext): Promise<void> {
    const config = vscode.workspace.getConfiguration('leakguard');
    if (!config.get<boolean>('enabled', true)) {
        vscode.window.showInformationMessage('LeakGuard is currently disabled in settings.');
        return;
    }

    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showInformationMessage('LeakGuard: No active editor. Open a Python file to scan.');
        return;
    }

    const document = editor.document;
    if (document.languageId !== 'python' && !document.fileName.endsWith('.py')) {
        vscode.window.showWarningMessage('LeakGuard: The active file is not a Python (.py) file.');
        return;
    }

    if (document.isDirty) {
        await document.save();
    }

    const fileName = path.basename(document.fileName);
    statusBar.setScanning(fileName);

    const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
    const workspaceRoot = workspaceFolder?.uri.fsPath;

    try {
        const report = await scanner.runScan(document.fileName, workspaceRoot);
        currentReport = report;

        diagnosticsManager.updateFileDiagnostics(document.uri, report.findings);
        statusBar.updateCounts(diagnosticsManager.getCounts());
        treeProvider.updateReport(report);

        if (LeakGuardDashboardPanel.currentPanel) {
            LeakGuardDashboardPanel.currentPanel.update(report);
        }

        const total = report.findings.length;
        if (total === 0) {
            outputChannel.appendLine(`[INFO] Scan passed: No leaks detected in ${fileName}`);
        } else {
            outputChannel.appendLine(`[INFO] Scan completed: Found ${total} resource leaks in ${fileName}`);
        }

        if (config.get<boolean>('autoOpenDashboard', false) && report.summary.definite_leaks > 0) {
            LeakGuardDashboardPanel.createOrShow(context.extensionUri, report, handleDashboardMessage);
        }
    } catch (err: any) {
        statusBar.updateCounts(diagnosticsManager.getCounts());
        vscode.window.showErrorMessage(`LeakGuard Scan Error: ${err.message}`);
    }
}

/**
 * Command: LeakGuard: Scan Workspace
 */
async function executeScanWorkspace(context: vscode.ExtensionContext): Promise<void> {
    const config = vscode.workspace.getConfiguration('leakguard');
    if (!config.get<boolean>('enabled', true)) {
        vscode.window.showInformationMessage('LeakGuard is currently disabled in settings.');
        return;
    }

    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showWarningMessage('LeakGuard: No workspace folder open to scan.');
        return;
    }

    let selectedFolder = workspaceFolders[0];
    if (workspaceFolders.length > 1) {
        const picked = await vscode.window.showWorkspaceFolderPick({
            placeHolder: 'Select workspace folder to scan with LeakGuard'
        });
        if (!picked) {
            return;
        }
        selectedFolder = picked;
    }

    const targetDir = selectedFolder.uri.fsPath;
    statusBar.setScanning(selectedFolder.name);

    try {
        const report = await scanner.runScan(targetDir, targetDir);
        currentReport = report;

        diagnosticsManager.updateWorkspaceDiagnostics(report.findings);
        statusBar.updateCounts(diagnosticsManager.getCounts());
        treeProvider.updateReport(report);

        if (LeakGuardDashboardPanel.currentPanel) {
            LeakGuardDashboardPanel.currentPanel.update(report);
        }

        const counts = diagnosticsManager.getCounts();
        outputChannel.appendLine(
            `[INFO] Workspace scan finished. Scanned ${report.summary.files_scanned} files. Total issues: ${counts.total} (High: ${counts.high}, Medium: ${counts.medium})`
        );

        if (config.get<boolean>('autoOpenDashboard', false) && report.summary.definite_leaks > 0) {
            LeakGuardDashboardPanel.createOrShow(context.extensionUri, report, handleDashboardMessage);
        }
    } catch (err: any) {
        statusBar.updateCounts(diagnosticsManager.getCounts());
        vscode.window.showErrorMessage(`LeakGuard Workspace Scan Error: ${err.message}`);
    }
}

/**
 * Command: LeakGuard: Export Report (Choice between SARIF and JSON)
 */
async function executeExportReport(): Promise<void> {
    outputChannel.appendLine('[INFO] Command triggered: LeakGuard: Export Report');
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showWarningMessage('LeakGuard: No workspace folder open.');
        return;
    }

    const formatChoice = await vscode.window.showQuickPick(
        [
            { label: 'SARIF', description: 'Standard format for GitHub Code Scanning / CI', value: 'sarif' },
            { label: 'JSON', description: 'Raw structured findings data', value: 'json' }
        ],
        { placeHolder: 'Select report format to export' }
    );

    if (!formatChoice) {
        return;
    }

    if (formatChoice.value === 'sarif') {
        await executeExportSarif();
    } else {
        const targetDir = workspaceFolders[0].uri.fsPath;
        try {
            const report = await scanner.runScan(targetDir, targetDir);
            const defaultUri = vscode.Uri.file(path.join(targetDir, 'leakguard-report.json'));

            const saveUri = await vscode.window.showSaveDialog({
                defaultUri,
                filters: { 'JSON Files': ['json'] }
            });

            if (saveUri) {
                fs.writeFileSync(saveUri.fsPath, JSON.stringify(report, null, 2), 'utf-8');
                vscode.window.showInformationMessage(`LeakGuard: JSON report successfully saved to ${path.basename(saveUri.fsPath)}`);
                outputChannel.appendLine(`[INFO] JSON report exported to ${saveUri.fsPath}`);
            }
        } catch (err: any) {
            vscode.window.showErrorMessage(`LeakGuard Export Error: ${err.message}`);
        }
    }
}

/**
 * Command: LeakGuard: Export SARIF Report
 */
async function executeExportSarif(): Promise<void> {
    outputChannel.appendLine('[INFO] Command triggered: LeakGuard: Export SARIF');
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showWarningMessage('LeakGuard: No workspace folder open to export SARIF.');
        return;
    }

    const targetDir = workspaceFolders[0].uri.fsPath;
    try {
        const defaultUri = vscode.Uri.file(path.join(targetDir, 'leakguard-results.sarif'));
        const saveUri = await vscode.window.showSaveDialog({
            defaultUri,
            filters: { 'SARIF Files': ['sarif', 'json'] }
        });

        if (!saveUri) {
            return;
        }

        const sarifOutput = await scanner.runSarif(targetDir, targetDir);
        fs.writeFileSync(saveUri.fsPath, sarifOutput, 'utf-8');
        vscode.window.showInformationMessage(`LeakGuard: SARIF report saved to ${path.basename(saveUri.fsPath)}`);
        outputChannel.appendLine(`[INFO] SARIF report successfully exported to ${saveUri.fsPath}`);
    } catch (err: any) {
        vscode.window.showErrorMessage(`LeakGuard SARIF Export Error: ${err.message}`);
        outputChannel.appendLine(`[ERROR] SARIF export failed: ${err.message}`);
    }
}
