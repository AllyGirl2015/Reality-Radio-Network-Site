import 'package:flutter/material.dart';

import 'account.dart';
import 'core.dart';
import 'playback.dart';
import 'site.dart';

String _art(dynamic raw) {
  if (raw is! Map) return '';
  final m = Map<String, dynamic>.from(raw);
  final value = str(m['artwork_url'] ?? m['artwork'] ?? m['image'] ?? m['cover_url'] ?? m['coverUrl']);
  if (value.isEmpty) return '';
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  return '$rrnBase${value.startsWith('/') ? value : '/$value'}';
}

class MusicScreenV04 extends StatefulWidget {
  const MusicScreenV04({super.key});

  @override
  State<MusicScreenV04> createState() => _MusicScreenV04State();
}

class _MusicScreenV04State extends State<MusicScreenV04> {
  final search = TextEditingController();
  final List<Map<String, dynamic>> tracks = [];
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
      if (loadingMore || !hasMore) return;
      setState(() => loadingMore = true);
    }

    try {
      final body = await RrnScope.of(context).api.get('/music/catalog', query: {
        'limit': 50,
        if (search.text.trim().isNotEmpty) 'q': search.text.trim(),
        if (!reset && nextCursor != null) 'before': nextCursor,
      });
      final incoming = listFrom(body, const ['items'])
          .whereType<Map>()
          .map((e) => Map<String, dynamic>.from(e))
          .toList();
      if (reset) tracks.clear();
      final known = tracks.map((e) => str(e['id'])).toSet();
      tracks.addAll(incoming.where((e) => !known.contains(str(e['id']))));
      if (body is Map) {
        hasMore = boolish(body['hasMore']);
        final cursor = str(body['nextCursor']);
        nextCursor = cursor.isEmpty ? null : cursor;
      } else {
        hasMore = false;
        nextCursor = null;
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

  Future<void> _toggleFavorite(Map<String, dynamic> item) async {
    if (!await _ensureAuth()) return;
    final id = str(item['id']);
    if (id.isEmpty) return;
    final desired = !boolish(item['favorited']);
    try {
      final result = await RrnScope.of(context).api.post('/music/favorite', body: {
        'trackId': id,
        'favorited': desired,
      });
      item['favorited'] = result is Map ? boolish(result['favorited'], desired) : desired;
      if (mounted) setState(() {});
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Favorite failed: $e')));
    }
  }

  Future<void> _play(Map<String, dynamic> item) async {
    try {
      await RrnPlaybackController.instance.playMusic(item);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: () => _load(reset: true),
      child: ListView(
        padding: const EdgeInsets.fromLTRB(14, 16, 14, 140),
        children: [
          const RrnSectionHeader(
            eyebrow: 'RRN Music',
            title: 'The native RRN catalog.',
            subtitle: 'Tracks come directly from the App Translation Matrix and play through the same persistent Android media session used by the Reality Dial.',
          ),
          const SizedBox(height: 14),
          TextField(
            controller: search,
            textInputAction: TextInputAction.search,
            onChanged: (_) => setState(() {}),
            onSubmitted: (_) => _load(reset: true),
            decoration: InputDecoration(
              labelText: 'Search music',
              hintText: 'Track, artist, genre…',
              prefixIcon: const Icon(Icons.search),
              suffixIcon: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (search.text.isNotEmpty)
                    IconButton(
                      onPressed: () {
                        search.clear();
                        _load(reset: true);
                      },
                      icon: const Icon(Icons.clear),
                    ),
                  IconButton(onPressed: () => _load(reset: true), icon: const Icon(Icons.arrow_forward)),
                ],
              ),
            ),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const MatrixPageScreen(path: '/library', title: 'Library'))),
                  icon: const Icon(Icons.library_music),
                  label: const Text('Library'),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const MatrixPageScreen(path: '/store', title: 'RRN Store'))),
                  icon: const Icon(Icons.storefront),
                  label: const Text('Store'),
                ),
              ),
            ],
          ),
          if (busy) const Padding(padding: EdgeInsets.all(34), child: Center(child: CircularProgressIndicator())),
          if (!busy && error != null)
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  const Text('Music catalog unavailable', style: TextStyle(fontWeight: FontWeight.w900)),
                  const SizedBox(height: 6),
                  Text(error!, style: const TextStyle(color: Colors.white60)),
                  const SizedBox(height: 8),
                  FilledButton.tonal(onPressed: () => _load(reset: true), child: const Text('Retry')),
                ]),
              ),
            ),
          if (!busy && error == null && tracks.isEmpty)
            const Card(child: Padding(padding: EdgeInsets.all(18), child: Text('No RRN tracks matched this search.'))),
          ...tracks.map(_trackCard),
          if (hasMore)
            Padding(
              padding: const EdgeInsets.only(top: 10),
              child: FilledButton.tonalIcon(
                onPressed: loadingMore ? null : () => _load(reset: false),
                icon: loadingMore
                    ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                    : const Icon(Icons.expand_more),
                label: const Text('Load more music'),
              ),
            ),
        ],
      ),
    );
  }

  Widget _trackCard(Map<String, dynamic> item) {
    final title = str(item['title'], 'RRN Track');
    final artist = str(item['artist'], 'RRN');
    final genre = str(item['genre']);
    final duration = numi(item['duration_seconds']);
    final playable = RrnPlaybackController.instance.musicUrl(item).isNotEmpty;
    final favorite = boolish(item['favorited']);
    final artwork = _art(item);

    return Card(
      child: ListTile(
        contentPadding: const EdgeInsets.fromLTRB(10, 8, 4, 8),
        leading: ClipRRect(
          borderRadius: BorderRadius.circular(10),
          child: SizedBox(
            width: 58,
            height: 58,
            child: artwork.isEmpty
                ? const ColoredBox(color: Colors.black, child: Icon(Icons.album, color: rrnPurple))
                : Image.network(
                    artwork,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => const ColoredBox(color: Colors.black, child: Icon(Icons.album, color: rrnPurple)),
                  ),
          ),
        ),
        title: Text(title, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w900)),
        subtitle: Text([
          artist,
          if (genre.isNotEmpty) genre,
          if (duration > 0) _duration(duration),
          if (boolish(item['explicit'])) 'Explicit',
        ].join(' · '), maxLines: 2, overflow: TextOverflow.ellipsis),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            IconButton(
              onPressed: () => _toggleFavorite(item),
              icon: Icon(favorite ? Icons.favorite : Icons.favorite_border, color: favorite ? rrnPink : Colors.white54),
              tooltip: favorite ? 'Remove favorite' : 'Favorite',
            ),
            IconButton(
              onPressed: playable ? () => _play(item) : null,
              icon: Icon(playable ? Icons.play_circle_fill : Icons.block, color: playable ? rrnCyan : Colors.white24, size: 35),
              tooltip: playable ? 'Play' : 'No stream',
            ),
          ],
        ),
        onTap: playable ? () => _play(item) : null,
      ),
    );
  }

  String _duration(int seconds) {
    final m = seconds ~/ 60;
    final s = seconds % 60;
    return '$m:${s.toString().padLeft(2, '0')}';
  }
}

