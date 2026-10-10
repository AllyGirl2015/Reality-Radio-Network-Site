from pathlib import Path
import re

ROOT = Path('/tmp/rrn_mobile/lib')


def read(name):
    return (ROOT / name).read_text()


def write(name, text):
    (ROOT / name).write_text(text)


def replace_once(text, old, new, label):
    if old not in text:
        raise SystemExit(f'v0.8.1 patch failed: {label}')
    return text.replace(old, new, 1)


def regex_once(text, pattern, replacement, label):
    out, n = re.subn(pattern, replacement, text, count=1, flags=re.S)
    if n != 1:
        raise SystemExit(f'v0.8.1 patch failed: {label}')
    return out


# ---------------------------------------------------------------------------
# CORE: absolute user images. The account API may return a site-relative avatar,
# which previously made both Account and the top-right profile chip render blank.
# ---------------------------------------------------------------------------
text = read('core.dart')
if 'String rrnAbsoluteUrl(' not in text:
    text = replace_once(
        text,
        "String str(dynamic value, [String fallback = '']) => value == null ? fallback : '$value';\n",
        "String str(dynamic value, [String fallback = '']) => value == null ? fallback : '$value';\nString rrnAbsoluteUrl(dynamic value) {\n  final raw = str(value).trim();\n  if (raw.isEmpty) return '';\n  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;\n  return '$rrnBase${raw.startsWith('/') ? raw : '/$raw'}';\n}\n",
        'absolute URL helper',
    )
text = text.replace(
    "avatar: str(u['avatar'] ?? u['avatarUrl'] ?? u['avatar_url']),",
    "avatar: rrnAbsoluteUrl(u['avatar'] ?? u['avatarUrl'] ?? u['avatar_url'] ?? u['profileImage'] ?? u['profile_image']),",
    1,
)
write('core.dart', text)


