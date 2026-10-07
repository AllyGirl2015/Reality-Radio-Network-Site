import 'dart:async';
import 'dart:convert';

import 'package:audio_session/audio_session.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:just_audio/just_audio.dart';
import 'package:just_audio_background/just_audio_background.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';

const bg = Color(0xff04060b);
const panel = Color(0xff0a1020);
const cyan = Color(0xff00f3ff);
const purple = Color(0xffa855f7);
const pink = Color(0xffec4899);
const baseUrl = 'https://realityradio.net';
const matrixUrl = '$baseUrl/api/app/v1';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await JustAudioBackground.init(
    androidNotificationChannelId: 'com.rbew.rrn_official.audio',
    androidNotificationChannelName: 'RRN Radio',
    androidNotificationOngoing: true,
  );
  runApp(const RrnApp());
}

class Station {
  const Station({
    required this.id,
    required this.frequency,
    required this.format,
    required this.name,
    this.tagline = '',
    this.location = '',
    this.stream = '',
    this.art = '',
    this.presenter = '',
    this.show = '',
    this.artist = '',
    this.track = '',
    this.status = 'live',
    this.capabilities = const [],
  });
  final String id, frequency, format, name, tagline, location, stream, art;
  final String presenter, show, artist, track, status;
  final List<String> capabilities;
  String get designation => '$frequency $format'.trim();
  bool get playable => status.toLowerCase() == 'live' && stream.isNotEmpty;

  factory Station.fromJson(Map<String, dynamic> m) {
    String p(List<String> keys, [String fallback = '']) {
      for (final key in keys) {
        final value = m[key];
        if (value != null && '$value'.trim().isNotEmpty) return '$value'.trim();
      }
      return fallback;
    }
    String frequency = p(['frequency', 'number']);
    String format = p(['format', 'frequencyType']);
    final designation = p(['designation', 'frequencyLabel']);
    if (frequency.isEmpty && designation.isNotEmpty) {
      final bits = designation.split(RegExp(r'\s+'));
      frequency = bits.first;
      if (bits.length > 1) format = bits.sublist(1).join(' ');
    }
    final rawCaps = m['capabilities'];
    return Station(
      id: p(['id', 'stationId', 'slug'], p(['name'], 'station').toLowerCase().replaceAll(' ', '-')),
      frequency: frequency,
      format: format,
      name: p(['name', 'stationName'], 'RRN Station'),
      tagline: p(['tagline', 'subtitle']),
      location: p(['location', 'city']),
      stream: p(['streamUrl', 'stream_url', 'stream']),
      art: p(['artworkUrl', 'artwork', 'logoUrl', 'image']),
      presenter: p(['presenter', 'dj', 'host']),
      show: p(['show', 'program', 'programName']),
      artist: p(['artist', 'nowPlayingArtist']),
      track: p(['track', 'song', 'title', 'nowPlayingTitle']),
      status: p(['status'], 'live'),
      capabilities: rawCaps is List ? rawCaps.map((e) => '$e').toList() : const [],
    );
  }
}

const fallbackStations = [
  Station(
    id: 'reality-central-radio',
    frequency: '201.5',
    format: 'RMP',
    name: 'Reality Central Radio',
    tagline: 'The Realest Mix Around',
    stream: 'https://streaming.live365.com/a47993',
    status: 'live',
    capabilities: ['requests', 'callins', 'events', 'giveaways', 'points'],
  ),
  Station(
    id: 'rrn-music',
    frequency: '33.9',
    format: 'PFL',
    name: 'RRN Music',
    tagline: 'Music for the Masses!',
    status: 'testing',
  ),
  Station(
    id: 'funk-the-world',
    frequency: '247.0',
    format: 'RMP',
    name: 'Funk the World',
    tagline: 'Funk, soul, boogie and beyond',
    location: 'Santa Barbara',
    status: 'external',
  ),
];

class Api {
  Future<List<Station>> stations() async {
    for (final path in const ['/bootstrap', '/stations']) {
      try {
        final r = await http.get(Uri.parse('$matrixUrl$path')).timeout(const Duration(seconds: 5));
        if (r.statusCode < 200 || r.statusCode >= 300) continue;
        final decoded = jsonDecode(r.body);
        dynamic raw = decoded;
        if (decoded is Map) {
          raw = decoded['stations'] ?? decoded['items'];
          final data = decoded['data'];
          if (raw == null && data is Map) raw = data['stations'];
        }
        if (raw is List) {
          final parsed = raw.whereType<Map>().map((e) => Station.fromJson(Map<String, dynamic>.from(e))).toList();
          if (parsed.isNotEmpty) return parsed;
        }
      } catch (_) {}
    }
    return fallbackStations;
  }

