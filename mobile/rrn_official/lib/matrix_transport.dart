import 'dart:convert';

import 'package:http/http.dart' as http;

import 'core.dart';

String matrixEndpointPath(String raw) {
  var value = raw.trim();
  if (value.isEmpty) return '';
  final parsed = Uri.tryParse(value);
  if (parsed != null && (parsed.scheme == 'http' || parsed.scheme == 'https')) {
    value = parsed.path;
    if (parsed.hasQuery) value = '$value?${parsed.query}';
  }
  const prefix = '/api/app/v1';
  if (value == prefix) return '/';
  if (value.startsWith('$prefix/')) return value.substring(prefix.length);
  return value.startsWith('/') ? value : '/$value';
}

String matrixControllerPath(String raw) {
  var value = raw.trim();
  if (value.isEmpty) return '';
  final parsed = Uri.tryParse(value);
  if (parsed != null && (parsed.scheme == 'http' || parsed.scheme == 'https')) {
    value = parsed.path;
  }
  const matrixPrefix = '/api/app/v1';
  if (value.startsWith('$matrixPrefix/controller/')) {
    return value.substring(matrixPrefix.length);
  }
  if (value.startsWith('/controller/')) return value;
  if (value.startsWith('/api/')) value = value.substring(5);
  if (value.startsWith('/')) value = value.substring(1);
  return '/controller/$value';
}

Future<dynamic> matrixJsonRequest(
  ApiClient api,
  String rawPath, {
  String method = 'GET',
  dynamic body,
  Map<String, dynamic>? query,
  bool retryAuth = true,
}) async {
  final path = matrixEndpointPath(rawPath);
  final verb = method.toUpperCase();
  if (verb == 'GET') return api.get(path, query: query, retryAuth: retryAuth);
  if (verb == 'POST') return api.post(path, body: body, retryAuth: retryAuth);
  if (verb == 'DELETE') return api.delete(path, body: body);

  Future<http.Response> send() {
    final encoded = body == null ? null : jsonEncode(body);
    if (verb == 'PATCH') {
      return http
          .patch(api.uri(path, query), headers: api.headers(), body: encoded)
          .timeout(const Duration(seconds: 30));
    }
    if (verb == 'PUT') {
      return http
          .put(api.uri(path, query), headers: api.headers(), body: encoded)
          .timeout(const Duration(seconds: 30));
    }
    throw StateError('Unsupported Matrix method: $verb');
  }

  var response = await send();
  if (response.statusCode == 401 && retryAuth && await api.refresh()) {
    response = await send();
  }
  return api.decode(response);
}

Future<dynamic> matrixMultipartRequest(
  ApiClient api,
  String rawController, {
  String method = 'POST',
  Map<String, String> fields = const {},
  Map<String, String> files = const {},
  bool retryAuth = true,
}) async {
  final path = matrixControllerPath(rawController);

  Future<http.Response> send() async {
    final request = http.MultipartRequest(method.toUpperCase(), api.uri(path));
    request.headers.addAll(api.headers(jsonBody: false));
    request.fields.addAll(fields);
    for (final entry in files.entries) {
      if (entry.key.trim().isEmpty || entry.value.trim().isEmpty) continue;
      request.files.add(await http.MultipartFile.fromPath(entry.key, entry.value));
    }
    final streamed = await request.send().timeout(const Duration(seconds: 60));
    return http.Response.fromStream(streamed);
  }

  var response = await send();
  if (response.statusCode == 401 && retryAuth && await api.refresh()) {
    response = await send();
  }
  return api.decode(response);
}
