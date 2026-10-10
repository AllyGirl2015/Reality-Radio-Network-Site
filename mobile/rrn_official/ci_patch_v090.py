from pathlib import Path
import re

ROOT = Path('/tmp/rrn_mobile/lib')


def read(name: str) -> str:
    return (ROOT / name).read_text()


def write(name: str, text: str) -> None:
    (ROOT / name).write_text(text)


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if old not in text:
        raise SystemExit(f'v0.9 patch failed: {label}')
    return text.replace(old, new, 1)


def regex_once(text: str, pattern: str, replacement: str, label: str) -> str:
    result, count = re.subn(pattern, replacement, text, count=1, flags=re.S)
    if count != 1:
        raise SystemExit(f'v0.9 patch failed: {label}')
    return result


# ---------------------------------------------------------------------------
# CORE API: normalize full /api/app/v1 controller paths, support multipart/form
# translation contracts, and expose one relative/absolute RRN media URL helper.
# ---------------------------------------------------------------------------
text = read('core.dart')
text = replace_once(
    text,
    "String str(dynamic value, [String fallback = '']) => value == null ? fallback : '$value';\n",
    "String str(dynamic value, [String fallback = '']) => value == null ? fallback : '$value';\n"
    "String rrnAbsoluteUrl(String value) {\n"
    "  if (value.isEmpty) return '';\n"
    "  if (value.startsWith('http://') || value.startsWith('https://')) return value;\n"
    "  return '$rrnBase${value.startsWith('/') ? value : '/$value'}';\n"
    "}\n",
    'absolute RRN URL helper',
)
text = replace_once(
    text,
    "    final raw = path.startsWith('http') ? path : '$matrixBase${path.startsWith('/') ? path : '/$path'}';\n",
    "    final raw = path.startsWith('http')\n"
    "        ? path\n"
    "        : path.startsWith('/api/app/v1/')\n"
    "            ? '$rrnBase$path'\n"
    "            : '$matrixBase${path.startsWith('/') ? path : '/$path'}';\n",
    'full app Matrix path normalization',
)
if 'Future<dynamic> postForm(' not in text:
    anchor = "  Future<dynamic> patch(String path, {dynamic body, bool retryAuth = true}) async {"
    if anchor not in text:
        raise SystemExit('v0.9 patch failed: multipart insertion anchor')
    method = r'''  Future<dynamic> postForm(
    String path, {
    Map<String, String> fields = const {},
    String method = 'POST',
    bool retryAuth = true,
  }) async {
    Future<http.Response> send() async {
      final request = http.MultipartRequest(method.toUpperCase(), uri(path));
      request.headers.addAll(headers(jsonBody: false));
      request.fields.addAll(fields);
      final streamed = await request.send().timeout(const Duration(seconds: 30));
      return http.Response.fromStream(streamed);
    }

    var response = await send();
    if (response.statusCode == 401 && retryAuth && await refresh()) {
      response = await send();
    }
    return decode(response);
  }

'''
    text = text.replace(anchor, method + anchor, 1)
write('core.dart', text)


# ---------------------------------------------------------------------------
# PLAYBACK: one canonical user volume and an external radio-volume callback.
# The player's actual state remains the source of truth for every UI surface.
# ---------------------------------------------------------------------------
text = read('playback.dart')
text = replace_once(
    text,
    "  FutureOr<void> Function(int direction)? radioSeekHandler;\n  bool get systemCanSkip => live ? radioSeekHandler != null : canSkip;\n",
    "  FutureOr<void> Function(int direction)? radioSeekHandler;\n"
    "  FutureOr<void> Function(double volume)? radioVolumeHandler;\n"
    "  double userVolume = 1.0;\n"
    "  bool get systemCanSkip => live ? radioSeekHandler != null : canSkip;\n",
    'shared user volume state',
)
text = text.replace("          volume: 1,\n          isLive: false,", "          volume: userVolume,\n          isLive: false,", 1)
volume_anchor = """  Future<void> setVolume(double value) async {
    if (_handler == null) return;
    await _handler!.setOutputVolume(value);
  }
"""
volume_replacement = r'''  void syncUserVolume(double value) {
    final next = value.clamp(0, 1).toDouble();
    if ((userVolume - next).abs() < .001) return;
    userVolume = next;
    notifyListeners();
  }

  Future<void> setSystemVolume(double value) async {
    final next = value.clamp(0, 1).toDouble();
    userVolume = next;
    notifyListeners();
    if (live && radioVolumeHandler != null) {
      await radioVolumeHandler!(next);
    } else if (_handler != null) {
      await _handler!.setOutputVolume(next);
    }
    notifyListeners();
  }

  Future<void> setVolume(double value) async {
    if (_handler == null) return;
    await _handler!.setOutputVolume(value.clamp(0, 1).toDouble());
  }
'''
text = replace_once(text, volume_anchor, volume_replacement, 'canonical system volume methods')
write('playback.dart', text)


