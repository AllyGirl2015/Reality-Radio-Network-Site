import 'package:flutter/material.dart';

import 'account.dart';
import 'core.dart';
import 'inbox.dart';
import 'site.dart';

String _absoluteMedia(String value) {
  if (value.isEmpty) return '';
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  return '$rrnBase${value.startsWith('/') ? value : '/$value'}';
}

class SocialScreen extends StatefulWidget {
  const SocialScreen({super.key});

  @override
  State<SocialScreen> createState() => _SocialScreenState();
}

class _SocialScreenState extends State<SocialScreen> {
  final search = TextEditingController();
  final List<Map<String, dynamic>> posts = [];
  bool busy = true;
  bool loadingMore = false;
  bool initialized = false;
  bool hasMore = false;
  String? nextCursor;
  String? error;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (initialized) return;
    initialized = true;
    _load(reset: true);
  }

  @override
  void dispose() {
    search.dispose();
    super.dispose();
  }

  Future<void> _load({required bool reset}) async {
    if (reset) {
      setState(() {
        busy = true;
        error = null;
        nextCursor = null;
      });
    } else {
      if (!hasMore || loadingMore) return;
      setState(() => loadingMore = true);
    }

    try {
      final body = await RrnScope.of(context).api.get('/feed', query: {
        'limit': 40,
        if (search.text.trim().isNotEmpty) 'q': search.text.trim(),
        if (!reset && nextCursor != null) 'before': nextCursor,
      });
      final incoming = listFrom(body, const ['items'])
          .whereType<Map>()
          .map((e) => Map<String, dynamic>.from(e))
          .toList();
      if (reset) posts.clear();
      final known = posts.map((e) => str(e['id'])).toSet();
      posts.addAll(incoming.where((e) => !known.contains(str(e['id']))));
      if (body is Map) {
        hasMore = boolish(body['hasMore']);
        final cursor = str(body['nextCursor']);
        nextCursor = cursor.isEmpty ? null : cursor;
      }
      error = null;
    } catch (e) {
      error = '$e';
    } finally {
      busy = false;
      loadingMore = false;
      if (mounted) setState(() {});
    }
  }

  Future<bool> _ensureAuth() async {
    final app = RrnScope.of(context);
    if (app.auth.signedIn) return true;
    await Navigator.push(context, MaterialPageRoute(builder: (_) => const AccountScreen()));
    return app.auth.signedIn;
  }

  Future<void> _react(Map<String, dynamic> post, String reaction) async {
    if (!await _ensureAuth()) return;
    final slug = str(post['slug']);
    if (slug.isEmpty) return;
    final current = str(post['viewer_reaction'] ?? post['viewerReaction']);
    final desired = current == reaction ? null : reaction;
    try {
      final result = await RrnScope.of(context).api.post('/feed/$slug/interact', body: {
        'action': 'reaction',
        'reaction': desired,
      });
      post['viewer_reaction'] = result is Map ? result['reaction'] : desired;
      await _load(reset: true);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Reaction failed: $e')));
    }
  }

  @override
  Widget build(BuildContext context) => RefreshIndicator(
        onRefresh: () => _load(reset: true),
        child: ListView(
          padding: const EdgeInsets.fromLTRB(14, 16, 14, 130),
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Expanded(
                  child: RrnSectionHeader(
                    eyebrow: 'Connect',
                    title: 'The RRN community.',
                    subtitle: 'Live network feed, reactions, comments, messages and notifications from the same RRN account used on RealityRadio.net.',
                  ),
                ),
                IconButton.filledTonal(
                  onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const MatrixPageScreen(path: '/feed/new', title: 'Create Post'))).then((_) => _load(reset: true)),
                  icon: const Icon(Icons.edit),
                  tooltip: 'Create post',
                ),
              ],
            ),
            const SizedBox(height: 10),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _chip('Messages', Icons.chat_bubble_outline, () async {
                    if (!await _ensureAuth() || !mounted) return;
                    await Navigator.push(context, MaterialPageRoute(builder: (_) => const MessagesScreen()));
                  }),
                  _chip('Notifications', Icons.notifications_none, () async {
                    if (!await _ensureAuth() || !mounted) return;
                    await Navigator.push(context, MaterialPageRoute(builder: (_) => const NotificationsScreen()));
                  }),
                  _chip('Friends', Icons.group_outlined, () => Navigator.push(context, MaterialPageRoute(builder: (_) => const MatrixPageScreen(path: '/community/friends', title: 'Friends')))),
                  _chip('Events', Icons.event_outlined, () => Navigator.push(context, MaterialPageRoute(builder: (_) => const MatrixPageScreen(path: '/events', title: 'Events')))),
                ],
              ),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: search,
              textInputAction: TextInputAction.search,
              onChanged: (_) => setState(() {}),
              onSubmitted: (_) => _load(reset: true),
              decoration: InputDecoration(
                labelText: 'Search the RRN feed',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: search.text.isEmpty
                    ? IconButton(onPressed: () => _load(reset: true), icon: const Icon(Icons.refresh))
                    : IconButton(
                        onPressed: () {
                          search.clear();
                          _load(reset: true);
                        },
                        icon: const Icon(Icons.clear),
                      ),
              ),
            ),
            if (busy) const Padding(padding: EdgeInsets.all(32), child: Center(child: CircularProgressIndicator())),
            if (!busy && error != null)
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    const Text('Feed unavailable', style: TextStyle(fontWeight: FontWeight.w900)),
                    const SizedBox(height: 5),
                    Text(error!, style: const TextStyle(color: Colors.white60)),
                    const SizedBox(height: 8),
                    FilledButton.tonal(onPressed: () => _load(reset: true), child: const Text('Retry')),
                  ]),
                ),
              ),
            if (!busy && error == null && posts.isEmpty)
              const Card(child: Padding(padding: EdgeInsets.all(18), child: Text('The feed returned no published posts.'))),
            ...posts.map(_postCard),
            if (hasMore)
              FilledButton.tonalIcon(
                onPressed: loadingMore ? null : () => _load(reset: false),
                icon: loadingMore
                    ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                    : const Icon(Icons.expand_more),
                label: const Text('Load older posts'),
              ),
          ],
        ),
      );

  Widget _chip(String label, IconData icon, VoidCallback onTap) => Padding(
        padding: const EdgeInsets.only(right: 7),
        child: ActionChip(avatar: Icon(icon, size: 17), label: Text(label), onPressed: onTap),
      );

  Widget _postCard(Map<String, dynamic> post) {
    final slug = str(post['slug']);
    final author = str(post['author_name'] ?? post['authorName'], 'Reality Radio Network');
    final authorImage = _absoluteMedia(str(post['author_image'] ?? post['authorImage']));
    final title = str(post['title']);
    final summary = str(post['summary']);
    final type = str(post['post_type'] ?? post['postType'], 'post');
    final hero = _absoluteMedia(str(post['hero_image_url'] ?? post['heroImageUrl']));
    final comments = numi(post['comment_count'] ?? post['commentCount']);
    final reactions = numi(post['reaction_count'] ?? post['reactionCount']);
    final viewerReaction = str(post['viewer_reaction'] ?? post['viewerReaction']);

    return Card(
      margin: const EdgeInsets.only(top: 10),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: slug.isEmpty
            ? null
            : () => Navigator.push(context, MaterialPageRoute(builder: (_) => FeedDetailScreen(slug: slug))).then((_) => _load(reset: true)),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 14, 14, 10),
              child: Row(children: [
                CircleAvatar(
                  backgroundColor: const Color(0xFF10262B),
                  backgroundImage: authorImage.isNotEmpty ? NetworkImage(authorImage) : null,
                  child: authorImage.isEmpty ? const Icon(Icons.person, color: rrnCyan) : null,
                ),
                const SizedBox(width: 10),
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(author, style: const TextStyle(fontWeight: FontWeight.w900)),
                  Text(type.toUpperCase(), style: const TextStyle(color: rrnPurple, fontSize: 9, fontWeight: FontWeight.w900, letterSpacing: 1.2)),
                ])),
                if (boolish(post['pinned'])) const Icon(Icons.push_pin, size: 17, color: rrnCyan),
              ]),
            ),
            if (hero.isNotEmpty)
              AspectRatio(
                aspectRatio: 16 / 9,
                child: Image.network(hero, fit: BoxFit.cover, errorBuilder: (_, __, ___) => const SizedBox.shrink()),
              ),
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 12, 14, 8),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                if (title.isNotEmpty) Text(title, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900)),
                if (summary.isNotEmpty) ...[
                  const SizedBox(height: 5),
                  Text(summary, maxLines: 4, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.white70)),
                ],
              ]),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(6, 0, 8, 8),
              child: Row(children: [
                TextButton.icon(
                  onPressed: slug.isEmpty ? null : () => _react(post, 'like'),
                  icon: Icon(viewerReaction.isEmpty ? Icons.favorite_border : Icons.favorite, color: viewerReaction.isEmpty ? null : rrnPink),
                  label: Text('$reactions'),
                ),
                TextButton.icon(
                  onPressed: slug.isEmpty ? null : () => Navigator.push(context, MaterialPageRoute(builder: (_) => FeedDetailScreen(slug: slug))),
                  icon: const Icon(Icons.mode_comment_outlined),
                  label: Text('$comments'),
                ),
                const Spacer(),
                const Icon(Icons.chevron_right, color: Colors.white38),
              ]),
            ),
          ],
        ),
      ),
    );
  }
}

