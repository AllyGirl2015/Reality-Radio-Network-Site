import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

import 'core.dart';
import 'external_links.dart';
import 'matrix_transport.dart';

String matrixPagePath(String raw) {
  final value = raw.trim();
  if (value.isEmpty) return '/';
  final uri = Uri.tryParse(value);
  if (uri != null && uri.scheme == 'rrn') {
    final parts = <String>[
      if (uri.host.isNotEmpty) uri.host,
      ...uri.pathSegments.where((e) => e.isNotEmpty),
    ];
    return '/${parts.join('/')}';
  }
  if (uri != null && (uri.scheme == 'http' || uri.scheme == 'https')) {
    return uri.path.isEmpty ? '/' : uri.path;
  }
  return value.split('?').first.split('#').first.startsWith('/')
      ? value.split('?').first.split('#').first
      : '/${value.split('?').first.split('#').first}';
}

bool _sameRrnHost(Uri uri) => uri.host.toLowerCase().contains('realityradio');

Future<void> matrixNavigate(BuildContext context, String raw, String title) async {
  if (raw.trim().isEmpty || !context.mounted) return;
  final uri = Uri.tryParse(raw.trim());
  if (uri != null && (uri.scheme == 'http' || uri.scheme == 'https') && !_sameRrnHost(uri)) {
    await openExternalUrl(context, raw.trim());
    return;
  }
  final path = matrixPagePath(raw);
  if (!context.mounted) return;
  await Navigator.push(
    context,
    MaterialPageRoute(builder: (_) => MatrixPageScreen(path: path, title: title)),
  );
}

dynamic matrixActionFrom(Map<String, dynamic> item) {
  if (item['action'] != null) return item['action'];
  final actions = listFrom(item['actions']);
  if (actions.isNotEmpty) return actions.first;
  if (item['link'] is Map) return item['link'];

  final endpoint = str(item['endpoint']);
  final controller = str(item['controller']);
  final path = str(
    item['path'] ??
        item['href'] ??
        item['route'] ??
        item['deepLink'] ??
        item['deep_link'] ??
        item['webUrl'] ??
        item['web_url'] ??
        item['url'] ??
        item['detailPath'] ??
        item['detail_path'],
  );
  final actionId = str(item['actionId'] ?? item['action_id']);
  if (endpoint.isEmpty && controller.isEmpty && path.isEmpty && actionId.isEmpty) return null;
  return <String, dynamic>{
    if (endpoint.isNotEmpty) 'endpoint': endpoint,
    if (controller.isNotEmpty) 'controller': controller,
    if (path.isNotEmpty) 'path': path,
    if (actionId.isNotEmpty) 'id': actionId,
    if (item['method'] != null) 'method': item['method'],
    if (item['payload'] != null) 'payload': item['payload'],
    if (item['confirm'] != null) 'confirm': item['confirm'],
    if (item['idempotencyKey'] != null) 'idempotencyKey': item['idempotencyKey'],
    'label': str(
      item['actionLabel'] ?? item['action_label'] ?? item['label'] ?? item['title'] ?? item['name'],
      'Open',
    ),
  };
}

