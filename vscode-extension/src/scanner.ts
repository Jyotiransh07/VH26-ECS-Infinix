import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { spawn } from 'child_process';
import { ScanReport } from './leakguard';
import { parseScanOutput } from './outputParser';

export interface CommandResolution {
    command: string;
    argsPrefix: string[];
    description: string;
}

export class Scanner {
    private isScanning = false;
    private outputChannel: vscode.OutputChannel;

    constructor(outputChannel: vscode.OutputChannel) {
        this.outputChannel = outputChannel;
    }

    /**
     * Intelligently resolves the LeakGuard CLI or Python runner following the priority order:
     * 1. Configured leakguard.cliPath
     * 2. Workspace virtual environment (.venv, venv, env, .env)
     * 3. Configured leakguard.pythonPath
     * 4. System python -m leakguard.cli
     * 5. System leakguard executable
     */
    public async resolveRunner(workspaceRoot?: string): Promise<CommandResolution> {
        const config = vscode.workspace.getConfiguration('leakguard');
        const customCliPath = config.get<string>('cliPath')?.trim();
        const customPythonPath = config.get<string>('pythonPath')?.trim();

        // 1. Configured leakguard.cliPath
        if (customCliPath) {
            const resolvedCli = this.resolvePath(customCliPath, workspaceRoot);
            if (fs.existsSync(resolvedCli)) {
                if (resolvedCli.endsWith('.py')) {
                    const pythonCmd = customPythonPath || (process.platform === 'win32' ? 'python' : 'python3');
                    return {
                        command: pythonCmd,
                        argsPrefix: [resolvedCli],
                        description: `Configured CLI script: ${resolvedCli}`
                    };
                }
                return {
                    command: resolvedCli,
                    argsPrefix: [],
                    description: `Configured CLI binary: ${resolvedCli}`
                };
            } else {
                this.outputChannel.appendLine(`[WARNING] Configured leakguard.cliPath not found: ${resolvedCli}`);
            }
        }

        // 2. Workspace virtual environment
        if (workspaceRoot) {
            const venvDirs = ['.venv', 'venv', 'env', '.env'];
            for (const venvDir of venvDirs) {
                const venvPath = path.join(workspaceRoot, venvDir);
                if (!fs.existsSync(venvPath)) {
                    continue;
                }

                // Check for leakguard binary in venv
                const venvBinaries = process.platform === 'win32'
                    ? [path.join(venvPath, 'Scripts', 'leakguard.exe'), path.join(venvPath, 'Scripts', 'leakguard')]
                    : [path.join(venvPath, 'bin', 'leakguard')];

                for (const bin of venvBinaries) {
                    if (fs.existsSync(bin)) {
                        return {
                            command: bin,
                            argsPrefix: [],
                            description: `Workspace virtualenv binary: ${bin}`
                        };
                    }
                }

                // Check for python binary in venv
                const venvPythons = process.platform === 'win32'
                    ? [path.join(venvPath, 'Scripts', 'python.exe'), path.join(venvPath, 'python.exe')]
                    : [path.join(venvPath, 'bin', 'python'), path.join(venvPath, 'bin', 'python3')];

                for (const py of venvPythons) {
                    if (fs.existsSync(py)) {
                        return {
                            command: py,
                            argsPrefix: ['-m', 'leakguard.cli'],
                            description: `Workspace virtualenv module: ${py} -m leakguard.cli`
                        };
                    }
                }
            }
        }

        // 3. Configured Python path
        if (customPythonPath) {
            const resolvedPy = this.resolvePath(customPythonPath, workspaceRoot);
            if (fs.existsSync(resolvedPy)) {
                return {
                    command: resolvedPy,
                    argsPrefix: ['-m', 'leakguard.cli'],
                    description: `Configured Python path: ${resolvedPy} -m leakguard.cli`
                };
            }
        }

        // 4. Test system python -m leakguard.cli
        const pythonCandidates = process.platform === 'win32' ? ['python', 'py'] : ['python3', 'python'];
        for (const py of pythonCandidates) {
            const works = await this.testCommand(py, ['-m', 'leakguard.cli', '--help'], workspaceRoot);
            if (works) {
                return {
                    command: py,
                    argsPrefix: ['-m', 'leakguard.cli'],
                    description: `System Python module: ${py} -m leakguard.cli`
                };
            }
        }

        // 5. Test system leakguard executable
        const cliWorks = await this.testCommand('leakguard', ['--help'], workspaceRoot);
        if (cliWorks) {
            return {
                command: 'leakguard',
                argsPrefix: [],
                description: 'System leakguard command'
            };
        }

        this.outputChannel.appendLine('[ERROR] LeakGuard executable not found');
        throw new Error(
            'LeakGuard could not be located.\n\n' +
            'Please verify that LeakGuard is installed in your Python environment (`pip install .` or `pip install leakguard`), ' +
            'or configure "leakguard.cliPath" / "leakguard.pythonPath" in VS Code settings.'
        );
    }