# ---------------------------------------------------------------------------
# PLAYBACK: one state authority for Dial, mini player, native notification and
# lock screen. Prefer ICY metadata coming from the stream actually being played;
# server metadata can still enrich presenter/show/artwork without replacing a
# direct stream title with metadata from another station.
# ---------------------------------------------------------------------------
text = read('playback.dart')
text = replace_once(
    text,
    "  StreamSubscription<PlaybackState>? _stateSub;\n",
    "  StreamSubscription<PlaybackState>? _stateSub;\n  StreamSubscription<IcyMetadata?>? _icySub;\n  Station? _activeStation;\n",
    'playback ICY subscriptions',
)
text = replace_once(
    text,
    "  bool live = false;\n  Map<String, dynamic> raw = const {};\n",
    "  bool live = false;\n  double outputVolume = 1;\n  RadioMetadata stationMetadata = const RadioMetadata();\n  Map<String, dynamic> raw = const {};\n",
    'shared volume and station metadata state',
)
text = replace_once(
    text,
    "    _stateSub = handler.playbackState.listen((state) {\n      queueIndex = state.queueIndex ?? 0;\n      repeatMode = state.repeatMode;\n      shuffleMode = state.shuffleMode;\n      notifyListeners();\n    });\n",
    "    _stateSub = handler.playbackState.listen((state) {\n      queueIndex = state.queueIndex ?? 0;\n      repeatMode = state.repeatMode;\n      shuffleMode = state.shuffleMode;\n      notifyListeners();\n    });\n    _icySub = player.icyMetadataStream.listen(_applyIcyMetadata);\n",
    'listen to source-specific ICY metadata',
)
insert = r'''
  bool isActiveStation(Station? station) {
    if (station == null || kind != RrnPlaybackKind.station) return false;
    return sourceId == 'station:${_stationIdentity(station)}';
  }

  void _applyIcyMetadata(IcyMetadata? icy) {
    final station = _activeStation;
    if (station == null || kind != RrnPlaybackKind.station || !isActiveStation(station)) return;
    final rawTitle = icy?.info?.title?.trim() ?? '';
    if (rawTitle.isEmpty) return;
    var artist = '';
    var track = rawTitle;
    final split = rawTitle.indexOf(' - ');
    if (split > 0 && split < rawTitle.length - 3) {
      artist = rawTitle.substring(0, split).trim();
      track = rawTitle.substring(split + 3).trim();
    }
    final direct = RadioMetadata(
      presenter: stationMetadata.presenter,
      show: stationMetadata.show,
      artist: artist,
      title: track,
      program: stationMetadata.program,
      source: 'icy',
      artwork: stationMetadata.artwork,
      live: true,
    );
    stationMetadata = direct;
    final media = _stationMediaItem(station, direct);
    title = station.name;
    subtitle = _stationSubtitle(station, direct);
    album = media.album ?? '';
    artwork = media.artUri?.toString() ?? artwork;
    _handler?.updateNowPlaying(media);
    notifyListeners();
  }
'''
text = replace_once(
    text,
    "  String _stationIdentity(Station station) => station.id.isNotEmpty\n",
    insert + "\n  String _stationIdentity(Station station) => station.id.isNotEmpty\n",
    'active station and ICY helper',
)
text = replace_once(
    text,
    "      final media = _stationMediaItem(station, metadata);\n      kind = RrnPlaybackKind.station;\n",
    "      _activeStation = station;\n      stationMetadata = metadata ?? const RadioMetadata();\n      outputVolume = volume.clamp(0, 1).toDouble();\n      final media = _stationMediaItem(station, stationMetadata);\n      kind = RrnPlaybackKind.station;\n",
    'station state initialization',
)
text = text.replace(
    "      subtitle = _stationSubtitle(station, metadata);",
    "      subtitle = _stationSubtitle(station, stationMetadata);",
    1,
)
text = replace_once(
    text,
    "      kind = RrnPlaybackKind.music;\n      title = media.title;\n",
    "      _activeStation = null;\n      stationMetadata = const RadioMetadata();\n      outputVolume = 1;\n      kind = RrnPlaybackKind.music;\n      title = media.title;\n",
    'clear station metadata for music',
)
text = regex_once(
    text,
    r"  void updateStationMetadata\(Station station, RadioMetadata metadata\) \{.*?\n  \}\n\n  Future<void> pause",
    r'''  void updateStationMetadata(Station station, RadioMetadata metadata) {
    final expected = 'station:${_stationIdentity(station)}';
    if (kind != RrnPlaybackKind.station || sourceId != expected) return;
    _activeStation = station;
    final direct = stationMetadata.source.toLowerCase() == 'icy' && stationMetadata.title.isNotEmpty;
    stationMetadata = RadioMetadata(
      presenter: metadata.presenter.isNotEmpty ? metadata.presenter : stationMetadata.presenter,
      show: metadata.show.isNotEmpty ? metadata.show : stationMetadata.show,
      artist: direct ? stationMetadata.artist : metadata.artist,
      title: direct ? stationMetadata.title : metadata.title,
      program: metadata.program.isNotEmpty ? metadata.program : stationMetadata.program,
      source: direct ? 'icy' : metadata.source,
      artwork: metadata.artwork.isNotEmpty ? metadata.artwork : stationMetadata.artwork,
      live: true,
    );
    final media = _stationMediaItem(station, stationMetadata);
    title = station.name;
    subtitle = _stationSubtitle(station, stationMetadata);
    album = media.album ?? '';
    artwork = media.artUri?.toString() ?? '';
    _handler?.updateNowPlaying(media);
    notifyListeners();
  }

  Future<void> pause''',
    'merge stream metadata with station state',
)
text = replace_once(
    text,
    "  Future<void> setVolume(double value) async {\n    if (_handler == null) return;\n    await _handler!.setOutputVolume(value);\n  }\n",
    "  Future<void> setVolume(double value) async {\n    if (_handler == null) return;\n    outputVolume = value.clamp(0, 1).toDouble();\n    await _handler!.setOutputVolume(outputVolume);\n    notifyListeners();\n  }\n",
    'shared volume state',
)
text = replace_once(
    text,
    "    live = false;\n    raw = const {};\n",
    "    live = false;\n    outputVolume = 1;\n    stationMetadata = const RadioMetadata();\n    _activeStation = null;\n    raw = const {};\n",
    'clear shared station state',
)
write('playback.dart', text)


