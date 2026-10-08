import 'dart:convert';

import 'package:flutter/material.dart';

import 'core.dart';
import 'playback.dart';
import 'radio_storage.dart';
import 'site.dart';

String _stationSearchText(Station station) {
  final values = <String>[
    station.name,
    station.designation,
    station.band,
    station.frequency.toStringAsFixed(3),
    station.tagline,
    station.description,
    station.location,
    station.status,
    ...station.capabilities,
    _flattenStationValue(station.raw),
  ];
  return values.join(' ').toLowerCase();
}

String _flattenStationValue(dynamic value) {
  if (value == null) return '';
  if (value is Map) return value.entries.map((e) => '${e.key} ${_flattenStationValue(e.value)}').join(' ');
  if (value is Iterable) return value.map(_flattenStationValue).join(' ');
  return '$value';
}

String _absoluteImage(String value) {
  if (value.isEmpty) return '';
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  return '$rrnBase${value.startsWith('/') ? value : '/$value'}';
}

class StationDirectoryScreen extends StatefulWidget {
  final bool chooseForTune;
  const StationDirectoryScreen({super.key, this.chooseForTune = false});

  @override
  State<StationDirectoryScreen> createState() => _StationDirectoryScreenState();
}

class _StationDirectoryScreenState extends State<StationDirectoryScreen> {
  final search = TextEditingController();
  String band = 'ALL';
  String status = 'ALL';
  bool initialized = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (initialized) return;
    initialized = true;
    RrnScope.of(context).loadStations();
  }

  List<Station> get filtered {
    final app = RrnScope.of(context);
    final q = search.text.trim().toLowerCase();
    return app.stations.where((station) {
      if (band != 'ALL' && station.band != band) return false;
      if (status != 'ALL' && !_statusMatches(station, status)) return false;
      if (q.isNotEmpty && !_stationSearchText(station).contains(q)) return false;
      return true;
    }).toList()
      ..sort((a, b) {
        final bandCompare = a.band.compareTo(b.band);
        if (bandCompare != 0) return bandCompare;
        return a.frequency.compareTo(b.frequency);
      });
  }

  bool _statusMatches(Station station, String filter) {
    final s = station.status.toLowerCase();
    return switch (filter) {
      'LIVE' => s.contains('live') || s.contains('online') || s.contains('active'),
      'COMING' => s.contains('coming') || s.contains('planned') || s.contains('future'),
      'TESTING' => s.contains('test') || s.contains('beta'),
      'OFF AIR' => s.contains('off') || s.contains('offline') || s.contains('down'),
      _ => true,
    };
  }

  @override
  Widget build(BuildContext context) {
    final app = RrnScope.of(context);
    final rows = filtered;
    return Scaffold(
      appBar: AppBar(title: const Text('Station Directory')),
      body: RefreshIndicator(
        onRefresh: () async {
          await app.loadStations();
          if (mounted) setState(() {});
        },
        child: ListView(
          padding: const EdgeInsets.fromLTRB(14, 12, 14, 80),
          children: [
            const RrnSectionHeader(
              eyebrow: 'Reality Dial Directory',
              title: 'Every station. Every band.',
              subtitle: 'Search live, testing, off-air and coming-soon stations by name, frequency, designation, genre, format, keyword, location or anything else supplied by RRN.',
            ),
            const SizedBox(height: 14),
            TextField(
              controller: search,
              onChanged: (_) => setState(() {}),
              decoration: InputDecoration(
                labelText: 'Search stations',
                hintText: '201.5, RMP, rock, Reality Central…',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: search.text.isEmpty
                    ? null
                    : IconButton(
                        onPressed: () {
                          search.clear();
                          setState(() {});
                        },
                        icon: const Icon(Icons.clear),
                      ),
              ),
            ),
            const SizedBox(height: 10),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  for (final value in ['ALL', ...app.bands])
                    Padding(
                      padding: const EdgeInsets.only(right: 6),
                      child: ChoiceChip(
                        label: Text(value),
                        selected: band == value,
                        onSelected: (_) => setState(() => band = value),
                      ),
                    ),
                ],
              ),
            ),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  for (final value in const ['ALL', 'LIVE', 'COMING', 'TESTING', 'OFF AIR'])
                    Padding(
                      padding: const EdgeInsets.only(right: 6),
                      child: FilterChip(
                        label: Text(value),
                        selected: status == value,
                        onSelected: (_) => setState(() => status = value),
                      ),
                    ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: Text('${rows.length} station${rows.length == 1 ? '' : 's'}', style: const TextStyle(color: Colors.white54)),
            ),
            ...rows.map((station) => StationPreviewCard(
                  station: station,
                  onTune: () {
                    if (widget.chooseForTune) {
                      Navigator.pop(context, station);
                    } else {
                      Navigator.push(context, MaterialPageRoute(builder: (_) => StationPageScreen(station: station)));
                    }
                  },
                )),
            if (rows.isEmpty)
              const Card(
                child: Padding(
                  padding: EdgeInsets.all(18),
                  child: Text('No stations matched those filters.'),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class StationPreviewCard extends StatelessWidget {
  final Station station;
  final VoidCallback? onTune;
  const StationPreviewCard({super.key, required this.station, this.onTune});

  @override
  Widget build(BuildContext context) {
    final raw = station.raw;
    final genres = listFrom(raw['genres'] ?? raw['genre'] ?? raw['formats']).map(str).where((e) => e.isNotEmpty).toList();
    final keywords = listFrom(raw['keywords'] ?? raw['tags']).map(str).where((e) => e.isNotEmpty).toList();
    final status = station.status.isEmpty ? 'UNKNOWN' : station.status.toUpperCase();
    final art = _absoluteImage(station.artwork);
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: Padding(
        padding: const EdgeInsets.all(13),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(14),
              child: SizedBox(
                width: 78,
                height: 78,
                child: art.isNotEmpty
                    ? Image.network(art, fit: BoxFit.cover, errorBuilder: (_, __, ___) => const ColoredBox(color: Colors.black, child: Icon(Icons.radio, color: rrnCyan)))
                    : const ColoredBox(color: Colors.black, child: Icon(Icons.radio, color: rrnCyan)),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(child: Text(station.name, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w900))),
                      _StatusPill(status),
                    ],
                  ),
                  Text(
                    station.designation.isNotEmpty ? station.designation : '${station.frequency.toStringAsFixed(1)} ${station.band}',
                    style: const TextStyle(color: rrnCyan, fontWeight: FontWeight.w800),
                  ),
                  if (station.tagline.isNotEmpty) Text(station.tagline, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.white70)),
                  if (station.location.isNotEmpty) Text(station.location, style: const TextStyle(color: Colors.white54, fontSize: 11)),
                  if (genres.isNotEmpty || keywords.isNotEmpty) ...[
                    const SizedBox(height: 6),
                    Wrap(
                      spacing: 5,
                      runSpacing: 4,
                      children: [...genres, ...keywords].take(8).map((g) => Chip(label: Text(g, style: const TextStyle(fontSize: 10)), visualDensity: VisualDensity.compact)).toList(),
                    ),
                  ],
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 7,
                    runSpacing: 7,
                    children: [
                      FilledButton.tonalIcon(onPressed: onTune, icon: const Icon(Icons.radio), label: const Text('Tune')),
                      OutlinedButton.icon(
                        onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => StationPageScreen(station: station))),
                        icon: const Icon(Icons.open_in_new),
                        label: const Text('Station page'),
                      ),
                      OutlinedButton.icon(
                        onPressed: () => _saveStationDialog(context, station),
                        icon: const Icon(Icons.bookmark_add_outlined),
                        label: const Text('Save'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _StatusPill extends StatelessWidget {
  final String text;
  const _StatusPill(this.text);
  @override
  Widget build(BuildContext context) {
    final t = text.toLowerCase();
    final color = t.contains('live') || t.contains('active')
        ? const Color(0xFF34D399)
        : t.contains('coming')
            ? rrnPurple
            : t.contains('test')
                ? rrnCyan
                : Colors.white54;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(border: Border.all(color: color), borderRadius: BorderRadius.circular(99)),
      child: Text(text, style: TextStyle(color: color, fontSize: 9, fontWeight: FontWeight.w900)),
    );
  }
}

Future<void> _saveStationDialog(BuildContext context, Station station) async {
  final controller = TextEditingController();
  final nickname = await showDialog<String>(
    context: context,
    builder: (context) => AlertDialog(
      title: const Text('Save station'),
      content: TextField(
        controller: controller,
        decoration: InputDecoration(labelText: 'Nickname (optional)', hintText: station.name),
        autofocus: true,
      ),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
        FilledButton(onPressed: () => Navigator.pop(context, controller.text.trim()), child: const Text('Save')),
      ],
    ),
  );
  if (nickname == null || !context.mounted) return;
  await RadioUserStorage.saveStation(RrnScope.of(context), station, nickname: nickname);
  if (context.mounted) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('${nickname.isEmpty ? station.name : nickname} saved.')));
  }
}

