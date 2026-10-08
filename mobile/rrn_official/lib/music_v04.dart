import 'package:audio_service/audio_service.dart';
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

String _durationText(int seconds) {
  final m = seconds ~/ 60;
  final s = seconds % 60;
  return '$m:${s.toString().padLeft(2, '0')}';
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
      await RrnPlaybackController.instance.playMusic(item, queueItems: tracks);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: () => _load(reset: true),
      child: ListView(
        padding: const EdgeInsets.fromLTRB(14, 16, 14, 150),
        children: [
          const RrnSectionHeader(
            eyebrow: 'RRN Music',
            title: 'The native RRN catalog.',
            subtitle: 'Tracks come directly from the App Translation Matrix and now load into a real playback queue shared with Android media controls.',
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
                  onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const MusicLibraryScreen())),
                  icon: const Icon(Icons.library_music),
                  label: const Text('Library'),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const PlaybackQueueScreen())),
                  icon: const Icon(Icons.queue_music),
                  label: const Text('Queue'),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const WebFallbackScreen(path: '/store', title: 'RRN Store'))),
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
        leading: _artBox(artwork, 58),
        title: Text(title, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w900)),
        subtitle: Text([
          artist,
          if (genre.isNotEmpty) genre,
          if (duration > 0) _durationText(duration),
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
}

Widget _artBox(String artwork, double size) => ClipRRect(
      borderRadius: BorderRadius.circular(10),
      child: SizedBox(
        width: size,
        height: size,
        child: artwork.isEmpty
            ? const ColoredBox(color: Colors.black, child: Icon(Icons.album, color: rrnPurple))
            : Image.network(
                artwork,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => const ColoredBox(color: Colors.black, child: Icon(Icons.album, color: rrnPurple)),
              ),
      ),
    );

class MusicLibraryScreen extends StatefulWidget {
  const MusicLibraryScreen({super.key});

  @override
  State<MusicLibraryScreen> createState() => _MusicLibraryScreenState();
}

class _MusicLibraryScreenState extends State<MusicLibraryScreen> {
  final List<Map<String, dynamic>> items = [];
  bool busy = true;
  bool initialized = false;
  String source = '';
  String? error;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (initialized) return;
    initialized = true;
    _load();
  }

  Future<void> _load() async {
    final app = RrnScope.of(context);
    items.clear();
    setState(() {
      busy = true;
      error = null;
      source = '';
    });

    if (!app.auth.signedIn) {
      busy = false;
      if (mounted) setState(() {});
      return;
    }

    Object? libraryError;
    try {
      final body = await app.api.get('$rrnBase/api/library/music');
      final raw = <dynamic>[
        ...listFrom(body, const ['items', 'music', 'tracks', 'library', 'entitlements']),
        if (body is Map) ...listFrom(body['favorites']),
        if (body is Map) ...listFrom(body['purchases']),
      ];
      final seen = <String>{};
      for (final row in raw.whereType<Map>()) {
        final m = Map<String, dynamic>.from(row);
        final id = str(m['id'] ?? m['trackId'] ?? m['track_id'] ?? m['slug']);
        if (id.isEmpty || seen.add(id)) items.add(m);
      }
      if (items.isNotEmpty) source = 'RRN account library';
    } catch (e) {
      libraryError = e;
    }

    if (items.isEmpty) {
      try {
        final body = await app.api.get('/music/catalog', query: {'limit': 100});
        items.addAll(
          listFrom(body, const ['items'])
              .whereType<Map>()
              .map((e) => Map<String, dynamic>.from(e))
              .where((e) => boolish(e['favorited'])),
        );
        source = 'Matrix favorites';
      } catch (e) {
        error = '$e';
      }
    }

    if (items.isEmpty && error == null && libraryError != null) {
      error = 'The native account-library API did not accept the app session yet. Favorites remain available through the Matrix catalog.';
    }
    busy = false;
    if (mounted) setState(() {});
  }

  Future<void> _signIn() async {
    await Navigator.push(context, MaterialPageRoute(builder: (_) => const AccountScreen()));
    if (mounted) _load();
  }

  Future<void> _play(Map<String, dynamic> item) async {
    try {
      await RrnPlaybackController.instance.playMusic(item, queueItems: items);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    final app = RrnScope.of(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Library'),
        actions: [
          IconButton(onPressed: _load, icon: const Icon(Icons.refresh)),
          IconButton(
            onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const WebFallbackScreen(path: '/library', title: 'Full Web Library'))),
            icon: const Icon(Icons.language),
            tooltip: 'Full web library',
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(14, 16, 14, 110),
        children: [
          const RrnSectionHeader(
            eyebrow: 'Your RRN Music',
            title: 'Library & playlists.',
            subtitle: 'Owned music is requested from the RRN account library; Matrix favorites remain available when the older library route cannot use the native app session.',
          ),
          const SizedBox(height: 10),
          Row(children: [
            Expanded(
              child: OutlinedButton.icon(
                onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const PlaybackQueueScreen())),
                icon: const Icon(Icons.queue_music),
                label: const Text('Current Queue'),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: OutlinedButton.icon(
                onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const WebFallbackScreen(path: '/playlists', title: 'RRN Playlists'))),
                icon: const Icon(Icons.playlist_play),
                label: const Text('Web Playlists'),
              ),
            ),
          ]),
          if (!app.auth.signedIn)
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  const Text('Sign in to load your library', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18)),
                  const SizedBox(height: 6),
                  const Text('Favorites, purchases and account library data are user-specific.'),
                  const SizedBox(height: 10),
                  FilledButton.icon(onPressed: _signIn, icon: const Icon(Icons.login), label: const Text('Sign in')),
                ]),
              ),
            ),
          if (busy) const Padding(padding: EdgeInsets.all(34), child: Center(child: CircularProgressIndicator())),
          if (!busy && source.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 10, bottom: 4),
              child: Text(source.toUpperCase(), style: const TextStyle(color: rrnCyan, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1.4)),
            ),
          if (!busy && error != null)
            Card(child: Padding(padding: const EdgeInsets.all(14), child: Text(error!, style: const TextStyle(color: Colors.white60)))),
          if (!busy && app.auth.signedIn && items.isEmpty)
            const Card(child: Padding(padding: EdgeInsets.all(18), child: Text('No library tracks were returned for this account yet.'))),
          ...items.map((item) {
            final playable = RrnPlaybackController.instance.musicUrl(item).isNotEmpty;
            return Card(
              child: ListTile(
                leading: _artBox(_art(item), 54),
                title: Text(str(item['title'] ?? item['name'], 'RRN Track'), style: const TextStyle(fontWeight: FontWeight.w900)),
                subtitle: Text(str(item['artist'] ?? item['artist_name'] ?? item['artistName'], 'Reality Radio Network')),
                trailing: IconButton(
                  onPressed: playable ? () => _play(item) : null,
                  icon: Icon(playable ? Icons.play_circle_fill : Icons.block, color: playable ? rrnCyan : Colors.white24, size: 34),
                ),
                onTap: playable ? () => _play(item) : null,
              ),
            );
          }),
        ],
      ),
    );
  }
}

