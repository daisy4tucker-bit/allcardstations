import 'dotenv/config';

const BASE_URL = 'http://localhost:3000/api';

async function request(endpoint: string, options: RequestInit = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

async function runAdminDiagnosticTest() {
  console.log('================================================================');
  console.log('🔒 ALLCARDSTATION ADMIN SYSTEM DIAGNOSTIC SECURITY & HEALTH TEST');
  console.log('================================================================');

  let customerToken = '';
  let adminToken = '';

  // 1. Log in as Customer
  const customerLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'daisy4tucker@gmail.com',
      password: 'Password123!',
    }),
  });
  if (!customerLogin.ok) throw new Error(`Customer login failed: ${JSON.stringify(customerLogin.data)}`);
  customerToken = customerLogin.data.data.token;
  console.log('✅ 1. Customer logged in successfully (Role: CUSTOMER).');

  // 2. Log in as Admin
  const adminLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@allcardstation.com',
      password: 'AdminSecure123!',
    }),
  });
  if (!adminLogin.ok) throw new Error(`Admin login failed: ${JSON.stringify(adminLogin.data)}`);
  adminToken = adminLogin.data.data.token;
  console.log('✅ 2. Admin logged in successfully (Role: ADMIN).');

  // 3. Test: Unauthenticated guest blocked
  console.log('\n--- SECURITY ACCESS CONTROL PROBES ---');
  const guestRes = await request('/admin/diagnostic');
  if (guestRes.status !== 401) {
    throw new Error(`Expected 401 for guest access, got ${guestRes.status}`);
  }
  console.log(`✅ 3. Unauthenticated guest blocked with 401 Unauthorized.`);

  // 4. Test: Customer blocked with 403
  const customerAccess = await request('/admin/diagnostic', {
    headers: { Authorization: `Bearer ${customerToken}` },
  });
  if (customerAccess.status !== 403) {
    throw new Error(`Expected 403 for customer access, got ${customerAccess.status}`);
  }
  console.log(`✅ 4. Customer blocked with 403 Forbidden.`);

  // 5. Test: Admin permitted with 200
  const adminAccess = await request('/admin/diagnostic', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  if (!adminAccess.ok) {
    throw new Error(`Admin access failed with status ${adminAccess.status}: ${JSON.stringify(adminAccess.data)}`);
  }
  console.log(`✅ 5. Admin granted access with 200 OK.`);

  // 6. Test: Verify NO credentials or API keys in response
  console.log('\n--- CREDENTIALS & SENSITIVE DATA REDACTION AUDIT ---');
  const payloadStr = JSON.stringify(adminAccess.data);
  const forbiddenLeakedValues = [
    'postgres://',
    'postgresql://',
    'AdminSecure123!',
    'Password123!',
    'passwordHash',
    'AIzaSy', // Standard Google API Key prefix
    'sk_test_', // Stripe secret key prefix
    'sk_live_',
  ];

  for (const leak of forbiddenLeakedValues) {
    if (payloadStr.includes(leak)) {
      throw new Error(`SECURITY LEAK: Payload contains sensitive leaked credential or secret '${leak}'`);
    }
  }
  console.log('✅ 6. Zero database credentials, passwords, or private API keys exposed in telemetry.');

  // 7. Verify Safe Health Information
  console.log('\n--- SAFE HEALTH INFORMATION VALIDATION ---');
  const diag = adminAccess.data.data.diagnostics;
  console.log(`   • System Status: ${diag.status}`);
  console.log(`   • Database Provider: ${diag.database.provider} (${diag.database.engine})`);
  console.log(`   • Database Ping Latency: ${diag.database.latencyMs}ms`);
  console.log(`   • Node Version: ${diag.server.nodeVersion} (${diag.server.platform} ${diag.server.arch})`);
  console.log(`   • Server Memory: ${diag.server.memory.heapUsedMb} MB / ${diag.server.memory.heapTotalMb} MB (Heap: ${diag.server.memory.heapUsedPercent}%)`);
  console.log(`   • Table Records: Users=${diag.database.tables.users}, Cards=${diag.database.tables.giftCards}, Recips=${diag.database.tables.recipients}, Msgs=${diag.database.tables.messages}`);
  console.log(`   • Zero Traditional Gateway Enforced: ${diag.security.zeroTraditionalGatewaysEnforced}`);
  console.log('✅ 7. All safe operational health telemetry fields populated.');

  // 8. Test: Trigger on-demand diagnostic probes
  console.log('\n--- ON-DEMAND PROBE RUNNER TEST ---');
  const probesRes = await request('/admin/diagnostic/probes', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  if (!probesRes.ok || !probesRes.data?.data?.results) {
    throw new Error(`Diagnostic probes runner failed: ${JSON.stringify(probesRes.data)}`);
  }
  const probeData = probesRes.data.data.results;
  console.log(`   • Total Probes: ${probeData.probes.length}`);
  console.log(`   • Overall Passed: ${probeData.overallPassed}`);
  console.log(`   • Execution Time: ${probeData.totalDurationMs}ms`);
  probeData.probes.forEach((p: any) => {
    console.log(`     - [${p.passed ? 'PASS' : 'FAIL'}] ${p.name} (${p.durationMs}ms)`);
  });
  if (!probeData.overallPassed) {
    throw new Error('Not all diagnostic probes passed.');
  }
  console.log('✅ 8. On-demand diagnostic probes executed and verified.');

  // 9. Test: Verify access audit logging
  console.log('\n--- AUDIT LOGGING VERIFICATION ---');
  const logsRes = await request('/admin/diagnostic/logs', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  if (!logsRes.ok || !logsRes.data?.data?.logs) {
    throw new Error(`Failed to fetch audit logs: ${JSON.stringify(logsRes.data)}`);
  }
  const logs = logsRes.data.data.logs;
  const blockedLog = logs.find((l: any) => l.status === 'FORBIDDEN' || l.status === 'UNAUTHORIZED');
  const successLog = logs.find((l: any) => l.status === 'SUCCESS');

  if (!blockedLog || !successLog) {
    throw new Error(`Audit log missing required events. Log count: ${logs.length}`);
  }
  console.log(`   • Audit log recorded ${logs.length} events.`);
  console.log(`   • Verified blocked attempt logged: ${blockedLog.email || 'Guest'} (${blockedLog.status})`);
  console.log(`   • Verified successful admin access logged: ${successLog.email} (${successLog.status})`);
  console.log('✅ 9. Admin access attempts logged and verifiable in security audit log.');

  console.log('\n================================================================');
  console.log('🎉 ALL ADMIN SYSTEM DIAGNOSTIC REQUIREMENTS VERIFIED & PASSED!');
  console.log('================================================================\n');
}

runAdminDiagnosticTest().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
