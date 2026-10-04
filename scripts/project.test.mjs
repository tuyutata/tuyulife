import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, realpathSync,
  rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';
import { createProject, platformEntries, verifyProject } from './project.mjs';

// 使用源码外最小夹具验证路径与归属；不运行Flutter、不下载工具、不接触真实账户。
function fixture(t) {
  const root = mkdtempSync(join(realpathSync(tmpdir()), 'tuyulife-project-test-'));
  const owned = lstatSync(root);
  t.after(() => {
    const current = lstatSync(root);
    assert.equal(current.ino, owned.ino);
    assert.equal(current.dev, owned.dev);
    rmSync(root, { recursive: true });
  });
  const source = join(root, 'source'), work = join(root, 'work'), tool = join(root, 'tool');
  for (const p of [source, work, tool]) mkdirSync(p);
  const write = (p, content) => { mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, content); };
  write(join(source, 'pubspec.yaml'), 'name: project_fixture\nenvironment:\n  sdk: ">=3.12.0 <4.0.0"\n');
  write(join(source, 'lib/main.dart'), 'void main() {}\n');
  write(join(source, 'analysis_options.yaml'), 'analyzer:\n');
  for (const [input] of platformEntries) write(join(source, input), 'fixture:' + input + '\n');
  for (const name of ['gradlew', 'gradlew.bat', 'gradle/wrapper/gradle-wrapper.jar']) write(join(tool, 'bin/cache/artifacts/gradle_wrapper', name), 'tool-fixture:' + name);
  return { root, source, work, tool, write };
}

test('平台目录在任务内还原，输入字节及可写配置隔离', async t => {
  const f = fixture(t);
  const output = await createProject({ ...f, platform: 'ios' });
  assert.equal(verifyProject({ ...f, output, platform: 'ios' }), output);
  for (const [input, target] of platformEntries) {
    assert.equal(readFileSync(join(output, target), 'utf8'), readFileSync(join(f.source, input), 'utf8'));
    assert.equal(existsSync(join(output, input)), false);
  }
  writeFileSync(join(output, 'pubspec.yaml'), 'changed-work-only\n');
  assert.match(readFileSync(join(f.source, 'pubspec.yaml'), 'utf8'), /project_fixture/);
  writeFileSync(join(output, 'analysis_options.yaml'), 'changed-work-only\n');
  assert.equal(readFileSync(join(f.source, 'analysis_options.yaml'), 'utf8'), 'analyzer:\n');
});

test('Android仅消费明确工具原件，其他平台不要求Wrapper', async t => {
  const f = fixture(t);
  const output = await createProject({ ...f, platform: 'android' }, { FLUTTER_ROOT: f.tool });
  assert.equal(readFileSync(join(output, 'android/gradlew'), 'utf8'), 'tool-fixture:gradlew');
  assert.equal(lstatSync(join(output, 'android/gradlew')).isSymbolicLink(), false);
});

test('缺失平台输入和工具必须在创建输出前拒绝', async t => {
  const f = fixture(t);
  if (platformEntries.length) {
    rmSync(join(f.source, platformEntries[0][0]));
    await assert.rejects(createProject({ ...f, platform: 'ios' }), /平台输入缺失/);
  }
  const g = fixture(t);
  await assert.rejects(createProject({ ...g, platform: 'android' }, {}), /Flutter工具根/);
  assert.equal(existsSync(join(g.work, 'flutter-project')), false);
});

test('既有输出与来源链接均不得覆盖', async t => {
  const f = fixture(t), output = join(f.work, 'existing');
  mkdirSync(output); writeFileSync(join(output, 'keep'), 'keep');
  await assert.rejects(createProject({ ...f, output, platform: 'ios' }), /输出已存在/);
  assert.equal(readFileSync(join(output, 'keep'), 'utf8'), 'keep');
  symlinkSync(join(f.source, 'lib/main.dart'), join(f.source, 'bad-link'));
  await assert.rejects(createProject({ ...f, platform: 'ios' }), /来源包含未登记链接/);
});

test('源码内输出、外部目标及链接父层必须拒绝', async t => {
  const f = fixture(t);
  await assert.rejects(createProject({ ...f, work: f.source, platform: 'ios' }), /必须分离/);
  await assert.rejects(createProject({ ...f, output: join(f.root, 'outside'), platform: 'ios' }), /属于本次工作根/);
  symlinkSync(f.source, join(f.work, 'redirect'), 'dir');
  await assert.rejects(createProject({ ...f, output: join(f.work, 'redirect/new'), platform: 'ios' }), /经过链接/);
});

test('本机path包只写工作pubspec，失败不留下输出', async t => {
  const f = fixture(t);
  const dependency = join(f.root, 'dependency');
  f.write(join(dependency, 'pubspec.yaml'), 'name: local_fixture\n');
  f.write(join(dependency, 'lib/value.dart'), 'const value = 1;\n');
  const sourceYaml = 'name: project_fixture\ndependencies:\n  local_fixture:\n    path: ../dependency\nflutter:\n  uses-material-design: true\n';
  writeFileSync(join(f.source, 'pubspec.yaml'), sourceYaml);
  const output = await createProject({ ...f, platform: 'ios' });
  assert.equal(readFileSync(join(f.source, 'pubspec.yaml'), 'utf8'), sourceYaml);
  assert.match(readFileSync(join(output, 'pubspec.yaml'), 'utf8'), /path: ".+\.source-packages.+1"\nflutter:/);
  assert.ok(existsSync(join(output, '.source-packages/1/lib/value.dart')));
  const g = fixture(t);
  const bad = join(g.root, 'bad-sdk');
  g.write(join(bad, 'pubspec.yaml'), 'name: citizen_sdk\n');
  writeFileSync(join(g.source, 'pubspec.yaml'), 'name: project_fixture\ndependencies:\n  citizen_sdk:\n    path: ../bad-sdk\n');
  await assert.rejects(createProject({ ...g, platform: 'ios' }));
  const failedOutput = join(g.work, 'flutter-project', g.source.slice(1));
  assert.equal(existsSync(failedOutput), false);
});

// 执行真实Release赋值/导出片段；用内存Shell函数替代工程命令，不触发签名发布。
for (const entry of ["./release/android/life-android/execute.mjs","./release/ios/life-ios/execute.mjs"]) {
  test(`Release工程创建失败立即终止：${entry}`, () => {
    const source = readFileSync(new URL(entry, import.meta.url), 'utf8');
    const match = source.match(/const workflowSteps = Object.freeze\((.*?)\);\n/s);
    assert.ok(match);
    const steps = Object.values(JSON.parse(match[1]));
    const stage = steps.find(step => step.source.includes('_PROJECT_ROOT="$(node '));
    assert.ok(stage);
    const lines = stage.source.split('\n');
    const start = lines.findIndex(line => /^(?:export )?[A-Z]+_PROJECT_ROOT=/.test(line));
    const end = lines.findIndex((line, index) => index >= start && line.startsWith('printf '));
    assert.ok(start >= 0 && end > start);
    const fragment = lines.slice(start, end).join('\n');
    for (const status of [0, 17]) {
      const script = 'set -euo pipefail\nGITHUB_WORKSPACE=/fixture/source\nproject_work=/fixture/work\nnode() { return ' + status + '; }\n' + fragment + '\nprintf reached';
      const result = spawnSync('/bin/bash', ['--noprofile', '--norc', '-c', script], {encoding: 'utf8'});
      assert.equal(result.status, status, result.stderr);
      assert.equal(result.stdout, status === 0 ? 'reached' : '');
    }
  });
}
