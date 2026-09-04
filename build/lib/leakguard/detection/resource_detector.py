import ast
from typing import List, Dict
from leakguard.models.resource import Resource, ResourceState, Ownership, Confidence
from leakguard.models.location import Location
from leakguard.detection.resource_registry import ResourceRegistry

class ResourceDetector(ast.NodeVisitor):
    def __init__(self, registry: ResourceRegistry):
        self.registry = registry
        self.acq_rules = registry.get_acquisition_rules()
        self.resources: List[Resource] = []
        self._next_id = 1
        
    def _get_full_name(self, node: ast.expr) -> str:
        """Helper to get full name like 'socket.socket' from an AST node."""
        if isinstance(node, ast.Name):
            return node.id
        elif isinstance(node, ast.Attribute):
            value_name = self._get_full_name(node.value)
            if value_name:
                return f"{value_name}.{node.attr}"
        return ""
        
    def visit_Assign(self, node: ast.Assign):
        if isinstance(node.value, ast.Call):
            func_name = self._get_full_name(node.value.func)
            if func_name in self.acq_rules:
                resource_type = self.acq_rules[func_name]
                
                for target in node.targets:
                    if isinstance(target, ast.Name):
                        var_name = target.id
                        loc = Location(line=node.lineno, column=node.col_offset)
                        res = Resource(
                            id=self._next_id,
                            variable_name=var_name,
                            resource_type=resource_type,
                            acquisition_node=node,
                            location=loc,
                            state=ResourceState.OPEN
                        )
                        self.resources.append(res)
                        self._next_id += 1
                        
        self.generic_visit(node)
        
    def visit_With(self, node: ast.With):
        for item in node.items:
            if isinstance(item.context_expr, ast.Call):
                func_name = self._get_full_name(item.context_expr.func)
                if func_name in self.acq_rules:
                    resource_type = self.acq_rules[func_name]
                    var_name = "<unnamed>"
                    if item.optional_vars and isinstance(item.optional_vars, ast.Name):
                        var_name = item.optional_vars.id
                    
                    loc = Location(line=node.lineno, column=node.col_offset)
                    res = Resource(
                        id=self._next_id,
                        variable_name=var_name,
                        resource_type=resource_type,
                        acquisition_node=node,
                        location=loc,
                        state=ResourceState.OPEN 
                    )
                    self.resources.append(res)
                    self._next_id += 1
                    
        self.generic_visit(node)

    def detect(self, tree: ast.AST) -> List[Resource]:
        self.visit(tree)
        return self.resources
