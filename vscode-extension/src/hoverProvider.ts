import * as vscode from 'vscode';
import { Finding } from './leakguard';

export class LeakGuardHoverProvider implements vscode.HoverProvider {
    constructor(private getFindings: () => Finding[]) {}

    public provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        _token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Hover> {
        const findings = this.getFindings();
        if (!findings || findings.length === 0) {
            return null;
        }

        const docPath = document.uri.fsPath;
        const targetLine = position.line + 1; // 1-based line

        const matching = findings.find(f => {
            const matchesFile = f.file === docPath || docPath.endsWith(f.file) || f.file.endsWith(document.fileName);
            return matchesFile && f.line === targetLine;
        });

        if (!matching) {
            return null;
        }

        const resourceTitle = matching.resource_type.charAt(0).toUpperCase() + matching.resource_type.slice(1);
        const pathStr = matching.path && matching.path.length > 0
            ? `${matching.path.join(' → ')} → EXIT`
            : 'EXIT';

        const md = new vscode.MarkdownString();
        md.isTrusted = true;
        md.appendMarkdown(`### 🛡️ LeakGuard Resource Leak\n\n`);
        md.appendMarkdown(`**Severity:** \`[${matching.severity}] ${matching.confidence}\`\n\n`);
        md.appendMarkdown(`**Resource:** ${resourceTitle} \`${matching.variable_name}\`\n\n`);
        md.appendMarkdown(`**Opened:** Line ${matching.line}\n\n`);
        md.appendMarkdown(`**Leaking Path:** \`${pathStr}\`\n\n`);
        md.appendMarkdown(`---\n\n`);
        md.appendMarkdown(`**Reason:** ${matching.reason}\n\n`);
        md.appendMarkdown(`**Suggested Fix:**\n> ${matching.suggestion}\n`);

        return new vscode.Hover(md);
    }
}