# ---------------------------------------------------------------------------
# SYSTEM MEDIA: publish/receive app volume. Standard Android lock-screen cards do
# not permit an arbitrary app slider, so Android gets volume-step controls tied
# to the same RRN tuner/player volume state.
# ---------------------------------------------------------------------------
text = read('system_media.dart')
text = replace_once(
    text,
    "      case 'seekTo':\n",
    "      case 'volumeUp':\n        await playback.setVolume((playback.outputVolume + .10).clamp(0.0, 1.0));\n        break;\n      case 'volumeDown':\n        await playback.setVolume((playback.outputVolume - .10).clamp(0.0, 1.0));\n        break;\n      case 'setVolume':\n        final value = call.arguments;\n        final next = value is num\n            ? value.toDouble()\n            : value is Map && value['volume'] is num\n                ? (value['volume'] as num).toDouble()\n                : playback.outputVolume;\n        await playback.setVolume(next.clamp(0.0, 1.0));\n        break;\n      case 'seekTo':\n",
    'native volume commands',
)
text = replace_once(
    text,
    "      'sourceId': playback.sourceId,\n",
    "      'sourceId': playback.sourceId,\n      'volume': playback.outputVolume,\n",
    'publish player volume',
)
text = replace_once(
    text,
    "      payload['durationMs'],\n",
    "      payload['durationMs'],\n      payload['volume'],\n",
    'volume signature',
)
write('system_media.dart', text)


