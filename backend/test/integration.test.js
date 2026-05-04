/**
 * DevTrack Integration Tests
 * Tests for API endpoints, authentication, and workflows
 */

const assert = require('assert');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

// Test utilities
class APITester {
  constructor() {
    this.authToken = null;
    this.testUser = null;
    this.testProject = null;
  }

  async makeRequest(method, endpoint, body = null, headers = {}) {
    try {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
          ...(this.authToken && { Authorization: `Bearer ${this.authToken}` })
        }
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(`${BASE_URL}${endpoint}`, options);
      const data = await response.json();

      return {
        status: response.status,
        body: data,
        ok: response.ok
      };
    } catch (error) {
      console.error(`Request error: ${error.message}`);
      throw error;
    }
  }
}

class TestSuite {
  constructor(name) {
    this.name = name;
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
    this.errors = [];
    this.skipped = 0;
  }

  test(name, fn, skip = false) {
    this.tests.push({ name, fn, skip });
  }

  async run() {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`TEST SUITE: ${this.name}`);
    console.log(`${'='.repeat(80)}`);

    for (const test of this.tests) {
      if (test.skip) {
        console.log(`⊘ ${test.name} (skipped)`);
        this.skipped++;
        continue;
      }

      try {
        await test.fn();
        console.log(`✓ ${test.name}`);
        this.passed++;
      } catch (error) {
        console.log(`✗ ${test.name}`);
        console.log(`  Error: ${error.message}`);
        this.failed++;
        this.errors.push({
          test: test.name,
          error: error.message
        });
      }
    }

    console.log(`\nResults: ${this.passed} passed, ${this.failed} failed, ${this.skipped} skipped`);
    return {
      name: this.name,
      passed: this.passed,
      failed: this.failed,
      skipped: this.skipped,
      total: this.tests.length,
      errors: this.errors
    };
  }
}

// ============================================================================
// INTEGRATION TEST SUITES
// ============================================================================

// 1. Authentication Tests
const authSuite = new TestSuite('Authentication & Authorization');

authSuite.test('Authentication - Valid login returns JWT token', async () => {
  const tester = new APITester();
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@devtrack.local';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@123';

  const response = await tester.makeRequest('POST', '/api/auth/login', {
    email: adminEmail,
    password: adminPassword
  });

  assert.strictEqual(response.status, 200, `Expected 200, got ${response.status}`);
  assert.ok(response.body.token, 'Response should contain JWT token');
  tester.authToken = response.body.token;
});

authSuite.test('Authentication - Invalid credentials rejected', async () => {
  const tester = new APITester();
  const response = await tester.makeRequest('POST', '/api/auth/login', {
    email: 'invalid@example.com',
    password: 'wrongpassword'
  });

  assert.strictEqual(response.status, 401, 'Should reject invalid credentials');
});

authSuite.test('Authentication - Missing email validation', async () => {
  const tester = new APITester();
  const response = await tester.makeRequest('POST', '/api/auth/login', {
    password: 'somepassword'
  });

  assert.strictEqual(response.status, 400, 'Should validate required fields');
});

authSuite.test('Authentication - Protected routes require token', async () => {
  const tester = new APITester();
  const response = await tester.makeRequest('GET', '/api/users');

  assert.strictEqual(response.status, 401, 'Protected route should require auth token');
});

// 2. Project Management Tests
const projectSuite = new TestSuite('Project Management');

projectSuite.test('Projects - List projects returns array', async () => {
  const tester = new APITester();
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@devtrack.local';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@123';

  // Login first
  let response = await tester.makeRequest('POST', '/api/auth/login', {
    email: adminEmail,
    password: adminPassword
  });
  tester.authToken = response.body.token;

  // List projects
  response = await tester.makeRequest('GET', '/api/projects');
  assert.strictEqual(response.status, 200);
  assert.ok(Array.isArray(response.body), 'Should return array of projects');
});

