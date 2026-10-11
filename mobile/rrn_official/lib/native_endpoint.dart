import 'package:flutter/material.dart';

import 'core.dart';
import 'site.dart';

/// Loads a dedicated App Translation Matrix resource. Unlike the old alpha
/// renderer, this screen never turns arbitrary response fields into UI.
class MatrixEndpointScreen extends StatefulWidget {
  final String endpoint;
  final String title;
  final Map<String, dynamic>? query;

  const MatrixEndpointScreen({
    super.key,
    required this.endpoint,
    required this.title,
    this.query,
  });

  @override
  State<MatrixEndpointScreen> createState() => _MatrixEndpointScreenState();
}

class _MatrixEndpointScreenState extends State<MatrixEndpointScreen> {
  dynamic data;
  bool busy = true;
  String? error;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (busy && data == null) _load();
  }

  Future<void> _load() async {
    setState(() {
      busy = true;
      error = null;
    });
    try {
      data = await RrnScope.of(context).api.get(widget.endpoint, query: widget.query);
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
          actions: [IconButton(onPressed: busy ? null : _load, icon: const Icon(Icons.refresh))],
        ),
        body: busy
            ? const Center(child: CircularProgressIndicator())
            : error != null
                ? _error()
                : _content(),
      );

  Widget _error() => ListView(
        padding: const EdgeInsets.all(18),
        children: [
          RrnSectionHeader(
            eyebrow: 'App Translation Matrix',
            title: '${widget.title} is temporarily unavailable.',
            subtitle: 'The native screen is calling ${widget.endpoint}. It will not expose the raw response or silently reinterpret it as a control panel.',
          ),
          const SizedBox(height: 14),
          Text(error!, style: const TextStyle(color: Colors.white60)),
          const SizedBox(height: 14),
          FilledButton.tonalIcon(onPressed: _load, icon: const Icon(Icons.refresh), label: const Text('Retry')),
        ],
      );

  Widget _content() {
    if (data is Map) {
      final map = Map<String, dynamic>.from(data as Map);
      if (_looksLikePage(map)) return MatrixPageRenderer(page: {'title': widget.title, ...map});

      final pageTarget = _pageTarget(map);
      final sections = _collectionSections(map);
      if (sections.isNotEmpty) return _sections(map, sections, pageTarget);
      return _safeMap(map, pageTarget);
    }
    if (data is List) {
      return _sections(
        const <String, dynamic>{},
        [MapEntry('items', List<dynamic>.from(data as List))],
        '',
      );
    }
    return _safeMap(const <String, dynamic>{}, '', message: 'The endpoint completed without a user-facing payload.');
  }

  bool _looksLikePage(Map<String, dynamic> map) =>
      listFrom(map['blocks']).isNotEmpty ||
      listFrom(map['forms']).isNotEmpty ||
      listFrom(map['links']).isNotEmpty ||
      listFrom(map['actions']).isNotEmpty;

  String _pageTarget(Map<String, dynamic> map) {
    final direct = str(map['deepLink'] ?? map['deep_link'] ?? map['webUrl'] ?? map['web_url'] ?? map['pagePath'] ?? map['page_path']);
    if (direct.isNotEmpty) return direct;
    final page = str(map['page']);
    if (page.isEmpty) return '';
    final uri = Uri.tryParse(page.startsWith('http') ? page : '$rrnBase$page');
    return uri?.queryParameters['path'] ?? page;
  }

  List<MapEntry<String, List<dynamic>>> _collectionSections(Map<String, dynamic> map) {
    final sections = <MapEntry<String, List<dynamic>>>[];
    for (final key in const [
      'items',
      'results',
      'entries',
      'products',
      'stations',
      'presenters',
      'programs',
      'artists',
      'labels',
      'services',
      'applications',
      'orders',
      'tickets',
      'members',
      'roles',
    ]) {
      if (map[key] is List) sections.add(MapEntry(key, List<dynamic>.from(map[key] as List)));
    }
    return sections;
  }

  Widget _sections(
    Map<String, dynamic> envelope,
    List<MapEntry<String, List<dynamic>>> sections,
    String pageTarget,
  ) {
    final rootActions = listFrom(envelope['actions']);
    final rootLinks = listFrom(envelope['links']);
    return ListView(
      padding: const EdgeInsets.fromLTRB(14, 16, 14, 100),
      children: [
        RrnSectionHeader(
          eyebrow: 'Native Matrix',
          title: str(envelope['title'], widget.title),
          subtitle: str(envelope['summary'] ?? envelope['description']).isEmpty
              ? 'Loaded from the dedicated ${widget.endpoint} resource.'
              : str(envelope['summary'] ?? envelope['description']),
        ),
        const SizedBox(height: 12),
        if (pageTarget.isNotEmpty)
          Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: FilledButton.icon(
              onPressed: () => matrixNavigate(context, pageTarget, widget.title),
              icon: const Icon(Icons.tune),
              label: const Text('Open controls'),
            ),
          ),
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
            ...section.value.map(_record),
          const SizedBox(height: 10),
        ],
        ...rootLinks.map((link) => MatrixTranslatedLinkButton(link: link)),
        if (rootActions.isNotEmpty)
          Wrap(spacing: 8, runSpacing: 8, children: rootActions.map((action) => MatrixActionButton(action: action)).toList()),
      ],
    );
  }

  Widget _record(dynamic raw) {
    final item = raw is Map ? Map<String, dynamic>.from(raw) : <String, dynamic>{'title': str(raw)};
    final title = str(
      item['title'] ?? item['name'] ?? item['displayName'] ?? item['display_name'] ?? item['label'],
      'RRN',
    );
    final subtitle = [
      str(item['subtitle'] ?? item['summary'] ?? item['description']),
      str(item['status']),
      str(item['designation'] ?? item['frequencyLabel'] ?? item['frequency_label']),
      str(item['price'] ?? item['displayPrice'] ?? item['display_price']),
    ].where((e) => e.isNotEmpty).join(' · ');
    final image = _absolute(str(
      item['imageUrl'] ??
          item['image_url'] ??
          item['artworkUrl'] ??
          item['artwork_url'] ??
          item['avatarUrl'] ??
          item['avatar_url'] ??
          item['coverUrl'] ??
          item['cover_url'],
    ));
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
        trailing: action == null ? null : const Icon(Icons.chevron_right),
        onTap: action == null ? null : () => runMatrixAction(context, action, fallbackTitle: title),
      ),
    );
  }

  Widget _safeMap(
    Map<String, dynamic> map,
    String pageTarget, {
    String message = 'This resource returned backend state that is not itself a user interface.',
  }) {
    final actions = listFrom(map['actions']);
    final links = listFrom(map['links']);
    return ListView(
      padding: const EdgeInsets.fromLTRB(14, 16, 14, 100),
      children: [
        RrnSectionHeader(eyebrow: 'Native Matrix', title: widget.title, subtitle: message),
        const SizedBox(height: 12),
        const Card(
          child: ListTile(
            leading: Icon(Icons.shield_outlined, color: rrnCyan),
            title: Text('Internal fields hidden'),
            subtitle: Text('IDs, controller paths, authorization metadata and unrecognized backend values are not displayed to users.'),
          ),
        ),
        if (pageTarget.isNotEmpty)
          FilledButton.icon(
            onPressed: () => matrixNavigate(context, pageTarget, widget.title),
            icon: const Icon(Icons.tune),
            label: const Text('Open controls'),
          ),
        ...links.map((link) => MatrixTranslatedLinkButton(link: link)),
        if (actions.isNotEmpty)
          Wrap(spacing: 8, runSpacing: 8, children: actions.map((action) => MatrixActionButton(action: action)).toList()),
      ],
    );
  }

  String _absolute(String value) {
    if (value.isEmpty) return '';
    if (value.startsWith('http://') || value.startsWith('https://')) return value;
    return '$rrnBase${value.startsWith('/') ? value : '/$value'}';
  }
}

class BridgePendingScreen extends StatelessWidget {
  final String title;
  final String endpoint;
  final String description;

  const BridgePendingScreen({
    super.key,
    required this.title,
    required this.endpoint,
    required this.description,
  });

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: Text(title)),
        body: ListView(
          padding: const EdgeInsets.all(18),
          children: [
            RrnSectionHeader(
              eyebrow: 'Native bridge required',
              title: '$title is not available natively yet.',
              subtitle: description,
            ),
            const SizedBox(height: 16),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Required Matrix contract', style: TextStyle(fontWeight: FontWeight.w900)),
                    const SizedBox(height: 8),
                    SelectableText(endpoint, style: const TextStyle(color: rrnCyan, fontFamily: 'monospace')),
                  ],
                ),
              ),
            ),
          ],
        ),
      );
}
