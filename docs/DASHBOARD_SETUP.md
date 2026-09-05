# LeakGuard Web Dashboard — Setup Guide

This guide details the quick setup and execution of the **LeakGuard Web Dashboard** on your local machine or staging environment.

---

## Prerequisites

- **Python**: `3.12+` (with native `ast` standard library)
- **Node.js**: `v20.x+` (verified on Node `v25.8.1`)
- **Git**: Installed and configured

---

## Architecture Overview

```
VH26-ECS-Infinix/
├── leakguard/              # 100% IMMUTABLE: Python 3.12 AST & CFG Engine
├── tests/                  # 100% IMMUTABLE: Engine Unit & Integration Tests
├── sample-repo-python/     # 100% IMMUTABLE: Real Python test fixtures
├── dashboard/              # Isolated Node.js backend & CLI scanner adapter
│   ├── backend/            # Express API Gateway (:3001) with RBAC & Supabase RLS
│   └── scanner-adapter/    # Adapter executing: python -m leakguard.cli scan ...
└── frontend/               # React + TypeScript + Vite + Tailwind CSS Dashboard
```

---

## Quick Start (Two Terminal Windows)

### 1. Start the Node.js API Gateway (Backend)

```bash
# In project root
node dashboard/backend/server.js
```
*The API gateway will initialize, run an initial AST scan against `sample-repo-python`, and begin listening on `http://127.0.0.1:3001`.*

### 2. Start the React Frontend

```bash
# In project root
npm --prefix frontend run dev
```
*Open `http://localhost:5173` in your browser.*

---

## Running Verification & Test Suites

### 1. Run Master 26-Point Integration Test Suite
```bash
node dashboard/test_master_integration_suite.cjs
```

### 2. Run Scanner Adapter CLI Tests
```bash
node dashboard/scanner-adapter/test_adapter.cjs
```

### 3. Run Supabase & RBAC Authorization Tests
```bash
node dashboard/backend/test_phase9_admin_auth.js
```

### 4. Run Analytics & Scalability Tests
```bash
node dashboard/backend/test_phase10_analytics_scalability.js
```

### 5. Run Python Core Engine Unit Tests
```bash
python -c "import tests.unit.test_parser as t; t.test_parse_valid_python(); t.test_parse_invalid_python(); print('Core Tests OK')"
```

---

## Production Build

```bash
npm --prefix frontend run build
```
*Produces optimized, type-checked client artifacts in `frontend/dist/`.*
