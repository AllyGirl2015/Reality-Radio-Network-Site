from pathlib import Path
import re

ROOT = Path('/tmp/rrn_mobile/lib')
ANDROID = Path('/tmp/rrn_mobile/android/app/src/main/kotlin/com/rbew/rrn_official/MainActivity.kt')


def read(name: str) -> str:
    return (ROOT / name).read_text()


def write(name: str, text: str) -> None:
    (ROOT / name).write_text(text)


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if old not in text:
        raise SystemExit(f'v0.10 patch failed: {label}')
    return text.replace(old, new, 1)


def regex_once(text: str, pattern: str, replacement: str, label: str) -> str:
    result, count = re.subn(pattern, replacement, text, count=1, flags=re.S)
    if count != 1:
        raise SystemExit(f'v0.10 patch failed: {label}')
    return result


# ---------------------------------------------------------------------------
# API multipart: translated forms and Feed publishing can now attach real files.
# ---------------------------------------------------------------------------
text = read('core.dart')
text = regex_once(
    text,
    r"  Future<dynamic> postForm\(.*?\n  \}\n\n  Future<dynamic> patch\(",
    r'''  Future<dynamic> postForm(
    String path, {
    Map<String, String> fields = const {},
    Map<String, String> files = const {},
    String method = 'POST',
    bool retryAuth = true,
  }) async {
    Future<http.Response> send() async {
      final request = http.MultipartRequest(method.toUpperCase(), uri(path));
      request.headers.addAll(headers(jsonBody: false));
      request.fields.addAll(fields);
      for (final entry in files.entries) {
        if (entry.key.trim().isEmpty || entry.value.trim().isEmpty) continue;
        request.files.add(await http.MultipartFile.fromPath(entry.key, entry.value));
      }
      final streamed = await request.send().timeout(const Duration(seconds: 60));
      return http.Response.fromStream(streamed);
    }

    var response = await send();
    if (response.statusCode == 401 && retryAuth && await refresh()) {
      response = await send();
    }
    return decode(response);
  }

  Future<dynamic> patch(''',
    'multipart file-aware ApiClient.postForm',
)
write('core.dart', text)


# ---------------------------------------------------------------------------
# Generic Matrix forms: real Android file picker + multipart controller upload.
# This turns submissions/applications/profile uploads from placeholders into
# executable native forms whenever the Translation Matrix exposes file fields.
# ---------------------------------------------------------------------------
text = read('site.dart')
if "package:file_picker/file_picker.dart" not in text:
    text = text.replace(
        "import 'package:flutter/material.dart';\n",
        "import 'package:file_picker/file_picker.dart';\nimport 'package:flutter/material.dart';\n",
        1,
    )
