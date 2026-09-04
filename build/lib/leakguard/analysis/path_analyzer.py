from typing import List, Tuple, Set
import ast
from collections import deque
from leakguard.analysis.cfg import CFGNode
from leakguard.models.resource import Resource, Confidence
from leakguard.detection.cleanup_detector import CleanupNode
from leakguard.models.location import Location

class PathAnalyzer:
    def __init__(self, cfg_entry: CFGNode, cleanups: List[CleanupNode]):
        self.cfg_entry = cfg_entry
        self.ast_to_cfg = {}
        self._build_ast_map(cfg_entry, set())
        self.cleanup_map = {c.node: c for c in cleanups}

    def _build_ast_map(self, node: CFGNode, visited: set):
        if node.id in visited:
            return
        visited.add(node.id)
        if node.ast_node:
            self.ast_to_cfg[node.ast_node] = node
        for n in node.next + node.exception_next:
            self._build_ast_map(n, visited)

    def analyze_resource(self, resource: Resource) -> Tuple[Confidence, str, List[Location]]:
        if isinstance(resource.acquisition_node, ast.With):
            return Confidence.SAFE, "Resource is safely managed by a context manager.", []
            
        start_node = self.ast_to_cfg.get(resource.acquisition_node)
        if not start_node:
            return Confidence.UNKNOWN, "Could not locate acquisition in CFG.", []

        # Start BFS from normal successors of acquisition node
        # queue elements: (cfg_node, path, transferred)
        queue = deque()
        for nxt in start_node.next:
            queue.append((nxt, [], False))
            
        visited = set()
        
        while queue:
            curr, path, transferred = queue.popleft()
            
            # Record location
            new_path = list(path)
            if curr.ast_node and hasattr(curr.ast_node, 'lineno'):
                loc = Location(curr.ast_node.lineno, curr.ast_node.col_offset)
                if not new_path or new_path[-1].line != loc.line:
                    new_path.append(loc)
                    
            if curr.is_exit:
                if transferred:
                    return Confidence.LIKELY, "Resource might leak (ownership transferred).", new_path
                else:
                    return Confidence.DEFINITE, "Early return or branch bypasses resource cleanup.", new_path
                    
            is_closed = False
            
            if curr.ast_node:
                # Get nodes for this statement only (exclude nested statements)
                stmt_nodes = [curr.ast_node]
                q = deque([curr.ast_node])
                while q:
                    n = q.popleft()
                    for child in ast.iter_child_nodes(n):
                        if isinstance(child, ast.stmt) and child != curr.ast_node:
                            continue
                        stmt_nodes.append(child)
                        q.append(child)
                        
                # Check for cleanup
                for node in stmt_nodes:
                    if node in self.cleanup_map:
                        cleanup = self.cleanup_map[node]
                        if cleanup.variable_name == resource.variable_name:
                            is_closed = True
                            break
                        
                # Check for reassignment
                if isinstance(curr.ast_node, ast.Assign) and curr.ast_node != resource.acquisition_node:
                    for target in curr.ast_node.targets:
                        if isinstance(target, ast.Name) and target.id == resource.variable_name:
                            return Confidence.DEFINITE, "Resource variable is reassigned before cleanup, losing the reference.", new_path

                # Check for ownership transfer
                if isinstance(curr.ast_node, (ast.Call, ast.Expr, ast.Assign)):
                    call_node = None
                    if isinstance(curr.ast_node, ast.Call):
                        call_node = curr.ast_node
                    elif isinstance(curr.ast_node, ast.Expr) and isinstance(curr.ast_node.value, ast.Call):
                        call_node = curr.ast_node.value
                    elif isinstance(curr.ast_node, ast.Assign) and isinstance(curr.ast_node.value, ast.Call):
                        call_node = curr.ast_node.value
                        
                    if call_node:
                        for arg in call_node.args:
                            if isinstance(arg, ast.Name) and arg.id == resource.variable_name:
                                transferred = True
                    
            if is_closed:
                continue 
                
            for nxt in curr.next + curr.exception_next:
                state_key = (nxt.id, transferred)
                if state_key not in visited:
                    visited.add(state_key)
                    queue.append((nxt, new_path, transferred))
                    
        return Confidence.SAFE, "Resource is safely cleaned up on all paths.", []
