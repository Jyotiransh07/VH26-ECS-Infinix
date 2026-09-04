import * as vscode from 'vscode';

export class StatusBarManager {
    private item: vscode.StatusBarItem;

    constructor() {
        this.item = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Left,
            100
        );
        this.item.name = 'LeakGuard Status';
        this.item.command = 'leakguard.openDashboard';
        this.setInitial();
        this.updateVisibility();
    }

    public updateVisibility(): void {
        const visible = vscode.workspace.getConfiguration('leakguard').get<boolean>('showStatusBar', true);
        if (visible) {
            this.item.show();
        } else {
            this.item.hide();
        }
    }

    public setInitial(): void {
        this.item.text = '$(shield) LeakGuard';
        this.item.tooltip = 'LeakGuard: Static resource leak detector. Click to open dashboard.';
        this.item.backgroundColor = undefined;
    }

    public setScanning(targetName?: string): void {
        this.item.text = '$(sync~spin) LeakGuard: Scanning...';
        this.item.tooltip = targetName
            ? `LeakGuard is analyzing: ${targetName}`
            : 'LeakGuard scan in progress...';
    }

    public updateCounts(counts: { total: number; high: number; medium: number; info: number }): void {
        if (counts.total === 0) {
            this.item.text = '$(check) LeakGuard: 0 issues';
            this.item.tooltip = 'LeakGuard: Clean! No resource leaks detected. Click to open dashboard.';
            this.item.backgroundColor = undefined;
        } else if (counts.high > 0) {
            this.item.text = `$(error) LeakGuard: ${counts.high} critical`;
            this.item.tooltip = `LeakGuard: ${counts.high} critical (HIGH), ${counts.medium} warnings, ${counts.info} info (${counts.total} total issues). Click to open dashboard.`;
            this.item.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
        } else {
            this.item.text = `$(warning) LeakGuard: ${counts.total} issues`;
            this.item.tooltip = `LeakGuard: ${counts.medium} warnings, ${counts.info} info (${counts.total} total issues). Click to open dashboard.`;
            this.item.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
        }
    }

    public dispose(): void {
        this.item.dispose();
    }
}
