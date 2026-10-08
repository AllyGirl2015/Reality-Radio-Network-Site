import 'package:flutter/material.dart';

import 'account.dart';
import 'core.dart';
import 'site.dart';

class ChartsScreen extends StatefulWidget {
  const ChartsScreen({super.key});
  @override
  State<ChartsScreen> createState() => _ChartsScreenState();
}

class _ChartsScreenState extends State<ChartsScreen> {
  List<dynamic> charts = [];
  bool busy = false;
  String? error;
  bool loaded = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!loaded) {
      loaded = true;
      _load();
    }
  }

  Future<void> _load() async {
    setState(() => busy = true);
    try {
      final body = await RrnScope.of(context).api.get('/charts');
      charts = listFrom(body, const ['charts']);
      error = null;
    } catch (e) {
      error = '$e';
    } finally {
      busy = false;
      if (mounted) setState(() {});
    }
  }

  Future<bool> _ensureAuth() async {
    final app = RrnScope.of(context);
    if (app.auth.signedIn) return true;
    await Navigator.push(context, MaterialPageRoute(builder: (_) => const AccountScreen()));
    return app.auth.signedIn;
  }

  Future<void> _createChart() async {
    if (!await _ensureAuth()) return;
    final result = await Navigator.push<bool>(context, MaterialPageRoute(builder: (_) => const CreateChartScreen()));
    if (result == true) await _load();
  }

  @override
  Widget build(BuildContext context) => RefreshIndicator(
        onRefresh: _load,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(14, 16, 14, 140),
          children: [
            const RrnSectionHeader(
              eyebrow: 'Reality Charts',
              title: 'Community-owned charts.',
              subtitle: 'Browse, vote, nominate, create and manage charts from the same RRN chart system used by RealityRadio.net.',
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: FilledButton.icon(
                    onPressed: _createChart,
                    icon: const Icon(Icons.add_chart),
                    label: const Text('Create Chart'),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const MatrixPageScreen(path: '/charts/manage', title: 'My Charts'))),
                    icon: const Icon(Icons.tune),
                    label: const Text('My Charts'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            if (busy) const Center(child: Padding(padding: EdgeInsets.all(26), child: CircularProgressIndicator())),
            if (error != null)
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(14),
                  child: Text(error!, style: const TextStyle(color: Colors.white60)),
                ),
              ),
            ...charts.map((raw) {
              final m = raw is Map ? Map<String, dynamic>.from(raw) : <String, dynamic>{};
              final title = str(m['title'] ?? m['name'], 'Reality Chart');
              final slug = str(m['slug'] ?? m['id']);
              final description = str(m['description'] ?? m['summary']);
              final updated = str(m['updatedAt'] ?? m['updated_at']);
              final owner = str(m['creatorName'] ?? m['creator_name'] ?? m['ownerName'] ?? m['owner_name']);
              final type = str(m['type'] ?? m['chartType'] ?? m['chart_type']);
              return Card(
                child: ListTile(
                  leading: const CircleAvatar(backgroundColor: Color(0xFF201135), child: Icon(Icons.leaderboard, color: rrnPurple)),
                  title: Text(title, style: const TextStyle(fontWeight: FontWeight.w900)),
                  subtitle: Text(
                    [description, if (owner.isNotEmpty) 'By $owner', type, updated].where((e) => e.isNotEmpty).join('\n'),
                    maxLines: 4,
                    overflow: TextOverflow.ellipsis,
                  ),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: slug.isEmpty ? null : () => Navigator.push(context, MaterialPageRoute(builder: (_) => ChartDetailScreen(slug: slug, title: title))),
                ),
              );
            }),
            if (!busy && charts.isEmpty && error == null)
              const Card(child: Padding(padding: EdgeInsets.all(16), child: Text('No charts were returned by the RRN Matrix.'))),
          ],
        ),
      );
}

class CreateChartScreen extends StatefulWidget {
  const CreateChartScreen({super.key});

  @override
  State<CreateChartScreen> createState() => _CreateChartScreenState();
}

class _CreateChartScreenState extends State<CreateChartScreen> {
  final title = TextEditingController();
  final description = TextEditingController();
  final slug = TextEditingController();
  final keywords = TextEditingController();
  String ownership = 'community';
  String visibility = 'public';
  String voting = 'open';
  bool nominations = true;
  bool busy = false;
  String? message;

  String _slugify(String value) => value
      .toLowerCase()
      .trim()
      .replaceAll(RegExp(r'[^a-z0-9]+'), '-')
      .replaceAll(RegExp(r'^-+|-+$'), '');

