import 'dart:async';
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:just_audio/just_audio.dart';
import 'package:just_audio_background/just_audio_background.dart';

import 'core.dart';

class RealityDialScreen extends StatefulWidget {
  const RealityDialScreen({super.key});
  @override
  State<RealityDialScreen> createState() => _RealityDialScreenState();
}

class _RealityDialScreenState extends State<RealityDialScreen> {
  final AudioPlayer _stationPlayer = AudioPlayer();
  final AudioPlayer _staticPlayer = AudioPlayer();
  RrnAppController? app;
  bool loaded = false;
  String band = 'RMP';
  double frequency = 201.5;
  double volume = 1.0;
  bool staticOn = true;
  bool signalBleed = true;
  bool dialAudio = true;
  bool powered = false;
  bool scanning = false;
  String manualStationId = '';
  String audioStationId = '';
  RadioMetadata metadata = const RadioMetadata();
  Timer? _tuneDebounce;
  Timer? _metadataTimer;
  Timer? _scanTimer;
  List<Preset> presets = [];
  String? message;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (loaded) return;
    app = RrnScope.of(context);
    loaded = true;
    _initialize();
  }

  Future<void> _initialize() async {
    final p = app!.prefs;
    band = (p?.getString('dial_band') ?? 'RMP').toUpperCase();
    frequency = p?.getDouble('dial_frequency') ?? 201.5;
    volume = p?.getDouble('dial_volume') ?? 1.0;
    staticOn = p?.getBool('dial_static') ?? true;
    signalBleed = p?.getBool('dial_bleed') ?? true;
    dialAudio = p?.getBool('dial_auto') ?? true;
    presets = await app!.localPresets();
    try {
      await _staticPlayer.setAsset('assets/radio_static.wav');
      await _staticPlayer.setLoopMode(LoopMode.one);
    } catch (_) {}
    if (mounted) setState(() {});
    _metadataTimer = Timer.periodic(const Duration(seconds: 12), (_) => _refreshMetadata());
  }

  @override
  void dispose() {
    _tuneDebounce?.cancel();
    _metadataTimer?.cancel();
    _scanTimer?.cancel();
    _stationPlayer.dispose();
    _staticPlayer.dispose();
    super.dispose();
  }

  List<Station> get bandStations => app?.stationsFor(band) ?? const [];

  Station? get nearestStation {
    if (bandStations.isEmpty) return null;
    Station best = bandStations.first;
    var distance = (best.frequency - frequency).abs();
    for (final station in bandStations.skip(1)) {
      final d = (station.frequency - frequency).abs();
      if (d < distance) {
        best = station;
        distance = d;
      }
    }
    return best;
  }

  double get nearestDistance {
    final s = nearestStation;
    return s == null ? double.infinity : (s.frequency - frequency).abs();
  }

  bool get locked => nearestDistance <= .045;

  ({double min, double max}) get bandRange {
    if (bandStations.isEmpty) return (min: 0, max: 999.9);
    final lo = bandStations.map((e) => e.frequency).reduce(math.min);
    final hi = bandStations.map((e) => e.frequency).reduce(math.max);
    if ((hi - lo).abs() < .5) return (min: math.max(0, lo - 1), max: hi + 1);
    return (min: math.max(0, lo.floorToDouble() - 1), max: hi.ceilToDouble() + 1);
  }

  double get signalStrength {
    final distance = nearestDistance;
    if (!distance.isFinite) return 0;
    if (!signalBleed) return distance <= .045 ? 1 : 0;
    const bleedRadius = .25;
    if (distance >= bleedRadius) return 0;
    final normalized = 1 - (distance / bleedRadius);
    return math.pow(normalized, 1.65).toDouble().clamp(0, 1);
  }

  void _setBand(String next) {
    if (band == next) return;
    _scanTimer?.cancel();
    scanning = false;
    final stations = app!.stationsFor(next);
    setState(() {
      band = next;
      if (stations.isNotEmpty) frequency = stations.first.frequency;
      metadata = const RadioMetadata();
      manualStationId = '';
    });
    app!.prefs?.setString('dial_band', band);
    app!.prefs?.setDouble('dial_frequency', frequency);
    _scheduleAudioUpdate();
  }

  void _setFrequency(double next, {bool fromUser = true}) {
    final range = bandRange;
    next = next.clamp(range.min, range.max);
    setState(() {
      frequency = next;
      message = null;
    });
    app!.prefs?.setDouble('dial_frequency', frequency);
    if (fromUser && !dialAudio && audioStationId.isNotEmpty && nearestStation?.id != audioStationId) {
      manualStationId = audioStationId;
    }
    _scheduleAudioUpdate();
  }

  void _scheduleAudioUpdate() {
    _tuneDebounce?.cancel();
    _tuneDebounce = Timer(const Duration(milliseconds: 85), _updateAudio);
  }

  Future<void> _ensureStatic() async {
    if (!powered || !staticOn) {
      if (_staticPlayer.playing) await _staticPlayer.pause();
      return;
    }
    if (!_staticPlayer.playing) {
      try {
        await _staticPlayer.play();
      } catch (_) {}
    }
  }

  Future<void> _updateAudio() async {
    if (!mounted) return;
    final station = nearestStation;
    var strength = signalStrength;
    final stationAllowed = powered && station != null && strength > .025 && (dialAudio || manualStationId == station.id);

    if (!powered) {
      if (_stationPlayer.playing) await _stationPlayer.pause();
      if (_staticPlayer.playing) await _staticPlayer.pause();
      if (mounted) setState(() {});
      return;
    }

    await _ensureStatic();

    if (!stationAllowed) {
      await _stationPlayer.setVolume(0);
      if (_stationPlayer.playing && !dialAudio) await _stationPlayer.pause();
      if (staticOn) await _staticPlayer.setVolume(volume);
      if (mounted) setState(() {});
      return;
    }

    final stream = station.streamUrl;
    if (stream.isEmpty) {
      if (staticOn) await _staticPlayer.setVolume(volume);
      return;
    }

    if (audioStationId != station.id) {
      try {
        audioStationId = station.id;
        await _stationPlayer.setAudioSource(
          AudioSource.uri(
            Uri.parse(stream),
            tag: MediaItem(
              id: station.id.isEmpty ? station.slug : station.id,
              album: station.designation.isEmpty ? '${station.frequency.toStringAsFixed(1)} ${station.band}' : station.designation,
              title: station.name,
              artist: 'Reality Radio Network',
              artUri: station.artwork.startsWith('http') ? Uri.tryParse(station.artwork) : null,
            ),
          ),
        );
        await _stationPlayer.play();
        await _refreshMetadata();
      } catch (e) {
        if (mounted) setState(() => message = 'Station stream could not be opened: $e');
      }
    } else if (!_stationPlayer.playing) {
      try {
        await _stationPlayer.play();
      } catch (_) {}
    }

    strength = signalStrength;
    await _stationPlayer.setVolume((volume * strength).clamp(0, 1));
    if (staticOn) {
      final staticMix = signalBleed ? (1 - strength) : (locked ? 0 : 1);
      await _staticPlayer.setVolume((volume * staticMix).clamp(0, 1));
    }
    if (mounted) setState(() {});
  }

  Future<void> _refreshMetadata() async {
    final station = nearestStation;
    if (station == null || !locked) {
      if (mounted) setState(() => metadata = const RadioMetadata());
      return;
    }
    try {
      final body = await app!.api.get('/radio/state', query: {
        if (station.id.isNotEmpty) 'stationId': station.id,
        if (station.slug.isNotEmpty) 'slug': station.slug,
      });
      final next = RadioMetadata.from(body);
      if (mounted) setState(() => metadata = next);
    } catch (_) {}
  }

  Future<void> _togglePower() async {
    final station = nearestStation;
    setState(() {
      powered = !powered;
      if (powered && station != null) manualStationId = station.id;
    });
    await _updateAudio();
  }

  void _setVolume(double next) {
    setState(() => volume = next.clamp(0, 1));
    app!.prefs?.setDouble('dial_volume', volume);
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
      _scanTimer?.cancel();
      setState(() => scanning = false);
      return;
    }
    final range = bandRange;
    var travelled = 0.0;
    powered = true;
    setState(() => scanning = true);
    _scanTimer = Timer.periodic(const Duration(milliseconds: 45), (timer) {
      var next = frequency + .02;
      travelled += .02;
      if (next > range.max) next = range.min;
      _setFrequency(next, fromUser: false);
      if (travelled > .08 && nearestDistance <= .03) {
        timer.cancel();
        setState(() => scanning = false);
        _setFrequency(nearestStation!.frequency, fromUser: false);
      }
    });
  }

  Future<void> _savePreset(int slot) async {
    final station = locked ? nearestStation : null;
    final preset = Preset(slot, station?.id ?? '', station?.slug ?? '', station?.name ?? 'Manual $band ${frequency.toStringAsFixed(1)}', band, frequency);
    await app!.savePresetLocal(preset);
    presets = await app!.localPresets();
    if (mounted) setState(() => message = 'Preset $slot saved.');
  }

  Future<void> _clearPreset(int slot) async {
    await app!.clearPresetLocal(slot);
    presets = await app!.localPresets();
    if (mounted) setState(() {});
  }

  void _recall(Preset preset) {
    if (preset.band != band) band = preset.band;
    _setFrequency(preset.frequency);
  }

  @override
  Widget build(BuildContext context) {
    final station = locked ? nearestStation : null;
    return RefreshIndicator(
      onRefresh: () async {
        await app!.loadStations();
        presets = await app!.localPresets();
        await _refreshMetadata();
        if (mounted) setState(() {});
      },
      child: ListView(
        padding: const EdgeInsets.fromLTRB(14, 16, 14, 120),
        children: [
          const RrnSectionHeader(
            eyebrow: 'The Reality Dial',
            title: 'Internet radio with a real radio feel.',
            subtitle: 'A continuous tuner: stations, dead air, static, signal bleed, scan and presets all live on the same dial.',
          ),
          const SizedBox(height: 18),
          _bands(),
          const SizedBox(height: 12),
          _radioFace(station),
          const SizedBox(height: 14),
          _stationCard(station),
          const SizedBox(height: 12),
          _effectToggles(),
          const SizedBox(height: 20),
          _presetDashboard(),
          if (message != null) ...[
            const SizedBox(height: 12),
            Text(message!, style: const TextStyle(color: Colors.white70)),
          ],
        ],
      ),
    );
  }

  Widget _bands() => Wrap(
        spacing: 8,
        runSpacing: 8,
        children: app!.bands.map((b) {
          final selected = band == b;
          return ChoiceChip(
            selected: selected,
            label: SizedBox(
              width: 92,
              child: Column(mainAxisSize: MainAxisSize.min, children: [
                Text(b, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
                Text(_bandLabel(b), textAlign: TextAlign.center, style: const TextStyle(fontSize: 9, color: Colors.white60)),
              ]),
            ),
            onSelected: (_) => _setBand(b),
            selectedColor: const Color(0xAA2764FF),
          );
        }).toList(),
      );

  String _bandLabel(String b) => switch (b) {
        'PFL' => 'Playlist ONLY · Low Band',
        'RMP' => 'Radio Mastery · Primary',
        'TFP' => 'Talk Format · Primary',
        'PFH' => 'Playlist ONLY · High Band',
        'ASHP' => 'Audio Sight Home · Primary',
        _ => 'RRN frequency band',
      };

  Widget _radioFace(Station? station) => Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(26),
          gradient: const LinearGradient(colors: [Color(0xFF171C25), Color(0xFF0B0F17)]),
          border: Border.all(color: Colors.white.withValues(alpha: .15)),
        ),
        child: Column(
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                RotaryKnob(
                  value: volume,
                  label: 'VOL',
                  detail: '${(volume * 100).round()}%',
                  onChanged: _setVolume,
                ),
                const SizedBox(width: 10),
                Expanded(child: _digitalDisplay(station)),
                const SizedBox(width: 10),
                RotaryKnob(
                  value: _rangePosition,
                  label: 'TUNE',
                  detail: frequency.toStringAsFixed(1),
                  onChanged: (v) {
                    final r = bandRange;
                    _setFrequency(r.min + (r.max - r.min) * v);
                  },
                ),
              ],
            ),
            const SizedBox(height: 12),
            SizedBox(
              height: 66,
              child: GestureDetector(
                behavior: HitTestBehavior.opaque,
                onHorizontalDragUpdate: (d) => _setFrequency(frequency - d.delta.dx * .0045),
                child: CustomPaint(
                  painter: DialScalePainter(frequency: frequency, stations: bandStations, band: band),
                  child: const SizedBox.expand(),
                ),
              ),
            ),
            const SizedBox(height: 6),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                IconButton.filledTonal(onPressed: () => _seekStation(-1), icon: const Icon(Icons.skip_previous)),
                const SizedBox(width: 8),
                FilledButton.tonalIcon(onPressed: _scan, icon: Icon(scanning ? Icons.stop : Icons.waves), label: Text(scanning ? 'STOP' : 'SCAN')),
                const SizedBox(width: 8),
                FilledButton(onPressed: _togglePower, child: Icon(powered ? Icons.pause : Icons.play_arrow, size: 28)),
                const SizedBox(width: 8),
                IconButton.filledTonal(onPressed: () => _seekStation(1), icon: const Icon(Icons.skip_next)),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: List.generate(6, (index) {
                final slot = index + 1;
                final preset = presets.where((p) => p.slot == slot).firstOrNull;
                return Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 3),
                    child: InkWell(
                      borderRadius: BorderRadius.circular(12),
                      onTap: preset == null ? () => _savePreset(slot) : () => _recall(preset),
                      onLongPress: () => _savePreset(slot),
                      child: Container(
                        height: 54,
                        decoration: BoxDecoration(
                          color: const Color(0xFF090C13),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.white12),
                        ),
                        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                          Text('$slot', style: const TextStyle(color: rrnCyan, fontWeight: FontWeight.w900)),
                          Text(preset?.name ?? '—', maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 8, color: Colors.white60)),
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

  double get _rangePosition {
    final r = bandRange;
    if (r.max <= r.min) return 0;
    return ((frequency - r.min) / (r.max - r.min)).clamp(0, 1);
  }

  Widget _digitalDisplay(Station? station) {
    final noSignal = station == null;
    return Container(
      constraints: const BoxConstraints(minHeight: 142),
      padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
      decoration: BoxDecoration(
        color: const Color(0xFF001015),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: rrnCyan.withValues(alpha: .22)),
        boxShadow: [BoxShadow(color: rrnCyan.withValues(alpha: .06), blurRadius: 20)],
      ),
      child: Column(
        children: [
          Row(children: [
            Text(powered ? (station == null ? 'TUNING' : 'ON AIR') : 'PAUSED', style: const TextStyle(color: rrnCyan, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1.4)),
            const Spacer(),
            const Text('RRN DIGITAL', style: TextStyle(color: rrnPurple, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1.4)),
          ]),
          const SizedBox(height: 8),
          FittedBox(
            fit: BoxFit.scaleDown,
            child: Row(mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.end, children: [
              Text(frequency.toStringAsFixed(1), style: const TextStyle(fontSize: 52, height: .95, fontWeight: FontWeight.w300, fontFamily: 'monospace', color: Color(0xFFE6FFFF))),
              const SizedBox(width: 8),
              Text(band, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: rrnPurple)),
            ]),
          ),
          const SizedBox(height: 5),
          Text(noSignal ? 'NO SIGNAL' : station.name, textAlign: TextAlign.center, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w900)),
          if (!noSignal && (metadata.title.isNotEmpty || metadata.program.isNotEmpty || metadata.show.isNotEmpty)) ...[
            const SizedBox(height: 5),
            Text(
              [
                if (metadata.presenter.isNotEmpty) metadata.presenter,
                if (metadata.show.isNotEmpty) metadata.show,
                if (metadata.artist.isNotEmpty) metadata.artist,
                if (metadata.title.isNotEmpty) metadata.title,
                if (metadata.program.isNotEmpty) metadata.program,
              ].join(' · '),
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontFamily: 'monospace', color: Color(0xFF9FE8E8), fontSize: 10),
            ),
          ],
          const SizedBox(height: 5),
          LinearProgressIndicator(
            value: signalStrength,
            minHeight: 2,
            backgroundColor: Colors.white10,
            valueColor: const AlwaysStoppedAnimation(rrnCyan),
          ),
        ],
      ),
    );
  }

  Widget _stationCard(Station? station) {
    if (station == null) {
      return Card(
        child: Padding(
          padding: const EdgeInsets.all(18),
          child: Row(children: [
            const Icon(Icons.waves, color: rrnCyan),
            const SizedBox(width: 12),
            Expanded(child: Text('Dead space at ${frequency.toStringAsFixed(1)} $band. ${staticOn ? 'Generated radio static is active.' : 'Static is disabled.'}')),
          ]),
        ),
      );
    }
    final nowTitle = metadata.program.isNotEmpty ? metadata.program : metadata.title;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Container(
            width: 96,
            height: 96,
            decoration: BoxDecoration(color: Colors.black, borderRadius: BorderRadius.circular(18), border: Border.all(color: rrnCyan.withValues(alpha: .18))),
            clipBehavior: Clip.antiAlias,
            child: station.artwork.startsWith('http') ? Image.network(station.artwork, fit: BoxFit.cover, errorBuilder: (_, __, ___) => const Icon(Icons.radio, size: 44, color: rrnCyan)) : const Icon(Icons.radio, size: 44, color: rrnCyan),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                Container(padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4), decoration: BoxDecoration(border: Border.all(color: const Color(0xFF34D399)), borderRadius: BorderRadius.circular(99)), child: Text(metadata.live || station.status.toLowerCase().contains('live') ? 'LIVE' : station.status.toUpperCase(), style: const TextStyle(fontSize: 10, color: Color(0xFF6EE7B7), fontWeight: FontWeight.w900))),
                const SizedBox(width: 8),
                Expanded(child: Text(station.location, style: const TextStyle(color: Colors.white54, fontSize: 11))),
              ]),
              const SizedBox(height: 8),
              Text(station.name, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900)),
              Text(station.designation.isEmpty ? '${station.frequency.toStringAsFixed(1)} ${station.band}' : station.designation, style: const TextStyle(color: Colors.white60, fontWeight: FontWeight.w700)),
              if (nowTitle.isNotEmpty) ...[
                const SizedBox(height: 10),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(color: Colors.black, borderRadius: BorderRadius.circular(12)),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    const Text('NOW PLAYING', style: TextStyle(color: rrnCyan, fontSize: 9, letterSpacing: 1.4, fontWeight: FontWeight.w900)),
                    Text(nowTitle, style: const TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.w800)),
                    if (metadata.artist.isNotEmpty) Text(metadata.artist, style: const TextStyle(fontFamily: 'monospace', color: Colors.white70)),
                    if (metadata.presenter.isNotEmpty || metadata.show.isNotEmpty) Text([metadata.presenter, metadata.show].where((e) => e.isNotEmpty).join(' · '), style: const TextStyle(fontFamily: 'monospace', color: rrnPurple, fontSize: 11)),
                  ]),
                ),
              ],
              if (station.tagline.isNotEmpty) ...[
                const SizedBox(height: 10),
                Text(station.tagline, style: const TextStyle(color: Colors.white70)),
              ],
              const SizedBox(height: 10),
              Wrap(spacing: 8, runSpacing: 8, children: [
                FilledButton.tonalIcon(onPressed: () => _savePreset(_firstOpenPresetSlot()), icon: const Icon(Icons.bookmark_add_outlined), label: const Text('Save preset')),
                OutlinedButton.icon(onPressed: () => _showStationDetails(station), icon: const Icon(Icons.info_outline), label: const Text('Station details')),
                if (station.has('requests')) OutlinedButton.icon(onPressed: () => _openRequests(station), icon: const Icon(Icons.queue_music), label: const Text('Request')),
              ]),
            ]),
          ),
        ]),
      ),
    );
  }

  int _firstOpenPresetSlot() {
    for (var i = 1; i <= 6; i++) {
      if (!presets.any((p) => p.slot == i)) return i;
    }
    return 1;
  }

  Widget _effectToggles() => Wrap(
        spacing: 8,
        runSpacing: 8,
        children: [
          FilterChip(
            selected: staticOn,
            onSelected: (v) {
              setState(() => staticOn = v);
              app!.prefs?.setBool('dial_static', v);
              _updateAudio();
            },
            label: Text('STATIC ${staticOn ? 'ON' : 'OFF'}'),
          ),
          FilterChip(
            selected: signalBleed,
            onSelected: (v) {
              setState(() => signalBleed = v);
              app!.prefs?.setBool('dial_bleed', v);
              _updateAudio();
            },
            label: Text('SIGNAL BLEED ${signalBleed ? 'ON' : 'OFF'}'),
          ),
          FilterChip(
            selected: dialAudio,
            onSelected: (v) {
              setState(() => dialAudio = v);
              app!.prefs?.setBool('dial_auto', v);
              if (v && powered) _updateAudio();
            },
            label: Text(dialAudio ? 'DIAL AUDIO AUTO' : 'DIAL AUDIO MANUAL'),
          ),
        ],
      );

  Widget _presetDashboard() => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('MY $band PRESETS', style: const TextStyle(color: rrnCyan, fontSize: 11, letterSpacing: 1.5, fontWeight: FontWeight.w900)),
          const Text('Favorites Dashboard', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
          const SizedBox(height: 10),
          ...List.generate(6, (index) {
            final slot = index + 1;
            final preset = presets.where((p) => p.slot == slot).firstOrNull;
            return Card(
              margin: const EdgeInsets.only(bottom: 6),
              child: ListTile(
                onTap: preset == null ? () => _savePreset(slot) : () => _recall(preset),
                leading: CircleAvatar(backgroundColor: const Color(0xFF0A2026), child: Text('$slot', style: const TextStyle(color: rrnCyan, fontWeight: FontWeight.w900))),
                title: Text(preset?.name ?? 'Empty'),
                subtitle: preset == null ? null : Text('${preset.frequency.toStringAsFixed(1)} ${preset.band}'),
                trailing: preset == null ? TextButton(onPressed: () => _savePreset(slot), child: const Text('Set')) : TextButton(onPressed: () => _clearPreset(slot), child: const Text('Clear')),
              ),
            );
          }),
        ],
      );

  void _showStationDetails(Station station) {
    Navigator.of(context).push(MaterialPageRoute(builder: (_) => StationDetailScreen(station: station)));
  }

  void _openRequests(Station station) {
    Navigator.of(context).push(MaterialPageRoute(builder: (_) => SongRequestScreen(station: station)));
  }
}