# ---------------------------------------------------------------------------
# REALITY DIAL: synchronize power/play visuals and function with the one shared
# player, suspend metadata polling while the UI is backgrounded, and display the
# stream-bound metadata owned by RrnPlaybackController.
# ---------------------------------------------------------------------------
text = read('tuner_v04.dart')
text = text.replace(
    'class _RealityDialV04ScreenState extends State<RealityDialV04Screen> {',
    'class _RealityDialV04ScreenState extends State<RealityDialV04Screen> with WidgetsBindingObserver {',
    1,
)
text = replace_once(
    text,
    "  @override\n  void didChangeDependencies() {\n",
    "  @override\n  void initState() {\n    super.initState();\n    WidgetsBinding.instance.addObserver(this);\n  }\n\n  @override\n  void didChangeDependencies() {\n",
    'dial lifecycle observer',
)
text = replace_once(
    text,
    "    playback.radioSeekHandler = (direction) {\n",
    "    playback.addListener(_syncPlaybackState);\n    playback.radioSeekHandler = (direction) {\n",
    'dial shared playback listener',
)
text = replace_once(
    text,
    "  @override\n  void dispose() {\n",
    "  void _syncPlaybackState() {\n    final station = locked ? nearestStation : null;\n    if (station != null && playback.isActiveStation(station)) {\n      final next = playback.playing || playback.transitioning;\n      if (powered != next) {\n        powered = next;\n        if (mounted) setState(() {});\n      }\n    } else if (playback.kind != RrnPlaybackKind.station && powered) {\n      powered = false;\n      if (mounted) setState(() {});\n    }\n  }\n\n  @override\n  void didChangeAppLifecycleState(AppLifecycleState state) {\n    if (state == AppLifecycleState.paused || state == AppLifecycleState.inactive || state == AppLifecycleState.detached) {\n      metadataTimer?.cancel();\n      metadataTimer = null;\n      if (staticPlayer.playing) unawaited(staticPlayer.pause());\n      return;\n    }\n    if (state == AppLifecycleState.resumed) {\n      metadataTimer ??= Timer.periodic(const Duration(seconds: 12), (_) => _refreshMetadata());\n      if (powered) {\n        unawaited(_refreshMetadata());\n        unawaited(_updateAudio());\n      }\n    }\n  }\n\n  @override\n  void dispose() {\n",
    'dial lifecycle stability handling',
)
text = replace_once(
    text,
    "    playback.radioSeekHandler = null;\n",
    "    playback.removeListener(_syncPlaybackState);\n    playback.radioSeekHandler = null;\n    WidgetsBinding.instance.removeObserver(this);\n",
    'remove dial playback listener',
)
text = regex_once(
    text,
    r"  Future<void> _togglePower\(\) async \{.*?\n  \}\n\n  void _setVolume",
    r'''  Future<void> _togglePower() async {
    final station = locked ? nearestStation : null;
    if (station != null && playback.isActiveStation(station)) {
      if (playback.playing || playback.transitioning) {
        powered = false;
        if (mounted) setState(() {});
        await playback.pause();
      } else {
        powered = true;
        if (mounted) setState(() {});
        await playback.resume();
      }
      return;
    }
    powered = !powered;
    if (powered && !dialAudio && locked && nearestStation != null) manualStationId = _identity(nearestStation!);
    if (mounted) setState(() {});
    await _updateAudio();
  }

  void _setVolume''',
    'dial play pause uses shared player',
)
text = replace_once(
    text,
    "  void _setVolume(double value) {\n    volume = value.clamp(0, 1).toDouble();\n",
    "  void _setVolume(double value) {\n    volume = value.clamp(0, 1).toDouble();\n    unawaited(playback.setVolume(volume));\n",
    'tuner volume tied to shared player',
)
text = text.replace(
    "FilledButton(onPressed: _togglePower, child: Icon(powered ? Icons.pause : Icons.play_arrow, size: 28))",
    "FilledButton(onPressed: _togglePower, child: Icon((station != null && playback.isActiveStation(station) ? playback.playing : powered) ? Icons.pause : Icons.play_arrow, size: 28))",
    1,
)
text = replace_once(
    text,
    "    final line = [\n      if (metadata.presenter.isNotEmpty) metadata.presenter,\n      if (metadata.show.isNotEmpty) metadata.show,\n      if (metadata.artist.isNotEmpty) metadata.artist,\n      if (metadata.title.isNotEmpty) metadata.title,\n      if (metadata.program.isNotEmpty) metadata.program,\n    ].join(' · ');\n",
    "    final visibleMetadata = station != null && playback.isActiveStation(station) ? playback.stationMetadata : metadata;\n    final line = [\n      if (visibleMetadata.presenter.isNotEmpty) visibleMetadata.presenter,\n      if (visibleMetadata.show.isNotEmpty) visibleMetadata.show,\n      if (visibleMetadata.artist.isNotEmpty) visibleMetadata.artist,\n      if (visibleMetadata.title.isNotEmpty) visibleMetadata.title,\n      if (visibleMetadata.program.isNotEmpty) visibleMetadata.program,\n    ].join(' · ');\n",
    'dial renders active source metadata',
)
text = text.replace(
    "Row(children: [Text(powered ? (signal ? 'ON AIR' : 'TUNING') : 'PAUSED'",
    "Row(children: [Text((station != null && playback.isActiveStation(station) ? playback.playing : powered) ? (signal ? 'ON AIR' : 'TUNING') : 'PAUSED'",
    1,
)
write('tuner_v04.dart', text)


# ---------------------------------------------------------------------------
# FEED: use the real native composer.
# ---------------------------------------------------------------------------
text = read('social.dart')
if "import 'feed_compose.dart';" not in text:
    text = text.replace("import 'core.dart';\n", "import 'core.dart';\nimport 'feed_compose.dart';\n", 1)
text = re.sub(
    r"onPressed: \(\) => Navigator\.push\(context, MaterialPageRoute\(builder: \(_\) => const MatrixPageScreen\(path: '/feed/new', title: 'Create Post'\)\)\)\.then\(\(_\) => _load\(reset: true\)\),",
    "onPressed: () => Navigator.push<bool>(context, MaterialPageRoute(builder: (_) => const FeedComposeScreen())).then((posted) { if (posted == true) _load(reset: true); }),",
    text,
    count=1,
)
write('social.dart', text)


