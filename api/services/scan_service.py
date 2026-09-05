import os
import time
import uuid
import ast
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any

from leakguard.analysis.analyzer import Analyzer
from leakguard.models.resource import Confidence
from leakguard.models.finding import Finding
from api.schemas.scan import ScanResponse, ScanSummary, ScanRequest
from api.schemas.issue import FindingSchema, CFGNodeSchema

# In-memory scan store
_SCANS_STORE: Dict[str, ScanResponse] = {}

def get_code_snippet(filepath: str, center_line: int, window: int = 10) -> tuple[str, int]:
    """Reads lines from source file around center_line."""
    if not os.path.exists(filepath):
        return "# Source file not available on disk.", 1
    try:
        with open(filepath, "r", encoding="utf-8", errors="replace") as f:
            lines = f.readlines()
        
        start = max(1, center_line - window)
        end = min(len(lines), center_line + window)
        snippet_lines = lines[start - 1:end]
        return "".join(snippet_lines), start
    except Exception as e:
        return f"# Error reading file: {e}", 1

def build_cfg_for_finding(finding: Finding, filepath: str) -> List[CFGNodeSchema]:
    """Generates visual CFG nodes and edges representing the execution flow of the finding."""
    nodes = []
    acq_line = finding.acquisition_location.line
    leaking_lines = [loc.line for loc in finding.path] if finding.path else []
    
    # 1. Entry / Acquisition node
    nodes.append(CFGNodeSchema(
        id=1,
        label=f"Acquire {finding.resource_type.capitalize()} ('{finding.variable_name}')",
        type="acquisition",
        line=acq_line,
        is_exit=False,
        is_leaking=False,
        next_ids=[2] if leaking_lines else [3],
        exception_ids=[]
    ))
    
    curr_id = 2
    prev_id = 1
    
    # Intermediate flow / branch nodes from leaking path
    for i, line in enumerate(leaking_lines):
        is_last = (i == len(leaking_lines) - 1)
        node_type = "branch" if i == 0 else ("return" if is_last else "statement")
        label = f"Line {line}: Branch condition" if i == 0 else (f"Line {line}: Early Return / Exit" if is_last else f"Line {line}: Statement")
        
        nxt = [curr_id + 1]
        nodes.append(CFGNodeSchema(
            id=curr_id,
            label=label,
            type=node_type,
            line=line,
            is_exit=False,
            is_leaking=True,
            next_ids=nxt,
            exception_ids=[]
        ))
        prev_id = curr_id
        curr_id += 1
        
    # Safe branch alternative node for visualization
    nodes.append(CFGNodeSchema(
        id=99,
        label=f"{finding.variable_name}.close() [Cleanup Path]",
        type="cleanup",
        line=None,
        is_exit=False,
        is_leaking=False,
        next_ids=[100],
        exception_ids=[]
    ))
    
    # Safe Exit Node
    nodes.append(CFGNodeSchema(
        id=100,
        label="Normal Exit (Resource Closed)",
        type="exit",
        line=None,
        is_exit=True,
        is_leaking=False,
        next_ids=[],
        exception_ids=[]
    ))
    
    # Leaking Exit Node
    nodes.append(CFGNodeSchema(
        id=curr_id,
        label="EXIT (Resource Unclosed)",
        type="exit",
        line=None,
        is_exit=True,
        is_leaking=True,
        next_ids=[],
        exception_ids=[]
    ))
    
    # Add safe branch alternative edge from acquisition/branch
    if len(nodes) > 1 and nodes[0].next_ids:
        nodes[0].next_ids.append(99)
        
    return nodes

def format_why_flagged(finding: Finding) -> str:
    path_str = " -> ".join([f"Line {loc.line}" for loc in finding.path]) + " -> EXIT" if finding.path else "Direct EXIT"
    
    if finding.confidence == Confidence.DEFINITE:
        return (
            f"The resource '{finding.variable_name}' of type '{finding.resource_type}' is acquired at line "
            f"{finding.acquisition_location.line}, but an execution path ({path_str}) can terminate or return "
            f"from the scope without executing the corresponding release method. As a result, the descriptor "
            f"remains unclosed in memory."
        )
    elif finding.confidence == Confidence.LIKELY:
        return (
            f"The resource '{finding.variable_name}' may be leaked if an exception or unhandled condition occurs along "
            f"path ({path_str}) before reaching a cleanup invocation."
        )
    else:
        return f"{finding.reason} Path evidence: {path_str}."

