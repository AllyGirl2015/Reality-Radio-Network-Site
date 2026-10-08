import 'package:audio_service/audio_service.dart';
import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart';

import 'account.dart';
import 'audio_handler.dart';
import 'charts.dart';
import 'core.dart';
import 'inbox.dart';
import 'music_v04.dart';
import 'playback.dart';
import 'points.dart';
import 'site.dart';
import 'social.dart';
import 'stations.dart';
import 'tuner_v04.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final mediaHandler = await AudioService.init(
    builder: () => RrnAudioHandler(),
    config: const AudioServiceConfig(
      androidNotificationChannelId: 'com.rbew.rrn_official.audio',
      androidNotificationChannelName: 'RRN Audio',
      androidNotificationOngoing: true,
      androidStopForegroundOnPause: false,
      androidNotificationIcon: 'mipmap/ic_launcher',
    ),
  );
  await RrnPlaybackController.instance.attachHandler(mediaHandler);

  final controller = RrnAppController();
  await controller.init();

  // Android 13+ may require explicit notification permission for the full
  // app notification experience. Media sessions are still authoritative,
  // but requesting this now also prepares RRN for push notifications.
  try {
    final status = await Permission.notification.status;
    if (!status.isGranted && !status.isPermanentlyDenied) {
      await Permission.notification.request();
    }
  } catch (_) {}

  runApp(RrnScope(controller: controller, child: const RrnApp()));
}

class RrnApp extends StatelessWidget {
  const RrnApp({super.key});

  @override
  Widget build(BuildContext context) => MaterialApp(
        title: 'Reality Radio Network',
        debugShowCheckedModeBanner: false,
        theme: rrnTheme(),
        home: const RrnShell(),
      );
}

class RrnShell extends StatefulWidget {
  const RrnShell({super.key});

  @override
  State<RrnShell> createState() => _RrnShellState();
}

class _RrnShellState extends State<RrnShell> {
  int index = 0;

  final pages = const [
    RealityDialV04Screen(),
    MusicScreenV04(),
    SocialScreen(),
    ChartsScreen(),
    MoreScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final app = RrnScope.of(context);
    final playback = RrnPlaybackController.instance;
    return Scaffold(
      appBar: AppBar(
        titleSpacing: 12,
        title: Row(
          children: [
            Image.asset('assets/rrn_app_logo.png', width: 34, height: 34),
            const SizedBox(width: 9),
            const Expanded(
              child: Text(
                'REALITY RADIO NETWORK',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, letterSpacing: .8),
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const StationDirectoryScreen())),
            icon: const Icon(Icons.search),
            tooltip: 'Search RRN',
          ),
          const RrnTopInboxActions(),
          IconButton(
            onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AccountScreen())),
            icon: AnimatedBuilder(
              animation: app.auth,
              builder: (_, __) => CircleAvatar(
                radius: 16,
                backgroundColor: app.auth.signedIn ? const Color(0xFF123E46) : rrnPanel2,
                child: Icon(app.auth.signedIn ? Icons.person : Icons.login, size: 18, color: rrnCyan),
              ),
            ),
            tooltip: 'RRN account',
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(child: IndexedStack(index: index, children: pages)),
          AnimatedBuilder(
            animation: playback,
            builder: (context, _) => playback.hasItem ? const RrnMiniPlayer() : const SizedBox.shrink(),
          ),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: index,
        onDestinationSelected: (v) => setState(() => index = v),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.radio_outlined), selectedIcon: Icon(Icons.radio), label: 'Dial'),
          NavigationDestination(icon: Icon(Icons.album_outlined), selectedIcon: Icon(Icons.album), label: 'Music'),
          NavigationDestination(icon: Icon(Icons.people_outline), selectedIcon: Icon(Icons.people), label: 'Connect'),
          NavigationDestination(icon: Icon(Icons.leaderboard_outlined), selectedIcon: Icon(Icons.leaderboard), label: 'Charts'),
          NavigationDestination(icon: Icon(Icons.apps_outlined), selectedIcon: Icon(Icons.apps), label: 'More'),
        ],
      ),
    );
  }
}

class RrnMiniPlayer extends StatelessWidget {
  const RrnMiniPlayer({super.key});