Future<bool> _confirmMatrixAction(BuildContext context, dynamic confirm) async {
  if (confirm == null || confirm == false || str(confirm).trim().isEmpty) return true;
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

Future<dynamic> runMatrixAction(
  BuildContext context,
  dynamic rawAction, {
  String fallbackTitle = 'RRN',
}) async {
  final action = rawAction is Map
      ? Map<String, dynamic>.from(rawAction)
      : <String, dynamic>{'id': str(rawAction), 'label': str(rawAction)};
  final title = str(action['label'] ?? action['title'], fallbackTitle);
  if (!await _confirmMatrixAction(context, action['confirm'])) return null;

  final endpoint = str(action['endpoint']);
  final controller = str(action['controller']);
  final actionId = str(action['id'] ?? action['actionId'] ?? action['action_id']);
  final path = str(
    action['path'] ??
        action['href'] ??
        action['route'] ??
        action['deepLink'] ??
        action['deep_link'] ??
        action['webUrl'] ??
        action['web_url'] ??
        action['url'],
  );

  if (endpoint.isEmpty && controller.isEmpty && actionId.isEmpty && path.isNotEmpty) {
    await matrixNavigate(context, path, title);
    return null;
  }

  final api = RrnScope.of(context).api;
  final method = str(action['method'], controller.isNotEmpty || actionId.isNotEmpty ? 'POST' : 'GET').toUpperCase();
  final payload = action['payload'] ?? const <String, dynamic>{};
  dynamic body;

  if (controller.isNotEmpty) {
    final requestPath = matrixControllerPath(controller);
    body = await matrixJsonRequest(api, requestPath, method: method, body: payload);
  } else if (endpoint.isNotEmpty) {
    body = await matrixJsonRequest(api, endpoint, method: method, body: payload);
  } else if (actionId.isNotEmpty) {
    body = await api.post('/actions', body: {
      'actionId': actionId,
      'payload': payload,
      if (action['idempotencyKey'] != null) 'idempotencyKey': action['idempotencyKey'],
    });
  } else {
    throw StateError('This item does not expose an executable RRN action.');
  }

  if (!context.mounted) return body;
  if (body is Map) {
    final response = Map<String, dynamic>.from(body);
    final result = response['result'] is Map ? Map<String, dynamic>.from(response['result']) : const <String, dynamic>{};
    final redirect = response['redirect'] is Map ? Map<String, dynamic>.from(response['redirect']) : const <String, dynamic>{};
    final destination = str(
      response['navigate'] ??
          response['deepLink'] ??
          response['deep_link'] ??
          result['navigate'] ??
          result['deepLink'] ??
          redirect['deepLink'] ??
          redirect['webUrl'] ??
          redirect['web_url'] ??
          redirect['path'],
    );
    if (destination.isNotEmpty) {
      await matrixNavigate(context, destination, title);
      return body;
    }
    final message = str(response['message'] ?? result['message']);
    if (message.isNotEmpty && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
    }
    final userFacing = response['data'] ?? result['data'];
    if (method == 'GET' && userFacing != null && context.mounted) {
      await Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => MatrixActionDataScreen(title: title, data: userFacing)),
      );
    }
  } else if (method == 'GET' && body != null && context.mounted) {
    await Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => MatrixActionDataScreen(title: title, data: body)),
    );
  }
  return body;
}

class MatrixPageScreen extends StatefulWidget {
  final String path;
  final String title;

  const MatrixPageScreen({super.key, required this.path, required this.title});

  @override
  State<MatrixPageScreen> createState() => _MatrixPageScreenState();
}

class _MatrixPageScreenState extends State<MatrixPageScreen> {
  Map<String, dynamic>? page;
  bool busy = true;
  String? error;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (busy && page == null) _load();
  }

  Future<void> _load() async {
    setState(() {
      busy = true;
      error = null;
    });
    try {
      final path = matrixPagePath(widget.path);
      final body = await RrnScope.of(context).api.get('/page', query: {'path': path});
      if (body is! Map) throw ApiException(500, 'The Translation Matrix returned an invalid page.');
      page = Map<String, dynamic>.from(body);
    } catch (e) {
      error = '$e';
      page = null;
    } finally {
      busy = false;
      if (mounted) setState(() {});
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(
          title: Text(widget.title),
          actions: [IconButton(onPressed: busy ? null : _load, icon: const Icon(Icons.refresh))],
        ),
        body: busy
            ? const Center(child: CircularProgressIndicator())
            : page != null
                ? MatrixPageRenderer(page: page!)
                : _errorView(),
      );

  Widget _errorView() => ListView(
        padding: const EdgeInsets.all(18),
        children: [
          RrnSectionHeader(
            eyebrow: 'App Translation Matrix',
            title: '${widget.title} could not be loaded.',
            subtitle: 'RRN Mobile requested the native page contract for ${matrixPagePath(widget.path)}. It did not substitute raw backend data.',
          ),
          const SizedBox(height: 14),
          if (error != null) Text(error!, style: const TextStyle(color: Colors.white60)),
          const SizedBox(height: 14),
          FilledButton.tonalIcon(onPressed: _load, icon: const Icon(Icons.refresh), label: const Text('Retry')),
          const SizedBox(height: 8),
          OutlinedButton.icon(
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => WebFallbackScreen(path: matrixPagePath(widget.path), title: widget.title)),
            ),
            icon: const Icon(Icons.open_in_browser),
            label: const Text('Open website intentionally'),
          ),
        ],
      );
}

