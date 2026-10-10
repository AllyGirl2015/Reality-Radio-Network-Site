import 'dart:async';

import 'package:in_app_purchase/in_app_purchase.dart';

class RrnPlayPurchase {
  final String productId;
  final String transactionId;
  final String verificationData;
  final String localVerificationData;
  final String? transactionDate;

  const RrnPlayPurchase({
    required this.productId,
    required this.transactionId,
    required this.verificationData,
    required this.localVerificationData,
    required this.transactionDate,
  });
}

/// Small, server-verification-first Google Play Billing bridge.
///
/// RRN never credits currency or grants an entitlement from the client alone.
/// A Play purchase is returned to the caller, sent to the RRN backend for
/// verification, and only then acknowledged with [complete].
class RrnPlayBilling {
  RrnPlayBilling._() {
    _subscription = _iap.purchaseStream.listen(
      _handleUpdates,
      onError: (Object error, StackTrace _) => _fail(error),
    );
  }

  static final RrnPlayBilling instance = RrnPlayBilling._();

  final InAppPurchase _iap = InAppPurchase.instance;
  late final StreamSubscription<List<PurchaseDetails>> _subscription;
  Completer<RrnPlayPurchase>? _pending;
  String? _pendingProductId;
  PurchaseDetails? _pendingDetails;

  bool get purchaseInProgress => _pending != null;

  Future<RrnPlayPurchase> buyConsumable(String productId) async {
    final clean = productId.trim();
    if (clean.isEmpty) {
      throw StateError('The RRN backend did not provide a Google Play product ID.');
    }
    if (_pending != null) {
      throw StateError('Another Google Play purchase is already in progress.');
    }
    if (!await _iap.isAvailable()) {
      throw StateError('Google Play Billing is not available on this device.');
    }

    final response = await _iap.queryProductDetails({clean});
    if (response.error != null) {
      throw StateError(response.error!.message);
    }
    if (response.productDetails.isEmpty || response.notFoundIDs.contains(clean)) {
      throw StateError('Google Play product $clean is not configured for this app build.');
    }

    final details = response.productDetails.firstWhere(
      (item) => item.id == clean,
      orElse: () => response.productDetails.first,
    );
    final completer = Completer<RrnPlayPurchase>();
    _pending = completer;
    _pendingProductId = clean;
    _pendingDetails = null;

    final started = await _iap.buyConsumable(
      purchaseParam: PurchaseParam(productDetails: details),
      autoConsume: true,
    );
    if (!started) {
      _clearPending();
      throw StateError('Google Play did not start the purchase flow.');
    }

    try {
      return await completer.future.timeout(const Duration(minutes: 5));
    } on TimeoutException {
      _clearPending();
      throw StateError('Google Play purchase timed out. You were not credited by the app.');
    }
  }

  Future<void> complete(RrnPlayPurchase purchase) async {
    final details = _pendingDetails;
    if (details != null &&
        details.productID == purchase.productId &&
        details.pendingCompletePurchase) {
      await _iap.completePurchase(details);
    }
    _clearPending();
  }

  void _handleUpdates(List<PurchaseDetails> updates) {
    for (final details in updates) {
      if (_pending == null || details.productID != _pendingProductId) continue;
      switch (details.status) {
        case PurchaseStatus.pending:
          break;
        case PurchaseStatus.purchased:
        case PurchaseStatus.restored:
          if (_pending!.isCompleted) break;
          _pendingDetails = details;
          _pending!.complete(
            RrnPlayPurchase(
              productId: details.productID,
              transactionId: details.purchaseID ?? '',
              verificationData: details.verificationData.serverVerificationData,
              localVerificationData: details.verificationData.localVerificationData,
              transactionDate: details.transactionDate,
            ),
          );
          break;
        case PurchaseStatus.error:
          _fail(StateError(details.error?.message ?? 'Google Play purchase failed.'));
          break;
        case PurchaseStatus.canceled:
          _fail(StateError('Google Play purchase canceled.'));
          break;
      }
    }
  }

  void _fail(Object error) {
    final pending = _pending;
    if (pending != null && !pending.isCompleted) pending.completeError(error);
    _clearPending();
  }

  void _clearPending() {
    _pending = null;
    _pendingProductId = null;
    _pendingDetails = null;
  }

  Future<void> dispose() => _subscription.cancel();
}
