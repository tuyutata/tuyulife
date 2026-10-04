import groovy.json.JsonSlurper
import java.util.Properties

plugins {
    id("com.android.application")
    // AGP提供内置Kotlin；Flutter插件在Android插件之后应用。
    id("dev.flutter.flutter-gradle-plugin")
}

val flutterProductRoot = System.getenv("TUYULIFE_PROJECT_ROOT")
    ?.let { file(it) }
    ?: rootProject.projectDir.parentFile
val flutterBuildProperties = Properties().apply {
    flutterProductRoot.resolve("android/local.properties").inputStream().use { load(it) }
}
val productVersionCode = flutterBuildProperties.getProperty("flutter.versionCode", "1").toInt()
val productVersionName = flutterBuildProperties.getProperty("flutter.versionName", "1.0")

android {
    namespace = "com.tuyulife"
    compileSdk = 36
    ndkVersion = "28.2.13676358"

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    defaultConfig {
        // 途遇生活保持独立应用标识，不与途遇共用安装数据。
        applicationId = "com.tuyulife"
        // You can update the following values to match your application needs.
        // For more information, see: https://flutter.dev/to/review-gradle-config.
        minSdk = 24
        targetSdk = 36
        versionCode = productVersionCode
        versionName = productVersionName
    }

    buildTypes {
        release {
            // 只生成未签名候选；正式版由TuyuLife Release流程签名。
            signingConfig = null
        }
    }
}

kotlin {
    compilerOptions {
        jvmTarget = org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17
    }
}

flutter {
    // Android Gradle根不经过符号链接，Flutter根仍使用当前任务缓存视图。
    source = System.getenv("TUYULIFE_PROJECT_ROOT") ?: "../.."
}

// 安装名称读取现有产品语言资源，生成物仅写入当前平台的产品构建目录。
// AGP 9 consumes generated resources through a typed task output.
abstract class GenerateAppNameResources : DefaultTask() {
    @get:org.gradle.api.tasks.OutputDirectory
    abstract val generatedResources: org.gradle.api.file.DirectoryProperty
}

val appNameResources = layout.buildDirectory.dir("generated/app-name/res")
val appNameSources = mapOf(
    "values" to layout.projectDirectory.file("../../lib/l10n/app_en.arb"),
    "values-zh" to layout.projectDirectory.file("../../lib/l10n/app_zh.arb"),
)
val generateAppNameResources = tasks.register<GenerateAppNameResources>("generateAppNameResources") {
    generatedResources.set(appNameResources)
    inputs.files(appNameSources.values)
    outputs.dir(appNameResources)
    doLast {
        appNameSources.forEach { (qualifier, source) ->
            val document = JsonSlurper().parse(source.asFile) as Map<*, *>
            val title = document["appName"] as? String
                ?: throw GradleException("产品语言资源缺少安装名称")
            require(title.isNotBlank() && !title.contains("\n")) { "安装名称不能为空或包含换行" }
            val escaped = title.replace("&", "&amp;").replace("<", "&lt;")
                .replace(">", "&gt;").replace("\"", "&quot;")
            val output = appNameResources.get().file("$qualifier/strings.xml").asFile
            output.parentFile.mkdirs()
            output.writeText("<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<resources><string name=\"app_name\">$escaped</string></resources>\n", Charsets.UTF_8)
        }
    }
}
// Let AGP carry the generation dependency into every resource-consuming variant.
androidComponents.onVariants { variant ->
    variant.sources.res?.addGeneratedSourceDirectory(
        generateAppNameResources,
        GenerateAppNameResources::generatedResources,
    )
}
