import 'dart:async';
import 'dart:convert';
import 'dart:math';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

const rrnBase = 'https://realityradio.net';
const matrixBase = '$rrnBase/api/app/v1';
const rrnCyan = Color(0xFF22D3EE);
const rrnBlue = Color(0xFF4F7CFF);
const rrnPurple = Color(0xFFA855F7);
const rrnPink = Color(0xFFEC4899);
const rrnBg = Color(0xFF050812);
const rrnPanel = Color(0xFF0E1220);
const rrnPanel2 = Color(0xFF15192A);

ThemeData rrnTheme() => ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: rrnBg,
      colorScheme: ColorScheme.fromSeed(
        seedColor: rrnCyan,
        brightness: Brightness.dark,
        primary: rrnCyan,
        secondary: rrnPurple,
        tertiary: rrnPink,
        surface: rrnPanel,
      ),
      cardTheme: CardThemeData(
        color: rrnPanel,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(22),
          side: BorderSide(color: Colors.white.withValues(alpha: .08)),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: rrnPanel2,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
      ),
      navigationBarTheme: const NavigationBarThemeData(
        backgroundColor: Color(0xFF080B14),
        indicatorColor: Color(0x3322D3EE),
      ),
    );

String str(dynamic value, [String fallback = '']) => value == null ? fallback : '$value';
double numd(dynamic value, [double fallback = 0]) => value is num ? value.toDouble() : double.tryParse('$value') ?? fallback;
int numi(dynamic value, [int fallback = 0]) => value is num ? value.toInt() : int.tryParse('$value') ?? fallback;
bool boolish(dynamic value, [bool fallback = false]) {
  if (value is bool) return value;
  final v = '$value'.toLowerCase();
  if (['1', 'true', 'yes', 'on'].contains(v)) return true;
  if (['0', 'false', 'no', 'off'].contains(v)) return false;
  return fallback;
}

List<dynamic> listFrom(dynamic body, [List<String> keys = const []]) {
  if (body is List) return body;
  if (body is Map) {
    for (final key in keys) {
      final v = body[key];
      if (v is List) return v;
    }
    for (final key in const ['items', 'results', 'data', 'rows']) {
      final v = body[key];
      if (v is List) return v;
    }
  }
  return const [];
}

class ApiException implements Exception {
  final int status;
  final String message;
  final dynamic body;
  ApiException(this.status, this.message, [this.body]);
  @override
  String toString() => message;
}

class ApiClient extends ChangeNotifier {
  static const _storage = FlutterSecureStorage();
  String? accessToken;
  String? refreshToken;
  String? deviceId;

  Future<void> init() async {
    accessToken = await _storage.read(key: 'rrn_access_token');
    refreshToken = await _storage.read(key: 'rrn_refresh_token');
    deviceId = await _storage.read(key: 'rrn_device_id');
    if (deviceId == null) {
      deviceId = 'android-${DateTime.now().microsecondsSinceEpoch}-${Random.secure().nextInt(1 << 31)}';
      await _storage.write(key: 'rrn_device_id', value: deviceId);
    }
  }

  Map<String, String> headers({bool jsonBody = true}) => {
        'Accept': 'application/json',
        if (jsonBody) 'Content-Type': 'application/json',
        'X-RRN-App': 'android',
        'X-RRN-App-Version': '0.3.0',
        if (accessToken != null && accessToken!.isNotEmpty) 'Authorization': 'Bearer $accessToken',
      };

  Uri uri(String path, [Map<String, dynamic>? query]) {
    final raw = path.startsWith('http') ? path : '$matrixBase${path.startsWith('/') ? path : '/$path'}';
    final base = Uri.parse(raw);
    if (query == null) return base;
    return base.replace(queryParameters: {
      ...base.queryParameters,
      for (final entry in query.entries)
        if (entry.value != null) entry.key: '${entry.value}',
    });
  }

