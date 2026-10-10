from pathlib import Path
import re

ROOT = Path('/tmp/rrn_mobile/lib')


def read(name: str) -> str:
    return (ROOT / name).read_text()


def write(name: str, text: str) -> None:
    (ROOT / name).write_text(text)


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if old not in text:
        raise SystemExit(f'v0.11 patch failed: {label}')
    return text.replace(old, new, 1)


def regex_once(text: str, pattern: str, replacement: str, label: str) -> str:
    result, count = re.subn(pattern, replacement, text, count=1, flags=re.S)
    if count != 1:
        raise SystemExit(f'v0.11 patch failed: {label}')
    return result


# ---------------------------------------------------------------------------
# ACCOUNT IDENTITY: /auth/me does not always expose the website avatar. Accept
# every profile-image spelling used by the site and fall back to /account/profile.
# ---------------------------------------------------------------------------
text = read('core.dart')
account_user = r'''class AccountUser {
  final String id;
  final String displayName;
  final String email;
  final String avatar;
  final List<String> roles;
  final List<String> permissions;
  final int points;

  const AccountUser({
    required this.id,
    required this.displayName,
    required this.email,
    required this.avatar,
    required this.roles,
    required this.permissions,
    required this.points,
  });

  static String _firstString(Iterable<dynamic> values) {
    for (final value in values) {
      final candidate = str(value).trim();
      if (candidate.isNotEmpty && candidate.toLowerCase() != 'null') return candidate;
    }
    return '';
  }

  factory AccountUser.from(dynamic raw) {
    final root = raw is Map ? Map<String, dynamic>.from(raw) : <String, dynamic>{};
    final data = root['data'] is Map ? Map<String, dynamic>.from(root['data']) : <String, dynamic>{};
    final user = root['user'] is Map
        ? Map<String, dynamic>.from(root['user'])
        : data['user'] is Map
            ? Map<String, dynamic>.from(data['user'])
            : <String, dynamic>{};
    final profile = root['profile'] is Map
        ? Map<String, dynamic>.from(root['profile'])
        : data['profile'] is Map
            ? Map<String, dynamic>.from(data['profile'])
            : <String, dynamic>{};
    final u = <String, dynamic>{...root, ...data, ...profile, ...user};
    final roles = listFrom(u['roles'] ?? root['roles']).map(str).where((e) => e.isNotEmpty).toList();
    final permissions = listFrom(u['permissions'] ?? root['permissions']).map(str).where((e) => e.isNotEmpty).toList();
    final avatar = _firstString([
      u['avatar'],
      u['avatarUrl'],
      u['avatar_url'],
      u['profileImage'],
      u['profile_image'],
      u['profilePicture'],
      u['profile_picture'],
      u['profilePhoto'],
      u['profile_photo'],
      u['photo'],
      u['photoUrl'],
      u['photo_url'],
      u['image'],
      u['imageUrl'],
      u['image_url'],
      profile['avatar'],
      profile['avatarUrl'],
      profile['avatar_url'],
    ]);
    return AccountUser(
      id: _firstString([u['id'], u['userId'], u['user_id']]),
      displayName: _firstString([u['displayName'], u['display_name'], u['name'], u['username']]).isEmpty
          ? 'RRN Listener'
          : _firstString([u['displayName'], u['display_name'], u['name'], u['username']]),
      email: _firstString([u['email'], root['email']]),
      avatar: avatar,
      roles: roles,
      permissions: permissions,
      points: numi(u['points'] ?? root['points'] ?? data['points']),
    );
  }

  AccountUser copyWith({
    String? id,
    String? displayName,
    String? email,
    String? avatar,
    List<String>? roles,
    List<String>? permissions,
    int? points,
  }) =>
      AccountUser(
        id: id ?? this.id,
        displayName: displayName ?? this.displayName,
        email: email ?? this.email,
        avatar: avatar ?? this.avatar,
        roles: roles ?? this.roles,
        permissions: permissions ?? this.permissions,
        points: points ?? this.points,
      );
}

class AuthController'''
text = regex_once(
    text,
    r"class AccountUser \{.*?\n\}\n\nclass AuthController",
    account_user,
    'robust AccountUser profile parsing',
)
text = replace_once(
    text,
    "      user = AccountUser.from(body);\n      error = null;\n      return true;\n",
    "      user = AccountUser.from(body);\n"
    "      if (user!.avatar.isEmpty) {\n"
    "        try {\n"
    "          final profileBody = await api.get('/account/profile');\n"
    "          final profile = AccountUser.from(profileBody);\n"
    "          if (profile.avatar.isNotEmpty || profile.displayName != 'RRN Listener') {\n"
    "            user = user!.copyWith(\n"
    "              avatar: profile.avatar.isNotEmpty ? profile.avatar : user!.avatar,\n"
    "              displayName: user!.displayName == 'RRN Listener' && profile.displayName != 'RRN Listener'\n"
    "                  ? profile.displayName\n"
    "                  : user!.displayName,\n"
    "            );\n"
    "          }\n"
    "        } catch (_) {}\n"
    "      }\n"
    "      error = null;\n"
    "      return true;\n",
    'profile avatar fallback load',
)
text = replace_once(
    text,
    "      if (user!.id.isEmpty) await loadMe(silent: true);\n",
    "      if (user!.id.isEmpty || user!.avatar.isEmpty) await loadMe(silent: true);\n",
    'login profile hydration',
)
write('core.dart', text)