class FeedDetailScreen extends StatefulWidget {
  final String slug;
  const FeedDetailScreen({super.key, required this.slug});

  @override
  State<FeedDetailScreen> createState() => _FeedDetailScreenState();
}

class _FeedDetailScreenState extends State<FeedDetailScreen> {
  Map<String, dynamic> post = {};
  List<Map<String, dynamic>> comments = [];
  List<Map<String, dynamic>> reactions = [];
  String viewerReaction = '';
  bool busy = true;
  String? error;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (post.isEmpty && busy) _load();
  }

  Future<void> _load() async {
    try {
      final body = await RrnScope.of(context).api.get('/feed/${widget.slug}');
      if (body is Map) {
        post = body['post'] is Map ? Map<String, dynamic>.from(body['post']) : <String, dynamic>{};
        comments = listFrom(body, const ['comments']).whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList();
        reactions = listFrom(body, const ['reactions']).whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList();
        viewerReaction = str(body['viewerReaction']);
      }
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

  Future<void> _reaction(String reaction) async {
    if (!await _ensureAuth()) return;
    try {
      await RrnScope.of(context).api.post('/feed/${widget.slug}/interact', body: {
        'action': 'reaction',
        'reaction': viewerReaction == reaction ? null : reaction,
      });
      await _load();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    }
  }

  Future<void> _comment() async {
    if (!await _ensureAuth()) return;
    final controller = TextEditingController();
    final body = await showModalBottomSheet<String>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      builder: (_) => Padding(
        padding: EdgeInsets.fromLTRB(16, 0, 16, MediaQuery.of(context).viewInsets.bottom + 18),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          const Align(alignment: Alignment.centerLeft, child: Text('Add a comment', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900))),
          const SizedBox(height: 10),
          TextField(controller: controller, autofocus: true, minLines: 3, maxLines: 8, decoration: const InputDecoration(hintText: 'Join the conversation…')),
          const SizedBox(height: 10),
          Align(alignment: Alignment.centerRight, child: FilledButton(onPressed: () => Navigator.pop(context, controller.text.trim()), child: const Text('Comment'))),
        ]),
      ),
    );
    controller.dispose();
    if (body == null || body.isEmpty) return;
    try {
      await RrnScope.of(context).api.post('/feed/${widget.slug}/interact', body: {'action': 'comment', 'body': body});
      await _load();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Comment failed: $e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    final title = str(post['title'], 'RRN Feed');
    final summary = str(post['summary']);
    final body = str(post['body']);
    final author = str(post['author_name'] ?? post['authorName'], 'Reality Radio Network');
    final hero = _absoluteMedia(str(post['hero_image_url'] ?? post['heroImageUrl']));
    return Scaffold(
      appBar: AppBar(title: Text(title, maxLines: 1, overflow: TextOverflow.ellipsis)),
      body: busy
          ? const Center(child: CircularProgressIndicator())
          : error != null
              ? Center(child: Padding(padding: const EdgeInsets.all(20), child: Text(error!)))
              : RefreshIndicator(
                  onRefresh: _load,
                  child: ListView(
                    padding: const EdgeInsets.fromLTRB(14, 10, 14, 90),
                    children: [
                      if (hero.isNotEmpty)
                        ClipRRect(
                          borderRadius: BorderRadius.circular(20),
                          child: Image.network(hero, fit: BoxFit.cover, errorBuilder: (_, __, ___) => const SizedBox.shrink()),
                        ),
                      const SizedBox(height: 14),
                      Text(title, style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900)),
                      Text(author, style: const TextStyle(color: rrnCyan, fontWeight: FontWeight.w800)),
                      if (summary.isNotEmpty) ...[const SizedBox(height: 10), Text(summary, style: const TextStyle(color: Colors.white70, fontSize: 17))],
                      if (body.isNotEmpty) ...[const SizedBox(height: 16), Text(body)],
                      const SizedBox(height: 14),
                      Wrap(spacing: 6, children: [
                        for (final reaction in const ['like', 'love', 'fire', 'celebrate'])
                          FilterChip(
                            selected: viewerReaction == reaction,
                            onSelected: (_) => _reaction(reaction),
                            label: Text(_reactionLabel(reaction)),
                          ),
                      ]),
                      const Divider(height: 30),
                      Row(children: [
                        Expanded(child: Text('Comments (${comments.length})', style: const TextStyle(fontSize: 21, fontWeight: FontWeight.w900))),
                        FilledButton.tonalIcon(onPressed: _comment, icon: const Icon(Icons.add_comment), label: const Text('Comment')),
                      ]),
                      const SizedBox(height: 8),
                      if (comments.isEmpty) const Text('No comments yet.', style: TextStyle(color: Colors.white54)),
                      ...comments.map((comment) => Card(
                            child: ListTile(
                              leading: const CircleAvatar(child: Icon(Icons.person)),
                              title: Text(str(comment['display_name'] ?? comment['displayName'], 'RRN Member'), style: const TextStyle(fontWeight: FontWeight.w800)),
                              subtitle: Text(str(comment['body'])),
                            ),
                          )),
                    ],
                  ),
                ),
    );
  }

  String _reactionLabel(String value) => switch (value) {
        'love' => '❤ Love',
        'fire' => '🔥 Fire',
        'celebrate' => '🎉 Celebrate',
        _ => '👍 Like',
      };
}