class RotaryKnob extends StatelessWidget {
  final double value;
  final ValueChanged<double> onChanged;
  final String label;
  final String detail;
  const RotaryKnob({super.key, required this.value, required this.onChanged, required this.label, required this.detail});

  @override
  Widget build(BuildContext context) => SizedBox(
        width: 70,
        child: Column(children: [
          GestureDetector(
            behavior: HitTestBehavior.opaque,
            onVerticalDragUpdate: (d) => onChanged((value - d.delta.dy / 120).clamp(0, 1)),
            onHorizontalDragUpdate: (d) => onChanged((value + d.delta.dx / 120).clamp(0, 1)),
            child: CustomPaint(painter: KnobPainter(value), child: const SizedBox(width: 64, height: 64)),
          ),
          const SizedBox(height: 4),
          Text(label, style: const TextStyle(color: rrnCyan, fontWeight: FontWeight.w900, letterSpacing: 1.5)),
          Text(detail, style: const TextStyle(color: Colors.white70, fontSize: 10)),
        ]),
      );
}

class KnobPainter extends CustomPainter {
  final double value;
  KnobPainter(this.value);
  @override
  void paint(Canvas canvas, Size size) {
    final c = Offset(size.width / 2, size.height / 2);
    final r = size.shortestSide / 2 - 3;
    final shadow = Paint()..color = Colors.black54;
    canvas.drawCircle(c.translate(2, 3), r, shadow);
    final body = Paint()
      ..shader = const RadialGradient(colors: [Color(0xFF555B69), Color(0xFF11141C), Colors.black], stops: [0, .55, 1]).createShader(Rect.fromCircle(center: c, radius: r));
    canvas.drawCircle(c, r, body);
    canvas.drawCircle(c, r, Paint()..style = PaintingStyle.stroke..strokeWidth = 2..color = Colors.white24);
    final angle = (-2.35) + value.clamp(0, 1) * 4.7;
    final p1 = c + Offset(math.cos(angle), math.sin(angle)) * (r * .55);
    final p2 = c + Offset(math.cos(angle), math.sin(angle)) * (r * .86);
    canvas.drawLine(p1, p2, Paint()..color = rrnCyan..strokeWidth = 3..strokeCap = StrokeCap.round);
    canvas.drawCircle(c, r * .38, Paint()..shader = const RadialGradient(colors: [Color(0xFF3B4050), Color(0xFF090B10)]).createShader(Rect.fromCircle(center: c, radius: r * .4)));
  }

