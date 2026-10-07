# 途遇生活端技术文档

## 当前工作目录归属（第8步，2026-10-06）

本产品全部测试、编译临时数据和产物归 `/Users/rhett/tuyulife/target`。多平台先使用声明中的完整平台身份，再在平台内按build、ci、release、publish、test、tmp隔离。独立入口与控制台调用消费同一产品流程；控制台仅创建任务、调用与跟踪，不准备产品专用版本、依赖或步骤。下载半包、工具编译候选、工程视图、Runner步骤临时状态和测试夹具均属于当前产品工作区；永久工具与依赖原件继续归原件库。整个根target不进入Git、源码快照、程序摘要或打包输入。准确流程短锁、活跃任务保护、成功产物保护和原清理规则继续适用。

第8、9步完成目录与路径实现、根文档迁移及测试源码维护，未运行测试、门禁、编译或安装。本文唯一原件位于/Users/rhett/tuyulife/TuyuLife.md；产品接口及流程直接以本仓实际代码和声明为准，业务字典库与其检查已撤销，不另建登记副本。历史验收事实不表示本轮改造已经通过验收，统一测试在第10步进行。根技术文档由本仓门禁按原文、JSON解码值及既有补丁快照扫描机密，仅报告路径；文档迁出不减少资料安全检查。


## 正式软件版本

iOS 与 Android 分别拥有自己的 Release Tag 与版本序列；`pubspec.yaml` 的
`1.0.0+1` 只提供首版种子。没有已发布正式 Release 的平台首次成功发布
为 `v1.0.0`。失败不占号；安装包显示本平台自身正式版本，不读取另一平台版本。

## 聊天功能的唯一产品归属

**聊天客户端的逻辑功能只能在 TataChatSDK 中实现；聊天服务端的逻辑功能只能在 TataChatServer 中实现。公民、途遇及其他产品只依赖使用。**

TuyuLife 涉及聊天时只作为依赖使用方；本条不代表尚未接入聊天的产品已经具备聊天能力。

- 消息、会话、群组、加密、协议、传输、同步、重试、聊天存储、附件、通话及聊天界面行为，按客户端与服务端职责分别归 TataChatSDK 和 TataChatServer；新增功能、缺陷修复和平台差异也必须在所属塔塔聊天产品内完成。
- 消费产品只提供产品入口、身份与业务权益结果、服务地址及授权、主题和公开接口要求的平台配置；只通过公开接口接入，禁止复制、重写、包装成另一套聊天内核或维护产品专属聊天实现。CitizenServe、TuyuServe 的产品身份与权益授权不包含聊天数据面的实现职责。
- 本机开发直接依赖仓库路径；公民、途遇等产品的正式版本依赖塔塔聊天正式 Release；第三方市场分发使用公开市场版本。依赖使用不以公开市场发布为前置条件，也不改变实现归属。

受控缓存固定为 `tuyulife/target/<platform>/<build|ci|release|publish>/`；四个流程目录永久独立，启动不建目录。Flutter视图、依赖展开、`.dart_tool`、Gradle、Pods、临时文件、日志和候选均只写准确流程目录。

当前依赖边界：TuyuLife 的锁文件和产品脚本自行决定依赖、版本、来源及工具；控制台不做产品依赖或工具门禁。唯一 `rely/` 只保存产品主动取得的离线原件。

本机 Build 由 Worker 创建任务、清空准确平台缓存后直接启动产品入口；后续工具、依赖和编译条件均归产品流程。Android产品函数把本轮Flutter配置选出的SDK和调用方JDK传给同一次Gradle调用，本机未提供JDK时使用Android Studio随包JBR，不增加Worker前置检查；iOS/Android 成功后安装到设备。

本文是途遇生活端（TuyuLife）唯一技术事实文档。

Flutter、Gradle、AGP、Kotlin 与 Java 的选择属于 TuyuLife 产品 Action；本机 Worker 不读取或验真受控工具，也不以工具状态阻塞产品任务。

Android产品当前统一使用Gradle9.1.0、AGP9.0.1与KGP2.2.20，并保持内置Kotlin和新DSL。根buildscript在同一依赖图声明AGP与KGP，settings不再另行解析AGP而暴露其自带KGP2.2.10；应用脚本显式导入JDK类型，避免AGP的`java`扩展遮蔽包名。这是产品配置，不是控制台前置门禁。

## 产品总览

### 途遇生活技术文档

#### 1. 产品定义

- 中文名称：途遇生活
- 英文名称：`TuyuLife`
- 技术产品名：`TuyuLife`
- 仓库目录：`tuyulife/`
- 目标平台：iOS、Android
- iOS 最低版本：15.0
- 应用标识：`com.tuyulife`

途遇生活是独立的跨 iOS、Android Flutter 工程。它可以参考途遇旅行的移动跨平台工程分层、国际化和安全网络约束，但不是途遇旅行的别名、子模块或代码副本；两个产品拥有独立的产品标识、应用包、发布生命周期和业务边界。