# ---------------------------------------------------------------------------
# ACCOUNT ROUTING: use direct native account resources instead of /page for
# settings, replace the broken /studio translation with the native Studio hub,
# and put Discord somewhere users can actually see it.
# ---------------------------------------------------------------------------
text = read('account.dart')
if "import 'external_links.dart';" not in text:
    text = text.replace("import 'core.dart';\n", "import 'core.dart';\nimport 'external_links.dart';\n", 1)
if "import 'studio_native.dart';" not in text:
    text = text.replace("import 'site.dart';\n", "import 'site.dart';\nimport 'studio_native.dart';\n", 1)
text = replace_once(
    text,
    "          _tile('Social & messages', Icons.people_outline, '/account/social'),\n",
    "          _tile('Social & messages', Icons.people_outline, '/account/social'),\n"
    "          _tile('RRN Discord', Icons.forum_outlined, 'https://discord.realityradionetwork.com'),\n",
    'visible Discord account tile',
)
text = replace_once(
    text,
    "  void _openDestination(String title, String path) {\n    Widget screen;\n    switch (path) {\n",
    "  void _openDestination(String title, String path) {\n"
    "    if (path.startsWith('http://') || path.startsWith('https://')) {\n"
    "      openExternalUrl(context, path);\n"
    "      return;\n"
    "    }\n"
    "    Widget screen;\n"
    "    switch (path) {\n"
    "      case '/account/settings':\n"
    "        screen = const MatrixEndpointScreen(endpoint: '/account/settings', title: 'Profile & Settings');\n"
    "        break;\n"
    "      case '/studio':\n"
    "        screen = const RrnStudioScreen();\n"
    "        break;\n",
    'direct settings and Studio routing',
)
write('account.dart', text)


# ---------------------------------------------------------------------------
# MORE MENU: the old fallback used a dead Discord hostname. Keep the canonical
# RRN community redirect used by the website.
# ---------------------------------------------------------------------------
text = read('main.dart')
text = text.replace('https://discord.realityradio.net', 'https://discord.realityradionetwork.com')
write('main.dart', text)


