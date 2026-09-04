import os
import ast
from typing import List, Dict, Any
from leakguard.parser.python_parser import PythonParser
from leakguard.detection.resource_registry import ResourceRegistry
from leakguard.detection.resource_detector import ResourceDetector
from leakguard.detection.cleanup_detector import CleanupDetector
from leakguard.analysis.cfg_builder import CFGBuilder
from leakguard.analysis.path_analyzer import PathAnalyzer
from leakguard.models.finding import Finding
from leakguard.models.resource import Confidence

class Analyzer:
    def __init__(self, registry_path: str):
        self.registry = ResourceRegistry()
        if os.path.exists(registry_path):
            self.registry.load_from_yaml(registry_path)
            
    def analyze_file(self, filepath: str) -> List[Finding]:
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                source = f.read()
        except Exception:
            return []
            
        parser = PythonParser(filepath)
        tree = parser.parse(source)
        if not tree:
            return []
            
        return self.analyze_tree(tree, filepath)
        
    def analyze_tree(self, tree: ast.AST, filepath: str) -> List[Finding]:
        detector = ResourceDetector(self.registry)
        resources = detector.detect(tree)
        
        cleanup_detector = CleanupDetector(self.registry)
        cleanups = cleanup_detector.detect(tree)
        
        cfg_builder = CFGBuilder()
        cfg_entry = cfg_builder.build(tree)
        
        path_analyzer = PathAnalyzer(cfg_entry, cleanups)
        
        findings = []
        for res in resources:
            conf, reason, path = path_analyzer.analyze_resource(res)
            
            if "sqlite" in res.resource_type.lower():
                suggestion = "Consider using `with sqlite3.connect(...) as conn:` or a try/finally block to ensure the database connection closes."
            elif "socket" in res.resource_type.lower():
                suggestion = "Consider using `with socket.socket(...) as s:` or wrapping the socket operations in a try/finally block."
            elif "file" in res.resource_type.lower():
                suggestion = "Consider using a context manager (`with open(...) as f:`) to automatically manage this file."
            else:
                suggestion = "Consider using a context manager (`with` statement) or a `try/finally` block to ensure cleanup."
                
            severity = "HIGH" if conf == Confidence.DEFINITE else ("MEDIUM" if conf == Confidence.LIKELY else "INFO")
            finding = Finding(
                file=filepath,
                resource_type=res.resource_type,
                variable_name=res.variable_name,
                acquisition_location=res.location,
                reason=reason,
                severity=severity,
                confidence=conf,
                path=path,
                suggestion=suggestion
            )
            findings.append(finding)
                
        return findings

    def analyze_directory(self, dirpath: str) -> List[Finding]:
        all_findings = []
        for root, _, files in os.walk(dirpath):
            for file in files:
                if file.endswith('.py'):
                    filepath = os.path.join(root, file)
                    all_findings.extend(self.analyze_file(filepath))
        return all_findings
