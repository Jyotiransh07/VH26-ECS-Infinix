# LeakGuard: Round 1 Pitch Material

Use the following points to build your presentation slides or script for the Round 1 Pitch. These sections are specifically tailored to highlight the technical depth and innovation of your project.

## 1. Progress Made
- **Functional MVP Completed:** We have successfully built a working, end-to-end Python static analyzer from scratch within the hackathon time constraints.
- **Advanced Path-Sensitive Analysis:** Moving beyond simple syntax checking, we implemented a full Control Flow Graph (CFG) engine that accurately traces execution branches, early returns, and exception paths.
- **CI/CD Security Gate Integration:** LeakGuard is not just a local script; it is fully integrated as a GitHub Action. We successfully demonstrated that it can automatically scan pull requests, block vulnerable code (Exit Code 1), and upload structured security payloads (SARIF) to GitHub Code Scanning.
- **High Accuracy (Zero False Positives in Core Tests):** In our benchmark suite, LeakGuard achieved 100% precision and recall on the core MVP test cases, successfully ignoring safe code (like `with` statements) while accurately flagging missing `close()` calls on complex execution paths.

## 2. Code Originality
- **No Regex Hacks:** While many beginner static analyzers rely on fragile string matching or Regular Expressions, LeakGuard takes a compiler-engineering approach. We physically parse Python files into Abstract Syntax Trees (AST) using Python's native `ast` module. 
- **Custom Graph Engine:** We wrote a custom Control Flow Graph (CFG) generator tailored specifically for Python resource lifecycles. It models real-world execution flow—including `try/except/finally` blocks and implicit crash paths—which is mathematically far more robust than linear code scanning.
- **Algorithmic Path Tracing:** We implemented a custom Breadth-First Search (BFS) reachability algorithm to trace variable lifecycles through the CFG maze, explicitly tracking resource ownership and reassignments.

## 3. Data Design
- **Extensible Configuration (`resources.yaml`):** The engine is decoupled from the rules. Instead of hardcoding what a "resource" is, we built a data-driven rule registry. Users can instantly teach LeakGuard to track new libraries (like custom database drivers) simply by adding a YAML entry.
- **Modular Data Models:** We designed strongly-typed data structures for `Resource` and `Finding`. This allows the engine to uniformly handle a File, a Socket, or a SQLite connection without duplicating logic.
- **Standardized Output Payloads:** The analysis output is mapped into industry-standard data formats. It generates highly readable Console text for humans, raw JSON for custom scripting, and OASIS SARIF v2.1.0 payloads for enterprise vulnerability dashboards.

## 4. Architecture
LeakGuard operates as a strictly decoupled, 4-stage pipeline:
1. **Parser & Lexer:** Uses the `ast` module to convert raw `.py` source text into a structured syntax tree.
2. **Resource Detectors (The Observers):** The `ResourceDetector` and `CleanupDetector` classes traverse the AST using the Visitor pattern, identifying where resources are born and where they are destroyed.
3. **Graph Construction (The Mapper):** The `CFGBuilder` translates the AST into a directed graph, explicitly modeling sequential flow, conditional branches, loops, and exception escapes.
4. **Path Analyzer (The Engine):** A forward-reachability BFS algorithm traverses the CFG starting from resource acquisition. If a path reaches the `EXIT` node without encountering a cleanup node, it emits a `DEFINITE` leak. If the resource is passed out of scope to another function, it emits a `LIKELY` leak.