  Future<List<Map<String, dynamic>>> tracks() async {
    try {
      final r = await http.get(Uri.parse('$baseUrl/api/v2/tracks')).timeout(const Duration(seconds: 7));
      if (r.statusCode < 200 || r.statusCode >= 300) return [];
      final decoded = jsonDecode(r.body);
      dynamic raw = decoded;
      if (decoded is Map) raw = decoded['tracks'] ?? decoded['data'] ?? decoded['items'];
      if (raw is List) return raw.whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList();
    } catch (_) {}
    return [];
  }

  Future<List<Map<String, dynamic>>> charts() async {
    try {
      final r = await http.get(Uri.parse('$matrixUrl/charts')).timeout(const Duration(seconds: 5));
      if (r.statusCode < 200 || r.statusCode >= 300) return [];
      final decoded = jsonDecode(r.body);
      dynamic raw = decoded;
      if (decoded is Map) raw = decoded['charts'] ?? decoded['billboards'] ?? decoded['data'] ?? decoded['items'];
      if (raw is List) return raw.whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList();
    } catch (_) {}
    return [];
  }
}

class RadioState extends ChangeNotifier {
  RadioState(this.api) {
    _sub = player.playerStateStream.listen((_) => notifyListeners());
  }
  final Api api;
  final AudioPlayer player = AudioPlayer();
  late final StreamSubscription<PlayerState> _sub;
  List<Station> stations = [];
  int index = 0;
  bool loading = true;
  Set<String> presets = {};
  String? notice;

  Station? get current => stations.isEmpty ? null : stations[index];

  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    presets = prefs.getStringList('presets')?.toSet() ?? {};
    final session = await AudioSession.instance;
    await session.configure(const AudioSessionConfiguration.music());
    stations = await api.stations();
    final last = prefs.getString('lastStation');
    if (last != null) {
      final found = stations.indexWhere((s) => s.id == last);
      if (found >= 0) index = found;
    }
    loading = false;
    notifyListeners();
  }

  Future<void> tune(int next) async {
    if (stations.isEmpty) return;
    index = (next % stations.length + stations.length) % stations.length;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('lastStation', current!.id);
    if (player.playing && current!.playable) await play();
    notifyListeners();
  }

  Future<void> play() async {
    final s = current;
    if (s == null || !s.playable) {
      notice = 'This station does not currently expose a playable live stream.';
      notifyListeners();
      return;
    }
    try {
      notice = null;
      await player.setAudioSource(AudioSource.uri(
        Uri.parse(s.stream),
        tag: MediaItem(
          id: s.id,
          album: s.designation,
          title: s.track.isNotEmpty ? s.track : s.name,
          artist: s.artist.isNotEmpty ? s.artist : (s.presenter.isNotEmpty ? s.presenter : 'Reality Radio Network'),
          displayTitle: s.name,
          displaySubtitle: [s.presenter, s.show, s.artist, s.track].where((v) => v.isNotEmpty).join(' • '),
          artUri: s.art.isNotEmpty ? Uri.tryParse(s.art) : null,
        ),
      ));
      await player.play();
    } catch (_) {
      notice = 'The station stream could not be opened. It may be offline or using a web-player-only URL.';
      notifyListeners();
    }
  }

  Future<void> togglePreset() async {
    final s = current;
    if (s == null) return;
    if (!presets.add(s.id)) presets.remove(s.id);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setStringList('presets', presets.toList());
    notifyListeners();
  }

  @override
  void dispose() {
    _sub.cancel();
    player.dispose();
    super.dispose();
  }
}

class RrnApp extends StatefulWidget {
  const RrnApp({super.key});
  @override State<RrnApp> createState() => _RrnAppState();
}

