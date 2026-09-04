import * as path from 'path';
import { ScanReport, Finding } from './leakguard';

export class OutputParseError extends Error {
    constructor(message: string, public readonly rawOutput: string) {
        super(message);
        this.name = 'OutputParseError';
    }
}

/**
 * Parses stdout from `leakguard scan <target> --format json` into a validated ScanReport.
 */
export function parseScanOutput(rawOutput: string, baseDir?: string): ScanReport {
    const trimmed = rawOutput.trim();
    if (!trimmed) {
        throw new OutputParseError('LeakGuard CLI returned empty output.', rawOutput);
    }

    // Extract JSON substring in case Python or environment emitted warnings/banners before or after JSON
    let jsonStr = trimmed;
    const firstBrace = trimmed.indexOf('{');
    const lastBrace = trimmed.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        jsonStr = trimmed.substring(firstBrace, lastBrace + 1);
    } else {
        throw new OutputParseError('No JSON object found in LeakGuard output.', rawOutput);
    }

    let parsed: any;
    try {
        parsed = JSON.parse(jsonStr);
    } catch (err: any) {
        throw new OutputParseError(`Failed to parse LeakGuard JSON output: ${err.message}`, rawOutput);
    }

    if (!parsed || typeof parsed !== 'object') {
        throw new OutputParseError('Invalid JSON structure: expected root object.', rawOutput);
    }

    if (!parsed.summary || typeof parsed.summary !== 'object') {
        throw new OutputParseError("Invalid JSON structure: missing 'summary' object.", rawOutput);
    }

    if (!Array.isArray(parsed.findings)) {
        throw new OutputParseError("Invalid JSON structure: missing 'findings' array.", rawOutput);
    }

    const normalizedFindings: Finding[] = parsed.findings.map((f: any, index: number) => {
        if (!f.file || typeof f.line !== 'number') {
            throw new OutputParseError(
                `Finding at index ${index} is missing required 'file' or 'line' property.`,
                rawOutput
            );
        }

        let filePath = f.file;
        if (baseDir && !path.isAbsolute(filePath)) {
            filePath = path.resolve(baseDir, filePath);
        }

        return {
            file: filePath,
            line: Number(f.line),
            column: Number(f.column ?? 0),
            resource_type: String(f.resource_type ?? 'resource'),
            variable_name: String(f.variable_name ?? '<unnamed>'),
            severity: (f.severity ?? 'HIGH') as any,
            confidence: (f.confidence ?? 'DEFINITE') as any,
            reason: String(f.reason ?? 'Resource cleanup can be bypassed.'),
            path: Array.isArray(f.path) ? f.path.map(Number) : [],
            suggestion: String(f.suggestion ?? 'Ensure proper resource cleanup.')
        };
    });

    return {
        summary: {
            files_scanned: Number(parsed.summary.files_scanned ?? 0),
            definite_leaks: Number(parsed.summary.definite_leaks ?? 0),
            likely_leaks: Number(parsed.summary.likely_leaks ?? 0),
            unknown: Number(parsed.summary.unknown ?? 0)
        },
        findings: normalizedFindings
    };
}
