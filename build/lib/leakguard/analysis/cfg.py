import ast
from typing import List, Optional

class CFGNode:
    def __init__(self, id: int, ast_node: Optional[ast.AST] = None):
        self.id = id
        self.ast_node = ast_node
        self.next: List['CFGNode'] = []
        self.exception_next: List['CFGNode'] = []
        self.is_exit = False
        
    def add_next(self, node: 'CFGNode'):
        if node not in self.next:
            self.next.append(node)
            
    def add_exception_next(self, node: 'CFGNode'):
        if node not in self.exception_next:
            self.exception_next.append(node)
            
    def __repr__(self):
        node_type = type(self.ast_node).__name__ if self.ast_node else "None"
        return f"CFGNode(id={self.id}, type={node_type}, exit={self.is_exit})"
