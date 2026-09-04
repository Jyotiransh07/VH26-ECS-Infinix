# Limitations

LeakGuard focuses on low-noise, path-sensitive local analysis. Because of this, it has deliberate design limitations to maintain performance and explainability.

### 1. Interprocedural Analysis
LeakGuard currently only performs intra-procedural analysis. It analyzes functions in isolation. If a resource is passed into another function (e.g., `process_file(f)`), LeakGuard conservatively assumes ownership has transferred and marks it as `LIKELY` leaking (but not `DEFINITE`).

### 2. Complex Aliasing
Python is highly dynamic. LeakGuard tracks variables by name and detects simple reassignments. However, if a resource is appended to a list (`my_list.append(f)`) or attached as an attribute to an object (`self.file = f`), LeakGuard will lose track of the resource reference.

### 3. Concurrency
LeakGuard does not analyze thread synchronization or asynchronous event loops, which could delay or bypass cleanups in unpredictable ways.

### 4. Dynamic Execution
Code utilizing `eval()`, `exec()`, or heavy monkey-patching cannot be statically analyzed for resource lifecycle guarantees.

### 5. Termination Analysis
LeakGuard assumes that loops will eventually terminate. It does not attempt to solve the Halting Problem to prove that a `while True:` loop without a break will prevent a resource from leaking on exit (as the function never exits).
