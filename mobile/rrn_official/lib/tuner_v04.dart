import 'dart:async';
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:just_audio/just_audio.dart';

import 'core.dart';
import 'playback.dart';
import 'radio_storage.dart';
import 'stations.dart';
import 'tuner.dart' show DialScalePainter, RotaryKnob;

class RealityDialV04Screen extends StatefulWidget {
  const RealityDialV04Screen({super.key});
  @override
  State<RealityDialV04Screen> createState() => _RealityDialV04ScreenState();
}

class _RealityDialV04ScreenState extends State<RealityDialV04Screen> {
  final AudioPlayer staticPlayer = AudioPlayer();
  final playback = RrnPlaybackController.instance;
  RrnAppController? app;
  bool initialized = false;
  String band = 'RMP';
  double frequency = 201.5;
  double volume = 1;
  bool staticOn = true;
  bool signalBleed = true;
  bool dialAudio = true;
  bool powered = false;
  bool scanning = false;
  String manualStationId = '';
  RadioMetadata metadata = const RadioMetadata();
  List<BandPreset> presets = [];
  Timer? tuneTimer;
  Timer? metadataTimer;
  Timer? scanTimer;
  String? message;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (initialized) return;
    initialized = true;
    app = RrnScope.of(context);
    _initialize();
  }

  Future<void> _initialize() async {
    final prefs = app!.prefs;
    band = (prefs?.getString('dial_band') ?? 'RMP').toUpperCase();
    frequency = prefs?.getDouble('dial_frequency') ?? 201.5;
    volume = prefs?.getDouble('dial_volume') ?? 1;
    staticOn = prefs?.getBool('dial_static') ?? true;
    signalBleed = prefs?.getBool('dial_bleed') ?? true;
    dialAudio = prefs?.getBool('dial_auto') ?? true;
    presets = await RadioUserStorage.loadPresets(app!, band);
    try {
      await staticPlayer.setAsset('assets/radio_static.wav');
      await staticPlayer.setLoopMode(LoopMode.one);
    } catch (_) {}
    metadataTimer = Timer.periodic(const Duration(seconds: 12), (_) => _refreshMetadata());
    if (mounted) setState(() {});
  }

  @override
  void dispose() {
    tuneTimer?.cancel();
    metadataTimer?.cancel();
    scanTimer?.cancel();
    staticPlayer.dispose();
    super.dispose();
  }

  List<Station> get bandStations => app?.stationsFor(band) ?? const [];

  Station? get nearestStation {
    if (bandStations.isEmpty) return null;
    Station? best;
    var distance = double.infinity;
    for (final station in bandStations) {
      final d = (station.frequency - frequency).abs();
      if (d < distance) {
        best = station;
        distance = d;
      }
    }
    return best;
  }

  double get nearestDistance {
    final station = nearestStation;
    return station == null ? double.infinity : (station.frequency - frequency).abs();
  }

  bool get locked => nearestDistance <= .045;

  ({double min, double max}) get bandRange {
    final stations = bandStations;
    if (stations.isEmpty) return (min: 0, max: 999.9);
    final lo = stations.map((e) => e.frequency).reduce(math.min);
    final hi = stations.map((e) => e.frequency).reduce(math.max);
    final spread = hi - lo;
    final padding = spread < 1 ? 1.0 : math.max(1.0, spread * .12);
    return (min: math.max(0, (lo - padding).floorToDouble()), max: (hi + padding).ceilToDouble());
  }

  double get signalStrength {
    final station = nearestStation;
    if (station == null || station.streamUrl.isEmpty) return 0;
    final d = nearestDistance;
    if (!signalBleed) return d <= .045 ? 1 : 0;
    const radius = .28;
    if (d >= radius) return 0;
    return math.pow(1 - d / radius, 1.6).toDouble().clamp(0, 1);
  }

  double get rangePosition {
    final r = bandRange;
    if (r.max <= r.min) return 0;
    return ((frequency - r.min) / (r.max - r.min)).clamp(0, 1);
  }

  Future<void> _setBand(String value) async {
    if (band == value) return;
    scanTimer?.cancel();
    scanning = false;
    band = value;
    final stations = app!.stationsFor(band);
    if (stations.isNotEmpty) frequency = stations.first.frequency;
    metadata = const RadioMetadata();
    manualStationId = '';
    presets = await RadioUserStorage.loadPresets(app!, band);
    app!.prefs?.setString('dial_band', band);
    app!.prefs?.setDouble('dial_frequency', frequency);
    if (mounted) setState(() {});
    _scheduleAudio();
  }

  void _setFrequency(double value, {bool user = true}) {
    final r = bandRange;
    frequency = value.clamp(r.min, r.max).toDouble();
    app!.prefs?.setDouble('dial_frequency', frequency);
    if (user && !dialAudio) manualStationId = '';
    message = null;
    if (mounted) setState(() {});
    _scheduleAudio();
  }

  void _scheduleAudio() {
    tuneTimer?.cancel();
    tuneTimer = Timer(const Duration(milliseconds: 70), _updateAudio);
  }

  Future<void> _updateAudio() async {
    if (!mounted) return;
    if (!powered) {
      if (staticPlayer.playing) await staticPlayer.pause();
      if (playback.kind == RrnPlaybackKind.station) await playback.pause();
      return;
    }

    if (staticOn && !staticPlayer.playing) {
      try {
        await staticPlayer.play();
      } catch (_) {}
    }
    if (!staticOn && staticPlayer.playing) await staticPlayer.pause();

    final station = nearestStation;
    final strength = signalStrength;
    final allowed = station != null && station.streamUrl.isNotEmpty && strength > .015 && (dialAudio || manualStationId == _identity(station));

    if (allowed) {
      final id = 'station:${_identity(station)}';
      try {
        if (playback.sourceId != id) {
          await playback.playStation(station, metadata: metadata, volume: volume * strength);
        } else {
          await playback.setVolume(volume * strength);
          if (!playback.playing) await playback.resume();
        }
      } catch (e) {
        message = '$e';
      }
    } else if (playback.kind == RrnPlaybackKind.station) {
      await playback.setVolume(0);
      if (!dialAudio && playback.playing) await playback.pause();
    }

    if (staticOn) {
      final mix = signalBleed ? 1 - strength : (locked && station?.streamUrl.isNotEmpty == true ? 0 : 1);
      await staticPlayer.setVolume((volume * mix).clamp(0, 1).toDouble());
    }
    if (mounted) setState(() {});
  }

  String _identity(Station station) => station.id.isNotEmpty
      ? station.id
      : station.slug.isNotEmpty
          ? station.slug
          : '${station.band}-${station.frequency.toStringAsFixed(3)}';

  Future<void> _refreshMetadata() async {
    final station = locked ? nearestStation : null;
    if (station == null) return;
    try {
      final body = await app!.api.get('/radio/state', query: {
        if (station.id.isNotEmpty) 'stationId': station.id,
        if (station.slug.isNotEmpty) 'slug': station.slug,
      });
      metadata = RadioMetadata.from(body);
      if (playback.kind == RrnPlaybackKind.station && playback.sourceId == 'station:${_identity(station)}' && station.streamUrl.isNotEmpty) {
        // Keep playback itself alive; the Dial display is refreshed independently.
      }
      if (mounted) setState(() {});
    } catch (_) {}
  }

  Future<void> _togglePower() async {
    powered = !powered;
    if (powered && !dialAudio && locked && nearestStation != null) manualStationId = _identity(nearestStation!);
    if (mounted) setState(() {});
    await _updateAudio();
  }

  void _setVolume(double value) {
    volume = value.clamp(0, 1).toDouble();
    app!.prefs?.setDouble('dial_volume', volume);
    if (mounted) setState(() {});
    _updateAudio();
  }

  void _seekStation(int direction) {
    final stations = bandStations;
    if (stations.isEmpty) return;
    Station target;
    if (direction > 0) {
      target = stations.firstWhere((s) => s.frequency > frequency + .045, orElse: () => stations.first);
    } else {
      final lower = stations.where((s) => s.frequency < frequency - .045).toList();
      target = lower.isEmpty ? stations.last : lower.last;
    }
    _setFrequency(target.frequency);
  }

  void _scan() {
    if (scanning) {
      scanTimer?.cancel();
      scanning = false;
      setState(() {});
      return;
    }
    powered = true;
    scanning = true;
    setState(() {});
    final r = bandRange;
    var travelled = 0.0;
    scanTimer = Timer.periodic(const Duration(milliseconds: 40), (timer) {
      var next = frequency + .02;
      travelled += .02;
      if (next > r.max) next = r.min;
      _setFrequency(next, user: false);
      final station = nearestStation;
      if (travelled > .1 && station != null && station.streamUrl.isNotEmpty && nearestDistance <= .03) {
        timer.cancel();
        scanning = false;
        _setFrequency(station.frequency, user: false);
        if (mounted) setState(() {});
      }
    });
  }

  Future<void> _savePreset(int slot, {bool customize = false}) async {
    final station = locked ? nearestStation : null;
    var label = station?.name ?? 'Manual ${frequency.toStringAsFixed(1)} $band';
    if (customize) {
      final controller = TextEditingController(text: label);
      final custom = await showDialog<String>(
        context: context,
        builder: (_) => AlertDialog(
          title: Text('$band preset $slot'),
          content: TextField(controller: controller, autofocus: true, decoration: const InputDecoration(labelText: 'Preset label')),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
            FilledButton(onPressed: () => Navigator.pop(context, controller.text.trim()), child: const Text('Save')),
          ],
        ),
      );
      if (custom == null) return;
      if (custom.isNotEmpty) label = custom;
    }
    await RadioUserStorage.savePreset(
      app!,
      BandPreset(
        band: band,
        slot: slot,
        stationId: station?.id ?? '',
        slug: station?.slug ?? '',
        officialName: station?.name ?? label,
        label: label,
        frequency: frequency,
      ),
    );
    presets = await RadioUserStorage.loadPresets(app!, band);
    message = '$band preset $slot saved.';
    if (mounted) setState(() {});
  }

  Future<void> _clearPreset(int slot) async {
    await RadioUserStorage.clearPreset(app!, band, slot);
    presets = await RadioUserStorage.loadPresets(app!, band);
    if (mounted) setState(() {});
  }

  void _recall(BandPreset preset) {
    if (preset.band != band) {
      _setBand(preset.band).then((_) => _setFrequency(preset.frequency));
    } else {
      _setFrequency(preset.frequency);
    }
  }

  Future<void> _openDirectory() async {
    final station = await Navigator.push<Station>(context, MaterialPageRoute(builder: (_) => const StationDirectoryScreen(chooseForTune: true)));
    if (station == null || !mounted) return;
    if (station.band != band) await _setBand(station.band);
    _setFrequency(station.frequency);
  }

  Future<void> _saveCurrentStation() async {
    final station = locked ? nearestStation : null;
    if (station == null) {
      setState(() => message = 'Tune to a listed station before saving it to your station library.');
      return;
    }
    final controller = TextEditingController();
    final nickname = await showDialog<String>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Save station'),
        content: TextField(controller: controller, autofocus: true, decoration: InputDecoration(labelText: 'Nickname (optional)', hintText: station.name)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          FilledButton(onPressed: () => Navigator.pop(context, controller.text.trim()), child: const Text('Save')),
        ],
      ),
    );
    if (nickname == null) return;
    await RadioUserStorage.saveStation(app!, station, nickname: nickname);
    if (mounted) setState(() => message = '${nickname.isEmpty ? station.name : nickname} saved to $band.');
  }

  @override
  Widget build(BuildContext context) {
    final station = locked ? nearestStation : null;
    return RefreshIndicator(
      onRefresh: () async {
        await app!.loadStations();
        presets = await RadioUserStorage.loadPresets(app!, band);
        await _refreshMetadata();
        if (mounted) setState(() {});
      },
      child: ListView(
        padding: const EdgeInsets.fromLTRB(14, 16, 14, 140),
        children: [
          const RrnSectionHeader(
            eyebrow: 'The Reality Dial',
            title: 'The website tuner, translated to mobile.',
            subtitle: 'Continuous frequency space, dead air, generated static, signal bleed, automatic dial audio, scan, unlimited saved stations and six presets for every band.',
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(child: OutlinedButton.icon(onPressed: _openDirectory, icon: const Icon(Icons.search), label: const Text('Find stations'))),
              const SizedBox(width: 8),
              Expanded(child: OutlinedButton.icon(onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SavedStationsScreen())), icon: const Icon(Icons.bookmarks), label: const Text('Saved stations'))),
            ],
          ),
          const SizedBox(height: 12),
          _bands(),
          const SizedBox(height: 12),
          _radioFace(station),
          const SizedBox(height: 12),
          _stationCard(station),
          const SizedBox(height: 10),
          _toggles(),
          const SizedBox(height: 18),
          _presetDashboard(),
          const SizedBox(height: 22),
          _bandPreview(),
          if (message != null) ...[const SizedBox(height: 10), Text(message!, style: const TextStyle(color: Colors.white70))],
        ],
      ),
    );
  }

  Widget _bands() => SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: app!.bands.map((value) {
            return Padding(
              padding: const EdgeInsets.only(right: 7),
              child: ChoiceChip(
                selected: band == value,
                label: Column(mainAxisSize: MainAxisSize.min, children: [Text(value, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w900)), Text(_bandLabel(value), style: const TextStyle(fontSize: 8))]),
                onSelected: (_) => _setBand(value),
              ),
            );
          }).toList(),
        ),
      );

  String _bandLabel(String value) => switch (value) {
        'PFL' => 'Playlist Low',
        'RMP' => 'Radio Primary',
        'TFP' => 'Talk Primary',
        'PFH' => 'Playlist High',
        'ASHP' => 'Audio Sight',
        _ => 'RRN Band',
      };

  Widget _radioFace(Station? station) => Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(25),
          gradient: const LinearGradient(colors: [Color(0xFF171C25), Color(0xFF090D15)]),
          border: Border.all(color: Colors.white12),
        ),
        child: Column(
          children: [
            Row(
              children: [
                RotaryKnob(value: volume, label: 'VOL', detail: '${(volume * 100).round()}%', onChanged: _setVolume),
                const SizedBox(width: 8),
                Expanded(child: _display(station)),
                const SizedBox(width: 8),
                RotaryKnob(
                  value: rangePosition,
                  label: 'TUNE',
                  detail: frequency.toStringAsFixed(1),
                  onChanged: (v) {
                    final r = bandRange;
                    _setFrequency(r.min + (r.max - r.min) * v);
                  },
                ),
              ],
            ),
            const SizedBox(height: 10),
            SizedBox(
              height: 72,
              child: GestureDetector(
                behavior: HitTestBehavior.opaque,
                onHorizontalDragUpdate: (d) => _setFrequency(frequency - d.delta.dx * .0045),
                child: CustomPaint(painter: DialScalePainter(frequency: frequency, stations: bandStations, band: band), child: const SizedBox.expand()),
              ),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                IconButton.filledTonal(onPressed: () => _seekStation(-1), icon: const Icon(Icons.skip_previous)),
                const SizedBox(width: 7),
                FilledButton.tonalIcon(onPressed: _scan, icon: Icon(scanning ? Icons.stop : Icons.waves), label: Text(scanning ? 'STOP' : 'SCAN')),
                const SizedBox(width: 7),
                FilledButton(onPressed: _togglePower, child: Icon(powered ? Icons.pause : Icons.play_arrow, size: 28)),
                const SizedBox(width: 7),
                IconButton.filledTonal(onPressed: () => _seekStation(1), icon: const Icon(Icons.skip_next)),
              ],
            ),
            const SizedBox(height: 11),
            Row(
              children: List.generate(6, (index) {
                final slot = index + 1;
                BandPreset? preset;
                for (final candidate in presets) {
                  if (candidate.slot == slot) preset = candidate;
                }
                final current = preset;
                return Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 2.5),
                    child: InkWell(
                      borderRadius: BorderRadius.circular(11),
                      onTap: current == null ? () => _savePreset(slot) : () => _recall(current),
                      onLongPress: current == null ? () => _savePreset(slot, customize: true) : () => _presetMenu(slot, current),
                      child: Container(
                        height: 56,
                        decoration: BoxDecoration(color: const Color(0xFF080B12), borderRadius: BorderRadius.circular(11), border: Border.all(color: Colors.white12)),
                        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                          Text('$slot', style: const TextStyle(color: rrnCyan, fontWeight: FontWeight.w900)),
                          Text(current?.label ?? '—', maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 8, color: Colors.white60)),
                        ]),
                      ),
                    ),
                  ),
                );
              }),
            ),
          ],
        ),
      );

  Future<void> _presetMenu(int slot, BandPreset preset) async {
    final action = await showModalBottomSheet<String>(
      context: context,
      builder: (_) => SafeArea(
        child: Wrap(children: [
          ListTile(leading: const Icon(Icons.edit), title: const Text('Replace / rename preset'), onTap: () => Navigator.pop(context, 'replace')),
          ListTile(leading: const Icon(Icons.delete_outline), title: const Text('Clear preset'), onTap: () => Navigator.pop(context, 'clear')),
        ]),
      ),
    );
    if (action == 'replace') await _savePreset(slot, customize: true);
    if (action == 'clear') await _clearPreset(slot);
  }

  Widget _display(Station? station) {
    final signal = station != null && station.streamUrl.isNotEmpty;
    final line = [
      if (metadata.presenter.isNotEmpty) metadata.presenter,
      if (metadata.show.isNotEmpty) metadata.show,
      if (metadata.artist.isNotEmpty) metadata.artist,
      if (metadata.title.isNotEmpty) metadata.title,
      if (metadata.program.isNotEmpty) metadata.program,
    ].join(' · ');
    return Container(
      constraints: const BoxConstraints(minHeight: 145),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: const Color(0xFF001015), borderRadius: BorderRadius.circular(17), border: Border.all(color: rrnCyan.withValues(alpha: .22))),
      child: Column(
        children: [
          Row(children: [Text(powered ? (signal ? 'ON AIR' : 'TUNING') : 'PAUSED', style: const TextStyle(color: rrnCyan, fontSize: 9, fontWeight: FontWeight.w900)), const Spacer(), const Text('RRN DIGITAL', style: TextStyle(color: rrnPurple, fontSize: 9, fontWeight: FontWeight.w900))]),
          const SizedBox(height: 8),
          FittedBox(
            child: Row(crossAxisAlignment: CrossAxisAlignment.end, children: [
              Text(frequency.toStringAsFixed(1), style: const TextStyle(fontFamily: 'monospace', fontSize: 50, height: .95, fontWeight: FontWeight.w300, color: Color(0xFFE6FFFF))),
              const SizedBox(width: 7),
              Text(band, style: const TextStyle(color: rrnPurple, fontWeight: FontWeight.w900, fontSize: 17)),
            ]),
          ),
          Text(station?.name ?? 'NO SIGNAL', maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w900)),
          if (line.isNotEmpty) Text(line, textAlign: TextAlign.center, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Color(0xFF9FE8E8), fontFamily: 'monospace', fontSize: 9)),
          const SizedBox(height: 5),
          LinearProgressIndicator(value: signalStrength, minHeight: 2, backgroundColor: Colors.white10, valueColor: const AlwaysStoppedAnimation(rrnCyan)),
        ],
      ),
    );
  }

  Widget _stationCard(Station? station) {
    if (station == null) {
      return Card(child: Padding(padding: const EdgeInsets.all(16), child: Text('Dead space at ${frequency.toStringAsFixed(1)} $band. ${staticOn ? 'Generated radio static is active.' : 'Static is disabled.'}')));
    }
    final coming = station.streamUrl.isEmpty;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(children: [Expanded(child: Text(station.name, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900))), Text(station.status.toUpperCase(), style: TextStyle(color: coming ? rrnPurple : rrnCyan, fontSize: 10, fontWeight: FontWeight.w900))]),
            Text(station.designation.isNotEmpty ? station.designation : '${station.frequency.toStringAsFixed(1)} ${station.band}', style: const TextStyle(color: rrnCyan, fontWeight: FontWeight.w800)),
            if (station.location.isNotEmpty) Text(station.location, style: const TextStyle(color: Colors.white54)),
            if (station.tagline.isNotEmpty) ...[const SizedBox(height: 5), Text(station.tagline, style: const TextStyle(color: Colors.white70))],
            if (coming) ...[const SizedBox(height: 8), const Text('This frequency is reserved/listed but is not currently exposing a live stream. The tuner therefore remains physically on the frequency while producing dead-space/static behavior.', style: TextStyle(color: Colors.white60))],
            const SizedBox(height: 10),
            Wrap(spacing: 7, runSpacing: 7, children: [
              FilledButton.tonalIcon(onPressed: _saveCurrentStation, icon: const Icon(Icons.bookmark_add_outlined), label: const Text('Save station')),
              OutlinedButton.icon(onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => StationPageScreen(station: station))), icon: const Icon(Icons.open_in_new), label: const Text('Station page')),
            ]),
          ],
        ),
      ),
    );
  }

  Widget _toggles() => Wrap(
        spacing: 7,
        runSpacing: 7,
        children: [
          FilterChip(selected: staticOn, onSelected: (v) { staticOn = v; app!.prefs?.setBool('dial_static', v); setState(() {}); _updateAudio(); }, label: Text('STATIC ${staticOn ? 'ON' : 'OFF'}')),
          FilterChip(selected: signalBleed, onSelected: (v) { signalBleed = v; app!.prefs?.setBool('dial_bleed', v); setState(() {}); _updateAudio(); }, label: Text('SIGNAL BLEED ${signalBleed ? 'ON' : 'OFF'}')),
          FilterChip(selected: dialAudio, onSelected: (v) { dialAudio = v; app!.prefs?.setBool('dial_auto', v); if (v) manualStationId = ''; setState(() {}); _updateAudio(); }, label: Text(dialAudio ? 'DIAL AUDIO AUTO' : 'DIAL AUDIO MANUAL')),
        ],
      );

  Widget _presetDashboard() => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('$band Preset Bank', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900)),
          const Text('Every RRN frequency band owns its own six-slot preset bank.', style: TextStyle(color: Colors.white54)),
          const SizedBox(height: 7),
          ...List.generate(6, (index) {
            final slot = index + 1;
            BandPreset? preset;
            for (final candidate in presets) {
              if (candidate.slot == slot) preset = candidate;
            }
            return ListTile(
              contentPadding: EdgeInsets.zero,
              leading: CircleAvatar(backgroundColor: rrnPanel2, child: Text('$slot', style: const TextStyle(color: rrnCyan))),
              title: Text(preset?.label ?? 'Empty preset', style: const TextStyle(fontWeight: FontWeight.w800)),
              subtitle: preset == null ? Text('$band slot $slot') : Text('${preset.frequency.toStringAsFixed(1)} ${preset.band} · ${preset.officialName}'),
              trailing: preset == null ? const Icon(Icons.add) : IconButton(onPressed: () => _clearPreset(slot), icon: const Icon(Icons.clear)),
              onTap: preset == null ? () => _savePreset(slot) : () => _recall(preset!),
            );
          }),
        ],
      );

  Widget _bandPreview() {
    final rows = bandStations;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(children: [Expanded(child: Text('$band Station Preview', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900))), TextButton.icon(onPressed: _openDirectory, icon: const Icon(Icons.search), label: const Text('Search all'))]),
        const Text('The same station previews as the site, including coming-soon and non-live listings.', style: TextStyle(color: Colors.white54)),
        const SizedBox(height: 8),
        ...rows.take(12).map((station) => StationPreviewCard(station: station, onTune: () => _setFrequency(station.frequency))),
        if (rows.length > 12) TextButton(onPressed: _openDirectory, child: Text('View all ${rows.length} $band stations')),
      ],
    );
  }
}