# ---------------------------------------------------------------------------
# MATRIX ACTIONS: support the live 061j /actions dispatcher, executable endpoint
# descriptors, internal/external links, confirmations and navigation results.
# Also infer action descriptors from path/href/endpoint fields so cards are not
# visually present but dead.
# ---------------------------------------------------------------------------
text = read('site.dart')
helpers = r'''dynamic matrixActionFrom(Map<String, dynamic> item) {
  if (item['action'] != null) return item['action'];
  final actions = listFrom(item['actions']);
  if (actions.isNotEmpty) return actions.first;
  final endpoint = str(item['endpoint'] ?? item['controller']);
  final path = str(
    item['path'] ??
        item['href'] ??
        item['route'] ??
        item['webUrl'] ??
        item['web_url'] ??
        item['url'] ??
        item['detailPath'] ??
        item['detail_path'],
  );
  final actionId = str(item['actionId'] ?? item['action_id']);
  if (endpoint.isEmpty && path.isEmpty && actionId.isEmpty) return null;
  return <String, dynamic>{
    if (actionId.isNotEmpty) 'id': actionId,
    if (endpoint.isNotEmpty) 'endpoint': endpoint,
    if (path.isNotEmpty) 'path': path,
    if (item['method'] != null) 'method': item['method'],
    if (item['payload'] != null) 'payload': item['payload'],
    'label': str(item['actionLabel'] ?? item['action_label'] ?? item['label'] ?? item['title'], 'Open'),
  };
}

bool _matrixDirectResource(String path) {
  final clean = path.split('?').first;
  if (clean.startsWith('/account/')) return true;
  return const {
    '/shows',
    '/presenters',
    '/artists',
    '/events',
    '/support',
    '/submissions',
    '/actions',
    '/charts',
    '/store',
  }.contains(clean);
}

Future<bool> _matrixConfirm(BuildContext context, dynamic confirm) async {
  if (confirm == null || confirm == false || str(confirm).isEmpty) return true;
  final message = confirm is Map
      ? str(confirm['message'] ?? confirm['text'] ?? confirm['title'], 'Continue with this action?')
      : str(confirm, 'Continue with this action?');
  return await showDialog<bool>(
        context: context,
        builder: (dialogContext) => AlertDialog(
          title: const Text('Confirm'),
          content: Text(message),
          actions: [
            TextButton(onPressed: () => Navigator.pop(dialogContext, false), child: const Text('Cancel')),
            FilledButton(onPressed: () => Navigator.pop(dialogContext, true), child: const Text('Continue')),
          ],
        ),
      ) ??
      false;
}

Future<void> _matrixNavigate(BuildContext context, String rawPath, String title) async {
  if (rawPath.isEmpty || !context.mounted) return;
  if (rawPath.startsWith('http://') || rawPath.startsWith('https://')) {
    final uri = Uri.tryParse(rawPath);
    if (uri != null && uri.host.contains('realityradio')) {
      final internal = '${uri.path}${uri.hasQuery ? '?${uri.query}' : ''}';
      if (_matrixDirectResource(internal)) {
        final data = await RrnScope.of(context).api.get(internal);
        if (context.mounted) {
          await Navigator.push(context, MaterialPageRoute(builder: (_) => MatrixActionDataScreen(title: title, data: data)));
        }
      } else {
        await Navigator.push(context, MaterialPageRoute(builder: (_) => MatrixPageScreen(path: internal, title: title)));
      }
    } else {
      await openExternalUrl(context, rawPath);
    }
    return;
  }
  if (_matrixDirectResource(rawPath)) {
    final data = await RrnScope.of(context).api.get(rawPath);
    if (context.mounted) {
      await Navigator.push(context, MaterialPageRoute(builder: (_) => MatrixActionDataScreen(title: title, data: data)));
    }
  } else {
    await Navigator.push(context, MaterialPageRoute(builder: (_) => MatrixPageScreen(path: rawPath, title: title)));
  }
}

Future<dynamic> runMatrixAction(BuildContext context, dynamic rawAction, {String fallbackTitle = 'RRN'}) async {
  final a = rawAction is Map
      ? Map<String, dynamic>.from(rawAction)
      : <String, dynamic>{'id': str(rawAction), 'label': str(rawAction)};
  final title = str(a['label'] ?? a['title'], fallbackTitle);
  if (!await _matrixConfirm(context, a['confirm'])) return null;

  final endpoint = str(a['endpoint'] ?? a['controller']);
  final path = str(a['path'] ?? a['href'] ?? a['webUrl'] ?? a['web_url'] ?? a['url']);
  final id = str(a['id'] ?? a['actionId'] ?? a['action_id']);
  final method = str(a['method'], endpoint.isNotEmpty ? 'POST' : 'GET').toUpperCase();
  final payload = a['payload'] ?? const <String, dynamic>{};

  if (endpoint.isEmpty && path.isNotEmpty) {
    await _matrixNavigate(context, path, title);
    return null;
  }

  final api = RrnScope.of(context).api;
  dynamic body;
  if (endpoint.isNotEmpty) {
    body = method == 'GET'
        ? await api.get(endpoint, query: a['query'] is Map ? Map<String, dynamic>.from(a['query']) : null)
        : method == 'PATCH'
            ? await api.patch(endpoint, body: payload)
            : method == 'DELETE'
                ? await api.delete(endpoint, body: payload)
                : await api.post(endpoint, body: payload);
  } else if (id.isNotEmpty) {
    body = await api.post('/actions', body: {
      'actionId': id,
      'payload': payload,
      if (a['idempotencyKey'] != null) 'idempotencyKey': a['idempotencyKey'],
    });
  } else {
    throw StateError('This RRN item does not expose an executable action yet.');
  }

  if (!context.mounted) return body;

  final responseMap = body is Map ? Map<String, dynamic>.from(body) : <String, dynamic>{};
  final result = responseMap['result'] is Map ? Map<String, dynamic>.from(responseMap['result']) : const <String, dynamic>{};
  final navigate = str(responseMap['navigate'] ?? result['navigate']);
  if (navigate.isNotEmpty) {
    await _matrixNavigate(context, navigate, title);
    return body;
  }

  if (method == 'GET' && (body is Map || body is List)) {
    await Navigator.push(context, MaterialPageRoute(builder: (_) => MatrixActionDataScreen(title: title, data: body)));
    return body;
  }

  final message = str(responseMap['message']);
  if (message.isNotEmpty && context.mounted) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
  }
  return body;
}

class MatrixActionDataScreen extends StatelessWidget {
  final String title;
  final dynamic data;
  const MatrixActionDataScreen({super.key, required this.title, required this.data});

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: Text(title)),
        body: _body(context),
      );

  Widget _body(BuildContext context) {
    if (data is Map) {
      final map = Map<String, dynamic>.from(data as Map);
      if (listFrom(map['blocks']).isNotEmpty || str(map['title'] ?? map['name']).isNotEmpty) {
        return MatrixPageRenderer(page: {'title': title, ...map});
      }
      final lists = <MapEntry<String, List<dynamic>>>[];
      for (final entry in map.entries) {
        if (entry.value is List) lists.add(MapEntry(entry.key, List<dynamic>.from(entry.value as List)));
      }
      if (lists.isNotEmpty) {
        return ListView(
          padding: const EdgeInsets.fromLTRB(14, 14, 14, 100),
          children: [
            RrnSectionHeader(eyebrow: 'Native Matrix', title: title),
            const SizedBox(height: 12),
            for (final section in lists) ...[
              Text(section.key.replaceAll('_', ' ').toUpperCase(), style: const TextStyle(color: rrnCyan, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1.2)),
              const SizedBox(height: 6),
              if (section.value.isEmpty)
                const Card(child: ListTile(title: Text('Nothing here yet.'), subtitle: Text('The server returned an empty collection.')))
              else
                ...section.value.map((raw) => _record(context, raw)),
              const SizedBox(height: 10),
            ],
          ],
        );
      }
      return ListView(
        padding: const EdgeInsets.fromLTRB(14, 14, 14, 100),
        children: [
          RrnSectionHeader(eyebrow: 'Native Matrix', title: title),
          const SizedBox(height: 12),
          ...map.entries.where((entry) => entry.value != null).map(
                (entry) => Card(
                  child: ListTile(
                    title: Text(entry.key.replaceAll('_', ' '), style: const TextStyle(fontWeight: FontWeight.w800)),
                    subtitle: Text(str(entry.value)),
                  ),
                ),
              ),
        ],
      );
    }
    if (data is List) {
      final rows = List<dynamic>.from(data as List);
      return ListView(
        padding: const EdgeInsets.fromLTRB(14, 14, 14, 100),
        children: [
          RrnSectionHeader(eyebrow: 'Native Matrix', title: title),
          const SizedBox(height: 12),
          if (rows.isEmpty)
            const Card(child: ListTile(title: Text('Nothing here yet.')))
          else
            ...rows.map((row) => _record(context, row)),
        ],
      );
    }
    return Center(child: Padding(padding: const EdgeInsets.all(20), child: Text(str(data, 'No content returned.'))));
  }

  Widget _record(BuildContext context, dynamic raw) {
    final item = raw is Map ? Map<String, dynamic>.from(raw) : <String, dynamic>{'title': str(raw)};
    final action = matrixActionFrom(item);
    final recordTitle = str(item['title'] ?? item['name'] ?? item['displayName'] ?? item['display_name'] ?? item['label'], 'RRN');
    final subtitle = [
      str(item['subtitle'] ?? item['summary'] ?? item['description']),
      str(item['status']),
      str(item['designation']),
    ].where((value) => value.isNotEmpty).join(' · ');
    return Card(
      child: ListTile(
        title: Text(recordTitle, style: const TextStyle(fontWeight: FontWeight.w900)),
        subtitle: subtitle.isEmpty ? null : Text(subtitle),
        trailing: action == null ? null : const Icon(Icons.chevron_right),
        onTap: action == null ? null : () => runMatrixAction(context, action, fallbackTitle: recordTitle),
      ),
    );
  }
}

'''
text = replace_once(
    text,
    "class MatrixActionButton extends StatefulWidget {\n",
    helpers + "class MatrixActionButton extends StatefulWidget {\n",
    'canonical Matrix action helpers',
)
# Make existing translated cards recognize path/href/endpoint/actions instead of
# only a literal `action` property.
text = text.replace(
    "m['action'] != null ? MatrixActionButton(action: m['action'], compact: true) : null",
    "matrixActionFrom(m) != null ? MatrixActionButton(action: matrixActionFrom(m), compact: true) : null",
)
text = text.replace(
    "x['action'] != null ? MatrixActionButton(action: x['action'], compact: true) : null",
    "matrixActionFrom(x) != null ? MatrixActionButton(action: matrixActionFrom(x), compact: true) : null",
)
# Replace the v0.9 endpoint-only runner with the canonical 061j action dispatcher.
text = regex_once(
    text,
    r"  Future<void> _run\(Map<String, dynamic> a\) async \{.*?\n  \}\n\}\n\nclass MatrixFormRenderer",
    r'''  Future<void> _run(Map<String, dynamic> a) async {
    setState(() => busy = true);
    try {
      await runMatrixAction(context, a, fallbackTitle: str(a['label'] ?? a['title'], 'RRN'));
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }
}

class MatrixFormRenderer''',
    'canonical MatrixActionButton runner',
)
write('site.dart', text)