  @override
  bool shouldRepaint(covariant KnobPainter oldDelegate) => oldDelegate.value != value;
}

class DialScalePainter extends CustomPainter {
  final double frequency;
  final List<Station> stations;
  final String band;
  DialScalePainter({required this.frequency, required this.stations, required this.band});

  @override
  void paint(Canvas canvas, Size size) {
    const span = .8;
    final left = frequency - span / 2;
    final right = frequency + span / 2;
    final baseline = size.height - 18;
    final linePaint = Paint()..color = Colors.white24..strokeWidth = 1;
    canvas.drawLine(Offset(0, baseline), Offset(size.width, baseline), linePaint);
    for (var i = 0; i <= 8; i++) {
      final f = left + i * .1;
      final x = (f - left) / span * size.width;
      final major = i % 2 == 0;
      canvas.drawLine(Offset(x, baseline), Offset(x, baseline - (major ? 16 : 9)), Paint()..color = major ? Colors.white54 : Colors.white24..strokeWidth = 1);
      if (major) {
        final tp = TextPainter(text: TextSpan(text: f.toStringAsFixed(1), style: const TextStyle(color: Colors.white54, fontSize: 9, fontFamily: 'monospace')), textDirection: TextDirection.ltr)..layout();
        tp.paint(canvas, Offset((x - tp.width / 2).clamp(0, size.width - tp.width), baseline - 31));
      }
    }
    for (final station in stations) {
      if (station.frequency < left || station.frequency > right) continue;
      final x = (station.frequency - left) / span * size.width;
      canvas.drawLine(Offset(x, baseline + 1), Offset(x, baseline - 25), Paint()..color = rrnPurple.withValues(alpha: .55)..strokeWidth = 2);
    }
    final center = size.width / 2;
    canvas.drawLine(Offset(center, 5), Offset(center, baseline + 4), Paint()..color = rrnCyan..strokeWidth = 2.5);
    final tp = TextPainter(text: TextSpan(text: '${frequency.toStringAsFixed(1)} $band', style: const TextStyle(color: rrnCyan, fontSize: 10, fontWeight: FontWeight.w900, fontFamily: 'monospace')), textDirection: TextDirection.ltr)..layout();
    tp.paint(canvas, Offset(center - tp.width / 2, 0));
  }

