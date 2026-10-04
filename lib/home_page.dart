import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:tuyulife/app/app_scope.dart';
import 'package:tuyulife/l10n/app_localizations.dart';

/// 首个系统工程页面只陈述真实接入状态，不提前伪造生活业务功能。
class TuyuLifeHomePage extends StatelessWidget {
  const TuyuLifeHomePage({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final ready = context.watch<TuyuLifeState>().frameworkReady;
    return Scaffold(
      appBar: AppBar(title: Text(l10n.appName)),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 520),
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(20),
                  child: Image.asset(
                    'tuyu_logo.png',
                    width: 88,
                    height: 88,
                    semanticLabel: l10n.appName,
                  ),
                ),
                const SizedBox(height: 20),
                Text(
                  l10n.frameworkTitle,
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
                const SizedBox(height: 12),
                Text(
                  ready ? l10n.frameworkReady : l10n.frameworkUnavailable,
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
