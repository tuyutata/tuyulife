import groovy.json.JsonSlurper

pluginManagement {
    val flutterSdkPath =
        run {
            val properties = java.util.Properties()
            val flutterProjectRoot = System.getenv("TUYULIFE_PROJECT_ROOT")
                ?.let { java.io.File(it) }
                ?: settingsDir.parentFile
            flutterProjectRoot.resolve("android/local.properties").inputStream().use { properties.load(it) }
            val flutterSdkPath = properties.getProperty("flutter.sdk")
            require(flutterSdkPath != null) { "flutter.sdk not set in local.properties" }
            flutterSdkPath
        }

    includeBuild("$flutterSdkPath/packages/flutter_tools/gradle")

    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

// 产品自己的Flutter插件清单来自当前Flutter根；Gradle从真实android根执行，
// 缓存视图不再以跨根设置脚本改变Gradle根身份。
val flutterProjectRoot = System.getenv("TUYULIFE_PROJECT_ROOT")
    ?.let { java.io.File(it) }
    ?: settingsDir.parentFile
val flutterPlugins = flutterProjectRoot.resolve(".flutter-plugins-dependencies")
if (flutterPlugins.isFile) {
    val metadata = JsonSlurper().parse(flutterPlugins) as Map<*, *>
    val androidPlugins = (metadata["plugins"] as? Map<*, *>)?.get("android") as? List<*> ?: emptyList<Any>()
    androidPlugins.filterIsInstance<Map<*, *>>()
        .filter { it["native_build"] != false }
        .forEach { plugin ->
            val name = plugin["name"] as String
            include(":$name")
            project(":$name").projectDir = java.io.File(plugin["path"] as String, "android")
        }
}

include(":app")
