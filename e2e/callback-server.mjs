import { createServer } from 'node:http';
import next from 'next';

import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('./callback-app', import.meta.url));
const authState = { calls: 0, body: null };
const auth = createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/__fixture/state') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify(authState));
    return;
  }
  if (req.method === 'POST' && req.url === '/auth/v1/token?grant_type=pkce') {
    let body = '';
    for await (const chunk of req) body += chunk;
    authState.calls += 1;
    try {
      const parsed = JSON.parse(body);
      authState.body = { auth_code: parsed.auth_code, code_verifier: parsed.code_verifier };
    } catch {
      authState.body = { invalid_json: true };
    }
    res.writeHead(400, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ code: 'invalid_grant', msg: 'synthetic invalid code' }));
    return;
  }
  res.writeHead(404, { 'content-type': 'application/json' });
  res.end(JSON.stringify({ error: 'fixture endpoint denied' }));
});

const app = next({
  dev: true,
  dir: root,
  port: 4319,
  hostname: '127.0.0.1',
});
const handle = app.getRequestHandler();
const site = createServer((req, res) => handle(req, res));

try {
  await new Promise((resolve, reject) => auth.once('error', reject).listen(4320, '127.0.0.1', resolve));
  await app.prepare();
  await new Promise((resolve, reject) => site.once('error', reject).listen(4319, '127.0.0.1', resolve));
} catch (error) {
  auth.close();
  site.close();
  throw error;
}

async function shutdown() {
  await Promise.all([new Promise(resolve => site.close(resolve)), new Promise(resolve => auth.close(resolve))]);
  await app.close();
}
process.once('SIGINT', () => void shutdown());
process.once('SIGTERM', () => void shutdown());
