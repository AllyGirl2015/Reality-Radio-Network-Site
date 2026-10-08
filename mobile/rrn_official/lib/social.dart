import 'package:flutter/material.dart';

import 'account.dart';
import 'core.dart';
import 'site.dart';

class SocialScreen extends StatefulWidget {
  const SocialScreen({super.key});
  @override
  State<SocialScreen> createState() => _SocialScreenState();
}

class _SocialScreenState extends State<SocialScreen> {
  List<dynamic> posts = [];
  bool busy = false;
  bool loaded = false;
  String? error;

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
      final body = await RrnScope.of(context).api.get('/social/feed');
      posts = listFrom(body, const ['posts', 'feed']);
      error = null;
    } catch (e) {
      error = '$e';
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

  Future<void> _compose() async {
    if (!await _ensureAuth()) return;
    final controller = TextEditingController();
    final text = await showModalBottomSheet<String>(
      context: context,
      isScrollControlled: true,
      builder: (context) => Padding(
        padding: EdgeInsets.fromLTRB(16, 18, 16, MediaQuery.of(context).viewInsets.bottom + 18),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Post to RRN', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900)),
            const SizedBox(height: 12),
            TextField(controller: controller, maxLines: 5, decoration: const InputDecoration(hintText: 'What do you want to share?')),
            const SizedBox(height: 12),
            Align(
              alignment: Alignment.centerRight,
              child: FilledButton(onPressed: () => Navigator.pop(context, controller.text.trim()), child: const Text('Post')),
            ),
          ],
        ),
      ),
    );
    if (text == null || text.isEmpty) return;
    try {
      await RrnScope.of(context).api.post('/social/publish', body: {'body': text, 'text': text});
      await _load();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Social Matrix bridge is not live yet: $e')));
    }
  }

  Future<void> _react(String id, String reaction) async {
    if (!await _ensureAuth()) return;
    try {
      await RrnScope.of(context).api.post('/social/feed/$id/interact', body: {'action': 'react', 'reaction': reaction});
      await _load();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    }
  }

  @override
  Widget build(BuildContext context) => RefreshIndicator(
        onRefresh: _load,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(14, 16, 14, 120),
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Expanded(
                  child: RrnSectionHeader(
                    eyebrow: 'Connect',
                    title: 'The RRN community.',
                    subtitle: 'Network posts, stations, presenters, artists, charts, events, friends and messages in one app-first social space.',
                  ),
                ),
                IconButton.filled(onPressed: _compose, icon: const Icon(Icons.edit)),
              ],
            ),
            const SizedBox(height: 12),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _shortcut('Messages', Icons.chat_bubble_outline, '/account/social/messages'),
                  _shortcut('Friends', Icons.group_outlined, '/account/social/friends'),
                  _shortcut('Events', Icons.event_outlined, '/account/social/events'),
                  _shortcut('Notifications', Icons.notifications_none, '/account/social/notifications'),
                ],
              ),
            ),
            if (busy) const Padding(padding: EdgeInsets.all(30), child: Center(child: CircularProgressIndicator())),
            if (error != null)
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Native social bridge pending', style: TextStyle(fontWeight: FontWeight.w900)),
                      const SizedBox(height: 6),
                      const Text(
                        'The client is already coded for /api/app/v1/social/*. When we add those Matrix routes to the website backend, this becomes the same RRN social network rather than a second app-only community.',
                        style: TextStyle(color: Colors.white70),
                      ),
                      const SizedBox(height: 8),
                      Text(error!, style: const TextStyle(color: Colors.white38, fontSize: 11)),
                    ],
                  ),
                ),
              ),
            ...posts.map((raw) => _post(raw)),
          ],
        ),
      );

  Widget _shortcut(String label, IconData icon, String path) => Padding(
        padding: const EdgeInsets.only(right: 8),
        child: ActionChip(
          avatar: Icon(icon, size: 17),
          label: Text(label),
          onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => MatrixPageScreen(path: path, title: label))),
        ),
      );

  Widget _post(dynamic raw) {
    final m = raw is Map ? Map<String, dynamic>.from(raw) : <String, dynamic>{};
    final id = str(m['id']);
    final author = str(m['authorName'] ?? m['displayName'] ?? m['author'] ?? m['stationName'], 'RRN');
    final body = str(m['body'] ?? m['text'] ?? m['content']);
    final type = str(m['type'] ?? m['kind'], 'post');
    final art = str(m['artwork'] ?? m['imageUrl'] ?? m['image_url']);
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const CircleAvatar(backgroundColor: Color(0xFF10262B), child: Icon(Icons.person, color: rrnCyan)),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(author, style: const TextStyle(fontWeight: FontWeight.w900)),
                      Text(type.toUpperCase(), style: const TextStyle(fontSize: 9, color: rrnPurple, letterSpacing: 1.4)),
                    ],
                  ),
                ),
              ],
            ),
            if (body.isNotEmpty) ...[const SizedBox(height: 12), Text(body)],
            if (art.startsWith('http')) ...[
              const SizedBox(height: 12),
              ClipRRect(borderRadius: BorderRadius.circular(16), child: Image.network(art, fit: BoxFit.cover)),
            ],
            const SizedBox(height: 10),
            Row(
              children: [
                TextButton.icon(
                  onPressed: id.isEmpty ? null : () => _react(id, 'like'),
                  icon: const Icon(Icons.favorite_border),
                  label: Text('${numi(m['reactionCount'] ?? m['likes'])}'),
                ),
                TextButton.icon(
                  onPressed: id.isEmpty
                      ? null
                      : () => Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => MatrixPageScreen(path: '/social/feed/$id/comments', title: 'Comments')),
                          ),
                  icon: const Icon(Icons.mode_comment_outlined),
                  label: Text('${numi(m['commentCount'] ?? m['comments'])}'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
