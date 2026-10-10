import 'dart:async';
import 'dart:convert';
import 'dart:math';

import 'package:audio_service/audio_service.dart';
import 'package:http/http.dart' as http;
import 'package:just_audio/just_audio.dart';

class RrnAudioHandler extends BaseAudioHandler with QueueHandler, SeekHandler {
  RrnAudioHandler() {
    _eventSub = player.playbackEventStream.listen(
      (event) {
        _broadcastState(event);
        if (player.processingState == ProcessingState.completed) {
          unawaited(_handleCompletion());
        }
      },
      onError: (Object _, StackTrace __) => _broadcastState(player.playbackEvent),
    );
    _playingSub = player.playingStream.listen((_) => _broadcastState(player.playbackEvent));
    _processingSub = player.processingStateStream.listen((state) {
      _broadcastState(player.playbackEvent);
      if (state == ProcessingState.completed) unawaited(_handleCompletion());
    });
    _speedSub = player.speedStream.listen((_) => _broadcastState(player.playbackEvent));
  }

  static const String _rootId = 'root';
  static const String _stationsId = 'rrn:stations';
  static const String _matrixStations = 'https://realityradio.net/api/app/v1/stations';

  final AudioPlayer player = AudioPlayer();
  final Random _random = Random();

  StreamSubscription<PlaybackEvent>? _eventSub;
  StreamSubscription<bool>? _playingSub;
  StreamSubscription<ProcessingState>? _processingSub;
  StreamSubscription<double>? _speedSub;

  final List<MediaItem> _items = [];
  final List<String> _urls = [];
  final Map<String, MediaItem> _browseStations = {};
  int _index = 0;
  bool _isLive = false;
  bool _handlingCompletion = false;
  double _volume = 1;
  DateTime? _browseLoadedAt;
  Future<List<MediaItem>>? _browseLoad;
  AudioServiceRepeatMode _repeatMode = AudioServiceRepeatMode.none;
  AudioServiceShuffleMode _shuffleMode = AudioServiceShuffleMode.none;

  int get currentIndex => _index;
  bool get isLive => _isLive;
  bool get canSkip => !_isLive && _items.length > 1;
  AudioServiceRepeatMode get repeatSetting => _repeatMode;
  AudioServiceShuffleMode get shuffleSetting => _shuffleMode;

  String _absolute(String value) {
    if (value.isEmpty) return '';
    if (value.startsWith('http://') || value.startsWith('https://')) return value;
    return 'https://realityradio.net${value.startsWith('/') ? value : '/$value'}';
  }

  List<dynamic> _listFrom(dynamic body) {
    if (body is List) return body;
    if (body is Map) {
      for (final key in const ['items', 'stations', 'results', 'data', 'rows']) {
        final value = body[key];
        if (value is List) return value;
      }
    }
    return const [];
  }

  String _string(dynamic value, [String fallback = '']) => value == null ? fallback : '$value';

