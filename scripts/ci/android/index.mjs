#!/usr/bin/env node
// CI_BUILD: incremental

import { execFileSync } from 'node:child_process';
import { lstatSync, mkdtempSync, realpathSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

function run(command, args, cwd) {
  execFileSync(command, args, { cwd, stdio: 'inherit', env: process.env });
}

let projectWork, projectOwned;
try {
  // 本身份独占源码外工程，Flutter工具只写本次任务目录。
  process.env.TUYULIFE_ROOT = realpathSync(process.cwd());
  const source = realpathSync('.');
  projectWork = mkdtempSync(join(realpathSync(process.env.RUNNER_TEMP || tmpdir()), 'tuyulife-android-ci-'));
  projectOwned = lstatSync(projectWork);
  const project = execFileSync(process.execPath, [join(source, 'scripts/project.mjs'), 'create',
    '--source-root', source, '--work-root', projectWork, '--platform', 'android'],
    { encoding: 'utf8', env: process.env }).trim();
  run('git', ['rev-parse', '--verify', 'HEAD'], '.');
  run('flutter', ['pub', 'get', '--enforce-lockfile'], project);
  run('flutter', ['analyze'], project);
  run('flutter', ['test'], project);
} catch (error) {
  console.error(`途遇生活 Android CI 失败：${error.message}`);
  process.exitCode = 1;
}

finally {
  if (projectOwned) {
    const current = lstatSync(projectWork);
    if (current.isSymbolicLink() || current.dev !== projectOwned.dev || current.ino !== projectOwned.ino) throw new Error('CI工程归属变化，保留现场');
    rmSync(projectWork, { recursive: true });
  }
}
