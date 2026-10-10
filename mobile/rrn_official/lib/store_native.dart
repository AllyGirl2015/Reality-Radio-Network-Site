import 'package:flutter/material.dart';

import 'core.dart';
import 'external_links.dart';

String _storeImage(dynamic raw) {
  if (raw is! Map) return '';
  final m = Map<String, dynamic>.from(raw);
  final value = str(m['artwork_url'] ?? m['artworkUrl'] ?? m['image'] ?? m['imageUrl']);
  if (value.isEmpty) return '';
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  return '$rrnBase${value.startsWith('/') ? value : '/$value'}';
}

String _money(int cents, [String currency = 'USD']) {
  final amount = (cents / 100).toStringAsFixed(2);
  return currency.toUpperCase() == 'USD' ? '\$$amount' : '$amount ${currency.toUpperCase()}';
}

class RrnStoreScreen extends StatefulWidget {
  const RrnStoreScreen({super.key});

  @override
  State<RrnStoreScreen> createState() => _RrnStoreScreenState();
}

class _RrnStoreScreenState extends State<RrnStoreScreen> {
  final search = TextEditingController();
  List<Map<String, dynamic>> products = [];
  Map<String, dynamic> points = {};
  bool busy = true;
  String? error;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (busy && products.isEmpty && error == null) _load();
  }

  @override
  void dispose() {
    search.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      busy = true;
      error = null;
    });
    try {
      final result = await RrnScope.of(context).api.get('/store', query: {
        'limit': 100,
        if (search.text.trim().isNotEmpty) 'q': search.text.trim(),
      });
      products = listFrom(result, const ['items'])
          .whereType<Map>()
          .map((e) => Map<String, dynamic>.from(e))
          .toList();
      points = result is Map && result['points'] is Map ? Map<String, dynamic>.from(result['points']) : {};
    } catch (e) {
      error = '$e';
    } finally {
      busy = false;
      if (mounted) setState(() {});
    }
  }

  int get availablePoints {
    final wallet = points['wallet'];
    if (wallet is Map) return numi(wallet['availablePoints'] ?? wallet['balance']);
    return 0;
  }

  Future<void> _buyPoints() => openExternalUrl(context, '$rrnBase/account/points');

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(
          title: const Text('RRN Store'),
          actions: [IconButton(onPressed: _load, icon: const Icon(Icons.refresh))],
        ),
        body: RefreshIndicator(
          onRefresh: _load,
          child: ListView(
            padding: const EdgeInsets.fromLTRB(14, 14, 14, 100),
            children: [
              RrnSectionHeader(
                eyebrow: 'RRN Store',
                title: 'Music, services and RRN products.',
                subtitle: availablePoints > 0
                    ? '${availablePoints.toString()} RRN Points currently available. Secure card entry opens RealityRadio.net checkout.'
                    : 'Browse natively. Secure card entry opens RealityRadio.net checkout when payment is needed.',
              ),
              const SizedBox(height: 12),
              Row(children: [
                Expanded(
                  child: TextField(
                    controller: search,
                    textInputAction: TextInputAction.search,
                    onSubmitted: (_) => _load(),
                    decoration: InputDecoration(
                      labelText: 'Search the RRN Store',
                      prefixIcon: const Icon(Icons.search),
                      suffixIcon: search.text.isEmpty
                          ? null
                          : IconButton(
                              onPressed: () {
                                search.clear();
                                _load();
                              },
                              icon: const Icon(Icons.clear),
                            ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                FilledButton.tonalIcon(onPressed: _buyPoints, icon: const Icon(Icons.toll), label: const Text('Buy Points')),
              ]),
              if (busy) const Center(child: Padding(padding: EdgeInsets.all(32), child: CircularProgressIndicator())),
              if (!busy && error != null)
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      const Text('Store unavailable', style: TextStyle(fontWeight: FontWeight.w900)),
                      const SizedBox(height: 5),
                      Text(error!, style: const TextStyle(color: Colors.white60)),
                      const SizedBox(height: 10),
                      FilledButton.tonal(onPressed: _load, child: const Text('Retry')),
                    ]),
                  ),
                ),
              if (!busy && error == null && products.isEmpty)
                const Card(child: Padding(padding: EdgeInsets.all(18), child: Text('No store products matched this search.'))),
              ...products.map((product) => _ProductCard(product: product)),
            ],
          ),
        ),
      );
}

