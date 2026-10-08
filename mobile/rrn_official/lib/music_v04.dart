import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

import 'account.dart';
import 'core.dart';
import 'playback.dart';
import 'site.dart';

String _musicArt(dynamic raw) {
  if (raw is! Map) return '';
  final m = Map<String, dynamic>.from(raw);
  final value = str(m['artwork'] ?? m['image'] ?? m['coverUrl'] ?? m['cover_url'] ?? m['artworkUrl'] ?? m['artwork_url']);
  if (value.isEmpty) return '';
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  return '$rrnBase${value.startsWith('/') ? value : '/$value'}';
}

String _musicId(dynamic raw) {
  if (raw is! Map) return '';
  final m = Map<String, dynamic>.from(raw);
  return str(m['id'] ?? m['slug'] ?? m['catalog']);
}

class MusicScreenV04 extends StatefulWidget {
  const MusicScreenV04({super.key});
  @override
  State<MusicScreenV04> createState() => _MusicScreenV04State();
}

class _MusicScreenV04State extends State<MusicScreenV04> {
  final search = TextEditingController();
  List<Map<String, dynamic>> albums = [];
  List<Map<String, dynamic>> singles = [];
  List<Map<String, dynamic>> artists = [];
  final Set<String> ownedIds = {};
  bool busy = true;
  String filter = 'ALL';
  String? warning;
  bool initialized = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (initialized) return;
    initialized = true;
    _load();
  }

  Future<dynamic> _publicJson(String path) async {
    final response = await http.get(Uri.parse('$rrnBase$path')).timeout(const Duration(seconds: 20));
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw StateError('RRN catalog request failed (${response.statusCode}).');
    }
    return jsonDecode(response.body);
  }

  Future<void> _load() async {
    setState(() {
      busy = true;
      warning = null;
    });
    final app = RrnScope.of(context);
    final errors = <String>[];
    try {
      final values = await Future.wait([
        _publicJson('/api/v2/albums'),
        _publicJson('/api/v2/singles'),
        _publicJson('/api/v2/artists'),
      ]);
      albums = listFrom(values[0]).whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList();
      singles = listFrom(values[1]).whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList();
      artists = listFrom(values[2]).whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList();
    } catch (e) {
      errors.add('$e');
    }

    ownedIds.clear();
    if (app.auth.signedIn) {
      for (final endpoint in const ['/music/library', '/music/purchases', '/account/library']) {
        try {
          final body = await app.api.get(endpoint);
          for (final row in listFrom(body, const ['items', 'tracks', 'releases', 'purchases', 'library'])) {
            final id = _musicId(row);
            if (id.isNotEmpty) ownedIds.add(id);
            if (row is Map) {
              final m = Map<String, dynamic>.from(row);
              final catalog = str(m['catalog']);
              final slug = str(m['slug']);
              if (catalog.isNotEmpty) ownedIds.add(catalog);
              if (slug.isNotEmpty) ownedIds.add(slug);
            }
          }
          if (ownedIds.isNotEmpty) break;
        } catch (_) {}
      }
    }

    if (albums.isEmpty && singles.isEmpty && artists.isEmpty) {
      errors.add('The RRN public catalog returned no renderable items.');
    }
    warning = errors.isEmpty ? null : errors.join('\n');
    busy = false;
    if (mounted) setState(() {});
  }

  bool _matches(Map<String, dynamic> item) {
    final q = search.text.trim().toLowerCase();
    if (q.isEmpty) return true;
    return item.values.map((e) => '$e').join(' ').toLowerCase().contains(q);
  }

  bool _owned(Map<String, dynamic> item) {
    if (boolish(item['owned'] ?? item['purchased'])) return true;
    return [str(item['id']), str(item['slug']), str(item['catalog'])].where((e) => e.isNotEmpty).any(ownedIds.contains);
  }

  @override
  Widget build(BuildContext context) {
    final qAlbums = albums.where(_matches).toList();
    final qSingles = singles.where(_matches).toList();
    final qArtists = artists.where(_matches).toList();
    final ownedSingles = qSingles.where(_owned).toList();
    final ownedAlbums = qAlbums.where(_owned).toList();

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(14, 16, 14, 140),
        children: [
          const RrnSectionHeader(
            eyebrow: 'RRN Music',
            title: 'The complete RRN music catalog.',
            subtitle: 'Owned and unowned releases render from the same catalog as RealityRadio.net. Playback uses the persistent native RRN media session.',
          ),
          const SizedBox(height: 14),
          TextField(
            controller: search,
            onChanged: (_) => setState(() {}),
            decoration: InputDecoration(
              labelText: 'Search music',
              hintText: 'Tracks, albums, artists, genres, catalog numbers…',
              prefixIcon: const Icon(Icons.search),
              suffixIcon: search.text.isEmpty
                  ? null
                  : IconButton(
                      onPressed: () {
                        search.clear();
                        setState(() {});
                      },
                      icon: const Icon(Icons.clear),
                    ),
            ),
          ),
          const SizedBox(height: 10),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                for (final value in const ['ALL', 'TRACKS', 'ALBUMS', 'ARTISTS', 'OWNED'])
                  Padding(
                    padding: const EdgeInsets.only(right: 6),
                    child: ChoiceChip(label: Text(value), selected: filter == value, onSelected: (_) => setState(() => filter = value)),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(child: _quick('Library', Icons.library_music, '/account/library')),
              const SizedBox(width: 8),
              Expanded(child: _quick('Purchases', Icons.receipt_long, '/account/orders')),
              const SizedBox(width: 8),
              Expanded(child: _quick('Store', Icons.storefront, '/store')),
            ],
          ),
          if (busy) const Padding(padding: EdgeInsets.all(30), child: Center(child: CircularProgressIndicator())),
          if (warning != null)
            Card(
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Text(warning!, style: const TextStyle(color: Colors.white60)),
              ),
            ),
          if (!busy && (filter == 'ALL' || filter == 'OWNED')) ...[
            if (filter == 'OWNED')
              _section(
                'Owned music',
                'Purchases and entitlements connected to your signed-in RRN account.',
                [...ownedSingles.map((e) => _singleCard(e)), ...ownedAlbums.map((e) => _albumCard(e))],
                empty: RrnScope.of(context).auth.signedIn
                    ? 'No owned items were returned by the current entitlement bridge.'
                    : 'Sign in to render your owned RRN music.',
              )
            else ...[
              _section('Featured / newest releases', 'Albums and EP-style releases from the RRN catalog.', qAlbums.take(12).map(_albumCard).toList()),
              _section('Tracks & singles', 'Playable previews and store-accessible tracks.', qSingles.take(30).map(_singleCard).toList()),
              _section('Artists', 'RRN artist pages and catalogs.', qArtists.take(20).map(_artistCard).toList()),
            ],
          ],
          if (!busy && filter == 'TRACKS') _section('Tracks & singles', null, qSingles.map(_singleCard).toList()),
          if (!busy && filter == 'ALBUMS') _section('Albums & releases', null, qAlbums.map(_albumCard).toList()),
          if (!busy && filter == 'ARTISTS') _section('Artists', null, qArtists.map(_artistCard).toList()),
        ],
      ),
    );
  }

  Widget _quick(String label, IconData icon, String path) => OutlinedButton.icon(
        onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => MatrixPageScreen(path: path, title: label))),
        icon: Icon(icon, size: 18),
        label: Text(label),
      );

  Widget _section(String title, String? subtitle, List<Widget> children, {String empty = 'Nothing matched this view.'}) {
    return Padding(
      padding: const EdgeInsets.only(top: 18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontSize: 21, fontWeight: FontWeight.w900)),
          if (subtitle != null) Text(subtitle, style: const TextStyle(color: Colors.white54)),
          const SizedBox(height: 8),
          if (children.isEmpty) Card(child: Padding(padding: const EdgeInsets.all(16), child: Text(empty))) else ...children,
        ],
      ),
    );
  }

  Widget _singleCard(Map<String, dynamic> item) {
    final title = str(item['title'] ?? item['name'], 'Track');
    final artist = str(item['artist'] ?? item['artistName'] ?? item['artist_name']);
    final album = str(item['album'] ?? item['albumTitle'] ?? item['album_title']);
    final price = numd(item['price'] ?? item['digitalPrice'] ?? item['digital_price']);
    final art = _musicArt(item);
    final owned = _owned(item);
    final playable = RrnPlaybackController.instance.musicUrl(item).isNotEmpty;
    return Card(
      child: ListTile(
        leading: _artwork(art, 56),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w900)),
        subtitle: Text([
          artist,
          album,
          if (owned) 'Owned',
          if (!owned && price > 0) '\$${price.toStringAsFixed(2)}',
        ].where((e) => e.isNotEmpty).join(' · ')),
        trailing: IconButton(
          onPressed: playable ? () => _play(item) : null,
          icon: const Icon(Icons.play_circle_fill, color: rrnCyan, size: 34),
        ),
        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => SingleDetailScreen(item: item, owned: owned))),
      ),
    );
  }

  Widget _albumCard(Map<String, dynamic> item) {
    final title = str(item['title'] ?? item['name'], 'Release');
    final artist = str(item['artist'] ?? item['artistName'] ?? item['artist_name']);
    final price = numd(item['digitalPrice'] ?? item['digital_price'] ?? item['price']);
    final art = _musicArt(item);
    final owned = _owned(item);
    return Card(
      child: ListTile(
        leading: _artwork(art, 64),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w900)),
        subtitle: Text([
          artist,
          str(item['genre']),
          if (owned) 'Owned',
          if (!owned && price > 0) '\$${price.toStringAsFixed(2)}',
        ].where((e) => e.isNotEmpty).join(' · ')),
        trailing: const Icon(Icons.chevron_right),
        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => AlbumDetailScreen(album: item, owned: owned))),
      ),
    );
  }

  Widget _artistCard(Map<String, dynamic> item) {
    final name = str(item['name'] ?? item['artist'], 'Artist');
    final art = _musicArt(item);
    return Card(
      child: ListTile(
        leading: _artwork(art, 56, person: true),
        title: Text(name, style: const TextStyle(fontWeight: FontWeight.w900)),
        subtitle: Text(str(item['genre'] ?? item['bio'] ?? item['description']), maxLines: 2, overflow: TextOverflow.ellipsis),
        trailing: const Icon(Icons.chevron_right),
        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => ArtistCatalogScreen(artist: item, albums: albums, singles: singles))),
      ),
    );
  }

  Widget _artwork(String url, double size, {bool person = false}) => ClipRRect(
        borderRadius: BorderRadius.circular(person ? size / 2 : 11),
        child: SizedBox(
          width: size,
          height: size,
          child: url.isNotEmpty
              ? Image.network(url, fit: BoxFit.cover, errorBuilder: (_, __, ___) => ColoredBox(color: Colors.black, child: Icon(person ? Icons.person : Icons.album, color: rrnPurple)))
              : ColoredBox(color: Colors.black, child: Icon(person ? Icons.person : Icons.album, color: rrnPurple)),
        ),
      );

  Future<void> _play(Map<String, dynamic> item) async {
    try {
      await RrnPlaybackController.instance.playMusic(item);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    }
  }
}

