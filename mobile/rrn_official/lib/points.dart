import 'dart:async';

import 'package:flutter/material.dart';

import 'core.dart';

/// RRN Points are a closed-loop network credit/rewards balance.
///
/// Value convention:
///   1 point = $0.01 of RRN checkout value.
///   100 points = $1.00.
///
/// The client NEVER mints points locally. Listening, store purchase rewards,
/// direct point purchases, refunds and redemptions are all server-authoritative.
class RrnPointsWallet {
  final int available;
  final int pending;
  final int lifetimeEarned;
  final int lifetimeSpent;
  final int centsPerPoint;

  const RrnPointsWallet({
    required this.available,
    required this.pending,
    required this.lifetimeEarned,
    required this.lifetimeSpent,
    this.centsPerPoint = 1,
  });

  double get usdValue => available * centsPerPoint / 100.0;

  factory RrnPointsWallet.from(dynamic raw) {
    final root = raw is Map ? Map<String, dynamic>.from(raw) : <String, dynamic>{};
    final wallet = root['wallet'] is Map ? Map<String, dynamic>.from(root['wallet']) : root;
    return RrnPointsWallet(
      available: numi(wallet['available'] ?? wallet['balance'] ?? wallet['points']),
      pending: numi(wallet['pending']),
      lifetimeEarned: numi(wallet['lifetimeEarned'] ?? wallet['lifetime_earned']),
      lifetimeSpent: numi(wallet['lifetimeSpent'] ?? wallet['lifetime_spent']),
      centsPerPoint: numi(wallet['centsPerPoint'] ?? wallet['cents_per_point'], 1).clamp(1, 1000000),
    );
  }
}

class PointLedgerEntry {
  final String id;
  final int amount;
  final String kind;
  final String description;
  final DateTime? createdAt;

  const PointLedgerEntry({required this.id, required this.amount, required this.kind, required this.description, required this.createdAt});

  factory PointLedgerEntry.from(dynamic raw) {
    final m = raw is Map ? Map<String, dynamic>.from(raw) : <String, dynamic>{};
    return PointLedgerEntry(
      id: str(m['id'] ?? m['transactionId'] ?? m['transaction_id']),
      amount: numi(m['amount'] ?? m['points']),
      kind: str(m['kind'] ?? m['type'] ?? m['reason'], 'transaction'),
      description: str(m['description'] ?? m['label'] ?? m['memo']),
      createdAt: DateTime.tryParse(str(m['createdAt'] ?? m['created_at'])),
    );
  }
}

class PointsService {
  final ApiClient api;
  const PointsService(this.api);

  Future<RrnPointsWallet> wallet() async => RrnPointsWallet.from(await api.get('/points'));

  Future<List<PointLedgerEntry>> ledger() async {
    final body = await api.get('/points/ledger');
    return listFrom(body, const ['transactions', 'ledger']).map(PointLedgerEntry.from).toList();
  }

  /// Returns a server-created checkout object. The backend decides whether the
  /// final payment is RRN Store, Google Play Billing, Apple IAP, or another
  /// compliant payment rail for the active distribution channel.
  Future<Map<String, dynamic>> quotePointPurchase(int points) async {
    if (points <= 0) throw ArgumentError.value(points, 'points', 'Must be positive.');
    final body = await api.post('/points/purchase/quote', body: {'points': points});
    if (body is! Map) throw ApiException(500, 'Point purchase quote was invalid.');
    return Map<String, dynamic>.from(body);
  }

  Future<Map<String, dynamic>> confirmPointPurchase(String checkoutId, {String? providerReceipt}) async {
    final body = await api.post('/points/purchase/confirm', body: {
      'checkoutId': checkoutId,
      if (providerReceipt != null) 'providerReceipt': providerReceipt,
    });
    if (body is! Map) throw ApiException(500, 'Point purchase confirmation was invalid.');
    return Map<String, dynamic>.from(body);
  }

  /// Ask the backend how many points can be applied to a cart/order.
  /// Supports all-points purchases and split tender without trusting client math.
  Future<Map<String, dynamic>> checkoutQuote({required String cartId, required int requestedPoints}) async {
    final body = await api.post('/points/checkout/quote', body: {
      'cartId': cartId,
      'requestedPoints': requestedPoints,
    });
    if (body is! Map) throw ApiException(500, 'Points checkout quote was invalid.');
    return Map<String, dynamic>.from(body);
  }

