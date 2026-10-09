from pathlib import Path
import re

ROOT = Path('/tmp/rrn_mobile/lib')


def read(name: str) -> str:
    return (ROOT / name).read_text()


def write(name: str, text: str) -> None:
    (ROOT / name).write_text(text)


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if old not in text:
        raise SystemExit(f'v0.6 patch failed: {label}')
    return text.replace(old, new, 1)


# ---------------------------------------------------------------------------
# Playback controller: expose one system Previous/Next contract. Music maps to
# queue navigation. Live radio delegates to the active Reality Dial seek logic.
# ---------------------------------------------------------------------------
text = read('playback.dart')
text = replace_once(
    text,
    "  bool get canSkip => _handler?.canSkip ?? false;\n",
    "  bool get canSkip => _handler?.canSkip ?? false;\n"
    "  FutureOr<void> Function(int direction)? radioSeekHandler;\n"
    "  bool get systemCanSkip => live ? radioSeekHandler != null : canSkip;\n",
    'playback system skip getter',
)
text = replace_once(
    text,
    "  Future<void> toggle() => playing ? pause() : resume();\n\n",
    "  Future<void> toggle() => playing ? pause() : resume();\n\n"
    "  Future<void> systemNext() async {\n"
    "    if (live && radioSeekHandler != null) {\n"
    "      await radioSeekHandler!(1);\n"
    "      return;\n"
    "    }\n"
    "    await skipNext();\n"
    "  }\n\n"
    "  Future<void> systemPrevious() async {\n"
    "    if (live && radioSeekHandler != null) {\n"
    "      await radioSeekHandler!(-1);\n"
    "      return;\n"
    "    }\n"
    "    await skipPrevious();\n"
    "  }\n\n",
    'playback system skip methods',
)
write('playback.dart', text)


# ---------------------------------------------------------------------------
# Reality Dial: register its already-existing station seek logic as the live
# media Previous/Next handler used by notification, lock screen and mini-player.
# ---------------------------------------------------------------------------
text = read('tuner_v04.dart')
text = replace_once(
    text,
    "  Future<void> _initialize() async {\n    final prefs = app!.prefs;\n",
    "  Future<void> _initialize() async {\n"
    "    playback.radioSeekHandler = (direction) {\n"
    "      if (!powered) powered = true;\n"
    "      _seekStation(direction);\n"
    "    };\n"
    "    final prefs = app!.prefs;\n",
    'dial register radio system seek',
)
text = replace_once(
    text,
    "  void dispose() {\n    tuneTimer?.cancel();\n",
    "  void dispose() {\n"
    "    playback.radioSeekHandler = null;\n"
    "    tuneTimer?.cancel();\n",
    'dial clear radio system seek',
)
write('tuner_v04.dart', text)