# ---------------------------------------------------------------------------
# REALITY DIAL: station-scoped metadata, no forced auto-resume, shared state
# visuals, shared volume and background-idle polling guard.
# ---------------------------------------------------------------------------
text = read('tuner_v04.dart')
# Register playback listener and external volume bridge after persisted volume load.
text = replace_once(
    text,
    "    volume = prefs?.getDouble('dial_volume') ?? 1;\n",
    "    volume = prefs?.getDouble('dial_volume') ?? 1;\n"
    "    playback.syncUserVolume(volume);\n"
    "    playback.radioVolumeHandler = (next) async {\n"
    "      volume = next.clamp(0, 1).toDouble();\n"
    "      app!.prefs?.setDouble('dial_volume', volume);\n"
    "      playback.syncUserVolume(volume);\n"
    "      if (mounted) setState(() {});\n"
    "      await _updateAudio();\n"
    "    };\n"
    "    playback.addListener(_onPlaybackChanged);\n",
    'dial shared volume/listener registration',
)
# Insert playback observer method before dispose.
text = replace_once(
    text,
    "  @override\n  void dispose() {\n",
    "  void _onPlaybackChanged() {\n"
    "    if (mounted) setState(() {});\n"
    "  }\n\n"
    "  bool _isCurrentStation(Station? station) => station != null &&\n"
    "      playback.kind == RrnPlaybackKind.station &&\n"
    "      playback.sourceId == 'station:${_identity(station)}';\n\n"
    "  bool _isCurrentPlaying(Station? station) => _isCurrentStation(station) && playback.playing;\n\n"
    "  String _dialPlaybackLabel(Station? station) {\n"
    "    if (!powered) return 'OFF';\n"
    "    if (_isCurrentStation(station) && playback.transitioning) return 'TUNING';\n"
    "    if (_isCurrentPlaying(station)) return 'ON AIR';\n"
    "    if (_isCurrentStation(station)) return 'PAUSED';\n"
    "    return station != null && station.streamUrl.isNotEmpty ? 'TUNING' : 'NO SIGNAL';\n"
    "  }\n\n"
    "  @override\n  void dispose() {\n",
    'dial playback observer helpers',
)
text = replace_once(
    text,
    "    playback.radioSeekHandler = null;\n    tuneTimer?.cancel();\n",
    "    playback.radioSeekHandler = null;\n"
    "    playback.radioVolumeHandler = null;\n"
    "    playback.removeListener(_onPlaybackChanged);\n"
    "    tuneTimer?.cancel();\n",
    'dial listener cleanup',
)
# Stop same-source updates from undoing a pause issued elsewhere.
text = replace_once(
    text,
    """        } else {
          await playback.setVolume(volume * strength);
          if (!playback.playing) await playback.resume();
        }
""",
    """        } else {
          await playback.setVolume(volume * strength);
        }
""",
    'do not auto-resume paused shared player',
)
# Replace metadata poll with station-key contract + response validation.
text = regex_once(
    text,
    r"  Future<void> _refreshMetadata\(\) async \{.*?\n  \}\n\n  Future<void> _togglePower",
    r'''  Future<void> _refreshMetadata() async {
    final station = locked ? nearestStation : null;
    if (station == null) return;
    final lifecycle = WidgetsBinding.instance.lifecycleState;
    if (lifecycle != AppLifecycleState.resumed && !playback.playing) return;
    try {
      final stationKey = station.id.isNotEmpty ? station.id : station.slug;
      final body = await app!.api.get('/radio/state', query: {'station': stationKey});
      if (body is Map) {
        final root = Map<String, dynamic>.from(body);
        final returnedStation = root['station'] is Map ? Map<String, dynamic>.from(root['station']) : <String, dynamic>{};
        final now = root['nowPlaying'] is Map
            ? Map<String, dynamic>.from(root['nowPlaying'])
            : root['now_playing'] is Map
                ? Map<String, dynamic>.from(root['now_playing'])
                : <String, dynamic>{};
        final returned = <String>{
          str(returnedStation['id']),
          str(returnedStation['slug']),
          str(now['stationId'] ?? now['station_id']),
          str(now['stationSlug'] ?? now['station_slug']),
        }..removeWhere((value) => value.isEmpty);
        final expected = <String>{station.id, station.slug}..removeWhere((value) => value.isEmpty);
        if (returned.isNotEmpty && returned.intersection(expected).isEmpty) return;
      }
      final stillTuned = locked ? nearestStation : null;
      if (stillTuned == null || _identity(stillTuned) != _identity(station)) return;
      metadata = RadioMetadata.from(body);
      playback.updateStationMetadata(station, metadata);
      if (mounted) setState(() {});
    } catch (_) {}
  }

  Future<void> _togglePower''',
    'station-scoped radio metadata',
)
# Replace dial play/pause action with shared-player semantics.
text = regex_once(
    text,
    r"  Future<void> _togglePower\(\) async \{.*?\n  \}\n\n  void _setVolume",
    r'''  Future<void> _togglePower() async {
    final station = locked ? nearestStation : null;
    if (_isCurrentStation(station)) {
      powered = true;
      if (playback.playing) {
        await playback.pause();
      } else {
        await playback.resume();
      }
      if (mounted) setState(() {});
      return;
    }
    powered = true;
    if (!dialAudio && station != null) manualStationId = _identity(station);
    if (mounted) setState(() {});
    await _updateAudio();
  }

  void _setVolume''',
    'dial play pause uses shared controller',
)
text = replace_once(
    text,
    "    app!.prefs?.setDouble('dial_volume', volume);\n    if (mounted) setState(() {});\n",
    "    app!.prefs?.setDouble('dial_volume', volume);\n"
    "    playback.syncUserVolume(volume);\n"
    "    if (mounted) setState(() {});\n",
    'dial volume publishes shared value',
)
text = replace_once(
    text,
    "FilledButton(onPressed: _togglePower, child: Icon(powered ? Icons.pause : Icons.play_arrow, size: 28))",
    "FilledButton(onPressed: _togglePower, child: Icon(_isCurrentPlaying(station) ? Icons.pause : Icons.play_arrow, size: 28))",
    'dial play pause icon shared state',
)
text = replace_once(
    text,
    "Text(powered ? (signal ? 'ON AIR' : 'TUNING') : 'PAUSED', style: const TextStyle(color: rrnCyan, fontSize: 9, fontWeight: FontWeight.w900))",
    "Text(_dialPlaybackLabel(station), style: const TextStyle(color: rrnCyan, fontSize: 9, fontWeight: FontWeight.w900))",
    'dial status shared state',
)
write('tuner_v04.dart', text)


