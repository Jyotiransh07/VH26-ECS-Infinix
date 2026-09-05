from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from api.schemas.issue import FindingSchema
from api.services.scan_service import scan_service

router = APIRouter(prefix="/issues", tags=["Issues"])

@router.get("", response_model=List[FindingSchema])
def get_all_issues(
    severity: Optional[str] = Query(None),
    confidence: Optional[str] = Query(None),
    resource_type: Optional[str] = Query(None)
):
    issues = scan_service.list_issues()
    if severity:
        issues = [i for i in issues if i.severity.upper() == severity.upper()]
    if confidence:
        issues = [i for i in issues if i.confidence.upper() == confidence.upper()]
    if resource_type:
        issues = [i for i in issues if i.resource_type.lower() == resource_type.lower()]
    return issues

@router.get("/{issue_id}", response_model=FindingSchema)
def get_issue_by_id(issue_id: str):
    issue = scan_service.get_issue(issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    return issue