  Future<void> _submit() async {
    if (title.text.trim().isEmpty) {
      setState(() => message = 'Give the chart a title first.');
      return;
    }
    if (slug.text.trim().isEmpty) slug.text = _slugify(title.text);
    setState(() {
      busy = true;
      message = null;
    });
    try {
      final app = RrnScope.of(context);
      final body = await app.api.post('/charts', body: {
        'title': title.text.trim(),
        'name': title.text.trim(),
        'slug': slug.text.trim(),
        'description': description.text.trim(),
        'keywords': keywords.text
            .split(',')
            .map((e) => e.trim())
            .where((e) => e.isNotEmpty)
            .toList(),
        'ownershipType': ownership,
        'visibility': visibility,
        'votingMode': voting,
        'nominationsEnabled': nominations,
        'source': 'rrn-mobile',
      });
      final responseMessage = body is Map ? str(body['message']) : '';
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(responseMessage.isEmpty ? 'Chart created.' : responseMessage)));
      Navigator.pop(context, true);
    } catch (e) {
      setState(() => message = 'The native chart-creation bridge is not available for this account/server build yet: $e');
    } finally {
      busy = false;
      if (mounted) setState(() {});
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: const Text('Create Reality Chart')),
        body: ListView(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 100),
          children: [
            const RrnSectionHeader(
              eyebrow: 'Reality Charts',
              title: 'Create a chart.',
              subtitle: 'The mobile creator is designed to map to the same chart object and permission rules as the website.',
            ),
            const SizedBox(height: 16),
            TextField(
              controller: title,
              decoration: const InputDecoration(labelText: 'Chart title'),
              onChanged: (value) {
                if (slug.text.isEmpty || slug.text == _slugify(title.text.substring(0, title.text.length > value.length ? value.length : title.text.length))) {
                  slug.text = _slugify(value);
                }
              },
            ),
            const SizedBox(height: 10),
            TextField(controller: slug, decoration: const InputDecoration(labelText: 'Chart slug')),
            const SizedBox(height: 10),
            TextField(controller: description, minLines: 3, maxLines: 6, decoration: const InputDecoration(labelText: 'Description')),
            const SizedBox(height: 10),
            TextField(controller: keywords, decoration: const InputDecoration(labelText: 'Keywords / tags', hintText: 'soundtracks, nerdcore, rock')),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              initialValue: ownership,
              decoration: const InputDecoration(labelText: 'Ownership / context'),
              items: const [
                DropdownMenuItem(value: 'community', child: Text('Community')),
                DropdownMenuItem(value: 'personal', child: Text('Personal / user')),
                DropdownMenuItem(value: 'presenter', child: Text('Presenter')),
                DropdownMenuItem(value: 'station', child: Text('Station')),
                DropdownMenuItem(value: 'network', child: Text('Official RRN')),
              ],
              onChanged: (value) => setState(() => ownership = value ?? ownership),
            ),
            const SizedBox(height: 10),
            DropdownButtonFormField<String>(
              initialValue: visibility,
              decoration: const InputDecoration(labelText: 'Visibility'),
              items: const [
                DropdownMenuItem(value: 'public', child: Text('Public')),
                DropdownMenuItem(value: 'unlisted', child: Text('Unlisted')),
                DropdownMenuItem(value: 'private', child: Text('Private')),
              ],
              onChanged: (value) => setState(() => visibility = value ?? visibility),
            ),
            const SizedBox(height: 10),
            DropdownButtonFormField<String>(
              initialValue: voting,
              decoration: const InputDecoration(labelText: 'Voting'),
              items: const [
                DropdownMenuItem(value: 'open', child: Text('Open voting')),
                DropdownMenuItem(value: 'scheduled', child: Text('Scheduled voting')),
                DropdownMenuItem(value: 'manual', child: Text('Manual / owner managed')),
              ],
              onChanged: (value) => setState(() => voting = value ?? voting),
            ),
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('Allow nominations'),
              subtitle: const Text('Final eligibility and moderation remain server-controlled.'),
              value: nominations,
              onChanged: (value) => setState(() => nominations = value),
            ),
            if (message != null) Padding(padding: const EdgeInsets.symmetric(vertical: 10), child: Text(message!, style: const TextStyle(color: Colors.white70))),
            const SizedBox(height: 8),
            FilledButton.icon(
              onPressed: busy ? null : _submit,
              icon: busy ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2)) : const Icon(Icons.publish),
              label: const Text('Create Chart'),
            ),
            const SizedBox(height: 8),
            TextButton.icon(
              onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const MatrixPageScreen(path: '/charts/create', title: 'Chart Creator'))),
              icon: const Icon(Icons.account_tree_outlined),
              label: const Text('Open complete chart creator surface'),
            ),
          ],
        ),
      );
}

class ChartDetailScreen extends StatefulWidget {
  final String slug;
  final String title;
  const ChartDetailScreen({super.key, required this.slug, required this.title});

  @override
  State<ChartDetailScreen> createState() => _ChartDetailScreenState();
}