  dynamic decode(http.Response response) {
    dynamic body;
    try {
      body = response.body.isEmpty ? null : jsonDecode(response.body);
    } catch (_) {
      body = response.body;
    }
    if (response.statusCode < 200 || response.statusCode >= 300) {
      final msg = body is Map ? str(body['error'] ?? body['message'], 'Request failed.') : 'Request failed (${response.statusCode}).';
      throw ApiException(response.statusCode, msg, body);
    }
    return body;
  }

  Future<dynamic> get(String path, {Map<String, dynamic>? query, bool retryAuth = true}) async {
    var response = await http.get(uri(path, query), headers: headers()).timeout(const Duration(seconds: 18));
    if (response.statusCode == 401 && retryAuth && await refresh()) {
      response = await http.get(uri(path, query), headers: headers()).timeout(const Duration(seconds: 18));
    }
    return decode(response);
  }

  Future<dynamic> post(String path, {dynamic body, bool retryAuth = true}) async {
    var response = await http
        .post(uri(path), headers: headers(), body: jsonEncode(body ?? const {}))
        .timeout(const Duration(seconds: 20));
    if (response.statusCode == 401 && retryAuth && await refresh()) {
      response = await http
          .post(uri(path), headers: headers(), body: jsonEncode(body ?? const {}))
          .timeout(const Duration(seconds: 20));
    }
    return decode(response);
  }

