import ast
from leakguard.analysis.cfg_builder import CFGBuilder

def test_build_simple_cfg():
    source = "f = open('data.txt')\nf.close()"
    tree = ast.parse(source)
    builder = CFGBuilder()
    entry = builder.build(tree)
    
    assert entry is not None
    # entry -> assign -> expr -> exit
    assert len(entry.next) == 1
    
    assign_node = entry.next[0]
    assert isinstance(assign_node.ast_node, ast.Assign)
    
    # Due to exception edges, assign goes to next statement (normal) and exit (exception)
    assert len(assign_node.next) == 1
    assert len(assign_node.exception_next) == 1
    
def test_build_if_cfg():
    source = "if True:\n    pass\nelse:\n    pass"
    tree = ast.parse(source)
    builder = CFGBuilder()
    entry = builder.build(tree)
    
    assert entry is not None
