from pydantic import BaseModel, Field
from typing import List, Optional

class ProjectSchema(BaseModel):
    id: str
    name: str
    path: str
    repository: str
    branch: str
    last_scan: Optional[str] = None
    files_count: int = 0
    issues_count: int = 0
    definite_count: int = 0
    status: str = "PASS"  # PASS | BLOCKED | UNKNOWN
    risk_level: str = "Low"  # Low | Medium | High
