# LeakGuard Test Results

## Resource Leak Detection

| Test | Expected | Actual | Status |
|---|---|---|---|
| basic_file_leak | DEFINITE | DEFINITE | PASS |
| early_return | DEFINITE | DEFINITE | PASS |
| branch_leak | DEFINITE | DEFINITE | PASS |
| raise_leak | DEFINITE | DEFINITE | PASS |
| exception_leak | LIKELY/UNKNOWN | LIKELY | PASS |
| multiple_resource_leak | f2 only | f2 only | PASS |

## Safe Resource Handling

| Test | Expected | Actual | Status |
|---|---|---|---|
| with_open | SAFE | SAFE | PASS |
| explicit_close | SAFE | SAFE | PASS |
| finally_close | SAFE | SAFE | PASS |
| branch_safe | SAFE | SAFE | PASS |

## Pytest

The actual pytest result from running `.\.venv\Scripts\pytest`:
```
============================= test session starts =============================
platform win32 -- Python 3.14.7, pytest-9.1.1, pluggy-1.6.0
rootdir: C:\Users\jyoti\OneDrive\Desktop\LeakGuard
configfile: pyproject.toml
plugins: cov-7.1.0
collected 20 items

tests\integration\test_cli.py ....                                       [ 20%]
tests\unit\test_cfg.py ..                                                [ 30%]
tests\unit\test_cleanup_detection.py .                                   [ 35%]
tests\unit\test_parser.py ..                                             [ 45%]
tests\unit\test_path_analysis.py ........                                [ 85%]
tests\unit\test_resource_detection.py ...                                [100%]

============================= 20 passed in 1.14s ==============================
```

## Bugs Fixed

1. **Unhandled Exception Path Noise**: Previously, the `CFGBuilder` accurately modeled that every statement (like `f.read()`) could implicitly raise an exception. However, `PathAnalyzer` would trace these exception paths directly to the function EXIT and report them as `DEFINITE` resource leaks. This caused safe code like `explicit_close.py` to be flagged as leaking (because a crash could theoretically bypass the close).
   - **Fix Applied**: Upgraded `PathAnalyzer` to track an `is_crash` boolean through the BFS queue. If the analyzer reaches `EXIT` via an unhandled exception edge from a standard statement (like `ast.Assign` or `ast.Call`), it now ignores the path as noise.
2. **Explicit `raise` bypass**: Ensured that `ast.Raise` nodes are specifically tracked differently from implicit crashes. If a path hits `EXIT` via `ast.Raise`, it correctly reports a `DEFINITE` leak, ensuring `raise_leak.py` passes.
3. **Multiple Resource Overlap**: In `multiple_resource_leak.py`, `f1` was incorrectly being flagged as leaking because `f2 = open()` had an exception path that bypassed `f1.close()`. The `is_crash` fix properly resolved this, ensuring `f1` is SAFE and only `f2` leaks.
4. **Analyzer SAFE Filtering Bug**: The `Analyzer.analyze_tree` logic was aggressively filtering out `SAFE` findings before returning them. This caused the CLI to report "Resources detected: 0" for completely safe files.
   - **Fix Applied**: Modified `analyze_tree` to append and return ALL findings (including `SAFE`), allowing the CLI to properly tally the `Resources detected` count before filtering the leaks for the console output.

## Remaining Limitations

1. **Interprocedural Analysis**: As designed, LeakGuard does not trace into other functions. If a resource is passed into another function (e.g. `process_data(f)`), LeakGuard conservatively assumes ownership has transferred and returns `LIKELY`, but it cannot verify if the child function actually closes the resource.
2. **Alias Analysis**: LeakGuard does not track complex object aliasing or lifecycle hooks (like `self.file = f` and tracking `__del__`).
3. **Concurrency**: LeakGuard does not analyze thread synchronization or asynchronous loops.
