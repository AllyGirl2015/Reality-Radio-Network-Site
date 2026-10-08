import 'dart:convert';

import 'core.dart';

class BandPreset {
  final String band;
  final int slot;
  final String stationId;
  final String slug;
  final String officialName;
  final String label;
  final double frequency;

  const BandPreset({
    required this.band,
    required this.slot,
    required this.stationId,
    required this.slug,
    required this.officialName,
    required this.label,
    required this.frequency,
  });

  Map<String, dynamic> toJson() => {
        'band': band,
        'slot': slot,
        'stationId': stationId,
        'slug': slug,
        'officialName': officialName,
        'label': label,
        'frequency': frequency,
      };

  factory BandPreset.from(dynamic raw) {
    final m = raw is Map ? Map<String, dynamic>.from(raw) : <String, dynamic>{};
    return BandPreset(
      band: str(m['band'], 'RMP').toUpperCase(),
      slot: numi(m['slot']),
      stationId: str(m['stationId'] ?? m['station_id']),
      slug: str(m['slug']),
      officialName: str(m['officialName'] ?? m['name']),
      label: str(m['label'] ?? m['nickname'] ?? m['name']),
      frequency: numd(m['frequency']),
    );
  }
}

class SavedStationRecord {
  final String key;
  final String stationId;
  final String slug;
  final String officialName;
  final String nickname;
  final String band;
  final double frequency;
  final String artwork;
  final String status;
  final DateTime savedAt;

  const SavedStationRecord({
    required this.key,
    required this.stationId,
    required this.slug,
    required this.officialName,
    required this.nickname,
    required this.band,
    required this.frequency,
    required this.artwork,
    required this.status,
    required this.savedAt,
  });

  String get displayName => nickname.trim().isNotEmpty ? nickname.trim() : officialName;

  Map<String, dynamic> toJson() => {
        'key': key,
        'stationId': stationId,
        'slug': slug,
        'officialName': officialName,
        'nickname': nickname,
        'band': band,
        'frequency': frequency,
        'artwork': artwork,
        'status': status,
        'savedAt': savedAt.toIso8601String(),
      };

  factory SavedStationRecord.from(dynamic raw) {
    final m = raw is Map ? Map<String, dynamic>.from(raw) : <String, dynamic>{};
    final band = str(m['band'], 'RMP').toUpperCase();
    final frequency = numd(m['frequency']);
    final stationId = str(m['stationId'] ?? m['station_id']);
    final slug = str(m['slug']);
    return SavedStationRecord(
      key: str(m['key'], '$band:${stationId.isNotEmpty ? stationId : slug.isNotEmpty ? slug : frequency.toStringAsFixed(3)}'),
      stationId: stationId,
      slug: slug,
      officialName: str(m['officialName'] ?? m['name'], 'Saved station'),
      nickname: str(m['nickname'] ?? m['label']),
      band: band,
      frequency: frequency,
      artwork: str(m['artwork']),
      status: str(m['status']),
      savedAt: DateTime.tryParse(str(m['savedAt'] ?? m['saved_at'])) ?? DateTime.now(),
    );
  }

  factory SavedStationRecord.fromStation(Station station, {String nickname = ''}) {
    final identity = station.id.isNotEmpty
        ? station.id
        : station.slug.isNotEmpty
            ? station.slug
            : station.frequency.toStringAsFixed(3);
    return SavedStationRecord(
      key: '${station.band}:$identity',
      stationId: station.id,
      slug: station.slug,
      officialName: station.name,
      nickname: nickname,
      band: station.band,
      frequency: station.frequency,
      artwork: station.artwork,
      status: station.status,
      savedAt: DateTime.now(),
    );
  }
}

class RadioUserStorage {
  static const _presetKey = 'rrn_presets_v04';
  static const _savedKey = 'rrn_saved_stations_v04';

  static Future<List<BandPreset>> loadAllPresets(RrnAppController app) async {
    final raw = app.prefs?.getString(_presetKey);
    if (raw != null && raw.isNotEmpty) {
      try {
        return listFrom(jsonDecode(raw)).map(BandPreset.from).where((p) => p.slot >= 1 && p.slot <= 6).toList();
      } catch (_) {}
    }

    // One-time migration from v0.3's flat six-preset model.
    final oldRaw = app.prefs?.getString('rrn_presets_v03');
    if (oldRaw != null && oldRaw.isNotEmpty) {
      try {
        final migrated = listFrom(jsonDecode(oldRaw)).map((raw) {
          final old = Preset.from(raw);
          return BandPreset(
            band: old.band,
            slot: old.slot,
            stationId: old.stationId,
            slug: old.slug,
            officialName: old.name,
            label: old.name,
            frequency: old.frequency,
          );
        }).where((p) => p.slot >= 1 && p.slot <= 6).toList();
        await _writePresets(app, migrated);
        return migrated;
      } catch (_) {}
    }
    return [];
  }

