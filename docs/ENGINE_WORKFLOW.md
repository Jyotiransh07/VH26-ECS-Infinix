# LeakGuard Engine Workflow: Technical Deep Dive

This document explains the exact end-to-end architecture of the LeakGuard static analysis engine. This is specifically written for team members looking to understand the core logic or build extensions (like a Web Dashboard).

---

## 🏗️ 1. High-Level Architecture
LeakGuard is a **Static Application Security Testing (SAST)** tool built entirely in Python. It does not run the target code. Instead, it reads the source code like a mathematical tree and proves whether resource lifecycles are safe.

The engine executes sequentially in **5 distinct stages**:
1. **Configuration Loading** (`resources.yaml`)
2. **Lexical Parsing** (AST Generation)
3. **Resource & Cleanup Detection** (Visitor Pattern)
4. **Graph Generation** (Control Flow Graph)
5. **Path Analysis** (Breadth-First Search)

---

## ⚙️ 2. Step-by-Step Data Flow

### Stage 1: Configuration (`leakguard/rules/resources.yaml`)
Before reading any code, the `ResourceRegistry` loads a YAML file. 
- **Purpose:** Decouples the "rules" from the "engine." 
- **How it works:** It defines dictionaries of what constitutes opening a resource (e.g., `sqlite3.connect`) and what constitutes closing a resource (e.g., `close`). 

### Stage 2: Lexical Parsing (`leakguard/parser/python_parser.py`)
- **Input:** Raw Python text (e.g., `example.py`).
- **Process:** We use Python's built-in `ast` (Abstract Syntax Tree) module. It converts the plain text into a structured tree where every `if` statement, `function`, and `variable` is a distinct mathematical node.
- **Output:** An `ast.Module` tree.

### Stage 3: Detection (`leakguard/detection/`)
We use the **Visitor Design Pattern** (`ast.NodeVisitor`) to crawl the tree.
- **`ResourceDetector`:** Crawls the tree looking for nodes that match the "acquire" rules in the YAML file. If it finds `f = open(...)`, it creates a `Resource` data model in memory tracking the variable name (`f`) and the line number.
- **`CleanupDetector`:** Crawls the tree looking for nodes that match the "release" rules. It records every instance of a `close()` call into a `CleanupNode` list.

### Stage 4: Graph Generation (`leakguard/analysis/cfg_builder.py`)
This is the most complex part of the engine. A standard AST cannot understand the *flow of time* (e.g., what happens if an `if` statement is false?).
- **Process:** The `CFGBuilder` translates the static AST tree into a **Control Flow Graph (CFG)**. 
- **How it works:** It maps out a directed graph (a maze) of `CFGNode` objects. It explicitly maps out bifurcations (`if/else`), loops (`for/while`), and early terminations (`return`). Crucially, it maps out **Exception Edges** (what happens if a function suddenly crashes and skips to the end of the file).
- **Output:** A linked graph of all possible execution routes.

### Stage 5: Reachability Analysis (`leakguard/analysis/path_analyzer.py`)
This is where the actual mathematical proof happens.
- **Process:** We use a **Breadth-First Search (BFS)** algorithm on the CFG.
- **How it works:** 
  1. The algorithm starts at the exact CFG node where the resource was opened.
  2. It walks down every branching path simultaneously.
  3. If it encounters a `CleanupNode` matching the resource variable, it marks that specific path as `SAFE` and stops tracing it.
  4. If it reaches the `EXIT` node of the graph and has *not* seen a cleanup node, it flags a `DEFINITE` leak.
  5. If the resource variable is passed into another function (e.g., `do_something(f)`), it loses track of it and flags a `LIKELY` leak (ownership transfer).
- **Output:** A list of `Finding` objects containing the exact route the code took to leak the resource.

---

## 📊 3. Notes for the Dashboard Team

If your team is building a Web Dashboard, GUI, or Frontend to display these results, **do not attempt to parse the terminal output or modify the core engine.**

LeakGuard was designed with a decoupled reporting layer specifically for integrations like yours.

### How to consume LeakGuard data:
Instead of running `leakguard scan .`, your backend should run:
```bash
python -m leakguard.cli scan <target_directory> --format json
```
*(Or, use `--format sarif` if you prefer the OASIS enterprise standard).*

### JSON Payload Structure:
The JSON output provides structured, highly parseable data for your frontend:
```json
{
  "summary": {
    "files_scanned": 10,
    "resources_detected": 5,
    "definite_leaks": 2,
    "likely_leaks": 0,
    "unknown": 0
  },
  "findings": [
    {
      "file": "example.py",
      "resource_type": "file",
      "variable_name": "f",
      "acquisition_location": {
        "line": 4,
        "column": 8
      },
      "reason": "Early return or branch bypasses resource cleanup.",
      "severity": "HIGH",
      "confidence": "DEFINITE",
      "path": [4, 5, 8],
      "suggestion": "Consider using a context manager..."
    }
  ]
}
```

### Dashboard Implementation Steps:
1. **Backend:** Have your web server (Node.js/Django/Flask) execute the LeakGuard CLI via a shell subprocess, passing the `--format json` flag.
2. **Database:** Save the resulting JSON payload into your database (PostgreSQL/MongoDB) associated with a specific "Scan ID" or "Commit Hash".
3. **Frontend:** Have your React/Vue dashboard fetch the JSON. You can easily use the `path` array `[4, 5, 8]` to draw a visual timeline of the leak, and use the `summary` block to build pie charts and statistics graphs!