text = replace_once(
    text,
    "class _MatrixFormRendererState extends State<MatrixFormRenderer> {\n  final values = <String, dynamic>{};\n  bool busy = false;\n",
    "class _MatrixFormRendererState extends State<MatrixFormRenderer> {\n"
    "  final values = <String, dynamic>{};\n"
    "  final files = <String, String>{};\n"
    "  bool busy = false;\n",
    'Matrix form file state',
)
file_placeholder = r'''              if (type == 'file') {
                return Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: const Icon(Icons.upload_file, color: rrnPurple),
                    title: Text(label),
                    subtitle: const Text('File uploads use a dedicated native uploader when available.'),
                  ),
                );
              }
'''
file_picker = r'''              if (type == 'file') {
                final selected = files[name] ?? '';
                final required = boolish(f['required']);
                return Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: Card(
                    child: Padding(
                      padding: const EdgeInsets.all(10),
                      child: Row(children: [
                        const Icon(Icons.upload_file, color: rrnPurple),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                            Text(required ? '$label *' : label, style: const TextStyle(fontWeight: FontWeight.w800)),
                            Text(
                              selected.isEmpty ? (str(f['help']).isEmpty ? 'Choose a file from this device.' : str(f['help'])) : selected.split('/').last,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(color: Colors.white60, fontSize: 11),
                            ),
                          ]),
                        ),
                        const SizedBox(width: 8),
                        OutlinedButton(
                          onPressed: busy ? null : () => _pickFile(name, f),
                          child: Text(selected.isEmpty ? 'Choose' : 'Change'),
                        ),
                        if (selected.isNotEmpty)
                          IconButton(
                            tooltip: 'Remove file',
                            onPressed: busy ? null : () => setState(() => files.remove(name)),
                            icon: const Icon(Icons.close),
                          ),
                      ]),
                    ),
                  ),
                );
              }
'''
text = replace_once(text, file_placeholder, file_picker, 'Matrix file field picker')
pick_method = r'''  Future<void> _pickFile(String name, Map<String, dynamic> field) async {
    try {
      final result = await FilePicker.platform.pickFiles(
        allowMultiple: false,
        withData: false,
        type: FileType.any,
      );
      if (result == null || result.files.isEmpty) return;
      final path = result.files.single.path;
      if (path == null || path.isEmpty) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Android did not provide a readable path for that file.')));
        }
        return;
      }
      if (mounted) setState(() => files[name] = path);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Could not choose file: $e')));
    }
  }

'''
text = replace_once(
    text,
    "  Future<void> _submit() async {\n",
    pick_method + "  Future<void> _submit() async {\n",
    'Matrix picker helper',
)
text = replace_once(
    text,
    "      final body = await RrnScope.of(context).api.postForm(controller, fields: fields, method: method);\n",
    "      for (final raw in listFrom(widget.block['fields'])) {\n"
    "        if (raw is! Map) continue;\n"
    "        final field = Map<String, dynamic>.from(raw);\n"
    "        final name = str(field['name'] ?? field['id']);\n"
    "        if (name.isEmpty || str(field['type']).toLowerCase() != 'file') continue;\n"
    "        if (boolish(field['required']) && (files[name] ?? '').isEmpty) {\n"
    "          throw StateError('${str(field['label'] ?? name)} requires a file.');\n"
    "        }\n"
    "      }\n"
    "      final body = await RrnScope.of(context).api.postForm(controller, fields: fields, files: files, method: method);\n",
    'Matrix multipart submit',
)
write('site.dart', text)


# ---------------------------------------------------------------------------
# Feed composer: local hero-image upload in addition to URL-based artwork.
# ---------------------------------------------------------------------------
text = read('feed_composer.dart')
if "package:file_picker/file_picker.dart" not in text:
    text = text.replace(
        "import 'package:flutter/material.dart';\n",
        "import 'package:file_picker/file_picker.dart';\nimport 'package:flutter/material.dart';\n",
        1,
    )
