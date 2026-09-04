import { test, describe } from 'node:test';
import * as assert from 'node:assert';
import * as path from 'path';
import { parseScanOutput, OutputParseError } from '../outputParser';

describe('outputParser tests', () => {
    test('parses clean valid JSON report', () => {
        const json = JSON.stringify({
            summary: {
                files_scanned: 1,
                definite_leaks: 1,
                likely_leaks: 0,
                unknown: 0
            },
            findings: [
                {
                    file: 'demo-project/example.py',
                    line: 2,
                    column: 4,
                    resource_type: 'file',
                    variable_name: 'f',
                    severity: 'HIGH',
                    confidence: 'DEFINITE',
                    reason: 'Early return or branch bypasses resource cleanup.',
                    path: [4, 5],
                    suggestion: 'Consider using a context manager (`with` statement).'
                }
            ]
        });

        const report = parseScanOutput(json, 'C:/project');
        assert.strictEqual(report.summary.files_scanned, 1);
        assert.strictEqual(report.summary.definite_leaks, 1);
        assert.strictEqual(report.findings.length, 1);

        const f = report.findings[0];
        assert.strictEqual(f.line, 2);
        assert.strictEqual(f.column, 4);
        assert.strictEqual(f.resource_type, 'file');
        assert.strictEqual(f.variable_name, 'f');
        assert.strictEqual(f.severity, 'HIGH');
        assert.strictEqual(f.confidence, 'DEFINITE');
        assert.deepStrictEqual(f.path, [4, 5]);
        assert.strictEqual(f.file, path.resolve('C:/project', 'demo-project/example.py'));
    });

    test('extracts JSON when preceded and followed by banners or warnings', () => {
        const raw = `
UserWarning: Resource check active
Some arbitrary banner line
{
  "summary": {
    "files_scanned": 2,
    "definite_leaks": 0,
    "likely_leaks": 1,
    "unknown": 0
  },
  "findings": [
    {
      "file": "test.py",
      "line": 10,
      "column": 0,
      "resource_type": "socket",
      "variable_name": "s",
      "severity": "MEDIUM",
      "confidence": "LIKELY",
      "reason": "Ownership transferred",
      "path": [12],
      "suggestion": "Wrap in try/finally"
    }
  ]
}
Finished analysis in 0.05s
`;
        const report = parseScanOutput(raw);
        assert.strictEqual(report.summary.files_scanned, 2);
        assert.strictEqual(report.findings.length, 1);
        assert.strictEqual(report.findings[0].resource_type, 'socket');
        assert.strictEqual(report.findings[0].severity, 'MEDIUM');
    });

    test('handles empty findings gracefully (no leaks detected)', () => {
        const json = JSON.stringify({
            summary: {
                files_scanned: 5,
                definite_leaks: 0,
                likely_leaks: 0,
                unknown: 0
            },
            findings: []
        });

        const report = parseScanOutput(json);
        assert.strictEqual(report.summary.files_scanned, 5);
        assert.strictEqual(report.findings.length, 0);
    });

    test('throws OutputParseError on empty output', () => {
        assert.throws(() => {
            parseScanOutput('   ');
        }, OutputParseError);
    });

    test('throws OutputParseError on invalid JSON syntax', () => {
        assert.throws(() => {
            parseScanOutput('{ "summary": { not valid json } }');
        }, OutputParseError);
    });

    test('throws OutputParseError on missing summary', () => {
        assert.throws(() => {
            parseScanOutput(JSON.stringify({ findings: [] }));
        }, OutputParseError);
    });

    test('throws OutputParseError on missing findings', () => {
        assert.throws(() => {
            parseScanOutput(JSON.stringify({ summary: {} }));
        }, OutputParseError);
    });
});