class _RrnAppState extends State<RrnApp> {
  late final Api api;
  late final RadioState radio;
  @override void initState() {
    super.initState();
    api = Api();
    radio = RadioState(api)..init();
  }
  @override void dispose() { radio.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) => MaterialApp(
    debugShowCheckedModeBanner: false,
    title: 'Reality Radio Network',
    theme: ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: bg,
      colorScheme: ColorScheme.fromSeed(seedColor: cyan, brightness: Brightness.dark),
      useMaterial3: true,
      cardTheme: CardThemeData(color: panel, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18))),
      navigationBarTheme: const NavigationBarThemeData(backgroundColor: Color(0xff070b14), indicatorColor: Color(0x3300f3ff)),
    ),
    home: Shell(api: api, radio: radio),
  );
}

class Shell extends StatefulWidget {
  const Shell({super.key, required this.api, required this.radio});
  final Api api;
  final RadioState radio;
  @override State<Shell> createState() => _ShellState();
}

class _ShellState extends State<Shell> {
  int tab = 0;
  @override Widget build(BuildContext context) {
    final pages = [
      DialPage(radio: widget.radio),
      MusicPage(api: widget.api),
      ChartsPage(api: widget.api),
      ConnectPage(radio: widget.radio),
      const AccountPage(),
    ];
    return Scaffold(
      appBar: AppBar(
        backgroundColor: bg,
        titleSpacing: 12,
        title: Row(children: [
          ClipRRect(borderRadius: BorderRadius.circular(9), child: Image.asset('assets/rrn_logo.jpg', width: 38, height: 38)),
          const SizedBox(width: 10),
          const Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('REALITY RADIO NETWORK', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 15, letterSpacing: .7)),
            Text('Listen. Discover. Connect.', style: TextStyle(color: cyan, fontSize: 10, letterSpacing: .6)),
          ])),
        ]),
      ),
      body: IndexedStack(index: tab, children: pages),
      bottomNavigationBar: NavigationBar(
        selectedIndex: tab,
        onDestinationSelected: (i) => setState(() => tab = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.radio_outlined), selectedIcon: Icon(Icons.radio), label: 'Dial'),
          NavigationDestination(icon: Icon(Icons.library_music_outlined), selectedIcon: Icon(Icons.library_music), label: 'Music'),
          NavigationDestination(icon: Icon(Icons.leaderboard_outlined), selectedIcon: Icon(Icons.leaderboard), label: 'Charts'),
          NavigationDestination(icon: Icon(Icons.bolt_outlined), selectedIcon: Icon(Icons.bolt), label: 'Connect'),
          NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person), label: 'Account'),
        ],
      ),
    );
  }
}

class DialPage extends StatelessWidget {
  const DialPage({super.key, required this.radio});
  final RadioState radio;
  @override Widget build(BuildContext context) => AnimatedBuilder(
    animation: radio,
    builder: (_, __) {
      if (radio.loading) return const Center(child: CircularProgressIndicator());
      final s = radio.current;
      if (s == null) return const Center(child: Text('No stations available.'));
      return RefreshIndicator(
        onRefresh: radio.init,
        child: ListView(padding: const EdgeInsets.fromLTRB(16, 8, 16, 32), children: [
          const GradientTitle('THE REALITY DIAL'),
          const SizedBox(height: 5),
          const Text('Turn the internet into a radio.', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900)),
          const SizedBox(height: 16),
          RadioDisplay(station: s, playing: radio.player.playing),
          const SizedBox(height: 12),
          Row(children: [
            IconButton.filledTonal(onPressed: () => radio.tune(radio.index - 1), icon: const Icon(Icons.skip_previous)),
            Expanded(child: Slider(
              value: radio.index.toDouble(),
              min: 0,
              max: radio.stations.length > 1 ? (radio.stations.length - 1).toDouble() : 1,
              divisions: radio.stations.length > 1 ? radio.stations.length - 1 : 1,
              onChanged: radio.stations.length > 1 ? (v) => radio.tune(v.round()) : null,
            )),
            IconButton.filledTonal(onPressed: () => radio.tune(radio.index + 1), icon: const Icon(Icons.skip_next)),
          ]),
          Row(children: [
            Expanded(child: FilledButton.icon(
              onPressed: s.playable ? () => radio.player.playing ? radio.player.pause() : radio.play() : null,
              icon: Icon(radio.player.playing ? Icons.pause : Icons.play_arrow),
              label: Text(radio.player.playing ? 'PAUSE' : 'LISTEN LIVE'),
            )),
            const SizedBox(width: 8),
            IconButton.outlined(onPressed: radio.togglePreset, icon: Icon(radio.presets.contains(s.id) ? Icons.bookmark : Icons.bookmark_outline)),
          ]),
          if (radio.notice != null) Padding(padding: const EdgeInsets.only(top: 10), child: Text(radio.notice!, style: const TextStyle(color: Colors.amber))),
          const SizedBox(height: 22),
          const Text('Stations', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18)),
          const SizedBox(height: 6),
          for (var i = 0; i < radio.stations.length; i++) Card(
            child: ListTile(
              onTap: () => radio.tune(i),
              leading: CircleAvatar(backgroundColor: i == radio.index ? purple.withOpacity(.25) : Colors.white10, child: Text(radio.stations[i].format.isEmpty ? 'R' : radio.stations[i].format.substring(0, 1))),
              title: Text(radio.stations[i].name, style: TextStyle(fontWeight: i == radio.index ? FontWeight.w900 : FontWeight.w600)),
              subtitle: Text('${radio.stations[i].designation}${radio.stations[i].location.isNotEmpty ? ' • ${radio.stations[i].location}' : ''}'),
              trailing: Icon(radio.stations[i].playable ? Icons.play_circle : Icons.info_outline, color: radio.stations[i].playable ? cyan : Colors.white38),
            ),
          ),
          const SizedBox(height: 10),
          const Text('RRN frequencies are internet-directory designations, not terrestrial broadcast allocations.', style: TextStyle(fontSize: 12, color: Colors.white54)),
        ]),
      );
    },
  );
}

