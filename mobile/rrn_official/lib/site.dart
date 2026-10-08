import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

import 'core.dart';

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
      final body = await RrnScope.of(context).api.get('/page', query: {'path': widget.path});
      if (body is! Map) throw ApiException(500, 'Page digest was empty.');
      page = Map<String, dynamic>.from(body);
    } catch (e) {
      error = '$e';
    } finally {
      busy = false;
      if (mounted) setState(() {});
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(
          title: Text(widget.title),
          actions: [
            IconButton(onPressed: _load, icon: const Icon(Icons.refresh)),
            IconButton(
              onPressed: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => WebFallbackScreen(path: widget.path, title: widget.title)),
              ),
              icon: const Icon(Icons.language),
              tooltip: 'Website fallback',
            ),
          ],
        ),
        body: busy
            ? const Center(child: CircularProgressIndicator())
            : page != null
                ? MatrixPageRenderer(page: page!)
                : _pending(),
      );

  Widget _pending() => ListView(
        padding: const EdgeInsets.all(18),
        children: [
          const RrnSectionHeader(
            eyebrow: 'Translation Matrix',
            title: 'Native renderer ready; backend bridge pending.',
            subtitle: 'This app already expects the website to translate this page into safe native blocks and actions.',
          ),
          const SizedBox(height: 14),
          Text('Expected: GET /api/app/v1/page?path=${widget.path}', style: const TextStyle(fontFamily: 'monospace', color: rrnCyan)),
          if (error != null) ...[
            const SizedBox(height: 10),
            Text(error!, style: const TextStyle(color: Colors.white54, fontSize: 12)),
          ],
          const SizedBox(height: 18),
          FilledButton.icon(
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => WebFallbackScreen(path: widget.path, title: widget.title)),
            ),
            icon: const Icon(Icons.open_in_browser),
            label: const Text('Use website fallback for now'),
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
    final actions = listFrom(page['actions']);
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
        if (actions.isNotEmpty) ...[
          const SizedBox(height: 14),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: actions.map((a) => MatrixActionButton(action: a)).toList(),
          ),
        ],
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
        'notice' => _notice(m),
        'image' || 'media' => _image(m),
        'stat' => _stat(m),
        'card' => _card(m),
        'list' || 'card_list' => _list(m),
        'table' => _table(m),
        'form' => MatrixFormRenderer(block: m),
        'audio' || 'audio_item' => _audio(m),
        'station' => _station(m),
        'product' => _product(m),
        'event' => _event(m),
        'profile' || 'person' => _profile(m),
        _ => _generic(m),
      },
    );
  }

  Widget _heading(Map<String, dynamic> m) => Text(str(m['text'] ?? m['title']), style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900));

  Widget _text(Map<String, dynamic> m) => SelectableText(str(m['body'] ?? m['text'] ?? m['content']), style: const TextStyle(height: 1.45));

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
    final url = str(m['url'] ?? m['src'] ?? m['imageUrl'] ?? m['image_url']);
    if (!url.startsWith('http')) return _generic(m);
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

  Widget _card(Map<String, dynamic> m) => Card(
        child: ListTile(
          title: Text(str(m['title'] ?? m['name'], 'RRN'), style: const TextStyle(fontWeight: FontWeight.w900)),
          subtitle: str(m['summary'] ?? m['description'] ?? m['body']).isEmpty ? null : Text(str(m['summary'] ?? m['description'] ?? m['body'])),
          trailing: m['action'] != null ? MatrixActionButton(action: m['action'], compact: true) : null,
        ),
      );

  Widget _list(Map<String, dynamic> m) {
    final items = listFrom(m['items']);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (str(m['title']).isNotEmpty) Padding(padding: const EdgeInsets.only(bottom: 8), child: Text(str(m['title']), style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900))),
        ...items.map((item) {
          final x = item is Map ? Map<String, dynamic>.from(item) : <String, dynamic>{'title': '$item'};
          return Card(
            child: ListTile(
              title: Text(str(x['title'] ?? x['name'] ?? x['label']), style: const TextStyle(fontWeight: FontWeight.w700)),
              subtitle: str(x['summary'] ?? x['description'] ?? x['value']).isEmpty ? null : Text(str(x['summary'] ?? x['description'] ?? x['value'])),
              trailing: x['action'] != null ? MatrixActionButton(action: x['action'], compact: true) : null,
            ),
          );
        }),
      ],
    );
  }

  Widget _table(Map<String, dynamic> m) {
    final columns = listFrom(m['columns']).map(str).toList();
    final rows = listFrom(m['rows']);
    if (columns.isEmpty) return _generic(m);
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

  Widget _audio(Map<String, dynamic> m) => Card(
        child: ListTile(
          leading: const Icon(Icons.play_circle_outline, color: rrnCyan, size: 36),
          title: Text(str(m['title'] ?? m['name'], 'Audio')),
          subtitle: Text(str(m['subtitle'] ?? m['artist'] ?? m['show'])),
          trailing: m['action'] != null ? MatrixActionButton(action: m['action'], compact: true) : null,
        ),
      );

  Widget _station(Map<String, dynamic> m) => Card(
        child: ListTile(
          leading: const CircleAvatar(backgroundColor: Color(0xFF10262B), child: Icon(Icons.radio, color: rrnCyan)),
          title: Text(str(m['name'] ?? m['title'], 'Station')),
          subtitle: Text(str(m['designation'] ?? m['frequency'])),
          trailing: m['action'] != null ? MatrixActionButton(action: m['action'], compact: true) : null,
        ),
      );

  Widget _product(Map<String, dynamic> m) => Card(
        child: ListTile(
          leading: const Icon(Icons.shopping_bag_outlined, color: rrnPurple),
          title: Text(str(m['name'] ?? m['title'], 'Product')),
          subtitle: Text([str(m['price'] ?? m['displayPrice']), if (boolish(m['owned'])) 'Owned'].where((x) => x.isNotEmpty).join(' · ')),
          trailing: m['action'] != null ? MatrixActionButton(action: m['action'], compact: true) : null,
        ),
      );

  Widget _event(Map<String, dynamic> m) => Card(
        child: ListTile(
          leading: const Icon(Icons.event, color: rrnPink),
          title: Text(str(m['title'] ?? m['name'], 'Event')),
          subtitle: Text(str(m['date'] ?? m['startsAt'] ?? m['starts_at'])),
          trailing: m['action'] != null ? MatrixActionButton(action: m['action'], compact: true) : null,
        ),
      );

  Widget _profile(Map<String, dynamic> m) => Card(
        child: ListTile(
          leading: const CircleAvatar(backgroundColor: Color(0xFF201135), child: Icon(Icons.person, color: rrnPurple)),
          title: Text(str(m['displayName'] ?? m['name'], 'RRN User')),
          subtitle: Text(str(m['tagline'] ?? m['role'])),
          trailing: m['action'] != null ? MatrixActionButton(action: m['action'], compact: true) : null,
        ),
      );

  Widget _generic(Map<String, dynamic> m) => Card(
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(str(m['title'] ?? m['name'] ?? m['type'], 'RRN content'), style: const TextStyle(fontWeight: FontWeight.w900)),
            const SizedBox(height: 6),
            Text(str(m['summary'] ?? m['description'] ?? m['body'] ?? m), style: const TextStyle(color: Colors.white70)),
          ]),
        ),
      );
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
    final a = widget.action is Map ? Map<String, dynamic>.from(widget.action) : <String, dynamic>{'id': '${widget.action}', 'label': '${widget.action}'};
    final label = str(a['label'] ?? a['title'] ?? a['id'], 'Open');
    return widget.compact
        ? IconButton(onPressed: busy ? null : () => _run(a), icon: busy ? const SizedBox(width: 17, height: 17, child: CircularProgressIndicator(strokeWidth: 2)) : const Icon(Icons.chevron_right), tooltip: label)
        : FilledButton.tonal(onPressed: busy ? null : () => _run(a), child: Text(label));
  }

  Future<void> _run(Map<String, dynamic> a) async {
    final id = str(a['id'] ?? a['actionId'] ?? a['action_id']);
    final path = str(a['path'] ?? a['href']);
    if (path.isNotEmpty && id.isEmpty) {
      await Navigator.push(context, MaterialPageRoute(builder: (_) => MatrixPageScreen(path: path, title: str(a['label'] ?? a['title'], 'RRN'))));
      return;
    }
    if (id.isEmpty) return;
    setState(() => busy = true);
    try {
      final body = await RrnScope.of(context).api.post('/action/$id', body: a['payload'] ?? const {});
      if (mounted) {
        final msg = body is Map ? str(body['message'], 'Action completed.') : 'Action completed.';
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
      }
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
  bool busy = false;

  @override
  Widget build(BuildContext context) {
    final fields = listFrom(widget.block['fields']);
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (str(widget.block['title']).isNotEmpty) Text(str(widget.block['title']), style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
            const SizedBox(height: 8),
            ...fields.map((raw) {
              final f = raw is Map ? Map<String, dynamic>.from(raw) : <String, dynamic>{};
              final name = str(f['name'] ?? f['id']);
              final type = str(f['type'], 'text').toLowerCase();
              final label = str(f['label'] ?? name);
              if (type == 'boolean' || type == 'checkbox') {
                return CheckboxListTile(
                  contentPadding: EdgeInsets.zero,
                  title: Text(label),
                  value: boolish(values[name] ?? f['value']),
                  onChanged: (v) => setState(() => values[name] = v ?? false),
                );
              }
              final options = listFrom(f['options']);
              if (type == 'select' && options.isNotEmpty) {
                return Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: DropdownButtonFormField<String>(
                    value: str(values[name] ?? f['value']).isEmpty ? null : str(values[name] ?? f['value']),
                    decoration: InputDecoration(labelText: label),
                    items: options.map((o) {
                      final om = o is Map ? Map<String, dynamic>.from(o) : <String, dynamic>{'label': '$o', 'value': '$o'};
                      return DropdownMenuItem(value: str(om['value']), child: Text(str(om['label'] ?? om['value'])));
                    }).toList(),
                    onChanged: (v) => values[name] = v,
                  ),
                );
              }
              return Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: TextFormField(
                  initialValue: str(f['value']),
                  obscureText: type == 'password',
                  keyboardType: type == 'number' ? TextInputType.number : type == 'email' ? TextInputType.emailAddress : TextInputType.text,
                  minLines: type == 'textarea' ? 3 : 1,
                  maxLines: type == 'textarea' ? 8 : 1,
                  decoration: InputDecoration(labelText: label, helperText: str(f['help']).isEmpty ? null : str(f['help'])),
                  onChanged: (v) => values[name] = v,
                ),
              );
            }),
            FilledButton(
              onPressed: busy ? null : _submit,
              child: busy ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2)) : Text(str(widget.block['submitLabel'], 'Save')),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _submit() async {
    final actionId = str(widget.block['actionId'] ?? widget.block['action_id']);
    if (actionId.isEmpty) return;
    setState(() => busy = true);
    try {
      final body = await RrnScope.of(context).api.post('/action/$actionId', body: values);
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(body is Map ? str(body['message'], 'Saved.') : 'Saved.')));
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }
}

class MatrixObjectScreen extends StatelessWidget {
  final String title;
  final Map<String, dynamic> data;
  const MatrixObjectScreen({super.key, required this.title, required this.data});
  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: Text(title)),
        body: MatrixPageRenderer(page: {'title': title, 'blocks': [{'type': 'card', ...data}]}),
      );
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
      ..loadRequest(Uri.parse('$rrnBase${widget.path.startsWith('/') ? widget.path : '/${widget.path}'}'));
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: Text(widget.title)),
        body: WebViewWidget(controller: controller),
      );
}