  @override
  Widget build(BuildContext context) {
    final playback = RrnPlaybackController.instance;
    return Material(
      color: const Color(0xFF0A0E18),
      child: InkWell(
        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const MusicNowPlayingScreen())),
        child: Container(
          constraints: const BoxConstraints(minHeight: 68),
          decoration: const BoxDecoration(
            border: Border(top: BorderSide(color: Color(0x3322D3EE))),
          ),
          padding: const EdgeInsets.fromLTRB(10, 8, 6, 8),
          child: Row(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(10),
                child: SizedBox(
                  width: 50,
                  height: 50,
                  child: playback.artwork.isNotEmpty
                      ? Image.network(
                          playback.artwork,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => ColoredBox(
                            color: Colors.black,
                            child: Icon(playback.live ? Icons.radio : Icons.album, color: rrnCyan),
                          ),
                        )
                      : ColoredBox(
                          color: Colors.black,
                          child: Icon(playback.live ? Icons.radio : Icons.album, color: rrnCyan),
                        ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        if (playback.live)
                          Container(
                            margin: const EdgeInsets.only(right: 6),
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(99),
                              border: Border.all(color: rrnPink),
                            ),
                            child: const Text('LIVE', style: TextStyle(color: rrnPink, fontSize: 8, fontWeight: FontWeight.w900)),
                          ),
                        Expanded(
                          child: Text(
                            playback.title,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(fontWeight: FontWeight.w900),
                          ),
                        ),
                      ],
                    ),
                    if (playback.subtitle.isNotEmpty)
                      Text(
                        playback.subtitle,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(color: Colors.white60, fontSize: 11),
                      ),
                    if (playback.lastError != null)
                      Text(
                        playback.lastError!,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(color: rrnPink, fontSize: 9),
                      ),
                  ],
                ),
              ),
              if (playback.transitioning)
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 12),
                  child: SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2)),
                )
              else
                IconButton(
                  onPressed: playback.toggle,
                  icon: Icon(playback.playing ? Icons.pause_circle_filled : Icons.play_circle_fill, size: 35, color: rrnCyan),
                  tooltip: playback.playing ? 'Pause' : 'Play',
                ),
              IconButton(
                onPressed: playback.transitioning ? null : playback.stop,
                icon: const Icon(Icons.close, size: 21),
                tooltip: 'Stop',
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class MoreScreen extends StatelessWidget {
  const MoreScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final app = RrnScope.of(context);
    final manifestNav = listFrom(app.manifest['navigation'] ?? app.manifest['modules']);
    final modules = manifestNav.isNotEmpty ? manifestNav : _fallbackModules;
    return ListView(
      padding: const EdgeInsets.fromLTRB(14, 16, 14, 120),
      children: [
        const RrnSectionHeader(
          eyebrow: 'Everything RRN',
          title: 'RealityRadio.net, translated to mobile.',
          subtitle: 'Every information surface, account capability and permission is expected to have a mobile representation. Native screens are used where available, with Matrix-driven parity surfaces filling the rest.',
        ),
        const SizedBox(height: 16),
        Card(
          child: ListTile(
            leading: const Icon(Icons.radio, color: rrnCyan),
            title: const Text('Station Directory', style: TextStyle(fontWeight: FontWeight.w900)),
            subtitle: const Text('Search every live, testing, coming-soon and off-air station.'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const StationDirectoryScreen())),
          ),
        ),
        Card(
          child: ListTile(
            leading: const Icon(Icons.bookmarks, color: rrnPurple),
            title: const Text('Saved Stations', style: TextStyle(fontWeight: FontWeight.w900)),
            subtitle: const Text('Unlimited saved stations plus six presets per band.'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SavedStationsScreen())),
          ),
        ),
        Card(
          child: ListTile(
            leading: const Icon(Icons.toll, color: rrnCyan),
            title: const Text('RRN Points', style: TextStyle(fontWeight: FontWeight.w900)),
            subtitle: const Text('Earn, buy and spend network-wide points.'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const PointsWalletScreen())),
          ),
        ),
        Card(
          child: ListTile(
            leading: const Icon(Icons.notifications_active_outlined, color: rrnPink),
            title: const Text('Notification Settings', style: TextStyle(fontWeight: FontWeight.w900)),
            subtitle: const Text('Choose RRN push and in-app notification categories.'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const PushNotificationSettingsScreen())),
          ),
        ),
        ...modules.map((raw) {
          final m = raw is Map ? Map<String, dynamic>.from(raw) : <String, dynamic>{'title': '$raw', 'path': '/$raw'};
          final title = str(m['title'] ?? m['label'] ?? m['name'], 'RRN');
          final path = str(m['path'] ?? m['href'] ?? m['route'], '/');
          final subtitle = str(m['description'] ?? m['summary']);
          return Card(
            child: ListTile(
              leading: Icon(_moduleIcon(path), color: rrnCyan),
              title: Text(title, style: const TextStyle(fontWeight: FontWeight.w800)),
              subtitle: subtitle.isEmpty ? null : Text(subtitle),
              trailing: const Icon(Icons.chevron_right),
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => MatrixPageScreen(path: path, title: title))),
            ),
          );
        }),
      ],
    );
  }

  static const _fallbackModules = [
    {'title': 'Home', 'path': '/'},
    {'title': 'Shows & Backlogs', 'path': '/shows'},
    {'title': 'Presenters', 'path': '/presenters'},
    {'title': 'Artists', 'path': '/music/artists'},
    {'title': 'RRN Store', 'path': '/store'},
    {'title': 'Events', 'path': '/events'},
    {'title': 'Support', 'path': '/support'},
    {'title': 'Submissions', 'path': '/submissions'},
    {'title': 'About RRN', 'path': '/about'},
    {'title': 'Terms', 'path': '/terms'},
  ];

  IconData _moduleIcon(String path) {
    if (path.contains('show')) return Icons.podcasts;
    if (path.contains('presenter')) return Icons.mic;
    if (path.contains('music') || path.contains('artist')) return Icons.album;
    if (path.contains('store')) return Icons.storefront;
    if (path.contains('event')) return Icons.event;
    if (path.contains('support')) return Icons.support_agent;
    if (path.contains('submission')) return Icons.upload_file;
    if (path.contains('studio')) return Icons.admin_panel_settings;
    return Icons.public;
  }
}
