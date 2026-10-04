// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appName => 'TuyuLife';

  @override
  String get frameworkTitle => 'TuyuLife System Framework';

  @override
  String get frameworkReady =>
      'The iOS and Android framework is connected. Lifestyle modules will be implemented in later documented steps.';

  @override
  String get frameworkUnavailable =>
      'The application framework is unavailable.';
}
