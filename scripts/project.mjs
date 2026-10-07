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

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
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