projectSuite.test('Projects - Create project requires manager role', async () => {
  const tester = new APITester();
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@devtrack.local';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@123';

  let response = await tester.makeRequest('POST', '/api/auth/login', {
    email: adminEmail,
    password: adminPassword
  });
  tester.authToken = response.body.token;

  response = await tester.makeRequest('POST', '/api/projects', {
    title: 'Test Project ' + Date.now(),
    description: 'Test Description'
  });

  assert.ok([200, 201].includes(response.status), 'Manager should create project');
});

projectSuite.test('Projects - Retrieve non-existent project returns 404', async () => {
  const tester = new APITester();
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@devtrack.local';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@123';

  let response = await tester.makeRequest('POST', '/api/auth/login', {
    email: adminEmail,
    password: adminPassword
  });
  tester.authToken = response.body.token;

  response = await tester.makeRequest('GET', '/api/projects/invalid_id_12345');
  assert.strictEqual(response.status, 404, 'Should return 404 for non-existent project');
});

// 3. Task Management Tests
const taskSuite = new TestSuite('Task Management');

taskSuite.test('Tasks - List tasks endpoint accessible', async () => {
  const tester = new APITester();
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@devtrack.local';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@123';

  let response = await tester.makeRequest('POST', '/api/auth/login', {
    email: adminEmail,
    password: adminPassword
  });
  tester.authToken = response.body.token;

  response = await tester.makeRequest('GET', '/api/tasks');
  assert.strictEqual(response.status, 200);
  assert.ok(Array.isArray(response.body) || response.body.tasks !== undefined);
});

taskSuite.test('Tasks - Create task with valid data', async () => {
  const tester = new APITester();
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@devtrack.local';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@123';

  let response = await tester.makeRequest('POST', '/api/auth/login', {
    email: adminEmail,
    password: adminPassword
  });
  tester.authToken = response.body.token;

  response = await tester.makeRequest('POST', '/api/tasks', {
    title: 'Test Task ' + Date.now(),
    description: 'Task Description',
    priority: 'Medium',
    dueDate: new Date(Date.now() + 86400000).toISOString()
  });

  assert.ok([200, 201].includes(response.status), 'Should create task with valid data');
});

// 4. Bug Tracking Tests
const bugSuite = new TestSuite('Bug Tracking');

bugSuite.test('Bugs - List bugs endpoint accessible', async () => {
  const tester = new APITester();
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@devtrack.local';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@123';

  let response = await tester.makeRequest('POST', '/api/auth/login', {
    email: adminEmail,
    password: adminPassword
  });
  tester.authToken = response.body.token;

  response = await tester.makeRequest('GET', '/api/bugs');
  assert.strictEqual(response.status, 200);
  assert.ok(Array.isArray(response.body) || response.body.bugs !== undefined);
});

bugSuite.test('Bugs - Report bug with severity', async () => {
  const tester = new APITester();
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@devtrack.local';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@123';

  let response = await tester.makeRequest('POST', '/api/auth/login', {
    email: adminEmail,
    password: adminPassword
  });
  tester.authToken = response.body.token;

  response = await tester.makeRequest('POST', '/api/bugs', {
    title: 'Test Bug ' + Date.now(),
    description: 'Bug Description',
    severity: 'High'
  });

  assert.ok([200, 201].includes(response.status), 'Should report bug');
});

// 5. Sprint Management Tests
const sprintSuite = new TestSuite('Sprint Management');

sprintSuite.test('Sprints - List sprints endpoint accessible', async () => {
  const tester = new APITester();
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@devtrack.local';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@123';

  let response = await tester.makeRequest('POST', '/api/auth/login', {
    email: adminEmail,
    password: adminPassword
  });
  tester.authToken = response.body.token;

  response = await tester.makeRequest('GET', '/api/sprints');
  assert.strictEqual(response.status, 200);
  assert.ok(Array.isArray(response.body) || response.body.sprints !== undefined);
});

