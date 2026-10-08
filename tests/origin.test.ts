import test from 'node:test';
import assert from 'node:assert/strict';
import { allowedOrigin } from '../src/lib/server/origin';

test('incoming browser host is accepted when Next uses a different internal bind address', () => {
  const request = new Request('http://0.0.0.0:3101/api/brief', { headers: { host: '127.0.0.1:3101', origin: 'http://127.0.0.1:3101' } });
  assert.equal(allowedOrigin(request), true);
  assert.equal(allowedOrigin(new Request(request, { headers: { host: '127.0.0.1:3101', origin: 'https://other.example' } })), false);
});

test('public HTTPS works behind a proxy; absent or malformed origins do not', () => {
  assert.equal(allowedOrigin(new Request('http://localhost:3000/api/brief', { headers: { origin: 'https://decentdevs.com' } }), 'https://decentdevs.com'), true);
  for (const origin of ['', 'null', 'javascript:alert(1)', 'https://decentdevs.com/extra', 'https://unrelated.example']) {
    assert.equal(allowedOrigin(new Request('http://localhost:3000/api/brief', { headers: { origin } }), 'https://decentdevs.com'), false);
  }
});
