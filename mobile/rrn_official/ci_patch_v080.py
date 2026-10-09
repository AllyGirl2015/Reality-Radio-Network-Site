from pathlib import Path
import re

ROOT = Path('/tmp/rrn_mobile/lib')


def read(name: str) -> str:
    return (ROOT / name).read_text()


def write(name: str, text: str) -> None:
    (ROOT / name).write_text(text)


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if old not in text:
        raise SystemExit(f'v0.8 patch failed: {label}')
    return text.replace(old, new, 1)


def regex_once(text: str, pattern: str, replacement: str, label: str) -> str:
    result, count = re.subn(pattern, replacement, text, count=1, flags=re.S)
    if count != 1:
        raise SystemExit(f'v0.8 patch failed: {label}')
    return result


# ---------------------------------------------------------------------------
# API client: 061i exposes PATCH-backed resources such as playlist/account
# management. Keep the same bearer/session refresh behavior as GET/POST.
# ---------------------------------------------------------------------------
text = read('core.dart')
if 'Future<dynamic> patch(' not in text:
    anchor = """  Future<dynamic> delete(String path, {dynamic body}) async {
    final response = await http
        .delete(uri(path), headers: headers(), body: body == null ? null : jsonEncode(body))
        .timeout(const Duration(seconds: 20));
    return decode(response);
  }
"""
    replacement = """  Future<dynamic> patch(String path, {dynamic body, bool retryAuth = true}) async {
    var response = await http
        .patch(uri(path), headers: headers(), body: jsonEncode(body ?? const {}))
        .timeout(const Duration(seconds: 20));
    if (response.statusCode == 401 && retryAuth && await refresh()) {
      response = await http
          .patch(uri(path), headers: headers(), body: jsonEncode(body ?? const {}))
          .timeout(const Duration(seconds: 20));
    }
    return decode(response);
  }

  Future<dynamic> delete(String path, {dynamic body, bool retryAuth = true}) async {
    var response = await http
        .delete(uri(path), headers: headers(), body: body == null ? null : jsonEncode(body))
        .timeout(const Duration(seconds: 20));
    if (response.statusCode == 401 && retryAuth && await refresh()) {
      response = await http
          .delete(uri(path), headers: headers(), body: body == null ? null : jsonEncode(body))
          .timeout(const Duration(seconds: 20));
    }
    return decode(response);
  }
"""
    text = replace_once(text, anchor, replacement, 'API PATCH + DELETE refresh support')
write('core.dart', text)


# ---------------------------------------------------------------------------
# FAST TUNE: do not await metadata before starting a station and do not await
# the looping static player's play Future. As soon as a valid signal is chosen,
# duck static immediately and start the network source; metadata follows in
# parallel. This removes the several-second loud-static stall.
# ---------------------------------------------------------------------------
text = read('tuner_v04.dart')
text = replace_once(
    text,
    """    if (staticOn && !staticPlayer.playing) {
      try {
        await staticPlayer.play();
      } catch (_) {}
    }
""",
    """    if (staticOn && !staticPlayer.playing) {
      try {
        unawaited(staticPlayer.play());
      } catch (_) {}
    }
""",
    'static playback must not block station acquisition',
)
text = replace_once(
    text,
    """        if (playback.sourceId != id) {
          metadata = const RadioMetadata();
          if (locked) await _refreshMetadata();
          await playback.playStation(station, metadata: metadata, volume: volume * strength);
        } else {
""",
    """        if (playback.sourceId != id) {
          metadata = const RadioMetadata();
          message = 'ACQUIRING ${station.name.toUpperCase()}…';
          if (staticOn) {
            // Give immediate audible feedback that a station was found instead
            // of leaving full-volume static up while the internet stream opens.
            await staticPlayer.setVolume((volume * .16).clamp(0, 1).toDouble());
          }
          if (mounted) setState(() {});
          // Metadata is display enrichment, never a prerequisite for audio.
          if (locked) unawaited(_refreshMetadata());
          await playback.playStation(station, metadata: metadata, volume: volume * strength);
          message = null;
        } else {
""",
    'station audio must start before metadata request',
)
text = replace_once(
    text,
    """    final nowTitle = metadata.title.isNotEmpty ? metadata.title : metadata.program.isNotEmpty ? metadata.program : (coming ? 'Signal coming soon' : 'Live internet radio');
""",
    """    final acquiring = !coming && playback.transitioning && playback.kind == RrnPlaybackKind.station;
    final nowTitle = metadata.title.isNotEmpty
        ? metadata.title
        : metadata.program.isNotEmpty
            ? metadata.program
            : coming
                ? 'Signal coming soon'
                : acquiring
                    ? 'ACQUIRING SIGNAL…'
                    : 'Live internet radio';
""",
    'dial acquiring state',
)
write('tuner_v04.dart', text)


