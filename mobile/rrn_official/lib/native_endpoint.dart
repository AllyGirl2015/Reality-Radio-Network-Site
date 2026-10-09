import 'package:flutter/material.dart';

import 'core.dart';
import 'site.dart';

/// Loads an existing App Translation Matrix endpoint directly and keeps the
/// result inside the app. It intentionally does not fall through to a WebView.
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
          actions: [IconButton(onPressed: _load, icon: const Icon(Icons.refresh))],
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
            subtitle: 'The native screen is calling ${widget.endpoint}; it will not silently redirect to the website.',
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
      final blocks = listFrom(map['blocks']);
      if (blocks.isNotEmpty || str(map['title'] ?? map['name']).isNotEmpty) {
        final normalized = <String, dynamic>{
          'title': widget.title,
          ...map,
        };
        return MatrixPageRenderer(page: normalized);
      }

      final items = listFrom(map, const ['items', 'products', 'results', 'entries']);
      if (items.isNotEmpty) return _collection(items, map);
      return _mapCard(map);
    }
    if (data is List) return _collection(List<dynamic>.from(data as List), const <String, dynamic>{});
    return Center(child: Padding(padding: const EdgeInsets.all(20), child: Text(str(data, 'No content returned.'))));
  }

  Widget _collection(List<dynamic> rawItems, Map<String, dynamic> envelope) {
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
        ...rawItems.map((raw) {
          final item = raw is Map ? Map<String, dynamic>.from(raw) : <String, dynamic>{'title': '$raw'};
          final image = _absolute(str(item['image'] ?? item['imageUrl'] ?? item['image_url'] ?? item['artwork'] ?? item['coverUrl'] ?? item['cover_url']));
          final title = str(item['title'] ?? item['name'] ?? item['label'], 'RRN');
          final subtitle = [
            str(item['artist'] ?? item['subtitle']),
            str(item['price'] ?? item['displayPrice'] ?? item['display_price']),
            str(item['summary'] ?? item['description']),
          ].where((e) => e.isNotEmpty).join(' · ');
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
              trailing: item['action'] != null ? MatrixActionButton(action: item['action'], compact: true) : null,
            ),
          );
        }),
      ],
    );
  }

  Widget _mapCard(Map<String, dynamic> map) => ListView(
        padding: const EdgeInsets.fromLTRB(14, 16, 14, 100),
        children: [
          RrnSectionHeader(
            eyebrow: 'Native Matrix',
            title: widget.title,
            subtitle: 'This endpoint is connected natively. Its current payload does not yet expose a recognized block or collection shape.',
          ),
          const SizedBox(height: 12),
          ...map.entries.map(
            (entry) => Card(
              child: ListTile(
                title: Text(entry.key, style: const TextStyle(fontWeight: FontWeight.w900)),
                subtitle: Text(str(entry.value)),
              ),
            ),
          ),
        ],
      );

  String _absolute(String value) {
    if (value.isEmpty) return '';
    if (value.startsWith('http://') || value.startsWith('https://')) return value;
    return '$rrnBase${value.startsWith('/') ? value : '/$value'}';
  }
}

/// Native alpha surface for a known backend parity gap. This is deliberately
/// preferable to a surprise website redirect because it names the contract the
/// next site build must provide.
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
              title: '$title is not being sent to the website.',
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
                    const SizedBox(height: 10),
                    const Text(
                      'This is tracked in NATIVE_PARITY_AUDIT_v0.6.md for the next RealityRadio.net build.',
                      style: TextStyle(color: Colors.white60),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      );
}