class RadioDisplay extends StatelessWidget {
  const RadioDisplay({super.key, required this.station, required this.playing});
  final Station station;
  final bool playing;
  @override Widget build(BuildContext context) {
    final now = [station.artist, station.track].where((e) => e.isNotEmpty).join(' — ');
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: const Color(0xff03070a),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: cyan.withOpacity(.55)),
        boxShadow: [BoxShadow(color: cyan.withOpacity(.11), blurRadius: 28), BoxShadow(color: purple.withOpacity(.07), blurRadius: 42)],
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        Row(children: [
          const Icon(Icons.graphic_eq, color: cyan, size: 18),
          const SizedBox(width: 7),
          const Text('RRN DIGITAL', style: TextStyle(color: cyan, fontFamily: 'monospace', fontWeight: FontWeight.w900, letterSpacing: 2, fontSize: 12)),
          const Spacer(),
          Icon(playing ? Icons.wifi_tethering : Icons.radio_button_checked, color: playing ? pink : Colors.white38, size: 17),
          const SizedBox(width: 5),
          Text(playing ? 'LIVE' : station.status.toUpperCase(), style: TextStyle(color: playing ? pink : Colors.white54, fontFamily: 'monospace', fontSize: 11)),
        ]),
        const SizedBox(height: 14),
        Text(station.frequency, textAlign: TextAlign.center, style: const TextStyle(color: cyan, fontFamily: 'monospace', fontSize: 56, fontWeight: FontWeight.w900, height: 1, letterSpacing: 3)),
        Text(station.format, textAlign: TextAlign.center, style: const TextStyle(color: pink, fontFamily: 'monospace', fontSize: 19, fontWeight: FontWeight.w900, letterSpacing: 5)),
        const SizedBox(height: 14),
        Text(station.name.toUpperCase(), textAlign: TextAlign.center, style: const TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.w900, fontSize: 18, letterSpacing: 1.1)),
        if (station.presenter.isNotEmpty) DigitalLine('PRESENTER', station.presenter),
        if (station.show.isNotEmpty) DigitalLine('SHOW', station.show),
        if (now.isNotEmpty) DigitalLine('NOW PLAYING', now),
        if (station.show.isEmpty && station.tagline.isNotEmpty) DigitalLine('INFO', station.tagline),
      ]),
    );
  }
}

class DigitalLine extends StatelessWidget {
  const DigitalLine(this.label, this.value, {super.key});
  final String label, value;
  @override Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(top: 7),
    child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
      SizedBox(width: 92, child: Text('$label:', style: const TextStyle(color: Colors.white38, fontFamily: 'monospace', fontSize: 11))),
      Expanded(child: Text(value.toUpperCase(), maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Color(0xff9cf7ff), fontFamily: 'monospace', fontWeight: FontWeight.w700, fontSize: 12))),
    ]),
  );
}

