import argparse
import sys
import os
from leakguard.analysis.analyzer import Analyzer
from leakguard.reporting.console import print_console_report
from leakguard.reporting.json_report import generate_json_report
from leakguard.reporting.sarif import generate_sarif_report
from leakguard.models.resource import Confidence

def main():
    parser = argparse.ArgumentParser(description="LeakGuard: Find the leak before production does.")
    subparsers = parser.add_subparsers(dest="command")
    
    scan_parser = subparsers.add_parser("scan", help="Scan a directory or file for resource leaks")
    scan_parser.add_argument("path", help="Path to scan (.py file or directory)")
    scan_parser.add_argument("--format", choices=["text", "json", "sarif"], default="text", help="Output format")
    scan_parser.add_argument("--config", default="leakguard/rules/resources.yaml", help="Path to resources config")
    
    args = parser.parse_args()
    
    if args.command == "scan":
        if not os.path.exists(args.path):
            print(f"Error: Path {args.path} does not exist.")
            sys.exit(2)
            
        analyzer = Analyzer(args.config)
        
        # We also need resources_detected count for the report.
        # But Analyzer.analyze_directory returns findings, not all resources.
        # Let's count files scanned manually.
        files_scanned = 0
        all_findings = []
        
        if os.path.isfile(args.path):
            if args.path.endswith('.py'):
                all_findings.extend(analyzer.analyze_file(args.path))
                files_scanned = 1
        else:
            for root, _, files in os.walk(args.path):
                for file in files:
                    if file.endswith('.py'):
                        filepath = os.path.join(root, file)
                        all_findings.extend(analyzer.analyze_file(filepath))
                        files_scanned += 1
                        
        # We don't have exact 'resources_detected' count if we filter SAFE out inside analyze_file.
        # Wait, analyze_file returns findings for ALL resources, or only leaks?
        # In Analyzer, I returned ALL findings including SAFE!
        # Oh! If I return SAFE, then I can filter them here.
        resources_detected = len(all_findings)
        leaks = [f for f in all_findings if f.confidence != Confidence.SAFE]
        
        if args.format == "text":
            print_console_report(leaks, files_scanned, resources_detected)
        elif args.format == "json":
            print(generate_json_report(leaks, files_scanned))
        elif args.format == "sarif":
            print(generate_sarif_report(leaks))
            
        has_definite = any(f.confidence == Confidence.DEFINITE for f in leaks)
        
        if has_definite:
            sys.exit(1)
        else:
            sys.exit(0)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
