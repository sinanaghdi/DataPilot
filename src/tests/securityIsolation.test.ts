export function runSecurityIsolationTests(): { passed: number; failed: number; errors: string[] } {
  let passed = 0;
  let failed = 0;
  const errors: string[] = [];

  function assert(condition: boolean, testName: string) {
    if (condition) {
      passed++;
      console.log(`✅ PASS: ${testName}`);
    } else {
      failed++;
      const msg = `❌ FAIL: ${testName}`;
      console.error(msg);
      errors.push(msg);
    }
  }

  console.log('\n======================================================');
  console.log('🔒 آزمون امنیت، تفکیک چندمستأجری و اعتبارسنجی اسناد');
  console.log('======================================================');

  // --- 1. ID Poisoning Guard Validation ---
  console.log('\n--- تست گارد مسموم‌سازی شناسه (ID Poisoning Guard) ---');
  function isValidId(id: any): boolean {
    return typeof id === 'string' && id.length > 0 && id.length <= 128 && /^[a-zA-Z0-9_\-]+$/.test(id);
  }

  assert(isValidId('proj_123456789'), 'Normal alphanumeric ID with underscore is valid');
  assert(isValidId('user-alpha-99'), 'ID with hyphen is valid');
  assert(!isValidId('../../etc/passwd'), 'Path traversal sequence is strictly rejected');
  assert(!isValidId('proj;DROP TABLE;'), 'SQL/Command injection characters are rejected');
  assert(!isValidId(''), 'Empty ID string is rejected');
  assert(!isValidId('A'.repeat(129)), 'Oversized ID exceeding 128 characters is rejected');

  // --- 2. Multi-Tenant Cross-User Isolation (Account A vs Account B) ---
  console.log('\n--- تست ایزولاسیون چندمستأجری (Account A vs Account B) ---');
  function checkDocumentAccess(authUid: string | null, targetOwnerId: string, operation: 'read' | 'write'): boolean {
    if (!authUid) return false; // unauthenticated
    if (authUid !== targetOwnerId) return false; // cross-user access
    return true;
  }

  const userA = 'user_alpha_123';
  const userB = 'user_beta_456';

  assert(checkDocumentAccess(userA, userA, 'read') === true, 'User A can read User A project');
  assert(checkDocumentAccess(userA, userB, 'read') === false, 'User A CANNOT read User B project (cross-user block)');
  assert(checkDocumentAccess(userA, userB, 'write') === false, 'User A CANNOT write or tamper with User B project');
  assert(checkDocumentAccess(null, userA, 'read') === false, 'Unauthenticated user CANNOT read User A project');
  assert(checkDocumentAccess(null, userA, 'write') === false, 'Unauthenticated user CANNOT write to User A project');

  // --- 3. Shadow Field Injection Prevention ---
  console.log('\n--- تست مسدودسازی فیلدهای سایه (Shadow Field Injection) ---');
  const allowedProjectKeys = ['id', 'userId', 'title', 'description', 'datasetName', 'rowCount', 'columnCount', 'metricsSummary', 'createdAt', 'updatedAt'];
  const requiredProjectKeys = ['id', 'userId', 'title', 'datasetName', 'rowCount', 'columnCount', 'createdAt', 'updatedAt'];

  function validateProjectKeys(data: Record<string, any>): boolean {
    const keys = Object.keys(data);
    const hasAllReq = requiredProjectKeys.every((k) => keys.includes(k));
    const hasOnlyAllowed = keys.every((k) => allowedProjectKeys.includes(k));
    return hasAllReq && hasOnlyAllowed;
  }

  const legitimatePayload = {
    id: 'proj_1',
    userId: userA,
    title: 'فروش بهار',
    datasetName: 'sales.csv',
    rowCount: 100,
    columnCount: 5,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
  };
  assert(validateProjectKeys(legitimatePayload) === true, 'Legitimate project payload passes schema keys validation');

  const shadowFieldPayload = {
    ...legitimatePayload,
    isAdmin: true, // Injected ghost field
    privilege: 'superuser',
  };
  assert(validateProjectKeys(shadowFieldPayload) === false, 'Shadow field injection (isAdmin / privilege) is strictly rejected');

  // --- 4. Ownership Modification Attempt ---
  console.log('\n--- تست تغییر ناپذیری مالکیت (Immutable Ownership) ---');
  function validateOwnershipUpdate(incomingUserId: string, existingUserId: string): boolean {
    return incomingUserId === existingUserId;
  }
  assert(validateOwnershipUpdate(userA, userA) === true, 'Matching owner preserves project state');
  assert(validateOwnershipUpdate(userB, userA) === false, 'Attempt to reassign project owner from User A to User B is blocked');

  // --- 5. Server Rate Limiter Logic Verification ---
  console.log('\n--- تست محدودساز نرخ فراخوانی (Rate Limiter) ---');
  const rateLimitHistory: number[] = [];
  const MAX_CALLS = 5;
  const WINDOW_MS = 1000;

  function simulateRateLimit(currentTime: number): boolean {
    // Evict old timestamps
    const active = rateLimitHistory.filter((t) => currentTime - t < WINDOW_MS);
    if (active.length >= MAX_CALLS) {
      return false; // Rate limit exceeded (HTTP 429)
    }
    rateLimitHistory.push(currentTime);
    return true; // Allowed
  }

  let allowedCount = 0;
  for (let i = 0; i < 5; i++) {
    if (simulateRateLimit(1000 + i * 10)) allowedCount++;
  }
  assert(allowedCount === 5, 'Allowed 5 legitimate rapid requests within capacity');
  assert(simulateRateLimit(1060) === false, 'The 6th request is strictly throttled with 429 Too Many Requests');

  return { passed, failed, errors };
}
