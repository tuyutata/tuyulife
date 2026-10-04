import 'package:flutter/widgets.dart';
import 'package:tuyulife/app/app.dart';
import 'package:tuyulife/app/app_scope.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const TuyuLifeScope(child: TuyuLifeApp()));
}
