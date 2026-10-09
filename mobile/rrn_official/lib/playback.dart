import 'dart:async';

import 'package:audio_service/audio_service.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';

import 'core.dart';

enum RrnPlaybackKind { none, station, music }
enum RrnPlaybackPhase { detached, idle, loading, playing, paused, error }

class RrnPlaybackController extends ChangeNotifier {
  RrnPlaybackController._();

  static final RrnPlaybackController instance = RrnPlaybackController._();
  static const MethodChannel _channel = MethodChannel('com.rbew.rrn_official/media');

  Timer? _stateTimer;
  Future<void> _operationChain = Future<void>.value();
  bool _pulling = false;
  bool _initialized = false;
  double _volume = 1;

  RrnPlaybackKind kind = RrnPlaybackKind.none;
  RrnPlaybackPhase phase = RrnPlaybackPhase.detached;
  String sourceId = '';
  String title = '';
  String subtitle = '';
  String album = '';
  String artwork = '';
  String? lastError;
  bool live = false;
  bool _playing = false;
  Map<String, dynamic> raw = const {};
  List<MediaItem> mediaQueue = const [];
  int queueIndex = 0;
  AudioServiceRepeatMode repeatMode = AudioServiceRepeatMode.none;
  AudioServiceShuffleMode shuffleMode = AudioServiceShuffleMode.none;
  Duration _position = Duration.zero;
  Duration _duration = Duration.zero;

  bool get attached => _initialized;
  bool get hasItem => kind != RrnPlaybackKind.none && title.isNotEmpty;
  bool get playing => _playing;
  bool get transitioning => phase == RrnPlaybackPhase.loading;
  bool get canSkip => !live && mediaQueue.length > 1;
  Duration get position => _position;
  Duration get duration => _duration;

  Future<void> init() async {
    if (_initialized) return;
    try {
      await _channel.invokeMethod<dynamic>('connect');
      _initialized = true;
      phase = RrnPlaybackPhase.idle;
      await _pullState();
      _stateTimer = Timer.periodic(const Duration(milliseconds: 400), (_) => _pullState());
    } catch (e) {
      lastError = 'Android media session could not start: $e';
      phase = RrnPlaybackPhase.error;
    }
    notifyListeners();
  }

  Future<void> _pullState() async {
    if (!_initialized || _pulling) return;
    _pulling = true;
    try {
      final result = await _channel.invokeMapMethod<String, dynamic>('getState');
      if (result == null) return;
      _applyNativeState(result);
    } catch (e) {
      lastError = '$e';
    } finally {
      _pulling = false;
    }
  }

  void _applyNativeState(Map<String, dynamic> state) {
    final current = state['current'] is Map
        ? Map<String, dynamic>.from(state['current'] as Map)
        : <String, dynamic>{};
    final nativeQueue = state['queue'] is List ? state['queue'] as List : const <dynamic>[];

    _playing = boolish(state['isPlaying'] ?? state['playWhenReady']);
    queueIndex = numi(state['currentIndex']).clamp(0, nativeQueue.isEmpty ? 0 : nativeQueue.length - 1);
    _position = Duration(milliseconds: numi(state['positionMs']).clamp(0, 1 << 52));
    _duration = Duration(milliseconds: numi(state['durationMs']).clamp(0, 1 << 52));
    repeatMode = switch (numi(state['repeatMode'])) {
      1 => AudioServiceRepeatMode.one,
      2 => AudioServiceRepeatMode.all,
      _ => AudioServiceRepeatMode.none,
    };
    shuffleMode = boolish(state['shuffle']) ? AudioServiceShuffleMode.all : AudioServiceShuffleMode.none;

    mediaQueue = nativeQueue
        .whereType<Map>()
        .map((row) => _mediaItemFromNative(Map<String, dynamic>.from(row)))
        .toList(growable: false);

    final id = str(current['id']);
    if (id.isEmpty) {
      if (sourceId.isNotEmpty || hasItem) _clearLocalState(keepError: true);
      phase = RrnPlaybackPhase.idle;
      notifyListeners();
      return;
    }

    sourceId = id;
    live = id.startsWith('station:') || boolish(current['isLive']);
    kind = live ? RrnPlaybackKind.station : RrnPlaybackKind.music;
    title = str(current['title'], live ? 'RRN Live Radio' : 'RRN Music');
    final artist = str(current['artist']);
    album = str(current['album']);
    subtitle = [artist, album].where((e) => e.isNotEmpty).join(' · ');
    artwork = str(current['artwork']);
    final playbackState = numi(state['playbackState']);
    phase = playbackState == 2
        ? RrnPlaybackPhase.loading
        : _playing
            ? RrnPlaybackPhase.playing
            : RrnPlaybackPhase.paused;
    notifyListeners();
  }