class MatrixPageRenderer extends StatelessWidget {
  final Map<String, dynamic> page;
  const MatrixPageRenderer({super.key, required this.page});

  @override
  Widget build(BuildContext context) {
    final title = str(page['title'] ?? page['name']);
    final summary = str(page['summary'] ?? page['description']);
    final blocks = listFrom(page['blocks']);
    final forms = listFrom(page['forms']);
    final links = listFrom(page['links']);
    final actions = listFrom(page['actions']);
    final sections = listFrom(page['sections']);
    return ListView(
      padding: const EdgeInsets.fromLTRB(14, 14, 14, 100),
      children: [
        if (title.isNotEmpty)
          RrnSectionHeader(
            eyebrow: str(page['eyebrow'] ?? 'RRN'),
            title: title,
            subtitle: summary.isEmpty ? null : summary,
          ),
        if (title.isNotEmpty) const SizedBox(height: 14),
        ...blocks.map((b) => MatrixBlockRenderer(block: b)),
        ...sections.map((b) => MatrixBlockRenderer(block: b)),
        ...forms.map((raw) => MatrixFormRenderer(block: raw is Map ? Map<String, dynamic>.from(raw) : <String, dynamic>{})),
        ...links.map((link) => MatrixTranslatedLinkButton(link: link)),
        if (actions.isNotEmpty) ...[
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: actions.map((a) => MatrixActionButton(action: a)).toList(),
          ),
        ],
        if (blocks.isEmpty && sections.isEmpty && forms.isEmpty && links.isEmpty && actions.isEmpty)
          const Card(
            child: ListTile(
              leading: Icon(Icons.inbox_outlined, color: rrnCyan),
              title: Text('Nothing to display'),
              subtitle: Text('The page contract returned no user-facing blocks, forms, links or actions.'),
            ),
          ),
      ],
    );
  }
}

class MatrixBlockRenderer extends StatelessWidget {
  final dynamic block;
  const MatrixBlockRenderer({super.key, required this.block});

