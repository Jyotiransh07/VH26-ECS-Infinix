"""
LeakGuard Web Dashboard & API Server Launcher
Run with: python run_dashboard.py
"""
import sys
# pyrefly: ignore [missing-import]
import uvicorn

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding='utf-8')

if __name__ == "__main__":
    print("=" * 65)
    print("      LEAKGUARD — WEB DASHBOARD & STATIC ANALYSIS API        ")
    print("=" * 65)
    print("🚀 Web Dashboard UI is LIVE at:  http://127.0.0.1:8000/")
    print("📚 API Documentation at:        http://127.0.0.1:8000/docs")
    print("=" * 65)
    
    uvicorn.run("api.main:app", host="[IP_ADDRESS]", port=8000, reload=True)