# ---------------------------------------------------------------------------
# FEED: 061i is authoritative. The public byline is the exact posting front,
# never the underlying authenticated account. Scheduled posts remain visible as
# previews/countdowns when the server includes them in the public feed window.
# ---------------------------------------------------------------------------
text = read('social.dart')

feed_author = r'''_FeedAuthorView _resolveFeedAuthor(Map<String, dynamic> post) {
  final nested = post['author'] is Map ? Map<String, dynamic>.from(post['author']) : <String, dynamic>{};
  final nestedType = str(nested['type']).toLowerCase();
  final nestedName = str(nested['name'] ?? nested['displayName']);

  // 061i's normalized author is authoritative. Do not infer a different
  // identity just because author_user_id or other joined fields also exist.
  if (nestedType.isNotEmpty && nestedName.isNotEmpty) {
    return _FeedAuthorView(
      type: nestedType,
      name: nestedName,
      image: _absoluteMedia(str(nested['avatarUrl'] ?? nested['avatar_url'] ?? nested['image'])),
      subtitle: str(nested['subtitle']),
      verified: boolish(nested['verified']),
    );
  }

  final type = str(post['author_type'] ?? post['authorType'] ?? nestedType, 'network').toLowerCase();
  switch (type) {
    case 'station':
      final designation = str(post['author_station_designation'] ?? post['authorStationDesignation']);
      final stationName = str(post['author_station_name'] ?? post['authorStationName']);
      return _FeedAuthorView(
        type: type,
        name: designation.isNotEmpty ? designation : (stationName.isNotEmpty ? stationName : 'RRN Station'),
        image: _absoluteMedia(str(post['author_station_artwork'] ?? post['authorStationArtwork'])),
        subtitle: stationName,
        verified: true,
      );
    case 'artist':
      return _FeedAuthorView(
        type: type,
        name: str(post['author_artist_name'] ?? post['authorArtistName'], 'RRN Artist'),
        image: _absoluteMedia(str(post['author_artist_image'] ?? post['authorArtistImage'])),
        subtitle: 'Official RRN Artist',
        verified: true,
      );
    case 'persona':
      return _FeedAuthorView(
        type: type,
        name: str(post['author_persona_name'] ?? post['authorPersonaName'], 'RRN Persona'),
        image: _absoluteMedia(str(post['author_persona_image'] ?? post['authorPersonaImage'])),
        subtitle: 'Official RRN Persona',
        verified: true,
      );
    case 'label':
      return _FeedAuthorView(
        type: type,
        name: str(post['author_label_name'] ?? post['authorLabelName'], 'RRN Label'),
        image: _absoluteMedia(str(post['author_label_image'] ?? post['authorLabelImage'])),
        subtitle: 'Official RRN Label',
        verified: true,
      );
    case 'user':
    case 'member':
      return _FeedAuthorView(
        type: 'user',
        name: str(post['author_user_name'] ?? post['authorUserName'] ?? post['author_name'] ?? post['authorName'], 'RRN Member'),
        image: _absoluteMedia(str(post['author_user_avatar'] ?? post['authorUserAvatar'] ?? post['author_image'] ?? post['authorImage'])),
        subtitle: 'RRN Member',
        verified: boolish(post['author_user_verified'] ?? post['authorVerified']),
      );
    case 'rrn':
    case 'rbew':
    case 'network':
    default:
      return _FeedAuthorView(
        type: type,
        name: str(post['author_name'] ?? post['authorName'], 'Reality Radio Network'),
        image: _absoluteMedia(str(post['author_image'] ?? post['authorImage'] ?? '/RRN_logo.jpg')),
        subtitle: 'Official RRN / RBEW',
        verified: true,
      );
  }
}
'''
text = regex_once(
    text,
    r"_FeedAuthorView _resolveFeedAuthor\(Map<String, dynamic> post\) \{.*?\n\}\n(?=\nclass SocialScreen)",
    feed_author.rstrip(),
    'authoritative feed posting front',
)