# ---------------------------------------------------------------------------
# MAIN SHELL: persistent audio notification, signed-in avatar, shared volume UI,
# and a deterministic More menu with functional native/external destinations.
# ---------------------------------------------------------------------------
text = read('main.dart')
# New imports.
text = replace_once(
    text,
    "import 'charts.dart';\nimport 'core.dart';\n",
    "import 'charts.dart';\nimport 'core.dart';\nimport 'external_links.dart';\n",
    'main external links import',
)
text = replace_once(
    text,
    "import 'points.dart';\nimport 'site.dart';\n",
    "import 'points.dart';\nimport 'site.dart';\nimport 'store_native.dart';\n",
    'main native store import',
)
text = text.replace('androidNotificationOngoing: false,', 'androidNotificationOngoing: true,', 1)
# Account avatar in top right.
text = regex_once(
    text,
    r"builder: \(_, __\) => CircleAvatar\(\s*radius: 16,\s*backgroundColor: app\.auth\.signedIn \? const Color\(0xFF123E46\) : rrnPanel2,\s*child: Icon\(app\.auth\.signedIn \? Icons\.person : Icons\.login, size: 18, color: rrnCyan\),\s*\),",
    r'''builder: (_, __) {
                final user = app.auth.user;
                final avatar = rrnAbsoluteUrl(user?.avatar ?? '');
                return CircleAvatar(
                  radius: 16,
                  backgroundColor: app.auth.signedIn ? const Color(0xFF123E46) : rrnPanel2,
                  backgroundImage: app.auth.signedIn && avatar.isNotEmpty ? NetworkImage(avatar) : null,
                  child: !app.auth.signedIn || avatar.isEmpty
                      ? Icon(app.auth.signedIn ? Icons.person : Icons.login, size: 18, color: rrnCyan)
                      : null,
                );
              },''',
    'top account avatar',
)
# Mini-player volume sheet helper.
text = replace_once(
    text,
    "  @override\n  Widget build(BuildContext context) {\n    final playback = RrnPlaybackController.instance;\n",
    r'''  void _showVolume(BuildContext context, RrnPlaybackController playback) {
    showModalBottomSheet<void>(
      context: context,
      showDragHandle: true,
      builder: (_) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(18, 0, 18, 22),
          child: AnimatedBuilder(
            animation: playback,
            builder: (context, __) => Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('RRN Player Volume', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900)),
                const SizedBox(height: 6),
                Text('${(playback.userVolume * 100).round()}%', style: const TextStyle(color: rrnCyan, fontWeight: FontWeight.w900)),
                Slider(
                  value: playback.userVolume,
                  onChanged: (value) {
                    playback.setSystemVolume(value);
                  },
                ),
                const Text('This is the same volume used by the Reality Dial and Android media session.', style: TextStyle(color: Colors.white54, fontSize: 11)),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final playback = RrnPlaybackController.instance;
''',
    'mini player volume sheet',
)
# Add volume control before close player.
text = replace_once(
    text,
    """            _control(
              onPressed: playback.stop,
              icon: Icons.close,
              tooltip: 'Close player',
              color: Colors.white60,
            ),
""",
    """            _control(
              onPressed: () => _showVolume(context, playback),
              icon: Icons.volume_up,
              tooltip: 'RRN player volume',
              color: Colors.white70,
            ),
            _control(
              onPressed: playback.stop,
              icon: Icons.close,
              tooltip: 'Close player',
              color: Colors.white60,
            ),
""",
    'mini player volume button',
)
# Stable explicit More menu rather than manifest entries that map to dead pages.
text = regex_once(
    text,
    r"    final manifestNav = listFrom\(app\.manifest\['navigation'\] \?\? app\.manifest\['modules'\]\);\n    final modules = manifestNav\.isNotEmpty \? manifestNav : _fallbackModules;",
    "    final modules = _fallbackModules;",
    'deterministic More modules',
)
# Replace onTap for generated module cards with central router.
text = regex_once(
    text,
    r"              onTap: \(\) => Navigator\.push\(\s*context,\s*MaterialPageRoute\(\s*builder: \(_\) => path == '/store'.*?\),\s*\),",
    "              onTap: () => _openMore(context, path, title),",
    'More module router',
)
# Replace fallback list.
text = regex_once(
    text,
    r"  static const _fallbackModules = \[.*?\n  \];",
    r'''  static const _fallbackModules = [
    {'title': 'Website', 'path': 'https://realityradio.net'},
    {'title': 'Discord', 'path': 'https://discord.realityradio.net'},
    {'title': 'Shows & Backlogs', 'path': '/shows'},
    {'title': 'Presenters', 'path': '/presenters'},
    {'title': 'Artists', 'path': '/artists'},
    {'title': 'RRN Store', 'path': '/store'},
    {'title': 'Events', 'path': '/events'},
    {'title': 'Support', 'path': '/support'},
    {'title': 'Submissions', 'path': '/submissions'},
    {'title': 'About RRN', 'path': '/about'},
    {'title': 'Terms', 'path': '/terms'},
  ];''',
    'More fallback destinations',
)
# Add router before module icon.
text = replace_once(
    text,
    "  IconData _moduleIcon(String path) {\n",
    r'''  void _openMore(BuildContext context, String path, String title) {
    if (path.startsWith('http')) {
      openExternalUrl(context, path);
      return;
    }
    Widget screen;
    switch (path) {
      case '/shows':
        screen = const MatrixEndpointScreen(endpoint: '/shows', title: 'Shows & Backlogs');
        break;
      case '/presenters':
        screen = const MatrixEndpointScreen(endpoint: '/presenters', title: 'Presenters');
        break;
      case '/artists':
        screen = const MatrixEndpointScreen(endpoint: '/artists', title: 'Artists');
        break;
      case '/store':
        screen = const RrnStoreScreen();
        break;
      case '/events':
        screen = const MatrixEndpointScreen(endpoint: '/events', title: 'Events');
        break;
      case '/support':
        screen = const MatrixEndpointScreen(endpoint: '/support', title: 'Support');
        break;
      default:
        screen = MatrixPageScreen(path: path, title: title);
    }
    Navigator.push(context, MaterialPageRoute(builder: (_) => screen));
  }

  IconData _moduleIcon(String path) {
''',
    'More central router method',
)
# Distinct Discord icon.
text = replace_once(
    text,
    "  IconData _moduleIcon(String path) {\n    if (path.contains('show')) return Icons.podcasts;\n",
    "  IconData _moduleIcon(String path) {\n"
    "    if (path.contains('discord')) return Icons.forum;\n"
    "    if (path.startsWith('http')) return Icons.language;\n"
    "    if (path.contains('show')) return Icons.podcasts;\n",
    'More external icons',
)
write('main.dart', text)