  @override
  Widget build(BuildContext context) {
    final m = block is Map ? Map<String, dynamic>.from(block) : <String, dynamic>{'type': 'text', 'body': '$block'};
    final type = str(m['type'], 'text').toLowerCase();
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: switch (type) {
        'heading' => _heading(m),
        'text' || 'rich_text' => _text(m),
        'list_item' => _listItem(context, m),
        'notice' => _notice(m),
        'image' || 'media' => _image(m),
        'stat' => _stat(m),
        'card' => _card(context, m),
        'list' || 'card_list' => _list(context, m),
        'table' => _table(m),
        'form' => MatrixFormRenderer(block: m),
        'audio' || 'audio_item' => _audio(context, m),
        'station' => _station(context, m),
        'product' => _product(context, m),
        'event' => _event(context, m),
        'profile' || 'person' => _profile(context, m),
        'action_group' || 'buttons' => _actionGroup(m),
        _ => _unsupported(m),
      },
    );
  }

  Widget _heading(Map<String, dynamic> m) => Text(
        str(m['text'] ?? m['title']),
        style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900),
      );

  Widget _text(Map<String, dynamic> m) => SelectableText(
        str(m['body'] ?? m['text'] ?? m['content']),
        style: const TextStyle(height: 1.45),
      );

  Widget _listItem(BuildContext context, Map<String, dynamic> m) {
    final action = matrixActionFrom(m);
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: const Text('•', style: TextStyle(color: rrnCyan, fontSize: 20, fontWeight: FontWeight.w900)),
      title: Text(str(m['text'] ?? m['title'] ?? m['label'])),
      trailing: action == null ? null : const Icon(Icons.chevron_right),
      onTap: action == null ? null : () => runMatrixAction(context, action, fallbackTitle: str(m['title'] ?? m['label'], 'RRN')),
    );
  }

  Widget _notice(Map<String, dynamic> m) => Card(
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Icon(Icons.info_outline, color: rrnCyan),
            const SizedBox(width: 10),
            Expanded(child: Text(str(m['body'] ?? m['text'] ?? m['message']))),
          ]),
        ),
      );

  Widget _image(Map<String, dynamic> m) {
    final url = _absolute(str(m['url'] ?? m['src'] ?? m['imageUrl'] ?? m['image_url']));
    if (url.isEmpty) return const SizedBox.shrink();
    return ClipRRect(
      borderRadius: BorderRadius.circular(18),
      child: Image.network(url, fit: BoxFit.cover, errorBuilder: (_, __, ___) => const SizedBox.shrink()),
    );
  }

  Widget _stat(Map<String, dynamic> m) => Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(str(m['label'] ?? m['title']), style: const TextStyle(color: Colors.white60, fontSize: 11, fontWeight: FontWeight.w800)),
            const SizedBox(height: 4),
            Text(str(m['value']), style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900)),
          ]),
        ),
      );

  Widget _card(BuildContext context, Map<String, dynamic> m) {
    final action = matrixActionFrom(m);
    return Card(
      child: ListTile(
        title: Text(str(m['title'] ?? m['name'], 'RRN'), style: const TextStyle(fontWeight: FontWeight.w900)),
        subtitle: str(m['summary'] ?? m['description'] ?? m['body']).isEmpty
            ? null
            : Text(str(m['summary'] ?? m['description'] ?? m['body']), maxLines: 4, overflow: TextOverflow.ellipsis),
        trailing: action == null ? null : const Icon(Icons.chevron_right),
        onTap: action == null ? null : () => runMatrixAction(context, action, fallbackTitle: str(m['title'] ?? m['name'], 'RRN')),
      ),
    );
  }

  Widget _list(BuildContext context, Map<String, dynamic> m) {
    final items = listFrom(m['items']);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (str(m['title']).isNotEmpty)
          Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Text(str(m['title']), style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
          ),
        if (items.isEmpty) const Card(child: ListTile(title: Text('Nothing here yet.'))),
        ...items.map((item) {
          final x = item is Map ? Map<String, dynamic>.from(item) : <String, dynamic>{'title': '$item'};
          final action = matrixActionFrom(x);
          final subtitle = [
            str(x['subtitle'] ?? x['summary'] ?? x['description'] ?? x['value']),
            str(x['status']),
            str(x['designation']),
          ].where((e) => e.isNotEmpty).join(' · ');
          return Card(
            child: ListTile(
              title: Text(str(x['title'] ?? x['name'] ?? x['label'], 'RRN'), style: const TextStyle(fontWeight: FontWeight.w700)),
              subtitle: subtitle.isEmpty ? null : Text(subtitle, maxLines: 3, overflow: TextOverflow.ellipsis),
              trailing: action == null ? null : const Icon(Icons.chevron_right),
              onTap: action == null ? null : () => runMatrixAction(context, action, fallbackTitle: str(x['title'] ?? x['name'] ?? x['label'], 'RRN')),
            ),
          );
        }),
      ],
    );
  }

  Widget _table(Map<String, dynamic> m) {
    final columns = listFrom(m['columns']).map((raw) => raw is Map ? str(raw['label'] ?? raw['key'] ?? raw['name']) : str(raw)).toList();
    final rows = listFrom(m['rows']);
    if (columns.isEmpty) return const SizedBox.shrink();
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: DataTable(
        columns: columns.map((c) => DataColumn(label: Text(c, style: const TextStyle(fontWeight: FontWeight.w900)))).toList(),
        rows: rows.map((raw) {
          final cells = raw is List ? raw : raw is Map ? columns.map((c) => raw[c]).toList() : [raw];
          return DataRow(cells: List.generate(columns.length, (i) => DataCell(Text(i < cells.length ? str(cells[i]) : ''))));
        }).toList(),
      ),
    );
  }

  Widget _audio(BuildContext context, Map<String, dynamic> m) => _entityTile(context, m, Icons.play_circle_outline, rrnCyan, str(m['subtitle'] ?? m['artist'] ?? m['show']));
  Widget _station(BuildContext context, Map<String, dynamic> m) => _entityTile(context, m, Icons.radio, rrnCyan, str(m['designation'] ?? m['frequency']));
  Widget _product(BuildContext context, Map<String, dynamic> m) => _entityTile(context, m, Icons.shopping_bag_outlined, rrnPurple, str(m['price'] ?? m['displayPrice']));
  Widget _event(BuildContext context, Map<String, dynamic> m) => _entityTile(context, m, Icons.event, rrnPink, str(m['date'] ?? m['startsAt'] ?? m['starts_at']));
  Widget _profile(BuildContext context, Map<String, dynamic> m) => _entityTile(context, m, Icons.person, rrnPurple, str(m['tagline'] ?? m['role']));

  Widget _entityTile(BuildContext context, Map<String, dynamic> m, IconData icon, Color color, String subtitle) {
    final action = matrixActionFrom(m);
    return Card(
      child: ListTile(
        leading: CircleAvatar(backgroundColor: const Color(0xFF10202A), child: Icon(icon, color: color)),
        title: Text(str(m['title'] ?? m['name'] ?? m['displayName'], 'RRN'), style: const TextStyle(fontWeight: FontWeight.w800)),
        subtitle: subtitle.isEmpty ? null : Text(subtitle),
        trailing: action == null ? null : const Icon(Icons.chevron_right),
        onTap: action == null ? null : () => runMatrixAction(context, action, fallbackTitle: str(m['title'] ?? m['name'], 'RRN')),
      ),
    );
  }

  Widget _actionGroup(Map<String, dynamic> m) {
    final actions = listFrom(m['actions'] ?? m['items']);
    return Wrap(spacing: 8, runSpacing: 8, children: actions.map((a) => MatrixActionButton(action: a)).toList());
  }

  Widget _unsupported(Map<String, dynamic> m) => Card(
        child: ListTile(
          leading: const Icon(Icons.extension_off_outlined, color: Colors.white54),
          title: Text(str(m['title'] ?? m['name'], 'Unsupported native block')),
          subtitle: Text('RRN Mobile does not expose unrecognized backend fields. Block type: ${str(m['type'], 'unknown')}'),
        ),
      );

  String _absolute(String value) {
    if (value.isEmpty) return '';
    if (value.startsWith('http://') || value.startsWith('https://')) return value;
    return '$rrnBase${value.startsWith('/') ? value : '/$value'}';
  }
}

