const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const ts = require('typescript');
const source = fs.readFileSync(path.join(__dirname, '../src/lib/central-api-proxy.ts'), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS,
  target: ts.ScriptTarget.ES2020 } }).outputText;
function fixture(env, fetch) {
  const exports = {};
  vm.runInNewContext(compiled, { exports, process: { env }, fetch, URL, Headers, Response, AbortSignal });
  return exports;
}
test('missing service settings never guess a database environment or send requests', async () => {
  for (const env of [{}, { CENTRAL_API_BASE_URL: 'http://127.0.0.1:4005' }, { IMORI_API_KEY: 'fixture' }]) {
    const api = fixture(env, () => { throw Error('Unexpected network'); });
    assert.equal((await api.proxyCentralApi(new Request('https://site.test/api'), '/api/baseball/stats')).status, 503);
  }
});
test('server identity replaces forged browser identity and private headers stay at facade', async () => {
  const api = fixture({ CENTRAL_API_BASE_URL: 'http://127.0.0.1:4005', IMORI_API_KEY: 'fixture-server-identity' },
    async (url, init) => {
      assert.equal(url, 'http://127.0.0.1:4005/api/baseball/players?league=NPB');
      assert.equal(init.headers.get('x-imori-api-key'), 'fixture-server-identity');
      assert.equal(init.headers.get('cookie'), null);
      assert.equal(init.headers.get('authorization'), null);
      assert.equal(init.redirect, 'error');
      assert.ok(init.signal);
      return Response.json({ data: [] }, { headers: { 'set-cookie': 'private' } });
    });
  const response = await api.proxyCentralApi(new Request('https://site.test/api?league=NPB', {
    headers: { cookie: 'private', authorization: 'private', 'x-imori-api-key': 'forged' },
  }), '/api/baseball/players');
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('set-cookie'), null);
});
test('invalid origins and destination replacements fail before fetching', async () => {
  for (const base of ['https://user:pass@core.test', 'file:///tmp/core', 'https://core.test/path']) {
    const api = fixture({ CENTRAL_API_BASE_URL: base, IMORI_API_KEY: 'fixture' }, () => { throw Error('Unexpected network'); });
    assert.equal((await api.proxyCentralApi(new Request('https://site.test/api'), '/api/baseball/stats')).status, 503);
  }
});