# ---------------------------------------------------------------------------
# NATIVE RESOURCE CARDS: every returned record either executes its descriptor or
# opens a native details screen. Empty collections render as empty states instead
# of a raw "items []" debug card.
# ---------------------------------------------------------------------------
text = read('native_endpoint.dart')
text = replace_once(
    text,
    "      final items = listFrom(map, const ['items', 'products', 'results', 'entries']);\n"
    "      if (items.isNotEmpty) return _collection(items, map);\n"
    "      final sections = <MapEntry<String, List<dynamic>>>[];\n",
    "      final collectionKeys = const ['items', 'products', 'results', 'entries'];\n"
    "      for (final key in collectionKeys) {\n"
    "        if (map[key] is List) return _collection(List<dynamic>.from(map[key] as List), map);\n"
    "      }\n"
    "      final sections = <MapEntry<String, List<dynamic>>>[];\n",
    'empty collection recognition',
)
collection_method = r'''  Widget _collection(List<dynamic> rawItems, Map<String, dynamic> envelope) {
    final rootActions = listFrom(envelope['actions']);
    final rootLinks = listFrom(envelope['links']);
    return ListView(
      padding: const EdgeInsets.fromLTRB(14, 16, 14, 100),
      children: [
        RrnSectionHeader(
          eyebrow: 'Native Matrix',
          title: str(envelope['title'], widget.title),
          subtitle: str(envelope['summary'] ?? envelope['description']).isEmpty
              ? 'Loaded directly from ${widget.endpoint}.'
              : str(envelope['summary'] ?? envelope['description']),
        ),
        const SizedBox(height: 12),
        if (rawItems.isEmpty)
          Card(
            child: ListTile(
              leading: const Icon(Icons.inbox_outlined, color: rrnCyan),
              title: Text(widget.endpoint == '/account/applications' ? 'No applications yet.' : 'Nothing here yet.'),
              subtitle: Text(widget.endpoint == '/account/applications'
                  ? 'The server returned an empty applications collection for this account.'
                  : 'The server returned an empty collection.'),
            ),
          )
        else
          ...rawItems.map((raw) {
            final item = raw is Map ? Map<String, dynamic>.from(raw) : <String, dynamic>{'title': '$raw'};
            final image = _absolute(str(
              item['image'] ??
                  item['imageUrl'] ??
                  item['image_url'] ??
                  item['artwork'] ??
                  item['artworkUrl'] ??
                  item['avatarUrl'] ??
                  item['avatar_url'] ??
                  item['coverUrl'] ??
                  item['cover_url'],
            ));
            final title = str(item['title'] ?? item['name'] ?? item['displayName'] ?? item['display_name'] ?? item['label'], 'RRN');
            final subtitle = [
              str(item['artist'] ?? item['subtitle']),
              str(item['status']),
              str(item['designation'] ?? item['frequencyLabel'] ?? item['frequency_label']),
              str(item['price'] ?? item['displayPrice'] ?? item['display_price']),
              str(item['summary'] ?? item['description']),
            ].where((e) => e.isNotEmpty).join(' · ');
            final action = matrixActionFrom(item);
            return Card(
              child: ListTile(
                leading: image.isEmpty
                    ? const CircleAvatar(backgroundColor: Color(0xFF10262B), child: Icon(Icons.auto_awesome, color: rrnCyan))
                    : ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: Image.network(image, width: 52, height: 52, fit: BoxFit.cover, errorBuilder: (_, __, ___) => const SizedBox(width: 52, height: 52)),
                      ),
                title: Text(title, style: const TextStyle(fontWeight: FontWeight.w900)),
                subtitle: subtitle.isEmpty ? null : Text(subtitle, maxLines: 3, overflow: TextOverflow.ellipsis),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  if (action != null) {
                    runMatrixAction(context, action, fallbackTitle: title);
                  } else {
                    Navigator.push(context, MaterialPageRoute(builder: (_) => NativeRecordDetailsScreen(title: title, record: item)));
                  }
                },
              ),
            );
          }),
        if (rootLinks.isNotEmpty || rootActions.isNotEmpty) ...[
          const SizedBox(height: 12),
          ...rootLinks.map((link) => MatrixTranslatedLinkButton(link: link)),
          if (rootActions.isNotEmpty)
            Wrap(spacing: 8, runSpacing: 8, children: rootActions.map((action) => MatrixActionButton(action: action)).toList()),
        ],
      ],
    );
  }

'''
text = regex_once(
    text,
    r"  Widget _collection\(List<dynamic> rawItems, Map<String, dynamic> envelope\) \{.*?\n  \}\n\n  Widget _sectionedCollections",
    collection_method + "  Widget _sectionedCollections",
    'interactive native resource collection',
)
section_method = r'''  Widget _sectionedCollections(List<MapEntry<String, List<dynamic>>> sections, Map<String, dynamic> envelope) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(14, 16, 14, 100),
      children: [
        RrnSectionHeader(
          eyebrow: 'Native Matrix',
          title: str(envelope['title'] ?? envelope['name'], widget.title),
          subtitle: str(envelope['summary'] ?? envelope['description']).isEmpty
              ? 'Loaded directly from ${widget.endpoint}.'
              : str(envelope['summary'] ?? envelope['description']),
        ),
        const SizedBox(height: 12),
        for (final section in sections) ...[
          Text(section.key.replaceAll('_', ' ').toUpperCase(), style: const TextStyle(color: rrnCyan, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1.3)),
          const SizedBox(height: 5),
          ...section.value.map((raw) {
            final item = raw is Map ? Map<String, dynamic>.from(raw) : <String, dynamic>{'title': '$raw'};
            final title = str(item['title'] ?? item['name'] ?? item['displayName'] ?? item['display_name'] ?? item['label'], 'RRN');
            final subtitle = [
              str(item['subtitle'] ?? item['description'] ?? item['summary']),
              str(item['status']),
              str(item['designation']),
            ].where((value) => value.isNotEmpty).join(' · ');
            final action = matrixActionFrom(item);
            return Card(
              child: ListTile(
                title: Text(title, style: const TextStyle(fontWeight: FontWeight.w900)),
                subtitle: subtitle.isEmpty ? null : Text(subtitle, maxLines: 3, overflow: TextOverflow.ellipsis),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  if (action != null) {
                    runMatrixAction(context, action, fallbackTitle: title);
                  } else {
                    Navigator.push(context, MaterialPageRoute(builder: (_) => NativeRecordDetailsScreen(title: title, record: item)));
                  }
                },
              ),
            );
          }),
          const SizedBox(height: 12),
        ],
      ],
    );
  }

'''
text = regex_once(
    text,
    r"  Widget _sectionedCollections\(List<MapEntry<String, List<dynamic>>> sections, Map<String, dynamic> envelope\) \{.*?\n  \}\n\n  Widget _mapCard",
    section_method + "  Widget _mapCard",
    'interactive sectioned native resources',
)
detail_class = r'''class NativeRecordDetailsScreen extends StatelessWidget {
  final String title;
  final Map<String, dynamic> record;
  const NativeRecordDetailsScreen({super.key, required this.title, required this.record});

  @override
  Widget build(BuildContext context) {
    final action = matrixActionFrom(record);
    final hiddenKeys = <String>{'action', 'actions', 'image', 'imageUrl', 'image_url', 'artwork', 'artworkUrl', 'avatarUrl', 'avatar_url'};
    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
        children: [
          RrnSectionHeader(
            eyebrow: 'RRN',
            title: title,
            subtitle: str(record['summary'] ?? record['description']).isEmpty ? null : str(record['summary'] ?? record['description']),
          ),
          const SizedBox(height: 12),
          ...record.entries.where((entry) => !hiddenKeys.contains(entry.key) && entry.value != null && str(entry.value).isNotEmpty).map(
                (entry) => Card(
                  child: ListTile(
                    title: Text(entry.key.replaceAll('_', ' '), style: const TextStyle(fontWeight: FontWeight.w800)),
                    subtitle: Text(str(entry.value)),
                  ),
                ),
              ),
          if (action != null) ...[
            const SizedBox(height: 8),
            FilledButton.icon(
              onPressed: () => runMatrixAction(context, action, fallbackTitle: title),
              icon: const Icon(Icons.arrow_forward),
              label: const Text('Open'),
            ),
          ],
        ],
      ),
    );
  }
}

'''
text = replace_once(
    text,
    "/// Native alpha surface for a known backend parity gap.",
    detail_class + "/// Native alpha surface for a known backend parity gap.",
    'native record details screen',
)
write('native_endpoint.dart', text)

print('RRN Mobile v0.11 account/navigation/action fixes applied.')