# ---------------------------------------------------------------------------
# FEED: real native composer now talks to posting-identities + multipart publish.
# ---------------------------------------------------------------------------
text = read('social.dart')
text = replace_once(
    text,
    "import 'core.dart';\n",
    "import 'core.dart';\nimport 'feed_composer.dart';\n",
    'Feed composer import',
)
text = text.replace(
    "const MatrixPageScreen(path: '/feed/new', title: 'Create Post')",
    "const RrnFeedComposerScreen()",
    1,
)
write('social.dart', text)


# ---------------------------------------------------------------------------
# STORE entry points: use the dedicated native catalog and deliberate secure
# external checkout rather than a read-only generic Matrix collection.
# ---------------------------------------------------------------------------
text = read('music_v04.dart')
if "import 'store_native.dart';" not in text:
    text = text.replace("import 'site.dart';\n", "import 'site.dart';\nimport 'store_native.dart';\n", 1)
text = text.replace(
    "const MatrixEndpointScreen(endpoint: '/store', title: 'RRN Store')",
    "const RrnStoreScreen()",
    1,
)
write('music_v04.dart', text)


# ---------------------------------------------------------------------------
# POINTS: Square secure card tokenization is an intentional external boundary.
# Make purchase possible instead of routing into a translated dead page.
# ---------------------------------------------------------------------------
text = read('points.dart')
if "import 'external_links.dart';" not in text:
    text = text.replace("import 'core.dart';\n", "import 'core.dart';\nimport 'external_links.dart';\n", 1)