class ScanService:
    def __init__(self):
        # Auto-run an initial scan on sample-repo-python so dashboard has immediate rich data
        self._init_default_scans()

    def _init_default_scans(self):
        try:
            if os.path.exists("sample-repo-python"):
                self.run_scan(ScanRequest(
                    target_path="sample-repo-python",
                    project_name="Sample Python Repository",
                    branch="main",
                    config_path="leakguard/rules/resources.yaml"
                ))
            if os.path.exists("demo-project"):
                self.run_scan(ScanRequest(
                    target_path="demo-project",
                    project_name="Demo Project",
                    branch="feature/leak-fixes",
                    config_path="leakguard/rules/resources.yaml"
                ))
        except Exception as e:
            print(f"Warning during initial scan initialization: {e}")

    def run_scan(self, req: ScanRequest) -> ScanResponse:
        start_time = time.time()
        config_path = req.config_path or "leakguard/rules/resources.yaml"
        analyzer = Analyzer(config_path)
        
        target = req.target_path
        all_findings: List[Finding] = []
        files_scanned = 0
        
        if os.path.isfile(target):
            if target.endswith('.py'):
                all_findings.extend(analyzer.analyze_file(target))
                files_scanned = 1
        elif os.path.isdir(target):
            for root, _, files in os.walk(target):
                for file in files:
                    if file.endswith('.py'):
                        filepath = os.path.join(root, file)
                        all_findings.extend(analyzer.analyze_file(filepath))
                        files_scanned += 1
                        
        duration_ms = round((time.time() - start_time) * 1000, 2)
        
        # Leaks vs safe patterns
        leaks = [f for f in all_findings if f.confidence != Confidence.SAFE]
        safe_count = len([f for f in all_findings if f.confidence == Confidence.SAFE])
        definite_count = sum(1 for f in leaks if f.confidence == Confidence.DEFINITE)
        likely_count = sum(1 for f in leaks if f.confidence == Confidence.LIKELY)
        unknown_count = sum(1 for f in leaks if f.confidence == Confidence.UNKNOWN)
        
        # Policy: BLOCKED if any definite leaks exist
        status = "BLOCKED" if definite_count > 0 else ("WARNING" if likely_count > 0 else "PASS")
        
        scan_id = f"scan-{uuid.uuid4().hex[:8]}"
        
        finding_schemas: List[FindingSchema] = []
        for idx, f in enumerate(leaks):
            f_id = f"issue-{scan_id}-{idx+1}"
            snippet, start_line = get_code_snippet(f.file, f.acquisition_location.line)
            cfg_nodes = build_cfg_for_finding(f, f.file)
            why_text = format_why_flagged(f)
            
            finding_schemas.append(FindingSchema(
                id=f_id,
                file=os.path.normpath(f.file).replace("\\", "/"),
                resource_type=f.resource_type,
                variable_name=f.variable_name,
                line=f.acquisition_location.line,
                column=f.acquisition_location.column,
                severity=f.severity,
                confidence=f.confidence.name,
                reason=f.reason,
                path=[loc.line for loc in f.path],
                suggestion=f.suggestion,
                code_snippet=snippet,
                snippet_start_line=start_line,
                why_flagged=why_text,
                cfg_nodes=cfg_nodes
            ))
            
        summary = ScanSummary(
            files_scanned=files_scanned,
            resources_detected=len(all_findings),
            definite_leaks=definite_count,
            likely_leaks=likely_count,
            unknown=unknown_count,
            safe_patterns=safe_count,
            duration_ms=duration_ms,
            status=status
        )
        
        scan_response = ScanResponse(
            id=scan_id,
            project_name=req.project_name or os.path.basename(target),
            target_path=target,
            branch=req.branch or "main",
            commit="f4a9b1c",
            timestamp=datetime.now(timezone.utc).isoformat(),
            status=status,
            duration_ms=duration_ms,
            summary=summary,
            findings=finding_schemas
        )
        
        _SCANS_STORE[scan_id] = scan_response
        return scan_response

    def list_scans(self) -> List[ScanResponse]:
        return list(_SCANS_STORE.values())

    def get_scan(self, scan_id: str) -> Optional[ScanResponse]:
        return _SCANS_STORE.get(scan_id)

    def list_issues(self) -> List[FindingSchema]:
        all_issues = []
        for scan in _SCANS_STORE.values():
            all_issues.extend(scan.findings)
        return all_issues

    def get_issue(self, issue_id: str) -> Optional[FindingSchema]:
        for scan in _SCANS_STORE.values():
            for finding in scan.findings:
                if finding.id == issue_id:
                    return finding
        return None

scan_service = ScanService()
