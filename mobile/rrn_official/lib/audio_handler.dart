import 'dart:async';

import 'package:audio_service/audio_service.dart';
import 'package:just_audio/just_audio.dart';

/// The Android AudioService owns the real AudioPlayer.
///
/// UI controllers may request source changes, but play/pause/stop/seek are
/// executed here so playback and the MediaSession remain alive when Flutter's
/// activity is backgrounded or the screen is off.
class RrnAudioHandler extends BaseAudioHandler with SeekHandler {
  RrnAudioHandler() {
    _eventSub = player.playbackEventStream.listen(
      _broadcastState,
      onError: (Object _, StackTrace __) => _broadcastState(player.playbackEvent),
    );
    _playingSub = player.playingStream.listen((_) => _broadcastState(player.playbackEvent));
    _processingSub = player.processingStateStream.listen((_) => _broadcastState(player.playbackEvent));
    _speedSub = player.speedStream.listen((_) => _broadcastState(player.playbackEvent));
  }

  final AudioPlayer player = AudioPlayer();

  StreamSubscription<PlaybackEvent>? _eventSub;
  StreamSubscription<bool>? _playingSub;
  StreamSubscription<ProcessingState>? _processingSub;
  StreamSubscription<double>? _speedSub;

  String _loadedUrl = '';

  Future<void> loadSource({
    required String url,
    required MediaItem item,
    bool autoplay = true,
    double volume = 1,
  }) async {
    if (url.isEmpty) throw StateError('No playable audio source was supplied.');

    // Publish the MediaItem before starting the player. Android needs a real
    // item + playing state in order to create its media notification/session.
    mediaItem.add(item);
    queue.add(<MediaItem>[item]);
    _broadcastState(player.playbackEvent, loadingOverride: _loadedUrl != url);

    if (_loadedUrl != url || player.audioSource == null) {
      await player.stop();
      await player.setAudioSource(AudioSource.uri(Uri.parse(url)));
      _loadedUrl = url;
    }

    await player.setVolume(volume.clamp(0, 1).toDouble());
    if (autoplay && !player.playing) {
      // just_audio's play Future completes when playback ends, so never await
      // it for a live stream. Publish playing immediately so Android promotes
      // AudioService to a foreground media-playback service without waiting on
      // a later UI frame.
      unawaited(player.play());
      _broadcastState(player.playbackEvent, playingOverride: true);
    } else {
      _broadcastState(player.playbackEvent);
    }
  }

  void updateNowPlaying(MediaItem item) {
    mediaItem.add(item);
    if (queue.value.isEmpty) {
      queue.add(<MediaItem>[item]);
    } else {
      queue.add(<MediaItem>[item]);
    }
    _broadcastState(player.playbackEvent);
  }

  Future<void> setOutputVolume(double value) => player.setVolume(value.clamp(0, 1).toDouble());

  void publishState() => _broadcastState(player.playbackEvent);

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
    _loadedUrl = '';
    mediaItem.add(null);
    queue.add(const <MediaItem>[]);
    _broadcastState(player.playbackEvent, playingOverride: false);
    await super.stop();
  }

  @override
  Future<void> seek(Duration position) async {
    if (player.audioSource == null) return;
    await player.seek(position);
    _broadcastState(player.playbackEvent);
  }

  void _broadcastState(
    PlaybackEvent event, {
    bool? playingOverride,
    bool loadingOverride = false,
  }) {
    final hasMedia = mediaItem.valueOrNull != null;
    final playing = playingOverride ?? player.playing;
    final controls = <MediaControl>[
      playing ? MediaControl.pause : MediaControl.play,
      MediaControl.stop,
    ];

    final processing = loadingOverride
        ? AudioProcessingState.loading
        : switch (player.processingState) {
            ProcessingState.idle => hasMedia ? AudioProcessingState.ready : AudioProcessingState.idle,
            ProcessingState.loading => AudioProcessingState.loading,
            ProcessingState.buffering => AudioProcessingState.buffering,
            ProcessingState.ready => AudioProcessingState.ready,
            ProcessingState.completed => AudioProcessingState.completed,
          };

    playbackState.add(
      PlaybackState(
        controls: hasMedia ? controls : const <MediaControl>[],
        systemActions: hasMedia
            ? const <MediaAction>{MediaAction.playPause, MediaAction.stop, MediaAction.seek}
            : const <MediaAction>{},
        androidCompactActionIndices: hasMedia ? const <int>[0, 1] : const <int>[],
        processingState: processing,
        playing: hasMedia && playing,
        updatePosition: player.position,
        bufferedPosition: player.bufferedPosition,
        speed: player.speed,
        queueIndex: hasMedia ? 0 : null,
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