  MediaItem _mediaItemFromNative(Map<String, dynamic> row) => MediaItem(
        id: str(row['id']),
        title: str(row['title'], 'RRN Media'),
        artist: str(row['artist']),
        album: str(row['album']),
        artUri: str(row['artwork']).isEmpty ? null : Uri.tryParse(str(row['artwork'])),
        duration: numi(row['durationMs']) > 0 ? Duration(milliseconds: numi(row['durationMs'])) : null,
        extras: {
          'rrnType': str(row['id']).startsWith('station:') ? 'station' : 'music',
          'isLive': str(row['id']).startsWith('station:'),
        },
      );

  Future<void> _serialize(Future<void> Function() operation) {
    final completer = Completer<void>();
    _operationChain = _operationChain.catchError((_) {}).then((_) async {
      try {
        await operation();
        if (!completer.isCompleted) completer.complete();
      } catch (error, stackTrace) {
        lastError = '$error';
        phase = RrnPlaybackPhase.error;
        notifyListeners();
        if (!completer.isCompleted) completer.completeError(error, stackTrace);
      }
    });
    return completer.future;
  }

  String _absolute(String value) {
    if (value.isEmpty) return '';
    if (value.startsWith('http://') || value.startsWith('https://')) return value;
    return '$rrnBase${value.startsWith('/') ? value : '/$value'}';
  }

  String musicUrl(Map<String, dynamic> item) => _absolute(str(
        item['streamUrl'] ??
            item['stream_url'] ??
            item['audioUrl'] ??
            item['audio_url'] ??
            item['previewUrl'] ??
            item['preview_url'] ??
            item['fileUrl'] ??
            item['file_url'],
      ));

  String _musicIdentity(Map<String, dynamic> item) {
    final stream = musicUrl(item);
    return str(item['id'] ?? item['slug'] ?? item['catalog'], stream);
  }

  String _stationIdentity(Station station) => station.id.isNotEmpty
      ? station.id
      : station.slug.isNotEmpty
          ? station.slug
          : '${station.band}-${station.frequency.toStringAsFixed(3)}';

  String _stationSubtitle(Station station, RadioMetadata? metadata) => [
        if (metadata?.artist.isNotEmpty == true) metadata!.artist,
        if (metadata?.title.isNotEmpty == true) metadata!.title,
        if (metadata?.presenter.isNotEmpty == true) metadata!.presenter,
        if (metadata?.show.isNotEmpty == true) metadata!.show,
        if ((metadata?.title.isEmpty ?? true) && metadata?.program.isNotEmpty == true) metadata!.program,
        if (metadata == null || (metadata.artist.isEmpty && metadata.title.isEmpty && metadata.program.isEmpty))
          station.designation.isNotEmpty
              ? station.designation
              : '${station.frequency.toStringAsFixed(1)} ${station.band}',
      ].where((e) => e.isNotEmpty).join(' · ');