  Future<Map<String, dynamic>> redeemForCheckout({required String quoteId}) async {
    final body = await api.post('/points/checkout/redeem', body: {'quoteId': quoteId});
    if (body is! Map) throw ApiException(500, 'Points redemption response was invalid.');
    return Map<String, dynamic>.from(body);
  }
}

/// Server-authoritative listening rewards.
///
/// RRN's current rule requested for the app is 10 points per verified hour,
/// equivalent to 1 point per 6 verified listening minutes. The backend should
/// apply the award from heartbeats and must enforce anti-abuse rules.
class ListeningRewardsController extends ChangeNotifier {
  final ApiClient api;
  Timer? _timer;
  String? listeningSessionId;
  String? stationId;
  String? stationSlug;
  bool active = false;
  int serverAwardedThisSession = 0;
  String? lastError;

  ListeningRewardsController(this.api);

  static const int requestedPointsPerHour = 10;
  static const Duration heartbeatEvery = Duration(minutes: 2);

  Future<void> start({required String stationId, required String stationSlug}) async {
    if (active && this.stationId == stationId && this.stationSlug == stationSlug) return;
    await stop();
    this.stationId = stationId;
    this.stationSlug = stationSlug;
    serverAwardedThisSession = 0;
    try {
      final body = await api.post('/points/listening/start', body: {
        'stationId': stationId,
        'stationSlug': stationSlug,
        'clientRateHint': requestedPointsPerHour,
      });
      if (body is Map) {
        listeningSessionId = str(body['listeningSessionId'] ?? body['sessionId'] ?? body['id']);
        serverAwardedThisSession = numi(body['awardedPoints']);
      }
      if (listeningSessionId == null || listeningSessionId!.isEmpty) {
        throw ApiException(500, 'Listening reward session was not created.');
      }
      active = true;
      lastError = null;
      _timer = Timer.periodic(heartbeatEvery, (_) => heartbeat());
      notifyListeners();
    } catch (e) {
      active = false;
      lastError = '$e';
      notifyListeners();
    }
  }

  Future<void> heartbeat() async {
    if (!active || listeningSessionId == null) return;
    try {
      final body = await api.post('/points/listening/heartbeat', body: {
        'listeningSessionId': listeningSessionId,
        'stationId': stationId,
        'stationSlug': stationSlug,
      });
      if (body is Map) serverAwardedThisSession = numi(body['sessionAwardedPoints'] ?? body['awardedPoints'], serverAwardedThisSession);
      lastError = null;
      notifyListeners();
    } catch (e) {
      lastError = '$e';
      notifyListeners();
    }
  }

  Future<void> stop() async {
    _timer?.cancel();
    _timer = null;
    if (active && listeningSessionId != null) {
      try {
        final body = await api.post('/points/listening/stop', body: {'listeningSessionId': listeningSessionId});
        if (body is Map) serverAwardedThisSession = numi(body['sessionAwardedPoints'] ?? body['awardedPoints'], serverAwardedThisSession);
      } catch (_) {}
    }
    active = false;
    listeningSessionId = null;
    stationId = null;
    stationSlug = null;
    notifyListeners();
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }
}

class PointsWalletScreen extends StatefulWidget {
  const PointsWalletScreen({super.key});
  @override
  State<PointsWalletScreen> createState() => _PointsWalletScreenState();
}

