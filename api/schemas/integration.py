from pydantic import BaseModel
from typing import Optional, Dict, Any, List

class IntegrationStatus(BaseModel):
    id: str
    name: str
    status: str  # "Available" | "Connected" | "Configured" | "Not Configured"
    type: str
    description: str
    last_active: Optional[str] = None
    details: Dict[str, Any] = {}

class GitHubActionsDetails(BaseModel):
    is_configured: bool
    workflow_path: Optional[str] = None
    workflow_content: Optional[str] = None
    action_yml_content: Optional[str] = None
    last_run_status: str = "BLOCKED"
    last_commit: str = "HEAD"
    branch: str = "main"

class PreCommitDetails(BaseModel):
    is_configured: bool
    config_sample: str
    install_command: str

class CLIDetails(BaseModel):
    is_installed: bool
    version: str
    binary_command: str
    module_command: str
    supported_formats: List[str]