class PlaybackQueueScreen extends StatelessWidget {
  const PlaybackQueueScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final playback = RrnPlaybackController.instance;
    return Scaffold(
      appBar: AppBar(title: const Text('Playback Queue')),
      body: AnimatedBuilder(
        animation: playback,
        builder: (context, _) {
          final queue = playback.mediaQueue;
          return ListView(
            padding: const EdgeInsets.fromLTRB(14, 16, 14, 100),
            children: [
              RrnSectionHeader(
                eyebrow: playback.live ? 'Live Radio' : 'Music Queue',
                title: playback.live ? 'Live streams do not use a track queue.' : '${queue.length} track${queue.length == 1 ? '' : 's'} loaded.',
                subtitle: playback.live
                    ? 'Play, pause and stop remain available through the shared media session.'
                    : 'This is the same queue Android receives for Previous/Next and media-session playback.',
              ),
              const SizedBox(height: 12),
              if (queue.isEmpty) const Card(child: Padding(padding: EdgeInsets.all(18), child: Text('The playback queue is empty.'))),
              if (!playback.live && queue.isNotEmpty)
                Row(
                  children: [
                    Expanded(
                      child: FilterChip(
                        selected: playback.shuffleMode == AudioServiceShuffleMode.all,
                        onSelected: (_) => playback.toggleShuffle(),
                        avatar: const Icon(Icons.shuffle, size: 18),
                        label: const Text('Shuffle'),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: ActionChip(
                        onPressed: playback.cycleRepeat,
                        avatar: Icon(playback.repeatMode == AudioServiceRepeatMode.one ? Icons.repeat_one : Icons.repeat, size: 18),
                        label: Text(_repeatLabel(playback.repeatMode)),
                      ),
                    ),
                  ],
                ),
              ...List.generate(queue.length, (index) {
                final item = queue[index];
                final current = index == playback.queueIndex;
                return Card(
                  color: current ? const Color(0xFF10242B) : null,
                  child: ListTile(
                    leading: item.artUri == null ? const Icon(Icons.music_note) : _artBox(item.artUri.toString(), 48),
                    title: Text(item.title, style: TextStyle(fontWeight: current ? FontWeight.w900 : FontWeight.w700)),
                    subtitle: Text([item.artist ?? '', item.album ?? ''].where((e) => e.isNotEmpty).join(' · '), maxLines: 2, overflow: TextOverflow.ellipsis),
                    trailing: current ? const Icon(Icons.graphic_eq, color: rrnCyan) : Text('${index + 1}'),
                    onTap: playback.live ? null : () => playback.playQueueIndex(index),
                  ),
                );
              }),
            ],
          );
        },
      ),
    );
  }
}

