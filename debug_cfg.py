import ast
from leakguard.detection.resource_registry import ResourceRegistry
from leakguard.detection.resource_detector import ResourceDetector
from leakguard.detection.cleanup_detector import CleanupDetector
from leakguard.analysis.cfg_builder import CFGBuilder
from leakguard.analysis.path_analyzer import PathAnalyzer
from leakguard.models.resource import Confidence

source = "def test():\n    f = open('data.txt')\n    if False:\n        f.close()"
tree = ast.parse(source)

registry = ResourceRegistry()
registry.rules = [{'name': 'file', 'acquire': ['open'], 'release': ['close']}]

detector = ResourceDetector(registry)
resources = detector.detect(tree)
cleanup_detector = CleanupDetector(registry)
cleanups = cleanup_detector.detect(tree)
cfg_builder = CFGBuilder()
cfg_entry = cfg_builder.build(tree)

analyzer = PathAnalyzer(cfg_entry, cleanups)

# Overwrite analyze_resource locally to add prints
old_analyze = analyzer.analyze_resource
def verbose_analyze(resource):
    start_node = analyzer.ast_to_cfg.get(resource.acquisition_node)
    from collections import deque
    queue = deque()
    for nxt in start_node.next:
        queue.append((nxt, [], False))
    visited = set()
    while queue:
        curr, path, transferred = queue.popleft()
        print(f"Visiting {curr.id} ({type(curr.ast_node).__name__ if curr.ast_node else 'None'})")
        if curr.is_exit:
            print("  HIT EXIT")
            return Confidence.DEFINITE, "", []
        is_closed = False
        if curr.ast_node:
            for node in ast.walk(curr.ast_node):
                if node in analyzer.cleanup_map:
                    cleanup = analyzer.cleanup_map[node]
                    if cleanup.variable_name == resource.variable_name:
                        is_closed = True
                        break
        if is_closed:
            print("  IS CLOSED")
            continue
        for nxt in curr.next + curr.exception_next:
            state_key = (nxt.id, transferred)
            if state_key not in visited:
                visited.add(state_key)
                queue.append((nxt, path, transferred))
    return Confidence.SAFE, "", []

conf, reason, path = verbose_analyze(resources[0])
print("Result:", conf)
