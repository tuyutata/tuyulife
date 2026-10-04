import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:tuyulife/app/app.dart';
import 'package:tuyulife/app/app_scope.dart';

void main() {
  test('其他设备语言回退简体中文', () {
    expect(
      resolveTuyuLifeLocale(const Locale('fr'), const []),
      const Locale('zh'),
    );
    expect(
      resolveTuyuLifeLocale(const Locale('en'), const []),
      const Locale('en'),
    );
  });

  testWidgets('系统工程显示途遇生活准确名称', (tester) async {
    await tester.pumpWidget(
      const TuyuLifeScope(child: TuyuLifeApp(locale: Locale('zh'))),
    );
    await tester.pumpAndSettle();
    expect(find.text('途遇生活'), findsOneWidget);
    expect(find.text('途遇生活系统工程'), findsOneWidget);
  });
}