class MusicNowPlayingScreen extends StatelessWidget {
  const MusicNowPlayingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final playback = RrnPlaybackController.instance;
    return Scaffold(
      appBar: AppBar(title: const Text('Now Playing')),
      body: AnimatedBuilder(
        animation: playback,
        builder: (context, _) {
          if (!playback.hasItem) return const Center(child: Text('Nothing is playing.'));
          return ListView(
            padding: const EdgeInsets.all(22),
            children: [
              AspectRatio(
                aspectRatio: 1,
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(28),
                  child: playback.artwork.isEmpty
                      ? ColoredBox(color: Colors.black, child: Icon(playback.live ? Icons.radio : Icons.album, color: rrnPurple, size: 100))
                      : Image.network(
                          playback.artwork,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => ColoredBox(color: Colors.black, child: Icon(playback.live ? Icons.radio : Icons.album, color: rrnPurple, size: 100)),
                        ),
                ),
              ),
              const SizedBox(height: 24),
              if (playback.live)
                const Align(
                  alignment: Alignment.centerLeft,
                  child: Chip(label: Text('LIVE'), avatar: Icon(Icons.radio, color: rrnPink, size: 18)),
                ),
              Text(playback.title, style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w900)),
              if (playback.subtitle.isNotEmpty) ...[
                const SizedBox(height: 6),
                Text(playback.subtitle, style: const TextStyle(color: Colors.white60, fontSize: 16)),
              ],
              if (!playback.live && playback.duration > Duration.zero) ...[
                const SizedBox(height: 18),
                Slider(
                  value: playback.position.inMilliseconds.clamp(0, playback.duration.inMilliseconds).toDouble(),
                  max: playback.duration.inMilliseconds.toDouble(),
                  onChanged: (v) => playback.seek(Duration(milliseconds: v.round())),
                ),
              ],
              const SizedBox(height: 18),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  IconButton.filledTonal(
                    onPressed: playback.toggle,
                    icon: Icon(playback.playing ? Icons.pause : Icons.play_arrow, size: 38),
                  ),
                  const SizedBox(width: 14),
                  IconButton.filledTonal(onPressed: playback.stop, icon: const Icon(Icons.stop, size: 32)),
                ],
              ),
              if (playback.lastError != null) ...[
                const SizedBox(height: 16),
                Text(playback.lastError!, style: const TextStyle(color: rrnPink)),
              ],
            ],
          );
        },
      ),
    );
  }
}
