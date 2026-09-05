import json
import os
from typing import Optional
from api.schemas.report import ReportResponse
from api.services.scan_service import scan_service
from leakguard.models.finding import Finding
from leakguard.models.location import Location
from leakguard.models.resource import Confidence
from leakguard.reporting.json_report import generate_json_report
from leakguard.reporting.sarif import generate_sarif_report

class ReportService:
    def get_report(self, scan_id: str, fmt: str = "json") -> Optional[ReportResponse]:
        scan = scan_service.get_scan(scan_id)
        if not scan:
            return None
            
        # Reconstruct Finding objects for official reporters
        findings: list[Finding] = []
        for f in scan.findings:
            conf_enum = Confidence[f.confidence] if f.confidence in Confidence.__members__ else Confidence.UNKNOWN
            loc_path = [Location(line=line_no, column=0) for line_no in f.path]
            finding_obj = Finding(
                file=f.file,
                resource_type=f.resource_type,
                variable_name=f.variable_name,
                acquisition_location=Location(line=f.line, column=f.column),
                reason=f.reason,
                severity=f.severity,
                confidence=conf_enum,
                path=loc_path,
                suggestion=f.suggestion
            )
            findings.append(finding_obj)

        if fmt == "json":
            content = generate_json_report(findings, scan.summary.files_scanned)
            return ReportResponse(
                scan_id=scan_id,
                format="json",
                content=content,
                filename=f"leakguard-report-{scan_id}.json",
                mime_type="application/json"
            )
        elif fmt == "sarif":
            content = generate_sarif_report(findings)
            return ReportResponse(
                scan_id=scan_id,
                format="sarif",
                content=content,
                filename=f"leakguard-report-{scan_id}.sarif",
                mime_type="application/sarif+json"
            )
        else:  # text / console
            lines = [
                "=========================================",
                "        LEAKGUARD SCAN RESULTS           ",
                "=========================================",
                ""
            ]
            for f in findings:
                lines.append(str(f))
                lines.append("-" * 40 + "\n")
            lines.append("=========================================")
            lines.append(f"Files scanned: {scan.summary.files_scanned}")
            lines.append(f"Resources detected: {scan.summary.resources_detected}")
            lines.append(f"Definite leaks: {scan.summary.definite_leaks}")
            lines.append(f"Likely leaks: {scan.summary.likely_leaks}")
            lines.append(f"Unknown: {scan.summary.unknown}")
            lines.append("=========================================")
            
            content = "\n".join(lines)
            return ReportResponse(
                scan_id=scan_id,
                format="text",
                content=content,
                filename=f"leakguard-report-{scan_id}.txt",
                mime_type="text/plain"
            )

report_service = ReportService()
