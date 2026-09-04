import json
from typing import List
from leakguard.models.finding import Finding
from leakguard.models.resource import Confidence

def generate_json_report(findings: List[Finding], files_scanned: int) -> str:
    total_resources = len(findings) # Assuming we only have leaking ones here, wait, we don't have total detected count easily.
    # Let's just output the findings
    
    definite_leaks = sum(1 for f in findings if f.confidence == Confidence.DEFINITE)
    likely_leaks = sum(1 for f in findings if f.confidence == Confidence.LIKELY)
    unknown = sum(1 for f in findings if f.confidence == Confidence.UNKNOWN)
    
    report = {
        "summary": {
            "files_scanned": files_scanned,
            "definite_leaks": definite_leaks,
            "likely_leaks": likely_leaks,
            "unknown": unknown
        },
        "findings": [
            {
                "file": f.file,
                "line": f.acquisition_location.line,
                "column": f.acquisition_location.column,
                "resource_type": f.resource_type,
                "variable_name": f.variable_name,
                "severity": f.severity,
                "confidence": f.confidence.name,
                "reason": f.reason,
                "path": [loc.line for loc in f.path],
                "suggestion": f.suggestion
            }
            for f in findings
        ]
    }
    return json.dumps(report, indent=2)
