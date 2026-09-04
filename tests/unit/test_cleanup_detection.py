import ast
from leakguard.detection.resource_registry import ResourceRegistry
from leakguard.detection.cleanup_detector import CleanupDetector

def test_detect_cleanup():
    registry = ResourceRegistry()
    registry.rules = [{
        'name': 'file',
        'acquire': ['open'],
        'release': ['close']
    }]
    
    source = "f = open('data.txt')\nf.close()"
    tree = ast.parse(source)
    detector = CleanupDetector(registry)
    cleanups = detector.detect(tree)
    
    assert len(cleanups) == 1
    assert cleanups[0].variable_name == "f"
    assert cleanups[0].location.line == 2
