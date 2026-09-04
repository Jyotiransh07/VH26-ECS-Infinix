import json
from typing import List
from leakguard.models.finding import Finding
from leakguard.models.resource import Confidence

def generate_sarif_report(findings: List[Finding]) -> str:
    results = []
    for f in findings:
        level = "error" if f.confidence == Confidence.DEFINITE else "warning"
        
        results.append({
            "ruleId": "RESOURCE_LEAK",
            "level": level,
            "message": {
                "text": f.reason
            },
            "locations": [
                {
                    "physicalLocation": {
                        "artifactLocation": {
                            "uri": f.file
                        },
                        "region": {
                            "startLine": f.acquisition_location.line,
                            "startColumn": f.acquisition_location.column + 1
                        }
                    }
                }
            ]
        })
        
    sarif = {
        "$schema": "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json",
        "version": "2.1.0",
        "runs": [
            {
                "tool": {
                    "driver": {
                        "name": "LeakGuard",
                        "informationUri": "https://github.com/Jyotiransh07/VH26-ECS-Infinix",
                        "rules": [
                            {
                                "id": "RESOURCE_LEAK",
                                "shortDescription": {
                                    "text": "Resource leak detected."
                                },
                                "helpUri": "https://github.com/Jyotiransh07/VH26-ECS-Infinix"
                            }
                        ]
                    }
                },
                "results": results
            }
        ]
    }
    return json.dumps(sarif, indent=2)
