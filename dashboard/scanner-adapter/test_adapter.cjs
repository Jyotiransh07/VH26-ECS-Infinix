const { LeakGuardScannerAdapter } = require('./adapter.cjs');

async function runAdapterTests() {
  console.log('=====================================================');
  console.log('PHASE 4 — LEAKGUARD SCANNER ADAPTER TEST SUITE');
  console.log('=====================================================');

  const adapter = new LeakGuardScannerAdapter();
  let passed = 0;
  let total = 4;

  // Test 1: Scan sample-repo-python via actual existing LeakGuard CLI
  console.log('[Test 1] Executing scan against sample-repo-python via CLI...');
  const sampleScan = await adapter.executeScan('sample-repo-python');

  if (sampleScan.status === 'COMPLETED' && sampleScan.summary.definite_leaks === 4 && sampleScan.summary.files_scanned === 6) {
    console.log(`✔ TEST 1 PASSED: Scanned 6 files, captured 4 definite leaks in ${sampleScan.duration_ms}ms.`);
    passed++;
  } else {
    console.error('❌ TEST 1 FAILED:', sampleScan);
  }

  // Test 2: Check finding structure fidelity
  console.log('[Test 2] Verifying finding structure fidelity...');
  const firstFinding = sampleScan.findings[0];
  if (
    firstFinding &&
    firstFinding.file &&
    firstFinding.line &&
    firstFinding.resource_type &&
    firstFinding.variable_name &&
    firstFinding.confidence === 'DEFINITE' &&
    firstFinding.reason &&
    firstFinding.suggestion &&
    Array.isArray(firstFinding.leaking_path)
  ) {
    console.log(`✔ TEST 2 PASSED: Finding model verified for '${firstFinding.file}' line ${firstFinding.line}.`);
    passed++;
  } else {
    console.error('❌ TEST 2 FAILED:', firstFinding);
  }

  // Test 3: Scan demo-project
  console.log('[Test 3] Executing scan against demo-project...');
  const demoScan = await adapter.executeScan('demo-project');
  if (demoScan.status === 'COMPLETED' && demoScan.summary.files_scanned >= 1) {
    console.log(`✔ TEST 3 PASSED: demo-project scan executed cleanly (${demoScan.summary.definite_leaks} leaks).`);
    passed++;
  } else {
    console.error('❌ TEST 3 FAILED:', demoScan);
  }

  // Test 4: Dashboard Lifecycle Status Transition
  console.log('[Test 4] Verifying finding status updates...');
  const findingId = firstFinding.id;
  const updated = adapter.updateFindingStatus(findingId, 'IN_PROGRESS', 'usr-101-janson');
  if (updated && updated.status === 'IN_PROGRESS' && updated.assigned_to === 'usr-101-janson') {
    console.log('✔ TEST 4 PASSED: Finding lifecycle transition (OPEN -> IN_PROGRESS) persisted.');
    passed++;
  } else {
    console.error('❌ TEST 4 FAILED');
  }

  console.log('=====================================================');
  console.log(`RESULTS: ${passed}/${total} ADAPTER TESTS PASSED`);
  console.log('=====================================================');
}

runAdapterTests();