class _ProductCard extends StatelessWidget {
  final Map<String, dynamic> product;
  const _ProductCard({required this.product});

  @override
  Widget build(BuildContext context) {
    final name = str(product['name'] ?? product['title'], 'RRN Product');
    final description = str(product['description']);
    final image = _storeImage(product);
    final cents = numi(product['priceCents'] ?? product['sale_price_cents'] ?? product['price_cents']);
    final pointPrice = numi(product['pricePoints']);
    final type = str(product['product_type'] ?? product['productType']);
    final preorder = boolish(product['preorder_enabled'] ?? product['preorderEnabled']);
    return Card(
      clipBehavior: Clip.antiAlias,
      margin: const EdgeInsets.only(top: 10),
      child: InkWell(
        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => RrnProductScreen(product: product))),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: SizedBox(
                width: 78,
                height: 78,
                child: image.isEmpty
                    ? const ColoredBox(color: Colors.black, child: Icon(Icons.shopping_bag, color: rrnPurple))
                    : Image.network(image, fit: BoxFit.cover, errorBuilder: (_, __, ___) => const ColoredBox(color: Colors.black, child: Icon(Icons.shopping_bag, color: rrnPurple))),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Row(children: [
                  Expanded(child: Text(name, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 17))),
                  if (preorder) const Chip(label: Text('PRE-ORDER', style: TextStyle(fontSize: 8))),
                ]),
                if (type.isNotEmpty) Text(type.toUpperCase(), style: const TextStyle(color: rrnCyan, fontSize: 9, fontWeight: FontWeight.w900)),
                if (description.isNotEmpty) Text(description, maxLines: 3, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.white60)),
                const SizedBox(height: 6),
                Text(
                  [if (cents > 0) _money(cents, str(product['currency'], 'USD')), if (pointPrice > 0) '$pointPrice pts'].join(' · '),
                  style: const TextStyle(color: rrnPurple, fontWeight: FontWeight.w900),
                ),
              ]),
            ),
            const Icon(Icons.chevron_right),
          ]),
        ),
      ),
    );
  }
}

class RrnProductScreen extends StatelessWidget {
  final Map<String, dynamic> product;
  const RrnProductScreen({super.key, required this.product});

  @override
  Widget build(BuildContext context) {
    final id = str(product['id']);
    final name = str(product['name'] ?? product['title'], 'RRN Product');
    final description = str(product['description']);
    final image = _storeImage(product);
    final cents = numi(product['priceCents'] ?? product['sale_price_cents'] ?? product['price_cents']);
    final pointPrice = numi(product['pricePoints']);
    final canPoints = boolish(product['canPayWithPoints']);
    return Scaffold(
      appBar: AppBar(title: Text(name)),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 14, 16, 100),
        children: [
          if (image.isNotEmpty)
            ClipRRect(
              borderRadius: BorderRadius.circular(22),
              child: AspectRatio(aspectRatio: 1, child: Image.network(image, fit: BoxFit.cover)),
            ),
          const SizedBox(height: 16),
          Text(name, style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900)),
          const SizedBox(height: 6),
          Text(
            [if (cents > 0) _money(cents, str(product['currency'], 'USD')), if (pointPrice > 0) '$pointPrice RRN Points'].join(' · '),
            style: const TextStyle(color: rrnCyan, fontSize: 18, fontWeight: FontWeight.w900),
          ),
          if (description.isNotEmpty) ...[
            const SizedBox(height: 14),
            Text(description, style: const TextStyle(height: 1.45, color: Colors.white70)),
          ],
          const SizedBox(height: 20),
          FilledButton.icon(
            onPressed: id.isEmpty ? null : () => openExternalUrl(context, '$rrnBase/checkout/$id'),
            icon: const Icon(Icons.lock_outline),
            label: const Text('Checkout'),
          ),
          const SizedBox(height: 8),
          if (canPoints)
            const Text(
              'RRN Points and split-tender eligibility are calculated by the server. Secure card tokenization opens the RRN web checkout.',
              style: TextStyle(color: Colors.white54, fontSize: 11),
            ),
          const SizedBox(height: 10),
          OutlinedButton.icon(
            onPressed: () => openExternalUrl(context, '$rrnBase/account/points'),
            icon: const Icon(Icons.toll),
            label: const Text('Buy RRN Points'),
          ),
        ],
      ),
    );
  }
}
