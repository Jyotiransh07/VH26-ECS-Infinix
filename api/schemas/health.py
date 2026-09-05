from pydantic import BaseModel
from typing import Dict, Any

class HealthResponse(BaseModel):
    status: str = "ok"
    engine_online: bool = True
    api_online: bool = True
    rules_loaded: int = 3
    version: str = "0.1.0"
    active_scans: int = 0
    system_time: str
