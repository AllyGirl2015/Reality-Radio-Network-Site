from pathlib import Path
import re

ROOT = Path('/tmp/rrn_mobile/lib')


def read(name: str) -> str:
    return (ROOT / name).read_text()


def write(name: str, text: str) -> None:
    (ROOT / name).write_text(text)


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if old not in text:
        raise SystemExit(f'v0.7 patch failed: {label}')
    return text.replace(old, new, 1)


# Live radio metadata normalization: website/provider payloads use who/song.
text = read('core.dart')
text = replace_once(
    text,
    """    return RadioMetadata(\n      presenter: str(m['presenter'] ?? m['presenterName'] ?? m['presenter_name']),\n      show: str(m['show'] ?? m['showName'] ?? m['show_name']),\n      artist: str(m['artist'] ?? m['artistName'] ?? m['artist_name']),\n      title: str(m['title'] ?? m['track'] ?? m['trackTitle'] ?? m['track_title']),\n      program: str(m['program'] ?? m['programTitle'] ?? m['program_title']),\n      source: str(m['source'] ?? m['metadataSource'] ?? m['metadata_source']),\n      artwork: str(m['artwork'] ?? m['artworkUrl'] ?? m['artwork_url']),\n      live: boolish(m['live'] ?? m['isLive'] ?? m['is_live']),\n    );""",
    """    final song = m['song'] is Map ? Map<String, dynamic>.from(m['song']) : <String, dynamic>{};\n    return RadioMetadata(\n      presenter: str(m['presenter'] ?? m['presenterName'] ?? m['presenter_name'] ?? m['who'] ?? m['onAir'] ?? m['on_air']),\n      show: str(m['show'] ?? m['showName'] ?? m['show_name']),\n      artist: str(m['artist'] ?? m['artistName'] ?? m['artist_name'] ?? song['artist'] ?? song['artistName'] ?? song['artist_name']),\n      title: str(m['title'] ?? m['track'] ?? m['trackTitle'] ?? m['track_title'] ?? (m['song'] is String ? m['song'] : null) ?? song['title'] ?? song['name']),\n      program: str(m['program'] ?? m['programTitle'] ?? m['program_title']),\n      source: str(m['source'] ?? m['metadataSource'] ?? m['metadata_source']),\n      artwork: str(m['artwork'] ?? m['artworkUrl'] ?? m['artwork_url'] ?? m['coverArt'] ?? m['cover_art'] ?? m['imageUrl'] ?? m['image_url'] ?? song['artwork'] ?? song['art'] ?? song['image'] ?? song['imageUrl']),\n      live: boolish(m['live'] ?? m['isLive'] ?? m['is_live']),\n    );""",
    'normalize who/song/artwork live metadata',
)
write('core.dart', text)