class MatrixTranslatedLinkButton extends StatelessWidget {
  final dynamic link;
  const MatrixTranslatedLinkButton({super.key, required this.link});

  @override
  Widget build(BuildContext context) {
    final m = link is Map ? Map<String, dynamic>.from(link) : <String, dynamic>{'path': str(link), 'label': str(link)};
    final label = str(m['label'] ?? m['title'] ?? m['name'], 'Open');
    final action = matrixActionFrom(m);
    return Card(
      child: ListTile(
        leading: const Icon(Icons.link, color: rrnCyan),
        title: Text(label, style: const TextStyle(fontWeight: FontWeight.w800)),
        subtitle: str(m['summary'] ?? m['description']).isEmpty ? null : Text(str(m['summary'] ?? m['description'])),
        trailing: action == null ? null : const Icon(Icons.chevron_right),
        onTap: action == null ? null : () => runMatrixAction(context, action, fallbackTitle: label),
      ),
    );
  }
}

class MatrixActionButton extends StatefulWidget {
  final dynamic action;
  final bool compact;
  const MatrixActionButton({super.key, required this.action, this.compact = false});

  @override
  State<MatrixActionButton> createState() => _MatrixActionButtonState();
}

class _MatrixActionButtonState extends State<MatrixActionButton> {
  bool busy = false;