class AlbumDetailScreen extends StatefulWidget {
  final Map<String, dynamic> album;
  final bool owned;
  const AlbumDetailScreen({super.key, required this.album, required this.owned});

  @override
  State<AlbumDetailScreen> createState() => _AlbumDetailScreenState();
}

class _AlbumDetailScreenState extends State<AlbumDetailScreen> {
  List<Map<String, dynamic>> tracks = [];
  bool busy = true;

  @override
  void initState() {
    super.initState();
    _loadTracks();
  }

  Future<void> _loadTracks() async {
    final embedded = listFrom(widget.album['tracklist']).whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList();
    if (embedded.isNotEmpty) {
      tracks = embedded;
    } else {
      final id = str(widget.album['id'] ?? widget.album['slug']);
      if (id.isNotEmpty) {
        try {
          final response = await http.get(Uri.parse('$rrnBase/api/v2/tracks?albumId=${Uri.encodeQueryComponent(id)}')).timeout(const Duration(seconds: 20));
          if (response.statusCode >= 200 && response.statusCode < 300) {
            tracks = listFrom(jsonDecode(response.body)).whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList();
          }
        } catch (_) {}
      }
    }
    final albumTitle = str(widget.album['title'] ?? widget.album['name']);
    final artist = str(widget.album['artist'] ?? widget.album['artistName'] ?? widget.album['artist_name']);
    final art = _musicArt(widget.album);
    for (final track in tracks) {
      track.putIfAbsent('album', () => albumTitle);
      track.putIfAbsent('artist', () => artist);
      track.putIfAbsent('artwork', () => art);
      if (track['previewUrl'] == null && track['preview_url'] != null) track['previewUrl'] = track['preview_url'];
    }
    busy = false;
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final album = widget.album;
    final title = str(album['title'] ?? album['name'], 'Release');
    final artist = str(album['artist'] ?? album['artistName'] ?? album['artist_name']);
    final art = _musicArt(album);
    final price = numd(album['digitalPrice'] ?? album['digital_price'] ?? album['price']);
    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 110),
        children: [
          if (art.isNotEmpty) ClipRRect(borderRadius: BorderRadius.circular(26), child: Image.network(art, height: 300, fit: BoxFit.cover)),
          const SizedBox(height: 16),
          Text(title, style: const TextStyle(fontSize: 30, fontWeight: FontWeight.w900)),
          Text(artist, style: const TextStyle(fontSize: 18, color: rrnCyan, fontWeight: FontWeight.w700)),
          Text([str(album['genre']), str(album['year'])].where((e) => e.isNotEmpty).join(' · '), style: const TextStyle(color: Colors.white60)),
          if (str(album['description']).isNotEmpty) ...[const SizedBox(height: 12), Text(str(album['description']), style: const TextStyle(color: Colors.white70, height: 1.4))],
          const SizedBox(height: 14),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              if (tracks.isNotEmpty && RrnPlaybackController.instance.musicUrl(tracks.first).isNotEmpty)
                FilledButton.icon(onPressed: () => RrnPlaybackController.instance.playMusic(tracks.first), icon: const Icon(Icons.play_arrow), label: const Text('Play')),
              OutlinedButton.icon(
                onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => MatrixPageScreen(path: '/store/albums/${str(album['slug'] ?? album['id'])}', title: title))),
                icon: const Icon(Icons.shopping_bag_outlined),
                label: Text(widget.owned ? 'Owned' : price > 0 ? '\$${price.toStringAsFixed(2)}' : 'Store'),
              ),
            ],
          ),
          const SizedBox(height: 18),
          const Text('Tracklist', style: TextStyle(fontSize: 21, fontWeight: FontWeight.w900)),
          if (busy) const Padding(padding: EdgeInsets.all(20), child: Center(child: CircularProgressIndicator())),
          ...tracks.asMap().entries.map((entry) {
            final index = entry.key;
            final track = entry.value;
            final title = str(track['title'] ?? track['name'], 'Track ${index + 1}');
            final duration = str(track['duration']);
            final playable = RrnPlaybackController.instance.musicUrl(track).isNotEmpty;
            return ListTile(
              contentPadding: EdgeInsets.zero,
              leading: SizedBox(width: 28, child: Text('${numi(track['track_number'] ?? track['number'], index + 1)}', textAlign: TextAlign.center, style: const TextStyle(color: Colors.white54))),
              title: Text(title, style: const TextStyle(fontWeight: FontWeight.w800)),
              subtitle: duration.isEmpty ? null : Text(duration),
              trailing: IconButton(onPressed: playable ? () => RrnPlaybackController.instance.playMusic(track) : null, icon: const Icon(Icons.play_circle_outline)),
            );
          }),
        ],
      ),
    );
  }
}