# Shared live playback metadata for in-app + Android notification/lock screen.
text = read('playback.dart')
text = replace_once(
    text,
    """    final designation = station.designation.isNotEmpty ? station.designation : '${station.frequency.toStringAsFixed(1)} ${station.band}';\n    return MediaItem(\n      id: 'station:${_stationIdentity(station)}',\n      title: trackTitle,\n      artist: artist,\n      album: '${station.name} · $designation',""",
    """    final designation = station.designation.isNotEmpty ? station.designation : '${station.frequency.toStringAsFixed(1)} ${station.band}';\n    final context = [\n      designation,\n      station.name,\n      if (metadata?.presenter.isNotEmpty == true) 'On air: ${metadata!.presenter}',\n      if (metadata?.show.isNotEmpty == true) metadata!.show,\n      if (metadata?.source.isNotEmpty == true) 'Source: ${metadata!.source}',\n    ].where((e) => e.isNotEmpty).join(' · ');\n    return MediaItem(\n      id: 'station:${_stationIdentity(station)}',\n      title: trackTitle,\n      artist: artist,\n      album: context,""",
    'live media item station context',
)
text = replace_once(
    text,
    """        'trackTitle': metadata?.title ?? '',\n        'trackArtist': metadata?.artist ?? '',\n        'isLive': true,""",
    """        'trackTitle': metadata?.title ?? '',\n        'trackArtist': metadata?.artist ?? '',\n        'metadataSource': metadata?.source ?? '',\n        'metadataArtwork': metadata?.artwork ?? '',\n        'isLive': true,""",
    'live media extras',
)
text = replace_once(
    text,
    """      title = station.name;\n      subtitle = _stationSubtitle(station, metadata);\n      album = media.album ?? '';\n      artwork = media.artUri?.toString() ?? '';\n      live = true;\n      raw = station.raw;""",
    """      title = media.title;\n      subtitle = [media.artist ?? '', station.name].where((e) => e.isNotEmpty).join(' · ');\n      album = media.album ?? '';\n      artwork = media.artUri?.toString() ?? '';\n      live = true;\n      raw = {\n        ...station.raw,\n        'rrnNowPlaying': {\n          'stationName': station.name,\n          'designation': station.designation,\n          'presenter': metadata?.presenter ?? '',\n          'show': metadata?.show ?? '',\n          'artist': metadata?.artist ?? '',\n          'title': metadata?.title ?? '',\n          'source': metadata?.source ?? '',\n          'artwork': metadata?.artwork ?? '',\n        },\n      };""",
    'initial live playback display state',
)
text = replace_once(
    text,
    """    title = station.name;\n    subtitle = _stationSubtitle(station, metadata);\n    album = media.album ?? '';\n    artwork = media.artUri?.toString() ?? '';\n    _handler?.updateNowPlaying(media);\n    notifyListeners();""",
    """    title = media.title;\n    subtitle = [media.artist ?? '', station.name].where((e) => e.isNotEmpty).join(' · ');\n    album = media.album ?? '';\n    artwork = media.artUri?.toString() ?? '';\n    raw = {\n      ...station.raw,\n      'rrnNowPlaying': {\n        'stationName': station.name,\n        'designation': station.designation,\n        'presenter': metadata.presenter,\n        'show': metadata.show,\n        'artist': metadata.artist,\n        'title': metadata.title,\n        'source': metadata.source,\n        'artwork': metadata.artwork,\n      },\n    };\n    _handler?.updateNowPlaying(media);\n    notifyListeners();""",
    'live metadata refresh playback state',
)
text = replace_once(
    text,
    "      subtitle = [item.artist ?? '', item.album ?? ''].where((e) => e.isNotEmpty).join(' · ');\n",
    """      final incomingLive = boolish(extras['isLive']);\n      subtitle = incomingLive\n          ? [item.artist ?? '', str(extras['stationName'])].where((e) => e.isNotEmpty).join(' · ')\n          : [item.artist ?? '', item.album ?? ''].where((e) => e.isNotEmpty).join(' · ');\n""",
    'concise live media subtitle',
)
write('playback.dart', text)


# Reality Dial fusion.
text = read('tuner_v04.dart')
text = replace_once(
    text,
    """        if (playback.sourceId != id) {\n          await playback.playStation(station, metadata: metadata, volume: volume * strength);\n        } else {""",
    """        if (playback.sourceId != id) {\n          metadata = const RadioMetadata();\n          if (locked) await _refreshMetadata();\n          await playback.playStation(station, metadata: metadata, volume: volume * strength);\n        } else {""",
    'refresh live metadata before new station playback',
)
text = replace_once(
    text,
    """          _radioFace(station),\n          const SizedBox(height: 12),\n          _stationCard(station),\n          const SizedBox(height: 10),""",
    """          _radioFace(station),\n          const SizedBox(height: 10),""",
    'fuse station card into radio face',
)
start = text.index('  Widget _radioFace(Station? station) => Container(')
end = text.index('\n\n  Future<void> _presetMenu', start)
block = text[start:end]
needle = "          ],\n        ),\n      );"
pos = block.rfind(needle)
if pos < 0:
    raise SystemExit('v0.7 patch failed: radio face closing block')
block = block[:pos] + "            const SizedBox(height: 14),\n            _fusedStationMetadata(station),\n" + block[pos:]
text = text[:start] + block + text[end:]

