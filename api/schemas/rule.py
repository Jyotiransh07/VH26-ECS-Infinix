from pydantic import BaseModel, Field
from typing import List

class ResourceRuleSchema(BaseModel):
    name: str
    acquire: List[str]
    release: List[str]
    status: str = "Enabled"
    description: str = ""

class RulesConfigSchema(BaseModel):
    resources: List[ResourceRuleSchema]
    config_path: str