当前已确认系统工程、十二端远程流程和塔塔控制台发布入口，尚未确认途遇生活的具体生活服务、账户、数据模型或后端接口。因此首版不得复制途遇旅行的旅行发现、预订、聊天、游记或登录业务，也不得展示虚构的可用功能。

#### 2. 首版工程框架

```text
tuyulife/
├── lib/
│   ├── app/                 # 应用与状态容器
│   ├── core/                # 产品身份和安全基础能力
│   ├── features/home/       # 诚实的系统工程状态页
│   └── l10n/                # 中文、英文 ARB
├── ios/
├── android/
└── test/
```

- UI：Flutter / Dart。
- 状态管理：Provider / ChangeNotifier。
- 国际化：简体中文、英文；其他设备语言回退简体中文。
- 网络基线：只允许无用户信息的 HTTPS 地址；后续实时通道只允许 WSS。
- 产品常量：`product_id=tuyulife`、`audience=tuyulife`、`bundle_identifier=com.tuyulife`。

#### 3. 已接入能力

- iOS、Android 平台工程和独立应用身份。
- 中文、英文系统工程页面及设备语言回退。
- HTTPS 地址解析边界和产品身份合同测试。
- TataConsole 已登记 iOS 与 Android ARM64 APK 本机编译动作；iOS 受控签名安装执行链已实现，仍须满足产品签名配置并完成真实安装验收，不能将未签名候选包视为可安装产物。
- TUYU 独立 iOS、Android CI 与 Release；每个 Release 内部重新锁定本端最新成功 CI 的 Run ID
  和源码提交，重新构建正式资产并生成 `release-manifest.json` 与 `SHA256SUMS`。
- TataConsole 中与途遇旅行同框的 iOS、Android 编译、CI、Release、发布入口。发布使用途遇生活
  自己的产品/平台状态、Tag、商店凭据和 QR_V1 一次性授权，不复用途遇旅行身份。

#### 4. 当前排除项

- 未确认的生活业务模块和数据模型。
- 途遇号、聊天、游记、旅行预订等途遇旅行业务的直接复制。
- TuyuServe 或其他后端的新接口。
- 尚未确认的商店账号、签名证书和生产上架配置；未配置时发布必须失败关闭，不得伪造成功。
- 公民链、钱包和支付方式。

#### 5. 验证要求

- `flutter analyze` 无问题。
- Flutter 产品身份、HTTPS 和界面合同测试全部通过。
- iOS、Android 原生工程必须保持 `com.tuyulife`，中文显示名必须为“途遇生活”。
- 业务需求确认前，界面持续明确标记为系统工程，不得宣称生活服务已上线。

#### 2026-08-27 统一途遇 Logo 来源

本产品使用的应用图标、启动 Logo、页面 Logo 或网站 Logo 均来自 `/Users/rhett/tuyuserve/logo/`。产品目录中的资源是平台打包副本，不是独立真源；必须通过该目录的生成器更新，并通过统一资产清单测试。

#### 2026-08-27 本机编译源码边界

本机 Flutter 在 `tuyulife/target/<platform>/` 生成普通工具配置，
业务源码逐文件只读引用主检出；不复制源码。iOS、Android 的依赖、Pods、Gradle 和本地化状态
均在本端生成，退出只清当前 owner 的内容，保留平台容器。编译与签名候选位于
`tuyulife/target/<platform>/build/`；同一Build完成真机安装及回读，不新增产物库产品目录，不清共享源码或其它平台。

#### 2026-08-29 跨产品边界归并

- TuyuLife 只承担自己的 iOS、Android 产品身份和工程交付，与 TuyuLove 并列，不是途遇旅行的
  重命名、子模块或发布变体。
- 当前生活业务、账户、数据模型和后端接口仍未确认；不得因为 TuyuServe、TuyuBooking 或
  TuyuFactory 已有能力而复制或宣称旅行发现、预订、聊天、游记、商家业务或厂家业务已经接入。
- 本产品只保留自己两端独立的 CI、Release、Tag、版本状态和发布身份；途遇其它端的流程状态
  不得作为 TuyuLife 的成功或可发布依据。

#### 2026-08-30 本机移动端增量构建

- iOS 与 Android 使用各自独立的 TataConsole 成功缓存，复用 Flutter、Dart 依赖及对应平台工具中间产物，不读取另一平台或 TuyuLove 的缓存。
- 产品源码只读引用；工具配置在本端生成，缓存不保存产品源码、用户数据或密钥。
- iOS App与Android APK仅在各自准确Build缓存中用于签名、真机安装与回读；不保留到target。GitHub CI与Release仍拥有各自独立入口和正式交付合同。

## GitHub CI 增量缓存（第 7.3 步）

途遇生活 Android 与 iOS CI 已接入统一 CI 缓存。Dart、Flutter、Rust、Gradle 与 CocoaPods 中间状态按移动平台隔离，APK、Bundle 和 Runner.app 不进入缓存。

## Release 全量构建（第 7.4 步）

正式 Release 固定从干净源码执行全量构建，显式关闭 Rust 增量编译及工具链内置缓存，不读取CI作业缓存且不复用本机编译中间物。版本、签名、校验、产物和发布流程保持原有产品合同。
最新成功 CI 解析器作为可复用 Workflow 调用 Job 只传入 `ci_title`，不得声明 `env`；`CARGO_INCREMENTAL: "0"` 只属于实际 Release 构建 Job。

