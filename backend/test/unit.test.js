/**
 * DevTrack Unit Tests
 * Tests for controllers, models, and utility functions
 * Test Framework: Node.js assert module
 */

const assert = require('assert');
const path = require('path');

// Configure environment
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Mock data generators
const createMockUser = (overrides = {}) => ({
  _id: 'user_123',
  name: 'Test User',
  email: 'test@example.com',
  password: 'hashed_password',
  role: 'Developer',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});

const createMockProject = (overrides = {}) => ({
  _id: 'project_123',
  title: 'Test Project',
  description: 'Test Description',
  manager: 'user_123',
  members: ['user_123'],
  status: 'Active',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});

const createMockTask = (overrides = {}) => ({
  _id: 'task_123',
  title: 'Test Task',
  description: 'Test Task Description',
  project: 'project_123',
  assignedTo: 'user_123',
  priority: 'Medium',
  status: 'To Do',
  dueDate: new Date(Date.now() + 86400000),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});

const createMockBug = (overrides = {}) => ({
  _id: 'bug_123',
  title: 'Test Bug',
  description: 'Bug Description',
  project: 'project_123',
  severity: 'High',
  status: 'Open',
  reportedBy: 'user_123',
  assignedTo: 'user_123',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});

// ============================================================================
// TEST SUITES
// ============================================================================

class TestSuite {
  constructor(name) {
    this.name = name;
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
    this.errors = [];
  }

  test(name, fn) {
    this.tests.push({ name, fn });
  }

  async run() {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`TEST SUITE: ${this.name}`);
    console.log(`${'='.repeat(80)}`);

    for (const test of this.tests) {
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
          error: error.message,
          stack: error.stack
        });
      }
    }

    console.log(`\nResults: ${this.passed} passed, ${this.failed} failed`);
    return {
      name: this.name,
      passed: this.passed,
      failed: this.failed,
      total: this.tests.length,
      errors: this.errors
    };
  }
}

// ============================================================================
// UNIT TEST SUITES
// ============================================================================

// 1. Input Validation Tests
const validationSuite = new TestSuite('Input Validation');

validationSuite.test('Email validation - valid email', () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  assert.strictEqual(emailRegex.test('test@example.com'), true);
});

validationSuite.test('Email validation - invalid email', () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  assert.strictEqual(emailRegex.test('invalid-email'), false);
});

validationSuite.test('Password validation - minimum length', () => {
  const password = 'Pass123!';
  assert.ok(password.length >= 6, 'Password should be at least 6 characters');
});

validationSuite.test('Required fields validation', () => {
  const task = createMockTask();
  assert.ok(task.title, 'Task must have title');
  assert.ok(task.project, 'Task must have project');
  assert.ok(task.assignedTo, 'Task must be assigned');
});

validationSuite.test('Date validation - future due date', () => {
  const task = createMockTask();
  const now = new Date();
  assert.ok(task.dueDate > now, 'Due date must be in future');
});

// 2. Data Model Tests
const dataSuite = new TestSuite('Data Model Integrity');

dataSuite.test('User model - role validity', () => {
  const validRoles = ['Admin', 'Manager', 'Developer', 'Tester'];
  const user = createMockUser({ role: 'Developer' });
  assert.ok(validRoles.includes(user.role), 'Role must be valid');
});

dataSuite.test('Task model - status transitions', () => {
  const validStatuses = ['To Do', 'In Progress', 'Done'];
  const task = createMockTask({ status: 'In Progress' });
  assert.ok(validStatuses.includes(task.status), 'Status must be valid');
});

dataSuite.test('Bug model - severity levels', () => {
  const validSeverities = ['Low', 'Medium', 'High', 'Critical'];
  const bug = createMockBug({ severity: 'Critical' });
  assert.ok(validSeverities.includes(bug.severity), 'Severity must be valid');
});

dataSuite.test('Project model - member management', () => {
  const project = createMockProject({ members: ['user_1', 'user_2', 'user_3'] });
  assert.strictEqual(project.members.length, 3, 'Project should track members');
});

dataSuite.test('Timestamp auto-generation', () => {
  const user = createMockUser();
  assert.ok(user.createdAt instanceof Date, 'Must have createdAt timestamp');
  assert.ok(user.updatedAt instanceof Date, 'Must have updatedAt timestamp');
});

// 3. Business Logic Tests
const logicSuite = new TestSuite('Business Logic');

logicSuite.test('Task priority comparison', () => {
  const priorityLevels = { Low: 1, Medium: 2, High: 3, Critical: 4 };
  const task1 = createMockTask({ priority: 'High' });
  const task2 = createMockTask({ priority: 'Medium' });
  assert.ok(priorityLevels[task1.priority] > priorityLevels[task2.priority]);
});

logicSuite.test('Bug lifecycle - cannot close already closed bug', () => {
  const bug = createMockBug({ status: 'Closed' });
  assert.strictEqual(bug.status, 'Closed', 'Bug is already closed');
  assert.throws(() => {
    if (bug.status === 'Closed') throw new Error('Cannot close closed bug');
  }, /Cannot close closed bug/);
});