text = re.sub(
    r"onPressed: \(\) => Navigator\.push\(context, MaterialPageRoute\(builder: \(_\) => const MatrixPageScreen\(path: '/points', title: 'RRN Points'\)\)\),\s*icon: const Icon\(Icons\.add_card\),\s*label: const Text\('Buy / use points'\),",
    "onPressed: () => openExternalUrl(context, '$rrnBase/account/points'),\n                      icon: const Icon(Icons.add_card),\n                      label: const Text('Buy RRN Points'),",
    text,
    count=1,
    flags=re.S,
)
write('points.dart', text)


# ---------------------------------------------------------------------------
# ACCOUNT: route high-use account resources to their dedicated Matrix endpoints,
# library/messages to real native screens, and fix relative avatar rendering.
# ---------------------------------------------------------------------------
text = read('account.dart')
imports = "import 'core.dart';\n"
replacement_imports = "import 'core.dart';\nimport 'inbox.dart';\nimport 'music_v04.dart';\nimport 'native_endpoint.dart';\n"
text = replace_once(text, imports, replacement_imports, 'account native imports')
text = replace_once(
    text,
    "                backgroundImage: u.avatar.startsWith('http') ? NetworkImage(u.avatar) : null,\n                child: u.avatar.isEmpty ? const Icon(Icons.person, size: 36, color: rrnCyan) : null,\n",
    "                backgroundImage: rrnAbsoluteUrl(u.avatar).isNotEmpty ? NetworkImage(rrnAbsoluteUrl(u.avatar)) : null,\n"
    "                child: u.avatar.isEmpty ? const Icon(Icons.person, size: 36, color: rrnCyan) : null,\n",
    'account relative profile avatar',
)
# Replace tile implementation with routed destinations.
text = regex_once(
    text,
    r"  Widget _tile\(String title, IconData icon, String path\) => Card\(.*?\n      \);\n\}",
    r'''  Widget _tile(String title, IconData icon, String path) => Card(
        child: ListTile(
          leading: Icon(icon, color: rrnCyan),
          title: Text(title),
          trailing: const Icon(Icons.chevron_right),
          onTap: () => _openDestination(title, path),
        ),
      );

  void _openDestination(String title, String path) {
    Widget screen;
    switch (path) {
      case '/account/library':
        screen = const MusicLibraryScreen();
        break;
      case '/account/orders':
        screen = const MatrixEndpointScreen(endpoint: '/account/orders', title: 'Orders & Purchases');
        break;
      case '/account/social':
        screen = const MessagesScreen();
        break;
      case '/account/stations':
        screen = const MatrixEndpointScreen(endpoint: '/account/stations', title: 'My Stations');
        break;
      case '/account/presenter':
        screen = const MatrixEndpointScreen(endpoint: '/account/presenter', title: 'Presenter');
        break;
      case '/account/creator':
        screen = const MatrixEndpointScreen(endpoint: '/account/creator', title: 'Creator Catalog');
        break;
      case '/account/labels':
        screen = const MatrixEndpointScreen(endpoint: '/account/labels', title: 'Labels');
        break;
      case '/account/services':
        screen = const MatrixEndpointScreen(endpoint: '/account/services', title: 'Services');
        break;
      case '/account/applications':
        screen = const MatrixEndpointScreen(endpoint: '/account/applications', title: 'Applications');
        break;
      case '/account/reports':
        screen = const MatrixEndpointScreen(endpoint: '/support', title: 'Reports & Support');
        break;
      default:
        screen = MatrixPageScreen(path: path, title: title);
    }
    Navigator.push(context, MaterialPageRoute(builder: (_) => screen)).then((_) => RrnScope.of(context).auth.loadMe(silent: true));
  }
}
''',
    'account destination router',
)
write('account.dart', text)