helper = r'''
  String _artUrl(String value) {
    if (value.isEmpty) return '';
    if (value.startsWith('http://') || value.startsWith('https://')) return value;
    return '$rrnBase${value.startsWith('/') ? value : '/$value'}';
  }

  Widget _fusedStationMetadata(Station? station) {
    if (station == null) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(15),
        decoration: BoxDecoration(color: const Color(0xFF05070D), borderRadius: BorderRadius.circular(18), border: Border.all(color: Colors.white10)),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('DEAD SPACE · ${frequency.toStringAsFixed(1)} $band', style: const TextStyle(color: rrnCyan, fontFamily: 'monospace', fontWeight: FontWeight.w900)),
          const SizedBox(height: 5),
          Text(staticOn ? 'Generated radio static is active.' : 'Static is disabled.', style: const TextStyle(color: Colors.white60)),
        ]),
      );
    }
    final coming = station.streamUrl.isEmpty;
    final stationArt = _artUrl(station.artwork);
    final trackArt = _artUrl(metadata.artwork);
    final designation = station.designation.isNotEmpty ? station.designation : '${station.frequency.toStringAsFixed(1)} ${station.band}';
    final nowTitle = metadata.title.isNotEmpty ? metadata.title : metadata.program.isNotEmpty ? metadata.program : (coming ? 'Signal coming soon' : 'Live internet radio');
    final nowArtist = metadata.artist;
    final onAir = metadata.presenter;
    final source = metadata.source;
    final shortName = str(station.raw['shortName'] ?? station.raw['short_name'] ?? station.raw['callSign'] ?? station.raw['call_sign'], station.name);
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: const Color(0xFF0C0D14), borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.white10)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: SizedBox(
              width: 82,
              height: 82,
              child: stationArt.isEmpty
                  ? const ColoredBox(color: Colors.black, child: Icon(Icons.radio, color: rrnCyan, size: 36))
                  : Image.network(stationArt, fit: BoxFit.cover, errorBuilder: (_, __, ___) => const ColoredBox(color: Colors.black, child: Icon(Icons.radio, color: rrnCyan, size: 36))),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(border: Border.all(color: coming ? Colors.white38 : const Color(0xFF34D399)), borderRadius: BorderRadius.circular(99)),
                child: Text(coming ? 'LISTED' : 'LIVE', style: TextStyle(color: coming ? Colors.white60 : const Color(0xFF34D399), fontSize: 9, fontWeight: FontWeight.w900)),
              ),
              if (station.location.isNotEmpty) ...[
                const SizedBox(width: 8),
                Expanded(child: Text('${station.location} / Global online', style: const TextStyle(color: Colors.white45, fontSize: 11), overflow: TextOverflow.ellipsis)),
              ],
            ]),
            const SizedBox(height: 7),
            Text(shortName, style: const TextStyle(fontSize: 21, fontWeight: FontWeight.w900)),
            Text(station.name, style: const TextStyle(color: Colors.white60)),
          ])),
        ]),
        const SizedBox(height: 12),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(13),
          decoration: BoxDecoration(color: const Color(0xFF010207), borderRadius: BorderRadius.circular(15), border: Border.all(color: rrnCyan.withValues(alpha: .16))),
          child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('$designation · ${station.name}', style: const TextStyle(fontFamily: 'monospace', color: Colors.white70, fontWeight: FontWeight.w800)),
              const SizedBox(height: 9),
              Text(coming ? 'STATUS' : 'NOW PLAYING', style: const TextStyle(color: rrnCyan, fontFamily: 'monospace', fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1.2)),
              const SizedBox(height: 3),
              Text(nowTitle, style: const TextStyle(fontFamily: 'monospace', fontSize: 16, fontWeight: FontWeight.w900)),
              if (nowArtist.isNotEmpty) Text(nowArtist, style: const TextStyle(fontFamily: 'monospace', color: Colors.white70, fontSize: 14)),
              if (onAir.isNotEmpty || source.isNotEmpty) ...[
                const SizedBox(height: 9),
                Text([if (onAir.isNotEmpty) 'On air: $onAir', if (!coming) 'Live', if (source.isNotEmpty) 'Source: $source'].join(' · '), style: const TextStyle(fontFamily: 'monospace', color: rrnPurple, fontSize: 11)),
              ],
              if (metadata.show.isNotEmpty) ...[
                const SizedBox(height: 4),
                Text(metadata.show, style: const TextStyle(fontFamily: 'monospace', color: Colors.white54, fontSize: 11)),
              ],
            ])),
            if (trackArt.isNotEmpty) ...[
              const SizedBox(width: 10),
              ClipRRect(borderRadius: BorderRadius.circular(9), child: Image.network(trackArt, width: 66, height: 66, fit: BoxFit.cover, errorBuilder: (_, __, ___) => const SizedBox.shrink())),
            ],
          ]),
        ),
        if (station.tagline.isNotEmpty) ...[const SizedBox(height: 11), Text(station.tagline, style: const TextStyle(color: Colors.white70))],
        const SizedBox(height: 10),
        Wrap(spacing: 8, runSpacing: 8, children: [
          FilledButton.tonalIcon(onPressed: _saveCurrentStation, icon: const Icon(Icons.bookmark_add_outlined), label: const Text('Save station')),
          OutlinedButton.icon(onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => StationPageScreen(station: station))), icon: const Icon(Icons.info_outline), label: const Text('Station details')),
        ]),
      ]),
    );
  }
'''
text = text.replace('\n\n  Widget _display(Station? station)', '\n' + helper + '\n  Widget _display(Station? station)', 1)
write('tuner_v04.dart', text)


