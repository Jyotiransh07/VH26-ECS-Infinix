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

        queue = deque()
        for nxt in start_node.next:
            queue.append((nxt, [], False, False)) # (node, path, transferred, is_crash)
        for nxt in start_node.exception_next:
            queue.append((nxt, [], False, not isinstance(start_node.ast_node, ast.Raise)))
            
        visited = set()
        
        while queue:
            curr, path, transferred, is_crash = queue.popleft()
            
            if curr.is_exit:
                if transferred:
                    return Confidence.LIKELY, "Resource might leak (ownership transferred).", path
                elif is_crash:
                    # Ignore unhandled exceptions from non-Raise nodes as noise
                    continue
                else:
                    return Confidence.DEFINITE, "Early return or branch bypasses resource cleanup.", path
                    
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
                            return Confidence.DEFINITE, "Resource variable is reassigned before cleanup, losing the reference.", path
                            
                # Check for ownership transfer
                if isinstance(curr.ast_node, (ast.Call, ast.Expr, ast.Assign, ast.Return)):
                    for node in stmt_nodes:
                        if isinstance(node, ast.Call):
                            for arg in node.args:
                                if isinstance(arg, ast.Name) and arg.id == resource.variable_name:
                                    transferred = True
            
            if is_closed:
                continue
                
            new_path = list(path)
            if curr.ast_node and hasattr(curr.ast_node, 'lineno'):
                loc = Location(curr.ast_node.lineno, curr.ast_node.col_offset)
                if not new_path or new_path[-1].line != loc.line:
                    new_path.append(loc)
                
            for nxt in curr.next:
                state_key = (nxt.id, transferred, False)
                if state_key not in visited:
                    visited.add(state_key)
                    queue.append((nxt, new_path, transferred, False))
                    
            for nxt in curr.exception_next:
                if nxt not in curr.next:
                    is_new_crash = is_crash or (curr.ast_node is not None and not isinstance(curr.ast_node, ast.Raise))
                    state_key = (nxt.id, transferred, is_new_crash)
                    if state_key not in visited:
                        visited.add(state_key)
                        queue.append((nxt, new_path, transferred, is_new_crash))
                    
        return Confidence.SAFE, "Resource is safely cleaned up on all paths.", []
