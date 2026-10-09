#!/usr/bin/env node
// tuyulife：扁平源码是唯一输入，平台工具要求的目录只在本次工作根装配。
// 每个产品拥有自己的映射；不读取其他产品的构建配置，不复用任务输出。
import { chmodSync, copyFileSync, existsSync, lstatSync, mkdirSync, readFileSync,
  readdirSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, parse, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const platformEntries = Object.freeze([
  [
    "android/app/src/debug-AndroidManifest.xml",
    "android/app/src/debug/AndroidManifest.xml"
  ],
  [
    "android/app/src/profile-AndroidManifest.xml",
    "android/app/src/profile/AndroidManifest.xml"
  ],
  [
    "android/app/src/main/MainActivity.kt",
    "android/app/src/main/kotlin/com/tuyulife/MainActivity.kt"
  ],
  [
    "android/app/src/main/res/launch_background-v21.xml",
    "android/app/src/main/res/drawable-v21/launch_background.xml"
  ],
  [
    "android/app/src/main/res/styles.xml",
    "android/app/src/main/res/values/styles.xml"
  ],
  [
    "android/app/src/main/res/styles-night.xml",
    "android/app/src/main/res/values-night/styles.xml"
  ],
  [
    "android/gradle-wrapper.properties",
    "android/gradle/wrapper/gradle-wrapper.properties"
  ],
  [
    "ios/Runner.pbxproj",
    "ios/Runner.xcodeproj/project.pbxproj"
  ],
  [
    "ios/Runner.xcscheme",
    "ios/Runner.xcodeproj/xcshareddata/xcschemes/Runner.xcscheme"
  ],
  [
    "ios/ProjectWorkspace.xcworkspacedata",
    "ios/Runner.xcodeproj/project.xcworkspace/contents.xcworkspacedata"
  ],
  [
    "ios/ProjectWorkspaceChecks.plist",
    "ios/Runner.xcodeproj/project.xcworkspace/xcshareddata/IDEWorkspaceChecks.plist"
  ],
  [
    "ios/ProjectWorkspaceSettings.xcsettings",
    "ios/Runner.xcodeproj/project.xcworkspace/xcshareddata/WorkspaceSettings.xcsettings"
  ],
  [
    "ios/Workspace.xcworkspacedata",
    "ios/Runner.xcworkspace/contents.xcworkspacedata"
  ],
  [
    "ios/WorkspaceChecks.plist",
    "ios/Runner.xcworkspace/xcshareddata/IDEWorkspaceChecks.plist"
  ],
  [
    "ios/WorkspaceSettings.xcsettings",
    "ios/Runner.xcworkspace/xcshareddata/WorkspaceSettings.xcsettings"
  ],
  [
    "ios/RunnerTests.swift",
    "ios/RunnerTests/RunnerTests.swift"
  ]
]);
const generated = new Set(['.git', '.DS_Store', '.dart_tool', 'build', 'target', '.gradle',
  '.symlinks', '.plugin_symlinks', 'Pods', 'ephemeral', 'node_modules', 'xcuserdata', 'swiftpm']);
const generatedFiles = new Set(['.flutter-plugins', '.flutter-plugins-dependencies', '.packages',
  'Generated.xcconfig', 'flutter_export_environment.sh', 'local.properties',
  'GeneratedPluginRegistrant.h', 'GeneratedPluginRegistrant.m', 'GeneratedPluginRegistrant.swift',
  'generated_plugin_registrant.cc', 'generated_plugin_registrant.h', 'generated_plugins.cmake',
  'generated_config.cmake']);
const writable = new Set(['pubspec.yaml', 'pubspec.lock', 'pubspec_overrides.yaml',
  'analysis_options.yaml', 'Podfile.lock', 'project.pbxproj', 'Runner.pbxproj',
  'settings.gradle', 'settings.gradle.kts']);
const platforms = new Set(['ios', 'android', 'macos', 'windows', 'linux', 'linux-arm', 'linux-amd']);

function fail(message) { throw new Error('tuyulife工程：' + message); }
function inside(root, value) { const p = relative(root, value); return p === '' || (!isAbsolute(p) && p !== '..' && !p.startsWith('..' + sep)); }
function directory(value, label) {
  if (typeof value !== 'string' || !isAbsolute(value) || resolve(value) !== value || value === parse(value).root) fail(label + '须为规范绝对路径');
  let at = parse(value).root;
  for (const part of relative(at, value).split(sep)) {
    at = join(at, part);
    const s = lstatSync(at, { throwIfNoEntry: false });
    if (!s?.isDirectory() || s.isSymbolicLink()) fail(label + '缺失或经过链接');
  }
  return value;
}
function parameters({ source, work, output, platform = process.env.TUYU_PLATFORM || (process.platform === 'darwin' ? 'macos' : process.platform === 'win32' ? 'windows' : 'linux') }) {
  directory(source, '源码根'); directory(work, '工作根');
  if (!inside(join(source, 'target'), work) || work === join(source, 'target')) fail('工作根必须位于本产品target内');
  if (!platforms.has(platform)) fail('平台无效');
  output ??= join(work, 'flutter-project', source.replace(/^[A-Za-z]:[\\/]|^[\\/]+/u, ''));
  if (!isAbsolute(output) || resolve(output) !== output || !inside(work, output) || output === work) fail('输出须属于本次工作根');
  let at = dirname(output);
  while (!existsSync(at)) at = dirname(at);
  directory(at, '输出父目录');
  return { source, work, output, platform };
}

function sourceFiles(root) {
  const files = [];
  const walk = (base) => {
    for (const e of readdirSync(base, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (generated.has(e.name) || generatedFiles.has(e.name)) continue;
      const input = join(base, e.name);
      if (e.isSymbolicLink()) fail('来源包含未登记链接：' + relative(root, input));
      if (e.isDirectory()) walk(input);
      else if (e.isFile()) files.push(input);
      else fail('来源包含非常规文件');
    }
  };
  walk(root);
  return files;
}

function put(input, output, copy = false) {
  if (lstatSync(output, { throwIfNoEntry: false })) fail('目标重复：' + output);
  mkdirSync(dirname(output), { recursive: true });
  if (copy || process.platform === 'win32') copyFileSync(input, output);
  else symlinkSync(input, output);
}

function wrappers(environment) {
  const root = directory(environment.FLUTTER_ROOT, '固定Flutter工具根');
  return ['gradlew', 'gradlew.bat', 'gradle/wrapper/gradle-wrapper.jar'].map(name => {
    const input = join(root, 'bin/cache/artifacts/gradle_wrapper', name);
    directory(dirname(input), 'Wrapper原件父目录');
    const s = lstatSync(input, { throwIfNoEntry: false });
    if (!s?.isFile() || s.isSymbolicLink() || s.size === 0) fail('Wrapper原件缺失：' + name);
    return { name, input };
  });
}

export async function createProject(options, environment = process.env) {
  const p = parameters(options);
  if (lstatSync(p.output, { throwIfNoEntry: false })) fail('输出已存在');
  const inputs = sourceFiles(p.source);
  const mapping = new Map(platformEntries);
  for (const [source] of mapping) if (!inputs.includes(join(p.source, source))) fail('平台输入缺失：' + source);
  const toolInputs = p.platform === 'android' ? wrappers(environment) : [];
  // 先核实全部固定输入，再排他创建本次输出；清理只持有这一次的inode身份。
  mkdirSync(dirname(p.output), { recursive: true });
  mkdirSync(p.output);
  const owned = lstatSync(p.output);
  try {
    for (const input of inputs) {
      const rel = relative(p.source, input).split(sep).join('/');
      const target = mapping.get(rel) || rel;
      if (mapping.has(rel) && inputs.includes(join(p.source, target))) fail('来源同时存在标准布局与扁平布局：' + target);
      put(input, join(p.output, target), writable.has(input.split(sep).at(-1)));
    }
    for (const item of toolInputs) {
      put(item.input, join(p.output, 'android', item.name), true);
      if (item.name === 'gradlew') chmodSync(join(p.output, 'android', item.name), 0o755);
    }
    // 本机path依赖按各SDK自己的公开布局入口物化；普通包保留原目录映射。
    // pubspec是本次工作副本，改写绝对依赖路径不会回写产品源文件。
    const visited = new Map([[p.source, p.output]]);
    const bindDependencies = async (source, destination) => {
      for (const name of ['pubspec.yaml', 'pubspec_overrides.yaml']) {
        const file = join(source, name);
        if (!existsSync(file)) continue;
        let value = readFileSync(file, 'utf8');
        const changes = [];
        for (const m of value.matchAll(/^([ \t]*path[ \t]*:[ \t]*)(['"]?)([^'"\r\n#]+?)\2[ \t]*$/gm)) {
          const dependency = resolve(source, m[3].trim());
          // Git依赖里的path不是本机目录；只处理实际带pubspec的已存在包。
          if (!existsSync(join(dependency, 'pubspec.yaml'))) continue;
          directory(dependency, '本机依赖');
          if (inside(dependency, p.work) || inside(p.work, dependency)) fail('依赖与工作根重叠');
          let target = visited.get(dependency);
          if (!target) {
            target = join(p.output, '.source-packages', String(visited.size));
            visited.set(dependency, target);
            const pubspec = readFileSync(join(dependency, 'pubspec.yaml'), 'utf8');
            if (/^name:\s*(citizen_sdk|tata_chat_sdk)\s*$/m.test(pubspec)) {
              const api = await import(pathToFileURL(join(dependency, 'scripts/release.mjs')));
              if (typeof api.createFlutterSourceView !== 'function') fail('SDK缺少公开工程入口');
              mkdirSync(dirname(target), { recursive: true });
              await api.createFlutterSourceView(dependency, target);
            } else {
              mkdirSync(target, { recursive: true });
              for (const input of sourceFiles(dependency)) put(input, join(target, relative(dependency, input)), writable.has(input.split(sep).at(-1)));
            }
            await bindDependencies(dependency, target);
          }
          changes.push([m[0], m[1] + JSON.stringify(target.replaceAll('\\', '/'))]);
        }
        for (const [from, to] of changes) value = value.replace(from, to);
        if (changes.length) {
          const out = join(destination, name);
          if (lstatSync(out, { throwIfNoEntry: false })?.isSymbolicLink()) rmSync(out);
          writeFileSync(out, value);
        }
      }
    };
    await bindDependencies(p.source, p.output);
    verifyProject(p);
    return p.output;
  } catch (error) {
    const s = lstatSync(p.output, { throwIfNoEntry: false });
    if (s?.isDirectory() && !s.isSymbolicLink() && s.dev === owned.dev && s.ino === owned.ino) rmSync(p.output, { recursive: true });
    throw error;
  }
}

export function verifyProject(options) {
  const p = parameters(options);
  directory(p.output, '输出工程');
  for (const [input, output] of platformEntries) {
    const source = join(p.source, input), target = join(p.output, output);
    const s = lstatSync(target, { throwIfNoEntry: false });
    if (!s || (s.isSymbolicLink() ? realpathSync(target) !== source : !s.isFile())) fail('平台入口缺失或来源不一致：' + output);
    if (!readFileSync(source).equals(readFileSync(target))) fail('平台入口字节不符：' + output);
  }
  if (!existsSync(join(p.output, 'pubspec.yaml'))) fail('输出缺少pubspec');
  if (p.platform === 'android') for (const name of ['gradlew', 'gradlew.bat', 'gradle/wrapper/gradle-wrapper.jar']) {
    const item = lstatSync(join(p.output, 'android', name), { throwIfNoEntry: false });
    if (!item?.isFile() || item.isSymbolicLink() || !item.size) fail('输出Wrapper无效');
  }
  return p.output;
}

if (!(process.env.NODE_TEST_CONTEXT && process.argv.length === 2) && process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  try {
    const [command, ...argv] = process.argv.slice(2);
    const args = {};
    const keys = { '--source-root': 'source', '--work-root': 'work', '--output': 'output', '--platform': 'platform' };
    for (let i = 0; i < argv.length; i += 2) {
      const key = keys[argv[i]];
      if (!key || args[key] || !argv[i + 1]) fail('参数未知、重复或缺值');
      args[key] = argv[i + 1];
    }
    const value = command === 'create' ? await createProject(args) : command === 'verify' ? verifyProject(args) : fail('命令只允许create/verify');
    process.stdout.write(value + '\n');
  } catch (error) { process.stderr.write(error.message + '\n'); process.exitCode = 1; }
}

// 正式实现结束；仅直接使用 node --test 执行本文件时注册以下回归。
if (process.env.NODE_TEST_CONTEXT && process.argv.length === 2 && !process.execArgv.some(value=>/^(?:-e|--eval(?:=|$)|--input-type(?:=|$))/u.test(value)) && process.argv[1] && import.meta.url === (await import('node:url')).pathToFileURL((await import('node:path')).resolve(process.argv[1])).href) {
const { spawnSync } = await import('node:child_process');
const {default:assert} = await import('node:assert/strict');
const { existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, realpathSync,
  rmSync, symlinkSync, writeFileSync } = await import('node:fs');
const { dirname, join } = await import('node:path');
const { testRoot:tmpdir } = await import('./build.mjs');
const {default:test} = await import('node:test');


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
  const source = join(root, 'source'), work = join(source, 'target', 'ios', 'test'), tool = join(root, 'tool');
  for (const p of [source, work, tool]) mkdirSync(p, { recursive: true });
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
  await assert.rejects(createProject({ ...f, work: f.source, platform: 'ios' }), /本产品target/);
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

}