# Feed posting fronts + full public window.
text = read('social.dart')
feed_helper = r'''
class _FeedAuthorView {
  final String type;
  final String name;
  final String image;
  final String subtitle;
  final bool verified;
  const _FeedAuthorView({required this.type, required this.name, required this.image, required this.subtitle, required this.verified});
}

_FeedAuthorView _resolveFeedAuthor(Map<String, dynamic> post) {
  final nested = post['author'] is Map ? Map<String, dynamic>.from(post['author']) : <String, dynamic>{};
  final rawType = str(post['author_type'] ?? post['authorType'] ?? nested['type']).toLowerCase();
  final artistName = str(post['author_artist_name'] ?? post['authorArtistName']);
  final artistImage = str(post['author_artist_image'] ?? post['authorArtistImage']);
  final personaName = str(post['author_persona_name'] ?? post['authorPersonaName']);
  final personaImage = str(post['author_persona_image'] ?? post['authorPersonaImage']);
  final stationName = str(post['author_station_name'] ?? post['authorStationName']);
  final stationDesignation = str(post['author_station_designation'] ?? post['authorStationDesignation']);
  final stationImage = str(post['author_station_artwork'] ?? post['authorStationArtwork']);
  final labelName = str(post['author_label_name'] ?? post['authorLabelName']);
  final labelImage = str(post['author_label_image'] ?? post['authorLabelImage']);
  final userName = str(post['author_user_name'] ?? post['authorUserName']);
  final userImage = str(post['author_user_avatar'] ?? post['authorUserAvatar']);
  if (artistName.isNotEmpty || rawType == 'artist') return _FeedAuthorView(type: 'artist', name: artistName.isNotEmpty ? artistName : str(nested['name'], 'RRN Artist'), image: _absoluteMedia(artistImage.isNotEmpty ? artistImage : str(nested['avatarUrl'] ?? nested['image'])), subtitle: 'Official RRN Artist', verified: true);
  if (personaName.isNotEmpty || rawType == 'persona') return _FeedAuthorView(type: 'persona', name: personaName.isNotEmpty ? personaName : str(nested['name'], 'RRN Persona'), image: _absoluteMedia(personaImage.isNotEmpty ? personaImage : str(nested['avatarUrl'] ?? nested['image'])), subtitle: 'Official RRN Persona', verified: true);
  if (stationName.isNotEmpty || rawType == 'station') {
    final name = [stationDesignation, stationName.isNotEmpty ? stationName : str(nested['name'])].where((e) => e.isNotEmpty).join(' — ');
    return _FeedAuthorView(type: 'station', name: name.isEmpty ? 'RRN Station' : name, image: _absoluteMedia(stationImage.isNotEmpty ? stationImage : str(nested['avatarUrl'] ?? nested['image'])), subtitle: 'Official Station', verified: true);
  }
  if (labelName.isNotEmpty || rawType == 'label') return _FeedAuthorView(type: 'label', name: labelName.isNotEmpty ? labelName : str(nested['name'], 'RRN Label'), image: _absoluteMedia(labelImage.isNotEmpty ? labelImage : str(nested['avatarUrl'] ?? nested['image'])), subtitle: 'Official RRN Label', verified: true);
  if (rawType == 'user' || userName.isNotEmpty) return _FeedAuthorView(type: 'user', name: userName.isNotEmpty ? userName : str(nested['name'] ?? post['author_name'] ?? post['authorName'], 'RRN Member'), image: _absoluteMedia(userImage.isNotEmpty ? userImage : str(nested['avatarUrl'] ?? nested['image'] ?? post['author_image'] ?? post['authorImage'])), subtitle: str(nested['subtitle'], 'RRN Member'), verified: boolish(nested['verified'] ?? post['author_user_verified'] ?? post['authorVerified']));
  final nestedName = str(nested['name']);
  final flattenedName = str(post['author_name'] ?? post['authorName']);
  final networkName = nestedName.isNotEmpty ? nestedName : (flattenedName.isNotEmpty ? flattenedName : 'Reality Radio Network');
  return _FeedAuthorView(type: rawType.isEmpty ? 'network' : rawType, name: networkName, image: _absoluteMedia(str(nested['avatarUrl'] ?? nested['image'] ?? post['author_image'] ?? post['authorImage'] ?? '/RRN_logo.jpg')), subtitle: str(nested['subtitle'], 'Official RRN / RBEW'), verified: boolish(nested['verified'], true));
}
'''
anchor = "\nclass SocialScreen extends StatefulWidget"
if anchor not in text:
    raise SystemExit('v0.7 patch failed: social helper anchor')
