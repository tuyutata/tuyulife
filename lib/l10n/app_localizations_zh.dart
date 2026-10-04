// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Chinese (`zh`).
class AppLocalizationsZh extends AppLocalizations {
  AppLocalizationsZh([String locale = 'zh']) : super(locale);

  @override
  String get appName => '途遇生活';

  @override
  String get frameworkTitle => '途遇生活系统工程';

  @override
  String get frameworkReady => 'iOS、Android 基础框架已接入，生活业务模块将在后续步骤按技术文档实现。';

  @override
  String get frameworkUnavailable => '基础框架当前不可用。';
}
