# LeakGuard Web Dashboard — Architectural Blueprint

The LeakGuard Web Dashboard wraps the existing, immutable LeakGuard static analysis engine in an enterprise DevSecOps platform with tenant isolation, live CLI orchestration, and differential baseline analysis.

---

## 1. Non-Invasive Engine Adapter Architecture

```
+-------------------------------------------------------------------------+
|                              USER INTERFACE                             |
|       React 19 + TypeScript + Tailwind CSS + Brisk CRM Visual Design    |
+------------------------------------+------------------------------------+
                                     | (REST / WebSocket)
                                     v
+-------------------------------------------------------------------------+
|                           NODE.JS API GATEWAY                           |
|       Express.js (:3001) | RBAC Middleware | Supabase RLS Session       |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                         SCANNER ADAPTER LAYER                           |
|    Executes: python -m leakguard.cli scan <target_dir> --format json    |
+------------------------------------+------------------------------------+
                                     | (Zero Code Modifications)
                                     v
+-------------------------------------------------------------------------+
|                     IMMUTABLE LEAKGUARD CORE ENGINE                     |
|           PythonParser -> ControlFlowGraph -> PathAnalysis (BFS)        |
+------------------------------------+------------------------------------+
                                     | (Standard JSON Payload)
                                     v
+-------------------------------------------------------------------------+
|                           DATABASE PERSISTENCE                          |
|         Supabase PostgreSQL Schema | 12 Isolated Dashboard Tables       |
+-------------------------------------------------------------------------+
```

---

## 2. Nine-Stage Static Analysis Pipeline

1. **Python Code**: Raw source code with file handles, sockets, and connections.
2. **Static Analysis**: Non-executing, safe AST inspection.
3. **AST Parsing**: Native `ast.Module` traversal identifying acquisition nodes.
4. **CFG Generation**: Directed graph of statements, branches, and returns.
5. **Path Analysis**: BFS traversal finding all routes from acquisition to termination.
6. **Leak Detection**: Decision engine identifying unclosed descriptors (`DEFINITE`).
7. **Dashboard Triage**: Monaco code viewer with line markers and timeline.
8. **One-Click Fix**: Recommended `with open(...) as f:` context managers.
9. **Verification**: Rescanning confirms 0 leaking paths, passing CI gates.

---

## 3. Row-Level Security (RLS) & Multi-Tenant Model

- **Organization Isolation**: Every repository and finding belongs to an `organization_id`.
- **Tenant Isolation Policy**:
  ```sql
  CREATE POLICY "Tenant Repository Isolation" ON repositories
    FOR SELECT USING (
      organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth.uid()
      )
    );
  ```
- **Server-Side RBAC Enforcement**:
  - `USER`: Restricted strictly to authorized organization repositories.
  - `ADMIN`: Authorized to view cross-tenant scalability, user directory, and platform telemetry.
  - Requests to `/api/admin/*` by non-admins return `HTTP 403 Forbidden`.

---

## 4. Differential Baseline Analysis

To prevent legacy codebase debt from halting active feature development, LeakGuard calculates exact differentials against accepted golden baselines:

- 🟡 **Baseline Findings (Legacy Debt)**: Known unclosed resources accepted in previous release snapshots.
- 🔴 **New Regressions (CI Blockers)**: Newly introduced leaks in the current branch or PR that fail build pipelines.
- 🟢 **Resolved Leaks (Verified Fixes)**: Leaks present in the baseline that have been successfully remediated.

---

## 5. OASIS SARIF v2.1.0 Compliance

LeakGuard exports standardized SARIF reports (`GET /api/reports/:id?format=sarif`) for native integration into **GitHub Code Scanning**, CI workflows, and IDE extensions.