# ---------------------------------------------------------------------------
# MATRIX ACTIONS: this was a launch-blocker. The app was posting to the
# nonexistent /action/{id}. 061i exposes POST /actions.
# ---------------------------------------------------------------------------
text = read('site.dart')
text = text.replace(
    "final body = await RrnScope.of(context).api.post('/action/$id', body: a['payload'] ?? const {});",
    "final payload = a['payload'] is Map ? Map<String, dynamic>.from(a['payload']) : <String, dynamic>{};\n      final body = await RrnScope.of(context).api.post('/actions', body: {'actionId': id, 'id': id, 'payload': payload, ...payload});",
    1,
)
text = text.replace(
    "final body = await RrnScope.of(context).api.post('/action/$actionId', body: values);",
    "final body = await RrnScope.of(context).api.post('/actions', body: {'actionId': actionId, 'id': actionId, 'payload': values, ...values});",
    1,
)
text = replace_once(
    text,
    "    controller = WebViewController()\n      ..setJavaScriptMode(JavaScriptMode.unrestricted)\n      ..setBackgroundColor(rrnBg)\n      ..loadRequest(Uri.parse('$rrnBase${widget.path.startsWith('/') ? widget.path : '/${widget.path}'}'));\n",
    "    final target = widget.path.startsWith('http://') || widget.path.startsWith('https://')\n        ? widget.path\n        : '$rrnBase${widget.path.startsWith('/') ? widget.path : '/${widget.path}'}';\n    controller = WebViewController()\n      ..setJavaScriptMode(JavaScriptMode.unrestricted)\n      ..setBackgroundColor(rrnBg)\n      ..loadRequest(Uri.parse(target));\n",
    'external URL support for Website and Discord',
)
write('site.dart', text)


# ---------------------------------------------------------------------------
# MORE: Website + Discord replace Home. Dedicated Matrix endpoints are used for
# the surfaces 061i exposes directly; Store gets its real native product client.
# ---------------------------------------------------------------------------
text = read('main.dart')
if "import 'store_native.dart';" not in text:
    text = text.replace("import 'stations.dart';\n", "import 'stations.dart';\nimport 'store_native.dart';\n", 1)
text = replace_once(
    text,
    "    final modules = manifestNav.isNotEmpty ? manifestNav : _fallbackModules;\n",
    "    final baseModules = manifestNav.isNotEmpty ? manifestNav : _fallbackModules;\n    final modules = baseModules.where((raw) {\n      if (raw is! Map) return true;\n      final path = str(raw['path'] ?? raw['href'] ?? raw['route']);\n      final title = str(raw['title'] ?? raw['label'] ?? raw['name']).toLowerCase();\n      return path != '/' && title != 'home';\n    }).toList();\n",
    'remove Home from More navigation',
)
# Insert Website/Discord cards before mapped modules.
text = replace_once(
    text,
    "        ...modules.map((raw) {\n",
    "        Card(\n          child: ListTile(\n            leading: const Icon(Icons.language, color: rrnCyan),\n            title: const Text('Website', style: TextStyle(fontWeight: FontWeight.w900)),\n            subtitle: const Text('Open RealityRadio.net.'),\n            trailing: const Icon(Icons.open_in_new),\n            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const WebFallbackScreen(path: 'https://realityradio.net', title: 'Reality Radio Network'))),\n          ),\n        ),\n        Card(\n          child: ListTile(\n            leading: const Icon(Icons.forum_outlined, color: rrnPurple),\n            title: const Text('Discord', style: TextStyle(fontWeight: FontWeight.w900)),\n            subtitle: const Text('Open the Reality Radio Network Discord.'),\n            trailing: const Icon(Icons.open_in_new),\n            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const WebFallbackScreen(path: 'https://discord.realityradio.net', title: 'RRN Discord'))),\n          ),\n        ),\n        ...modules.map((raw) {\n",
    'Website and Discord More entries',
)
text = replace_once(
    text,
    "              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => MatrixPageScreen(path: path, title: title))),\n",
    "              onTap: () => _openModule(context, path, title),\n",
    'dedicated More navigation',
)
# Drop Home fallback and normalize Artists.
text = text.replace("    {'title': 'Home', 'path': '/'},\n", '', 1)
text = text.replace("{'title': 'Artists', 'path': '/music/artists'}", "{'title': 'Artists', 'path': '/artists'}", 1)
helper = r'''
  void _openModule(BuildContext context, String path, String title) {
    Widget screen;
    switch (path) {
      case '/shows':
        screen = const MatrixEndpointScreen(endpoint: '/shows', title: 'Shows & Backlogs');
        break;
      case '/presenters':
        screen = const MatrixEndpointScreen(endpoint: '/presenters', title: 'Presenters');
        break;
      case '/music/artists':
      case '/artists':
        screen = const MatrixEndpointScreen(endpoint: '/artists', title: 'Artists');
        break;
      case '/store':
        screen = const NativeStoreScreen();
        break;
      case '/events':
        screen = const MatrixEndpointScreen(endpoint: '/events', title: 'Events');
        break;
      case '/support':
        screen = const MatrixEndpointScreen(endpoint: '/support', title: 'Support');
        break;
      case '/submissions':
        screen = const MatrixEndpointScreen(endpoint: '/submissions', title: 'Submissions');
        break;
      default:
        screen = MatrixPageScreen(path: path, title: title);
    }
    Navigator.push(context, MaterialPageRoute(builder: (_) => screen));
  }

'''
text = replace_once(text, "  IconData _moduleIcon(String path) {\n", helper + "  IconData _moduleIcon(String path) {\n", 'More navigation helper')
# Top-right account chip uses the signed-in avatar.
text = regex_once(
    text,
    r"builder: \(_, __\) => CircleAvatar\(\s*radius: 16,\s*backgroundColor: app\.auth\.signedIn \? const Color\(0xFF123E46\) : rrnPanel2,\s*child: Icon\(app\.auth\.signedIn \? Icons\.person : Icons\.login, size: 18, color: rrnCyan\),\s*\),",
    "builder: (_, __) {\n                final avatar = app.auth.user?.avatar ?? '';\n                return CircleAvatar(\n                  radius: 16,\n                  backgroundColor: app.auth.signedIn ? const Color(0xFF123E46) : rrnPanel2,\n                  backgroundImage: avatar.isNotEmpty ? NetworkImage(avatar) : null,\n                  child: avatar.isEmpty ? Icon(app.auth.signedIn ? Icons.person : Icons.login, size: 18, color: rrnCyan) : null,\n                );\n              },",
    'top right signed-in avatar',
)
write('main.dart', text)