# 061i now owns these surfaces; stop showing old bridge-pending placeholders.
text = re.sub(
    r"builder: \(_\) => const BridgePendingScreen\(\s*title: 'Create Post'.*?\),\s*\),",
    "builder: (_) => const MatrixPageScreen(path: '/feed/new', title: 'Create Post')),",
    text,
    count=1,
    flags=re.S,
)
text = re.sub(
    r"_chip\('Friends', Icons\.group_outlined, \(\) => Navigator\.push\(context, MaterialPageRoute\(builder: \(_\) => const BridgePendingScreen\(.*?\)\)\)\),",
    "_chip('Friends', Icons.group_outlined, () => Navigator.push(context, MaterialPageRoute(builder: (_) => const MatrixEndpointScreen(endpoint: '/friends', title: 'Friends')))),",
    text,
    count=1,
    flags=re.S,
)
text = re.sub(
    r"_chip\('Events', Icons\.event_outlined, \(\) => Navigator\.push\(context, MaterialPageRoute\(builder: \(_\) => const BridgePendingScreen\(.*?\)\)\)\),",
    "_chip('Events', Icons.event_outlined, () => Navigator.push(context, MaterialPageRoute(builder: (_) => const MatrixEndpointScreen(endpoint: '/events', title: 'Events')))),",
    text,
    count=1,
    flags=re.S,
)
# Add Following beside Friends if v0.6 did not already expose it.
if "_chip('Following'" not in text:
    text = text.replace(
        "_chip('Friends', Icons.group_outlined, () => Navigator.push(context, MaterialPageRoute(builder: (_) => const MatrixEndpointScreen(endpoint: '/friends', title: 'Friends')))),",
        "_chip('Friends', Icons.group_outlined, () => Navigator.push(context, MaterialPageRoute(builder: (_) => const MatrixEndpointScreen(endpoint: '/friends', title: 'Friends')))),\n                  _chip('Following', Icons.person_add_alt_1, () => Navigator.push(context, MaterialPageRoute(builder: (_) => const MatrixEndpointScreen(endpoint: '/following', title: 'Following')))),",
        1,
    )

text = text.replace(
    "const Card(child: Padding(padding: EdgeInsets.all(18), child: Text('The feed returned no published posts.')))",
    "const Card(child: Padding(padding: EdgeInsets.all(18), child: Text('The feed returned no visible posts.')))",
    1,
)

