from pathlib import Path
import re

ROOT = Path('/tmp/rrn_mobile/lib')


def read(name: str) -> str:
    return (ROOT / name).read_text()


def write(name: str, text: str) -> None:
    (ROOT / name).write_text(text)


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if old not in text:
        raise SystemExit(f'v0.12 fixed patch failed: {label}')
    return text.replace(old, new, 1)


def regex_once(text: str, pattern: str, replacement: str, label: str) -> str:
    result, count = re.subn(pattern, replacement, text, count=1, flags=re.S)
    if count != 1:
        raise SystemExit(f'v0.12 fixed patch failed: {label} ({count})')
    return result


# ---------------------------------------------------------------------------
# ACCOUNT DESTINATIONS
# Management destinations are website page contracts translated natively, not
# raw resource payloads. Creator Catalog corresponds to /account/artists.
# Studio remains the dedicated native launcher and is restored by v0.12.1.
# ---------------------------------------------------------------------------
text = read('account.dart')
for old, new in {
    "screen = const MatrixEndpointScreen(endpoint: '/account/settings', title: 'Profile & Settings');":
        "screen = const MatrixPageScreen(path: '/account/settings', title: 'Profile & Settings');",
    "screen = const MatrixEndpointScreen(endpoint: '/account/orders', title: 'Orders & Purchases');":
        "screen = const MatrixPageScreen(path: '/account/orders', title: 'Orders & Purchases');",
    "screen = const MatrixEndpointScreen(endpoint: '/account/stations', title: 'My Stations');":
        "screen = const MatrixPageScreen(path: '/account/stations', title: 'My Stations');",
    "screen = const MatrixEndpointScreen(endpoint: '/account/presenter', title: 'Presenter');":
        "screen = const MatrixPageScreen(path: '/account/presenter', title: 'Presenter');",
    "screen = const MatrixEndpointScreen(endpoint: '/account/creator', title: 'Creator Catalog');":
        "screen = const MatrixPageScreen(path: '/account/artists', title: 'Creator Catalog');",
    "screen = const MatrixEndpointScreen(endpoint: '/account/labels', title: 'Labels');":
        "screen = const MatrixPageScreen(path: '/account/labels', title: 'Labels');",
    "screen = const MatrixEndpointScreen(endpoint: '/account/services', title: 'Services');":
        "screen = const MatrixPageScreen(path: '/account/services', title: 'Services');",
    "screen = const MatrixEndpointScreen(endpoint: '/account/applications', title: 'Applications');":
        "screen = const MatrixPageScreen(path: '/account/applications', title: 'Applications');",
    "screen = const MatrixEndpointScreen(endpoint: '/support', title: 'Reports & Support');":
        "screen = const MatrixPageScreen(path: '/account/reports', title: 'Reports & Support');",
    "screen = const RrnStudioScreen();":
        "screen = const MatrixPageScreen(path: '/studio', title: 'RRN Studio');",
}.items():
    text = text.replace(old, new)

# Role slugs are authorization metadata, not profile decoration.
text = re.sub(
    r"\s*if \(u\.roles\.isNotEmpty\)\s*Text\(u\.roles\.join\(' · '\),\s*style: const TextStyle\(color: rrnPurple, fontSize: 11\)\),",
    "",
    text,
    count=1,
    flags=re.S,
)
text = regex_once(
    text,
    r"  bool _likelyStaffRole\(String role\) \{.*?\n  \}",
    r'''  bool _likelyStaffRole(String role) {
    final r = role.toLowerCase();
    return const {'creator', 'editor', 'support', 'admin', 'developer', 'superadmin'}.contains(r);
  }''',
    'Studio role gate',
)
text = text.replace(
    "if (u.permissions.isNotEmpty || u.roles.any(_likelyStaffRole))",
    "if (u.permissions.contains('studio.access') || u.roles.any(_likelyStaffRole))",
)
write('account.dart', text)


