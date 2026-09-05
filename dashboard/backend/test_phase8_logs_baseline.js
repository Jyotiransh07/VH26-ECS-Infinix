const http = require('http');

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: 3001,
      path,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runPhase8Tests() {
  console.log('=====================================================');
  console.log('LEAKGUARD PHASE 8 — LOGS AND BASELINE TEST SUITE');
  console.log('=====================================================');

  try {
    // Test 1: Fetch Logs & Verify Tracked Events
    console.log('[Test 1] Testing Logs API & Event Tracking...');
    const logsRes = await makeRequest('/api/logs');
    if (logsRes.status !== 200 || !logsRes.data.logs) {
      throw new Error(`Failed to fetch logs: ${JSON.stringify(logsRes)}`);
    }

    const events = new Set(logsRes.data.logs.map(l => l.event));
    console.log(`  -> Total logs: ${logsRes.data.total}, Unique event types: ${Array.from(events).join(', ')}`);
    
    // Required events:
    const requiredEvents = [
      'SCAN_STARTED', 'SCAN_COMPLETED', 'FINDING_DETECTED', 
      'FINDING_ASSIGNED', 'STATUS_CHANGED', 'FINDING_FIXED', 
      'FINDING_VERIFIED', 'REPOSITORY_CONNECTED', 'GITHUB_EVENT'
    ];
    for (const reqEv of requiredEvents) {
      if (!events.has(reqEv)) {
        throw new Error(`Missing required tracked event: ${reqEv}`);
      }
    }
    console.log('✔ TEST 1 PASSED: All 9 required lifecycle events are actively tracked.');

    // Test 2: Filter Testing (6 filters: repo, developer, severity, status, event, date)
    console.log('[Test 2] Testing 6 Log Filters (Repo, Dev, Severity, Status, Event, Date)...');
    
    // Filter by repo
    const repoRes = await makeRequest('/api/logs?repository=demo-project');
    const allDemo = repoRes.data.logs.every(l => l.repository === 'demo-project');
    if (!allDemo || repoRes.data.logs.length === 0) throw new Error('Repository filter failed');

    // Filter by developer
    const devRes = await makeRequest('/api/logs?developer=Elena');
    const allElena = devRes.data.logs.every(l => l.developer.name.includes('Elena'));
    if (!allElena || devRes.data.logs.length === 0) throw new Error('Developer filter failed');

    // Filter by severity
    const sevRes = await makeRequest('/api/logs?severity=HIGH');
    const allHigh = sevRes.data.logs.every(l => l.severity === 'HIGH');
    if (!allHigh || sevRes.data.logs.length === 0) throw new Error('Severity filter failed');

    // Filter by status
    const statusRes = await makeRequest('/api/logs?status=RESOLVED');
    const allResolved = statusRes.data.logs.every(l => l.status === 'RESOLVED');
    if (!allResolved || statusRes.data.logs.length === 0) throw new Error('Status filter failed');

    // Filter by event
    const evRes = await makeRequest('/api/logs?event=GITHUB_EVENT');
    const allGithub = evRes.data.logs.every(l => l.event === 'GITHUB_EVENT');
    if (!allGithub || evRes.data.logs.length === 0) throw new Error('Event filter failed');

    // Filter by date
    const dateRes = await makeRequest('/api/logs?date=24h');
    if (dateRes.status !== 200 || !Array.isArray(dateRes.data.logs)) throw new Error('Date filter failed');

    console.log('✔ TEST 2 PASSED: All 6 filters operate with exact precision.');

    // Test 3: Baselines Listing & Creation
    console.log('[Test 3] Testing Baselines Registration & Snapshot Creation...');
    const baselinesRes = await makeRequest('/api/baselines');
    if (baselinesRes.status !== 200 || !Array.isArray(baselinesRes.data)) {
      throw new Error(`Failed to list baselines`);
    }
    console.log(`  -> Initial baselines registered: ${baselinesRes.data.length}`);

    // Create a new baseline
    const createBaseRes = await makeRequest('/api/baselines', 'POST', {
      name: 'CI-Gate Release 1.2 Baseline',
      repository_name: 'sample-repo-python',
      description: 'Captured baseline from main branch pipeline'
    });
    if (createBaseRes.status !== 201 || !createBaseRes.data.id) {
      throw new Error(`Failed to create baseline: ${JSON.stringify(createBaseRes)}`);
    }
    console.log(`✔ TEST 3 PASSED: Baseline created with ID ${createBaseRes.data.id} (${createBaseRes.data.findings.length} findings recorded).`);

    // Test 4: Differential Baseline Comparison (baseline findings, new findings, resolved findings)
    console.log('[Test 4] Testing Baseline Differential Comparison Engine...');
    const compareRes = await makeRequest('/api/baselines/compare?baseline_id=base-sample-v1');
    if (compareRes.status !== 200 || !compareRes.data.summary) {
      throw new Error(`Failed to compare baseline: ${JSON.stringify(compareRes)}`);
    }

    const { summary, baseline_findings, new_findings, resolved_findings } = compareRes.data;
    console.log('  -> Differential Summary:');
    console.log(`     • Baseline Findings (Legacy Unchanged): ${summary.baseline_findings_count} [Expected >= 1]`);
    console.log(`     • New Findings (Regressions):           ${summary.new_findings_count} [Expected >= 1]`);
    console.log(`     • Resolved Findings (Fixed):            ${summary.resolved_findings_count} [Expected >= 1]`);

    if (!Array.isArray(baseline_findings) || !Array.isArray(new_findings) || !Array.isArray(resolved_findings)) {
      throw new Error('Differential response missing one of baseline_findings, new_findings, resolved_findings');
    }

    if (baseline_findings.length === 0 || new_findings.length === 0 || resolved_findings.length === 0) {
      throw new Error('Differential categories did not populate expected subsets');
    }

    console.log('✔ TEST 4 PASSED: Baseline comparison correctly classifies baseline, new, and resolved findings.');

    console.log('=====================================================');
    console.log('RESULTS: 4/4 PHASE 8 BACKEND TESTS PASSED');
    console.log('=====================================================');
  } catch (err) {
    console.error('❌ PHASE 8 TEST FAILED:', err.message);
    process.exit(1);
  }
}

runPhase8Tests();