class SavedStationsScreen extends StatefulWidget {
  const SavedStationsScreen({super.key});
  @override
  State<SavedStationsScreen> createState() => _SavedStationsScreenState();
}

class _SavedStationsScreenState extends State<SavedStationsScreen> {
  List<SavedStationRecord> saved = [];
  String band = 'ALL';
  bool loaded = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (loaded) return;
    loaded = true;
    _load();
  }

  Future<void> _load() async {
    final app = RrnScope.of(context);
    await RadioUserStorage.mergeServerSaved(app);
    saved = await RadioUserStorage.loadSaved(app);
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final app = RrnScope.of(context);
    final rows = saved.where((e) => band == 'ALL' || e.band == band).toList();
    return Scaffold(
      appBar: AppBar(title: const Text('Saved Stations')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(14, 12, 14, 80),
        children: [
          const RrnSectionHeader(
            eyebrow: 'Your Radio Library',
            title: 'Unlimited saved stations.',
            subtitle: 'Saved stations are organized by band. Give them your own nicknames and optionally assign any one to one of that band’s six quick presets.',
          ),
          const SizedBox(height: 12),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                for (final b in ['ALL', ...app.bands])
                  Padding(
                    padding: const EdgeInsets.only(right: 6),
                    child: ChoiceChip(label: Text(b), selected: band == b, onSelected: (_) => setState(() => band = b)),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          ...rows.map((record) => _savedCard(context, record)),
          if (rows.isEmpty)
            const Card(child: Padding(padding: EdgeInsets.all(18), child: Text('No saved stations in this band yet.'))),
        ],
      ),
    );
  }

  Widget _savedCard(BuildContext context, SavedStationRecord record) {
    final app = RrnScope.of(context);
    Station? station;
    for (final candidate in app.stations) {
      if ((record.stationId.isNotEmpty && candidate.id == record.stationId) ||
          (record.slug.isNotEmpty && candidate.slug == record.slug) ||
          (candidate.band == record.band && (candidate.frequency - record.frequency).abs() < .0001)) {
        station = candidate;
        break;
      }
    }
    final resolved = station;
    return Card(
      child: ListTile(
        leading: CircleAvatar(backgroundColor: rrnPanel2, child: Text(record.band, style: const TextStyle(fontSize: 10, color: rrnCyan, fontWeight: FontWeight.w900))),
        title: Text(record.displayName, style: const TextStyle(fontWeight: FontWeight.w900)),
        subtitle: Text('${record.frequency.toStringAsFixed(1)} ${record.band}${record.nickname.isNotEmpty ? ' · ${record.officialName}' : ''}'),
        onTap: resolved == null ? null : () => Navigator.push(context, MaterialPageRoute(builder: (_) => StationPageScreen(station: resolved))),
        trailing: PopupMenuButton<String>(
          onSelected: (value) async {
            if (value == 'rename') await _rename(record);
            if (value == 'preset') await _assignPreset(record);
            if (value == 'remove') {
              await RadioUserStorage.removeSaved(app, record);
              await _load();
            }
          },
          itemBuilder: (_) => const [
            PopupMenuItem(value: 'rename', child: Text('Rename')),
            PopupMenuItem(value: 'preset', child: Text('Assign preset')),
            PopupMenuItem(value: 'remove', child: Text('Remove')),
          ],
        ),
      ),
    );
  }

  Future<void> _rename(SavedStationRecord record) async {
    final controller = TextEditingController(text: record.nickname);
    final next = await showDialog<String>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Station nickname'),
        content: TextField(controller: controller, autofocus: true, decoration: InputDecoration(hintText: record.officialName)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          FilledButton(onPressed: () => Navigator.pop(context, controller.text.trim()), child: const Text('Save')),
        ],
      ),
    );
    if (next == null || !mounted) return;
    await RadioUserStorage.renameSaved(RrnScope.of(context), record, next);
    await _load();
  }

  Future<void> _assignPreset(SavedStationRecord record) async {
    final slot = await showModalBottomSheet<int>(
      context: context,
      builder: (_) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('${record.band} presets', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900)),
              const SizedBox(height: 12),
              Row(
                children: List.generate(6, (index) {
                  final slot = index + 1;
                  return Expanded(
                    child: Padding(
                      padding: const EdgeInsets.all(3),
                      child: FilledButton.tonal(onPressed: () => Navigator.pop(context, slot), child: Text('$slot')),
                    ),
                  );
                }),
              ),
            ],
          ),
        ),
      ),
    );
    if (slot == null || !mounted) return;
    await RadioUserStorage.savePreset(
      RrnScope.of(context),
      BandPreset(
        band: record.band,
        slot: slot,
        stationId: record.stationId,
        slug: record.slug,
        officialName: record.officialName,
        label: record.displayName,
        frequency: record.frequency,
      ),
    );
    if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('${record.displayName} assigned to ${record.band} preset $slot.')));
  }
}