text = text.replace(anchor, '\n' + feed_helper + anchor, 1)
text = text.replace("'limit': 40,", "'limit': 150,", 1)
text = text.replace("listFrom(body, const ['items'])", "listFrom(body, const ['items', 'posts', 'feed'])", 1)
text, n = re.subn(r"  bool _matchesScope\(Map<String, dynamic> post\) \{.*?\n  \}", """  bool _matchesScope(Map<String, dynamic> post) {\n    if (feedScope == 'all') return true;\n    final author = _resolveFeedAuthor(post);\n    final isMemberPost = author.type == 'user';\n    return feedScope == 'community' ? isMemberPost : !isMemberPost;\n  }""", text, count=1, flags=re.S)
if n != 1:
    raise SystemExit('v0.7 patch failed: feed scope classifier')

# v0.6 already introduced authorData for nested Matrix authors.
text, n = re.subn(
    r"    final authorData = post\['author'\] is Map \? Map<String, dynamic>\.from\(post\['author'\]\) : const <String, dynamic>\{\};\n    final author = str\(post\['author_name'\] \?\? post\['authorName'\] \?\? authorData\['name'\] \?\? authorData\['displayName'\], 'Reality Radio Network'\);\n    final authorImage = _absoluteMedia\(str\(post\['author_image'\] \?\? post\['authorImage'\] \?\? authorData\['avatarUrl'\] \?\? authorData\['image'\]\)\);",
    "    final author = _resolveFeedAuthor(post);\n    final authorImage = author.image;",
    text,
    count=1,
)
if n != 1:
    raise SystemExit('v0.7 patch failed: feed card posting-front author')
text = replace_once(
    text,
    """                  Text(author, style: const TextStyle(fontWeight: FontWeight.w900)),\n                  Text(type.toUpperCase(), style: const TextStyle(color: rrnPurple, fontSize: 9, fontWeight: FontWeight.w900, letterSpacing: 1.2)),""",
    """                  Row(children: [\n                    Flexible(child: Text(author.name, style: const TextStyle(fontWeight: FontWeight.w900))),\n                    if (author.verified) ...[const SizedBox(width: 4), const Icon(Icons.verified, size: 14, color: rrnCyan)],\n                  ]),\n                  Text('${author.subtitle} · ${type.toUpperCase()}', style: const TextStyle(color: rrnPurple, fontSize: 9, fontWeight: FontWeight.w900, letterSpacing: .7)),""",
    'feed card posting-front presentation',
)
text = replace_once(
    text,
    """    final author = str(post['author_name'] ?? post['authorName'], 'Reality Radio Network');\n    final hero = _absoluteMedia(str(post['hero_image_url'] ?? post['heroImageUrl']));""",
    """    final author = _resolveFeedAuthor(post);\n    final hero = _absoluteMedia(str(post['hero_image_url'] ?? post['heroImageUrl']));""",
    'feed detail posting-front author',
)
text = replace_once(
    text,
    """                      Text(author, style: const TextStyle(color: rrnCyan, fontWeight: FontWeight.w800)),""",
    """                      Row(children: [\n                        Flexible(child: Text(author.name, style: const TextStyle(color: rrnCyan, fontWeight: FontWeight.w800))),\n                        if (author.verified) ...[const SizedBox(width: 4), const Icon(Icons.verified, size: 15, color: rrnCyan)],\n                      ]),\n                      Text(author.subtitle, style: const TextStyle(color: Colors.white54, fontSize: 11)),""",
    'feed detail author presentation',
)
write('social.dart', text)


