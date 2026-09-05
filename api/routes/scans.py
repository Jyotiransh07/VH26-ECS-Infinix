from fastapi import APIRouter, HTTPException
from typing import List
from api.schemas.scan import ScanResponse, ScanRequest
from api.services.scan_service import scan_service

router = APIRouter(prefix="/scans", tags=["Scans"])

@router.get("", response_model=List[ScanResponse])
def get_all_scans():
    return scan_service.list_scans()

@router.post("", response_model=ScanResponse)
def trigger_scan(request: ScanRequest):
    try:
        return scan_service.run_scan(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scan execution failed: {str(e)}")

@router.get("/{scan_id}", response_model=ScanResponse)
def get_scan_by_id(scan_id: str):
    scan = scan_service.get_scan(scan_id)
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    return scan