  Future<List<MediaItem>> _loadBrowseStations({bool force = false}) {
    final now = DateTime.now();
    if (!force &&
        _browseStations.isNotEmpty &&
        _browseLoadedAt != null &&
        now.difference(_browseLoadedAt!) < const Duration(minutes: 3)) {
      return Future.value(List<MediaItem>.unmodifiable(_browseStations.values));
    }
    final active = _browseLoad;
    if (active != null) return active;

    final future = () async {
      try {
        final uri = Uri.parse(_matrixStations).replace(queryParameters: const {'limit': '250'});
        final response = await http.get(
          uri,
          headers: const {
            'Accept': 'application/json',
            'X-RRN-App': 'android-auto',
            'X-RRN-App-Version': '0.10.0',
          },
        ).timeout(const Duration(seconds: 12));
        if (response.statusCode < 200 || response.statusCode >= 300) {
          throw StateError('RRN station directory returned ${response.statusCode}.');
        }
        final decoded = response.body.isEmpty ? const <String, dynamic>{} : jsonDecode(response.body);
        final next = <String, MediaItem>{};
        for (final raw in _listFrom(decoded)) {
          if (raw is! Map) continue;
          final station = Map<String, dynamic>.from(raw);
          final streamUrl = _absolute(_string(
            station['streamUrl'] ?? station['stream_url'] ?? station['stream'] ?? station['listenUrl'] ?? station['listen_url'],
          ));
          if (streamUrl.isEmpty) continue;
          final stationId = _string(station['id']);
          final slug = _string(station['slug']);
          final band = _string(station['band'] ?? station['frequencyType'] ?? station['frequency_type']);
          final frequency = _string(station['frequency']);
          final name = _string(station['name'] ?? station['title'], 'RRN Station');
          final designation = _string(
            station['designation'],
            [frequency, band].where((value) => value.isNotEmpty).join(' '),
          );
          final identity = stationId.isNotEmpty
              ? stationId
              : slug.isNotEmpty
                  ? slug
                  : '${band}_$frequency';
          final artwork = _absolute(_string(
            station['artwork'] ?? station['artworkUrl'] ?? station['artwork_url'] ?? station['image'] ?? station['imageUrl'],
          ));
          final location = _string(station['location'] ?? station['coverageLabel'] ?? station['coverage_label']);
          final item = MediaItem(
            id: 'station:$identity',
            title: name,
            artist: designation.isEmpty ? 'Reality Radio Network' : designation,
            album: location.isEmpty ? 'Reality Dial' : '$location · Reality Dial',
            artUri: artwork.isEmpty ? null : Uri.tryParse(artwork),
            playable: true,
            extras: {
              'rrnType': 'station',
              'resourceType': 'station',
              'resourceId': stationId.isNotEmpty ? stationId : identity,
              'stationId': stationId,
              'slug': slug,
              'stationName': name,
              'band': band,
              'frequency': station['frequency'],
              'designation': designation,
              'streamUrl': streamUrl,
              'isLive': true,
            },
          );
          next[item.id] = item;
        }
        if (next.isNotEmpty) {
          _browseStations
            ..clear()
            ..addAll(next);
          _browseLoadedAt = DateTime.now();
        }
        return List<MediaItem>.unmodifiable(_browseStations.values);
      } finally {
        _browseLoad = null;
      }
    }();
    _browseLoad = future;
    return future;
  }

  MediaItem get _stationsFolder => const MediaItem(
        id: _stationsId,
        title: 'Reality Dial Stations',
        artist: 'Reality Radio Network',
        album: 'Live internet radio',
        playable: false,
      );

  @override
  Future<List<MediaItem>> getChildren(String parentMediaId, [Map<String, dynamic>? options]) async {
    if (parentMediaId.isEmpty || parentMediaId == _rootId) {
      return [_stationsFolder];
    }
    if (parentMediaId == _stationsId) {
      return _loadBrowseStations();
    }
    return const [];
  }

  @override
  Future<MediaItem?> getMediaItem(String mediaId) async {
    if (mediaId == _stationsId) return _stationsFolder;
    final cached = _browseStations[mediaId];
    if (cached != null) return cached;
    await _loadBrowseStations();
    return _browseStations[mediaId];
  }

  @override
  Future<void> playFromMediaId(String mediaId, [Map<String, dynamic>? extras]) async {
    var item = _browseStations[mediaId];
    item ??= await getMediaItem(mediaId);
    if (item == null || item.playable != true) return;
    final streamUrl = _string(item.extras?['streamUrl']);
    if (streamUrl.isEmpty) return;
    await loadSingle(url: streamUrl, item: item, autoplay: true, volume: _volume, isLive: true);
  }

