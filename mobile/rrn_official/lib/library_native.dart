import 'package:flutter/material.dart';

import 'account.dart';
import 'core.dart';
import 'playback.dart';

class NativePlaylistsScreen extends StatefulWidget {
  const NativePlaylistsScreen({super.key});

  @override
  State<NativePlaylistsScreen> createState() => _NativePlaylistsScreenState();
}

class _NativePlaylistsScreenState extends State<NativePlaylistsScreen> {
  bool initialized = false;
  bool busy = true;
  bool bridgeMissing = false;
  String? error;
  List<Map<String, dynamic>> playlists = [];

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (initialized) return;
    initialized = true;
    _load();
  }

  Future<void> _load() async {
    final app = RrnScope.of(context);
    if (!app.auth.signedIn) {
      setState(() {
        busy = false;
        bridgeMissing = false;
        error = null;
        playlists = [];
      });
      return;
    }
    setState(() {
      busy = true;
      bridgeMissing = false;
      error = null;
    });
    try {
      final body = await app.api.get('/library/playlists');
      playlists = listFrom(body, const ['playlists', 'items', 'library'])
          .whereType<Map>()
          .map((e) => Map<String, dynamic>.from(e))
          .toList();
    } on ApiException catch (e) {
      if (e.status == 404 || e.status == 405 || e.status == 501) {
        bridgeMissing = true;
      } else {
        error = e.message;
      }
    } catch (e) {
      error = '$e';
    } finally {
      busy = false;
      if (mounted) setState(() {});
    }
  }

  Future<void> _signIn() async {
    await Navigator.push(context, MaterialPageRoute(builder: (_) => const AccountScreen()));
    if (mounted) await _load();
  }

  @override
  Widget build(BuildContext context) {
    final app = RrnScope.of(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text('RRN Playlists'),
        actions: [IconButton(onPressed: _load, icon: const Icon(Icons.refresh))],
      ),
      body: RefreshIndicator(
        onRefresh: _load,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(14, 16, 14, 100),
          children: [
            const RrnSectionHeader(
              eyebrow: 'Native Music Library',
              title: 'Your playlists.',
              subtitle: 'This screen consumes the native app playlist contract directly. When the site exposes it, no WebView is involved.',
            ),
            const SizedBox(height: 12),
            if (!app.auth.signedIn)
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    const Text('Sign in to load playlists', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
                    const SizedBox(height: 6),
                    const Text('Playlists belong to your RRN account.'),
                    const SizedBox(height: 10),
                    FilledButton.icon(onPressed: _signIn, icon: const Icon(Icons.login), label: const Text('Sign in')),
                  ]),
                ),
              ),
            if (busy) const Padding(padding: EdgeInsets.all(30), child: Center(child: CircularProgressIndicator())),
            if (!busy && bridgeMissing)
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(18),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    const Text('SITE MATRIX UPDATE REQUIRED', style: TextStyle(color: rrnCyan, fontSize: 11, letterSpacing: 1.4, fontWeight: FontWeight.w900)),
                    const SizedBox(height: 8),
                    const Text('The mobile playlist UI is ready.', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900)),
                    const SizedBox(height: 8),
                    const Text('RealityRadio.net still needs to expose the authenticated app playlist bridge. The existing website playlist API uses the website session model and should not be called directly from the app.'),
                    const SizedBox(height: 12),
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(color: Colors.black26, borderRadius: BorderRadius.circular(14)),
                      child: const Text('GET /api/app/v1/library/playlists', style: TextStyle(color: rrnCyan, fontFamily: 'monospace')),
                    ),
                  ]),
                ),
              ),
            if (!busy && error != null)
              Card(child: Padding(padding: const EdgeInsets.all(16), child: Text(error!, style: const TextStyle(color: Colors.white70)))),
            if (!busy && app.auth.signedIn && !bridgeMissing && error == null && playlists.isEmpty)
              const Card(child: Padding(padding: EdgeInsets.all(18), child: Text('No playlists were returned for this account.'))),
            ...playlists.map((playlist) {
              final id = str(playlist['id'] ?? playlist['playlistId'] ?? playlist['playlist_id']);
              final name = str(playlist['name'] ?? playlist['title'], 'Untitled playlist');
              final description = str(playlist['description'] ?? playlist['summary']);
              final count = numi(playlist['trackCount'] ?? playlist['track_count'] ?? playlist['itemsCount'] ?? playlist['items_count']);
              final art = _absolute(str(playlist['artwork'] ?? playlist['artworkUrl'] ?? playlist['artwork_url'] ?? playlist['image']));
              return Card(
                child: ListTile(
                  leading: ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: SizedBox(
                      width: 54,
                      height: 54,
                      child: art.isEmpty
                          ? const ColoredBox(color: Colors.black26, child: Icon(Icons.queue_music, color: rrnCyan))
                          : Image.network(art, fit: BoxFit.cover, errorBuilder: (_, __, ___) => const ColoredBox(color: Colors.black26, child: Icon(Icons.queue_music, color: rrnCyan))),
                    ),
                  ),
                  title: Text(name, style: const TextStyle(fontWeight: FontWeight.w900)),
                  subtitle: Text([if (description.isNotEmpty) description, if (count > 0) '$count tracks'].join('\n'), maxLines: 3, overflow: TextOverflow.ellipsis),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: id.isEmpty ? null : () => Navigator.push(context, MaterialPageRoute(builder: (_) => NativePlaylistDetailScreen(id: id, title: name))),
                ),
              );
            }),
          ],
        ),
      ),
    );
  }
}

