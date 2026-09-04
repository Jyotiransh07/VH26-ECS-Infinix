import ast
from leakguard.parser.python_parser import PythonParser

def test_parse_valid_python():
    parser = PythonParser("test.py")
    source = "f = open('data.txt')\nf.close()"
    tree = parser.parse(source)
    assert tree is not None
    assert isinstance(tree, ast.Module)
    
def test_parse_invalid_python():
    parser = PythonParser("test.py")
    source = "f = open('data.txt'\nf.close()" # Missing parenthesis
    tree = parser.parse(source)
    assert tree is None
