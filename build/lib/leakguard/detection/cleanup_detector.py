import ast
from typing import List
from dataclasses import dataclass
from leakguard.models.location import Location
from leakguard.detection.resource_registry import ResourceRegistry

@dataclass
class CleanupNode:
    variable_name: str
    node: ast.AST
    location: Location

class CleanupDetector(ast.NodeVisitor):
    def __init__(self, registry: ResourceRegistry):
        self.registry = registry
        self.release_rules = registry.get_release_rules()
        
        self.all_release_methods = set()
        for methods in self.release_rules.values():
            self.all_release_methods.update(methods)
            
        self.cleanups: List[CleanupNode] = []

    def visit_Call(self, node: ast.Call):
        if isinstance(node.func, ast.Attribute):
            if isinstance(node.func.value, ast.Name):
                var_name = node.func.value.id
                method_name = node.func.attr
                
                if method_name in self.all_release_methods:
                    loc = Location(line=node.lineno, column=node.col_offset)
                    self.cleanups.append(CleanupNode(
                        variable_name=var_name,
                        node=node,
                        location=loc
                    ))
                    
        self.generic_visit(node)
        
    def detect(self, tree: ast.AST) -> List[CleanupNode]:
        self.visit(tree)
        return self.cleanups
