# LeakGuard Test Results

## Leak Cases

| Test | Expected | Actual | Status |
|---|---|---|---|
| basic_file_leak | DEFINITE | DEFINITE | PASS |
| early_return | DEFINITE | DEFINITE | PASS |
| branch_leak | DEFINITE | DEFINITE | PASS |
| raise_leak | DEFINITE | DEFINITE | PASS |
| exception_leak | LIKELY/UNKNOWN | LIKELY | PASS |
| multiple_resource_leak | f2 only | f2 only | PASS |

## Safe Cases

| Test | Expected | Actual | Status |
|---|---|---|---|
| with_open | SAFE | SAFE | PASS |
| explicit_close | SAFE | SAFE | PASS |
| finally_close | SAFE | SAFE | PASS |
| branch_safe | SAFE | SAFE | PASS |

## Pytest
20 passed in 0.96s. All AST parsing, CFG building, path analysis, and cleanup logic tests pass perfectly.

## CLI & Exit Codes
- `python -m leakguard.cli scan tests/fixtures/leaks/` -> Exit Code: 1 (Correct)
- `python -m leakguard.cli scan tests/fixtures/safe/` -> Exit Code: 0 (Correct)

## CI/CD
- Deliberate leaks (like in `sample-repo-python/early_return.py`) cause LeakGuard to throw exit code 1, which successfully fails the GitHub Action pipeline, preventing vulnerable code from merging.
- Safe code passes the GitHub Action seamlessly.
