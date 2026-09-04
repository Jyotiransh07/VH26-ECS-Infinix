from typing import List
from leakguard.models.finding import Finding
from leakguard.models.resource import Confidence
import sys

def print_console_report(findings: List[Finding], files_scanned: int, resources_detected: int):
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding='utf-8')
        
    definite_leaks = [f for f in findings if f.confidence == Confidence.DEFINITE]
    likely_leaks = [f for f in findings if f.confidence == Confidence.LIKELY]
    unknown = [f for f in findings if f.confidence == Confidence.UNKNOWN]
    
    # ANSI Color Codes
    BOLD = '\033[1m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    GREEN = '\033[92m'
    CYAN = '\033[96m'
    RESET = '\033[0m'
    
    if definite_leaks or likely_leaks:
        print(f"\n{BOLD}{CYAN}========================================={RESET}")
        print(f"{BOLD}{CYAN}        🛡️ LEAKGUARD SCAN RESULTS{RESET}")
        print(f"{BOLD}{CYAN}========================================={RESET}\n")
        
        for f in definite_leaks:
            print(f"{BOLD}{RED}🚨 [HIGH] DEFINITE RESOURCE LEAK{RESET}\n")
            print(f"📁 {BOLD}File:{RESET} {f.file}:{f.acquisition_location.line}")
            print(f"📦 {BOLD}Resource:{RESET} {f.resource_type.capitalize()} '{f.variable_name}'")
            print(f"🛤️  {BOLD}Leaking path:{RESET} {' -> '.join([str(loc.line) for loc in f.path]) + ' -> EXIT' if f.path else 'EXIT'}")
            print(f"⚠️  {BOLD}Reason:{RESET} {f.reason}")
            print(f"💡 {BOLD}Suggestion:{RESET} {f.suggestion}")
            print("\n" + "-" * 40 + "\n")
            
        for f in likely_leaks:
            print(f"{BOLD}{YELLOW}⚠️  [MEDIUM] LIKELY RESOURCE LEAK{RESET}\n")
            print(f"📁 {BOLD}File:{RESET} {f.file}:{f.acquisition_location.line}")
            print(f"📦 {BOLD}Resource:{RESET} {f.resource_type.capitalize()} '{f.variable_name}'")
            print(f"🛤️  {BOLD}Leaking path:{RESET} {' -> '.join([str(loc.line) for loc in f.path]) + ' -> EXIT' if f.path else 'EXIT'}")
            print(f"⚠️  {BOLD}Reason:{RESET} {f.reason}")
            print(f"💡 {BOLD}Suggestion:{RESET} {f.suggestion}")
            print("\n" + "-" * 40 + "\n")
            
        print(f"{BOLD}📊 SUMMARY STATISTICS{RESET}")
        print(f"=========================================")
        print(f"Files scanned: {files_scanned}")
        print(f"Resources detected: {resources_detected}")
        print(f"{RED}Definite leaks: {len(definite_leaks)}{RESET}")
        print(f"{YELLOW}Likely leaks: {len(likely_leaks)}{RESET}")
        print(f"Unknown: {len(unknown)}")
        print(f"=========================================\n")
    else:
        print(f"\n{BOLD}{GREEN}✅ LeakGuard Passed! No leaks detected.{RESET}\n")
        print(f"{BOLD}📊 SUMMARY STATISTICS{RESET}")
        print(f"Files scanned: {files_scanned}")
        print(f"Resources detected: {resources_detected}")
        print(f"{GREEN}Definite leaks: 0{RESET}")
        print(f"{GREEN}Likely leaks: 0{RESET}")
        print(f"Unknown: 0\n")