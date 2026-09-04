from typing import List
from leakguard.models.finding import Finding
from leakguard.models.resource import Confidence

def print_console_report(findings: List[Finding], files_scanned: int, resources_detected: int):
    definite_leaks = [f for f in findings if f.confidence == Confidence.DEFINITE]
    likely_leaks = [f for f in findings if f.confidence == Confidence.LIKELY]
    unknown = [f for f in findings if f.confidence == Confidence.UNKNOWN]
    
    if definite_leaks or likely_leaks:
        print("=========================================")
        print("        LEAKGUARD SCAN RESULTS")
        print("=========================================\n")
        
        for f in definite_leaks:
            print(str(f))
            print("-" * 40 + "\n")
            
        for f in likely_leaks:
            print(str(f))
            print("-" * 40 + "\n")
            
        print("=========================================")
        print(f"Files scanned: {files_scanned}")
        print(f"Resources detected: {resources_detected}")
        print(f"Definite leaks: {len(definite_leaks)}")
        print(f"Likely leaks: {len(likely_leaks)}")
        print(f"Unknown: {len(unknown)}")
        print("=========================================")
    else:
        print("LeakGuard passed.\n")
        print(f"Files scanned: {files_scanned}")
        print(f"Resources detected: {resources_detected}")
        print("Definite leaks: 0")
        print("Likely leaks: 0")
        print("Unknown: 0")
