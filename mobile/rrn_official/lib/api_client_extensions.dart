import 'package:http/http.dart' as http;

import 'core.dart';

extension RrnApiClientMultipart on ApiClient {
  Future<dynamic> postForm(
    String path, {
    Map<String, String> fields = const {},
    Map<String, String> files = const {},
    String method = 'POST',
    bool retryAuth = true,
  }) async {
    Future<http.Response> send() async {
      final request = http.MultipartRequest(method.toUpperCase(), uri(path));
      request.headers.addAll(headers(jsonBody: false));
      request.fields.addAll(fields);
      for (final entry in files.entries) {
        if (entry.key.trim().isEmpty || entry.value.trim().isEmpty) continue;
        request.files.add(await http.MultipartFile.fromPath(entry.key, entry.value));
      }
      final streamed = await request.send().timeout(const Duration(seconds: 60));
      return http.Response.fromStream(streamed);
    }

    var response = await send();
    if (response.statusCode == 401 && retryAuth && await refresh()) {
      response = await send();
    }
    return decode(response);
  }
}
