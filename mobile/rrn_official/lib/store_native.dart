import 'package:flutter/material.dart';

import 'core.dart';
import 'site.dart';

String _storeImage(dynamic value) {
  final raw = str(value);
  if (raw.isEmpty) return '';
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  return '$rrnBase${raw.startsWith('/') ? raw : '/$raw'}';
}

class NativeStoreScreen extends StatefulWidget {
  const NativeStoreScreen({super.key});

  @override
  State<NativeStoreScreen> createState() => _NativeStoreScreenState();
}

class _NativeStoreScreenState extends State<NativeStoreScreen> {
  List<Map<String, dynamic>> products = [];
  bool busy = true;
  String? error;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (busy && products.isEmpty && error == null) _load();
  }

  Future<void> _load() async {
    setState(() {
      busy = true;
      error = null;
    });
    try {
      final body = await RrnScope.of(context).api.get('/store');
      products = listFrom(body, const ['products', 'items', 'catalog'])
          .whereType<Map>()
          .map((e) => Map<String, dynamic>.from(e))
          .toList();
    } catch (e) {
      error = '$e';
    } finally {
      busy = false;
      if (mounted) setState(() {});
    }
  }

  String _id(Map<String, dynamic> m) => str(m['id'] ?? m['productId'] ?? m['product_id'] ?? m['slug']);

  String _title(Map<String, dynamic> m) => str(m['name'] ?? m['title'], 'RRN Product');

  String _price(Map<String, dynamic> m) {
    final direct = str(m['displayPrice'] ?? m['display_price'] ?? m['price']);
    if (direct.isNotEmpty) return direct;
    final cents = numi(m['salePriceCents'] ?? m['sale_price_cents'] ?? m['priceCents'] ?? m['price_cents']);
    return cents > 0 ? '\$${(cents / 100).toStringAsFixed(2)}' : '';
  }

  Future<void> _openProduct(Map<String, dynamic> product) async {
    final id = _id(product);
    final action = product['action'];
    if (action != null) {
      await Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => MatrixObjectScreen(
            title: _title(product),
            data: {
              ...product,
              'action': action,
            },
          ),
        ),
      );
      return;
    }
    if (id.isEmpty) return;
    await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => MatrixPageScreen(path: '/checkout/$id', title: _title(product)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(
          title: const Text('RRN Store'),
          actions: [IconButton(onPressed: _load, icon: const Icon(Icons.refresh))],
        ),
        body: RefreshIndicator(
          onRefresh: _load,
          child: ListView(
            padding: const EdgeInsets.fromLTRB(14, 16, 14, 100),
            children: [
              const RrnSectionHeader(
                eyebrow: 'RRN Store',
                title: 'Shop the network.',
                subtitle: 'Browse natively. Secure card tokenization can hand off only at the protected payment step when required.',
              ),
              const SizedBox(height: 12),
              if (busy) const Padding(padding: EdgeInsets.all(32), child: Center(child: CircularProgressIndicator())),
              if (!busy && error != null)
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      const Text('Store unavailable', style: TextStyle(fontWeight: FontWeight.w900)),
                      const SizedBox(height: 6),
                      Text(error!, style: const TextStyle(color: Colors.white60)),
                      const SizedBox(height: 8),
                      FilledButton.tonal(onPressed: _load, child: const Text('Retry')),
                    ]),
                  ),
                ),
              if (!busy && error == null && products.isEmpty)
                const Card(child: Padding(padding: EdgeInsets.all(18), child: Text('The Store returned no products.'))),
              ...products.map((product) {
                final image = _storeImage(product['image'] ?? product['imageUrl'] ?? product['image_url'] ?? product['artwork'] ?? product['coverUrl']);
                final price = _price(product);
                final description = str(product['summary'] ?? product['description']);
                final owned = boolish(product['owned']);
                final available = !boolish(product['unavailable']) && !boolish(product['disabled']);
                return Card(
                  clipBehavior: Clip.antiAlias,
                  child: InkWell(
                    onTap: available ? () => _openProduct(product) : null,
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(12),
                            child: SizedBox(
                              width: 78,
                              height: 78,
                              child: image.isEmpty
                                  ? const ColoredBox(color: Colors.black, child: Icon(Icons.shopping_bag_outlined, color: rrnPurple))
                                  : Image.network(image, fit: BoxFit.cover, errorBuilder: (_, __, ___) => const ColoredBox(color: Colors.black, child: Icon(Icons.shopping_bag_outlined, color: rrnPurple))),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(_title(product), style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w900)),
                                if (price.isNotEmpty) Text(price, style: const TextStyle(color: rrnCyan, fontWeight: FontWeight.w900)),
                                if (description.isNotEmpty) ...[
                                  const SizedBox(height: 4),
                                  Text(description, maxLines: 3, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.white70)),
                                ],
                                const SizedBox(height: 8),
                                Row(children: [
                                  if (owned) const Chip(label: Text('Owned')),
                                  const Spacer(),
                                  FilledButton.tonal(
                                    onPressed: available ? () => _openProduct(product) : null,
                                    child: Text(owned ? 'View' : 'Buy / View'),
                                  ),
                                ]),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              }),
            ],
          ),
        ),
      );
}
