import os
import yaml
from fastapi import APIRouter, HTTPException
from api.schemas.rule import RulesConfigSchema, ResourceRuleSchema

router = APIRouter(prefix="/rules", tags=["Rules"])

@router.get("", response_model=RulesConfigSchema)
def get_rules():
    rules_file = "leakguard/rules/resources.yaml"
    if not os.path.exists(rules_file):
        raise HTTPException(status_code=404, detail="Rules file not found")
        
    try:
        with open(rules_file, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f) or {}
            
        rules_list = []
        for item in data.get("resources", []):
            name = item.get("name", "unknown")
            acquire = item.get("acquire", [])
            release = item.get("release", [])
            desc = f"Tracks lifecycle and ensures {', '.join(release)} is called after {', '.join(acquire)}."
            rules_list.append(ResourceRuleSchema(
                name=name,
                acquire=acquire,
                release=release,
                status="Enabled",
                description=desc
            ))
            
        return RulesConfigSchema(
            resources=rules_list,
            config_path=rules_file
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading rules: {str(e)}")
