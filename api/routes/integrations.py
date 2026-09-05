from fastapi import APIRouter
from typing import List
from api.schemas.integration import (
    IntegrationStatus,
    GitHubActionsDetails,
    PreCommitDetails,
    CLIDetails
)
from api.services.integration_service import integration_service

router = APIRouter(prefix="/integrations", tags=["Integrations"])

@router.get("", response_model=List[IntegrationStatus])
def get_all_integrations():
    return integration_service.list_integrations()

@router.get("/github", response_model=GitHubActionsDetails)
def get_github_integration():
    return integration_service.get_github_details()

@router.get("/precommit", response_model=PreCommitDetails)
def get_precommit_integration():
    return integration_service.get_precommit_details()

@router.get("/cli", response_model=CLIDetails)
def get_cli_integration():
    return integration_service.get_cli_details()