  @override
  Widget build(BuildContext context) {
    final a = widget.action is Map ? Map<String, dynamic>.from(widget.action) : <String, dynamic>{'id': str(widget.action), 'label': str(widget.action)};
    final label = str(a['label'] ?? a['title'] ?? a['id'], 'Open');
    return widget.compact
        ? IconButton(
            onPressed: busy ? null : () => _run(a),
            icon: busy
                ? const SizedBox(width: 17, height: 17, child: CircularProgressIndicator(strokeWidth: 2))
                : const Icon(Icons.chevron_right),
            tooltip: label,
          )
        : FilledButton.tonal(
            onPressed: busy ? null : () => _run(a),
            child: busy
                ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                : Text(label),
          );
  }

  Future<void> _run(Map<String, dynamic> action) async {
    setState(() => busy = true);
    try {
      await runMatrixAction(context, action, fallbackTitle: str(action['label'] ?? action['title'], 'RRN'));
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }
}

class MatrixFormRenderer extends StatefulWidget {
  final Map<String, dynamic> block;
  const MatrixFormRenderer({super.key, required this.block});

  @override
  State<MatrixFormRenderer> createState() => _MatrixFormRendererState();
}

class _MatrixFormRendererState extends State<MatrixFormRenderer> {
  final values = <String, dynamic>{};
  final files = <String, String>{};
  bool busy = false;

  @override
  void initState() {
    super.initState();
    for (final raw in listFrom(widget.block['fields'])) {
      if (raw is! Map) continue;
      final field = Map<String, dynamic>.from(raw);
      final name = str(field['name'] ?? field['id']);
      if (name.isEmpty) continue;
      final type = str(field['type'], 'text').toLowerCase();
      if (type == 'checkbox' || type == 'boolean') {
        values[name] = boolish(field['value'] ?? field['checked'] ?? field['defaultValue']);
      } else if (field['value'] != null || field['defaultValue'] != null) {
        values[name] = field['value'] ?? field['defaultValue'];
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final fields = listFrom(widget.block['fields']);
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (str(widget.block['title']).isNotEmpty)
              Text(str(widget.block['title']), style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
            if (str(widget.block['description'] ?? widget.block['summary']).isNotEmpty) ...[
              const SizedBox(height: 5),
              Text(str(widget.block['description'] ?? widget.block['summary']), style: const TextStyle(color: Colors.white60)),
            ],
            const SizedBox(height: 10),
            ...fields.map((raw) => _field(raw)),
            FilledButton(
              onPressed: busy ? null : _submit,
              child: busy
                  ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                  : Text(str(widget.block['submitLabel'] ?? widget.block['submit_label'], 'Save')),
            ),
          ],
        ),
      ),
    );
  }