# ---------------------------------------------------------------------------
# NOTIFICATIONS: replace translated preference page with a real native settings
# surface and keep idle inbox polling from waking the app in background.
# ---------------------------------------------------------------------------
text = read('inbox.dart')
text = replace_once(
    text,
    "import 'core.dart';\nimport 'site.dart';\n",
    "import 'core.dart';\nimport 'notification_preferences.dart';\nimport 'site.dart';\n",
    'native notification preferences import',
)
text = replace_once(
    text,
    "  Future<void> _refresh() async {\n    final app = RrnScope.of(context);\n",
    "  Future<void> _refresh() async {\n"
    "    if (WidgetsBinding.instance.lifecycleState != AppLifecycleState.resumed) return;\n"
    "    final app = RrnScope.of(context);\n",
    'inbox background polling guard',
)
text = regex_once(
    text,
    r"class PushNotificationSettingsScreen extends StatelessWidget \{.*?\n\}\n\nWidget _errorCard",
    r'''class PushNotificationSettingsScreen extends StatelessWidget {
  const PushNotificationSettingsScreen({super.key});

  @override
  Widget build(BuildContext context) => const RrnNotificationPreferencesScreen();
}

Widget _errorCard''',
    'native notification preferences screen',
)
write('inbox.dart', text)


# ---------------------------------------------------------------------------
# NATIVE ENDPOINT generic renderer: expose nested list resources such as account
# creator/presenter payloads instead of dumping them as map.toString().
# ---------------------------------------------------------------------------
text = read('native_endpoint.dart')
text = replace_once(
    text,
    "      final items = listFrom(map, const ['items', 'products', 'results', 'entries']);\n      if (items.isNotEmpty) return _collection(items, map);\n      return _mapCard(map);\n",
    "      final items = listFrom(map, const ['items', 'products', 'results', 'entries']);\n"
    "      if (items.isNotEmpty) return _collection(items, map);\n"
    "      final sections = <MapEntry<String, List<dynamic>>>[];\n"
    "      for (final entry in map.entries) {\n"
    "        if (entry.value is List && (entry.value as List).isNotEmpty) {\n"
    "          sections.add(MapEntry(entry.key, List<dynamic>.from(entry.value as List)));\n"
    "        }\n"
    "      }\n"
    "      if (sections.isNotEmpty) return _sectionedCollections(sections, map);\n"
    "      return _mapCard(map);\n",
    'nested Matrix endpoint sections',
)
insert = r'''  Widget _sectionedCollections(List<MapEntry<String, List<dynamic>>> sections, Map<String, dynamic> envelope) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(14, 16, 14, 100),
      children: [
        RrnSectionHeader(
          eyebrow: 'Native Matrix',
          title: str(envelope['title'] ?? envelope['name'], widget.title),
          subtitle: str(envelope['summary'] ?? envelope['description']).isEmpty
              ? 'Loaded directly from ${widget.endpoint}.'
              : str(envelope['summary'] ?? envelope['description']),
        ),
        const SizedBox(height: 12),
        for (final section in sections) ...[
          Text(section.key.replaceAll('_', ' ').toUpperCase(), style: const TextStyle(color: rrnCyan, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1.3)),
          const SizedBox(height: 5),
          ...section.value.map((raw) {
            final item = raw is Map ? Map<String, dynamic>.from(raw) : <String, dynamic>{'title': '$raw'};
            final title = str(item['title'] ?? item['name'] ?? item['displayName'] ?? item['display_name'] ?? item['label'], 'RRN');
            final subtitle = [
              str(item['subtitle'] ?? item['description'] ?? item['summary']),
              str(item['status']),
              str(item['designation']),
            ].where((value) => value.isNotEmpty).join(' · ');
            return Card(
              child: ListTile(
                title: Text(title, style: const TextStyle(fontWeight: FontWeight.w900)),
                subtitle: subtitle.isEmpty ? null : Text(subtitle, maxLines: 3, overflow: TextOverflow.ellipsis),
                trailing: item['action'] != null ? MatrixActionButton(action: item['action'], compact: true) : null,
              ),
            );
          }),
          const SizedBox(height: 12),
        ],
      ],
    );
  }

'''
text = replace_once(text, "  Widget _mapCard(Map<String, dynamic> map) => ListView(\n", insert + "  Widget _mapCard(Map<String, dynamic> map) => ListView(\n", 'sectioned endpoint method')
write('native_endpoint.dart', text)


