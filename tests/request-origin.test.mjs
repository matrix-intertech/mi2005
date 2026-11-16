import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const source = ts.transpileModule(fs.readFileSync('lib/request-origin.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const moduleExports = {};
new Function('exports', source)(moduleExports);
const { isAllowedRequestOrigin: allowed, parseOrigin, forwardedPublicOrigin } = moduleExports;
const prod = { appUrl: 'https://beta.simarone.com/', nodeEnv: 'production' };
function req(origin, headers = {}, method = 'POST', url = 'http://127.0.0.1:3000/api/admin/portfolio') {
 return new Request(url, { method, headers: { ...(origin === undefined ? {} : { Origin: origin }), ...headers } });
}
test('canonical production origin works for all portfolio methods behind internal HTTP', () => {
 for (const method of ['GET','POST','PATCH','DELETE']) assert.equal(allowed(req('https://beta.simarone.com', {}, method), prod), true);
});
test('parses origins, normalizes trailing slash/case/default port, preserves nondefault port', () => {
 assert.equal(parseOrigin('https://BETA.SIMARONE.COM:443///'), 'https://beta.simarone.com');
 assert.equal(allowed(req('https://beta.simarone.com/'), prod), true);
 for (const bad of ['https://beta.simarone.com:444','http://beta.simarone.com','https://beta.simarone.com.attacker.test','https://attacker.test/?next=https://beta.simarone.com','https://beta.simarone.com@attacker.test','https://beta.simarone.com/path','null','https://beta.simarone.com,https://attacker.test']) assert.equal(allowed(req(bad),prod),false,bad);
});
test('reconstructs proxy public origin with forwarded host or Host fallback', () => {
 for(const hostHeaders of [{'x-forwarded-host':'beta.simarone.com'}, {host:'beta.simarone.com'}]){
 const r=req('https://beta.simarone.com',{'x-forwarded-proto':'https',...hostHeaders});assert.equal(forwardedPublicOrigin(r),'https://beta.simarone.com');assert.equal(allowed(r,prod),true);
 }
 assert.equal(forwardedPublicOrigin(req('https://beta.simarone.com',{'x-forwarded-host':'beta.simarone.com, evil.test','x-forwarded-proto':'https'})),null);
});
test('spoofed host and forwarded headers cannot authorize an unknown origin', () => {
 for(const headers of [{host:'evil.test'}, {'x-forwarded-host':'evil.test','x-forwarded-proto':'https'}, {host:'evil.test','x-forwarded-host':'evil.test','x-forwarded-proto':'https'}]) assert.equal(allowed(req('https://evil.test',headers),prod),false);
 assert.equal(allowed(req('https://evil.test',{},'POST','https://evil.test/api/admin/portfolio?APP_URL=https://evil.test'),prod),false);
 assert.equal(allowed(req('https://evil.test',{'x-forwarded-host':'evil.test','x-forwarded-proto':'https'}),{nodeEnv:'production'}),false);
});
test('missing/null Origin mutations rejected; no-Origin read allowed; cross-site rejected', () => {
 for(const method of ['POST','PATCH','DELETE']) assert.equal(allowed(req(undefined,{},method),prod),false);
 assert.equal(allowed(req(undefined,{},'GET'),prod),true);
 for(const method of ['GET','POST','PATCH','DELETE']) assert.equal(allowed(req('https://beta.simarone.com',{'sec-fetch-site':'cross-site'},method),prod),false);
});
test('localhost works only in development and must match request or reconstructed origin', () => {
 for(const host of ['localhost','127.0.0.1','[::1]']) {
 const origin=`http://${host}:3000`;
 const r=req(origin,{},'POST',origin+'/api/admin/portfolio');
 assert.equal(allowed(r,{...prod,nodeEnv:'development'}),true);
 assert.equal(allowed(r,prod),false);
 assert.equal(allowed(r,{appUrl:origin,nodeEnv:'production'}),false);
 }
 assert.equal(allowed(req('http://localhost:4000'),{nodeEnv:'development'}),false);
 assert.equal(allowed(req('https://evil.test',{'x-forwarded-host':'evil.test','x-forwarded-proto':'https'}),{nodeEnv:'development'}),false);
});