text = replace_once(
    text,
    "  DateTime? publishAt;\n",
    "  DateTime? publishAt;\n  String heroImageFile = '';\n",
    'Feed hero file state',
)
feed_pick_method = r'''  Future<void> _pickHeroImage() async {
    try {
      final result = await FilePicker.platform.pickFiles(
        allowMultiple: false,
        withData: false,
        type: FileType.image,
      );
      if (result == null || result.files.isEmpty) return;
      final path = result.files.single.path;
      if (path == null || path.isEmpty) {
        if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Android did not provide a readable path for that image.')));
        return;
      }
      if (mounted) setState(() => heroImageFile = path);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Could not choose image: $e')));
    }
  }

'''
text = replace_once(
    text,
    "  Future<void> _pickSchedule() async {\n",
    feed_pick_method + "  Future<void> _pickSchedule() async {\n",
    'Feed image picker helper',
)
text = replace_once(
    text,
    "      await app.api.postForm('/feed/publish', fields: fields);\n",
    "      await app.api.postForm(\n"
    "        '/feed/publish',\n"
    "        fields: fields,\n"
    "        files: {if (heroImageFile.isNotEmpty) 'heroImage': heroImageFile},\n"
    "      );\n",
    'Feed multipart publish',
)
text = replace_once(
    text,
    "            TextField(controller: heroImageUrl, keyboardType: TextInputType.url, decoration: const InputDecoration(labelText: 'Hero image URL', hintText: 'Optional HTTPS image')),\n            const SizedBox(height: 8),\n",
    "            TextField(controller: heroImageUrl, keyboardType: TextInputType.url, decoration: const InputDecoration(labelText: 'Hero image URL', hintText: 'Optional HTTPS image')),\n"
    "            const SizedBox(height: 8),\n"
    "            Card(\n"
    "              child: ListTile(\n"
    "                leading: const Icon(Icons.image_outlined, color: rrnPurple),\n"
    "                title: const Text('Upload hero image'),\n"
    "                subtitle: Text(heroImageFile.isEmpty ? 'Choose an image from this device instead of using a URL.' : heroImageFile.split('/').last),\n"
    "                trailing: Row(mainAxisSize: MainAxisSize.min, children: [\n"
    "                  OutlinedButton(onPressed: publishing ? null : _pickHeroImage, child: Text(heroImageFile.isEmpty ? 'Choose' : 'Change')),\n"
    "                  if (heroImageFile.isNotEmpty) IconButton(onPressed: publishing ? null : () => setState(() => heroImageFile = ''), icon: const Icon(Icons.close)),\n"
    "                ]),\n"
    "              ),\n"
    "            ),\n"
    "            const SizedBox(height: 8),\n",
    'Feed image upload UI',
)
write('feed_composer.dart', text)


# ---------------------------------------------------------------------------
# Points: actually continue a quoted purchase through the backend-selected rail.
# Google Play transactions are verified by the RRN backend before acknowledgement.
# Web checkout remains a deliberate fallback only when the server selects it.
# ---------------------------------------------------------------------------
text = read('points.dart')
if "import 'billing.dart';" not in text:
    text = text.replace("import 'core.dart';\n", "import 'billing.dart';\nimport 'core.dart';\nimport 'external_links.dart';\n", 1)
