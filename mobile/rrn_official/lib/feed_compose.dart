import 'package:flutter/material.dart';

import 'account.dart';
import 'core.dart';

class FeedComposeScreen extends StatefulWidget {
  const FeedComposeScreen({super.key});

  @override
  State<FeedComposeScreen> createState() => _FeedComposeScreenState();
}

class _FeedComposeScreenState extends State<FeedComposeScreen> {
  final title = TextEditingController();
  final summary = TextEditingController();
  final body = TextEditingController();
  final heroImage = TextEditingController();
  final tags = TextEditingController();

  List<Map<String, dynamic>> identities = [];
  Map<String, dynamic>? selectedIdentity;
  String postType = 'post';
  bool loading = true;
  bool publishing = false;
  bool displayTimer = true;
  DateTime? publishAt;
  String? error;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (loading && identities.isEmpty && error == null) _loadIdentities();
  }

  @override
  void dispose() {
    title.dispose();
    summary.dispose();
    body.dispose();
    heroImage.dispose();
    tags.dispose();
    super.dispose();
  }

  Future<void> _loadIdentities() async {
    final app = RrnScope.of(context);
    if (!app.auth.signedIn) {
      await Navigator.push(context, MaterialPageRoute(builder: (_) => const AccountScreen()));
      if (!app.auth.signedIn) {
        if (mounted) Navigator.pop(context);
        return;
      }
    }

    setState(() {
      loading = true;
      error = null;
    });
    try {
      final raw = await app.api.get('/feed/posting-identities');
      final rows = listFrom(raw, const ['identities', 'items', 'postingIdentities']);
      identities = rows.whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList();
      if (identities.isEmpty && raw is Map) {
        for (final key in const ['network', 'rrn', 'artists', 'personas', 'stations', 'labels', 'users']) {
          for (final row in listFrom(raw[key])) {
            if (row is Map) identities.add(Map<String, dynamic>.from(row));
          }
        }
      }
      if (identities.isNotEmpty) selectedIdentity = identities.first;
    } catch (e) {
      error = '$e';
    } finally {
      loading = false;
      if (mounted) setState(() {});
    }
  }

  String _identityType(Map<String, dynamic> m) => str(
        m['type'] ?? m['identityType'] ?? m['identity_type'] ?? m['authorType'] ?? m['author_type'],
        'user',
      ).toLowerCase();

  String _identityId(Map<String, dynamic> m) => str(
        m['id'] ?? m['identityId'] ?? m['identity_id'] ?? m['authorId'] ?? m['author_id'] ?? m['slug'],
      );

  String _identityName(Map<String, dynamic> m) => str(
        m['name'] ?? m['displayName'] ?? m['display_name'] ?? m['label'] ?? m['title'],
        'RRN Identity',
      );

  Future<void> _pickSchedule() async {
    final now = DateTime.now();
    final date = await showDatePicker(
      context: context,
      firstDate: now,
      lastDate: now.add(const Duration(days: 730)),
      initialDate: publishAt ?? now.add(const Duration(days: 1)),
    );
    if (date == null || !mounted) return;
    final time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(publishAt ?? now.add(const Duration(hours: 1))),
    );
    if (time == null) return;
    setState(() {
      publishAt = DateTime(date.year, date.month, date.day, time.hour, time.minute);
    });
  }

  Future<void> _publish() async {
    if (publishing) return;
    final identity = selectedIdentity;
    if (identity == null) {
      setState(() => error = 'Choose a posting identity.');
      return;
    }
    if (title.text.trim().isEmpty && body.text.trim().isEmpty) {
      setState(() => error = 'Add a title or post body first.');
      return;
    }

    final type = _identityType(identity);
    final id = _identityId(identity);
    final publishIso = publishAt?.toUtc().toIso8601String();
    final tagList = tags.text
        .split(',')
        .map((e) => e.trim())
        .where((e) => e.isNotEmpty)
        .toList();

    setState(() {
      publishing = true;
      error = null;
    });
    try {
      final payload = <String, dynamic>{
        'title': title.text.trim(),
        'summary': summary.text.trim(),
        'body': body.text.trim(),
        'postType': postType,
        'post_type': postType,
        'heroImageUrl': heroImage.text.trim(),
        'hero_image_url': heroImage.text.trim(),
        'tags': tagList,
        'authorType': type,
        'author_type': type,
        'authorId': id,
        'author_id': id,
        'identityType': type,
        'identityId': id,
        'identity': {'type': type, 'id': id},
        if (publishIso != null) 'publishAt': publishIso,
        if (publishIso != null) 'publish_at': publishIso,
        'displayTimer': displayTimer,
        'display_timer': displayTimer,
        'source': 'rrn-mobile',
      };
      final response = await RrnScope.of(context).api.post('/feed/publish', body: payload);
      final message = response is Map ? str(response['message'], 'Post published.') : 'Post published.';
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
      Navigator.pop(context, true);
    } catch (e) {
      setState(() => error = '$e');
    } finally {
      publishing = false;
      if (mounted) setState(() {});
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: const Text('Create Feed Post')),
        body: loading
            ? const Center(child: CircularProgressIndicator())
            : ListView(
                padding: const EdgeInsets.fromLTRB(16, 14, 16, 100),
                children: [
                  const RrnSectionHeader(
                    eyebrow: 'RRN Feed',
                    title: 'Publish natively.',
                    subtitle: 'Post from any RRN identity your account is authorized to use, including network, station, artist, persona, label, or member fronts.',
                  ),
                  const SizedBox(height: 14),
                  if (error != null)
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(14),
                        child: Text(error!, style: const TextStyle(color: Color(0xFFFCA5A5))),
                      ),
                    ),
                  if (identities.isEmpty)
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          const Text('No posting identities were returned.', style: TextStyle(fontWeight: FontWeight.w900)),
                          const SizedBox(height: 6),
                          const Text('The app is connected to /api/app/v1/feed/posting-identities.'),
                          const SizedBox(height: 10),
                          FilledButton.tonal(onPressed: _loadIdentities, child: const Text('Retry')),
                        ]),
                      ),
                    )
                  else ...[
                    DropdownButtonFormField<Map<String, dynamic>>(
                      value: selectedIdentity,
                      decoration: const InputDecoration(labelText: 'Post as'),
                      items: identities
                          .map(
                            (m) => DropdownMenuItem(
                              value: m,
                              child: Text('${_identityName(m)} · ${_identityType(m).toUpperCase()}'),
                            ),
                          )
                          .toList(),
                      onChanged: (value) => setState(() => selectedIdentity = value),
                    ),
                    const SizedBox(height: 10),
                    DropdownButtonFormField<String>(
                      value: postType,
                      decoration: const InputDecoration(labelText: 'Post type'),
                      items: const [
                        DropdownMenuItem(value: 'post', child: Text('Post')),
                        DropdownMenuItem(value: 'announcement', child: Text('Announcement')),
                        DropdownMenuItem(value: 'article', child: Text('Article')),
                        DropdownMenuItem(value: 'release', child: Text('Release')),
                        DropdownMenuItem(value: 'event', child: Text('Event / update')),
                      ],
                      onChanged: (value) => setState(() => postType = value ?? 'post'),
                    ),
                    const SizedBox(height: 10),
                    TextField(controller: title, decoration: const InputDecoration(labelText: 'Title')),
                    const SizedBox(height: 10),
                    TextField(controller: summary, minLines: 2, maxLines: 4, decoration: const InputDecoration(labelText: 'Summary')),
                    const SizedBox(height: 10),
                    TextField(controller: body, minLines: 6, maxLines: 18, decoration: const InputDecoration(labelText: 'Post body')),
                    const SizedBox(height: 10),
                    TextField(controller: heroImage, keyboardType: TextInputType.url, decoration: const InputDecoration(labelText: 'Hero image URL (optional)')),
                    const SizedBox(height: 10),
                    TextField(controller: tags, decoration: const InputDecoration(labelText: 'Tags', hintText: 'radio, release, chart')),
                    const SizedBox(height: 12),
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(12),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(children: [
                              const Expanded(child: Text('Publication timing', style: TextStyle(fontWeight: FontWeight.w900))),
                              TextButton(onPressed: _pickSchedule, child: Text(publishAt == null ? 'Schedule' : 'Change')),
                              if (publishAt != null) IconButton(onPressed: () => setState(() => publishAt = null), icon: const Icon(Icons.clear)),
                            ]),
                            Text(
                              publishAt == null ? 'Publish immediately' : 'Scheduled for ${publishAt!.toLocal()}',
                              style: const TextStyle(color: Colors.white70),
                            ),
                            if (publishAt != null)
                              SwitchListTile(
                                contentPadding: EdgeInsets.zero,
                                title: const Text('Show countdown / scheduled preview'),
                                value: displayTimer,
                                onChanged: (value) => setState(() => displayTimer = value),
                              ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    FilledButton.icon(
                      onPressed: publishing ? null : _publish,
                      icon: publishing
                          ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                          : const Icon(Icons.publish),
                      label: Text(publishAt == null ? 'Publish Post' : 'Schedule Post'),
                    ),
                  ],
                ],
              ),
      );
}