String _repeatLabel(AudioServiceRepeatMode mode) => switch (mode) {
      AudioServiceRepeatMode.one => 'Repeat one',
      AudioServiceRepeatMode.all => 'Repeat all',
      _ => 'Repeat off',
    };

class MusicNowPlayingScreen extends StatelessWidget {
  const MusicNowPlayingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final playback = RrnPlaybackController.instance;
    return Scaffold(
      appBar: AppBar(
        title: const Text('Now Playing'),
        actions: [
          if (!playback.live)
            IconButton(
              onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const PlaybackQueueScreen())),
              icon: const Icon(Icons.queue_music),
              tooltip: 'Queue',
            ),
        ],
      ),
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
                Row(
                  children: [
                    Text(_durationText(playback.position.inSeconds), style: const TextStyle(color: Colors.white54, fontSize: 11)),
                    const Spacer(),
                    Text(_durationText(playback.duration.inSeconds), style: const TextStyle(color: Colors.white54, fontSize: 11)),
                  ],
                ),
              ],
              const SizedBox(height: 18),
              if (!playback.live)
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    IconButton(
                      onPressed: playback.toggleShuffle,
                      icon: Icon(Icons.shuffle, color: playback.shuffleMode == AudioServiceShuffleMode.all ? rrnCyan : Colors.white54),
                      tooltip: 'Shuffle',
                    ),
                    IconButton(
                      onPressed: playback.canSkip ? playback.skipPrevious : null,
                      icon: const Icon(Icons.skip_previous, size: 38),
                      tooltip: 'Previous',
                    ),
                    IconButton.filledTonal(
                      onPressed: playback.toggle,
                      icon: Icon(playback.playing ? Icons.pause : Icons.play_arrow, size: 40),
                    ),
                    IconButton(
                      onPressed: playback.canSkip ? playback.skipNext : null,
                      icon: const Icon(Icons.skip_next, size: 38),
                      tooltip: 'Next',
                    ),
                    IconButton(
                      onPressed: playback.cycleRepeat,
                      icon: Icon(
                        playback.repeatMode == AudioServiceRepeatMode.one ? Icons.repeat_one : Icons.repeat,
                        color: playback.repeatMode == AudioServiceRepeatMode.none ? Colors.white54 : rrnCyan,
                      ),
                      tooltip: _repeatLabel(playback.repeatMode),
                    ),
                  ],
                )
              else
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    IconButton.filledTonal(
                      onPressed: playback.toggle,
                      icon: Icon(playback.playing ? Icons.pause : Icons.play_arrow, size: 40),
                    ),
                    const SizedBox(width: 14),
                    IconButton.filledTonal(onPressed: playback.stop, icon: const Icon(Icons.stop, size: 32)),
                  ],
                ),
              if (!playback.live) ...[
                const SizedBox(height: 12),
                Center(
                  child: TextButton.icon(
                    onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const PlaybackQueueScreen())),
                    icon: const Icon(Icons.queue_music),
                    label: Text('Queue · ${playback.mediaQueue.length}'),
                  ),
                ),
              ],
              const SizedBox(height: 10),
              Center(child: TextButton.icon(onPressed: playback.stop, icon: const Icon(Icons.close), label: const Text('Close player'))),
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
