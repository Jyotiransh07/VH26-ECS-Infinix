import os
from typing import List, Optional
from api.schemas.project import ProjectSchema
from api.services.scan_service import scan_service

class ProjectService:
    def list_projects(self) -> List[ProjectSchema]:
        projects = []
        
        # 1. Sample Repo
        if os.path.exists("sample-repo-python"):
            files_count = sum(1 for root, _, files in os.walk("sample-repo-python") for f in files if f.endswith(".py"))
            projects.append(ProjectSchema(
                id="proj-sample-python",
                name="sample-repo-python",
                path="sample-repo-python",
                repository="Jyotiransh07/VH26-ECS-Infinix",
                branch="main",
                last_scan="2m ago",
                files_count=files_count,
                issues_count=4,
                definite_count=4,
                status="BLOCKED",
                risk_level="High"
            ))
            
        # 2. Demo Project
        if os.path.exists("demo-project"):
            files_count = sum(1 for root, _, files in os.walk("demo-project") for f in files if f.endswith(".py"))
            projects.append(ProjectSchema(
                id="proj-demo-project",
                name="demo-project",
                path="demo-project",
                repository="Jyotiransh07/VH26-ECS-Infinix",
                branch="feature/leak-fixes",
                last_scan="10m ago",
                files_count=files_count,
                issues_count=1,
                definite_count=1,
                status="BLOCKED",
                risk_level="Medium"
            ))
            
        # 3. LeakGuard Core Engine
        if os.path.exists("leakguard"):
            files_count = sum(1 for root, _, files in os.walk("leakguard") for f in files if f.endswith(".py"))
            projects.append(ProjectSchema(
                id="proj-leakguard-core",
                name="leakguard-core",
                path="leakguard",
                repository="Jyotiransh07/VH26-ECS-Infinix",
                branch="main",
                last_scan="1h ago",
                files_count=files_count,
                issues_count=0,
                definite_count=0,
                status="PASS",
                risk_level="Low"
            ))
            
        return projects

    def get_project(self, project_id: str) -> Optional[ProjectSchema]:
        projects = self.list_projects()
        for p in projects:
            if p.id == project_id or p.name == project_id:
                return p
        return None

project_service = ProjectService()
