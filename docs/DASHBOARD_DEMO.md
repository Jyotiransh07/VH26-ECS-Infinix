# LeakGuard 5-Minute Hackathon Demo Script & Flow

Use this structured walkthrough for judging, live presentations, and hackathon video recordings.

---

## Demo Overview (300 Seconds)

| Time | Stage | Action & Screen | Talk Track / Script |
|:---:|:---|:---|:---|
| **0:00 - 0:45** | **The Hook** | Landing Page (`/app/intro`) | *"Resource leaks—unclosed files, lingering DB connections, and dead sockets—are silent killers of production servers. LeakGuard solves this with mathematical certainty using zero false-positive static AST analysis."* |
| **0:45 - 1:30** | **Live Scan** | Click **"Run Scan"** Modal (`sample-repo-python`) | *"Watch our Scanner Adapter invoke the real Python 3.12 engine. In under 30 milliseconds, it builds the AST, generates a Control Flow Graph, and analyzes all branching paths without running the code."* |
| **1:30 - 2:30** | **Investigation** | Monaco Code Viewer (`/app/issue-details`) | *"Here is our Monaco code diagnostics view. LeakGuard highlights line 2 where the file is acquired, follows the early return branch on line 4, and shows the exact leaking trajectory: RESOURCE ACQUIRED -> LINE 4 -> LINE 5 -> EXIT. With one click, we can apply the recommended Python context manager."* |
| **2:30 - 3:30** | **Baselines** | Baseline Manager (`/app/baseline`) | *"Enterprise teams can't fix 500 legacy leaks overnight. LeakGuard's Differential Baseline engine separates accepted legacy debt from new blocking regressions. Only NEW leaks fail the CI PR gate."* |
| **3:30 - 4:15** | **Analytics & Logs**| Code Health & Audit (`/app/analytics` & `/app/logs`) | *"Our Recharts analytics show longitudinal MTTR and clean code ratios. Every triage action and GitHub webhook is tracked with 6-dimensional filters."* |
| **4:15 - 5:00** | **Admin & Immutability**| Admin Console (`/admin`) & `git diff` | *"Finally, our separate Admin Console enforces server-side RBAC with Supabase RLS. And most importantly: the core engine repository remains 100% untouched and unmodified."* |

---

## Key Click-by-Click Demo Steps

1. **Start on Landing Page**:
   - Navigate to `http://localhost:5173`.
   - Click through **Stages 1 through 9** on the interactive pipeline visualizer to show AST and CFG generation.
2. **Execute Live Scan**:
   - Click the top-bar **"Scan Now"** button.
   - Select `sample-repo-python` and click **"Start AST Static Scan"**.
   - Watch the 10-stage execution pipeline complete in `< 1,000ms`.
3. **Investigate a Leak**:
   - Click on `early_return.py:2`.
   - Show the Monaco line highlight and CFG path traversal.
   - Click **"In Progress"** and assign to **Elena Rostova**.
4. **Demonstrate Quality Gate Baseline**:
   - Switch to **Baseline** tab in the sidebar.
   - Show the 3 cards: *Baseline (Legacy)*, *New Regressions (Blockers)*, and *Resolved*.
5. **Toggle Admin Role & Security**:
   - Click **Role: USER** in the top navigation to switch to **ADMIN**.
   - View `/admin/scalability` showing the 7-tier pipeline and live process metrics.
   - Switch role back to **USER** to show the **403 Forbidden** security barrier.