  Map<String, dynamic> _stationNativeItem(Station station, RadioMetadata? metadata) {
    final art = _absolute(metadata?.artwork.isNotEmpty == true ? metadata!.artwork : station.artwork);
    final trackTitle = metadata?.title.isNotEmpty == true
        ? metadata!.title
        : metadata?.program.isNotEmpty == true
            ? metadata!.program
            : station.name;
    final artist = metadata?.artist.isNotEmpty == true
        ? metadata!.artist
        : metadata?.presenter.isNotEmpty == true
            ? metadata!.presenter
            : station.name;
    final designation = station.designation.isNotEmpty
        ? station.designation
        : '${station.frequency.toStringAsFixed(1)} ${station.band}';
    return {
      'id': 'station:${_stationIdentity(station)}',
      'url': _absolute(station.streamUrl),
      'title': trackTitle,
      'artist': artist,
      'album': '${station.name} · $designation',
      'artwork': art,
      'isLive': true,
      'resourceId': station.id.isNotEmpty ? station.id : _stationIdentity(station),
    };
  }

  Map<String, dynamic> _musicNativeItem(Map<String, dynamic> item) {
    final itemTitle = str(item['title'] ?? item['name'], 'RRN Music');
    final itemArtist = str(item['artist'] ?? item['artistName'] ?? item['artist_name']);
    final itemAlbum = str(item['album'] ??
        item['albumTitle'] ??
        item['album_title'] ??
        item['releaseTitle'] ??
        item['release_title']);
    final art = _absolute(str(item['artwork'] ??
        item['artwork_url'] ??
        item['image'] ??
        item['coverUrl'] ??
        item['cover_url'] ??
        item['artworkUrl']));
    final id = _musicIdentity(item);
    return {
      'id': 'music:$id',
      'url': musicUrl(item),
      'title': itemTitle,
      'artist': itemArtist.isEmpty ? 'Reality Radio Network' : itemArtist,
      'album': itemAlbum,
      'artwork': art,
      'isLive': false,
      'resourceId': id,
    };
  }

  Future<void> playStation(
    Station station, {
    RadioMetadata? metadata,
    double volume = 1,
    bool autoplay = true,
  }) {
    final stream = _absolute(station.streamUrl);
    if (stream.isEmpty) {
      return Future.error(StateError('This station does not currently expose a playable stream.'));
    }
    final item = _stationNativeItem(station, metadata);
    return _serialize(() async {
      lastError = null;
      phase = RrnPlaybackPhase.loading;
      kind = RrnPlaybackKind.station;
      sourceId = str(item['id']);
      title = str(item['title']);
      subtitle = _stationSubtitle(station, metadata);
      album = str(item['album']);
      artwork = str(item['artwork']);
      live = true;
      raw = station.raw;
      _volume = volume.clamp(0, 1).toDouble();
      notifyListeners();
      await _channel.invokeMethod('setQueue', {
        'items': [item],
        'index': 0,
        'autoplay': autoplay,
        'volume': _volume,
        'live': true,
      });
      await _pullState();
    });
  }

  Future<void> playMusic(
    Map<String, dynamic> item, {
    bool autoplay = true,
    List<Map<String, dynamic>>? queueItems,
  }) {
    final selectedId = _musicIdentity(item);
    if (musicUrl(item).isEmpty) {
      return Future.error(StateError('This RRN track does not expose a playable stream.'));
    }
    return _serialize(() async {
      final sourceQueue = (queueItems ?? [item]).where((row) => musicUrl(row).isNotEmpty).toList();
      if (!sourceQueue.any((row) => _musicIdentity(row) == selectedId)) sourceQueue.insert(0, item);
      final selectedIndex = sourceQueue.indexWhere((row) => _musicIdentity(row) == selectedId);
      final nativeItems = sourceQueue.map(_musicNativeItem).toList(growable: false);
      final selected = nativeItems[selectedIndex];

      lastError = null;
      phase = RrnPlaybackPhase.loading;
      kind = RrnPlaybackKind.music;
      sourceId = str(selected['id']);
      title = str(selected['title']);
      subtitle = [str(selected['artist']), str(selected['album'])].where((e) => e.isNotEmpty).join(' · ');
      album = str(selected['album']);
      artwork = str(selected['artwork']);
      live = false;
      raw = Map<String, dynamic>.from(item);
      _volume = 1;
      notifyListeners();

      await _channel.invokeMethod('setQueue', {
        'items': nativeItems,
        'index': selectedIndex,
        'autoplay': autoplay,
        'volume': 1.0,
        'live': false,
      });
      await _pullState();
    });
  }