class _PointsWalletScreenState extends State<PointsWalletScreen> {
  RrnPointsWallet? wallet;
  List<PointLedgerEntry> ledger = [];
  bool busy = true;
  String? error;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (busy && wallet == null) _load();
  }

  Future<void> _load() async {
    final app = RrnScope.of(context);
    if (!app.auth.signedIn) {
      setState(() {
        busy = false;
        error = 'Sign in to use RRN points.';
      });
      return;
    }
    try {
      final service = PointsService(app.api);
      final values = await Future.wait([service.wallet(), service.ledger()]);
      wallet = values[0] as RrnPointsWallet;
      ledger = values[1] as List<PointLedgerEntry>;
      error = null;
    } catch (e) {
      error = '$e';
    } finally {
      busy = false;
      if (mounted) setState(() {});
    }
  }

  Future<void> _buyPoints() async {
    final controller = TextEditingController(text: '100');
    final requested = await showDialog<int>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Buy RRN points'),
        content: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Text('1 point = $0.01 of RRN value. 100 points = $1.00.'),
          const SizedBox(height: 12),
          TextField(controller: controller, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Points')),
        ]),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          FilledButton(onPressed: () => Navigator.pop(context, int.tryParse(controller.text.trim())), child: const Text('Continue')),
        ],
      ),
    );
    if (requested == null || requested <= 0) return;
    try {
      final quote = await PointsService(RrnScope.of(context).api).quotePointPurchase(requested);
      final displayTotal = str(quote['displayTotal'] ?? quote['total'] ?? '\$${(requested / 100).toStringAsFixed(2)}');
      if (!mounted) return;
      await showDialog<void>(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Point purchase ready'),
          content: Text('The server quoted $requested RRN points for $displayTotal. Payment is completed through the configured RRN/app-store checkout provider.'),
          actions: [TextButton(onPressed: () => Navigator.pop(context), child: const Text('Close'))],
        ),
      );
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Point purchase backend is not live yet: $e')));
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: const Text('RRN Points')),
        body: RefreshIndicator(
          onRefresh: _load,
          child: ListView(padding: const EdgeInsets.all(16), children: [
            const RrnSectionHeader(
              eyebrow: 'Network-wide loyalty',
              title: 'RRN Points',
              subtitle: 'Earn by verified listening and qualifying purchases. Buy additional points. Spend them on RRN purchases, station requests, shoutouts and other in-network actions.',
            ),
            const SizedBox(height: 14),
            if (busy) const Center(child: Padding(padding: EdgeInsets.all(24), child: CircularProgressIndicator())),
            if (wallet != null)
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(18),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    const Text('AVAILABLE', style: TextStyle(color: rrnCyan, letterSpacing: 1.6, fontWeight: FontWeight.w900, fontSize: 10)),
                    Text('${wallet!.available}', style: const TextStyle(fontSize: 42, fontWeight: FontWeight.w900)),
                    Text('≈ \$${wallet!.usdValue.toStringAsFixed(2)} RRN checkout value', style: const TextStyle(color: Colors.white70)),
                    if (wallet!.pending > 0) Text('${wallet!.pending} pending points', style: const TextStyle(color: rrnPurple)),
                    const SizedBox(height: 12),
                    FilledButton.icon(onPressed: _buyPoints, icon: const Icon(Icons.add_card), label: const Text('Buy points')),
                  ]),
                ),
              ),
            Card(
              child: const Padding(
                padding: EdgeInsets.all(16),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('Current earning rules', style: TextStyle(fontWeight: FontWeight.w900)),
                  SizedBox(height: 6),
                  Text('• Verified Reality Dial listening: 10 points/hour (1 point per 6 verified minutes).'),
                  Text('• Qualifying store purchases: backend-configurable reward rate.'),
                  Text('• Direct purchase: 1 point per $0.01 paid.'),
                  SizedBox(height: 8),
                  Text('Points never go negative and have no cash-out route. Failed purchases/requests must roll back or refund their point hold.', style: TextStyle(color: Colors.white70)),
                ]),
              ),
            ),
            if (error != null) Card(child: Padding(padding: const EdgeInsets.all(14), child: Text(error!, style: const TextStyle(color: Colors.white60)))),
            if (ledger.isNotEmpty) ...[
              const SizedBox(height: 8),
              const Text('Recent activity', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
              ...ledger.map((entry) => ListTile(
                    leading: CircleAvatar(backgroundColor: entry.amount >= 0 ? const Color(0xFF0F332E) : const Color(0xFF351B28), child: Icon(entry.amount >= 0 ? Icons.add : Icons.remove, color: entry.amount >= 0 ? const Color(0xFF6EE7B7) : const Color(0xFFFDA4AF))),
                    title: Text(entry.description.isEmpty ? entry.kind : entry.description),
                    subtitle: entry.createdAt == null ? null : Text(entry.createdAt!.toLocal().toString()),
                    trailing: Text('${entry.amount >= 0 ? '+' : ''}${entry.amount}', style: TextStyle(fontWeight: FontWeight.w900, color: entry.amount >= 0 ? const Color(0xFF6EE7B7) : const Color(0xFFFDA4AF))),
                  )),
            ],
          ]),
        ),
      );
}
