import 'package:flutter/material.dart';

import 'account.dart';
import 'core.dart';

class ChartsScreen extends StatefulWidget {
  const ChartsScreen({super.key});
  @override
  State<ChartsScreen> createState() => _ChartsScreenState();
}

class _ChartsScreenState extends State<ChartsScreen> {
  List<dynamic> charts = [];
  bool busy = false;
  String? error;
  bool loaded = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!loaded) {
      loaded = true;
      _load();
    }
  }

  Future<void> _load() async {
    setState(() => busy = true);
    try {
      final body = await RrnScope.of(context).api.get('/charts');
      charts = listFrom(body, const ['charts']);
      error = null;
    } catch (e) {
      error = '$e';
    } finally {
      busy = false;
      if (mounted) setState(() {});
    }
  }

  @override
  Widget build(BuildContext context) => RefreshIndicator(
        onRefresh: _load,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(14, 16, 14, 120),
          children: [
            const RrnSectionHeader(
              eyebrow: 'Reality Charts',
              title: 'Community-owned charts.',
              subtitle: 'Rankings, nominations and voting are connected to the native App Translation Matrix.',
            ),
            const SizedBox(height: 14),
            if (busy) const Center(child: Padding(padding: EdgeInsets.all(26), child: CircularProgressIndicator())),
            if (error != null) Card(child: Padding(padding: const EdgeInsets.all(14), child: Text(error!, style: const TextStyle(color: Colors.white60)))),
            ...charts.map((raw) {
              final m = raw is Map ? Map<String, dynamic>.from(raw) : <String, dynamic>{};
              final title = str(m['title'] ?? m['name'], 'Reality Chart');
              final slug = str(m['slug'] ?? m['id']);
              final description = str(m['description'] ?? m['summary']);
              final updated = str(m['updatedAt'] ?? m['updated_at']);
              return Card(
                child: ListTile(
                  leading: const CircleAvatar(backgroundColor: Color(0xFF201135), child: Icon(Icons.leaderboard, color: rrnPurple)),
                  title: Text(title, style: const TextStyle(fontWeight: FontWeight.w900)),
                  subtitle: Text([description, updated].where((e) => e.isNotEmpty).join('\n'), maxLines: 3, overflow: TextOverflow.ellipsis),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: slug.isEmpty ? null : () => Navigator.push(context, MaterialPageRoute(builder: (_) => ChartDetailScreen(slug: slug, title: title))),
                ),
              );
            }),
          ],
        ),
      );
}

class ChartDetailScreen extends StatefulWidget {
  final String slug;
  final String title;
  const ChartDetailScreen({super.key, required this.slug, required this.title});

  @override
  State<ChartDetailScreen> createState() => _ChartDetailScreenState();
}

class _ChartDetailScreenState extends State<ChartDetailScreen> {
  Map<String, dynamic> chart = {};
  List<dynamic> entries = [];
  bool busy = true;
  String? message;
  bool loaded = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!loaded) {
      loaded = true;
      _load();
    }
  }

  Future<void> _load() async {
    setState(() => busy = true);
    try {
      final body = await RrnScope.of(context).api.get('/charts/${widget.slug}');
      if (body is Map) chart = Map<String, dynamic>.from(body);
      entries = listFrom(chart, const ['entries', 'ranking', 'candidates']);
    } catch (e) {
      message = '$e';
    } finally {
      busy = false;
      if (mounted) setState(() {});
    }
  }

  Future<bool> _ensureAuth() async {
    final app = RrnScope.of(context);
    if (app.auth.signedIn) return true;
    await Navigator.push(context, MaterialPageRoute(builder: (_) => const AccountScreen()));
    return app.auth.signedIn;
  }

  Future<void> _vote(dynamic raw) async {
    if (!await _ensureAuth()) return;
    final app = RrnScope.of(context);
    final m = raw is Map ? Map<String, dynamic>.from(raw) : <String, dynamic>{};
    final id = str(m['id'] ?? m['candidateId'] ?? m['candidate_id'] ?? m['trackId'] ?? m['track_id']);
    if (id.isEmpty) return;
    try {
      final body = await app.api.post('/charts/${widget.slug}/vote', body: {'candidateId': id, 'entryId': id});
      message = body is Map ? str(body['message'], 'Vote recorded.') : 'Vote recorded.';
      await _load();
    } catch (e) {
      setState(() => message = '$e');
    }
  }

  Future<void> _nominate() async {
    if (!await _ensureAuth()) return;
    final controller = TextEditingController();
    final text = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Nominate a song'),
        content: TextField(controller: controller, autofocus: true, decoration: const InputDecoration(labelText: 'Track ID, URL, or title / artist')),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          FilledButton(onPressed: () => Navigator.pop(context, controller.text.trim()), child: const Text('Nominate')),
        ],
      ),
    );
    if (text == null || text.isEmpty) return;
    try {
      final body = await RrnScope.of(context).api.post('/charts/${widget.slug}/nominate', body: {'track': text, 'trackId': text, 'query': text});
      setState(() => message = body is Map ? str(body['message'], 'Nomination submitted.') : 'Nomination submitted.');
      await _load();
    } catch (e) {
      setState(() => message = '$e');
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(
          title: Text(widget.title),
          actions: [IconButton(onPressed: _nominate, icon: const Icon(Icons.add_chart), tooltip: 'Nominate')],
        ),
        body: busy
            ? const Center(child: CircularProgressIndicator())
            : RefreshIndicator(
                onRefresh: _load,
                child: ListView(
                  padding: const EdgeInsets.all(14),
                  children: [
                    if (str(chart['description']).isNotEmpty) Text(str(chart['description']), style: const TextStyle(color: Colors.white70, height: 1.4)),
                    if (message != null) Padding(padding: const EdgeInsets.symmetric(vertical: 10), child: Text(message!, style: const TextStyle(color: rrnCyan))),
                    ...entries.asMap().entries.map((indexed) {
                      final m = indexed.value is Map ? Map<String, dynamic>.from(indexed.value) : <String, dynamic>{};
                      final rank = numi(m['rank'] ?? m['position'], indexed.key + 1);
                      final title = str(m['title'] ?? m['trackTitle'] ?? m['track_title'] ?? m['name'], 'Entry');
                      final artist = str(m['artist'] ?? m['artistName'] ?? m['artist_name']);
                      final movement = str(m['movement'] ?? m['change']);
                      final weeks = numi(m['weeks'] ?? m['weeksOnChart'] ?? m['weeks_on_chart']);
                      return Card(
                        child: ListTile(
                          leading: CircleAvatar(backgroundColor: const Color(0xFF081B22), child: Text('$rank', style: const TextStyle(color: rrnCyan, fontWeight: FontWeight.w900))),
                          title: Text(title, style: const TextStyle(fontWeight: FontWeight.w800)),
                          subtitle: Text([artist, if (movement.isNotEmpty) movement, if (weeks > 0) '$weeks wk'].where((e) => e.isNotEmpty).join(' · ')),
                          trailing: FilledButton.tonal(onPressed: () => _vote(indexed.value), child: const Text('Vote')),
                        ),
                      );
                    }),
                  ],
                ),
              ),
      );
}