    /**
     * Executes a scan against the specified target (file or workspace directory).
     */
    public async runScan(targetPath: string, workspaceRoot?: string): Promise<ScanReport> {
        if (this.isScanning) {
            this.outputChannel.appendLine('[WARNING] Scan already in progress. Skipping duplicate scan request.');
            throw new Error('A LeakGuard scan is already running.');
        }

        this.isScanning = true;
        this.outputChannel.appendLine('[INFO] Starting scan');
        this.outputChannel.appendLine(`[INFO] Target: ${targetPath}`);

        try {
            const runner = await this.resolveRunner(workspaceRoot);
            this.outputChannel.appendLine(`[INFO] Using LeakGuard runner: ${runner.description}`);

            const args = [...runner.argsPrefix, 'scan', targetPath, '--format', 'json'];

            // Check for custom config path
            const config = vscode.workspace.getConfiguration('leakguard');
            const customConfig = config.get<string>('configPath')?.trim();
            if (customConfig) {
                const resolvedConfig = this.resolvePath(customConfig, workspaceRoot);
                if (fs.existsSync(resolvedConfig)) {
                    args.push('--config', resolvedConfig);
                }
            } else if (workspaceRoot) {
                const defaultYaml = path.join(workspaceRoot, 'leakguard', 'rules', 'resources.yaml');
                if (fs.existsSync(defaultYaml)) {
                    args.push('--config', defaultYaml);
                }
            }

            this.outputChannel.appendLine(`[INFO] Running LeakGuard: ${runner.command} ${args.join(' ')}`);

            const workingDir = workspaceRoot || path.dirname(targetPath);
            const timeoutMs = config.get<number>('timeout', 15000);
            const { stdout, stderr, exitCode } = await this.executeProcess(runner.command, args, workingDir, timeoutMs);

            if (exitCode === 2) {
                this.outputChannel.appendLine(`[ERROR] Scan failed: target path does not exist (${targetPath})`);
                throw new Error(`Target path does not exist: ${targetPath}`);
            }

            if (stderr && stderr.trim().length > 0) {
                this.outputChannel.appendLine(`[STDERR] ${stderr.trim()}`);
            }

            this.outputChannel.appendLine('[INFO] Parsing results');
            let report: ScanReport;
            try {
                report = parseScanOutput(stdout, workingDir);
            } catch (parseErr: any) {
                this.outputChannel.appendLine(`[ERROR] Invalid JSON output: ${parseErr.message}`);
                this.outputChannel.appendLine(`[RAW OUTPUT] ${stdout}`);
                throw parseErr;
            }

            const total = report.findings.length;
            this.outputChannel.appendLine(`[INFO] Found ${total} issues (Definite: ${report.summary.definite_leaks}, Likely: ${report.summary.likely_leaks})`);

            return report;
        } catch (err: any) {
            if (!err.message.includes('A LeakGuard scan is already running')) {
                this.outputChannel.appendLine(`[ERROR] Scan failed: ${err.message}`);
            }
            throw err;
        } finally {
            this.isScanning = false;
        }
    }