  Widget _field(dynamic raw) {
    final f = raw is Map ? Map<String, dynamic>.from(raw) : <String, dynamic>{};
    final name = str(f['name'] ?? f['id']);
    final type = str(f['type'], 'text').toLowerCase();
    final label = str(f['label'] ?? name);
    final required = boolish(f['required']);
    if (name.isEmpty) return const SizedBox.shrink();
    if (type == 'hidden') return const SizedBox.shrink();
    if (type == 'checkbox' || type == 'boolean') {
      return CheckboxListTile(
        contentPadding: EdgeInsets.zero,
        title: Text(label),
        subtitle: str(f['help'] ?? f['description']).isEmpty ? null : Text(str(f['help'] ?? f['description'])),
        value: boolish(values[name]),
        onChanged: busy ? null : (v) => setState(() => values[name] = v ?? false),
      );
    }
    if (type == 'file') {
      final selected = files[name] ?? '';
      return Padding(
        padding: const EdgeInsets.only(bottom: 10),
        child: ListTile(
          contentPadding: EdgeInsets.zero,
          leading: const Icon(Icons.upload_file, color: rrnPurple),
          title: Text(required ? '$label *' : label),
          subtitle: Text(selected.isEmpty ? str(f['help'], 'Choose a file from this device.') : selected.split('/').last),
          trailing: OutlinedButton(onPressed: busy ? null : () => _pickFile(name), child: Text(selected.isEmpty ? 'Choose' : 'Change')),
        ),
      );
    }
    final options = listFrom(f['options']);
    if ((type == 'select' || type == 'dropdown') && options.isNotEmpty) {
      final initial = str(values[name]).isEmpty ? null : str(values[name]);
      return Padding(
        padding: const EdgeInsets.only(bottom: 10),
        child: DropdownButtonFormField<String>(
          initialValue: initial,
          decoration: InputDecoration(labelText: required ? '$label *' : label, helperText: str(f['help']).isEmpty ? null : str(f['help'])),
          items: options.map((rawOption) {
            final option = rawOption is Map ? Map<String, dynamic>.from(rawOption) : <String, dynamic>{'value': str(rawOption), 'label': str(rawOption)};
            final value = str(option['value'] ?? option['id'] ?? option['key'] ?? option['label']);
            return DropdownMenuItem<String>(value: value, child: Text(str(option['label'] ?? option['name'] ?? value)));
          }).toList(),
          onChanged: busy ? null : (v) => setState(() => values[name] = v),
        ),
      );
    }
    final multiline = type == 'textarea' || type == 'multiline';
    final keyboard = type == 'number'
        ? TextInputType.number
        : type == 'email'
            ? TextInputType.emailAddress
            : type == 'url'
                ? TextInputType.url
                : TextInputType.text;
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: TextFormField(
        initialValue: str(values[name]),
        obscureText: type == 'password',
        keyboardType: keyboard,
        minLines: multiline ? 3 : 1,
        maxLines: multiline ? 8 : 1,
        decoration: InputDecoration(
          labelText: required ? '$label *' : label,
          helperText: str(f['help'] ?? f['description']).isEmpty ? null : str(f['help'] ?? f['description']),
        ),
        onChanged: (v) => values[name] = v,
      ),
    );
  }

  Future<void> _pickFile(String name) async {
    try {
      final result = await FilePicker.platform.pickFiles(allowMultiple: false, withData: false, type: FileType.any);
      if (result == null || result.files.isEmpty) return;
      final path = result.files.single.path;
      if (path == null || path.isEmpty) throw StateError('Android did not provide a readable path for that file.');
      if (mounted) setState(() => files[name] = path);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Could not choose file: $e')));
    }
  }

  Future<void> _submit() async {
    final controller = str(widget.block['controller'] ?? widget.block['endpoint']);
    final method = str(widget.block['method'], 'POST').toUpperCase();
    if (controller.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('This form did not provide an executable Matrix controller.')));
      return;
    }

    final fields = <String, String>{};
    for (final raw in listFrom(widget.block['fields'])) {
      if (raw is! Map) continue;
      final f = Map<String, dynamic>.from(raw);
      final name = str(f['name'] ?? f['id']);
      if (name.isEmpty) continue;
      final type = str(f['type'], 'text').toLowerCase();
      final required = boolish(f['required']);
      if (type == 'file') {
        if (required && (files[name] ?? '').isEmpty) {
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('${str(f['label'] ?? name)} requires a file.')));
          return;
        }
        continue;
      }
      final value = values[name] ?? f['value'] ?? f['defaultValue'];
      if (required && type != 'checkbox' && type != 'boolean' && str(value).trim().isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('${str(f['label'] ?? name)} is required.')));
        return;
      }
      if (type == 'checkbox' || type == 'boolean') {
        if (boolish(value)) fields[name] = 'on';
      } else if (value != null) {
        fields[name] = str(value);
      }
    }

    setState(() => busy = true);
    try {
      final body = await matrixMultipartRequest(
        RrnScope.of(context).api,
        controller,
        method: method,
        fields: fields,
        files: files,
      );
      if (!mounted) return;
      if (body is Map) {
        final response = Map<String, dynamic>.from(body);
        final result = response['result'] is Map ? Map<String, dynamic>.from(response['result']) : const <String, dynamic>{};
        final redirect = response['redirect'] is Map ? Map<String, dynamic>.from(response['redirect']) : const <String, dynamic>{};
        final destination = str(
          response['navigate'] ??
              response['deepLink'] ??
              result['navigate'] ??
              redirect['deepLink'] ??
              redirect['webUrl'] ??
              redirect['web_url'] ??
              redirect['path'],
        );
        if (destination.isNotEmpty) {
          await matrixNavigate(context, destination, str(widget.block['title'], 'RRN'));
          return;
        }
        final message = str(response['message'] ?? result['message'], 'Saved.');
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
      } else {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Saved.')));
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }
}

