const http = require('http');

function makeRequest(path, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: 3001,
      path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...headers
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
    req.end();
  });
}

async function runPhase9Tests() {
  console.log('=====================================================');
  console.log('LEAKGUARD PHASE 9 — ADMIN RBAC & AUTHORIZATION TEST');
  console.log('=====================================================');

  try {
    // Test 1: Normal user receives HTTP 403 Forbidden on all /api/admin/* endpoints
    console.log('[Test 1] Testing Server-Side RBAC: Normal USER access to /api/admin/*...');
    const userAdminRes = await makeRequest('/api/admin/overview', { 'x-user-role': 'USER' });
    if (userAdminRes.status !== 403) {
      throw new Error(`Expected HTTP 403 Forbidden for USER role, received ${userAdminRes.status}`);
    }
    if (userAdminRes.data.error !== 'Forbidden: Admin privileges required') {
      throw new Error(`Unexpected error message: ${JSON.stringify(userAdminRes.data)}`);
    }
    console.log('✔ TEST 1 PASSED: Normal user receives HTTP 403 Forbidden on server-side admin endpoints.');

    // Test 2: Unauthenticated / Anonymous request receives HTTP 403 Forbidden
    console.log('[Test 2] Testing Anonymous Request Access to /api/admin/users...');
    const anonRes = await makeRequest('/api/admin/users');
    if (anonRes.status !== 403) {
      throw new Error(`Expected HTTP 403 Forbidden for anonymous request, received ${anonRes.status}`);
    }
    console.log('✔ TEST 2 PASSED: Anonymous request denied with HTTP 403 Forbidden.');

    // Test 3: Verified ADMIN receives HTTP 200 OK on /api/admin/*
    console.log('[Test 3] Testing Verified ADMIN access to /api/admin/overview...');
    const adminRes = await makeRequest('/api/admin/overview', { 'x-user-role': 'ADMIN' });
    if (adminRes.status !== 200 || !adminRes.data.total_users) {
      throw new Error(`Expected HTTP 200 OK for ADMIN role, received ${adminRes.status}`);
    }
    console.log(`✔ TEST 3 PASSED: ADMIN granted access to platform overview (${adminRes.data.total_users} users, ${adminRes.data.total_organizations} orgs).`);

    // Test 4: Verify all 10 admin endpoints telemetry
    console.log('[Test 4] Testing All 10 Admin Telemetry Endpoints...');
    const adminHeaders = { 'x-user-role': 'ADMIN' };
    
    const [usersRes, orgsRes, reposRes, scansRes, findingsRes, logsRes, ghRes, healthRes, scaleRes] = await Promise.all([
      makeRequest('/api/admin/users', adminHeaders),
      makeRequest('/api/admin/organizations', adminHeaders),
      makeRequest('/api/admin/repositories', adminHeaders),
      makeRequest('/api/admin/scans', adminHeaders),
      makeRequest('/api/admin/findings', adminHeaders),
      makeRequest('/api/admin/logs', adminHeaders),
      makeRequest('/api/admin/github', adminHeaders),
      makeRequest('/api/admin/system-health', adminHeaders),
      makeRequest('/api/admin/scalability', adminHeaders)
    ]);

    if (usersRes.status !== 200 || !Array.isArray(usersRes.data)) throw new Error('Admin Users API failed');
    if (orgsRes.status !== 200 || !Array.isArray(orgsRes.data)) throw new Error('Admin Orgs API failed');
    if (reposRes.status !== 200 || !Array.isArray(reposRes.data)) throw new Error('Admin Repos API failed');
    if (scansRes.status !== 200 || !Array.isArray(scansRes.data)) throw new Error('Admin Scans API failed');
    if (findingsRes.status !== 200 || !Array.isArray(findingsRes.data)) throw new Error('Admin Findings API failed');
    if (logsRes.status !== 200 || !Array.isArray(logsRes.data)) throw new Error('Admin Logs API failed');
    if (ghRes.status !== 200 || !ghRes.data.installed_apps) throw new Error('Admin GitHub API failed');
    if (healthRes.status !== 200 || healthRes.data.status !== 'HEALTHY') throw new Error('Admin System Health API failed');
    if (scaleRes.status !== 200 || (!scaleRes.data.worker_nodes && !scaleRes.data.architectural_pipeline)) throw new Error('Admin Scalability API failed');

    console.log('✔ TEST 4 PASSED: All 10 platform administration telemetry endpoints verified.');

    console.log('=====================================================');
    console.log('RESULTS: 4/4 PHASE 9 ADMIN TESTS PASSED');
    console.log('=====================================================');
  } catch (err) {
    console.error('❌ PHASE 9 TEST FAILED:', err.message);
    process.exit(1);
  }
}

runPhase9Tests();