class StationPageScreen extends StatefulWidget {
  final Station station;
  const StationPageScreen({super.key, required this.station});

  @override
  State<StationPageScreen> createState() => _StationPageScreenState();
}

class _StationPageScreenState extends State<StationPageScreen> {
  RadioMetadata metadata = const RadioMetadata();
  bool metadataBusy = true;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _loadMetadata();
  }

  Future<void> _loadMetadata() async {
    try {
      final app = RrnScope.of(context);
      final body = await app.api.get('/radio/state', query: {
        if (widget.station.id.isNotEmpty) 'stationId': widget.station.id,
        if (widget.station.slug.isNotEmpty) 'slug': widget.station.slug,
      });
      metadata = RadioMetadata.from(body);
    } catch (_) {}
    metadataBusy = false;
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final s = widget.station;
    final art = _absoluteImage(s.artwork);
    final raw = s.raw;
    final genres = listFrom(raw['genres'] ?? raw['genre'] ?? raw['formats']).map(str).where((e) => e.isNotEmpty).toList();
    final presenters = listFrom(raw['presenters'] ?? raw['hosts']).map((e) => e is Map ? str(e['name'] ?? e['displayName']) : str(e)).where((e) => e.isNotEmpty).toList();
    final designation = s.designation.isNotEmpty ? s.designation : '${s.frequency.toStringAsFixed(1)} ${s.band}';
    return Scaffold(
      appBar: AppBar(title: Text(s.name)),
      body: RefreshIndicator(
        onRefresh: _loadMetadata,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 100),
          children: [
            if (art.isNotEmpty)
              ClipRRect(
                borderRadius: BorderRadius.circular(26),
                child: Image.network(art, height: 230, fit: BoxFit.cover, errorBuilder: (_, __, ___) => const SizedBox.shrink()),
              ),
            const SizedBox(height: 14),
            Row(children: [Expanded(child: GradientText(designation, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900))), _StatusPill(s.status.toUpperCase())]),
            Text(s.name, style: const TextStyle(fontSize: 30, fontWeight: FontWeight.w900)),
            if (s.tagline.isNotEmpty) Text(s.tagline, style: const TextStyle(fontSize: 17, color: Colors.white70)),
            if (s.location.isNotEmpty) Padding(padding: const EdgeInsets.only(top: 5), child: Text(s.location, style: const TextStyle(color: Colors.white54))),
            if (genres.isNotEmpty) ...[
              const SizedBox(height: 8),
              Wrap(spacing: 6, runSpacing: 5, children: genres.map((e) => Chip(label: Text(e))).toList()),
            ],
            const SizedBox(height: 14),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                FilledButton.icon(
                  onPressed: s.streamUrl.isEmpty
                      ? null
                      : () async {
                          try {
                            await RrnPlaybackController.instance.playStation(s, metadata: metadata);
                          } catch (e) {
                            if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
                          }
                        },
                  icon: const Icon(Icons.play_arrow),
                  label: Text(s.streamUrl.isEmpty ? 'Not broadcasting' : 'Listen'),
                ),
                OutlinedButton.icon(onPressed: () => _saveStationDialog(context, s), icon: const Icon(Icons.bookmark_add_outlined), label: const Text('Save station')),
                OutlinedButton.icon(
                  onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => MatrixPageScreen(path: '/radio/stations/${s.slug.isNotEmpty ? s.slug : s.id}', title: s.name))),
                  icon: const Icon(Icons.hub_outlined),
                  label: const Text('All station controls'),
                ),
              ],
            ),
            const SizedBox(height: 16),
            _nowPlaying(),
            if (s.description.isNotEmpty) ...[
              const SizedBox(height: 16),
              const Text('About', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900)),
              const SizedBox(height: 5),
              Text(s.description, style: const TextStyle(height: 1.4, color: Colors.white70)),
            ],
            if (presenters.isNotEmpty) ...[
              const SizedBox(height: 16),
              const Text('Presenters', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900)),
              const SizedBox(height: 6),
              Wrap(spacing: 6, runSpacing: 6, children: presenters.map((e) => Chip(avatar: const Icon(Icons.mic, size: 15), label: Text(e))).toList()),
            ],
            const SizedBox(height: 16),
            _stationAccess(),
            const SizedBox(height: 16),
            ExpansionTile(
              tilePadding: EdgeInsets.zero,
              title: const Text('Complete station data', style: TextStyle(fontWeight: FontWeight.w900)),
              subtitle: const Text('Everything supplied by the RRN station object.'),
              children: [
                SelectableText(const JsonEncoder.withIndent('  ').convert(raw), style: const TextStyle(fontFamily: 'monospace', fontSize: 11, color: Colors.white70)),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _nowPlaying() {
    if (metadataBusy) return const Card(child: Padding(padding: EdgeInsets.all(18), child: LinearProgressIndicator()));
    final title = metadata.program.isNotEmpty ? metadata.program : metadata.title;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('NOW PLAYING', style: TextStyle(color: rrnCyan, fontSize: 10, letterSpacing: 1.5, fontWeight: FontWeight.w900)),
            const SizedBox(height: 5),
            Text(title.isEmpty ? 'No live metadata available.' : title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
            if (metadata.artist.isNotEmpty) Text(metadata.artist, style: const TextStyle(color: Colors.white70)),
            if (metadata.presenter.isNotEmpty || metadata.show.isNotEmpty)
              Text([metadata.presenter, metadata.show].where((e) => e.isNotEmpty).join(' · '), style: const TextStyle(color: rrnPurple)),
          ],
        ),
      ),
    );
  }

  Widget _stationAccess() {
    final s = widget.station;
    final items = <({String label, IconData icon, String path})>[
      (label: 'Schedule', icon: Icons.calendar_month, path: '/radio/stations/${s.slug}/schedule'),
      (label: 'Feed', icon: Icons.dynamic_feed, path: '/radio/stations/${s.slug}/feed'),
      (label: 'Shows', icon: Icons.podcasts, path: '/radio/stations/${s.slug}/shows'),
      (label: 'Presenters', icon: Icons.mic, path: '/radio/stations/${s.slug}/presenters'),
      (label: 'Charts', icon: Icons.leaderboard, path: '/radio/stations/${s.slug}/charts'),
      (label: 'Events', icon: Icons.event, path: '/radio/stations/${s.slug}/events'),
      (label: 'Giveaways', icon: Icons.card_giftcard, path: '/radio/stations/${s.slug}/giveaways'),
      (label: 'Requests', icon: Icons.queue_music, path: '/radio/stations/${s.slug}/requests'),
      (label: 'Call-ins', icon: Icons.call, path: '/radio/stations/${s.slug}/callins'),
      (label: 'Station tools', icon: Icons.settings, path: '/radio/stations/${s.slug}/manage'),
    ];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Station access', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900)),
        const SizedBox(height: 8),
        Wrap(
          spacing: 7,
          runSpacing: 7,
          children: items.map((item) {
            return ActionChip(
              avatar: Icon(item.icon, size: 17),
              label: Text(item.label),
              onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => MatrixPageScreen(path: item.path, title: '${widget.station.name} · ${item.label}'))),
            );
          }).toList(),
        ),
      ],
    );
  }
}