  @override
  Future<void> playFromSearch(String query, [Map<String, dynamic>? extras]) async {
    final stations = await _loadBrowseStations();
    final clean = query.trim().toLowerCase();
    if (stations.isEmpty) return;
    MediaItem selected = stations.first;
    if (clean.isNotEmpty) {
      for (final item in stations) {
        final haystack = '${item.title} ${item.artist ?? ''} ${item.album ?? ''}'.toLowerCase();
        if (haystack.contains(clean)) {
          selected = item;
          break;
        }
      }
    }
    await playFromMediaId(selected.id, extras);
  }

  Future<void> loadSingle({
    required String url,
    required MediaItem item,
    bool autoplay = true,
    double volume = 1,
    bool isLive = false,
  }) => loadQueue(
        urls: [url],
        items: [item],
        index: 0,
        autoplay: autoplay,
        volume: volume,
        isLive: isLive,
      );

  Future<void> loadQueue({
    required List<String> urls,
    required List<MediaItem> items,
    required int index,
    bool autoplay = true,
    double volume = 1,
    bool isLive = false,
  }) async {
    if (urls.isEmpty || items.isEmpty || urls.length != items.length) {
      throw StateError('RRN playback queue is empty or invalid.');
    }
    if (urls.any((e) => e.isEmpty)) throw StateError('An RRN queue item has no playable source.');

    _items
      ..clear()
      ..addAll(items);
    _urls
      ..clear()
      ..addAll(urls);
    _index = index.clamp(0, items.length - 1).toInt();
    _isLive = isLive;
    _volume = volume.clamp(0, 1).toDouble();
    queue.add(List<MediaItem>.unmodifiable(_items));
    await _loadIndex(_index, autoplay: autoplay);
  }

  Future<void> _loadIndex(int index, {bool autoplay = true}) async {
    if (_items.isEmpty) return;
    _index = index.clamp(0, _items.length - 1).toInt();
    final item = _items[_index];
    final url = _urls[_index];

    mediaItem.add(item);
    _broadcastState(player.playbackEvent, loadingOverride: true);
    await player.stop();
    await player.setAudioSource(AudioSource.uri(Uri.parse(url)), preload: true);
    await player.setVolume(_volume);

    if (autoplay) {
      unawaited(player.play());
      _broadcastState(player.playbackEvent, playingOverride: true);
    } else {
      _broadcastState(player.playbackEvent, playingOverride: false);
    }
  }

  void updateNowPlaying(MediaItem item) {
    mediaItem.add(item);
    if (_items.isNotEmpty) {
      _items[_index] = item;
      queue.add(List<MediaItem>.unmodifiable(_items));
    } else {
      _items.add(item);
      queue.add(List<MediaItem>.unmodifiable(_items));
    }
    _broadcastState(player.playbackEvent);
  }

  Future<void> setOutputVolume(double value) async {
    _volume = value.clamp(0, 1).toDouble();
    await player.setVolume(_volume);
  }

  @override
  Future<void> play() async {
    if (mediaItem.valueOrNull == null || player.audioSource == null) return;
    if (!player.playing) {
      unawaited(player.play());
      _broadcastState(player.playbackEvent, playingOverride: true);
    }
  }

  @override
  Future<void> pause() async {
    if (player.audioSource == null) return;
    await player.pause();
    _broadcastState(player.playbackEvent, playingOverride: false);
  }

  @override
  Future<void> stop() async {
    await player.stop();
    _items.clear();
    _urls.clear();
    _index = 0;
    _isLive = false;
    mediaItem.add(null);
    queue.add(const <MediaItem>[]);
    _broadcastState(player.playbackEvent, playingOverride: false);
    await super.stop();
  }

  @override
  Future<void> seek(Duration position) async {
    if (_isLive || player.audioSource == null) return;
    await player.seek(position);
    _broadcastState(player.playbackEvent);
  }

  @override
  Future<void> skipToNext() async {
    if (!canSkip) return;
    final next = _shuffleMode == AudioServiceShuffleMode.all ? _randomDifferentIndex() : (_index + 1) % _items.length;
    await _loadIndex(next);
  }

