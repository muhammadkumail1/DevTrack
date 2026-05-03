require('dotenv').config();
const assert = require('assert');
const http = require('http');
const https = require('https');

const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@devtrack.com';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'Admin@123';

const request = async (path, options = {}) => {
  const url = new URL(BASE_URL + path);
  const transport = url.protocol === 'https:' ? https : http;
  const body = options.body ? JSON.stringify(options.body) : null;

  const requestOptions = {
    method: options.method || 'GET',
    hostname: url.hostname,
    port: url.port,
    path: url.pathname + url.search,
    headers: {
      ...(options.headers || {}),
      ...(body ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } : {}),
    },
    timeout: 10000,
  };

  return new Promise((resolve, reject) => {
    const req = transport.request(requestOptions, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf-8');
        let json = null;
        try { json = JSON.parse(raw); } catch (e) { /* ignore */ }
        resolve({ response: res, body: json });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy(new Error('Request timeout'));
    });

    if (body) req.write(body);
    req.end();
  });
};

(async () => {
  console.log('Running backend smoke tests...');

  const login = await request('/api/auth/login', {
    method: 'POST',
    body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });

  assert.strictEqual(login.response.statusCode, 200, `Login failed: ${login.body?.message || login.response.statusMessage}`);
  assert.ok(login.body?.token, 'Login response did not include token');
  console.log('✓ Auth login');

  const token = login.body.token;

  const me = await request('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.strictEqual(me.response.statusCode, 200, `Auth/me failed: ${me.body?.message || me.response.statusMessage}`);
  assert.strictEqual(me.body?.email, ADMIN_EMAIL, 'Auth /me returned wrong user');
  console.log('✓ Auth /me');

  const projects = await request('/api/projects', {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.strictEqual(projects.response.statusCode, 200, `Projects request failed: ${projects.body?.message || projects.response.statusMessage}`);
  assert.ok(Array.isArray(projects.body), 'Projects response is not an array');
  console.log(`✓ /api/projects returned ${projects.body.length} projects`);

  const tasks = await request('/api/tasks', {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.strictEqual(tasks.response.statusCode, 200, `Tasks request failed: ${tasks.body?.message || tasks.response.statusMessage}`);
  assert.ok(Array.isArray(tasks.body), 'Tasks response is not an array');
  console.log(`✓ /api/tasks returned ${tasks.body.length} tasks`);

  console.log('All smoke tests passed');
})().catch((error) => {
  console.error('Smoke test failed:', error.message || error);
  process.exit(1);
});
