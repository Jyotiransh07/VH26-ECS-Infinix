import { test, describe } from 'node:test';
import * as assert from 'node:assert';
import * as path from 'path';
import { parseScanOutput } from '../outputParser';
import { spawnSync } from 'child_process';

describe('CLI Integration verification', () => {
    test('LeakGuard CLI runs on demo-project and returns structured JSON', () => {
        const repoRoot = path.resolve(__dirname, '../../..');
        const venvPython = process.platform === 'win32'
            ? path.join(repoRoot, '.venv', 'Scripts', 'python.exe')
            : path.join(repoRoot, '.venv', 'bin', 'python');

        const demoFile = path.join(repoRoot, 'demo-project', 'example.py');

        // Run python -m leakguard.cli scan demo-project/example.py --format json
        const res = spawnSync(venvPython, ['-m', 'leakguard.cli', 'scan', demoFile, '--format', 'json'], {
            cwd: repoRoot,
            env: { ...process.env, PYTHONUTF8: '1' },
            encoding: 'utf-8'
        });

        // Exit code is 1 because demo-project/example.py has a definite leak!
        assert.strictEqual(res.status, 1);
        assert.ok(res.stdout.length > 0, 'stdout should not be empty');

        const report = parseScanOutput(res.stdout, repoRoot);
        assert.strictEqual(report.summary.files_scanned, 1);
        assert.strictEqual(report.summary.definite_leaks, 1);
        assert.strictEqual(report.findings.length, 1);

        const finding = report.findings[0];
        assert.strictEqual(finding.line, 2);
        assert.strictEqual(finding.resource_type, 'file');
        assert.strictEqual(finding.variable_name, 'f');
        assert.strictEqual(finding.severity, 'HIGH');
        assert.strictEqual(finding.confidence, 'DEFINITE');
        assert.deepStrictEqual(finding.path, [4, 5]);
        assert.ok(finding.reason.includes('Early return or branch bypasses resource cleanup'));
        assert.ok(finding.suggestion.includes('context manager'));
    });
});