# ---------------------------------------------------------------------------
# ACCOUNT: route directly to 061i dedicated resources instead of dead translated
# page paths. My Library and Messages use their existing native clients.
# ---------------------------------------------------------------------------
text = read('account.dart')
imports = "import 'core.dart';\nimport 'points.dart';\nimport 'site.dart';\n"
replacement = "import 'core.dart';\nimport 'inbox.dart';\nimport 'music_v04.dart';\nimport 'native_endpoint.dart';\nimport 'points.dart';\nimport 'site.dart';\n"
text = replace_once(text, imports, replacement, 'account native screen imports')
old_tiles = """          _tile('Profile & settings', Icons.manage_accounts_outlined, '/account/settings'),
          _tile('My library', Icons.library_music_outlined, '/account/library'),
          _tile('Orders & purchases', Icons.receipt_long_outlined, '/account/orders'),
          _tile('Social & messages', Icons.people_outline, '/account/social'),
          _tile('My stations', Icons.radio_outlined, '/account/stations'),
          _tile('Presenter', Icons.mic_external_on_outlined, '/account/presenter'),
          _tile('Creator catalog', Icons.album_outlined, '/account/creator'),
          _tile('Labels', Icons.label_outline, '/account/labels'),
          _tile('Services', Icons.hub_outlined, '/account/services'),
          _tile('Applications', Icons.assignment_outlined, '/account/applications'),
          _tile('Reports & support', Icons.support_agent_outlined, '/account/reports'),
          if (u.permissions.isNotEmpty || u.roles.any(_likelyStaffRole))
            _tile('RRN Studio', Icons.admin_panel_settings_outlined, '/studio'),"""