  @override
  bool shouldRepaint(covariant DialScalePainter oldDelegate) => oldDelegate.frequency != frequency || oldDelegate.stations != stations || oldDelegate.band != band;
}

class StationDetailScreen extends StatelessWidget {
  final Station station;
  const StationDetailScreen({super.key, required this.station});
  @override
  Widget build(BuildContext context) {
    final actions = <Widget>[];
    if (station.has('requests')) actions.add(FilledButton.icon(onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => SongRequestScreen(station: station))), icon: const Icon(Icons.queue_music), label: const Text('Song requests')));
    for (final cap in station.capabilities.where((c) => c.toLowerCase() != 'requests')) {
      actions.add(OutlinedButton(onPressed: () => ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$cap is exposed by this station. Its native action renderer will use the Translation Matrix capability payload.'))), child: Text(cap.replaceAll('_', ' '))));
    }
    return Scaffold(
      appBar: AppBar(title: Text(station.name)),
      body: ListView(padding: const EdgeInsets.all(16), children: [
        if (station.artwork.startsWith('http')) ClipRRect(borderRadius: BorderRadius.circular(24), child: Image.network(station.artwork, height: 240, fit: BoxFit.cover)),
        const SizedBox(height: 16),
        GradientText(station.designation.isEmpty ? '${station.frequency.toStringAsFixed(1)} ${station.band}' : station.designation, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
        Text(station.name, style: const TextStyle(fontSize: 30, fontWeight: FontWeight.w900)),
        if (station.tagline.isNotEmpty) Text(station.tagline, style: const TextStyle(color: Colors.white70, fontSize: 17)),
        if (station.description.isNotEmpty) ...[const SizedBox(height: 16), Text(station.description)],
        if (station.location.isNotEmpty) ...[const SizedBox(height: 12), Text(station.location, style: const TextStyle(color: Colors.white60))],
        const SizedBox(height: 18),
        Wrap(spacing: 8, runSpacing: 8, children: actions),
      ]),
    );
  }
}

class SongRequestScreen extends StatefulWidget {
  final Station station;
  const SongRequestScreen({super.key, required this.station});
  @override
  State<SongRequestScreen> createState() => _SongRequestScreenState();
}

class _SongRequestScreenState extends State<SongRequestScreen> {
  final search = TextEditingController();
  List<dynamic> results = [];
  int balance = 0;
  bool busy = false;
  String? status;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (balance == 0) _loadBalance();
  }

  Future<void> _loadBalance() async {
    final app = RrnScope.of(context);
    balance = await app.pointsBalance();
    if (mounted) setState(() {});
  }

  Future<void> _find() async {
    final app = RrnScope.of(context);
    if (!app.auth.signedIn) {
      setState(() => status = 'Sign in to spend RRN points on song requests.');
      return;
    }
    setState(() => busy = true);
    try {
      final body = await app.api.get('/radio/stations/${widget.station.slug}/requests', query: {'q': search.text.trim()});
      results = listFrom(body, const ['tracks', 'requests']);
      if (body is Map) balance = numi(body['balance'] ?? body['points'], balance);
      status = null;
    } catch (e) {
      status = 'The station request bridge is not available yet: $e';
    } finally {
      busy = false;
      if (mounted) setState(() {});
    }
  }

  Future<void> _request(dynamic raw) async {
    final app = RrnScope.of(context);
    final m = raw is Map ? Map<String, dynamic>.from(raw) : <String, dynamic>{};
    final id = str(m['id'] ?? m['trackId'] ?? m['requestId']);
    final cost = numi(m['pointCost'] ?? m['cost'] ?? m['points'], 0);
    if (cost > balance) {
      setState(() => status = 'This request costs $cost points; you have $balance.');
      return;
    }
    setState(() => busy = true);
    try {
      final body = await app.api.post('/radio/stations/${widget.station.slug}/request', body: {
        'trackId': id,
        'requestId': id,
        'pointCost': cost,
      });
      if (body is Map) balance = numi(body['balance'] ?? body['points'], balance - cost);
      status = str(body is Map ? body['message'] : null, 'Request submitted. $cost RRN points used.');
    } catch (e) {
      status = 'Request failed. No successful point spend was recorded: $e';
    } finally {
      busy = false;
      if (mounted) setState(() {});
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: Text('${widget.station.name} · Requests')),
        body: ListView(padding: const EdgeInsets.all(16), children: [
          Row(children: [const Icon(Icons.toll, color: rrnCyan), const SizedBox(width: 8), Text('$balance RRN points', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900))]),
          const SizedBox(height: 8),
          const Text('RRN points have an immediate use here: participating stations can charge a published point cost for an AzuraCast song request. Failed requests must not consume points.', style: TextStyle(color: Colors.white70)),
          const SizedBox(height: 16),
          TextField(controller: search, decoration: InputDecoration(labelText: 'Search requestable songs', suffixIcon: IconButton(onPressed: busy ? null : _find, icon: const Icon(Icons.search))), onSubmitted: (_) => _find()),
          if (status != null) Padding(padding: const EdgeInsets.symmetric(vertical: 12), child: Text(status!, style: const TextStyle(color: Colors.white70))),
          if (busy) const Center(child: Padding(padding: EdgeInsets.all(18), child: CircularProgressIndicator())),
          ...results.map((raw) {
            final m = raw is Map ? Map<String, dynamic>.from(raw) : <String, dynamic>{};
            final title = str(m['title'] ?? m['trackTitle'] ?? m['name'], 'Track');
            final artist = str(m['artist'] ?? m['artistName']);
            final cost = numi(m['pointCost'] ?? m['cost'] ?? m['points']);
            return Card(child: ListTile(title: Text(title), subtitle: Text([artist, if (cost > 0) '$cost points'].where((e) => e.isNotEmpty).join(' · ')), trailing: FilledButton(onPressed: busy ? null : () => _request(raw), child: const Text('Request'))));
          }),
        ]),
      );
}

extension FirstOrNullExtension<T> on Iterable<T> {
  T? get firstOrNull => isEmpty ? null : first;
}
