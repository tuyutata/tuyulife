#!/usr/bin/env node
import { remoteEnvironment as productRemoteEnvironment } from '../../../build.mjs';
if(!(process.env.NODE_TEST_CONTEXT && process.argv.length === 2)&&process.env.GITHUB_ACTIONS==='true'&&String(process.env.GITHUB_WORKFLOW||'').startsWith('tuyulife.'))Object.assign(process.env,productRemoteEnvironment());
import { spawnSync as runExactProcess } from 'node:child_process';
function validateCandidate(){const value=process.env;
if(!/^[0-9a-f]{40}$/.test(value.SOURCE_SHA||'')||!/^[1-9][0-9]*$/.test(value.CI_RUN_ID||'')||!/^\d+\.\d{1,2}\.\d{1,2}$/.test(value.SOFTWARE_VERSION||'')||value.VERSION_TAG!=='tuyulife-ios-v'+value.SOFTWARE_VERSION)throw Error('准确Release候选无效');}

// 本文件只执行 tuyulife.ios.release 的 life-ios Job；阶段编号由本仓唯一 Workflow 固定，禁止接收其它身份。
export const EXACT_REMOTE_JOB_IDENTITY = Object.freeze({"pipeline":"tuyulife.ios.release","job":"life-ios"});

function requireExactRemoteJobEnvironment() {
  const expected = 'tuyutata/tuyulife';
  if (!expected || process.env.GITHUB_REPOSITORY !== expected) {
    throw new Error('准确远端Job仓库身份无效');
  }
}
const workflowSteps = Object.freeze({
  "0": {
    "shell": "bash",
    "source": "printf 'version=3.47.2\n' >> \"$GITHUB_OUTPUT\""
  },
  "1": {
    "shell": "bash",
    "source": "# 安装后先验真，再统一准备目标平台缓存与受控修订。\nflutter --version --machine >/dev/null\nplatform=\"ios\"\nflutter --version >/dev/null\n"
  },
  "2": {
    "shell": "bash",
    "source": "node \"$GITHUB_WORKSPACE/scripts/release/ios/life-ios/execute.mjs\" validate-inputs"
  },
  "3": {
    "shell": "bash",
    "source": "set -euo pipefail\n# 本次Release独占源码外工程，后续签名只读取此工程输出。\nproject_work=\"$RUNNER_TEMP/tuyulife-ios-project\"\nmkdir \"$project_work\"\nproject_work=\"$(cd \"$project_work\" && pwd -P)\"\nTUYULIFE_PROJECT_ROOT=\"$(node \"$GITHUB_WORKSPACE/scripts/project.mjs\" create --source-root \"$GITHUB_WORKSPACE\" --work-root \"$project_work\" --platform ios)\"\n# 单独导出，保留工程创建失败的退出状态。\nexport TUYULIFE_PROJECT_ROOT\nprintf 'TUYULIFE_PROJECT_ROOT=%s\\n' \"$TUYULIFE_PROJECT_ROOT\" >> \"$GITHUB_ENV\"\ncd \"$TUYULIFE_PROJECT_ROOT\"\nset -euo pipefail\nflutter pub get --offline --enforce-lockfile\nflutter analyze\nflutter test\nflutter build ios --release --no-codesign --build-name=\"$SOFTWARE_VERSION\"\n"
  },
  "4": {
    "shell": "bash",
    "source": "set -euo pipefail\numask 077\nwork=\"$RUNNER_TEMP/tuyulife-ios-signing\"\nrm -rf \"$work\" \"$RELEASE_DIR\"\nmkdir -p \"$work\" \"$RELEASE_DIR\"\nkeychain=\"$work/release.keychain-db\"\nkeychain_password=\"$(openssl rand -hex 32)\"\ntrap 'security delete-keychain \"$keychain\" >/dev/null 2>&1 || true; rm -rf \"$work\"' EXIT\npython3 - \"$work\" <<'PY'\nimport base64, os, pathlib, re, sys\nroot = pathlib.Path(sys.argv[1]); fields = {}\nfor raw in os.environ.get(\"IOS_KEY\", \"\").splitlines():\n    line = raw.strip()\n    if not line or line.startswith(\"#\"): continue\n    name, sep, value = line.partition(\"=\")\n    if not sep or name.strip() in fields or not value.strip(): raise SystemExit(\"TUYULIFE_IOS_KEY 行格式无效\")\n    fields[name.strip()] = value.strip()\nif set(fields) != {\"pkcs12\", \"password\", \"certificate_sha1\"}: raise SystemExit(\"TUYULIFE_IOS_KEY 字段集合无效\")\nif not re.fullmatch(r\"[0-9A-F]{40}\", fields[\"certificate_sha1\"]): raise SystemExit(\"Apple Distribution 证书摘要无效\")\ntry:\n    pkcs12 = base64.b64decode(fields[\"pkcs12\"], validate=True)\n    profile = base64.b64decode(os.environ.get(\"IOS_PROVISIONING_PROFILE\", \"\"), validate=True)\nexcept ValueError as exc: raise SystemExit(\"iOS 签名材料 Base64 无效\") from exc\nif not 1024 <= len(pkcs12) <= 32 * 1024 * 1024 or not 1024 <= len(profile) <= 1024 * 1024: raise SystemExit(\"iOS 签名材料大小无效\")\n(root / \"distribution.p12\").write_bytes(pkcs12); (root / \"password\").write_text(fields[\"password\"])\n(root / \"certificate-sha1\").write_text(fields[\"certificate_sha1\"]); (root / \"profile.mobileprovision\").write_bytes(profile)\nPY\nsecurity create-keychain -p \"$keychain_password\" \"$keychain\"\nsecurity unlock-keychain -p \"$keychain_password\" \"$keychain\"\nsecurity list-keychains -d user -s \"$keychain\"\nsecurity import \"$work/distribution.p12\" -k \"$keychain\" -P \"$(cat \"$work/password\")\" -T /usr/bin/codesign\nsecurity set-key-partition-list -S apple-tool:,apple:,codesign: -s -k \"$keychain_password\" \"$keychain\" >/dev/null\ncertificate_sha1=\"$(cat \"$work/certificate-sha1\")\"\nsecurity find-identity -v -p codesigning \"$keychain\" | grep -Fq \"$certificate_sha1\"\n/usr/bin/openssl smime -verify -inform DER -in \"$work/profile.mobileprovision\" -noverify -out \"$work/profile.plist\" >/dev/null\nprofile_certificate_sha1=\"$(plutil -extract DeveloperCertificates.0 raw -o - \"$work/profile.plist\" | base64 -D | shasum -a 1 | awk '{print toupper($1)}')\"\ntest \"$profile_certificate_sha1\" = \"$certificate_sha1\"\nteam_id=\"$(/usr/libexec/PlistBuddy -c 'Print :TeamIdentifier:0' \"$work/profile.plist\")\"\ntest \"$(/usr/libexec/PlistBuddy -c 'Print :Entitlements:application-identifier' \"$work/profile.plist\")\" = \"$team_id.com.tuyulife\"\ntest \"$(/usr/libexec/PlistBuddy -c 'Print :Entitlements:get-task-allow' \"$work/profile.plist\")\" = false\nplutil -extract Entitlements xml1 -o \"$work/entitlements.plist\" \"$work/profile.plist\"\napp=\"$TUYULIFE_PROJECT_ROOT/build/ios/iphoneos/Runner.app\"\ntest \"$(/usr/libexec/PlistBuddy -c 'Print :CFBundleIdentifier' \"$app/Info.plist\")\" = com.tuyulife\ncp \"$work/profile.mobileprovision\" \"$app/embedded.mobileprovision\"\nfind \"$app\" -type f -name '*.dylib' -print0 | while IFS= read -r -d '' item; do codesign --force --sign \"$certificate_sha1\" --keychain \"$keychain\" --timestamp=none \"$item\"; done\nfind \"$app\" -type d \\( -name '*.framework' -o -name '*.appex' \\) -print0 | while IFS= read -r -d '' item; do codesign --force --sign \"$certificate_sha1\" --keychain \"$keychain\" --timestamp=none \"$item\"; done\ncodesign --force --sign \"$certificate_sha1\" --keychain \"$keychain\" --timestamp=none --generate-entitlement-der --entitlements \"$work/entitlements.plist\" \"$app\"\ncodesign --verify --deep --strict \"$app\"\nmkdir -p \"$work/package/Payload\" && cp -R \"$app\" \"$work/package/Payload/Runner.app\"\n(cd \"$work/package\" && ditto -c -k --sequesterRsrc --keepParent Payload \"$RELEASE_DIR/tuyulife-ios.ipa\")\n"
  },
  "5": {
    "shell": "bash",
    "source": "node <<'NODE'\nconst { createHash } = require('node:crypto'); const fs = require('node:fs'); const root = process.env.RELEASE_DIR;\nconst hash = (name) => createHash('sha256').update(fs.readFileSync(`${root}/${name}`)).digest('hex');\nconst manifest = { product_id: 'tuyulife', platform: 'ios', software_version: process.env.SOFTWARE_VERSION, git_commit_sha: process.env.SOURCE_SHA, ci_run_id: Number(process.env.CI_RUN_ID), bundle_id: 'com.tuyulife', assets: [{ name: 'tuyulife-ios.ipa', sha256: hash('tuyulife-ios.ipa') }] };\nfs.writeFileSync(`${root}/release-manifest.json`, `${JSON.stringify(manifest, null, 2)}\\n`);\nfs.writeFileSync(`${root}/SHA256SUMS`, `${hash('tuyulife-ios.ipa')}  tuyulife-ios.ipa\\n${hash('release-manifest.json')}  release-manifest.json\\n`);\nNODE\n"
  },
  "6": {
    "shell": "bash",
    "source": "node $GITHUB_WORKSPACE/scripts/release/ios/index.mjs publish-release"
  }
});
function runExactWorkflowStep(index){requireExactRemoteJobEnvironment();if(!/^(?:0|[1-9][0-9]*)$/.test(String(index||''))||!Object.hasOwn(workflowSteps,String(index)))throw new Error('准确远端Job阶段无效');const step=workflowSteps[String(index)];const command=step.shell==='pwsh'?'pwsh':(process.platform==='win32'?'bash':'/bin/bash');const args=step.shell==='pwsh'?['-NoLogo','-NoProfile','-NonInteractive','-Command',step.source]:['--noprofile','--norc','-e','-o','pipefail','-c',step.source];const result=runExactProcess(command,args,{cwd:process.cwd(),env:process.env,stdio:'inherit'});if(result.error)throw new Error('准确远端Job阶段无法启动');if(result.status!==0)process.exitCode=Number.isInteger(result.status)?result.status:1;}

