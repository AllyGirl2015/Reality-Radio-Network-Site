import 'dart:async';

import 'package:audio_service/audio_service.dart';
import 'package:just_audio/just_audio.dart';

class RrnAudioHandler extends BaseAudioHandler with SeekHandler {
  RrnAudioHandler() {
    _eventSub = player.playbackEventStream.listen(_broadcastState);
    _playingSub = player.playingStream.listen((_) => _broadcastState(player.playbackEvent));
    _speedSub = player.speedStream.listen((_) => _broadcastState(player.playbackEvent));
    _processingSub = player.processingStateStream.listen((_) => _broadcastState(player.playbackEvent));
  }

  final AudioPlayer player = AudioPlayer();

  StreamSubscription<PlaybackEvent>? _eventSub;
  StreamSubscription<bool>? _playingSub;
  StreamSubscription<double>? _speedSub;
  StreamSubscription<ProcessingState>? _processingSub;

  Future<void> Function()? onSystemPlay;
  Future<void> Function()? onSystemPause;
  Future<void> Function()? onSystemStop;
  Future<void> Function(Duration position)? onSystemSeek;

  void setNowPlaying(MediaItem item) {
    mediaItem.add(item);
    _broadcastState(player.playbackEvent);
  }

  void clearNowPlaying() {
    mediaItem.add(null);
    _broadcastState(player.playbackEvent);
  }

  void publishState() => _broadcastState(player.playbackEvent);

  @override
  Future<void> play() async {
    final callback = onSystemPlay;
    if (callback != null) {
      await callback();
    } else if (!player.playing) {
      // AudioPlayer.play() completes when playback ends; don't block the
      // Android MediaSession command future for the lifetime of the stream.
      unawaited(player.play());
      _broadcastState(player.playbackEvent);
    }
  }

  @override
  Future<void> pause() async {
    final callback = onSystemPause;
    if (callback != null) {
      await callback();
    } else {
      await player.pause();
      _broadcastState(player.playbackEvent);
    }
  }

  @override
  Future<void> stop() async {
    final callback = onSystemStop;
    if (callback != null) {
      await callback();
    } else {
      await player.stop();
      clearNowPlaying();
    }
    await super.stop();
  }

  @override
  Future<void> seek(Duration position) async {
    final callback = onSystemSeek;
    if (callback != null) {
      await callback(position);
    } else {
      await player.seek(position);
      _broadcastState(player.playbackEvent);
    }
  }

  void _broadcastState(PlaybackEvent event) {
    final playing = player.playing;
    final hasMedia = mediaItem.valueOrNull != null;
    final controls = <MediaControl>[
      playing ? MediaControl.pause : MediaControl.play,
      MediaControl.stop,
    ];

    playbackState.add(
      PlaybackState(
        controls: hasMedia ? controls : const <MediaControl>[],
        systemActions: hasMedia ? const {MediaAction.playPause, MediaAction.stop, MediaAction.seek} : const {},
        androidCompactActionIndices: hasMedia ? const [0, 1] : const [],
        processingState: switch (player.processingState) {
          ProcessingState.idle => hasMedia ? AudioProcessingState.ready : AudioProcessingState.idle,
          ProcessingState.loading => AudioProcessingState.loading,
          ProcessingState.buffering => AudioProcessingState.buffering,
          ProcessingState.ready => AudioProcessingState.ready,
          ProcessingState.completed => AudioProcessingState.completed,
        },
        playing: playing,
        updatePosition: player.position,
        bufferedPosition: player.bufferedPosition,
        speed: player.speed,
        queueIndex: event.currentIndex,
      ),
    );
  }

  Future<void> disposeHandler() async {
    await _eventSub?.cancel();
    await _playingSub?.cancel();
    await _speedSub?.cancel();
    await _processingSub?.cancel();
    await player.dispose();
  }
}