# ---------------------------------------------------------------------------
# Main shell: start the explicit native Android media surface and expose radio
# scan buttons in the internal mini-player too.
# ---------------------------------------------------------------------------
text = read('main.dart')
text = replace_once(
    text,
    "import 'music_v04.dart';\nimport 'playback.dart';\n",
    "import 'music_v04.dart';\nimport 'native_endpoint.dart';\nimport 'playback.dart';\nimport 'system_media.dart';\n",
    'main native imports',
)
text = replace_once(
    text,
    "  await RrnPlaybackController.instance.attachHandler(mediaHandler);\n\n",
    "  await RrnPlaybackController.instance.attachHandler(mediaHandler);\n"
    "  await RrnSystemMediaBridge.instance.attach(RrnPlaybackController.instance);\n\n",
    'attach native system media bridge',
)
text = replace_once(
    text,
    "            if (!playback.live)\n"
    "              _control(\n"
    "                onPressed: playback.canSkip ? playback.skipPrevious : null,\n"
    "                icon: Icons.skip_previous,\n"
    "                tooltip: 'Previous',\n"
    "              ),\n",
    "            _control(\n"
    "              onPressed: playback.systemCanSkip ? playback.systemPrevious : null,\n"
    "              icon: Icons.skip_previous,\n"
    "              tooltip: playback.live ? 'Scan down' : 'Previous',\n"
    "            ),\n",
    'mini-player previous/scan down',
)
text = replace_once(
    text,
    "            if (!playback.live)\n"
    "              _control(\n"
    "                onPressed: playback.canSkip ? playback.skipNext : null,\n"
    "                icon: Icons.skip_next,\n"
    "                tooltip: 'Next',\n"
    "              ),\n",
    "            _control(\n"
    "              onPressed: playback.systemCanSkip ? playback.systemNext : null,\n"
    "              icon: Icons.skip_next,\n"
    "              tooltip: playback.live ? 'Scan up' : 'Next',\n"
    "            ),\n",
    'mini-player next/scan up',
)
old_more = "              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => MatrixPageScreen(path: path, title: title))),\n"
new_more = "              onTap: () => Navigator.push(\n"
new_more += "                context,\n"
new_more += "                MaterialPageRoute(\n"
new_more += "                  builder: (_) => path == '/store'\n"
new_more += "                      ? MatrixEndpointScreen(endpoint: '/store', title: title)\n"
new_more += "                      : BridgePendingScreen(\n"
new_more += "                          title: title,\n"
new_more += "                          endpoint: 'GET /api/app/v1/page?path=$path',\n"
new_more += "                          description: 'The generic safe-page Translation Matrix endpoint is not present in the current site build yet.',\n"
new_more += "                        ),\n"
new_more += "                ),\n"
new_more += "              ),\n"
text = replace_once(text, old_more, new_more, 'More screen no silent WebView fallback')
write('main.dart', text)


# ---------------------------------------------------------------------------
# Music: Store already has a Matrix endpoint, so use it natively. Library stays
# native and honest: favorites work now; owned music/playlists await app wrappers.
# Live Now Playing gets scan-down / scan-up controls.
# ---------------------------------------------------------------------------
text = read('music_v04.dart')
text = replace_once(
    text,
    "import 'core.dart';\nimport 'playback.dart';\n",
    "import 'core.dart';\nimport 'native_endpoint.dart';\nimport 'playback.dart';\n",
    'music native endpoint import',
)
text = replace_once(
    text,
    "onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const WebFallbackScreen(path: '/store', title: 'RRN Store'))),",
    "onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const MatrixEndpointScreen(endpoint: '/store', title: 'RRN Store'))),",
    'native store endpoint',
)

