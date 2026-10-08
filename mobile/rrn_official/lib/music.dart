import 'package:flutter/material.dart';
import 'package:just_audio/just_audio.dart';
import 'package:just_audio_background/just_audio_background.dart';

import 'account.dart';
import 'core.dart';
import 'site.dart';

class MusicScreen extends StatefulWidget {
  const MusicScreen({super.key});
  @override
  State<MusicScreen> createState() => _MusicScreenState();
}

class _MusicScreenState extends State<MusicScreen> {
  final query = TextEditingController();
  List<dynamic> results = [];
  bool busy = false;
  String? error;
  bool loaded = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!loaded) {
      loaded = true;
      _search();
    }
  }

  Future<void> _search() async {
    setState(() {
      busy = true;
      error = null;
    });
    try {
      final body = await RrnScope.of(context).api.get('/music/search', query: {'q': query.text.trim()});
      results = listFrom(body, const ['tracks', 'music', 'releases', 'results']);
    } catch (e) {
      error = '$e';
    } finally {
      busy = false;
      if (mounted) setState(() {});
    }
  }

  Future<void> _favorite(dynamic item) async {
    final app = RrnScope.of(context);
    if (!app.auth.signedIn) {
      await Navigator.push(context, MaterialPageRoute(builder: (_) => const AccountScreen()));
      if (!app.auth.signedIn) return;
    }
    final m = item is Map ? Map<String, dynamic>.from(item) : <String, dynamic>{};
    try {
      await app.api.post('/music/favorite', body: {
        'id': str(m['id'] ?? m['trackId'] ?? m['track_id'] ?? m['releaseId'] ?? m['release_id']),
        'type': str(m['type'] ?? m['kind'], 'track'),
      });
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Saved to your RRN library.')));
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    }
  }

  @override
  Widget build(BuildContext context) => RefreshIndicator(
        onRefresh: _search,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(14, 16, 14, 120),
          children: [
            const RrnSectionHeader(
              eyebrow: 'RRN Music',
              title: 'Listen. Discover. Connect.',
              subtitle: 'All app-visible releases come from the same RRN catalog, entitlement and store data as the website.',
            ),
            const SizedBox(height: 16),
            TextField(
              controller: query,
              textInputAction: TextInputAction.search,
              onSubmitted: (_) => _search(),
              decoration: InputDecoration(
                labelText: 'Search artists, tracks and releases',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: IconButton(onPressed: _search, icon: const Icon(Icons.arrow_forward)),
              ),
            ),
            const SizedBox(height: 12),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _chip('My Library', Icons.library_music_outlined, '/account/library'),
                  _chip('Purchases', Icons.receipt_long_outlined, '/account/orders'),
                  _chip('Artists', Icons.person_search_outlined, '/music/artists'),
                  _chip('Store', Icons.storefront_outlined, '/store'),
                ],
              ),
            ),
            if (busy) const Padding(padding: EdgeInsets.all(26), child: Center(child: CircularProgressIndicator())),
            if (error != null) Card(child: Padding(padding: const EdgeInsets.all(14), child: Text(error!, style: const TextStyle(color: Colors.white60)))),
            ...results.map(_item),
          ],
        ),
      );

  Widget _chip(String label, IconData icon, String path) => Padding(
        padding: const EdgeInsets.only(right: 8),
        child: ActionChip(
          avatar: Icon(icon, size: 17),
          label: Text(label),
          onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => MatrixPageScreen(path: path, title: label))),
        ),
      );

  Widget _item(dynamic raw) {
    final m = raw is Map ? Map<String, dynamic>.from(raw) : <String, dynamic>{};
    final title = str(m['title'] ?? m['name'], 'Untitled');
    final artist = str(m['artist'] ?? m['artistName'] ?? m['artist_name']);
    final art = str(m['artwork'] ?? m['coverUrl'] ?? m['cover_url'] ?? m['artworkUrl'] ?? m['artwork_url']);
    final owned = boolish(m['owned'] ?? m['purchased']);
    final playable = str(m['streamUrl'] ?? m['stream_url'] ?? m['audioUrl'] ?? m['audio_url']).isNotEmpty;
    return Card(
      child: ListTile(
        leading: ClipRRect(
          borderRadius: BorderRadius.circular(10),
          child: SizedBox(
            width: 52,
            height: 52,
            child: art.startsWith('http')
                ? Image.network(art, fit: BoxFit.cover, errorBuilder: (_, __, ___) => const ColoredBox(color: Colors.black, child: Icon(Icons.album, color: rrnPurple)))
                : const ColoredBox(color: Colors.black, child: Icon(Icons.album, color: rrnPurple)),
          ),
        ),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w800)),
        subtitle: Text([artist, if (owned) 'Owned', if (!owned && boolish(m['purchasable'])) str(m['price'] ?? m['displayPrice'])].where((e) => e.isNotEmpty).join(' · ')),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            IconButton(onPressed: () => _favorite(raw), icon: const Icon(Icons.favorite_border)),
            if (playable) IconButton(onPressed: () => _play(m), icon: const Icon(Icons.play_circle_fill, color: rrnCyan)),
          ],
        ),
        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => MatrixObjectScreen(title: title, data: m))),
      ),
    );
  }

  void _play(Map<String, dynamic> item) {
    Navigator.push(context, MaterialPageRoute(builder: (_) => MusicPlayerScreen(item: item)));
  }
}

