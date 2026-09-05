from fastapi import APIRouter, HTTPException
from typing import List
from api.schemas.project import ProjectSchema
from api.services.project_service import project_service

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.get("", response_model=List[ProjectSchema])
def get_all_projects():
    return project_service.list_projects()

@router.get("/{project_id}", response_model=ProjectSchema)
def get_project_by_id(project_id: str):
    project = project_service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project
