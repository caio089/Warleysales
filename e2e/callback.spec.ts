import { expect, test } from '@playwright/test';

const callbackOrigin = 'http://127.0.0.1:4319';
const authOrigin = 'http://127.0.0.1:4320';

test('invalid-code callback exchanges PKCE with local Auth and redirects to login', async ({ request }) => {
  const before = await request.get(`${authOrigin}/__fixture/state`);
  expect(before.ok()).toBeTruthy();
  expect(await before.json()).toEqual({ calls: 0, body: null });

  const verifier = 'synthetic-verifier';
  const response = await request.get(`${callbackOrigin}/auth/callback?code=invalid&next=https%3A%2F%2Fevil.invalid`, {
    maxRedirects: 0,
    headers: { cookie: `sb-localhost-auth-token-code-verifier=base64-${Buffer.from(JSON.stringify(verifier)).toString('base64url')}` },
  });
  expect(response.status()).toBe(307);
  expect(response.headers().location).toBe('http://localhost:4319/login');
  const setCookieNames = (response.headers()['set-cookie'] ?? '')
    .split(/, (?=[^;,]+=)/)
    .map((cookie) => cookie.split(';', 1)[0].split('=', 1)[0]);
  expect(setCookieNames.some((name) => /^sb-localhost-auth-token(?:\.\d+)?$/.test(name))).toBe(false);

  const stateResponse = await request.get(`${authOrigin}/__fixture/state`);
  expect(stateResponse.ok()).toBeTruthy();
  expect(await stateResponse.json()).toEqual({
    calls: 1,
    body: { auth_code: 'invalid', code_verifier: verifier },
  });
});
