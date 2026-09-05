from fastapi import APIRouter, HTTPException, Query
from api.schemas.report import ReportResponse
from api.services.report_service import report_service

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/{scan_id}", response_model=ReportResponse)
def get_scan_report(
    scan_id: str,
    format: str = Query("json", pattern="^(json|sarif|text)$")
):
    report = report_service.get_report(scan_id, format)
    if not report:
        raise HTTPException(status_code=404, detail="Scan not found or report generation failed")
    return report