class SingleDetailScreen extends StatelessWidget {
  final Map<String, dynamic> item;
  final bool owned;
  const SingleDetailScreen({super.key, required this.item, required this.owned});

  @override
  Widget build(BuildContext context) {
    final title = str(item['title'] ?? item['name'], 'Track');
    final artist = str(item['artist'] ?? item['artistName'] ?? item['artist_name']);
    final art = _musicArt(item);
    final price = numd(item['price'] ?? item['digitalPrice'] ?? item['digital_price']);
    final playable = RrnPlaybackController.instance.musicUrl(item).isNotEmpty;
    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          if (art.isNotEmpty) ClipRRect(borderRadius: BorderRadius.circular(28), child: Image.network(art, fit: BoxFit.cover)),
          const SizedBox(height: 20),
          Text(title, style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900)),
          Text(artist, style: const TextStyle(color: rrnCyan, fontSize: 18)),
          if (str(item['album']).isNotEmpty) Text(str(item['album']), style: const TextStyle(color: Colors.white60)),
          if (str(item['description']).isNotEmpty) ...[const SizedBox(height: 14), Text(str(item['description']), style: const TextStyle(color: Colors.white70))],
          const SizedBox(height: 16),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              FilledButton.icon(onPressed: playable ? () => RrnPlaybackController.instance.playMusic(item) : null, icon: const Icon(Icons.play_arrow), label: const Text('Play')),
              OutlinedButton.icon(
                onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => MatrixPageScreen(path: '/store/singles/${str(item['slug'] ?? item['id'])}', title: title))),
                icon: const Icon(Icons.shopping_bag_outlined),
                label: Text(owned ? 'Owned' : price > 0 ? '\$${price.toStringAsFixed(2)}' : 'Store'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class ArtistCatalogScreen extends StatelessWidget {
  final Map<String, dynamic> artist;
  final List<Map<String, dynamic>> albums;
  final List<Map<String, dynamic>> singles;
  const ArtistCatalogScreen({super.key, required this.artist, required this.albums, required this.singles});

  @override
  Widget build(BuildContext context) {
    final name = str(artist['name'] ?? artist['artist'], 'Artist');
    final slug = str(artist['slug'] ?? artist['id']);
    bool match(Map<String, dynamic> item) {
      final itemSlug = str(item['artistSlug'] ?? item['artist_slug']);
      final itemName = str(item['artist'] ?? item['artistName'] ?? item['artist_name']);
      return (slug.isNotEmpty && itemSlug == slug) || itemName.toLowerCase() == name.toLowerCase();
    }

    final artistAlbums = albums.where(match).toList();
    final artistSingles = singles.where(match).toList();
    return Scaffold(
      appBar: AppBar(title: Text(name)),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
        children: [
          Text(name, style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w900)),
          if (str(artist['bio'] ?? artist['description']).isNotEmpty) ...[const SizedBox(height: 8), Text(str(artist['bio'] ?? artist['description']), style: const TextStyle(color: Colors.white70))],
          const SizedBox(height: 16),
          OutlinedButton.icon(
            onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => MatrixPageScreen(path: '/artists/$slug', title: name))),
            icon: const Icon(Icons.person),
            label: const Text('Full artist page'),
          ),
          const SizedBox(height: 18),
          const Text('Releases', style: TextStyle(fontSize: 21, fontWeight: FontWeight.w900)),
          ...artistAlbums.map((album) => ListTile(
                title: Text(str(album['title'] ?? album['name']), style: const TextStyle(fontWeight: FontWeight.w800)),
                subtitle: Text(str(album['year'])),
                trailing: const Icon(Icons.chevron_right),
                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => AlbumDetailScreen(album: album, owned: false))),
              )),
          const SizedBox(height: 14),
          const Text('Tracks & singles', style: TextStyle(fontSize: 21, fontWeight: FontWeight.w900)),
          ...artistSingles.map((track) => ListTile(
                title: Text(str(track['title'] ?? track['name']), style: const TextStyle(fontWeight: FontWeight.w800)),
                trailing: IconButton(onPressed: RrnPlaybackController.instance.musicUrl(track).isEmpty ? null : () => RrnPlaybackController.instance.playMusic(track), icon: const Icon(Icons.play_circle_outline)),
                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => SingleDetailScreen(item: track, owned: false))),
              )),
        ],
      ),
    );
  }
}