points_buy = r'''  Future<void> _buyPoints() async {
    final controller = TextEditingController(text: '100');
    final requested = await showDialog<int>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Buy RRN points'),
        content: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Text('1 point = \$0.01 of RRN value. The server chooses the valid payment rail for this Android build.'),
          const SizedBox(height: 12),
          TextField(controller: controller, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Points')),
        ]),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          FilledButton(onPressed: () => Navigator.pop(context, int.tryParse(controller.text.trim())), child: const Text('Continue')),
        ],
      ),
    );
    controller.dispose();
    if (requested == null || requested <= 0 || !mounted) return;

    final app = RrnScope.of(context);
    try {
      Map<String, dynamic> quote;
      try {
        quote = await PointsService(app.api).quotePointPurchase(requested);
      } on ApiException catch (e) {
        if (e.status != 404 && e.status != 405) rethrow;
        final raw = await app.api.post('/points/purchase', body: {
          'points': requested,
          'platform': 'android',
          'quoteOnly': true,
        });
        if (raw is! Map) throw StateError('The RRN point-purchase quote was invalid.');
        quote = Map<String, dynamic>.from(raw);
      }

      final rail = str(quote['paymentRail'] ?? quote['payment_rail']).toLowerCase();
      final creditedPoints = numi(quote['creditedPoints'] ?? quote['points'], requested);
      final checkoutId = str(quote['checkoutId'] ?? quote['quoteId'] ?? quote['id']);
      final checkoutUrl = str(quote['checkoutUrl'] ?? quote['paymentUrl'] ?? quote['webCheckoutUrl'] ?? quote['url']);

      if (rail == 'google_play' || rail == 'googleplay' || rail == 'play') {
        final productId = str(
          quote['googlePlayProductId'] ?? quote['storeProductId'] ?? quote['providerProductId'] ?? quote['productId'],
        );
        final purchase = await RrnPlayBilling.instance.buyConsumable(productId);
        final idempotencyKey = 'android-${app.api.deviceId ?? 'device'}-${DateTime.now().microsecondsSinceEpoch}';
        dynamic confirmed;
        try {
          confirmed = await app.api.post('/points/purchase', body: {
            'points': creditedPoints,
            'platform': 'android',
            'paymentRail': 'google_play',
            'productId': productId,
            'purchaseToken': purchase.verificationData,
            'transactionId': purchase.transactionId,
            'idempotencyKey': idempotencyKey,
            if (checkoutId.isNotEmpty) 'quoteId': checkoutId,
          });
        } on ApiException catch (e) {
          if ((e.status != 404 && e.status != 405) || checkoutId.isEmpty) rethrow;
          confirmed = await PointsService(app.api).confirmPointPurchase(
            checkoutId,
            providerReceipt: purchase.verificationData,
          );
        }
        if (confirmed is Map && confirmed['ok'] == false) {
          throw StateError(str(confirmed['message'] ?? confirmed['error'], 'RRN could not verify this Google Play purchase.'));
        }
        await RrnPlayBilling.instance.complete(purchase);
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$creditedPoints RRN Points purchased and verified.')));
        setState(() => busy = true);
        await _load();
        return;
      }

      if (checkoutUrl.isNotEmpty) {
        await openExternalUrl(context, checkoutUrl);
        return;
      }

      // A sideload/beta backend may still deliberately use the secure RRN web
      // checkout. Play-distributed builds should normally receive google_play.
      await openExternalUrl(context, '$rrnBase/account/points');
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Could not start point purchase: $e')));
    }
  }
'''
text = regex_once(
    text,
    r"  Future<void> _buyPoints\(\) async \{.*?\n  \}\n\n  @override\n  Widget build",
    points_buy + "\n  @override\n  Widget build",
    'Points purchase flow',
)
write('points.dart', text)


# ---------------------------------------------------------------------------
# Store: quote natively, spend Points natively, use Play Billing when selected,
# and only fall back to secure web checkout when the backend explicitly requires it.
# ---------------------------------------------------------------------------
text = read('store_native.dart')
if "import 'billing.dart';" not in text:
    text = text.replace("import 'core.dart';\n", "import 'billing.dart';\nimport 'core.dart';\n", 1)