## 双仓统一流程最终收口（第 7.5 步）

本产品执行统一流程规则：本机编译中间物只进入本轮塔塔缓存库的build目录并按终态规则清理；GitHub CI 的作业过程数据只进入该次Runner任务空间；正式Release从干净编译状态执行。源码不进入塔塔缓存库、塔塔依赖库或塔塔产物库。

## 产品平台合同冻结（TUYU 第 3.1 步，2026-09-02）

- TuyuLife 的正式平台闭集只有 `iOS`、`Android`，不得增加、合并或改写为其它公开平台名称。
- iPhone 与 iPad 都是 `iOS` 的设备适配；Android 手机和平板都是 `Android` 的设备适配。设备、模拟器、ABI、架构和 Runner 不是产品平台。
- Flutter 官方 `ios/`、`android/` 目录保持原名；既有 Tag 后缀、脚本参数和 `<platform>` 路径模板属于待逐项审计的内部 wire，不能据此定义公开平台，也不得在未覆盖全部生产者和消费者时局部改名。
- 本步骤只冻结文档合同，没有修改 TuyuLife 源码、流程、目录、签名、数据库或发布 wire。

## 本机移动编译后安装的实施边界（2026-09-03）

- 途遇生活（`tuyulife`）的 iOS、Android 继续使用原有独立 build 任务；仓库、产品、平台、流程模型、按钮、状态及并行调度不变，不新增安装流程或全局串行队列。
- 受控源码已扩展独立原生请求及 Android 签名、保存、安装和身份版本回读链路。每任务的路径、占有关系、响应与取消独立；只在唯一合适设备时自动安装，零台或多台明确失败，不增加设备选择界面。
- iOS 受控源码已实现实际 prepare/install 执行链，使用现有工程的 Apple Team 与标准 Xcode 描述文件和本机签名配置，不新增配置体系；缺失、歧义或不适配时明确失败。本机校验签名、Team 和描述文件，设备只回读 Bundle ID、版本和构建号，不声称可以回读设备中的证书。受控原生定向测试已通过，但真实签名安装验收尚未完成，不能据代码落地宣告设备安装成功。
- 安装失败保留有效受控产物，不自动卸载、清数据、降级或更换签名；本步没有手动仅安装重试入口，再次点击编译仍执行编译。安装后不自动启动，CI、Release 与应用商店发布不变。
- Android Release 已显式设置 signingConfig = null，不再使用默认 debug 签名；本机候选交受控签名，正式版仍由独立 Release 流程签名。iOS 沿用现有 Team 和应用标识，已只读确认本机存在匹配且未过期的安装描述文件及可用签名身份；尚未核对目标设备注册关系或执行真实签名安装，不能宣告手机已安装。
- 本次受控测试通过不代表实际运行的控制台已更新，也不代表已完成设备签名或安装。具体测试、门禁阻塞与清理证据见现有任务卡；自动安装总体任务仍未完成。

### 安装显示名称

iOS 与 Android 的系统安装显示名称遵循设备语言：中文为“途遇生活”，英文为“TuyuLife”，其他未支持语言回退英文，不增加设备类型或主机、分机后缀。Apple CFBundleDisplayName/CFBundleName 通过 InfoPlist.xcstrings 本地化；Android application label 引用 app_name，从现有 ARB 生成默认英文和中文资源到构建目录。既有应用标识、数据空间、钱包及图标不变。本产品的 3 项相关 Flutter 合同测试和 Apple 名称资源编译检查已经通过。Android 名称资源使用 GenerateAppNameResources 类型化任务和 DirectoryProperty 输出，通过 androidComponents.onVariants / addGeneratedSourceDirectory 接入各变体，未加入兼容开关；重复变量声明已删除。四产品的独立 AGP 9.0.1 原生验证均已通过：Debug 和 Release 资源消费自动触发生成任务，AAPT2 编译及链接后的资源表包含正确中英文名称，输入不变时生成任务为 UP-TO-DATE。上述验证针对名称任务及资源链路，不代表完整应用编译、安装或真机显示验收。未进行实际设备安装显示验收。

现有产品合同中的安装名称断言已通过隔离 Flutter 测试执行，具体结果见任务卡。测试不修改原始依赖锁文件，也不替代手机已安装应用的名称验收。

### Android 自适应启动图标

Android application 的 icon 与 roundIcon 统一引用 @drawable/app_icon。既有 drawable/app_icon.xml 提供位图入口，drawable-v26/app_icon.xml 提供系统原生自适应图标，app_icon_background.xml 使用正式 Logo 左上角底色并铺满裁切区域。完整前景按 108dp 图层中的居中 66dp 布局，不裁剪或重绘标识；圆形及其他系统图标形状由启动器裁切。安装名称、初始化页面和钱包功能不随本次图标调整变化。