class _ChartDetailScreenState extends State<ChartDetailScreen> {
  Map<String, dynamic> chart = {};
  List<dynamic> entries = [];
  bool busy = true;
  String? message;
  bool loaded = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!loaded) {
      loaded = true;
      _load();
    }
  }

  Future<void> _load() async {
    setState(() => busy = true);
    try {
      final body = await RrnScope.of(context).api.get('/charts/${widget.slug}');
      if (body is Map) chart = Map<String, dynamic>.from(body);
      entries = listFrom(chart, const ['entries', 'ranking', 'candidates']);
    } catch (e) {
      message = '$e';
    } finally {
      busy = false;
      if (mounted) setState(() {});
    }
  }

  Future<bool> _ensureAuth() async {
    final app = RrnScope.of(context);
    if (app.auth.signedIn) return true;
    await Navigator.push(context, MaterialPageRoute(builder: (_) => const AccountScreen()));
    return app.auth.signedIn;
  }

  bool get _canManage {
    final value = chart['canManage'] ?? chart['can_manage'] ?? chart['editable'] ?? chart['isOwner'] ?? chart['is_owner'];
    if (boolish(value)) return true;
    final capabilities = listFrom(chart['capabilities']).map((e) => str(e).toLowerCase()).toSet();
    return capabilities.contains('manage') || capabilities.contains('edit') || capabilities.contains('owner');
  }

  Future<void> _vote(dynamic raw) async {
    if (!await _ensureAuth()) return;
    final app = RrnScope.of(context);
    final m = raw is Map ? Map<String, dynamic>.from(raw) : <String, dynamic>{};
    final id = str(m['id'] ?? m['candidateId'] ?? m['candidate_id'] ?? m['trackId'] ?? m['track_id']);
    if (id.isEmpty) return;
    try {
      final body = await app.api.post('/charts/${widget.slug}/vote', body: {'candidateId': id, 'entryId': id});
      message = body is Map ? str(body['message'], 'Vote recorded.') : 'Vote recorded.';
      await _load();
    } catch (e) {
      setState(() => message = '$e');
    }
  }

  Future<void> _nominate() async {
    if (!await _ensureAuth()) return;
    final controller = TextEditingController();
    final text = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Nominate a song'),
        content: TextField(controller: controller, autofocus: true, decoration: const InputDecoration(labelText: 'Track ID, URL, or title / artist')),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          FilledButton(onPressed: () => Navigator.pop(context, controller.text.trim()), child: const Text('Nominate')),
        ],
      ),
    );
    if (text == null || text.isEmpty) return;
    try {
      final body = await RrnScope.of(context).api.post('/charts/${widget.slug}/nominate', body: {'track': text, 'trackId': text, 'query': text});
      setState(() => message = body is Map ? str(body['message'], 'Nomination submitted.') : 'Nomination submitted.');
      await _load();
    } catch (e) {
      setState(() => message = '$e');
    }
  }

  void _manage() {
    Navigator.push(context, MaterialPageRoute(builder: (_) => MatrixPageScreen(path: '/charts/${widget.slug}/manage', title: '${widget.title} · Manage')));
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(
          title: Text(widget.title),
          actions: [
            IconButton(onPressed: _nominate, icon: const Icon(Icons.add_chart), tooltip: 'Nominate'),
            if (_canManage) IconButton(onPressed: _manage, icon: const Icon(Icons.settings), tooltip: 'Manage chart'),
          ],
        ),
        body: busy
            ? const Center(child: CircularProgressIndicator())
            : RefreshIndicator(
                onRefresh: _load,
                child: ListView(
                  padding: const EdgeInsets.fromLTRB(14, 14, 14, 100),
                  children: [
                    if (str(chart['description']).isNotEmpty) Text(str(chart['description']), style: const TextStyle(color: Colors.white70, height: 1.4)),
                    if (_canManage) ...[
                      const SizedBox(height: 10),
                      OutlinedButton.icon(onPressed: _manage, icon: const Icon(Icons.tune), label: const Text('Manage this chart')),
                    ],
                    if (message != null) Padding(padding: const EdgeInsets.symmetric(vertical: 10), child: Text(message!, style: const TextStyle(color: rrnCyan))),
                    ...entries.asMap().entries.map((indexed) {
                      final m = indexed.value is Map ? Map<String, dynamic>.from(indexed.value) : <String, dynamic>{};
                      final rank = numi(m['rank'] ?? m['position'], indexed.key + 1);
                      final title = str(m['title'] ?? m['trackTitle'] ?? m['track_title'] ?? m['name'], 'Entry');
                      final artist = str(m['artist'] ?? m['artistName'] ?? m['artist_name']);
                      final movement = str(m['movement'] ?? m['change']);
                      final weeks = numi(m['weeks'] ?? m['weeksOnChart'] ?? m['weeks_on_chart']);
                      return Card(
                        child: ListTile(
                          leading: CircleAvatar(backgroundColor: const Color(0xFF081B22), child: Text('$rank', style: const TextStyle(color: rrnCyan, fontWeight: FontWeight.w900))),
                          title: Text(title, style: const TextStyle(fontWeight: FontWeight.w800)),
                          subtitle: Text([artist, if (movement.isNotEmpty) movement, if (weeks > 0) '$weeks wk'].where((e) => e.isNotEmpty).join(' · ')),
                          trailing: FilledButton.tonal(onPressed: () => _vote(indexed.value), child: const Text('Vote')),
                        ),
                      );
                    }),
                  ],
                ),
              ),
      );
}