new_tiles = """          _screenTile('Profile & settings', Icons.manage_accounts_outlined, const MatrixEndpointScreen(endpoint: '/account/settings', title: 'Profile & Settings')),
          _screenTile('My library', Icons.library_music_outlined, const MusicLibraryScreen()),
          _screenTile('Orders & purchases', Icons.receipt_long_outlined, const MatrixEndpointScreen(endpoint: '/account/orders', title: 'Orders & Purchases')),
          _screenTile('Social & messages', Icons.people_outline, const MessagesScreen()),
          _screenTile('My stations', Icons.radio_outlined, const MatrixEndpointScreen(endpoint: '/account/stations', title: 'My Stations')),
          _screenTile('Presenter', Icons.mic_external_on_outlined, const MatrixEndpointScreen(endpoint: '/account/presenter', title: 'Presenter')),
          _screenTile('Creator catalog', Icons.album_outlined, const MatrixEndpointScreen(endpoint: '/account/creator', title: 'Creator Catalog')),
          _screenTile('Labels', Icons.label_outline, const MatrixEndpointScreen(endpoint: '/account/labels', title: 'Labels')),
          _screenTile('Services', Icons.hub_outlined, const MatrixEndpointScreen(endpoint: '/account/services', title: 'Services')),
          _screenTile('Applications', Icons.assignment_outlined, const MatrixEndpointScreen(endpoint: '/account/applications', title: 'Applications')),
          _screenTile('Reports & support', Icons.support_agent_outlined, const MatrixEndpointScreen(endpoint: '/support', title: 'Reports & Support')),
          if (u.permissions.isNotEmpty || u.roles.any(_likelyStaffRole))
            _screenTile('RRN Studio', Icons.admin_panel_settings_outlined, const MatrixPageScreen(path: '/studio', title: 'RRN Studio')),"""
text = replace_once(text, old_tiles, new_tiles, 'account dedicated routes')
text = regex_once(
    text,
    r"  Widget _tile\(String title, IconData icon, String path\) => Card\(.*?\n      \);",
    r'''  Widget _screenTile(String title, IconData icon, Widget screen) => Card(
        child: ListTile(
          leading: Icon(icon, color: rrnCyan),
          title: Text(title),
          trailing: const Icon(Icons.chevron_right),
          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => screen)),
        ),
      );''',
    'account screen tile helper',
)
write('account.dart', text)


# ---------------------------------------------------------------------------
# NOTIFICATION PREFERENCES: use the dedicated authenticated account settings
# endpoint natively instead of a translated website path.
# ---------------------------------------------------------------------------
text = read('inbox.dart')
if "import 'native_endpoint.dart';" not in text:
    text = text.replace("import 'core.dart';\n", "import 'core.dart';\nimport 'native_endpoint.dart';\n", 1)
text = text.replace(
    "onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const MatrixPageScreen(path: '/account/settings', title: 'Notification Preferences'))),",
    "onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const MatrixEndpointScreen(endpoint: '/account/settings', title: 'Account Notification Preferences'))),",
    1,
)
text = text.replace("trailing: const Icon(Icons.open_in_new),", "trailing: const Icon(Icons.chevron_right),", 1)
write('inbox.dart', text)