post_card = r'''  Widget _postCard(Map<String, dynamic> post) {
    final slug = str(post['slug']);
    final author = _resolveFeedAuthor(post);
    final authorImage = author.image;
    final title = str(post['title']);
    final summary = str(post['summary']);
    final type = str(post['post_type'] ?? post['postType'], 'post');
    final hero = _absoluteMedia(str(post['hero_image_url'] ?? post['heroImageUrl']));
    final comments = numi(post['comment_count'] ?? post['commentCount']);
    final reactions = numi(post['reaction_count'] ?? post['reactionCount']);
    final viewerReaction = str(post['viewer_reaction'] ?? post['viewerReaction']);
    final status = str(post['status']).toLowerCase();
    final publishAt = DateTime.tryParse(str(post['publishAt'] ?? post['publish_at']));
    final futurePublish = publishAt != null && publishAt.isAfter(DateTime.now());
    final locked = boolish(post['locked']) || status == 'scheduled' || futurePublish;
    final displayTimer = boolish(post['displayTimer'] ?? post['display_timer']);
    final capabilities = post['capabilities'] is Map ? Map<String, dynamic>.from(post['capabilities']) : <String, dynamic>{};
    final canReact = !locked && boolish(capabilities['react'], true);
    final canComment = !locked && boolish(capabilities['comment'], true);

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
                  Row(children: [
                    Flexible(child: Text(author.name, style: const TextStyle(fontWeight: FontWeight.w900), overflow: TextOverflow.ellipsis)),
                    if (author.verified) ...[
                      const SizedBox(width: 4),
                      const Icon(Icons.verified, color: rrnCyan, size: 15),
                    ],
                  ]),
                  if (author.subtitle.isNotEmpty)
                    Text(author.subtitle, style: const TextStyle(color: Colors.white54, fontSize: 10), overflow: TextOverflow.ellipsis),
                ])),
                if (locked)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(color: const Color(0x3322D3EE), borderRadius: BorderRadius.circular(99)),
                    child: const Text('SCHEDULED', style: TextStyle(color: rrnCyan, fontSize: 9, fontWeight: FontWeight.w900)),
                  )
                else if (boolish(post['pinned']))
                  const Icon(Icons.push_pin, size: 17, color: rrnCyan),
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
                Text(type.toUpperCase(), style: const TextStyle(color: rrnPurple, fontSize: 9, fontWeight: FontWeight.w900, letterSpacing: 1.2)),
                if (title.isNotEmpty) Text(title, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900)),
                if (summary.isNotEmpty) ...[
                  const SizedBox(height: 5),
                  Text(summary, maxLines: 4, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.white70)),
                ],
                if (locked && publishAt != null) ...[
                  const SizedBox(height: 9),
                  Text(
                    '${displayTimer ? 'GOES LIVE' : 'SCHEDULED'} · ${publishAt.toLocal()}',
                    style: const TextStyle(color: rrnCyan, fontFamily: 'monospace', fontSize: 11, fontWeight: FontWeight.w800),
                  ),
                  const SizedBox(height: 4),
                  const Text('The full post unlocks automatically at publication time.', style: TextStyle(color: Colors.white54, fontSize: 11)),
                ],
              ]),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(6, 0, 8, 8),
              child: Row(children: [
                TextButton.icon(
                  onPressed: canReact && slug.isNotEmpty ? () => _react(post, 'like') : null,
                  icon: Icon(viewerReaction.isEmpty ? Icons.favorite_border : Icons.favorite, color: viewerReaction.isEmpty ? null : rrnPink),
                  label: Text('$reactions'),
                ),
                TextButton.icon(
                  onPressed: canComment && slug.isNotEmpty ? () => Navigator.push(context, MaterialPageRoute(builder: (_) => FeedDetailScreen(slug: slug))) : null,
                  icon: const Icon(Icons.mode_comment_outlined),
                  label: Text('$comments'),
                ),
                const Spacer(),
                if (locked) const Text('Preview', style: TextStyle(color: rrnCyan, fontSize: 11)),
                const Icon(Icons.chevron_right, color: Colors.white38),
              ]),
            ),
          ],
        ),
      ),
    );
  }
'''
text = regex_once(
    text,
    r"  Widget _postCard\(Map<String, dynamic> post\) \{.*?\n  \}\n(?=\}\n\nclass FeedDetailScreen)",
    post_card.rstrip(),
    'scheduled feed cards',
)
write('social.dart', text)


# ---------------------------------------------------------------------------
# LIBRARY: 061i has a real bearer-session /library route now. Stop falling back
# to catalog favorites and consume the account library directly.
# ---------------------------------------------------------------------------
text = read('music_v04.dart')
old_library = """    try {
      final body = await app.api.get('/music/catalog', query: {'limit': 100});
      items.addAll(
        listFrom(body, const ['items'])
            .whereType<Map>()
            .map((e) => Map<String, dynamic>.from(e))
            .where((e) => boolish(e['favorited'])),
      );
      source = 'Matrix favorites';
      error = null;
    } catch (e) {
      error = '$e';
    }
    busy = false;"""