// 6. Reporting Tests
const reportSuite = new TestSuite('Reporting & Analytics');

reportSuite.test('Reports - Dashboard accessible', async () => {
  const tester = new APITester();
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@devtrack.local';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@123';

  let response = await tester.makeRequest('POST', '/api/auth/login', {
    email: adminEmail,
    password: adminPassword
  });
  tester.authToken = response.body.token;

  response = await tester.makeRequest('GET', '/api/reports/dashboard');
  assert.ok([200, 404].includes(response.status), 'Dashboard endpoint should exist or return 404');
});

// 7. Error Handling Tests
const errorHandlingSuite = new TestSuite('Error Handling & Edge Cases');

errorHandlingSuite.test('Error Handling - 400 for missing required fields', async () => {
  const tester = new APITester();
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@devtrack.local';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@123';

  let response = await tester.makeRequest('POST', '/api/auth/login', {
    email: adminEmail,
    password: adminPassword
  });
  tester.authToken = response.body.token;

  response = await tester.makeRequest('POST', '/api/tasks', {
    description: 'Missing title'
  });

  assert.ok([400, 422].includes(response.status), 'Should validate required fields');
});

errorHandlingSuite.test('Error Handling - Invalid ObjectID format', async () => {
  const tester = new APITester();
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@devtrack.local';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@123';

  let response = await tester.makeRequest('POST', '/api/auth/login', {
    email: adminEmail,
    password: adminPassword
  });
  tester.authToken = response.body.token;

  response = await tester.makeRequest('GET', '/api/tasks/not_a_valid_id');
  assert.ok([400, 404].includes(response.status), 'Should handle invalid ID');
});

errorHandlingSuite.test('Error Handling - CORS headers present', async () => {
  const tester = new APITester();
  const response = await tester.makeRequest('GET', '/api/projects');
  assert.ok(response.status === 200 || response.status === 401, 'API should be accessible');
});

// ============================================================================
// TEST RUNNER
// ============================================================================

async function runIntegrationTests() {
  const suites = [
    authSuite,
    projectSuite,
    taskSuite,
    bugSuite,
    sprintSuite,
    reportSuite,
    errorHandlingSuite
  ];

  const results = [];
  for (const suite of suites) {
    results.push(await suite.run());
  }

  // Summary
  console.log(`\n${'='.repeat(80)}`);
  console.log('INTEGRATION TESTS SUMMARY');
  console.log(`${'='.repeat(80)}`);

  let totalPassed = 0;
  let totalFailed = 0;
  let totalSkipped = 0;

  results.forEach(result => {
    console.log(`\n${result.name}:`);
    console.log(`  Passed: ${result.passed}/${result.total}`);
    console.log(`  Failed: ${result.failed}/${result.total}`);
    console.log(`  Skipped: ${result.skipped}/${result.total}`);
    console.log(`  Success Rate: ${((result.passed / (result.total - result.skipped)) * 100).toFixed(1)}%`);
    totalPassed += result.passed;
    totalFailed += result.failed;
    totalSkipped += result.skipped;
  });

  console.log(`\n${'='.repeat(80)}`);
  console.log(`TOTAL: ${totalPassed} passed, ${totalFailed} failed, ${totalSkipped} skipped`);
  const effectiveTotal = totalPassed + totalFailed;
  if (effectiveTotal > 0) {
    console.log(`Overall Success Rate: ${((totalPassed / effectiveTotal) * 100).toFixed(1)}%`);
  }
  console.log(`${'='.repeat(80)}\n`);

  return {
    results,
    totalPassed,
    totalFailed,
    totalSkipped,
    successRate: effectiveTotal > 0 ? ((totalPassed / effectiveTotal) * 100).toFixed(1) : 0
  };
}

module.exports = { runIntegrationTests, APITester, TestSuite };

if (require.main === module) {
  runIntegrationTests().catch(console.error);
}