唯一生成来源为 tuyuserve/logo，原始 AI、PNG 和既有平台位图保持不变。generate_assets.py --android-only 仅生成已登记的四产品 Android XML 并更新 manifest.json；不会批量重写其他平台图标。原生 XML 以 android_resources 记录路径和摘要；商家工程路径使用 tuyubooking/app。厂家前景继续使用其既有 prepareLogo 任务生成的 drawable/tuyu_logo。

长期验收包括权威源与衍生清单一致、四产品普通及圆形图标引用一致、标识位于裁切安全区域，以及最终安装包在实际启动器中的显示。资源测试不能替代整包编译、安装和真机视觉验收；本项不修改控制台流程或 CitizenSdk。

### Flutter 独立缓存工程视图（2026-09-10）

途遇生活 iOS、Android 的 Flutter/Pub 命令统一在 `tuyulife/target/<平台>/flutter-project/` 执行。真实源码只读，Pub、Gradle、Pods、Flutter build、Cargo 与临时状态只进入对应平台缓存；控制台不分析或限制产品依赖，也不向源码目录写入构建状态。

Android Gradle 固定从 `/Users/rhett/tuyulife/android/` 真实根启动，产品设置和应用配置读取缓存 Flutter 根生成的 `local.properties` 与插件清单。Gradle 项目状态、依赖和输出继续指向本平台缓存；缓存视图中的跨根设置脚本链接不再参与执行。

受控 Flutter 插件 included-build 仅开放 Gradle 9.1要求的目录所有者写位，文件仍为只读验真原件；插件构建输出通过任务初始化脚本进入途遇生活 Android缓存。Gradle命令关闭 Problems Report，产品源码 `android/build/` 不属于允许输出。
### Build与Start物理归属（2026-09-12）

本产品Build、CI和Release唯一实现位于产品scripts目录；TataConsole只按固定身份调用。Start由TataConsole启动产物库中的macOS成功产物，产品不实现Start。

- tuyulife：
  - `tuyulife.ios.build` → `tataconsole/console/tuyulife/ios/build.sh`
  - `tuyulife.android.build` → `tataconsole/console/tuyulife/android/build.sh`

## CI与Release入口归属

本产品CI与Release由所属仓当前`scripts/flows.json`的remote_routes及各平台Workflow声明定位，完整执行入口为本仓`scripts/flow.mjs`。控制台读取当前声明、创建原有真实任务、获取准确仓权限并跟踪原Run；旧控制台CI/Release Shell与Swift执行文件已删除，不作为入口。

## CitizenSDK统一边界复查（2026-09-15）

TuyuLife当前只包含系统工程、产品身份、国际化和HTTPS基础边界，明确没有钱包、签名、公民链或支付能力；
源码和`pubspec.yaml`也没有自建sr25519、私钥存储或轻节点，因此当前不存在重复CitizenSDK实现。后续一旦确认
任一钱包、签名、验签、公民链或轻节点需求，必须直接接入CitizenSDK公开接口，禁止复制TuyuLove现有本地
安全包或建立TuyuLife专用实现。

## 独立 GitHub CI 与 Release 工作流

本产品每个实际产品、平台、流程身份使用下列独立文件，主 Job 为 `flow`；CI 验证源码，Release 生成正式产物，发布由塔塔控制台的独立 Publish 流程负责。

- `.github/workflows/tuyulife-android-ci.yml`
- `.github/workflows/tuyulife-android-release.yml`
- `.github/workflows/tuyulife-ios-ci.yml`
- `.github/workflows/tuyulife-ios-release.yml`

## 平台输入与源码外工程

tuyulife/scripts/project.mjs为本产品唯一工程装配入口，project.test.mjs验证路径与隔离。create和verify明确接收source-root、work-root及platform；调用方可指定当前任务内output，默认按源码绝对路径装配，输出不得覆盖或进入源码。Flutter、Xcode、Gradle的可写配置保存在输出工程，源文件不被工具回写。

平台声明以Runner.pbxproj、Runner.xcscheme、ProjectWorkspace/Workspace声明等文件直接保存于ios或macos目录；单文件测试、单一macOS图标资源及菜单包装层归并。工程入口仅在本次工作根重建Xcode所需固定结构，原平台声明与资源正文保持。Android扁平Manifest、资源限定文件及MainActivity由同一入口还原原逻辑路径。Android Wrapper来自调用方明确指定的固定FLUTTER_ROOT原件，输出使用既定Gradle9.1.0；缺工具、缺输入、目标已存在或来源链接越界均失败。

页面Logo唯一源码路径为tuyulife/tuyu_logo.png。CI和Release各自创建独立工作工程，后续签名只读取该工程产物；本机Build传入当前任务目录，产品不识别目录来源。SDK本机path依赖使用SDK自有公开Flutter工程入口。

Release工程路径先独立赋值，创建成功后才导出；工程创建失败必须保留退出码并立即停止。工程测试实际执行该赋值片段的成功与失败分支，不调用真实签名或发布。

Android的TUYULIFE_BUILD_DIR由本机调用方明确指定本轮源码外输出目录；Gradle产物和APK收口必须使用同一目录。产品既有独立运行默认值不变。本机App和适用的SDK原生步骤复用调用方已验真的Gradle可执行文件，执行失败必须传回，不经Wrapper重复下载工具。

