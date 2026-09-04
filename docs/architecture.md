# Architecture

LeakGuard operates as a pipeline of analysis phases:

### 1. AST Parsing
Source code is parsed into an Abstract Syntax Tree (AST) using Python's built-in `ast` module. 

### 2. Resource Detection
The `ResourceDetector` traverses the AST and identifies nodes that acquire resources based on rules defined in `resources.yaml` (e.g. `open()`). 

### 3. Cleanup Detection
The `CleanupDetector` identifies explicit cleanup methods (e.g., `f.close()`) called on variables within the code.

### 4. Control Flow Graph (CFG) Construction
The `CFGBuilder` takes the AST and translates it into a Control Flow Graph. The CFG represents all possible execution paths through the function, explicitly modeling:
- Sequential execution
- Conditional branches (`if`/`else`)
- Loops (`for`, `while`, `break`, `continue`)
- Exception handling (`try`/`except`/`finally`)
- Context managers (`with` blocks)

Crucially, the CFG includes "exception edges" from any statement that could raise an exception to the nearest exception handler or function exit.

### 5. Path Analysis
The `PathAnalyzer` runs a forward reachability analysis (BFS) over the CFG starting from each acquired resource. It verifies if there is ANY path from the acquisition to the function exit where the resource remains open. 
- If such a path is found without cleanup, it is a `DEFINITE` leak.
- If ownership of the resource is transferred to another function, it is marked as `LIKELY` leaking.
- If the resource is managed by a context manager or explicitly closed on all paths, it is `SAFE`.
