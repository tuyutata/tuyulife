import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:tuyulife/home_page.dart';
import 'package:tuyulife/l10n/app_localizations.dart';

/// 中文、英文之外统一回退简体中文，避免由平台默认规则选择错误语言。
Locale resolveTuyuLifeLocale(
  Locale? locale,
  Iterable<Locale> supportedLocales,
) {
  if (locale?.languageCode == 'en') return const Locale('en');
  return const Locale('zh');
}

/// 途遇生活独立应用入口。
class TuyuLifeApp extends StatelessWidget {
  const TuyuLifeApp({this.locale, super.key});

  final Locale? locale;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      onGenerateTitle: (context) => AppLocalizations.of(context).appName,
      debugShowCheckedModeBanner: false,
      localizationsDelegates: const [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ],
      supportedLocales: AppLocalizations.supportedLocales,
      localeResolutionCallback: resolveTuyuLifeLocale,
      locale: locale,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF176B5B)),
        useMaterial3: true,
      ),
      home: const TuyuLifeHomePage(),
    );
  }
}