  void updateStationMetadata(Station station, RadioMetadata metadata) {
    final expected = 'station:${_stationIdentity(station)}';
    if (kind != RrnPlaybackKind.station || sourceId != expected) return;
    final item = _stationNativeItem(station, metadata);
    title = str(item['title']);
    subtitle = _stationSubtitle(station, metadata);
    album = str(item['album']);
    artwork = str(item['artwork']);
    unawaited(_channel.invokeMethod('updateMetadata', item));
    notifyListeners();
  }

  Future<void> pause() => _serialize(() async {
        if (!_initialized || !hasItem) return;
        await _channel.invokeMethod('pause');
        _playing = false;
        phase = RrnPlaybackPhase.paused;
        notifyListeners();
        await _pullState();
      });

  Future<void> resume() => _serialize(() async {
        if (!_initialized || !hasItem) return;
        await _channel.invokeMethod('play');
        _playing = true;
        phase = RrnPlaybackPhase.playing;
        notifyListeners();
        await _pullState();
      });

  Future<void> toggle() => playing ? pause() : resume();

  Future<void> skipNext() => _serialize(() async {
        if (!_initialized || !canSkip) return;
        await _channel.invokeMethod('next');
        await _pullState();
      });

  Future<void> skipPrevious() => _serialize(() async {
        if (!_initialized || !canSkip) return;
        await _channel.invokeMethod('previous');
        await _pullState();
      });

  Future<void> playQueueIndex(int index) => _serialize(() async {
        if (!_initialized || live || index < 0 || index >= mediaQueue.length) return;
        await _channel.invokeMethod('skipToIndex', {'index': index});
        await _pullState();
      });

  Future<void> cycleRepeat() => _serialize(() async {
        if (!_initialized || live) return;
        final next = switch (repeatMode) {
          AudioServiceRepeatMode.none => AudioServiceRepeatMode.all,
          AudioServiceRepeatMode.all => AudioServiceRepeatMode.one,
          _ => AudioServiceRepeatMode.none,
        };
        await _channel.invokeMethod('setRepeat', {
          'mode': switch (next) {
            AudioServiceRepeatMode.one => 1,
            AudioServiceRepeatMode.all => 2,
            _ => 0,
          },
        });
        repeatMode = next;
        notifyListeners();
        await _pullState();
      });

  Future<void> toggleShuffle() => _serialize(() async {
        if (!_initialized || live) return;
        final enabled = shuffleMode != AudioServiceShuffleMode.all;
        await _channel.invokeMethod('setShuffle', {'enabled': enabled});
        shuffleMode = enabled ? AudioServiceShuffleMode.all : AudioServiceShuffleMode.none;
        notifyListeners();
        await _pullState();
      });

  Future<void> stop() => _serialize(() async {
        if (_initialized) await _channel.invokeMethod('stop');
        _clearLocalState();
        notifyListeners();
      });

  Future<void> seek(Duration value) => _serialize(() async {
        if (!_initialized || live || !hasItem) return;
        await _channel.invokeMethod('seek', {'positionMs': value.inMilliseconds});
        _position = value;
        notifyListeners();
        await _pullState();
      });

  Future<void> setVolume(double value) async {
    if (!_initialized) return;
    _volume = value.clamp(0, 1).toDouble();
    await _channel.invokeMethod('setVolume', {'volume': _volume});
  }

  void _clearLocalState({bool keepError = false}) {
    kind = RrnPlaybackKind.none;
    phase = RrnPlaybackPhase.idle;
    sourceId = '';
    title = '';
    subtitle = '';
    album = '';
    artwork = '';
    live = false;
    _playing = false;
    raw = const {};
    mediaQueue = const [];
    queueIndex = 0;
    _position = Duration.zero;
    _duration = Duration.zero;
    repeatMode = AudioServiceRepeatMode.none;
    shuffleMode = AudioServiceShuffleMode.none;
    if (!keepError) lastError = null;
  }

  @override
  void dispose() {
    _stateTimer?.cancel();
    super.dispose();
  }
}
