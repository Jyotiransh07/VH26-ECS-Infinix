from pydantic import BaseModel
from typing import Optional, Any, Dict

class ReportResponse(BaseModel):
    scan_id: str
    format: str  # "json" | "sarif" | "text"
    content: str
    filename: str
    mime_type: str