# ---------------------------------------------------------------------------
# MATRIX PAGE/ACTION SEMANTICS
# Page paths always go through /page; controller/endpoint descriptors execute.
# Never reinterpret /account/... page links as JSON resources.
# ---------------------------------------------------------------------------
text = read('site.dart')
text = replace_once(
    text,
    "      final body = await RrnScope.of(context).api.get('/page', query: {'path': widget.path});",
    "      final parsedPath = Uri.tryParse(widget.path);\n"
    "      final pagePath = parsedPath?.path.isNotEmpty == true ? parsedPath!.path : widget.path.split('?').first.split('#').first;\n"
    "      final body = await RrnScope.of(context).api.get('/page', query: {'path': pagePath});",
    'page pathname normalization',
)

navigate_method = r'''Future<void> _matrixNavigate(BuildContext context, String rawPath, String title) async {
  if (rawPath.isEmpty || !context.mounted) return;

  if (rawPath.startsWith('http://') || rawPath.startsWith('https://')) {
    final uri = Uri.tryParse(rawPath);
    if (uri != null && uri.host.contains('realityradio')) {
      final internal = uri.path.isEmpty ? '/' : uri.path;
      await Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => MatrixPageScreen(path: internal, title: title)),
      );
    } else {
      await openExternalUrl(context, rawPath);
    }
    return;
  }

  final uri = Uri.tryParse(rawPath);
  final internal = uri?.path.isNotEmpty == true ? uri!.path : rawPath.split('?').first.split('#').first;
  await Navigator.push(
    context,
    MaterialPageRoute(builder: (_) => MatrixPageScreen(path: internal, title: title)),
  );
}'''
text = regex_once(
    text,
    r"Future<void> _matrixNavigate\(BuildContext context, String rawPath, String title\) async \{.*?\n\}\n\nFuture<dynamic> runMatrixAction",
    navigate_method + "\n\nFuture<dynamic> runMatrixAction",
    'page/navigation semantics',
)

# GET/action responses may contain data for app logic, but arbitrary map fields
# must never become a user-facing JSON inspector.
safe_action_screen = r'''class MatrixActionDataScreen extends StatelessWidget {
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
      if (listFrom(map['blocks']).isNotEmpty ||
          listFrom(map['forms']).isNotEmpty ||
          str(map['title'] ?? map['name']).isNotEmpty) {
        return MatrixPageRenderer(page: {'title': title, ...map});
      }

      final sections = <MapEntry<String, List<dynamic>>>[];
      for (final key in const [
        'items', 'results', 'entries', 'products', 'stations', 'presenters',
        'programs', 'artists', 'labels', 'services', 'applications'
      ]) {
        if (map[key] is List) sections.add(MapEntry(key, List<dynamic>.from(map[key] as List)));
      }
      if (sections.isNotEmpty) return _sections(context, sections);

      return _protected(
        'This action returned backend state without a user-facing presentation contract. '
        'RRN Mobile intentionally hides the raw fields.',
      );
    }

    if (data is List) {
      return _sections(context, [MapEntry('items', List<dynamic>.from(data as List))]);
    }
    return _protected('The action completed without user-facing content.');
  }

  Widget _sections(BuildContext context, List<MapEntry<String, List<dynamic>>> sections) => ListView(
        padding: const EdgeInsets.fromLTRB(14, 14, 14, 100),
        children: [
          RrnSectionHeader(eyebrow: 'RRN', title: title),
          const SizedBox(height: 12),
          for (final section in sections) ...[
            if (sections.length > 1)
              Padding(
                padding: const EdgeInsets.only(bottom: 6),
                child: Text(
                  section.key.replaceAll('_', ' ').toUpperCase(),
                  style: const TextStyle(color: rrnCyan, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1.2),
                ),
              ),
            if (section.value.isEmpty)
              const Card(child: ListTile(title: Text('Nothing here yet.')))
            else
              ...section.value.map((row) => _record(context, row)),
            const SizedBox(height: 10),
          ],
        ],
      );

  Widget _record(BuildContext context, dynamic raw) {
    final item = raw is Map ? Map<String, dynamic>.from(raw) : <String, dynamic>{'title': str(raw)};
    final action = matrixActionFrom(item);
    final recordTitle = str(
      item['title'] ?? item['name'] ?? item['displayName'] ?? item['display_name'] ??
          item['product_name'] ?? item['station_name'] ?? item['label'],
      'RRN',
    );
    final subtitle = [
      str(item['subtitle'] ?? item['summary'] ?? item['description']),
      str(item['status']),
      str(item['designation']),
    ].where((value) => value.isNotEmpty).join(' · ');
    return Card(
      child: ListTile(
        title: Text(recordTitle, style: const TextStyle(fontWeight: FontWeight.w900)),
        subtitle: subtitle.isEmpty ? null : Text(subtitle, maxLines: 3, overflow: TextOverflow.ellipsis),
        trailing: action == null ? null : const Icon(Icons.chevron_right),
        onTap: action == null ? null : () => runMatrixAction(context, action, fallbackTitle: recordTitle),
      ),
    );
  }

  Widget _protected(String message) => ListView(
        padding: const EdgeInsets.fromLTRB(14, 14, 14, 100),
        children: [
          RrnSectionHeader(eyebrow: 'RRN', title: title),
          const SizedBox(height: 12),
          Card(
            child: ListTile(
              leading: const Icon(Icons.shield_outlined, color: rrnCyan),
              title: const Text('Protected internal response'),
              subtitle: Text(message),
            ),
          ),
        ],
      );
}

'''
text = regex_once(
    text,
    r"class MatrixActionDataScreen extends StatelessWidget \{.*?\n\}\n\nclass MatrixActionButton extends StatefulWidget",
    safe_action_screen + "class MatrixActionButton extends StatefulWidget",
    'safe action result renderer',
)