class NativePlaylistDetailScreen extends StatefulWidget {
  final String id;
  final String title;
  const NativePlaylistDetailScreen({super.key, required this.id, required this.title});

  @override
  State<NativePlaylistDetailScreen> createState() => _NativePlaylistDetailScreenState();
}

class _NativePlaylistDetailScreenState extends State<NativePlaylistDetailScreen> {
  bool busy = true;
  bool bridgeMissing = false;
  String? error;
  Map<String, dynamic> playlist = {};
  List<Map<String, dynamic>> tracks = [];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  Future<void> _load() async {
    setState(() {
      busy = true;
      bridgeMissing = false;
      error = null;
    });
    try {
      final body = await RrnScope.of(context).api.get('/library/playlists/${widget.id}');
      if (body is Map) {
        playlist = body['playlist'] is Map ? Map<String, dynamic>.from(body['playlist']) : Map<String, dynamic>.from(body);
        tracks = listFrom(body, const ['tracks', 'items'])
            .whereType<Map>()
            .map((e) => Map<String, dynamic>.from(e))
            .toList();
      }
    } on ApiException catch (e) {
      if (e.status == 404 || e.status == 405 || e.status == 501) {
        bridgeMissing = true;
      } else {
        error = e.message;
      }
    } catch (e) {
      error = '$e';
    } finally {
      busy = false;
      if (mounted) setState(() {});
    }
  }

  Future<void> _play(int index) async {
    final playable = tracks.where((item) => RrnPlaybackController.instance.musicUrl(item).isNotEmpty).toList();
    final selected = tracks[index];
    if (RrnPlaybackController.instance.musicUrl(selected).isEmpty) return;
    try {
      await RrnPlaybackController.instance.playMusic(selected, queueItems: playable);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: Text(str(playlist['name'] ?? playlist['title'], widget.title))),
        body: RefreshIndicator(
          onRefresh: _load,
          child: ListView(
            padding: const EdgeInsets.fromLTRB(14, 14, 14, 100),
            children: [
              if (busy) const Padding(padding: EdgeInsets.all(30), child: Center(child: CircularProgressIndicator())),
              if (!busy && bridgeMissing)
                const Card(child: Padding(padding: EdgeInsets.all(18), child: Text('Playlist detail requires GET /api/app/v1/library/playlists/[id] in the next RealityRadio.net Matrix build.'))),
              if (!busy && error != null) Card(child: Padding(padding: const EdgeInsets.all(16), child: Text(error!))),
              if (!busy && !bridgeMissing && error == null) ...[
                if (str(playlist['description']).isNotEmpty)
                  Padding(padding: const EdgeInsets.only(bottom: 12), child: Text(str(playlist['description']), style: const TextStyle(color: Colors.white70))),
                if (tracks.isEmpty) const Card(child: Padding(padding: EdgeInsets.all(18), child: Text('This playlist is empty.'))),
                ...List.generate(tracks.length, (index) {
                  final track = tracks[index];
                  final title = str(track['title'] ?? track['name'], 'RRN Track');
                  final artist = str(track['artist'] ?? track['artistName'] ?? track['artist_name'], 'Reality Radio Network');
                  final art = _absolute(str(track['artwork'] ?? track['artworkUrl'] ?? track['artwork_url'] ?? track['image']));
                  final playable = RrnPlaybackController.instance.musicUrl(track).isNotEmpty;
                  return Card(
                    child: ListTile(
                      leading: art.isEmpty
                          ? const CircleAvatar(child: Icon(Icons.music_note))
                          : ClipRRect(borderRadius: BorderRadius.circular(8), child: Image.network(art, width: 48, height: 48, fit: BoxFit.cover, errorBuilder: (_, __, ___) => const SizedBox(width: 48, height: 48, child: Icon(Icons.music_note)))),
                      title: Text(title, style: const TextStyle(fontWeight: FontWeight.w800)),
                      subtitle: Text(artist),
                      trailing: IconButton(onPressed: playable ? () => _play(index) : null, icon: Icon(playable ? Icons.play_circle_fill : Icons.block, color: playable ? rrnCyan : Colors.white24)),
                      onTap: playable ? () => _play(index) : null,
                    ),
                  );
                }),
              ],
            ],
          ),
        ),
      );
}

String _absolute(String value) {
  if (value.isEmpty) return '';
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  return '$rrnBase${value.startsWith('/') ? value : '/$value'}';
}