class MusicPlayerScreen extends StatefulWidget {
  final Map<String, dynamic> item;
  const MusicPlayerScreen({super.key, required this.item});

  @override
  State<MusicPlayerScreen> createState() => _MusicPlayerScreenState();
}

class _MusicPlayerScreenState extends State<MusicPlayerScreen> {
  final AudioPlayer player = AudioPlayer();
  bool ready = false;
  String? error;

  String get title => str(widget.item['title'] ?? widget.item['name'], 'Track');
  String get artist => str(widget.item['artist'] ?? widget.item['artistName'] ?? widget.item['artist_name']);
  String get art => str(widget.item['artwork'] ?? widget.item['coverUrl'] ?? widget.item['cover_url'] ?? widget.item['artworkUrl'] ?? widget.item['artwork_url']);
  String get stream => str(widget.item['streamUrl'] ?? widget.item['stream_url'] ?? widget.item['audioUrl'] ?? widget.item['audio_url']);

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      await player.setAudioSource(
        AudioSource.uri(
          Uri.parse(stream),
          tag: MediaItem(
            id: str(widget.item['id'] ?? stream),
            title: title,
            artist: artist,
            album: str(widget.item['releaseTitle'] ?? widget.item['release_title'] ?? widget.item['album']),
            artUri: art.startsWith('http') ? Uri.tryParse(art) : null,
          ),
        ),
      );
      ready = true;
      await player.play();
    } catch (e) {
      error = '$e';
    }
    if (mounted) setState(() {});
  }

  @override
  void dispose() {
    player.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: const Text('Now Playing')),
        body: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              const Spacer(),
              AspectRatio(
                aspectRatio: 1,
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(28),
                  child: art.startsWith('http')
                      ? Image.network(art, fit: BoxFit.cover, errorBuilder: (_, __, ___) => const ColoredBox(color: Colors.black, child: Icon(Icons.album, size: 96, color: rrnPurple)))
                      : const ColoredBox(color: Colors.black, child: Icon(Icons.album, size: 96, color: rrnPurple)),
                ),
              ),
              const SizedBox(height: 26),
              Text(title, textAlign: TextAlign.center, style: const TextStyle(fontSize: 25, fontWeight: FontWeight.w900)),
              if (artist.isNotEmpty) Text(artist, style: const TextStyle(fontSize: 17, color: Colors.white60)),
              const SizedBox(height: 18),
              StreamBuilder<Duration>(
                stream: player.positionStream,
                builder: (_, pos) => StreamBuilder<Duration?>(
                  stream: player.durationStream,
                  builder: (_, dur) {
                    final position = pos.data ?? Duration.zero;
                    final duration = dur.data ?? Duration.zero;
                    final max = duration.inMilliseconds <= 0 ? 1.0 : duration.inMilliseconds.toDouble();
                    return Column(children: [
                      Slider(
                        value: position.inMilliseconds.toDouble().clamp(0.0, max).toDouble(),
                        max: max,
                        onChanged: duration.inMilliseconds <= 0 ? null : (v) => player.seek(Duration(milliseconds: v.round())),
                      ),
                      Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [Text(_time(position)), Text(_time(duration))]),
                    ]);
                  },
                ),
              ),
              const SizedBox(height: 8),
              StreamBuilder<PlayerState>(
                stream: player.playerStateStream,
                builder: (_, snapshot) {
                  final playing = snapshot.data?.playing ?? false;
                  return Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      IconButton(
                        onPressed: () => player.seek(Duration(milliseconds: (player.position.inMilliseconds - 10000).clamp(0, 1 << 31).toInt())),
                        icon: const Icon(Icons.replay_10),
                      ),
                      const SizedBox(width: 12),
                      FilledButton(
                        onPressed: !ready ? null : () => playing ? player.pause() : player.play(),
                        style: FilledButton.styleFrom(shape: const CircleBorder(), padding: const EdgeInsets.all(18)),
                        child: Icon(playing ? Icons.pause : Icons.play_arrow, size: 34),
                      ),
                      const SizedBox(width: 12),
                      IconButton(onPressed: () => player.seek(player.position + const Duration(seconds: 10)), icon: const Icon(Icons.forward_10)),
                    ],
                  );
                },
              ),
              if (error != null) Padding(padding: const EdgeInsets.only(top: 10), child: Text(error!, style: const TextStyle(color: Colors.white60))),
              const Spacer(),
            ],
          ),
        ),
      );

  String _time(Duration d) {
    final m = d.inMinutes;
    final s = d.inSeconds % 60;
    return '$m:${s.toString().padLeft(2, '0')}';
  }
}