# ---------------------------------------------------------------------------
# SAFE PAGE TRANSLATOR: render 061i/061j list_item, root links and root forms;
# submit forms to their exact controller route instead of nonexistent /action/id.
# ---------------------------------------------------------------------------
text = read('site.dart')
if "import 'external_links.dart';" not in text:
    text = text.replace("import 'core.dart';\n", "import 'core.dart';\nimport 'external_links.dart';\n", 1)
text = replace_once(
    text,
    "    final actions = listFrom(page['actions']);\n",
    "    final actions = listFrom(page['actions']);\n"
    "    final links = listFrom(page['links']);\n"
    "    final forms = listFrom(page['forms']);\n",
    'page root links/forms',
)
text = replace_once(
    text,
    "        ...blocks.map((b) => MatrixBlockRenderer(block: b)),\n        if (actions.isNotEmpty) ...[\n",
    "        ...blocks.map((b) => MatrixBlockRenderer(block: b)),\n"
    "        if (links.isNotEmpty) ...[\n"
    "          const SizedBox(height: 8),\n"
    "          ...links.map((link) => MatrixTranslatedLinkButton(link: link)),\n"
    "        ],\n"
    "        if (forms.isNotEmpty) ...[\n"
    "          const SizedBox(height: 8),\n"
    "          ...forms.map((form) => MatrixFormRenderer(block: form is Map ? Map<String, dynamic>.from(form) : <String, dynamic>{})),\n"
    "        ],\n"
    "        if (actions.isNotEmpty) ...[\n",
    'render page root links/forms',
)
text = replace_once(
    text,
    "        'text' || 'rich_text' => _text(m),\n",
    "        'text' || 'rich_text' => _text(m),\n        'list_item' => _listItem(m),\n",
    'list item block type',
)
text = replace_once(
    text,
    "  Widget _text(Map<String, dynamic> m) => SelectableText(str(m['body'] ?? m['text'] ?? m['content']), style: const TextStyle(height: 1.45));\n",
    "  Widget _text(Map<String, dynamic> m) => SelectableText(str(m['body'] ?? m['text'] ?? m['content']), style: const TextStyle(height: 1.45));\n\n"
    "  Widget _listItem(Map<String, dynamic> m) => Padding(\n"
    "        padding: const EdgeInsets.only(left: 8, bottom: 4),\n"
    "        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [\n"
    "          const Text('•  ', style: TextStyle(color: rrnCyan, fontWeight: FontWeight.w900)),\n"
    "          Expanded(child: Text(str(m['text'] ?? m['body']), style: const TextStyle(height: 1.4))),\n"
    "        ]),\n"
    "      );\n",
    'list item renderer',
)
# Insert translated link widget before MatrixActionButton.
link_class = r'''class MatrixTranslatedLinkButton extends StatelessWidget {
  final dynamic link;
  const MatrixTranslatedLinkButton({super.key, required this.link});

  @override
  Widget build(BuildContext context) {
    final m = link is Map ? Map<String, dynamic>.from(link) : <String, dynamic>{};
    final label = str(m['label'] ?? m['title'], 'Open');
    final webUrl = str(m['webUrl'] ?? m['web_url'] ?? m['href']);
    return Card(
      child: ListTile(
        leading: const Icon(Icons.link, color: rrnCyan),
        title: Text(label, style: const TextStyle(fontWeight: FontWeight.w800)),
        trailing: const Icon(Icons.chevron_right),
        onTap: webUrl.isEmpty
            ? null
            : () {
                if (webUrl.startsWith('http')) {
                  final uri = Uri.tryParse(webUrl);
                  if (uri != null && uri.host == 'realityradio.net') {
                    Navigator.push(context, MaterialPageRoute(builder: (_) => MatrixPageScreen(path: '${uri.path}${uri.hasQuery ? '?${uri.query}' : ''}', title: label)));
                  } else {
                    openExternalUrl(context, webUrl);
                  }
                } else {
                  Navigator.push(context, MaterialPageRoute(builder: (_) => MatrixPageScreen(path: webUrl, title: label)));
                }
              },
      ),
    );
  }
}

'''
text = replace_once(text, "class MatrixActionButton extends StatefulWidget {\n", link_class + "class MatrixActionButton extends StatefulWidget {\n", 'translated page link class')
# Replace action runner so it no longer invents /action/{id}.
text = regex_once(
    text,
    r"  Future<void> _run\(Map<String, dynamic> a\) async \{.*?\n  \}\n\}\n\nclass MatrixFormRenderer",
    r'''  Future<void> _run(Map<String, dynamic> a) async {
    final endpoint = str(a['endpoint'] ?? a['controller']);
    final path = str(a['path'] ?? a['href'] ?? a['webUrl'] ?? a['web_url']);
    if (endpoint.isEmpty && path.isNotEmpty) {
      if (path.startsWith('http')) {
        await openExternalUrl(context, path);
      } else {
        await Navigator.push(context, MaterialPageRoute(builder: (_) => MatrixPageScreen(path: path, title: str(a['label'] ?? a['title'], 'RRN'))));
      }
      return;
    }
    if (endpoint.isEmpty) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('This translated action did not provide an executable endpoint.')));
      return;
    }
    setState(() => busy = true);
    try {
      final method = str(a['method'], 'POST').toUpperCase();
      final payload = a['payload'] ?? const <String, dynamic>{};
      final api = RrnScope.of(context).api;
      final body = method == 'GET'
          ? await api.get(endpoint)
          : method == 'PATCH'
              ? await api.patch(endpoint, body: payload)
              : method == 'DELETE'
                  ? await api.delete(endpoint, body: payload)
                  : await api.post(endpoint, body: payload);
      if (mounted) {
        final msg = body is Map ? str(body['message'], 'Action completed.') : 'Action completed.';
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }
}

class MatrixFormRenderer''',
    'translated action endpoint execution',
)
# Form inputs: hidden/file/checkbox values.
text = replace_once(
    text,
    "              final label = str(f['label'] ?? name);\n              if (type == 'boolean' || type == 'checkbox') {\n",
    "              final label = str(f['label'] ?? name);\n"
    "              if (type == 'hidden') {\n"
    "                values.putIfAbsent(name, () => str(f['value']));\n"
    "                return const SizedBox.shrink();\n"
    "              }\n"
    "              if (type == 'file') {\n"
    "                return Padding(\n"
    "                  padding: const EdgeInsets.only(bottom: 10),\n"
    "                  child: ListTile(\n"
    "                    contentPadding: EdgeInsets.zero,\n"
    "                    leading: const Icon(Icons.upload_file, color: rrnPurple),\n"
    "                    title: Text(label),\n"
    "                    subtitle: const Text('File uploads use a dedicated native uploader when available.'),\n"
    "                  ),\n"
    "                );\n"
    "              }\n"
    "              if (type == 'boolean' || type == 'checkbox') {\n",
    'translated form hidden/file fields',
)
# Replace form submit endpoint handling.
text = regex_once(
    text,
    r"  Future<void> _submit\(\) async \{.*?\n  \}\n\}\n\nclass MatrixObjectScreen",
    r'''  Future<void> _submit() async {
    final controller = str(widget.block['controller']);
    final method = str(widget.block['method'], 'POST').toUpperCase();
    if (controller.isEmpty) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('This translated form has no native controller.')));
      return;
    }
    final fields = <String, String>{};
    for (final entry in values.entries) {
      final value = entry.value;
      if (value is bool) {
        if (value) fields[entry.key] = 'on';
      } else if (value != null) {
        fields[entry.key] = '$value';
      }
    }
    for (final raw in listFrom(widget.block['fields'])) {
      if (raw is! Map) continue;
      final field = Map<String, dynamic>.from(raw);
      final name = str(field['name'] ?? field['id']);
      if (name.isEmpty || fields.containsKey(name)) continue;
      final type = str(field['type'], 'text').toLowerCase();
      if (type == 'hidden' && str(field['value']).isNotEmpty) fields[name] = str(field['value']);
    }
    setState(() => busy = true);
    try {
      final body = await RrnScope.of(context).api.postForm(controller, fields: fields, method: method);
      if (mounted) {
        final message = body is Map ? str(body['message'], 'Saved.') : 'Saved.';
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }
}

class MatrixObjectScreen''',
    'translated form controller execution',
)
write('site.dart', text)