class MatrixActionDataScreen extends StatelessWidget {
  final String title;
  final dynamic data;
  const MatrixActionDataScreen({super.key, required this.title, required this.data});

  @override
  Widget build(BuildContext context) => Scaffold(appBar: AppBar(title: Text(title)), body: _body(context));

  Widget _body(BuildContext context) {
    if (data is Map) {
      final map = Map<String, dynamic>.from(data as Map);
      if (listFrom(map['blocks']).isNotEmpty || listFrom(map['forms']).isNotEmpty || listFrom(map['links']).isNotEmpty || listFrom(map['actions']).isNotEmpty) {
        return MatrixPageRenderer(page: {'title': title, ...map});
      }
      final sections = <MapEntry<String, List<dynamic>>>[];
      for (final key in const ['items', 'results', 'entries', 'products', 'stations', 'presenters', 'programs', 'artists', 'labels', 'services', 'applications', 'orders']) {
        if (map[key] is List) sections.add(MapEntry(key, List<dynamic>.from(map[key] as List)));
      }
      if (sections.isNotEmpty) return _sections(context, sections);
      return _protected('The server returned internal state without a user-facing presentation contract.');
    }
    if (data is List) return _sections(context, [MapEntry('items', List<dynamic>.from(data as List))]);
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
                child: Text(section.key.replaceAll('_', ' ').toUpperCase(), style: const TextStyle(color: rrnCyan, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1.2)),
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
    final recordTitle = str(item['title'] ?? item['name'] ?? item['displayName'] ?? item['display_name'] ?? item['label'], 'RRN');
    final subtitle = [str(item['subtitle'] ?? item['summary'] ?? item['description']), str(item['status']), str(item['designation'])].where((v) => v.isNotEmpty).join(' · ');
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
              title: const Text('Internal fields hidden'),
              subtitle: Text(message),
            ),
          ),
        ],
      );
}

class MatrixObjectScreen extends StatelessWidget {
  final String title;
  final Map<String, dynamic> data;
  const MatrixObjectScreen({super.key, required this.title, required this.data});

  @override
  Widget build(BuildContext context) {
    final summary = str(data['summary'] ?? data['description']);
    final image = str(data['artwork'] ?? data['artworkUrl'] ?? data['coverUrl'] ?? data['imageUrl']);
    final details = <String>[
      str(data['artist'] ?? data['artistName']),
      str(data['designation']),
      str(data['status']),
      str(data['price'] ?? data['displayPrice']),
    ].where((v) => v.isNotEmpty).toList();
    final action = matrixActionFrom(data);
    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
        children: [
          if (image.isNotEmpty)
            ClipRRect(
              borderRadius: BorderRadius.circular(18),
              child: Image.network(image.startsWith('http') ? image : '$rrnBase$image', fit: BoxFit.cover, errorBuilder: (_, __, ___) => const SizedBox.shrink()),
            ),
          const SizedBox(height: 12),
          RrnSectionHeader(eyebrow: 'RRN', title: title, subtitle: summary.isEmpty ? null : summary),
          if (details.isNotEmpty) ...[
            const SizedBox(height: 12),
            Card(child: Padding(padding: const EdgeInsets.all(14), child: Text(details.join(' · ')))),
          ],
          if (action != null) ...[
            const SizedBox(height: 10),
            MatrixActionButton(action: action),
          ],
        ],
      ),
    );
  }
}

class WebFallbackScreen extends StatefulWidget {
  final String path;
  final String title;
  const WebFallbackScreen({super.key, required this.path, required this.title});

  @override
  State<WebFallbackScreen> createState() => _WebFallbackScreenState();
}

class _WebFallbackScreenState extends State<WebFallbackScreen> {
  late final WebViewController controller;

  @override
  void initState() {
    super.initState();
    controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(rrnBg)
      ..loadRequest(Uri.parse('$rrnBase${matrixPagePath(widget.path)}'));
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: Text(widget.title)),
        body: WebViewWidget(controller: controller),
      );
}
