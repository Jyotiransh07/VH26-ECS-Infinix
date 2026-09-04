import * as vscode from 'vscode';
import * as path from 'path';
import { Finding, ScanReport } from './leakguard';

export type TreeItemType =
    | 'category-overview'
    | 'category-critical'
    | 'category-warnings'
    | 'category-suggestions'
    | 'issue'
    | 'suggestion-item'
    | 'empty';

export class LeakGuardTreeItem extends vscode.TreeItem {
    constructor(
        public readonly itemType: TreeItemType,
        label: string,
        collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly finding?: Finding
    ) {
        super(label, collapsibleState);
    }
}

export class LeakGuardTreeProvider implements vscode.TreeDataProvider<LeakGuardTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<LeakGuardTreeItem | undefined | null | void> =
        new vscode.EventEmitter<LeakGuardTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<LeakGuardTreeItem | undefined | null | void> =
        this._onDidChangeTreeData.event;

    private currentReport: ScanReport | undefined;

    public updateReport(report: ScanReport | undefined): void {
        this.currentReport = report;
        this._onDidChangeTreeData.fire();
    }

    public getTreeItem(element: LeakGuardTreeItem): vscode.TreeItem {
        return element;
    }

    public getChildren(element?: LeakGuardTreeItem): Thenable<LeakGuardTreeItem[]> {
        if (!this.currentReport) {
            const emptyItem = new LeakGuardTreeItem(
                'empty',
                'No scan data yet (Run a scan)',
                vscode.TreeItemCollapsibleState.None
            );
            emptyItem.iconPath = new vscode.ThemeIcon('search');
            return Promise.resolve([emptyItem]);
        }

        const findings = this.currentReport.findings;

        if (findings.length === 0) {
            const allClearItem = new LeakGuardTreeItem(
                'empty',
                'All Clear — No Resource Leaks Detected',
                vscode.TreeItemCollapsibleState.None
            );
            allClearItem.iconPath = new vscode.ThemeIcon('check', new vscode.ThemeColor('testing.iconPassed'));
            allClearItem.description = `Scanned ${this.currentReport.summary.files_scanned} files`;
            return Promise.resolve([allClearItem]);
        }

        if (!element) {
            // Root categories
            const criticalCount = findings.filter(f => f.severity === 'HIGH').length;
            const warningCount = findings.filter(f => f.severity === 'MEDIUM').length;

            const overviewItem = new LeakGuardTreeItem(
                'category-overview',
                'Overview',
                vscode.TreeItemCollapsibleState.None
            );
            overviewItem.description = `${findings.length} issue(s) across ${this.currentReport.summary.files_scanned} file(s)`;
            overviewItem.iconPath = new vscode.ThemeIcon('dashboard');
            overviewItem.tooltip = `Definite: ${this.currentReport.summary.definite_leaks}, Likely: ${this.currentReport.summary.likely_leaks}`;

            const criticalItem = new LeakGuardTreeItem(
                'category-critical',
                'Critical',
                criticalCount > 0
                    ? vscode.TreeItemCollapsibleState.Expanded
                    : vscode.TreeItemCollapsibleState.Collapsed
            );
            criticalItem.description = `(${criticalCount})`;
            criticalItem.iconPath = new vscode.ThemeIcon('error', new vscode.ThemeColor('errorForeground'));

            const warningsItem = new LeakGuardTreeItem(
                'category-warnings',
                'Warnings',
                warningCount > 0
                    ? vscode.TreeItemCollapsibleState.Expanded
                    : vscode.TreeItemCollapsibleState.Collapsed
            );
            warningsItem.description = `(${warningCount})`;
            warningsItem.iconPath = new vscode.ThemeIcon('warning', new vscode.ThemeColor('editorWarning.foreground'));

            const suggestionsItem = new LeakGuardTreeItem(
                'category-suggestions',
                'Suggestions',
                vscode.TreeItemCollapsibleState.Collapsed
            );
            const uniqueSuggestions = new Set(findings.map(f => f.suggestion).filter(Boolean));
            suggestionsItem.description = `(${uniqueSuggestions.size})`;
            suggestionsItem.iconPath = new vscode.ThemeIcon('lightbulb', new vscode.ThemeColor('editorLightBulb.foreground'));

            return Promise.resolve([overviewItem, criticalItem, warningsItem, suggestionsItem]);
        }

        if (element.itemType === 'category-critical') {
            const critical = findings.filter(f => f.severity === 'HIGH');
            return Promise.resolve(critical.map(f => this.createIssueItem(f)));
        }

        if (element.itemType === 'category-warnings') {
            const warnings = findings.filter(f => f.severity === 'MEDIUM');
            return Promise.resolve(warnings.map(f => this.createIssueItem(f)));
        }

        if (element.itemType === 'category-suggestions') {
            const uniqueSuggestions = Array.from(new Set(findings.map(f => f.suggestion).filter(Boolean)));
            const items = uniqueSuggestions.map(s => {
                const item = new LeakGuardTreeItem(
                    'suggestion-item',
                    s,
                    vscode.TreeItemCollapsibleState.None
                );
                item.iconPath = new vscode.ThemeIcon('sparkle');
                item.tooltip = s;
                return item;
            });
            return Promise.resolve(items);
        }

        return Promise.resolve([]);
    }

    private createIssueItem(finding: Finding): LeakGuardTreeItem {
        const baseName = path.basename(finding.file);
        const label = `${baseName}:${finding.line}`;

        const item = new LeakGuardTreeItem(
            'issue',
            label,
            vscode.TreeItemCollapsibleState.None,
            finding
        );

        const resourceTitle = finding.resource_type.charAt(0).toUpperCase() + finding.resource_type.slice(1);
        item.description = `${finding.variable_name} (${resourceTitle})`;

        const pathStr = finding.path && finding.path.length > 0
            ? `${finding.path.join(' → ')} → EXIT`
            : 'EXIT';

        item.tooltip = new vscode.MarkdownString(
            `### [${finding.severity}] ${finding.confidence} LEAK\n\n` +
            `**File:** \`${finding.file}:${finding.line}\`\n\n` +
            `**Resource:** ${resourceTitle} \`${finding.variable_name}\`\n\n` +
            `**Leaking Path:** \`${pathStr}\`\n\n` +
            `**Reason:** ${finding.reason}\n\n` +
            `**Suggestion:** ${finding.suggestion}`
        );

        if (finding.severity === 'HIGH') {
            item.iconPath = new vscode.ThemeIcon('circle-filled', new vscode.ThemeColor('errorForeground'));
        } else {
            item.iconPath = new vscode.ThemeIcon('circle-filled', new vscode.ThemeColor('editorWarning.foreground'));
        }

        const line0 = Math.max(0, finding.line - 1);
        const col0 = Math.max(0, finding.column);
        const varLen = finding.variable_name ? finding.variable_name.length : 1;
        const targetRange = new vscode.Range(line0, col0, line0, col0 + varLen);

        item.command = {
            command: 'vscode.open',
            title: 'Open File',
            arguments: [
                vscode.Uri.file(finding.file),
                {
                    selection: targetRange,
                    preview: true
                }
            ]
        };

        return item;
    }
}