new_library = """    try {
      final body = await app.api.get('/library');
      final rows = <dynamic>[
        ...listFrom(body, const ['items', 'tracks', 'library']),
        if (body is Map) ...listFrom(body['favorites']),
        if (body is Map) ...listFrom(body['owned']),
        if (body is Map) ...listFrom(body['entitlements']),
        if (body is Map) ...listFrom(body['purchases']),
        if (body is Map) ...listFrom(body['preorders']),
      ];
      final seen = <String>{};
      for (final row in rows.whereType<Map>()) {
        final outer = Map<String, dynamic>.from(row);
        final nested = outer['track'] is Map ? Map<String, dynamic>.from(outer['track']) : <String, dynamic>{};
        final item = <String, dynamic>{...nested, ...outer};
        final id = str(item['id'] ?? item['trackId'] ?? item['track_id'] ?? item['slug'] ?? item['catalog']);
        if (id.isEmpty || seen.add(id)) items.add(item);
      }
      source = 'RRN account library';
      error = null;
    } catch (e) {
      error = '$e';
    }
    busy = false;"""
text = replace_once(text, old_library, new_library, '061i native library source')
text = text.replace(
    "subtitle: 'Favorites stay native through the Matrix. Owned music, pre-orders and saved playlists need the new app-library bridge documented for the next site build.',",
    "subtitle: 'Favorites, owned music, entitlements, pre-orders and playlists are loaded through the authenticated 061i App Matrix.',",
    1,
)
write('music_v04.dart', text)


# Playlist bridge is live in 061i. Update copy and add native creation.
text = read('library_native.dart')
text = text.replace(
    "subtitle: 'This screen consumes the native app playlist contract directly. When the site exposes it, no WebView is involved.',",
    "subtitle: 'Playlists are loaded directly from the authenticated RRN App Matrix. No WebView is involved.',",
    1,
)
text = text.replace(
    "const Text('The mobile playlist UI is ready.', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900)),",
    "const Text('Playlist service unavailable.', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900)),",
    1,
)
text = text.replace(
    "const Text('RealityRadio.net still needs to expose the authenticated app playlist bridge. The existing website playlist API uses the website session model and should not be called directly from the app.'),",
    "const Text('The 061i Matrix normally exposes this route. Retry after checking network/session state or the live service health.'),",
    1,
)
text = text.replace(
    "const Card(child: Padding(padding: EdgeInsets.all(18), child: Text('Playlist detail requires GET /api/app/v1/library/playlists/[id] in the next RealityRadio.net Matrix build.'))),",
    "const Card(child: Padding(padding: EdgeInsets.all(18), child: Text('The playlist detail service is temporarily unavailable.'))),",
    1,
)
# Add create action to the list-screen app bar.
text = replace_once(
    text,
    """      appBar: AppBar(
        title: const Text('RRN Playlists'),
        actions: [IconButton(onPressed: _load, icon: const Icon(Icons.refresh))],
      ),""",
    """      appBar: AppBar(
        title: const Text('RRN Playlists'),
        actions: [
          IconButton(onPressed: _createPlaylist, icon: const Icon(Icons.playlist_add), tooltip: 'Create playlist'),
          IconButton(onPressed: _load, icon: const Icon(Icons.refresh)),
        ],
      ),""",
    'playlist create action',
)
# Insert method before build.
marker = """  @override
  Widget build(BuildContext context) {
"""
method = """  Future<void> _createPlaylist() async {
    final app = RrnScope.of(context);
    if (!app.auth.signedIn) {
      await _signIn();
      if (!app.auth.signedIn) return;
    }
    final controller = TextEditingController();
    final name = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Create playlist'),
        content: TextField(controller: controller, autofocus: true, decoration: const InputDecoration(labelText: 'Playlist name')),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          FilledButton(onPressed: () => Navigator.pop(context, controller.text.trim()), child: const Text('Create')),
        ],
      ),
    );
    controller.dispose();
    if (name == null || name.isEmpty) return;
    try {
      await app.api.post('/library/playlists', body: {'name': name, 'title': name});
      await _load();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Playlist could not be created: $e')));
    }
  }

"""
text = replace_once(text, marker, method + marker, 'playlist create method')
write('library_native.dart', text)