library_pattern = re.compile(
    r"\n    Object\? libraryError;.*?\n    busy = false;",
    re.S,
)
library_replacement = """
    try {
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
text, count = library_pattern.subn(library_replacement, text, count=1)
if count != 1:
    raise SystemExit('v0.6 patch failed: native library source')

text = replace_once(
    text,
    "            subtitle: 'Owned music is requested from the RRN account library; Matrix favorites remain available when the older library route cannot use the native app session.',\n",
    "            subtitle: 'Favorites stay native through the Matrix. Owned music, pre-orders and saved playlists need the new app-library bridge documented for the next site build.',\n",
    'library honest subtitle',
)
text = replace_once(
    text,
    "          IconButton(\n"
    "            onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const WebFallbackScreen(path: '/library', title: 'Full Web Library'))),\n"
    "            icon: const Icon(Icons.language),\n"
    "            tooltip: 'Full web library',\n"
    "          ),\n",
    "          IconButton(\n"
    "            onPressed: () => Navigator.push(\n"
    "              context,\n"
    "              MaterialPageRoute(\n"
    "                builder: (_) => const BridgePendingScreen(\n"
    "                  title: 'Full Music Library',\n"
    "                  endpoint: 'GET /api/app/v1/library',\n"
    "                  description: 'Favorites are native now. Owned music and pre-orders require a bearer-session Matrix wrapper.',\n"
    "                ),\n"
    "              ),\n"
    "            ),\n"
    "            icon: const Icon(Icons.info_outline),\n"
    "            tooltip: 'Library bridge status',\n"
    "          ),\n",
    'library remove website globe',
)
text = replace_once(
    text,
    "                onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const WebFallbackScreen(path: '/playlists', title: 'RRN Playlists'))),\n"
    "                icon: const Icon(Icons.playlist_play),\n"
    "                label: const Text('Web Playlists'),\n",
    "                onPressed: () => Navigator.push(\n"
    "                  context,\n"
    "                  MaterialPageRoute(\n"
    "                    builder: (_) => const BridgePendingScreen(\n"
    "                      title: 'RRN Playlists',\n"
    "                      endpoint: 'GET /api/app/v1/library/playlists',\n"
    "                      description: 'Playlist storage exists on the website, but the native bearer-session playlist wrapper is not in the Matrix yet.',\n"
    "                    ),\n"
    "                  ),\n"
    "                ),\n"
    "                icon: const Icon(Icons.playlist_play),\n"
    "                label: const Text('Playlists'),\n",
    'library native playlist pending surface',
)
text = replace_once(
    text,
    "                subtitle: playback.live\n"
    "                    ? 'Play, pause and stop remain available through the shared media session.'\n"
    "                    : 'This is the same queue Android receives for Previous/Next and media-session playback.',\n",
    "                subtitle: playback.live\n"
    "                    ? 'Live radio uses Previous/Next as Scan Down/Scan Up through the Reality Dial.'\n"
    "                    : 'This is the same queue Android receives for Previous/Next and media-session playback.',\n",
    'queue live scan wording',
)
old_live_controls = """              else
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
                ),"""
new_live_controls = """              else
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    IconButton(
                      onPressed: playback.systemCanSkip ? playback.systemPrevious : null,
                      icon: const Icon(Icons.skip_previous, size: 38),
                      tooltip: 'Scan down',
                    ),
                    IconButton.filledTonal(
                      onPressed: playback.toggle,
                      icon: Icon(playback.playing ? Icons.pause : Icons.play_arrow, size: 40),
                    ),
                    IconButton(
                      onPressed: playback.systemCanSkip ? playback.systemNext : null,
                      icon: const Icon(Icons.skip_next, size: 38),
                      tooltip: 'Scan up',
                    ),
                    IconButton.filledTonal(onPressed: playback.stop, icon: const Icon(Icons.stop, size: 32)),
                  ],
                ),"""
text = replace_once(text, old_live_controls, new_live_controls, 'live now playing scan controls')
write('music_v04.dart', text)


# ---------------------------------------------------------------------------
# Connect: preserve Official Feed vs Community semantics. Current backend may
# ignore scope until the next site build; client also filters when author_type is
# present. Publishing/Friends/Events now name their missing native contracts.
# ---------------------------------------------------------------------------
text = read('social.dart')
text = replace_once(
    text,
    "import 'inbox.dart';\nimport 'site.dart';\n",
    "import 'inbox.dart';\nimport 'native_endpoint.dart';\nimport 'site.dart';\n",
    'social native endpoint import',
)
text = replace_once(
    text,
    "  final List<Map<String, dynamic>> posts = [];\n",
    "  final List<Map<String, dynamic>> posts = [];\n  String feedScope = 'official';\n",
    'social feed scope state',
)
text = replace_once(
    text,
    "      final body = await RrnScope.of(context).api.get('/feed', query: {\n        'limit': 40,\n",
    "      final body = await RrnScope.of(context).api.get('/feed', query: {\n        'limit': 40,\n        'scope': feedScope,\n",
    'social feed scope query',
)
text = replace_once(
    text,
    "                  onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const MatrixPageScreen(path: '/feed/new', title: 'Create Post'))).then((_) => _load(reset: true)),\n",
    "                  onPressed: () => Navigator.push(\n"
    "                    context,\n"
    "                    MaterialPageRoute(\n"
    "                      builder: (_) => const BridgePendingScreen(\n"
    "                        title: 'Create Post',\n"
    "                        endpoint: 'POST /api/app/v1/feed/publish',\n"
    "                        description: 'Feed reading and interaction are already native. Publishing still needs an app bearer-session wrapper and posting-identities endpoint.',\n"
    "                      ),\n"
    "                    ),\n"
    "                  ),\n",
    'social create post bridge status',
)
selector_anchor = """            const SizedBox(height: 10),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,"""
selector_replacement = """            const SizedBox(height: 10),
            SegmentedButton<String>(
              segments: const [
                ButtonSegment(value: 'official', label: Text('Official'), icon: Icon(Icons.verified_outlined)),
                ButtonSegment(value: 'community', label: Text('Community'), icon: Icon(Icons.people_outline)),
                ButtonSegment(value: 'all', label: Text('All'), icon: Icon(Icons.view_stream_outlined)),
              ],
              selected: {feedScope},
              onSelectionChanged: (value) {
                feedScope = value.first;
                _load(reset: true);
              },
            ),
            const SizedBox(height: 10),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,"""
text = replace_once(text, selector_anchor, selector_replacement, 'social official/community selector')
text = replace_once(
    text,
    "                  _chip('Friends', Icons.group_outlined, () => Navigator.push(context, MaterialPageRoute(builder: (_) => const MatrixPageScreen(path: '/community/friends', title: 'Friends')))),\n"
    "                  _chip('Events', Icons.event_outlined, () => Navigator.push(context, MaterialPageRoute(builder: (_) => const MatrixPageScreen(path: '/events', title: 'Events')))),\n",
    "                  _chip(\n"
    "                    'Friends',\n"
    "                    Icons.group_outlined,\n"
    "                    () => Navigator.push(\n"
    "                      context,\n"
    "                      MaterialPageRoute(\n"
    "                        builder: (_) => const BridgePendingScreen(\n"
    "                          title: 'Friends',\n"
    "                          endpoint: 'GET /api/app/v1/friends',\n"
    "                          description: 'The website friendship system exists, but its mobile bearer-session wrapper is not in the Matrix yet.',\n"
    "                        ),\n"
    "                      ),\n"
    "                    ),\n"
    "                  ),\n"
    "                  _chip(\n"
    "                    'Events',\n"
    "                    Icons.event_outlined,\n"
    "                    () => Navigator.push(\n"
    "                      context,\n"
    "                      MaterialPageRoute(\n"
    "                        builder: (_) => const BridgePendingScreen(\n"
    "                          title: 'Events',\n"
    "                          endpoint: 'GET /api/app/v1/events',\n"
    "                          description: 'Events need a dedicated Matrix wrapper or the generic safe-page endpoint before they are truly native.',\n"
    "                        ),\n"
    "                      ),\n"
    "                    ),\n"
    "                  ),\n",
    'social friends/events no fake page route',
)
text = replace_once(
    text,
    "            ...posts.map(_postCard),\n",
    "            ...posts.where(_matchesScope).map(_postCard),\n",
    'social client scope filter',
)
text = replace_once(
    text,
    "  Widget _chip(String label, IconData icon, VoidCallback onTap) => Padding(\n",
    "  bool _matchesScope(Map<String, dynamic> post) {\n"
    "    if (feedScope == 'all') return true;\n"
    "    final authorType = str(post['author_type'] ?? post['authorType']).toLowerCase();\n"
    "    final userId = str(post['author_user_id'] ?? post['authorUserId']);\n"
    "    final isMemberPost = authorType == 'user' || (authorType.isEmpty && userId.isNotEmpty);\n"
    "    return feedScope == 'community' ? isMemberPost : !isMemberPost;\n"
    "  }\n\n"
    "  Widget _chip(String label, IconData icon, VoidCallback onTap) => Padding(\n",
    'social scope filter method',
)
text = replace_once(
    text,
    "    final author = str(post['author_name'] ?? post['authorName'], 'Reality Radio Network');\n"
    "    final authorImage = _absoluteMedia(str(post['author_image'] ?? post['authorImage']));\n",
    "    final authorData = post['author'] is Map ? Map<String, dynamic>.from(post['author']) : const <String, dynamic>{};\n"
    "    final author = str(post['author_name'] ?? post['authorName'] ?? authorData['name'] ?? authorData['displayName'], 'Reality Radio Network');\n"
    "    final authorImage = _absoluteMedia(str(post['author_image'] ?? post['authorImage'] ?? authorData['avatarUrl'] ?? authorData['image']));\n",
    'social normalized author support',
)
write('social.dart', text)

print('RRN Mobile v0.6 Dart parity patches applied successfully.')
