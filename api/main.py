import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from api.routes.health import router as health_router
from api.routes.scans import router as scans_router
from api.routes.issues import router as issues_router
from api.routes.projects import router as projects_router
from api.routes.rules import router as rules_router
from api.routes.reports import router as reports_router
from api.routes.integrations import router as integrations_router

app = FastAPI(
    title="LeakGuard Dashboard API",
    description="Backend API layer for LeakGuard Python Resource Leak Detection Platform",
    version="0.1.0"
)

# Enable CORS for local Vite development & custom domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers under /api
app.include_router(health_router, prefix="/api")
app.include_router(scans_router, prefix="/api")
app.include_router(issues_router, prefix="/api")
app.include_router(projects_router, prefix="/api")
app.include_router(rules_router, prefix="/api")
app.include_router(reports_router, prefix="/api")
app.include_router(integrations_router, prefix="/api")

# Serve built frontend if available
dist_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")
if not os.path.exists(dist_dir):
    dist_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "dashboard", "dist")

if os.path.exists(dist_dir):
    app.mount("/assets", StaticFiles(directory=os.path.join(dist_dir, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        file_path = os.path.join(dist_dir, full_path)
        if full_path and os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(dist_dir, "index.html"))
else:
    @app.get("/")
    def root():
        return {
            "name": "LeakGuard API",
            "version": "0.1.0",
            "docs_url": "/docs",
            "status": "online"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)
