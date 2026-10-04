/// 校验途遇生活的业务网络入口，运行时不允许明文协议。
final class SecureEndpoint {
  SecureEndpoint._(this.uri);

  final Uri uri;

  static SecureEndpoint https(String value) {
    final uri = Uri.parse(value);
    if (uri.scheme != 'https' || uri.host.isEmpty || uri.userInfo.isNotEmpty) {
      throw const FormatException('途遇生活服务地址必须是有效 HTTPS 地址');
    }
    return SecureEndpoint._(uri);
  }
}