# ---------------------------------------------------------------------------
# POINTS: base wallet already uses /points after v0.7. 061i now exposes points
# commerce. Re-enable the purchase entry through the safe native page renderer,
# which can use the server's current purchase/checkout actions without guessing
# the payment-token schema in the APK.
# ---------------------------------------------------------------------------
text = read('points.dart')
if "import 'site.dart';" not in text:
    text = text.replace("import 'core.dart';\n", "import 'core.dart';\nimport 'site.dart';\n", 1)
text = text.replace(
    "const Text('Balance is loaded directly from the current App Matrix /points contract.', style: TextStyle(color: Colors.white54, fontSize: 11)),",
    "FilledButton.icon(\n                      onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const MatrixPageScreen(path: '/points', title: 'RRN Points'))),\n                      icon: const Icon(Icons.add_card),\n                      label: const Text('Buy / use points'),\n                    ),",
    1,
)
write('points.dart', text)


# ---------------------------------------------------------------------------
# FULL PARITY: /page is live now. Remove the old alpha website escape hatch and
# use safe translated pages for long-tail account/creator/studio content.
# ---------------------------------------------------------------------------
text = read('site.dart')
# Remove toolbar website fallback.
text = re.sub(
    r"\n\s*IconButton\(\s*onPressed: \(\) => Navigator\.push\(.*?tooltip: 'Website fallback',\s*\),",
    '',
    text,
    count=1,
    flags=re.S,
)
# Replace pending body with retry-only native state.
text = regex_once(
    text,
    r"  Widget _pending\(\) => ListView\(.*?\n      \);",
    """  Widget _pending() => ListView(
        padding: const EdgeInsets.all(18),
        children: [
          RrnSectionHeader(
            eyebrow: 'Translation Matrix',
            title: '${widget.title} is temporarily unavailable.',
            subtitle: 'RRN Mobile requested the native 061i page translation for ${widget.path}.',
          ),
          const SizedBox(height: 14),
          if (error != null) Text(error!, style: const TextStyle(color: Colors.white54, fontSize: 12)),
          const SizedBox(height: 18),
          FilledButton.icon(onPressed: _load, icon: const Icon(Icons.refresh), label: const Text('Retry')),
        ],
      );""",
    'page translator no WebView fallback',
)
write('site.dart', text)


# ---------------------------------------------------------------------------
# MORE MENU: v0.6 marked long-tail pages as pending. 061i now has the safe page
# translator, so route them into MatrixPageScreen instead.
# ---------------------------------------------------------------------------
text = read('main.dart')
text = regex_once(
    text,
    r"builder: \(_\) => path == '/store'\s*\? MatrixEndpointScreen\(endpoint: '/store', title: title\)\s*:\s*BridgePendingScreen\(.*?\),\s*\),",
    """builder: (_) => path == '/store'
                      ? MatrixEndpointScreen(endpoint: '/store', title: title)
                      : MatrixPageScreen(path: path, title: title),
                ),""",
    'More menu uses live page translator',
)
write('main.dart', text)


# ---------------------------------------------------------------------------
# BILLBOARD charts: never submit a one-click single-candidate vote to a chart
# whose server says it uses the Billboard method. Hand that ballot to the safe
# native page renderer until the dedicated drag/rank UI is completed.
# ---------------------------------------------------------------------------
text = read('charts.dart')
text = replace_once(
    text,
    """  Future<void> _vote(dynamic raw) async {
    if (!await _ensureAuth()) return;
""",
    """  Future<void> _vote(dynamic raw) async {
    final method = str(chart['votingMethod'] ?? chart['voting_method'] ?? chart['voteMethod'] ?? chart['vote_method']).toLowerCase();
    if (method == 'billboard') {
      await Navigator.push(context, MaterialPageRoute(builder: (_) => MatrixPageScreen(path: '/charts/${widget.slug}', title: '${widget.title} · Billboard Ballot')));
      await _load();
      return;
    }
    if (!await _ensureAuth()) return;
""",
    'Billboard charts must not use single-vote client action',
)
write('charts.dart', text)
