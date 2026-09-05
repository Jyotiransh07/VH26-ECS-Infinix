from fastapi import APIRouter
from datetime import datetime, timezone
import yaml
import os
from api.schemas.health import HealthResponse

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("", response_model=HealthResponse)
def get_health():
    rules_count = 0
    rules_file = "leakguard/rules/resources.yaml"
    if os.path.exists(rules_file):
        try:
            with open(rules_file, "r", encoding="utf-8") as f:
                data = yaml.safe_load(f)
                rules_count = len(data.get("resources", []))
        except Exception:
            rules_count = 3

    return HealthResponse(
        status="ok",
        engine_online=True,
        api_online=True,
        rules_loaded=rules_count,
        version="0.1.0",
        active_scans=0,
        system_time=datetime.now(timezone.utc).isoformat()
    )
