from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from api.schemas.issue import FindingSchema

class ScanSummary(BaseModel):
    files_scanned: int
    resources_detected: int
    definite_leaks: int
    likely_leaks: int
    unknown: int
    safe_patterns: int = 0
    duration_ms: float = 0.0
    status: str = "PASS"  # "PASS" | "BLOCKED" | "WARNING" | "RUNNING"

class ScanRequest(BaseModel):
    target_path: str = "sample-repo-python"
    project_name: Optional[str] = "Sample Python Repo"
    branch: Optional[str] = "main"
    config_path: Optional[str] = "leakguard/rules/resources.yaml"

class ScanResponse(BaseModel):
    id: str
    project_name: str
    target_path: str
    branch: str
    commit: str = "HEAD"
    timestamp: str
    status: str  # "PASS" | "BLOCKED" | "WARNING" | "RUNNING"
    duration_ms: float
    summary: ScanSummary
    findings: List[FindingSchema] = Field(default_factory=list)
