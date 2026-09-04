import ast
from typing import List, Optional, Dict
from leakguard.analysis.cfg import CFGNode

class CFGBuilder(ast.NodeVisitor):
    def __init__(self):
        self.nodes = []
        self._next_id = 1
        
        self.entry = self._create_node(None)
        self.exit = self._create_node(None)
        self.exit.is_exit = True
        
        self.current_node = self.entry
        
        self.loop_stack = [] 
        self.exception_stack: List[Dict[str, CFGNode]] = []
        
    def _create_node(self, ast_node: Optional[ast.AST]) -> CFGNode:
        node = CFGNode(self._next_id, ast_node)
        self._next_id += 1
        self.nodes.append(node)
        return node
        
    def _add_statement(self, ast_node: ast.AST) -> CFGNode:
        n = self._create_node(ast_node)
        self.current_node.add_next(n)
        
        if isinstance(ast_node, (ast.Assign, ast.Expr, ast.Call, ast.Return, ast.Raise)):
            target = self.exit
            for exc_handlers in reversed(self.exception_stack):
                if exc_handlers.get('except'):
                    target = exc_handlers['except']
                    break
                elif exc_handlers.get('finally'):
                    target = exc_handlers['finally']
                    break
            n.add_exception_next(target)
            
        self.current_node = n
        return n

    def build(self, tree: ast.AST) -> CFGNode:
        self.visit(tree)
        self.current_node.add_next(self.exit)
        return self.entry

    def visit_Module(self, node: ast.Module):
        for stmt in node.body:
            self.visit(stmt)

    def visit_FunctionDef(self, node: ast.FunctionDef):
        for stmt in node.body:
            self.visit(stmt)

    def visit_Assign(self, node: ast.Assign):
        self._add_statement(node)

    def visit_Expr(self, node: ast.Expr):
        self._add_statement(node)
        
    def visit_If(self, node: ast.If):
        if_node = self._add_statement(node)
        merge_node = self._create_node(None)
        
        self.current_node = if_node
        for stmt in node.body:
            self.visit(stmt)
        self.current_node.add_next(merge_node)
        
        self.current_node = if_node
        if node.orelse:
            for stmt in node.orelse:
                self.visit(stmt)
        self.current_node.add_next(merge_node)
        
        self.current_node = merge_node

    def visit_While(self, node: ast.While):
        while_node = self._add_statement(node)
        merge_node = self._create_node(None)
        
        self.loop_stack.append((merge_node, while_node))
        
        self.current_node = while_node
        for stmt in node.body:
            self.visit(stmt)
            
        self.current_node.add_next(while_node)
        self.loop_stack.pop()
        
        while_node.add_next(merge_node)
        self.current_node = merge_node

    def visit_For(self, node: ast.For):
        for_node = self._add_statement(node)
        merge_node = self._create_node(None)
        
        self.loop_stack.append((merge_node, for_node))
        
        self.current_node = for_node
        for stmt in node.body:
            self.visit(stmt)
        self.current_node.add_next(for_node)
        
        self.loop_stack.pop()
        
        for_node.add_next(merge_node)
        self.current_node = merge_node

    def visit_Break(self, node: ast.Break):
        n = self._add_statement(node)
        if self.loop_stack:
            break_target, _ = self.loop_stack[-1]
            n.add_next(break_target)
        self.current_node = self._create_node(None)

    def visit_Continue(self, node: ast.Continue):
        n = self._add_statement(node)
        if self.loop_stack:
            _, continue_target = self.loop_stack[-1]
            n.add_next(continue_target)
        self.current_node = self._create_node(None)

    def visit_Return(self, node: ast.Return):
        n = self._create_node(node)
        self.current_node.add_next(n)
        
        target = self.exit
        for exc_handlers in reversed(self.exception_stack):
            if exc_handlers.get('finally'):
                target = exc_handlers['finally']
                break
                
        n.add_next(target)
        self.current_node = self._create_node(None)

    def visit_Raise(self, node: ast.Raise):
        n = self._create_node(node)
        self.current_node.add_next(n)
        
        target = self.exit
        for exc_handlers in reversed(self.exception_stack):
            if exc_handlers.get('except'):
                target = exc_handlers['except']
                break
            elif exc_handlers.get('finally'):
                target = exc_handlers['finally']
                break
                
        n.add_next(target)
        self.current_node = self._create_node(None)
        
    def visit_Try(self, node: ast.Try):
        try_node = self._add_statement(node)
        
        except_merge = self._create_node(None)
        finally_entry = self._create_node(None) if node.finalbody else None
        
        handlers = {}
        if node.handlers:
            handlers['except'] = except_merge
        if finally_entry:
            handlers['finally'] = finally_entry
            
        self.exception_stack.append(handlers)
        
        self.current_node = try_node
        for stmt in node.body:
            self.visit(stmt)
            
        if node.orelse:
            for stmt in node.orelse:
                self.visit(stmt)
                
        if finally_entry:
            self.current_node.add_next(finally_entry)
        else:
            final_merge = self._create_node(None)
            self.current_node.add_next(final_merge)
            
        self.exception_stack.pop()
        
        for handler in node.handlers:
            self.current_node = except_merge
            for stmt in handler.body:
                self.visit(stmt)
            if finally_entry:
                self.current_node.add_next(finally_entry)
            else:
                self.current_node.add_next(final_merge)
                
        if finally_entry:
            self.current_node = finally_entry
            for stmt in node.finalbody:
                self.visit(stmt)
                
            # Propagate exception
            target = self.exit
            for outer_handlers in reversed(self.exception_stack):
                if outer_handlers.get('except'):
                    target = outer_handlers['except']
                    break
                elif outer_handlers.get('finally'):
                    target = outer_handlers['finally']
                    break
            self.current_node.add_exception_next(target)
            
    def visit_With(self, node: ast.With):
        with_node = self._add_statement(node)
        
        with_cleanup = self._create_node(node) 
        
        handlers = {'finally': with_cleanup}
        self.exception_stack.append(handlers)
        
        self.current_node = with_node
        for stmt in node.body:
            self.visit(stmt)
            
        self.current_node.add_next(with_cleanup)
        self.exception_stack.pop()
        
        self.current_node = with_cleanup
        
        target = self.exit
        for outer_handlers in reversed(self.exception_stack):
            if outer_handlers.get('except'):
                target = outer_handlers['except']
                break
            elif outer_handlers.get('finally'):
                target = outer_handlers['finally']
                break
        self.current_node.add_next(target)

    def visit_Pass(self, node: ast.Pass):
        self._add_statement(node)

    def generic_visit(self, node):
        if isinstance(node, ast.stmt):
            self._add_statement(node)
        else:
            super().generic_visit(node)
