import 'package:flutter/material.dart';
import 'package:just_audio_background/just_audio_background.dart';

import 'account.dart';
import 'charts.dart';
import 'core.dart';
import 'music.dart';
import 'points.dart';
import 'site.dart';
import 'social.dart';
import 'tuner.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await JustAudioBackground.init(
    androidNotificationChannelId: 'com.rbew.rrn_official.audio',
    androidNotificationChannelName: 'RRN Audio',
    androidNotificationOngoing: true,
  );
  final controller = RrnAppController();
  await controller.init();
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
    RealityDialScreen(),
    MusicScreen(),
    SocialScreen(),
    ChartsScreen(),
    MoreScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final app = RrnScope.of(context);
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
            onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const PointsWalletScreen())),
            icon: const Icon(Icons.toll_outlined),
            tooltip: 'RRN Points',
          ),
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
      body: IndexedStack(index: index, children: pages),
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
          title: 'The website, rendered as an app.',
          subtitle: 'Public pages, account areas and privileged tools use the same RRN information and permissions, presented more ergonomically for a phone.',
        ),
        const SizedBox(height: 16),
        Card(
          child: ListTile(
            leading: const Icon(Icons.toll, color: rrnCyan),
            title: const Text('RRN Points', style: TextStyle(fontWeight: FontWeight.w900)),
            subtitle: const Text('Earn, buy and spend network-wide points.'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const PointsWalletScreen())),
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