product_screen = r'''class RrnProductScreen extends StatefulWidget {
  final Map<String, dynamic> product;
  const RrnProductScreen({super.key, required this.product});

  @override
  State<RrnProductScreen> createState() => _RrnProductScreenState();
}

class _RrnProductScreenState extends State<RrnProductScreen> {
  bool purchasing = false;

  Future<void> _checkout() async {
    final app = RrnScope.of(context);
    final product = widget.product;
    final id = str(product['id']);
    if (id.isEmpty || purchasing) return;
    if (!app.auth.signedIn) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Sign in to complete RRN purchases.')));
      return;
    }
    setState(() => purchasing = true);
    try {
      final pointPrice = numi(product['pricePoints']);
      final canPoints = boolish(product['canPayWithPoints']) || pointPrice > 0;
      final rawQuote = await app.api.post('/checkout/quote', body: {
        'productId': id,
        'quantity': 1,
        'requestedPoints': canPoints ? pointPrice : 0,
      });
      if (rawQuote is! Map) throw StateError('RRN checkout did not return a quote.');
      final quote = Map<String, dynamic>.from(rawQuote);
      final quoteId = str(quote['quoteId'] ?? quote['id']);
      final rail = str(quote['paymentRail'] ?? quote['payment_rail']).toLowerCase();
      final pointsApplied = numi(quote['pointsApplied'] ?? quote['points_applied']);
      final cashRemainder = numi(quote['cashRemainderCents'] ?? quote['cash_remainder_cents'] ?? quote['totalCents']);
      final checkoutUrl = str(quote['checkoutUrl'] ?? quote['paymentUrl'] ?? quote['webCheckoutUrl'] ?? quote['url']);
      final idempotencyKey = 'android-${app.api.deviceId ?? 'device'}-${DateTime.now().microsecondsSinceEpoch}';

      if (quoteId.isNotEmpty && (rail == 'points' || (cashRemainder <= 0 && pointsApplied > 0))) {
        final result = await app.api.post('/checkout/confirm', body: {
          'quoteId': quoteId,
          'idempotencyKey': idempotencyKey,
          'pointsToSpend': pointsApplied,
          'paymentRail': 'points',
        });
        if (result is Map && result['ok'] == false) {
          throw StateError(str(result['message'] ?? result['error'], 'RRN Points checkout failed.'));
        }
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Purchase complete with RRN Points.')));
        return;
      }

      if (rail == 'google_play' || rail == 'googleplay' || rail == 'play') {
        final storeProductId = str(
          quote['googlePlayProductId'] ?? quote['storeProductId'] ?? quote['providerProductId'] ?? product['googlePlayProductId'],
        );
        final purchase = await RrnPlayBilling.instance.buyConsumable(storeProductId);
        final result = await app.api.post('/checkout/confirm', body: {
          'quoteId': quoteId,
          'idempotencyKey': idempotencyKey,
          'pointsToSpend': pointsApplied,
          'paymentRail': 'google_play',
          'providerToken': purchase.verificationData,
          'providerTransactionId': purchase.transactionId,
          'providerProductId': storeProductId,
        });
        if (result is Map && result['ok'] == false) {
          throw StateError(str(result['message'] ?? result['error'], 'RRN could not verify this Google Play purchase.'));
        }
        await RrnPlayBilling.instance.complete(purchase);
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Google Play purchase verified by RRN.')));
        return;
      }

      if (checkoutUrl.isNotEmpty) {
        await openExternalUrl(context, checkoutUrl);
        return;
      }

      // Physical/service or alternative-provider checkout can remain on the
      // secure RRN website when the server does not expose a native rail.
      await openExternalUrl(context, '$rrnBase/checkout/$id');
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Checkout could not start: $e')));
    } finally {
      if (mounted) setState(() => purchasing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final product = widget.product;
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
            onPressed: purchasing ? null : _checkout,
            icon: purchasing
                ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                : const Icon(Icons.lock_outline),
            label: Text(purchasing ? 'Preparing secure checkout…' : 'Checkout'),
          ),
          const SizedBox(height: 8),
          if (canPoints)
            const Text(
              'RRN Points and split-tender eligibility are calculated by the server. If Points fully cover the quote, the purchase completes natively.',
              style: TextStyle(color: Colors.white54, fontSize: 11),
            ),
          const SizedBox(height: 10),
          OutlinedButton.icon(
            onPressed: () => openExternalUrl(context, '$rrnBase/account/points'),
            icon: const Icon(Icons.toll),
            label: const Text('Manage RRN Points'),
          ),
        ],
      ),
    );
  }
}
'''
text = regex_once(
    text,
    r"class RrnProductScreen extends StatelessWidget \{.*\Z",
    product_screen,
    'native quoted Store checkout',
)
write('store_native.dart', text)


# ---------------------------------------------------------------------------
# Android system media hardening: avoid repeated artwork requests, decode bounded
# notification bitmaps, do not resurrect a disconnected sticky mirror service,
# and reduce idle update churn. audio_service remains the playback authority.
# ---------------------------------------------------------------------------
text = read('system_media.dart')
text = replace_once(
    text,
    "    _positionTicker = Timer.periodic(const Duration(seconds: 3), (_) {\n      if (playback.hasItem) _publish(positionTick: true);\n    });\n",
    "    _positionTicker = Timer.periodic(const Duration(seconds: 5), (_) {\n"
    "      if (playback.hasItem && playback.playing && !playback.live) {\n"
    "        _publish(positionTick: true);\n"
    "      }\n"
    "    });\n",
    'system media idle ticker reduction',
)
write('system_media.dart', text)

