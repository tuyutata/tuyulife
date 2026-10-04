import 'dart:convert';
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:tuyulife/core/secure_endpoint.dart';
import 'package:tuyulife/core/product.dart';

void main() {
  test('Android generated names use the AGP Variant API', () {
    final root = Platform.environment['TUYULIFE_ROOT'] ?? Directory.current.path;
    final script = File('$root/android/app/build.gradle.kts').readAsStringSync();
    expect(script, contains('abstract class GenerateAppNameResources : DefaultTask'));
    expect(script, contains('generatedResources.set(appNameResources)'));
    expect(script, contains('androidComponents.onVariants'));
    expect(script, contains('addGeneratedSourceDirectory'));
    expect(script, contains('GenerateAppNameResources::generatedResources'));
    expect(script, isNot(contains('res.srcDir(appNameResources)')));
    expect(script, isNot(contains('android.sourceset.disallowProvider=false')));
  });

  test('安装名称按系统语言解析并保留产品身份', () {
    final root = Platform.environment['TUYULIFE_ROOT'];
    final app = root == null ? Directory.current.path : '$root';
    String source(String path) => File('$app/$path').readAsStringSync();
    for (final platform in ['ios']) {
      final catalog = jsonDecode(source('$platform/Runner/InfoPlist.xcstrings'));
      for (final key in ['CFBundleDisplayName', 'CFBundleName']) {
        for (final entry in {'en': 'TuyuLife', 'zh-Hans': '途遇生活', 'zh-Hant': '途遇生活'}.entries) {
          expect(catalog['strings'][key]['localizations'][entry.key]['stringUnit']['value'], entry.value);
        }
      }
      expect(source('$platform/Runner.pbxproj'), contains('InfoPlist.xcstrings'));
    }
    expect(source('android/app/src/main/AndroidManifest.xml'), contains('android:label="@string/app_name"'));
    final gradle = source('android/app/build.gradle.kts');
    expect(gradle, contains('generateAppNameResources'));
    expect(gradle, contains('app_en.arb'));
    expect(gradle, contains('app_zh.arb'));
    expect(gradle, contains('layout.buildDirectory.dir("generated/app-name/res")'));
  });

  test('途遇生活使用唯一独立产品身份', () {
    expect(TuyuLifeProduct.id, 'tuyulife');
    expect(TuyuLifeProduct.technicalName, 'TuyuLife');
    expect(TuyuLifeProduct.bundleId, 'com.tuyulife');
    expect(TuyuLifeProduct.audience, 'tuyulife');
  });

  test('业务入口只接受HTTPS', () {
    expect(
      SecureEndpoint.https('https://serve.tuyulove.com').uri.host,
      'serve.tuyulove.com',
    );
    expect(
      () => SecureEndpoint.https('http://example.test'),
      throwsFormatException,
    );
  });
}