# Website controllers normally return redirect destinations after a successful
# form post. Follow them natively. Preserve v0.10 multipart file handling.
submit_method = r'''  Future<void> _submit() async {
    final controller = str(widget.block['controller']);
    final method = str(widget.block['method'], 'POST').toUpperCase();
    if (controller.isEmpty) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('This translated form has no native controller.')));
      return;
    }

    final fields = <String, String>{};
    for (final entry in values.entries) {
      final value = entry.value;
      if (value is bool) {
        if (value) fields[entry.key] = 'on';
      } else if (value != null) {
        fields[entry.key] = '$value';
      }
    }
    for (final raw in listFrom(widget.block['fields'])) {
      if (raw is! Map) continue;
      final field = Map<String, dynamic>.from(raw);
      final name = str(field['name'] ?? field['id']);
      if (name.isEmpty || fields.containsKey(name)) continue;
      final type = str(field['type'], 'text').toLowerCase();
      if (type == 'hidden' && str(field['value']).isNotEmpty) fields[name] = str(field['value']);
      if (type == 'file' && boolish(field['required']) && (files[name] ?? '').isEmpty) {
        if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('${str(field['label'] ?? name)} requires a file.')));
        return;
      }
    }

    setState(() => busy = true);
    try {
      final body = await RrnScope.of(context).api.postForm(
        controller,
        fields: fields,
        files: files,
        method: method,
      );
      if (!mounted) return;

      if (body is Map) {
        final response = Map<String, dynamic>.from(body);
        final redirect = response['redirect'] is Map ? Map<String, dynamic>.from(response['redirect']) : const <String, dynamic>{};
        final result = response['result'] is Map ? Map<String, dynamic>.from(response['result']) : const <String, dynamic>{};
        final destination = str(
          response['navigate'] ?? result['navigate'] ??
              redirect['webUrl'] ?? redirect['web_url'] ?? redirect['path'],
        );
        if (destination.isNotEmpty) {
          await _matrixNavigate(context, destination, str(widget.block['submitLabel'], 'RRN'));
          return;
        }
      }

      final message = body is Map ? str(body['message'], 'Saved.') : 'Saved.';
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }
'''
text = regex_once(
    text,
    r"  Future<void> _submit\(\) async \{.*?\n  \}\n\}\n\nclass MatrixObjectScreen",
    submit_method + "}\n\nclass MatrixObjectScreen",
    'translated form redirect handling',
)

text = text.replace(
    "  final navigate = str(responseMap['navigate'] ?? result['navigate']);",
    "  final redirect = responseMap['redirect'] is Map ? Map<String, dynamic>.from(responseMap['redirect']) : const <String, dynamic>{};\n"
    "  final navigate = str(responseMap['navigate'] ?? result['navigate'] ?? redirect['webUrl'] ?? redirect['web_url'] ?? redirect['path']);",
    1,
)
write('site.dart', text)