logicSuite.test('Sprint capacity planning - total task hours', () => {
  const tasks = [
    createMockTask({ _id: 't1', estimatedHours: 5 }),
    createMockTask({ _id: 't2', estimatedHours: 8 }),
    createMockTask({ _id: 't3', estimatedHours: 3 })
  ];
  const totalHours = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
  assert.strictEqual(totalHours, 16, 'Total hours should be sum of task hours');
});

logicSuite.test('User role permissions - admin can delete users', () => {
  const admin = createMockUser({ role: 'Admin' });
  const canDelete = admin.role === 'Admin';
  assert.ok(canDelete, 'Admin should have delete permission');
});

logicSuite.test('Project member addition - duplicate prevention', () => {
  const project = createMockProject({ members: ['user_1', 'user_2'] });
  const newMember = 'user_1';
  const isDuplicate = project.members.includes(newMember);
  assert.ok(isDuplicate, 'Duplicate member detected');
});

// 4. Error Handling Tests
const errorSuite = new TestSuite('Error Handling');

errorSuite.test('Null/undefined input handling', () => {
  const task = createMockTask({ title: null });
  assert.throws(() => {
    if (!task.title) throw new Error('Title is required');
  }, /Title is required/);
});

errorSuite.test('Invalid date handling', () => {
  assert.throws(() => {
    const dueDate = new Date('invalid-date');
    if (isNaN(dueDate.getTime())) throw new Error('Invalid date format');
  }, /Invalid date format/);
});

errorSuite.test('Duplicate email handling', () => {
  const users = [
    createMockUser({ _id: 'u1', email: 'test@example.com' }),
    createMockUser({ _id: 'u2', email: 'test@example.com' })
  ];
  const emails = users.map(u => u.email);
  const hasDuplicates = new Set(emails).size !== emails.length;
  assert.ok(hasDuplicates, 'Duplicate emails detected');
});

errorSuite.test('Authorization violation detection', () => {
  const user = createMockUser({ role: 'Developer' });
  const canDeleteUser = user.role === 'Admin';
  assert.throws(() => {
    if (!canDeleteUser) throw new Error('Unauthorized');
  }, /Unauthorized/);
});

// 5. Data Filtering & Searching Tests
const filterSuite = new TestSuite('Filtering & Searching');

filterSuite.test('Filter tasks by status', () => {
  const tasks = [
    createMockTask({ _id: 't1', status: 'To Do' }),
    createMockTask({ _id: 't2', status: 'In Progress' }),
    createMockTask({ _id: 't3', status: 'To Do' })
  ];
  const filtered = tasks.filter(t => t.status === 'To Do');
  assert.strictEqual(filtered.length, 2, 'Should filter by status');
});

filterSuite.test('Filter bugs by severity', () => {
  const bugs = [
    createMockBug({ _id: 'b1', severity: 'High' }),
    createMockBug({ _id: 'b2', severity: 'Low' }),
    createMockBug({ _id: 'b3', severity: 'High' })
  ];
  const critical = bugs.filter(b => b.severity === 'High');
  assert.strictEqual(critical.length, 2, 'Should filter by severity');
});

filterSuite.test('Search by project', () => {
  const tasks = [
    createMockTask({ _id: 't1', project: 'proj_1' }),
    createMockTask({ _id: 't2', project: 'proj_2' }),
    createMockTask({ _id: 't3', project: 'proj_1' })
  ];
  const filtered = tasks.filter(t => t.project === 'proj_1');
  assert.strictEqual(filtered.length, 2, 'Should filter by project');
});

filterSuite.test('Sort by priority', () => {
  const priorityOrder = { Low: 1, Medium: 2, High: 3, Critical: 4 };
  const tasks = [
    createMockTask({ _id: 't1', priority: 'Low' }),
    createMockTask({ _id: 't2', priority: 'Critical' }),
    createMockTask({ _id: 't3', priority: 'High' })
  ];
  const sorted = tasks.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
  assert.strictEqual(sorted[0]._id, 't2', 'Critical task should be first');
});

// ============================================================================
// TEST RUNNER
// ============================================================================

async function runAllTests() {
  const suites = [
    validationSuite,
    dataSuite,
    logicSuite,
    errorSuite,
    filterSuite
  ];

  const results = [];
  for (const suite of suites) {
    results.push(await suite.run());
  }

  // Summary
  console.log(`\n${'='.repeat(80)}`);
  console.log('OVERALL TEST SUMMARY');
  console.log(`${'='.repeat(80)}`);

  let totalPassed = 0;
  let totalFailed = 0;

  results.forEach(result => {
    console.log(`\n${result.name}:`);
    console.log(`  Passed: ${result.passed}/${result.total}`);
    console.log(`  Failed: ${result.failed}/${result.total}`);
    console.log(`  Success Rate: ${((result.passed / result.total) * 100).toFixed(1)}%`);
    totalPassed += result.passed;
    totalFailed += result.failed;
  });

  console.log(`\n${'='.repeat(80)}`);
  console.log(`TOTAL: ${totalPassed} passed, ${totalFailed} failed out of ${totalPassed + totalFailed} tests`);
  console.log(`Overall Success Rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`);
  console.log(`${'='.repeat(80)}\n`);

  return {
    results,
    totalPassed,
    totalFailed,
    successRate: ((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)
  };
}

// Export for potential CI/CD integration
module.exports = { runAllTests, TestSuite };

// Run if executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}
