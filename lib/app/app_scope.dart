import 'package:flutter/widgets.dart';
import 'package:provider/provider.dart';

/// 途遇生活的应用级状态边界；生活业务模块只能从这里取得共享状态。
final class TuyuLifeState extends ChangeNotifier {
  bool get frameworkReady => true;
}

/// 为整个应用提供唯一的应用级状态实例。
class TuyuLifeScope extends StatelessWidget {
  const TuyuLifeScope({required this.child, super.key});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(create: (_) => TuyuLifeState(), child: child);
  }
}