本产品正式Release主flow Job实际创建GitHub版本，contents权限准确为当前仓write；辅助Job与其它权限保持原登记。源提交、成功CI、版本及资产验真不放宽，不派发发布。
## 完整产品组织与执行合同

所有者：`tuyulife`，正式源码根 `/Users/rhett/tuyulife`；本说明属于该完整产品。组件不会拆成独立仓库或目录产品。所有执行身份统一为 `产品.平台.流程`，单平台仅在控制台显示和物理目录中省略平台层。

真实平台目标：`ios`、`android`。

推送门禁唯一源码位于 `/Users/rhett/tuyulife/.github/tatagate/`，GitHub入口 `/Users/rhett/tuyulife/.github/workflows/tatagate.yml`。控制台先从本仓已保存提交执行这份门禁，通过后推送准确SHA；GitHub main push再执行同一提交的门禁，控制台核对所属仓、Workflow、main、SHA、Run和attempt，只有success并再次回查main一致才完成推送。失败、取消、超时或身份漂移均不得显示成功，不自动重试或派发CI/Release。

技术文档由所属完整产品仓根唯一持有；私有规则和任务库由控制台私仓持有，公开产品不读取它们。公开门禁不依赖私仓资料、安装包源码、其它本机产品或个人账号；必要链真源先锁定公开main的实际SHA后只读该SHA。本机开发跨产品验收仍比较三仓已保存快照与各端真实镜像。


### 门禁与开发审查职责

准确中文注释按开发阶段逐项复核，不以保留源码每文件包含汉字作为仓库门禁的开发凭证。初始完整内容、生成文件和上游原件保持原文；真实第一方临时注释、机密、源码输出、Workflow、依赖和适用测试仍由本仓同提交门禁验真。公民门禁只把scripts中的Node命令行结果报告识别为CLI输出；本仓实际执行测试的准确协议拒绝断言不属于新运行协议，字符串、注释、模板和未登记测试中的同文不豁免。保存及推送仍逐仓独立授权，并以本机门禁和同SHA的GitHub门禁双成功为唯一终态。

## 产品介绍与开源许可

根目录 `README.md` 仅提供本产品简明介绍，不承载技术方案、任务记录或验收结论。独立自有代码采用根 `LICENSE` 的MIT；上游代码、衍生修改、依赖及组合分发遵循各自原许可、版权、例外与附加要求。


### 本机Build代码所有权

本产品的scripts/flows.json声明自身平台、准确工具版本、原始锁以及既有CI/Release入口；scripts/build.mjs独立实现requirements、prepare、build三个阶段，拥有工程准备、编译命令、候选验真和失败条件。产品只消费调用方交付的公开资源回执，按本仓原始锁取得依赖，所有生成状态进入规范源码外工作目录。平台或资源身份不符、版本错误、缺锁、链接越界、归档摘要错误、旧工程复用或编译器失败均立即失败。

本产品脚本、测试及原生工程的源码根变量统一为`TUYULIFE_ROOT`，仅表示途遇生活所属正式源码根；生产者与消费者同步使用这一名称。Release仓库身份错误使用准确产品中文名，正式组织与仓库身份校验保持。


### 产品独立资源与编译入口

本产品的scripts/flows.json声明自身平台、准确工具版本、原始锁以及既有CI/Release入口；scripts/build.mjs独立实现requirements、prepare、build三个阶段，拥有工程准备、编译命令、候选验真和失败条件。产品只消费调用方交付的公开资源回执，按本仓原始锁取得依赖，所有生成状态进入规范源码外工作目录。平台或资源身份不符、版本错误、缺锁、链接越界、归档摘要错误、旧工程复用或编译器失败均立即失败。

本产品平台闭集为`ios`、`android`。调用格式为`node scripts/build.mjs <requirements|prepare|build> <platform> --work <绝对工作目录>`；requirements只读并输出唯一JSON，prepare/build从标准输入读取schema=1的资源回执。调用方交付准确工具执行器、锁定依赖目录、Git来源和归档后先prepare，再读取展开来源新增的需求，完整交付后执行build。准备、展开和编译属于同一调用工作根，各平台互不共享可写状态。独立调用方按本仓声明准备资源即可运行，无需读取其他产品工作树或私有资料。

Git依赖只接受本仓声明与锁一致的HTTPS地址及40位固定提交；原生归档只接受本产品锁定坐标及完整SHA-256。工程副本排除旧生成物，内部文件链接重映射到同轮副本，外部链接与已有工程拒绝。原始依赖缓存必须显式交付，不能落入用户默认缓存；离线编译禁止隐式取得缺失资源。已有CI/Release Workflow仍各自调用本仓scripts，不受本机可视化入口是否存在影响。入口回归由本仓`scripts/build.test.mjs`负责，适配与资源服务的验证不替代产品编译和真实候选验收。


## 2026-10-06 产品自主资源阶段（第2步）

