from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class LocationSchema(BaseModel):
    line: int
    column: int

class CFGNodeSchema(BaseModel):
    id: int
    label: str
    type: str  # e.g., 'acquisition', 'branch', 'return', 'cleanup', 'exit', 'statement'
    line: Optional[int] = None
    is_exit: bool = False
    is_leaking: bool = False
    next_ids: List[int] = Field(default_factory=list)
    exception_ids: List[int] = Field(default_factory=list)

class FindingSchema(BaseModel):
    id: str
    file: str
    resource_type: str
    variable_name: str
    line: int
    column: int
    severity: str  # HIGH, MEDIUM, LOW, INFO
    confidence: str  # DEFINITE, LIKELY, SAFE, UNKNOWN
    reason: str
    path: List[int] = Field(default_factory=list)
    suggestion: str
    code_snippet: Optional[str] = None
    snippet_start_line: Optional[int] = 1
    why_flagged: Optional[str] = None
    cfg_nodes: Optional[List[CFGNodeSchema]] = None
