import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('tuyulife.android.release的life-android远端Job物理独立', () => {
  const source = readFileSync(new URL('./execute.mjs', import.meta.url), 'utf8');
  assert.ok(source.includes('{"pipeline":"tuyulife.android.release","job":"life-android"}'));
  assert.match(source, /function runExactWorkflowStep\(index\)/u);
  assert.match(source, /function requireExactRemoteJobEnvironment\(\)/u);
});

test('途遇生活iOS与Android从各自1.0.0正式首版开始', () => {
  const pubspec = readFileSync(new URL('../../../../pubspec.yaml', import.meta.url), 'utf8');
  assert.match(pubspec, /^version: 1\.0\.0\+1$/mu);
});