本仓`scripts/resources.mjs`拥有工具准确来源/版本/配方、递归锁解析、缺失获取、验真、复用和本轮依赖准备；`scripts/build.mjs resources <platform> --work <绝对外部工作根>`调用同一实现，独立入口为`resources.mjs <platform> --work <工作根> [--offline]`。前者从stdin读取公开身份回执；后者允许空请求。最小宿主必须使用本仓声明的官方Node25.2.1绝对入口，本机配方限定macOS ARM；资源阶段回读官方发行归档与运行Node字节，不能从PATH取同名程序。工作根预先存在、位于源码外且不经过链接。

可选`PRODUCT_TOOL_ROOT`只供读取工具原件，`PRODUCT_DEPENDENCY_ROOT`只供读取依赖原件；产品不读取供给者的版本决策或私有任务变量。独立缺省原件库为源码外`~/.local/share/product-resources`，本轮可写状态仅在work。GNU Bash/grep/sed纳入自身需求；发行件旧Shell仅用于声明中的首次GNU构建，不进入正式PATH。下载/源码工具编译不持全局锁，最终不可变对象提交使用短锁，取消传递到工具进程组。错误摘要、损坏、未锁来源、路径越界和显式离线缺失失败并保留可疑原件。

Pub/npm/Cargo按原始锁准备；Git按固定HTTPS提交检出，Git Cargo目录源展开workspace继承并锁定相对包版本；CocoaPods按准确锁摘要恢复验真快照，缺失spec校验规范摘要，未锁源码来源拒绝取得。Android固定包与修订归产品；额外平台仅消费官方固定发行来源与发行树摘要，不借宿主历史SDK目录。Maven供给只读验真后复制到独占Gradle缓存，由产品准备现有配置，消费仍离线；全库坐标导入与旧目录清理留到第5步。

`PRODUCT_WORK_DIR`、`PRODUCT_BASH_BIN`、`PRODUCT_RSYNC_BIN`及`PRODUCT_SOURCE_DIR`是公开工作/工具/工程入口；Flutter修订不读取调用方私有变量，也不回退系统rsync。旧Flutter补丁对象与当前配方不符时拒绝复用，真实替换须按准确资源操作另行授权。本步不改变编译、签名、安装及回读顺序，不修改产品UI，也未执行真实工具下载/安装。受控资源测试不能代替官方首次取得、正式编译或最终真实运行验收；第4至7步仍待逐步确认实施。

资源原件按完整内容验真后整体提交：Git bundle与固定来源/摘要回执处于同一个不可变对象，不暴露中间状态；可选依赖供给读取`objects/<SHA256>.blob`。锁解析器、源码工具依赖与官方有序补丁也从同一产品原件存储复用。Pod spec每次按锁中的规范checksum回验，Git tag只核对发行声明并消费本产品预锁提交；HTTP发行件消费固定SHA256，首次源码准备命令来自该已验真spec并由GNU Bash执行。spec、准备后源码与文件清单整体提交，再复制到本轮缓存；供给索引不决定产品版本。正式PATH排除旧POSIX Shell，`sh`对应已验真的GNU Bash。

独立缺省资源目录内`tools`保存工具发行件及工具编译输入，`rely`保存产品依赖的归档、Git和Pod原件；工作区只承载本轮可写视图。根据用户最新要求，分步骤先完成实现与用例，整项解耦任务完成后统一测试；本步实施记录不等于真实工具首次取得、完整Build或安装验收通过。


### 第3步：产品完整Build入口（2026-10-06）

本产品的正式完整入口为已锁定Node的绝对路径调用`/Users/rhett/tuyulife/scripts/build.mjs execute <platform> --work <已存在绝对工作根>`，可选`--offline`。输入stdin可为空；调用方可传schema/product_id/platform/work及真实run_id/program_digest，禁止私有变量或执行命令。入口内部完成需求→资源→准备→再次需求/资源闭包→编译→适用签名/安装/回读；独立与控制台调用同一实现。最小引导Node只启动本产品的资源引导器，产品按自己的官方Node声明验真、准备并重入，控制台运行Node不决定产品Node版本。

标准输出只有唯一有界JSON：schema、product_id、platform、work、completion、files及可选真实run_id。completion沿用固定平台的device-install/macos-artifact/compile-only；files按本产品flows.json登记路径和SHA256。编译日志使用stderr进入现有任务日志，不新增资源任务或任务状态。完整结果只在各阶段成功、源码/锁不漂移、工具进程确认退出后落入本轮build-result.json；同根并发或复用旧结果拒绝，取消/失联/错误身份/损坏候选不得成功。

控制台每次Build直接读取本产品当前flows.json入口，调用一次execute；控制台只跟踪真实任务、核验公开结果和保存产物，不解释产品工具、依赖、编译参数或设备规则。当前控制台静态菜单、其它产品流程/安装器与程序摘要的历史耦合仍归第4步解除，本步不能当作整项解耦已完成。

