import ast
from leakguard.detection.resource_registry import ResourceRegistry
from leakguard.detection.resource_detector import ResourceDetector
from leakguard.detection.cleanup_detector import CleanupDetector
from leakguard.analysis.cfg_builder import CFGBuilder
from leakguard.analysis.path_analyzer import PathAnalyzer
from leakguard.models.resource import Confidence

def analyze_code(source: str):
    registry = ResourceRegistry()
    registry.rules = [{
        'name': 'file',
        'acquire': ['open'],
        'release': ['close']
    }]
    
    tree = ast.parse(source)
    detector = ResourceDetector(registry)
    resources = detector.detect(tree)
    
    cleanup_detector = CleanupDetector(registry)
    cleanups = cleanup_detector.detect(tree)
    
    cfg_builder = CFGBuilder()
    cfg_entry = cfg_builder.build(tree)
    
    analyzer = PathAnalyzer(cfg_entry, cleanups)
    
    results = []
    for res in resources:
        conf, reason, path = analyzer.analyze_resource(res)
        results.append((res, conf, reason, path))
    return results

def test_definite_leak():
    source = "def test():\n    f = open('data.txt')\n    print('hello')"
    results = analyze_code(source)
    assert len(results) == 1
    assert results[0][1] == Confidence.DEFINITE

def test_safe_cleanup():
    source = "def test():\n    f = open('data.txt')\n    f.close()"
    results = analyze_code(source)
    assert len(results) == 1
    assert results[0][1] == Confidence.SAFE

def test_early_return():
    source = "def test():\n    f = open('data.txt')\n    if True:\n        return\n    f.close()"
    results = analyze_code(source)
    assert len(results) == 1
    assert results[0][1] == Confidence.DEFINITE

def test_with_statement():
    source = "def test():\n    with open('data.txt') as f:\n        pass"
    results = analyze_code(source)
    assert len(results) == 1
    assert results[0][1] == Confidence.SAFE

def test_try_finally():
    source = "def test():\n    f = open('data.txt')\n    try:\n        print('hello')\n    finally:\n        f.close()"
    results = analyze_code(source)
    assert len(results) == 1
    assert results[0][1] == Confidence.SAFE

def test_branch_leak():
    source = "def test():\n    f = open('data.txt')\n    if False:\n        f.close()"
    results = analyze_code(source)
    assert len(results) == 1
    assert results[0][1] == Confidence.DEFINITE
    
def test_ownership_transfer():
    source = "def consume(f):\n    f.close()\ndef test():\n    f = open('data.txt')\n    consume(f)"
    results = analyze_code(source)
    assert len(results) == 1
    assert results[0][1] == Confidence.LIKELY

def test_reassignment():
    source = "def test():\n    f = open('data.txt')\n    f = open('other.txt')\n    f.close()"
    results = analyze_code(source)
    # The first 'f' leaks
    assert len(results) == 2
    assert results[0][1] == Confidence.DEFINITE
    assert results[1][1] == Confidence.SAFE
