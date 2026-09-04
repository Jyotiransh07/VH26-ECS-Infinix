import * as vscode from 'vscode';
import { Finding } from './leakguard';

export class LeakGuardCodeActionProvider implements vscode.CodeActionProvider {
    public static readonly providedCodeActionKinds = [
        vscode.CodeActionKind.QuickFix
    ];

    constructor(private getFindings: () => Finding[]) {}

    public provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext,
        _token: vscode.CancellationToken
    ): vscode.CodeAction[] {
        const actions: vscode.CodeAction[] = [];

        // Find LeakGuard diagnostics overlapping the range
        const leakGuardDiagnostics = context.diagnostics.filter(
            d => d.source === 'LeakGuard' && d.range.intersection(range)
        );

        if (leakGuardDiagnostics.length === 0) {
            return actions;
        }

        const findings = this.getFindings();
        const docPath = document.uri.fsPath;
        const line = range.start.line;
        const lineText = document.lineAt(line).text;

        const matchingFinding = findings.find(f => {
            const matchesFile = f.file === docPath || docPath.endsWith(f.file) || f.file.endsWith(document.fileName);
            return matchesFile && f.line === line + 1;
        });

        // 1. Safe context manager transformation (only when simple variable assignment is matched)
        const match = lineText.match(/^(\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(open\(.+\)|socket\.socket\(.+\)|sqlite3\.connect\(.+\))\s*$/);
        if (match) {
            const indent = match[1];
            const varName = match[2];
            const callExpr = match[3];

            const fixAction = new vscode.CodeAction(
                `LeakGuard: Refactor '${varName}' to 'with ${callExpr} as ${varName}:'`,
                vscode.CodeActionKind.QuickFix
            );
            fixAction.isPreferred = true;
            fixAction.diagnostics = leakGuardDiagnostics;

            const edit = new vscode.WorkspaceEdit();
            const replacement = `${indent}with ${callExpr} as ${varName}:\n${indent}    # Auto-managed by context manager`;
            edit.replace(document.uri, document.lineAt(line).range, replacement);
            fixAction.edit = edit;
            actions.push(fixAction);
        }

        // 2. Informational QuickFix: Open LeakGuard Suggestion
        const suggestionAction = new vscode.CodeAction(
            'LeakGuard: Open Fix Suggestion',
            vscode.CodeActionKind.QuickFix
        );
        suggestionAction.diagnostics = leakGuardDiagnostics;
        suggestionAction.command = {
            command: 'leakguard.showSuggestion',
            title: 'Show LeakGuard Suggestion',
            arguments: [matchingFinding?.suggestion || 'Use a context manager (`with` statement) to automatically manage this resource.']
        };
        actions.push(suggestionAction);

        // 3. QuickFix: Inspect in Dashboard
        const dashboardAction = new vscode.CodeAction(
            'LeakGuard: Inspect Leaking Path in Dashboard',
            vscode.CodeActionKind.QuickFix
        );
        dashboardAction.diagnostics = leakGuardDiagnostics;
        dashboardAction.command = {
            command: 'leakguard.openDashboard',
            title: 'Open Dashboard'
        };
        actions.push(dashboardAction);

        return actions;
    }
}