  static Future<List<BandPreset>> loadPresets(RrnAppController app, String band) async {
    final all = await loadAllPresets(app);
    final normalized = band.toUpperCase();
    return all.where((p) => p.band == normalized).toList()..sort((a, b) => a.slot.compareTo(b.slot));
  }

  static Future<void> _writePresets(RrnAppController app, List<BandPreset> presets) async {
    presets.sort((a, b) {
      final bandOrder = a.band.compareTo(b.band);
      return bandOrder != 0 ? bandOrder : a.slot.compareTo(b.slot);
    });
    await app.prefs?.setString(_presetKey, jsonEncode(presets.map((p) => p.toJson()).toList()));
  }

  static Future<void> savePreset(RrnAppController app, BandPreset preset) async {
    final all = await loadAllPresets(app);
    all.removeWhere((p) => p.band == preset.band && p.slot == preset.slot);
    all.add(preset);
    await _writePresets(app, all);
    if (app.auth.signedIn) {
      try {
        await app.api.post('/radio/presets', body: {...preset.toJson(), 'scope': 'band'});
      } catch (_) {}
    }
  }

  static Future<void> clearPreset(RrnAppController app, String band, int slot) async {
    final normalized = band.toUpperCase();
    final all = await loadAllPresets(app);
    all.removeWhere((p) => p.band == normalized && p.slot == slot);
    await _writePresets(app, all);
    if (app.auth.signedIn) {
      try {
        await app.api.post('/radio/presets', body: {'band': normalized, 'slot': slot, 'action': 'clear', 'scope': 'band'});
      } catch (_) {}
    }
  }

  static Future<List<SavedStationRecord>> loadSaved(RrnAppController app) async {
    final raw = app.prefs?.getString(_savedKey);
    if (raw == null || raw.isEmpty) return [];
    try {
      return listFrom(jsonDecode(raw)).map(SavedStationRecord.from).toList()
        ..sort((a, b) {
          final bandOrder = a.band.compareTo(b.band);
          if (bandOrder != 0) return bandOrder;
          return a.frequency.compareTo(b.frequency);
        });
    } catch (_) {
      return [];
    }
  }

  static Future<void> _writeSaved(RrnAppController app, List<SavedStationRecord> items) async {
    await app.prefs?.setString(_savedKey, jsonEncode(items.map((e) => e.toJson()).toList()));
  }

  static Future<void> saveStation(RrnAppController app, Station station, {String nickname = ''}) async {
    final record = SavedStationRecord.fromStation(station, nickname: nickname);
    final all = await loadSaved(app);
    all.removeWhere((e) => e.key == record.key);
    all.add(record);
    await _writeSaved(app, all);
    if (app.auth.signedIn) {
      try {
        await app.api.post('/radio/saved-stations', body: {...record.toJson(), 'action': 'save'});
      } catch (_) {}
    }
  }

  static Future<void> renameSaved(RrnAppController app, SavedStationRecord record, String nickname) async {
    final all = await loadSaved(app);
    final index = all.indexWhere((e) => e.key == record.key);
    if (index < 0) return;
    final next = SavedStationRecord(
      key: record.key,
      stationId: record.stationId,
      slug: record.slug,
      officialName: record.officialName,
      nickname: nickname,
      band: record.band,
      frequency: record.frequency,
      artwork: record.artwork,
      status: record.status,
      savedAt: record.savedAt,
    );
    all[index] = next;
    await _writeSaved(app, all);
    if (app.auth.signedIn) {
      try {
        await app.api.post('/radio/saved-stations', body: {...next.toJson(), 'action': 'rename'});
      } catch (_) {}
    }
  }

  static Future<void> removeSaved(RrnAppController app, SavedStationRecord record) async {
    final all = await loadSaved(app);
    all.removeWhere((e) => e.key == record.key);
    await _writeSaved(app, all);
    if (app.auth.signedIn) {
      try {
        await app.api.post('/radio/saved-stations', body: {...record.toJson(), 'action': 'remove'});
      } catch (_) {}
    }
  }

  static Future<void> mergeServerSaved(RrnAppController app) async {
    if (!app.auth.signedIn) return;
    try {
      final body = await app.api.get('/radio/saved-stations');
      final server = listFrom(body, const ['stations', 'savedStations', 'saved_stations']).map(SavedStationRecord.from).toList();
      final local = await loadSaved(app);
      final map = <String, SavedStationRecord>{for (final item in local) item.key: item};
      for (final item in server) {
        map.putIfAbsent(item.key, () => item);
      }
      await _writeSaved(app, map.values.toList());
    } catch (_) {}
  }
}
