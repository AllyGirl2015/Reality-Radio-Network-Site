import 'package:flutter/material.dart';

import 'account.dart';
import 'api_client_extensions.dart';
import 'core.dart';

class RrnFeedComposerScreen extends StatefulWidget {
  const RrnFeedComposerScreen({super.key});

  @override
  State<RrnFeedComposerScreen> createState() => _RrnFeedComposerScreenState();
}

class _RrnFeedComposerScreenState extends State<RrnFeedComposerScreen> {
  final title = TextEditingController();
  final summary = TextEditingController();
  final body = TextEditingController();
  final tags = TextEditingController();
  final heroImageUrl = TextEditingController();
  final embedUrl = TextEditingController();

  List<Map<String, dynamic>> identities = [];
  String identityKey = '';
  String postType = 'post';
  bool commentsEnabled = true;
  bool reactionsEnabled = true;
  bool displayTimer = false;
  bool scheduled = false;
  bool busy = true;
  bool publishing = false;
  String? error;
  DateTime? publishAt;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (busy && identities.isEmpty && error == null) _load();
  }

  @override
  void dispose() {
    title.dispose();
    summary.dispose();
    body.dispose();
    tags.dispose();
    heroImageUrl.dispose();
    embedUrl.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    final app = RrnScope.of(context);
    if (!app.auth.signedIn) {
      busy = false;
      if (mounted) setState(() {});
      return;
    }
    setState(() {
      busy = true;
      error = null;
    });
    try {
      final result = await app.api.get('/feed/posting-identities');
      identities = listFrom(result, const ['items'])
          .whereType<Map>()
          .map((e) => Map<String, dynamic>.from(e))
          .toList();
      if (identities.isNotEmpty) {
        identityKey = str(identities.first['key']);
        final types = _allowedTypes(identities.first);
        if (types.isNotEmpty) postType = types.first;
      }
    } catch (e) {
      error = '$e';
    } finally {
      busy = false;
      if (mounted) setState(() {});
    }
  }

  List<String> _allowedTypes(Map<String, dynamic> identity) =>
      listFrom(identity['allowedTypes'] ?? identity['allowed_types'])
          .map(str)
          .where((e) => e.isNotEmpty)
          .toList();

  Map<String, dynamic>? get selectedIdentity {
    for (final item in identities) {
      if (str(item['key']) == identityKey) return item;
    }
    return identities.isEmpty ? null : identities.first;
  }

  Future<void> _ensureSignedIn() async {
    await Navigator.push(context, MaterialPageRoute(builder: (_) => const AccountScreen()));
    if (mounted) await _load();
  }

  Future<void> _pickSchedule() async {
    final now = DateTime.now();
    final base = publishAt ?? now.add(const Duration(hours: 1));
    final date = await showDatePicker(
      context: context,
      initialDate: base,
      firstDate: now,
      lastDate: now.add(const Duration(days: 730)),
    );
    if (date == null || !mounted) return;
    final time = await showTimePicker(context: context, initialTime: TimeOfDay.fromDateTime(base));
    if (time == null) return;
    setState(() {
      publishAt = DateTime(date.year, date.month, date.day, time.hour, time.minute);
      scheduled = true;
    });
  }

  String _localWallTime(DateTime value) =>
      '${value.year.toString().padLeft(4, '0')}-${value.month.toString().padLeft(2, '0')}-${value.day.toString().padLeft(2, '0')}T${value.hour.toString().padLeft(2, '0')}:${value.minute.toString().padLeft(2, '0')}';

  Future<void> _publish({bool draft = false}) async {
    final app = RrnScope.of(context);
    if (!app.auth.signedIn) {
      await _ensureSignedIn();
      if (!app.auth.signedIn) return;
    }
    if (identityKey.isEmpty || postType.isEmpty) {
      setState(() => error = 'Choose a publishing identity and post type.');
      return;
    }
    if (title.text.trim().length < 2 || body.text.trim().isEmpty) {
      setState(() => error = 'A title and post body are required.');
      return;
    }
    if (scheduled && publishAt == null && !draft) {
      setState(() => error = 'Choose the scheduled publication date and time.');
      return;
    }

    setState(() {
      publishing = true;
      error = null;
    });
    try {
      final fields = <String, String>{
        'identityKey': identityKey,
        'postType': postType,
        'title': title.text.trim(),
        'summary': summary.text.trim(),
        'body': body.text.trim(),
        'tags': tags.text.trim(),
        'heroImageUrl': heroImageUrl.text.trim(),
        'embedUrl': embedUrl.text.trim(),
        'scheduleTimezone': 'America/Chicago',
        'publishMode': draft ? 'draft' : 'publish',
        if (commentsEnabled) 'commentsEnabled': 'on',
        if (reactionsEnabled) 'reactionsEnabled': 'on',
        if (displayTimer && scheduled) 'displayTimer': 'on',
        if (scheduled && publishAt != null) 'publishAt': _localWallTime(publishAt!),
      };
      if (displayTimer && scheduled && publishAt != null) {
        fields['visibleAt'] = _localWallTime(DateTime.now());
      }
      await app.api.postForm('/feed/publish', fields: fields);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(draft ? 'Feed draft saved.' : scheduled ? 'Feed post scheduled.' : 'Feed post published.')),
      );
      Navigator.pop(context, true);
    } catch (e) {
      setState(() => error = '$e');
    } finally {
      publishing = false;
      if (mounted) setState(() {});
    }
  }

  @override
  Widget build(BuildContext context) {
    final app = RrnScope.of(context);
    final identity = selectedIdentity;
    final types = identity == null ? const <String>[] : _allowedTypes(identity);
    return Scaffold(
      appBar: AppBar(title: const Text('Create RRN Feed Post')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 14, 16, 100),
        children: [
          const RrnSectionHeader(
            eyebrow: 'RRN Feed',
            title: 'Publish from the app.',
            subtitle: 'Choose the exact RRN posting front, write the post, and publish now or schedule it on the same Feed system used by RealityRadio.net.',
          ),
          const SizedBox(height: 16),
          if (!app.auth.signedIn)
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  const Text('Sign in to publish', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
                  const SizedBox(height: 7),
                  const Text('Your available RRN, station, artist, persona, label, and member posting fronts are account-specific.'),
                  const SizedBox(height: 10),
                  FilledButton.icon(onPressed: _ensureSignedIn, icon: const Icon(Icons.login), label: const Text('Sign in')),
                ]),
              ),
            ),
          if (busy) const Center(child: Padding(padding: EdgeInsets.all(30), child: CircularProgressIndicator())),
          if (!busy && error != null)
            Card(child: Padding(padding: const EdgeInsets.all(14), child: Text(error!, style: const TextStyle(color: Color(0xFFFCA5A5))))),
          if (!busy && app.auth.signedIn && identities.isEmpty && error == null)
            const Card(child: Padding(padding: EdgeInsets.all(16), child: Text('This account has no Feed publishing identities available.'))),
          if (!busy && identities.isNotEmpty) ...[
            DropdownButtonFormField<String>(
              initialValue: identityKey.isEmpty ? null : identityKey,
              decoration: const InputDecoration(labelText: 'Post as'),
              items: identities.map((item) {
                final label = str(item['label'], 'RRN identity');
                final subtitle = str(item['subtitle']);
                return DropdownMenuItem(
                  value: str(item['key']),
                  child: Text(subtitle.isEmpty ? label : '$label · $subtitle', overflow: TextOverflow.ellipsis),
                );
              }).toList(),
              onChanged: (value) {
                if (value == null) return;
                final next = identities.firstWhere((item) => str(item['key']) == value);
                final nextTypes = _allowedTypes(next);
                setState(() {
                  identityKey = value;
                  if (!nextTypes.contains(postType)) postType = nextTypes.isEmpty ? 'post' : nextTypes.first;
                });
              },
            ),
            const SizedBox(height: 10),
            DropdownButtonFormField<String>(
              initialValue: types.contains(postType) ? postType : (types.isEmpty ? null : types.first),
              decoration: const InputDecoration(labelText: 'Post type'),
              items: types.map((value) => DropdownMenuItem(value: value, child: Text(value.toUpperCase()))).toList(),
              onChanged: (value) => setState(() => postType = value ?? postType),
            ),
            const SizedBox(height: 10),
            TextField(controller: title, maxLength: 180, decoration: const InputDecoration(labelText: 'Title')),
            const SizedBox(height: 8),
            TextField(controller: summary, maxLength: 1000, minLines: 2, maxLines: 4, decoration: const InputDecoration(labelText: 'Summary', hintText: 'Optional short Feed-card summary')),
            const SizedBox(height: 8),
            TextField(controller: body, minLines: 7, maxLines: 18, decoration: const InputDecoration(labelText: 'Post body')),
            const SizedBox(height: 8),
            TextField(controller: tags, decoration: const InputDecoration(labelText: 'Tags', hintText: 'radio, release, RRN')),
            const SizedBox(height: 8),
            TextField(controller: heroImageUrl, keyboardType: TextInputType.url, decoration: const InputDecoration(labelText: 'Hero image URL', hintText: 'Optional HTTPS image')),
            const SizedBox(height: 8),
            TextField(controller: embedUrl, keyboardType: TextInputType.url, decoration: const InputDecoration(labelText: 'Embed URL', hintText: 'Optional supported media embed')),
            const SizedBox(height: 10),
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('Schedule publication'),
              subtitle: Text(publishAt == null ? 'Publish immediately' : 'Scheduled: ${publishAt!.toLocal()} · RRN Central time contract'),
              value: scheduled,
              onChanged: (value) async {
                if (!value) {
                  setState(() {
                    scheduled = false;
                    publishAt = null;
                    displayTimer = false;
                  });
                } else {
                  await _pickSchedule();
                }
              },
            ),
            if (scheduled)
              Row(children: [
                Expanded(child: OutlinedButton.icon(onPressed: _pickSchedule, icon: const Icon(Icons.schedule), label: const Text('Change date / time'))),
                const SizedBox(width: 8),
                Expanded(
                  child: SwitchListTile(
                    contentPadding: EdgeInsets.zero,
                    title: const Text('Countdown'),
                    value: displayTimer,
                    onChanged: (value) => setState(() => displayTimer = value),
                  ),
                ),
              ]),
            Row(children: [
              Expanded(child: SwitchListTile(contentPadding: EdgeInsets.zero, title: const Text('Comments'), value: commentsEnabled, onChanged: (value) => setState(() => commentsEnabled = value))),
              Expanded(child: SwitchListTile(contentPadding: EdgeInsets.zero, title: const Text('Reactions'), value: reactionsEnabled, onChanged: (value) => setState(() => reactionsEnabled = value))),
            ]),
            if (error != null) Padding(padding: const EdgeInsets.only(bottom: 10), child: Text(error!, style: const TextStyle(color: Color(0xFFFCA5A5)))),
            Row(children: [
              Expanded(child: OutlinedButton(onPressed: publishing ? null : () => _publish(draft: true), child: const Text('Save Draft'))),
              const SizedBox(width: 10),
              Expanded(
                child: FilledButton.icon(
                  onPressed: publishing ? null : _publish,
                  icon: publishing ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2)) : Icon(scheduled ? Icons.schedule_send : Icons.publish),
                  label: Text(scheduled ? 'Schedule' : 'Publish'),
                ),
              ),
            ]),
          ],
        ],
      ),
    );
  }
}