Android开发材料读取和仅首次创建可由专用PRODUCT_HOST_FD=3提供，原生端仅保管既有DEV_KEY；产品自身负责材料解析、工具、临时密钥、Release包签名、证书/版本核对、先直接USB安装以及多USB分支逐台安装回读。独立调用由产品自己的Keychain保管开发材料。材料不写入公开结果或日志，临时密钥只在工具确认退出后删除。iOS归档由产品解包并验证唯一Runner.app、原始Release配置、Apple签名profile、团队/设备授权、代码签名和entitlement，再完成主动真机探测、防降级、安装及bundleVersion回读。控制台不再包含LocalMobileTask/MobileSecurityManager执行链。

产物保持固定android.apk/ios.app.zip；控制台通用artifact能力在产品验真后、设备安装前保存候选，保存失败阻止安装，安装失败不伪造成功。iOS profile/entitlement原生用例迁入本产品Swift验真器测试；统一验收须显式交付产品锁定Xcode的PRODUCT_TEST_SWIFT及PRODUCT_TEST_DEVELOPER_DIR，缺失时测试失败，不静默跳过。

本步同步完整入口、失败/取消/并发、结果/路径/摘要及适用移动端用例，但未运行测试、语法检查、编译、签名、安装或工具下载/替换；全部实现步骤完成后统一验收。源码交付与用例存在不代表真实Build已经通过。


### 第4步实施中：远端路由当前声明

CI/Release的规范身份、标题、版本前缀和正式版本记录标志已迁入所属仓现有scripts/flows.json的remote_routes。调用方按固定已接入动作重读当前声明；原生授权与流程查询不再使用编译期产品路由常量。产品声明只提供数据，不授予凭据、扩大平台矩阵或新增按钮。损坏、重复、越仓、字段越界及超限拒绝。

本次同步路线读取、热更新和失败边界用例，未运行测试、语法检查、编译、签名、安装或下载。第4步仍在开发中：Publish执行器、聊天安装器、Start、固定菜单声明与完整程序摘要的其余实际耦合尚未解除，不能报告该步或整项任务完成。

### 产品远端完整入口

本仓`scripts/flows.json`的`flow_entry`定位公开`scripts/flow.mjs`。`run ci <platform>`和`run release <platform>`分别执行同一产品流程，当前读取本仓Workflow与路由；Release的`version_source`声明准确版本文件类型和相对路径。成功CI选择、同源候选复用、版本递增、正式Release验真与旧Run/Artifact清理均由本产品入口完成。独立执行只需等价的本仓短期GitHub权限；没有宿主控制管道时入口自行跟踪Run，不依赖其它产品程序。

可选`PRODUCT_CONTROL_FD=3`只接受当前Run绑定确认、候选持久化确认和二值远端终态；令牌仅进入HTTPS请求头，未知身份、越仓、无成功CI、候选错源、控制帧错误、超时或取消均失败。宿主重启后的`recover`使用同一公开入口核验原Run、原候选并清理，不重新派发。公开控制协议不携带私有调用方变量，现有授权及用户操作顺序保持。源码、声明或Workflow在本次流程期间变化将拒绝继续。

相关正常、失败、身份、版本来源、独立远端跟踪、候选重试和真实控制管道边界用例位于本仓`scripts/flow.test.mjs`；当前只完善源码，尚未运行用例或远端操作。


### 产品软件记录与正式版本恢复

本仓公开`scripts/flow.mjs records`使用准确同仓短期GitHub权限，重读本仓当前路由，复用远端流程同一Run保留器并确认实际删除，再读取各平台最新正式版本。来源合同归本仓release.record_source：按实际产品选择Tag、单包正文或正式元数据资产验真，标题、版本、源码与适用不可变标志不能由调用方推测。准确元数据资产仅经官方HTTPS地址读取，跨主机不转发仓库令牌。正式资产和Tag不会在记录刷新中删除。公开结果仍是records/removed_run_ids，原记录页行为保持。

`recover`不重新派发；重新核验原候选、成功CI、原Run终态、正式资产来源与Tag，输出formal_release/removed_run_ids。控制调用方仅绑定原任务身份、原候选和产品公开回执，更新现有持久发布目标；产品验真算法不再随调用方程序编译。相关正常、失败、错资产/正文/来源、重定向隔离、独立记录刷新和恢复用例源码归本仓flow.test.mjs。

资源工具取消、超时、输出超限和异常收尾均等待主进程与整个后代组退出；无法确认退出时保留工作根和候选，禁止删除输入或改为可写。真实取消退出顺序用例仅写入resources.test.mjs，尚未执行。


### 发布实现范围

本轮新增产品发布实现已撤销，发布功能由后续逐个产品重建。现有操作入口与界面保留，当前不提供已删除实现的执行保证；Build、CI、Release和Start继续按各自现有入口运行。


### 产品独立资源与唯一依赖供给

本产品的scripts/resources.mjs拥有资源解析、来源与摘要验证、缺件取得、可写视图和失败条件。PRODUCT_DEPENDENCY_ROOT是可选只读供给；没有供给时使用源码外的本产品原件存储，产品需求仍只由当前源码、声明和锁决定。依赖索引读取仅接受schema_version=2及packages、git_sources、pods，不恢复旧目录或整锁快照。