if not ANDROID.exists():
    raise SystemExit('v0.10 patch failed: generated Android MainActivity.kt missing')
text = ANDROID.read_text()
text = replace_once(
    text,
    "    private var currentArtwork: Bitmap? = null\n",
    "    private var currentArtwork: Bitmap? = null\n    private var artworkRequestUrl = \"\"\n",
    'Android artwork request state',
)
text = replace_once(
    text,
    "        if (oldArtwork != artworkUrl) currentArtwork = null\n",
    "        if (oldArtwork != artworkUrl) {\n"
    "            currentArtwork = null\n"
    "            artworkRequestUrl = \"\"\n"
    "        }\n",
    'Android artwork state reset',
)
text = replace_once(
    text,
    "        // Playback is an explicit persistent user-visible foreground task. If\n"
    "        // Android reclaims the process, request service recreation instead of\n"
    "        // silently dropping the media surface.\n"
    "        return START_STICKY\n",
    "        // This service mirrors the authoritative audio_service session. Do not\n"
    "        // resurrect a disconnected mirror after process death with no Flutter\n"
    "        // command channel; the authoritative playback service will republish it.\n"
    "        if (intent == null) {\n"
    "            removeSurface()\n"
    "            return START_NOT_STICKY\n"
    "        }\n"
    "        return START_NOT_STICKY\n",
    'non-sticky mirror service',
)
text = regex_once(
    text,
    r"    private fun maybeLoadArtwork\(\) \{.*?\n    \}\n\n    private fun createNotificationChannel",
    r'''    private fun maybeLoadArtwork() {
        val requested = artworkUrl
        if (requested.isBlank() || currentArtwork != null || !requested.startsWith("http")) return
        if (artworkRequestUrl == requested) return
        artworkRequestUrl = requested
        artworkExecutor.execute {
            val bitmap = loadBoundedArtwork(requested)
            mainHandler.post {
                if (artworkRequestUrl == requested) artworkRequestUrl = ""
                if (bitmap != null && artworkUrl == requested) {
                    currentArtwork = bitmap
                    publishSessionState()
                    try {
                        getSystemService(NotificationManager::class.java).notify(NOTIFICATION_ID, buildNotification())
                    } catch (_: Throwable) {
                    }
                }
            }
        }
    }

    private fun openArtwork(url: String) = URL(url).openConnection().apply {
        connectTimeout = 5000
        readTimeout = 5000
        useCaches = true
    }.getInputStream()

    private fun loadBoundedArtwork(url: String): Bitmap? {
        return try {
            val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
            openArtwork(url).use { BitmapFactory.decodeStream(it, null, bounds) }
            if (bounds.outWidth <= 0 || bounds.outHeight <= 0) return null
            var sample = 1
            while (bounds.outWidth / sample > 768 || bounds.outHeight / sample > 768) {
                sample *= 2
            }
            val options = BitmapFactory.Options().apply {
                inSampleSize = sample.coerceAtLeast(1)
                inPreferredConfig = Bitmap.Config.RGB_565
            }
            val decoded = openArtwork(url).use { BitmapFactory.decodeStream(it, null, options) } ?: return null
            val maxSide = maxOf(decoded.width, decoded.height)
            if (maxSide <= 768) return decoded
            val scale = 768.0 / maxSide.toDouble()
            Bitmap.createScaledBitmap(
                decoded,
                (decoded.width * scale).roundToInt().coerceAtLeast(1),
                (decoded.height * scale).roundToInt().coerceAtLeast(1),
                true,
            ).also { scaled ->
                if (scaled !== decoded) decoded.recycle()
            }
        } catch (_: Throwable) {
            null
        }
    }

    private fun createNotificationChannel''',
    'bounded Android artwork loader',
)
ANDROID.write_text(text)

print('RRN Mobile v0.10 launch hardening applied.')