class MusicPage extends StatefulWidget {
  const MusicPage({super.key, required this.api}); final Api api;
  @override State<MusicPage> createState() => _MusicPageState();
}
class _MusicPageState extends State<MusicPage> {
  late Future<List<Map<String, dynamic>>> future = widget.api.tracks();
  String query = '';
  @override Widget build(BuildContext context) => RefreshIndicator(
    onRefresh: () async { setState(() => future = widget.api.tracks()); await future; },
    child: ListView(padding: const EdgeInsets.fromLTRB(16, 8, 16, 32), children: [
      const GradientTitle('RRN MUSIC'),
      const SizedBox(height: 5),
      const Text('Audio-first music discovery.', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900)),
      const SizedBox(height: 14),
      TextField(onChanged: (v) => setState(() => query = v.toLowerCase()), decoration: const InputDecoration(prefixIcon: Icon(Icons.search), hintText: 'Search the RRN catalog', border: OutlineInputBorder())),
      const SizedBox(height: 12),
      FutureBuilder<List<Map<String, dynamic>>>(future: future, builder: (_, snap) {
        if (snap.connectionState != ConnectionState.done) return const Center(child: Padding(padding: EdgeInsets.all(28), child: CircularProgressIndicator()));
        final data = (snap.data ?? []).where((m) => query.isEmpty || jsonEncode(m).toLowerCase().contains(query)).toList();
        if (data.isEmpty) return const InfoBox(Icons.cloud_off, 'Catalog unavailable', 'The app will populate automatically from the current RRN v2 music API when it is reachable.');
        return Column(children: data.take(75).map((m) {
          String pick(List<String> keys, String fallback) { for (final k in keys) { final v=m[k]; if(v!=null && '$v'.trim().isNotEmpty) return '$v'; } return fallback; }
          return Card(child: ListTile(leading: const Icon(Icons.album, color: purple, size: 34), title: Text(pick(['title','name','trackTitle'], 'Untitled')), subtitle: Text(pick(['artistName','artist','performer'], 'RRN Artist')), trailing: const Icon(Icons.chevron_right)));
        }).toList());
      }),
    ]),
  );
}

class ChartsPage extends StatefulWidget {
  const ChartsPage({super.key, required this.api}); final Api api;
  @override State<ChartsPage> createState() => _ChartsPageState();
}
class _ChartsPageState extends State<ChartsPage> {
  late Future<List<Map<String, dynamic>>> future = widget.api.charts();
  @override Widget build(BuildContext context) => RefreshIndicator(
    onRefresh: () async { setState(() => future = widget.api.charts()); await future; },
    child: ListView(padding: const EdgeInsets.fromLTRB(16, 8, 16, 32), children: [
      const GradientTitle('REALITY CHARTS'),
      const SizedBox(height: 5),
      const Text('Community-powered billboards.', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900)),
      const SizedBox(height: 12),
      FutureBuilder<List<Map<String, dynamic>>>(future: future, builder: (_, snap) {
        if (snap.connectionState != ConnectionState.done) return const Center(child: Padding(padding: EdgeInsets.all(28), child: CircularProgressIndicator()));
        final data = snap.data ?? [];
        if (data.isEmpty) return const InfoBox(Icons.leaderboard, 'Renderer ready', 'This build already understands the Translation Matrix chart feed. When Update 061 publishes Billboard data, charts can appear here without a new APK.');
        return Column(children: data.map((m) => Card(child: ListTile(leading: const Icon(Icons.leaderboard, color: cyan), title: Text('${m['title'] ?? m['name'] ?? 'RRN Chart'}'), subtitle: Text('${m['description'] ?? m['subtitle'] ?? m['category'] ?? 'Community chart'}'), trailing: const Icon(Icons.chevron_right)))).toList());
      }),
    ]),
  );
}