Maven的具体JAR、AAR、POM、module及分类器文件统一由packages的group:artifact、version、准确上游URL、SHA256和SRI定位objects中的原件。产品在本轮work/dependencies/maven按上游分区复制独占文件；不复制Gradle二进制元数据、锁和下载状态。产品生成本轮GRADLE_USER_HOME/init.d初始化脚本，只在自身已声明的同源仓库之前加入本轮原件视图，缺件仍按产品原仓库解析，明确离线则失败。Gradle解析、工程状态和后续编译都属于同一产品任务。

Pod由pods中的name、version、checksum匹配当前Podfile.lock；spec保存官方CDN地址和原件摘要，source保存官方podspec来源，files保存发布树相对路径、文件内容摘要与权限或安全内部链接。只物化本产品所需的单个发布坐标；其它Pod、整锁、平台或宿主变化不要求复制全树。产品仍按CocoaPods官方规范回验SPEC CHECKSUMS，再验证本产品预锁定Git提交或HTTP发行摘要与源码回执。可写缓存和工具VERSION仅在本轮work产生，不能写回共享原件。

错来源、摘要、重复同源内容、生成状态、硬链接、内部链接越界或循环、取消及任务副本漂移均据实失败。独立与控制台调用使用同一实现；控制台只提供可选原件并跟踪原有任务，UI、功能、按钮、平台与操作顺序保持。用例源码已同步，执行留待整项实现结束后的统一测试。


### 独立入口回归验真边界

资源回归使用自带固定提交、源码字节和spec的合成Pod，不借用产品真实Pod清单提供测试输入；无真实Pod需求的平台也验证来源、摘要、链接、循环、取消和物化失败。测试现场仍位于本产品target的准确平台，不写源码或其它产品目录。资源声明与生产依赖坐标不因测试夹具改变。

Apple验真器回归显式使用已验真的锁定Xcode及其SDK；官方swift入口允许包内链接，但规范目标必须属于同一Xcode且为有执行权限的普通文件。不得因此借用PATH或另一套工具。

资源取消对同一真实进程组每轮只发送一次信号；组不存在或Windows时才发送给主进程。仍等待主进程和后代实际退出，8秒未退出才强杀，12秒仍未确认则保留现场并失败；取消不能成为成功。

Apple验真器测试由同一锁定Xcode的swiftc编译实际XCTest Bundle，使用该包随附XCTest框架与Swift overlay，再由同包xctest执行；必须回读5项测试全部成功，空测试套件不得算通过。Bundle、模块缓存和临时输出仅归本产品target准确平台。


### 门禁官方归档字段与平台命名边界（2026-10-07）

平台禁用值继续来自本仓既有门禁登记。仅scripts/resources.mjs的唯一规范toolDefinitions声明内、唯一Flutter工具的archive.url可以按对应数字版本核对官方稳定版macOS归档；source、root和executable必须匹配原有官方坐标。识别后仅从平台扫描输入移除该URL，原资源源码、工具版本、来源及依赖锁均不修改。重复声明、重复键、转义或不可解析字面量、错版本、错来源及错形字段不予豁免；其它工具、字段、源码、注释和目录中的旧平台标识继续拒绝。

既有门禁测试覆盖本仓真实资源声明、官方字段、伪造来源和字段、歧义字面量、额外源码、旧平台注释与目录；全部夹具只在本产品target真实平台测试目录生成，并在finally清理。工作树诊断与绑定已保存提交SHA的正式门禁分别记录，不能将缺少Git跟踪文件的工作树冒充正式通过。

当前完整门禁回归11/11通过，失败/取消/跳过/待办均0；本仓真实根技术文档、机密扫描及平台命名检查通过。完整资源源码和补丁边界、既有链接/临时目录/根文档夹具的失败已消除。测试及工作树检查不代替绑定已保存提交SHA的正式门禁，也不代替产品真实Build、签名安装及启动验收。本轮自有日志与夹具在结果记录后按原规则删除。


### 补丁原上下文与测试夹具边界（2026-10-07）

平台扫描只对scripts/resources.mjs中唯一规范flutterPatch JSON字面量执行原上下文识别：补丁登记字段严格为path、sha256、source；path为flutter.patch，source为Flutter官方固定40位提交，正文首行固定来源必须一致，全文SHA-256必须匹配本仓登记。仅当native_assets_host.dart准确文件、hunk及lipoDylibs邻接上下文唯一匹配时，从扫描副本移除那一行已核对的上游原注释。实际资源源码和补丁正文不修改；其它补丁行、源码、字段和目录继续完整扫描。错误来源、摘要、重复声明、非规范转义、上下文漂移和新增旧平台文字均不豁免，不跳过整段补丁。

既有门禁夹具以unlinkSync删除测试目录中的链接自身；测试临时目录仅调用本仓唯一testRoot，无旧API别名。机密扫描夹具生成本仓必需的合成根文档，原文档检查及拒绝断言保持。补丁正常、错源、错摘要、错形、重复、上下文外残留等边界同步在既有test.mjs，现场在本产品target内并由finally清理。补充实现后的统一门禁验收已通过，正式提交门禁及产品真实Build/启动验收仍待完成。