  Future<dynamic> delete(String path, {dynamic body}) async {
    final response = await http
        .delete(uri(path), headers: headers(), body: body == null ? null : jsonEncode(body))
        .timeout(const Duration(seconds: 20));
    return decode(response);
  }

  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await http.post(
      uri('/auth/login'),
      headers: headers(),
      body: jsonEncode({
        'email': email.trim(),
        'password': password,
        'deviceId': deviceId,
        'deviceName': 'RRN Android',
        'platform': 'android',
        'appVersion': '0.3.0',
      }),
    ).timeout(const Duration(seconds: 20));
    final body = decode(response);
    if (body is! Map) throw ApiException(response.statusCode, 'The login response was not valid.');
    final m = Map<String, dynamic>.from(body);
    final session = m['session'] is Map ? Map<String, dynamic>.from(m['session']) : m;
    accessToken = str(session['accessToken'] ?? session['token'] ?? session['sessionToken']);
    refreshToken = str(session['refreshToken'] ?? m['refreshToken']);
    if (accessToken == null || accessToken!.isEmpty) {
      throw ApiException(500, 'The RRN app login endpoint did not return an app access token.');
    }
    await _storage.write(key: 'rrn_access_token', value: accessToken);
    if (refreshToken != null && refreshToken!.isNotEmpty) {
      await _storage.write(key: 'rrn_refresh_token', value: refreshToken);
    }
    notifyListeners();
    return m;
  }

  Future<bool> refresh() async {
    if (refreshToken == null || refreshToken!.isEmpty) return false;
    try {
      final response = await http.post(
        uri('/auth/refresh'),
        headers: headers(),
        body: jsonEncode({'refreshToken': refreshToken, 'deviceId': deviceId}),
      ).timeout(const Duration(seconds: 15));
      final body = decode(response);
      if (body is! Map) return false;
      final session = body['session'] is Map ? Map<String, dynamic>.from(body['session']) : body;
      final next = str(session['accessToken'] ?? session['token'] ?? session['sessionToken']);
      if (next.isEmpty) return false;
      accessToken = next;
      final nextRefresh = str(session['refreshToken']);
      if (nextRefresh.isNotEmpty) refreshToken = nextRefresh;
      await _storage.write(key: 'rrn_access_token', value: accessToken);
      if (refreshToken != null) await _storage.write(key: 'rrn_refresh_token', value: refreshToken);
      notifyListeners();
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<void> logout() async {
    try {
      if (accessToken != null) await post('/auth/logout', body: {'deviceId': deviceId}, retryAuth: false);
    } catch (_) {}
    accessToken = null;
    refreshToken = null;
    await _storage.delete(key: 'rrn_access_token');
    await _storage.delete(key: 'rrn_refresh_token');
    notifyListeners();
  }
}

class AccountUser {
  final String id;
  final String displayName;
  final String email;
  final String avatar;
  final List<String> roles;
  final List<String> permissions;
  final int points;

  const AccountUser({
    required this.id,
    required this.displayName,
    required this.email,
    required this.avatar,
    required this.roles,
    required this.permissions,
    required this.points,
  });

  factory AccountUser.from(dynamic raw) {
    final root = raw is Map ? Map<String, dynamic>.from(raw) : <String, dynamic>{};
    final u = root['user'] is Map ? Map<String, dynamic>.from(root['user']) : root;
    final roles = listFrom(u['roles']).map(str).where((e) => e.isNotEmpty).toList();
    final permissions = listFrom(u['permissions']).map(str).where((e) => e.isNotEmpty).toList();
    return AccountUser(
      id: str(u['id']),
      displayName: str(u['displayName'] ?? u['display_name'] ?? u['name'], 'RRN Listener'),
      email: str(u['email']),
      avatar: str(u['avatar'] ?? u['avatarUrl'] ?? u['avatar_url']),
      roles: roles,
      permissions: permissions,
      points: numi(u['points'] ?? root['points']),
    );
  }
}

class AuthController extends ChangeNotifier {
  final ApiClient api;
  AccountUser? user;
  bool busy = false;
  String? error;

  AuthController(this.api);
  bool get signedIn => user != null && api.accessToken != null;

  Future<void> restore() async {
    if (api.accessToken == null) return;
    await loadMe(silent: true);
  }

  Future<bool> loadMe({bool silent = false}) async {
    if (!silent) {
      busy = true;
      error = null;
      notifyListeners();
    }
    try {
      final body = await api.get('/auth/me');
      user = AccountUser.from(body);
      error = null;
      return true;
    } catch (e) {
      if (e is ApiException && e.status == 401) {
        await api.logout();
        user = null;
      }
      error = '$e';
      return false;
    } finally {
      busy = false;
      notifyListeners();
    }
  }

  Future<bool> login(String email, String password) async {
    busy = true;
    error = null;
    notifyListeners();
    try {
      final body = await api.login(email, password);
      user = AccountUser.from(body);
      if (user!.id.isEmpty) await loadMe(silent: true);
      return signedIn;
    } catch (e) {
      error = '$e';
      return false;
    } finally {
      busy = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    busy = true;
    notifyListeners();
    await api.logout();
    user = null;
    busy = false;
    notifyListeners();
  }
}

class Station {
  final String id;
  final String slug;
  final String name;
  final String designation;
  final String band;
  final double frequency;
  final String tagline;
  final String description;
  final String location;
  final String artwork;
  final String streamUrl;
  final String status;
  final List<String> capabilities;
  final Map<String, dynamic> raw;

  const Station({
    required this.id,
    required this.slug,
    required this.name,
    required this.designation,
    required this.band,
    required this.frequency,
    required this.tagline,
    required this.description,
    required this.location,
    required this.artwork,
    required this.streamUrl,
    required this.status,
    required this.capabilities,
    required this.raw,
  });

  factory Station.from(dynamic value) {
    final m = value is Map ? Map<String, dynamic>.from(value) : <String, dynamic>{};
    final designation = str(m['designation'] ?? m['frequencyLabel'] ?? m['displayFrequency']);
    final freqMatch = RegExp(r'(\d+(?:\.\d+)?)').firstMatch(str(m['frequency'] ?? designation));
    final bandMatch = RegExp(r'\b(PFL|RMP|TFP|PFH|ASHP)\b', caseSensitive: false).firstMatch(str(m['band'] ?? m['format'] ?? designation));
    final caps = listFrom(m['capabilities']).map(str).where((e) => e.isNotEmpty).toList();
    return Station(
      id: str(m['id'] ?? m['stationId'] ?? m['station_id']),
      slug: str(m['slug'] ?? m['stationSlug'] ?? m['station_slug']),
      name: str(m['name'] ?? m['stationName'] ?? m['station_name'], 'Unnamed station'),
      designation: designation,
      band: (bandMatch?.group(1) ?? str(m['band'] ?? m['format'], 'RMP')).toUpperCase(),
      frequency: numd(m['frequency'], double.tryParse(freqMatch?.group(1) ?? '') ?? 0),
      tagline: str(m['tagline'] ?? m['slogan']),
      description: str(m['description'] ?? m['summary']),
      location: str(m['location'] ?? m['market'] ?? m['city']),
      artwork: str(m['artwork'] ?? m['artworkUrl'] ?? m['artwork_url'] ?? m['imageUrl'] ?? m['image_url']),
      streamUrl: str(m['streamUrl'] ?? m['stream_url'] ?? m['listenUrl'] ?? m['listen_url']),
      status: str(m['status'] ?? m['streamState'] ?? m['stream_state'], 'unknown'),
      capabilities: caps,
      raw: m,
    );
  }

  bool has(String capability) => capabilities.map((e) => e.toLowerCase()).contains(capability.toLowerCase());
}

class RadioMetadata {
  final String presenter;
  final String show;
  final String artist;
  final String title;
  final String program;
  final String source;
  final String artwork;
  final bool live;

  const RadioMetadata({
    this.presenter = '',
    this.show = '',
    this.artist = '',
    this.title = '',
    this.program = '',
    this.source = '',
    this.artwork = '',
    this.live = false,
  });

  factory RadioMetadata.from(dynamic raw) {
    final root = raw is Map ? Map<String, dynamic>.from(raw) : <String, dynamic>{};
    Map<String, dynamic> m = root;
    for (final key in ['nowPlaying', 'now_playing', 'metadata', 'state']) {
      if (root[key] is Map) m = {...root, ...Map<String, dynamic>.from(root[key])};
    }
    return RadioMetadata(
      presenter: str(m['presenter'] ?? m['presenterName'] ?? m['presenter_name']),
      show: str(m['show'] ?? m['showName'] ?? m['show_name']),
      artist: str(m['artist'] ?? m['artistName'] ?? m['artist_name']),
      title: str(m['title'] ?? m['track'] ?? m['trackTitle'] ?? m['track_title']),
      program: str(m['program'] ?? m['programTitle'] ?? m['program_title']),
      source: str(m['source'] ?? m['metadataSource'] ?? m['metadata_source']),
      artwork: str(m['artwork'] ?? m['artworkUrl'] ?? m['artwork_url']),
      live: boolish(m['live'] ?? m['isLive'] ?? m['is_live']),
    );
  }
}

class Preset {
  final int slot;
  final String stationId;
  final String slug;
  final String name;
  final String band;
  final double frequency;
  const Preset(this.slot, this.stationId, this.slug, this.name, this.band, this.frequency);

  Map<String, dynamic> toJson() => {
        'slot': slot,
        'stationId': stationId,
        'slug': slug,
        'name': name,
        'band': band,
        'frequency': frequency,
      };

  factory Preset.from(dynamic raw) {
    final m = raw is Map ? Map<String, dynamic>.from(raw) : <String, dynamic>{};
    return Preset(
      numi(m['slot']),
      str(m['stationId'] ?? m['station_id']),
      str(m['slug']),
      str(m['name']),
      str(m['band'], 'RMP').toUpperCase(),
      numd(m['frequency']),
    );
  }
}

class RrnAppController extends ChangeNotifier {
  final ApiClient api = ApiClient();
  late final AuthController auth = AuthController(api);
  SharedPreferences? prefs;
  List<Station> stations = [];
  Map<String, dynamic> manifest = {};
  bool initialized = false;
  String? initWarning;

  Future<void> init() async {
    await api.init();
    prefs = await SharedPreferences.getInstance();
    await Future.wait([loadManifest(), loadStations()]);
    await auth.restore();
    initialized = true;
    notifyListeners();
  }

  Future<void> loadManifest() async {
    try {
      final body = await api.get('/manifest');
      if (body is Map) manifest = Map<String, dynamic>.from(body);
    } catch (e) {
      initWarning = 'App manifest unavailable: $e';
    }
  }

  Future<void> loadStations() async {
    try {
      final body = await api.get('/radio/directory');
      final rows = listFrom(body, const ['stations', 'directory']);
      stations = rows.map(Station.from).where((s) => s.frequency > 0).toList()
        ..sort((a, b) => a.frequency.compareTo(b.frequency));
    } catch (e) {
      initWarning = 'Station directory unavailable: $e';
    }
    if (stations.isEmpty) {
      stations = [
        Station(
          id: 'rcr',
          slug: 'reality-central-radio',
          name: 'Reality Central Radio',
          designation: '201.5 RMP',
          band: 'RMP',
          frequency: 201.5,
          tagline: 'The Realest Mix Around!',
          description: '',
          location: 'San Antonio, Texas / Global online',
          artwork: '',
          streamUrl: 'https://streaming.live365.com/a47993',
          status: 'live',
          capabilities: const ['schedule'],
          raw: const {},
        ),
      ];
    }
    notifyListeners();
  }

  List<String> get bands {
    final fromManifest = listFrom(manifest['radioBands']).map(str).where((e) => e.isNotEmpty).map((e) => e.toUpperCase()).toList();
    if (fromManifest.isNotEmpty) return fromManifest;
    return const ['PFL', 'RMP', 'TFP', 'PFH', 'ASHP'];
  }

  List<Station> stationsFor(String band) => stations.where((s) => s.band == band).toList()..sort((a, b) => a.frequency.compareTo(b.frequency));

  Future<List<Preset>> localPresets() async {
    final raw = prefs?.getString('rrn_presets_v03');
    if (raw == null) return [];
    try {
      return listFrom(jsonDecode(raw)).map(Preset.from).toList();
    } catch (_) {
      return [];
    }
  }

  Future<void> savePresetLocal(Preset preset) async {
    final current = await localPresets();
    current.removeWhere((p) => p.slot == preset.slot);
    current.add(preset);
    current.sort((a, b) => a.slot.compareTo(b.slot));
    await prefs?.setString('rrn_presets_v03', jsonEncode(current.map((e) => e.toJson()).toList()));
    if (auth.signedIn) {
      try {
        await api.post('/radio/presets', body: preset.toJson());
      } catch (_) {}
    }
    notifyListeners();
  }

  Future<void> clearPresetLocal(int slot) async {
    final current = await localPresets();
    current.removeWhere((p) => p.slot == slot);
    await prefs?.setString('rrn_presets_v03', jsonEncode(current.map((e) => e.toJson()).toList()));
    if (auth.signedIn) {
      try {
        await api.post('/radio/presets', body: {'slot': slot, 'action': 'clear'});
      } catch (_) {}
    }
    notifyListeners();
  }

  Future<int> pointsBalance() async {
    if (!auth.signedIn) return 0;
    try {
      final body = await api.get('/points');
      if (body is Map) return numi(body['balance'] ?? body['points']);
    } catch (_) {}
    return auth.user?.points ?? 0;
  }
}

class RrnScope extends InheritedNotifier<RrnAppController> {
  const RrnScope({super.key, required RrnAppController controller, required super.child}) : super(notifier: controller);
  static RrnAppController of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<RrnScope>();
    assert(scope != null, 'RrnScope missing');
    return scope!.notifier!;
  }
}

class GradientText extends StatelessWidget {
  final String text;
  final TextStyle style;
  const GradientText(this.text, {super.key, required this.style});
  @override
  Widget build(BuildContext context) => ShaderMask(
        shaderCallback: (bounds) => const LinearGradient(colors: [rrnCyan, rrnPurple, rrnPink]).createShader(bounds),
        child: Text(text, style: style.copyWith(color: Colors.white)),
      );
}

class RrnSectionHeader extends StatelessWidget {
  final String eyebrow;
  final String title;
  final String? subtitle;
  const RrnSectionHeader({super.key, required this.eyebrow, required this.title, this.subtitle});
  @override
  Widget build(BuildContext context) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(eyebrow.toUpperCase(), style: const TextStyle(color: rrnCyan, letterSpacing: 2.1, fontWeight: FontWeight.w800, fontSize: 12)),
          const SizedBox(height: 6),
          Text(title, style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w900)),
          if (subtitle != null) ...[
            const SizedBox(height: 6),
            Text(subtitle!, style: const TextStyle(color: Colors.white70, height: 1.35)),
          ],
        ],
      );
}