    /**
     * Executes a SARIF report generation against the specified target.
     */
    public async runSarif(targetPath: string, workspaceRoot?: string): Promise<string> {
        this.outputChannel.appendLine(`[INFO] Generating SARIF report for: ${targetPath}`);
        const runner = await this.resolveRunner(workspaceRoot);
        const args = [...runner.argsPrefix, 'scan', targetPath, '--format', 'sarif'];

        const defaultYaml = workspaceRoot ? path.join(workspaceRoot, 'leakguard', 'rules', 'resources.yaml') : undefined;
        if (defaultYaml && fs.existsSync(defaultYaml)) {
            args.push('--config', defaultYaml);
        }

        const workingDir = workspaceRoot || path.dirname(targetPath);
        const config = vscode.workspace.getConfiguration('leakguard');
        const timeoutMs = config.get<number>('timeout', 15000);
        const { stdout, exitCode } = await this.executeProcess(runner.command, args, workingDir, timeoutMs);

        if (exitCode === 2) {
            throw new Error(`Target path does not exist: ${targetPath}`);
        }

        return stdout;
    }

    private executeProcess(
        command: string,
        args: string[],
        cwd: string,
        timeoutMs = 15000
    ): Promise<{ stdout: string; stderr: string; exitCode: number }> {
        return new Promise((resolve, reject) => {
            const childEnv = {
                ...process.env,
                PYTHONUTF8: '1',
                PYTHONUNBUFFERED: '1'
            };

            let timedOut = false;
            const child = spawn(command, args, {
                cwd,
                env: childEnv,
                shell: process.platform === 'win32'
            });

            const timer = setTimeout(() => {
                timedOut = true;
                child.kill('SIGTERM');
                reject(new Error(`LeakGuard process timed out after ${timeoutMs}ms.`));
            }, timeoutMs);

            let stdout = '';
            let stderr = '';

            child.stdout.on('data', (data) => {
                stdout += data.toString('utf-8');
            });

            child.stderr.on('data', (data) => {
                stderr += data.toString('utf-8');
            });

            child.on('error', (err: any) => {
                clearTimeout(timer);
                if (err.code === 'ENOENT') {
                    reject(new Error(`Command not found: ${command}. Please ensure Python or LeakGuard is installed.`));
                } else if (err.code === 'EACCES') {
                    reject(new Error(`Permission denied executing: ${command}. Check file execution permissions.`));
                } else {
                    reject(err);
                }
            });

            child.on('close', (code) => {
                clearTimeout(timer);
                if (timedOut) {
                    return;
                }
                resolve({
                    stdout,
                    stderr,
                    exitCode: code ?? 0
                });
            });
        });
    }

    private testCommand(command: string, args: string[], cwd?: string): Promise<boolean> {
        return new Promise((resolve) => {
            try {
                const child = spawn(command, args, {
                    cwd,
                    env: { ...process.env, PYTHONUTF8: '1' },
                    shell: process.platform === 'win32'
                });

                let exited = false;
                const timeout = setTimeout(() => {
                    if (!exited) {
                        child.kill();
                        resolve(false);
                    }
                }, 4000);

                child.on('error', () => {
                    exited = true;
                    clearTimeout(timeout);
                    resolve(false);
                });

                child.on('close', (code) => {
                    exited = true;
                    clearTimeout(timeout);
                    resolve(code === 0);
                });
            } catch {
                resolve(false);
            }
        });
    }

    private resolvePath(target: string, baseDir?: string): string {
        if (path.isAbsolute(target)) {
            return target;
        }
        if (baseDir) {
            return path.resolve(baseDir, target);
        }
        return path.resolve(target);
    }
}
