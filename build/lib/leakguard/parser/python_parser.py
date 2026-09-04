import ast
from typing import Optional

class PythonParser:
    """
    Parser abstraction using Python's built-in ast module.
    """
    def __init__(self, filename: str = "<unknown>"):
        self.filename = filename
        
    def parse(self, source_code: str) -> Optional[ast.AST]:
        """
        Parses source code into an AST.
        Returns the AST, or None if there is a syntax error.
        """
        try:
            return ast.parse(source_code, filename=self.filename)
        except SyntaxError:
            # We fail gracefully as required
            return None
