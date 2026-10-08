import 'dart:async';
import 'dart:math';

import 'package:audio_service/audio_service.dart';
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

  final AudioPlayer player = AudioPlayer();
  final Random _random = Random();

  StreamSubscription<PlaybackEvent>? _eventSub;
  StreamSubscription<bool>? _playingSub;
  StreamSubscription<ProcessingState>? _processingSub;
  StreamSubscription<double>? _speedSub;

  final List<MediaItem> _items = [];
  final List<String> _urls = [];
  int _index = 0;
  bool _isLive = false;
  bool _handlingCompletion = false;
  double _volume = 1;
  AudioServiceRepeatMode _repeatMode = AudioServiceRepeatMode.none;
  AudioServiceShuffleMode _shuffleMode = AudioServiceShuffleMode.none;

  int get currentIndex => _index;
  bool get isLive => _isLive;
  bool get canSkip => !_isLive && _items.length > 1;
  AudioServiceRepeatMode get repeatSetting => _repeatMode;
  AudioServiceShuffleMode get shuffleSetting => _shuffleMode;

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
    _index = index.clamp(0, items.length - 1);
    _isLive = isLive;
    _volume = volume.clamp(0, 1).toDouble();
    queue.add(List<MediaItem>.unmodifiable(_items));
    await _loadIndex(_index, autoplay: autoplay);
  }

  Future<void> _loadIndex(int index, {bool autoplay = true}) async {
    if (_items.isEmpty) return;
    _index = index.clamp(0, _items.length - 1);
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
    final next = _shuffleMode == AudioServiceShuffleMode.all
        ? _randomDifferentIndex()
        : (_index + 1) % _items.length;
    await _loadIndex(next);
  }

  @override
  Future<void> skipToPrevious() async {
    if (!canSkip) return;
    if (player.position > const Duration(seconds: 5)) {
      await seek(Duration.zero);
      return;
    }
    final previous = _shuffleMode == AudioServiceShuffleMode.all
        ? _randomDifferentIndex()
        : (_index - 1 + _items.length) % _items.length;
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
