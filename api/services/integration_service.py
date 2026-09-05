import os
from typing import List, Dict, Any
from api.schemas.integration import (
    IntegrationStatus,
    GitHubActionsDetails,
    PreCommitDetails,
    CLIDetails
)

class IntegrationService:
    def list_integrations(self) -> List[IntegrationStatus]:
        integrations = []
        
        # 1. CLI
        integrations.append(IntegrationStatus(
            id="cli",
            name="LeakGuard CLI",
            status="Available",
            type="Command Line Tool",
            description="Run static resource leak analysis directly in your local terminal or CI script.",
            last_active="Active",
            details={
                "command": "leakguard scan .",
                "formats": ["text", "json", "sarif"]
            }
        ))
        
        # 2. GitHub Actions
        has_gh = os.path.exists(".github/workflows") or os.path.exists("action.yml")
        integrations.append(IntegrationStatus(
            id="github",
            name="GitHub Actions",
            status="Connected" if has_gh else "Not Configured",
            type="CI/CD Pipeline",
            description="Automatically scan pull requests and pushes, blocking PRs with definite resource leaks.",
            last_active="Last workflow: Configured",
            details={
                "action_yml": os.path.exists("action.yml"),
                "workflow": os.path.exists(".github/workflows/leakguard.yml")
            }
        ))
        
        # 3. Pre-commit
        has_precommit = os.path.exists(".pre-commit-config.yaml")
        integrations.append(IntegrationStatus(
            id="precommit",
            name="Pre-commit Hook",
            status="Configured" if has_precommit else "Available",
            type="Git Hook",
            description="Catch unclosed files, sockets, and connections before git commit completes.",
            last_active="Ready",
            details={"hook_id": "leakguard"}
        ))
        
        # 4. SARIF Reporting
        integrations.append(IntegrationStatus(
            id="sarif",
            name="SARIF Code Scanning",
            status="Available",
            type="Security Standard",
            description="OASIS standard SARIF v2.1.0 output for native GitHub Security tab alerts and IDEs.",
            last_active="Ready",
            details={"version": "2.1.0"}
        ))
        
        # 5. FastAPI REST API
        integrations.append(IntegrationStatus(
            id="fastapi",
            name="FastAPI Engine Bridge",
            status="Connected",
            type="REST API",
            description="Programmatic REST API to trigger scans, inspect CFGs, and export reports in real-time.",
            last_active="Online",
            details={"port": 8000, "engine": "LeakGuard AST/CFG Analyzer"}
        ))
        
        return integrations

    def get_github_details(self) -> GitHubActionsDetails:
        action_content = ""
        if os.path.exists("action.yml"):
            try:
                with open("action.yml", "r", encoding="utf-8") as f:
                    action_content = f.read()
            except Exception:
                pass
                
        wf_content = ""
        wf_path = ".github/workflows/leakguard.yml"
        if os.path.exists(wf_path):
            try:
                with open(wf_path, "r", encoding="utf-8") as f:
                    wf_content = f.read()
            except Exception:
                pass
                
        return GitHubActionsDetails(
            is_configured=bool(action_content or wf_content),
            workflow_path=wf_path if wf_content else "action.yml",
            workflow_content=wf_content,
            action_yml_content=action_content,
            last_run_status="BLOCKED",
            last_commit="f4a9b1c",
            branch="main"
        )

    def get_precommit_details(self) -> PreCommitDetails:
        sample = (
            "repos:\n"
            "  - repo: https://github.com/Jyotiransh07/VH26-ECS-Infinix\n"
            "    rev: v0.1.0\n"
            "    hooks:\n"
            "      - id: leakguard\n"
            "        name: LeakGuard Resource Leak Detector\n"
            "        entry: leakguard scan .\n"
            "        language: python\n"
            "        types: [python]\n"
        )
        return PreCommitDetails(
            is_configured=os.path.exists(".pre-commit-config.yaml"),
            config_sample=sample,
            install_command="pre-commit install && pre-commit run leakguard --all-files"
        )

    def get_cli_details(self) -> CLIDetails:
        return CLIDetails(
            is_installed=True,
            version="0.1.0",
            binary_command="leakguard scan <path> [--format text|json|sarif]",
            module_command="python -m leakguard.cli scan <path> [--format text|json|sarif]",
            supported_formats=["text", "json", "sarif"]
        )

integration_service = IntegrationService()