# ---------------------------------------------------------------------------
# POINTS: invoke the live /points/purchase route. Any secure checkout URL returned
# by the server is an intentional payment handoff; otherwise fall back to the
# website's authenticated Points purchase surface rather than dead-ending.
# ---------------------------------------------------------------------------
text = read('points.dart')
text = regex_once(
    text,
    r"  Future<void> _buyPoints\(\) async \{.*?\n  \}\n\n  @override\n  Widget build",
    r'''  Future<void> _buyPoints() async {
    final controller = TextEditingController(text: '100');
    final requested = await showDialog<int>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Buy RRN points'),
        content: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Text('1 point = \$0.01 of RRN value. Minimum purchase: 100 points.'),
          const SizedBox(height: 12),
          TextField(controller: controller, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Points')),
        ]),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          FilledButton(onPressed: () => Navigator.pop(context, int.tryParse(controller.text.trim())), child: const Text('Continue')),
        ],
      ),
    );
    controller.dispose();
    if (requested == null || requested < 100) return;
    try {
      final app = RrnScope.of(context);
      final response = await app.api.post('/points/purchase', body: {
        'points': requested,
        'requestedPoints': requested,
        'idempotencyKey': 'android-${app.api.deviceId}-${DateTime.now().microsecondsSinceEpoch}',
      });
      final map = response is Map ? Map<String, dynamic>.from(response) : <String, dynamic>{};
      final url = str(map['checkoutUrl'] ?? map['checkout_url'] ?? map['paymentUrl'] ?? map['payment_url'] ?? map['redirectUrl'] ?? map['redirect_url'] ?? map['url']);
      if (!mounted) return;
      if (url.isNotEmpty) {
        await Navigator.push(context, MaterialPageRoute(builder: (_) => WebFallbackScreen(path: url, title: 'Secure Points Checkout')));
      } else if (boolish(map['completed'] ?? map['success'])) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(str(map['message'], 'Points purchased.'))));
      } else {
        final proceed = await showDialog<bool>(
          context: context,
          builder: (context) => AlertDialog(
            title: const Text('Continue to secure checkout'),
            content: Text(str(map['message'], 'RRN created the point-purchase request. Continue to the secure website payment step to tokenize the card.')),
            actions: [
              TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
              FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Secure Checkout')),
            ],
          ),
        );
        if (proceed == true && mounted) {
          await Navigator.push(context, MaterialPageRoute(builder: (_) => const WebFallbackScreen(path: '/account/points', title: 'Buy RRN Points')));
        }
      }
      await _load();
    } catch (e) {
      if (!mounted) return;
      final fallback = await showDialog<bool>(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Use secure web checkout?'),
          content: Text('The native purchase request could not finish: $e'),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Close')),
            FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Open checkout')),
          ],
        ),
      );
      if (fallback == true && mounted) {
        await Navigator.push(context, MaterialPageRoute(builder: (_) => const WebFallbackScreen(path: '/account/points', title: 'Buy RRN Points')));
      }
    }
  }

  @override
  Widget build''',
    'live points purchase flow',
)
# v0.8 replaced the Buy button with Matrix page; restore native _buyPoints.
text = text.replace(
    "FilledButton.icon(\n                      onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const MatrixPageScreen(path: '/points', title: 'RRN Points'))),\n                      icon: const Icon(Icons.add_card),\n                      label: const Text('Buy / use points'),\n                    ),",
    "FilledButton.icon(onPressed: _buyPoints, icon: const Icon(Icons.add_card), label: const Text('Buy points'))",
    1,
)
write('points.dart', text)


# ---------------------------------------------------------------------------
# SHELL STATE: preserve tab across process recreation and refresh account/session
# state when Android resumes after a long background period.
# ---------------------------------------------------------------------------
text = read('main.dart')
text = text.replace(
    'class _RrnShellState extends State<RrnShell> {',
    'class _RrnShellState extends State<RrnShell> with WidgetsBindingObserver {',
    1,
)
text = replace_once(
    text,
    "  int index = 0;\n\n  final pages = const [\n",
    "  int index = 0;\n  bool shellInitialized = false;\n\n  @override\n  void initState() {\n    super.initState();\n    WidgetsBinding.instance.addObserver(this);\n  }\n\n  @override\n  void didChangeDependencies() {\n    super.didChangeDependencies();\n    if (shellInitialized) return;\n    shellInitialized = true;\n    index = (RrnScope.of(context).prefs?.getInt('rrn_shell_tab') ?? 0).clamp(0, 4);\n  }\n\n  @override\n  void didChangeAppLifecycleState(AppLifecycleState state) {\n    if (state == AppLifecycleState.resumed) {\n      final app = RrnScope.of(context);\n      if (app.auth.signedIn) unawaited(app.auth.loadMe(silent: true));\n    }\n  }\n\n  @override\n  void dispose() {\n    WidgetsBinding.instance.removeObserver(this);\n    super.dispose();\n  }\n\n  final pages = const [\n",
    'shell lifecycle restore',
)
# main.dart already imports audio_service but not dart:async.
if not text.startswith("import 'dart:async';"):
    text = "import 'dart:async';\n\n" + text
text = text.replace(
    "onDestinationSelected: (v) => setState(() => index = v),",
    "onDestinationSelected: (v) { RrnScope.of(context).prefs?.setInt('rrn_shell_tab', v); setState(() => index = v); },",
    1,
)
write('main.dart', text)