if (!(process.env.NODE_TEST_CONTEXT && process.argv.length === 2) && process.argv[1] && import.meta.url === (await import('node:url')).pathToFileURL((await import('node:path')).resolve(process.argv[1])).href) {
requireExactRemoteJobEnvironment();
validateCandidate();
if(process.argv[2]==='validate-inputs') process.exit(0);
if(process.argv[2]!=='workflow-step')throw new Error('准确Release Job只接受workflow-step');
runExactWorkflowStep(process.argv[3]);
}

// 正式实现结束；仅直接使用 node --test 执行本文件时注册以下回归。
if (process.env.NODE_TEST_CONTEXT && process.argv.length === 2 && !process.execArgv.some(value=>/^(?:-e|--eval(?:=|$)|--input-type(?:=|$))/u.test(value)) && process.argv[1] && import.meta.url === (await import('node:url')).pathToFileURL((await import('node:path')).resolve(process.argv[1])).href) {
const {default:assert} = await import('node:assert/strict');
const { readFileSync } = await import('node:fs');
const {default:test} = await import('node:test');

test('tuyulife.ios.release的life-ios远端Job物理独立', () => {
  const source = readFileSync(new URL('./execute.mjs', import.meta.url), 'utf8');
  assert.ok(source.includes('{"pipeline":"tuyulife.ios.release","job":"life-ios"}'));
  assert.match(source, /function runExactWorkflowStep\(index\)/u);
  assert.match(source, /function requireExactRemoteJobEnvironment\(\)/u);
});

}