# Native playlist client activation.
text = read('music_v04.dart')
text = replace_once(text, "import 'core.dart';\nimport 'native_endpoint.dart';\n", "import 'core.dart';\nimport 'library_native.dart';\nimport 'native_endpoint.dart';\n", 'music import native playlists')
playlist_block = re.compile(r"onPressed: \(\) => Navigator\.push\(\n\s+context,\n\s+MaterialPageRoute\(\n\s+builder: \(_\) => const BridgePendingScreen\(\n\s+title: 'RRN Playlists',.*?\n\s+\),\n\s+\),\n\s+\),\n\s+icon: const Icon\(Icons\.playlist_play\),\n\s+label: const Text\('Playlists'\),", re.S)
text, n = playlist_block.subn("""onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const NativePlaylistsScreen())),\n                icon: const Icon(Icons.playlist_play),\n                label: const Text('Playlists'),""", text, count=1)
if n != 1:
    raise SystemExit('v0.7 patch failed: native playlists button')
write('music_v04.dart', text)


# Points: render /points independently of optional subroutes.
text = read('points.dart')
text = replace_once(
    text,
    """    try {\n      final service = PointsService(app.api);\n      final values = await Future.wait([service.wallet(), service.ledger()]);\n      wallet = values[0] as RrnPointsWallet;\n      ledger = values[1] as List<PointLedgerEntry>;\n      error = null;\n    } catch (e) {\n      error = '$e';\n    } finally {""",
    """    try {\n      final body = await app.api.get('/points');\n      wallet = RrnPointsWallet.from(body);\n      ledger = listFrom(body, const ['transactions', 'ledger', 'history']).map(PointLedgerEntry.from).toList();\n      error = null;\n    } catch (e) {\n      error = '$e';\n    } finally {""",
    'points base balance must not depend on ledger subroute',
)
text = replace_once(text, """                    const SizedBox(height: 12),\n                    FilledButton.icon(onPressed: _buyPoints, icon: const Icon(Icons.add_card), label: const Text('Buy points')),""", """                    const SizedBox(height: 12),\n                    const Text('Balance is loaded directly from the current App Matrix /points contract.', style: TextStyle(color: Colors.white54, fontSize: 11)),""", 'hide unsupported point purchase action')
start_card = """            Card(\n              child: const Padding(\n                padding: EdgeInsets.all(16),\n                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [\n                  Text('Current earning rules', style: TextStyle(fontWeight: FontWeight.w900)),"""
if start_card in text:
    card_start = text.index(start_card)
    card_end = text.index("            if (error != null)", card_start)
    replacement_card = """            const Card(\n              child: Padding(\n                padding: EdgeInsets.all(16),\n                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [\n                  Text('Server-authoritative wallet', style: TextStyle(fontWeight: FontWeight.w900)),\n                  SizedBox(height: 6),\n                  Text('The app displays the balance returned by RRN. Optional ledger, point-purchase, checkout-redemption and listening-reward actions stay hidden until their Matrix contracts are exposed instead of fabricating client-side behavior.', style: TextStyle(color: Colors.white70)),\n                ]),\n              ),\n            ),\n"""
    text = text[:card_start] + replacement_card + text[card_end:]
write('points.dart', text)

# Account quick-glance points count.
text = read('account.dart')
text = replace_once(text, """              subtitle: const Text('Earn by listening and qualifying purchases; spend across participating RRN services.'),\n              trailing: const Icon(Icons.chevron_right),""", """              subtitle: Text(u.points > 0 ? '${u.points} points on account snapshot · Tap to refresh wallet' : 'Tap to load your current RRN points wallet.'),\n              trailing: const Icon(Icons.chevron_right),""", 'account points glance')
write('account.dart', text)

print('RRN Mobile v0.7 metadata/feed/points/playlists patches applied successfully.')
