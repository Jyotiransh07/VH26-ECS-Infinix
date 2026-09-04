import ast
from leakguard.detection.resource_registry import ResourceRegistry
from leakguard.detection.resource_detector import ResourceDetector

def test_detect_file_open():
    registry = ResourceRegistry()
    registry.rules = [{
        'name': 'file',
        'acquire': ['open'],
        'release': ['close']
    }]
    
    source = "f = open('data.txt')"
    tree = ast.parse(source)
    detector = ResourceDetector(registry)
    resources = detector.detect(tree)
    
    assert len(resources) == 1
    assert resources[0].variable_name == "f"
    assert resources[0].resource_type == "file"
    assert resources[0].location.line == 1

def test_detect_socket():
    registry = ResourceRegistry()
    registry.rules = [{
        'name': 'socket',
        'acquire': ['socket.socket'],
        'release': ['close']
    }]
    
    source = "sock = socket.socket()"
    tree = ast.parse(source)
    detector = ResourceDetector(registry)
    resources = detector.detect(tree)
    
    assert len(resources) == 1
    assert resources[0].variable_name == "sock"
    assert resources[0].resource_type == "socket"

def test_detect_with_open():
    registry = ResourceRegistry()
    registry.rules = [{
        'name': 'file',
        'acquire': ['open'],
        'release': ['close']
    }]
    
    source = "with open('data.txt') as f:\n    pass"
    tree = ast.parse(source)
    detector = ResourceDetector(registry)
    resources = detector.detect(tree)
    
    assert len(resources) == 1
    assert resources[0].variable_name == "f"
    assert resources[0].resource_type == "file"
