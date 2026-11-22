// 统一Android插件与仓库配置，并设置各模块的源码外构建目录。

buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath("com.android.tools.build:gradle:9.0.1")
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:2.2.20")
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

// 构建输出由TuyuLife产品变量指定；普通开发和CI均可直接使用源码外目录。
val productBuildValue = System.getenv("TUYULIFE_BUILD_DIR")
    ?.takeIf { it.isNotBlank() }
    ?: "${System.getProperty("java.io.tmpdir")}/tuyulife/android"
val productBuildFile = rootProject.file(productBuildValue).canonicalFile
val productSourcePath = rootProject.projectDir.parentFile.canonicalFile.toPath()
require(productBuildFile.isAbsolute && !productBuildFile.toPath().startsWith(productSourcePath)) {
    "TUYULIFE_BUILD_DIR必须是TuyuLife源码外的绝对目录"
}
val newBuildDir: Directory = rootProject.layout.dir(rootProject.provider { productBuildFile }).get()
rootProject.layout.buildDirectory.value(newBuildDir)

subprojects {
    val newSubprojectBuildDir: Directory = newBuildDir.dir(project.name)
    project.layout.buildDirectory.value(newSubprojectBuildDir)
}
subprojects {
    project.evaluationDependsOn(":app")
}

tasks.register<Delete>("clean") {
    delete(rootProject.layout.buildDirectory)
}
