import * as vscode from 'vscode';
import { Finding, Severity } from './leakguard';

export class DiagnosticsManager {
    private collection: vscode.DiagnosticCollection;
    private outputChannel: vscode.OutputChannel;

    constructor(outputChannel: vscode.OutputChannel) {
        this.outputChannel = outputChannel;
        this.collection = vscode.languages.createDiagnosticCollection('leakguard');
    }

    public getCollection(): vscode.DiagnosticCollection {
        return this.collection;
    }

    /**
     * Maps LeakGuard findings into VS Code diagnostics and updates the Problems collection.
     * Clears previous diagnostics for the scanned scope.
     */
    public updateFileDiagnostics(targetUri: vscode.Uri, findings: Finding[]): void {
        const filtered = findings.filter(f => this.shouldInclude(f.severity));
        const diagnostics: vscode.Diagnostic[] = filtered.map(f => this.createDiagnostic(targetUri, f));
        this.collection.set(targetUri, diagnostics);
        this.outputChannel.appendLine(`[INFO] Diagnostics updated for ${targetUri.fsPath} (${diagnostics.length} issues displayed, ${findings.length} detected)`);
    }

    /**
     * Updates diagnostics for an entire workspace scan, grouping findings by file URI.
     */
    public updateWorkspaceDiagnostics(findings: Finding[]): Map<string, vscode.Diagnostic[]> {
        this.collection.clear();

        const grouped = new Map<string, vscode.Diagnostic[]>();
        const filtered = findings.filter(f => this.shouldInclude(f.severity));

        for (const finding of filtered) {
            const uri = vscode.Uri.file(finding.file);
            const key = uri.toString();
            if (!grouped.has(key)) {
                grouped.set(key, []);
            }
            grouped.get(key)!.push(this.createDiagnostic(uri, finding));
        }

        for (const [uriStr, diags] of grouped.entries()) {
            this.collection.set(vscode.Uri.parse(uriStr), diags);
        }

        this.outputChannel.appendLine(`[INFO] Diagnostics updated across ${grouped.size} files in workspace (${filtered.length} issues displayed)`);
        return grouped;
    }

    private shouldInclude(severity: Severity): boolean {
        const threshold = vscode.workspace.getConfiguration('leakguard').get<string>('severityThreshold', 'INFO');
        if (threshold === 'HIGH') {
            return severity === 'HIGH';
        }
        if (threshold === 'MEDIUM') {
            return severity === 'HIGH' || severity === 'MEDIUM';
        }
        return true;
    }

    /**
     * Clears diagnostics for a specific file.
     */
    public clearFile(uri: vscode.Uri): void {
        this.collection.delete(uri);
    }

    /**
     * Clears all LeakGuard diagnostics.
     */
    public clearAll(): void {
        this.collection.clear();
        this.outputChannel.appendLine('[INFO] Diagnostics cleared');
    }

    /**
     * Calculates total active diagnostic counts by severity.
     */
    public getCounts(): { total: number; high: number; medium: number; info: number } {
        let total = 0;
        let high = 0;
        let medium = 0;
        let info = 0;

        this.collection.forEach((_uri, diags) => {
            total += diags.length;
            for (const d of diags) {
                if (d.severity === vscode.DiagnosticSeverity.Error) {
                    high++;
                } else if (d.severity === vscode.DiagnosticSeverity.Warning) {
                    medium++;
                } else {
                    info++;
                }
            }
        });

        return { total, high, medium, info };
    }

    public dispose(): void {
        this.collection.dispose();
    }

    private createDiagnostic(uri: vscode.Uri, finding: Finding): vscode.Diagnostic {
        const line = Math.max(0, finding.line - 1);
        const column = Math.max(0, finding.column);
        const length = finding.variable_name ? finding.variable_name.length : 1;
        const range = new vscode.Range(line, column, line, column + length);

        const severity = this.mapSeverity(finding.severity);
        const message = this.buildDiagnosticMessage(finding);

        const diagnostic = new vscode.Diagnostic(range, message, severity);
        diagnostic.source = 'LeakGuard';
        diagnostic.code = {
            value: `RESOURCE_LEAK (${finding.resource_type})`,
            target: vscode.Uri.parse('https://github.com/Jyotiransh07/VH26-ECS-Infinix#readme')
        };

        // Add related information for leaking path steps
        if (finding.path && finding.path.length > 0) {
            const related: vscode.DiagnosticRelatedInformation[] = [];
            for (let i = 0; i < finding.path.length; i++) {
                const pathLine = Math.max(0, finding.path[i] - 1);
                const pathRange = new vscode.Range(pathLine, 0, pathLine, 0);
                related.push(
                    new vscode.DiagnosticRelatedInformation(
                        new vscode.Location(uri, pathRange),
                        `Leaking path step ${i + 1}: Line ${finding.path[i]}`
                    )
                );
            }
            diagnostic.relatedInformation = related;
        }

        return diagnostic;
    }

    private mapSeverity(severity: Severity): vscode.DiagnosticSeverity {
        switch (severity) {
            case 'HIGH':
                return vscode.DiagnosticSeverity.Error;
            case 'MEDIUM':
                return vscode.DiagnosticSeverity.Warning;
            case 'LOW':
            case 'INFO':
            default:
                return vscode.DiagnosticSeverity.Information;
        }
    }

    private buildDiagnosticMessage(finding: Finding): string {
        const pathStr = finding.path && finding.path.length > 0
            ? `${finding.path.join(' → ')} → EXIT`
            : 'EXIT';

        const resourceTitle = finding.resource_type.charAt(0).toUpperCase() + finding.resource_type.slice(1);

        return (
            `LeakGuard: [${finding.severity}] ${finding.confidence} RESOURCE LEAK\n\n` +
            `Resource:\n  ${resourceTitle} '${finding.variable_name}'\n\n` +
            `Reason:\n  ${finding.reason}\n\n` +
            `Leaking Path:\n  ${pathStr}\n\n` +
            `Suggestion:\n  ${finding.suggestion}`
        );
    }
}