class ConnectPage extends StatelessWidget {
  const ConnectPage({super.key, required this.radio}); final RadioState radio;
  @override Widget build(BuildContext context) => AnimatedBuilder(animation: radio, builder: (_, __) {
    final s = radio.current;
    final caps = s?.capabilities.toSet() ?? <String>{};
    void message(String feature) => ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$feature will activate through the authenticated Translation Matrix action when that backend endpoint is published.')));
    return ListView(padding: const EdgeInsets.fromLTRB(16, 8, 16, 32), children: [
      const GradientTitle('CONNECT'),
      const SizedBox(height: 5),
      Text(s == null ? 'RRN interactions' : '${s.name} interactions', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900)),
      const SizedBox(height: 12),
      FeatureTile(Icons.queue_music, 'Song Requests', 'Station-aware requests using RRN/Discord points and AzuraCast.', caps.contains('requests'), () => message('Song Requests')),
      FeatureTile(Icons.stars, 'RRN Points', 'One shared points balance across the app and Discord bot.', caps.contains('points') || caps.contains('requests'), () => message('RRN Points')),
      FeatureTile(Icons.mic, 'Call-ins', 'Join presenter-approved call-in queues.', caps.contains('callins'), () => message('Call-ins')),
      FeatureTile(Icons.event, 'Events', 'Shows, premieres, station events and appearances.', caps.contains('events'), () => message('Events')),
      FeatureTile(Icons.celebration, 'Giveaways', 'Enter eligible station giveaways.', caps.contains('giveaways'), () => message('Giveaways')),
      const SizedBox(height: 10),
      const Text('Each station exposes only the capabilities it supports. Independent Reality Dial stations can use different request and interaction systems.', style: TextStyle(color: Colors.white54, fontSize: 12)),
    ]);
  });
}

class AccountPage extends StatelessWidget {
  const AccountPage({super.key});
  @override Widget build(BuildContext context) => ListView(padding: const EdgeInsets.fromLTRB(16, 8, 16, 32), children: [
    const GradientTitle('YOUR RRN'),
    const SizedBox(height: 5),
    const Text('One account across the network.', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900)),
    const SizedBox(height: 12),
    const InfoBox(Icons.sync_lock, 'Cross-platform account foundation', 'Local presets already work. Synced presets, listening history, station ownership, points and interactive actions will switch to Translation Matrix sessions when those endpoints go live.'),
    const SizedBox(height: 8),
    FilledButton.icon(onPressed: () => launchUrl(Uri.parse('$baseUrl/login'), mode: LaunchMode.externalApplication), icon: const Icon(Icons.open_in_browser), label: const Text('OPEN RRN ACCOUNT ON WEB')),
    const SizedBox(height: 18),
    const ListTile(leading: Icon(Icons.dns, color: cyan), title: Text('Translation Matrix'), subtitle: Text('Versioned app-compatible digest and action layer')),
    const ListTile(leading: Icon(Icons.directions_car, color: purple), title: Text('Android Auto foundation'), subtitle: Text('Background media session and automotive media metadata')),
    const ListTile(leading: Icon(Icons.security, color: pink), title: Text('Server-side credentials'), subtitle: Text('No AzuraCast or administrative secrets are embedded in the APK')),
    const SizedBox(height: 14),
    const Text('RRN Mobile 0.1.0 • Reality Radio Network', style: TextStyle(color: Colors.white38, fontSize: 12)),
  ]);
}

class FeatureTile extends StatelessWidget {
  const FeatureTile(this.icon, this.title, this.body, this.enabled, this.onTap, {super.key});
  final IconData icon; final String title, body; final bool enabled; final VoidCallback onTap;
  @override Widget build(BuildContext context) => Card(child: ListTile(enabled: enabled, onTap: enabled ? onTap : null, leading: Icon(icon, color: enabled ? cyan : Colors.white24), title: Text(title), subtitle: Text(body), trailing: Icon(enabled ? Icons.chevron_right : Icons.lock_outline, size: 18)));
}

class GradientTitle extends StatelessWidget {
  const GradientTitle(this.text, {super.key}); final String text;
  @override Widget build(BuildContext context) => ShaderMask(shaderCallback: (r) => const LinearGradient(colors: [cyan, purple, pink]).createShader(r), child: Text(text, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w900, letterSpacing: 2)));
}

class InfoBox extends StatelessWidget {
  const InfoBox(this.icon, this.title, this.body, {super.key}); final IconData icon; final String title, body;
  @override Widget build(BuildContext context) => Card(child: Padding(padding: const EdgeInsets.all(16), child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [Icon(icon, color: cyan), const SizedBox(width: 12), Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(title, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16)), const SizedBox(height: 5), Text(body, style: const TextStyle(color: Colors.white70))]))])));
}