# ---------------------------------------------------------------------------
# NATIVE RESOURCE SUMMARY RENDERER
# A direct resource is data, not an authorization/debug inspector. Records only
# navigate when the server supplied an explicit descriptor.
# ---------------------------------------------------------------------------
text = read('native_endpoint.dart')
old_click = r'''                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  if (action != null) {
                    runMatrixAction(context, action, fallbackTitle: title);
                  } else {
                    Navigator.push(context, MaterialPageRoute(builder: (_) => NativeRecordDetailsScreen(title: title, record: item)));
                  }
                },'''
new_click = r'''                trailing: action == null ? null : const Icon(Icons.chevron_right),
                onTap: action == null ? null : () => runMatrixAction(context, action, fallbackTitle: title),'''
text = text.replace(old_click, new_click)

safe_map = r'''  Widget _mapCard(Map<String, dynamic> map) {
    final page = str(map['page']);
    String pagePath = '';
    if (page.isNotEmpty) {
      final uri = Uri.tryParse(page.startsWith('http') ? page : '$rrnBase$page');
      pagePath = uri?.queryParameters['path'] ?? '';
    }
    final actions = listFrom(map['actions']);
    return ListView(
      padding: const EdgeInsets.fromLTRB(14, 16, 14, 100),
      children: [
        RrnSectionHeader(
          eyebrow: 'Native Matrix',
          title: widget.title,
          subtitle: 'This resource returned backend state that is not itself a user interface.',
        ),
        const SizedBox(height: 12),
        const Card(
          child: ListTile(
            leading: Icon(Icons.shield_outlined, color: rrnCyan),
            title: Text('Internal fields hidden'),
            subtitle: Text('RRN Mobile does not display raw API keys, IDs, metadata blobs, controller paths, or authorization state.'),
          ),
        ),
        if (pagePath.isNotEmpty)
          FilledButton.icon(
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => MatrixPageScreen(path: pagePath, title: widget.title)),
            ),
            icon: const Icon(Icons.open_in_new),
            label: const Text('Open controls'),
          ),
        if (actions.isNotEmpty) ...[
          const SizedBox(height: 10),
          Wrap(spacing: 8, runSpacing: 8, children: actions.map((action) => MatrixActionButton(action: action)).toList()),
        ],
      ],
    );
  }

'''
text = regex_once(
    text,
    r"  Widget _mapCard\(Map<String, dynamic> map\) => ListView\(.*?\n      \);\n\n  String _absolute",
    safe_map + "  String _absolute",
    'safe direct resource map renderer',
)

safe_details = r'''class NativeRecordDetailsScreen extends StatelessWidget {
  final String title;
  final Map<String, dynamic> record;
  const NativeRecordDetailsScreen({super.key, required this.title, required this.record});

  @override
  Widget build(BuildContext context) {
    final action = matrixActionFrom(record);
    final summary = str(record['summary'] ?? record['description']);
    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
        children: [
          RrnSectionHeader(eyebrow: 'RRN', title: title, subtitle: summary.isEmpty ? null : summary),
          const SizedBox(height: 12),
          if (action == null)
            const Card(
              child: ListTile(
                leading: Icon(Icons.shield_outlined, color: rrnCyan),
                title: Text('No user-facing controls'),
                subtitle: Text('Internal record fields are intentionally hidden.'),
              ),
            )
          else
            FilledButton.icon(
              onPressed: () => runMatrixAction(context, action, fallbackTitle: title),
              icon: const Icon(Icons.arrow_forward),
              label: const Text('Open'),
            ),
        ],
      ),
    );
  }
}

'''
text = regex_once(
    text,
    r"class NativeRecordDetailsScreen extends StatelessWidget \{.*?\n\}\n\n/// Native alpha surface",
    safe_details + "/// Native alpha surface",
    'safe record detail fallback',
)
write('native_endpoint.dart', text)

print('RRN Mobile v0.12 fixed interface-contract patch applied.')