  @override
  Future<void> skipToPrevious() async {
    if (!canSkip) return;
    if (player.position > const Duration(seconds: 5)) {
      await seek(Duration.zero);
      return;
    }
    final previous = _shuffleMode == AudioServiceShuffleMode.all ? _randomDifferentIndex() : (_index - 1 + _items.length) % _items.length;
    await _loadIndex(previous);
  }

  @override
  Future<void> skipToQueueItem(int index) async {
    if (_isLive || index < 0 || index >= _items.length) return;
    await _loadIndex(index);
  }

  @override
  Future<void> setRepeatMode(AudioServiceRepeatMode repeatMode) async {
    _repeatMode = repeatMode;
    _broadcastState(player.playbackEvent);
  }

  @override
  Future<void> setShuffleMode(AudioServiceShuffleMode shuffleMode) async {
    _shuffleMode = shuffleMode;
    _broadcastState(player.playbackEvent);
  }

  int _randomDifferentIndex() {
    if (_items.length <= 1) return _index;
    var next = _index;
    while (next == _index) {
      next = _random.nextInt(_items.length);
    }
    return next;
  }

  Future<void> _handleCompletion() async {
    if (_handlingCompletion || _isLive || _items.isEmpty) return;
    _handlingCompletion = true;
    try {
      if (_repeatMode == AudioServiceRepeatMode.one) {
        await player.seek(Duration.zero);
        unawaited(player.play());
      } else if (_index < _items.length - 1) {
        await skipToNext();
      } else if (_repeatMode == AudioServiceRepeatMode.all) {
        await _loadIndex(0);
      } else {
        await player.pause();
        await player.seek(Duration.zero);
        _broadcastState(player.playbackEvent, playingOverride: false);
      }
    } finally {
      _handlingCompletion = false;
    }
  }

  void _broadcastState(
    PlaybackEvent event, {
    bool? playingOverride,
    bool loadingOverride = false,
  }) {
    final hasMedia = mediaItem.valueOrNull != null;
    final playing = playingOverride ?? player.playing;
    final controls = <MediaControl>[];

    if (hasMedia) {
      if (canSkip) controls.add(MediaControl.skipToPrevious);
      controls.add(playing ? MediaControl.pause : MediaControl.play);
      if (canSkip) controls.add(MediaControl.skipToNext);
      controls.add(MediaControl.stop);
    }

    final processing = loadingOverride
        ? AudioProcessingState.loading
        : switch (player.processingState) {
            ProcessingState.idle => hasMedia ? AudioProcessingState.ready : AudioProcessingState.idle,
            ProcessingState.loading => AudioProcessingState.loading,
            ProcessingState.buffering => AudioProcessingState.buffering,
            ProcessingState.ready => AudioProcessingState.ready,
            ProcessingState.completed => AudioProcessingState.completed,
          };

    final compact = canSkip ? const <int>[0, 1, 2] : const <int>[0, 1];
    final actions = <MediaAction>{MediaAction.playPause, MediaAction.stop};
    if (!_isLive) actions.add(MediaAction.seek);
    if (canSkip) {
      actions
        ..add(MediaAction.skipToPrevious)
        ..add(MediaAction.skipToNext)
        ..add(MediaAction.skipToQueueItem)
        ..add(MediaAction.setRepeatMode)
        ..add(MediaAction.setShuffleMode);
    }

    playbackState.add(
      PlaybackState(
        controls: controls,
        systemActions: actions,
        androidCompactActionIndices: hasMedia ? compact : const <int>[],
        processingState: processing,
        playing: hasMedia && playing,
        updatePosition: player.position,
        bufferedPosition: player.bufferedPosition,
        speed: player.speed,
        queueIndex: hasMedia ? _index : null,
        repeatMode: _repeatMode,
        shuffleMode: _shuffleMode,
      ),
    );
  }

  Future<void> disposeHandler() async {
    await _eventSub?.cancel();
    await _playingSub?.cancel();
    await _processingSub?.cancel();
    await _speedSub?.cancel();
    await player.dispose();
  }
}