class MusicNowPlayingScreen extends StatelessWidget {
  const MusicNowPlayingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final playback = RrnPlaybackController.instance;
    return AnimatedBuilder(
      animation: playback,
      builder: (context, _) {
        final art = playback.artwork;
        final duration = playback.duration;
        final position = playback.position;
        final max = duration.inMilliseconds <= 0 ? 1.0 : duration.inMilliseconds.toDouble();
        return Scaffold(
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
                    child: art.isNotEmpty
                        ? Image.network(art, fit: BoxFit.cover, errorBuilder: (_, __, ___) => const ColoredBox(color: Colors.black, child: Icon(Icons.album, size: 100, color: rrnPurple)))
                        : const ColoredBox(color: Colors.black, child: Icon(Icons.album, size: 100, color: rrnPurple)),
                  ),
                ),
                const SizedBox(height: 22),
                Text(playback.title, textAlign: TextAlign.center, style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w900)),
                Text(playback.subtitle, textAlign: TextAlign.center, style: const TextStyle(color: Colors.white60, fontSize: 16)),
                const SizedBox(height: 18),
                if (!playback.live)
                  Slider(
                    value: position.inMilliseconds.toDouble().clamp(0, max),
                    max: max,
                    onChanged: duration.inMilliseconds <= 0 ? null : (value) => playback.seek(Duration(milliseconds: value.round())),
                  ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    FilledButton(
                      onPressed: playback.toggle,
                      style: FilledButton.styleFrom(shape: const CircleBorder(), padding: const EdgeInsets.all(20)),
                      child: Icon(playback.playing ? Icons.pause : Icons.play_arrow, size: 36),
                    ),
                  ],
                ),
                const Spacer(),
              ],
            ),
          ),
        );
      },
    );
  }
}
