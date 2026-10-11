import 'dart:async';

import 'package:flutter/services.dart';

import 'playback.dart';

/// Mirrors the active RRN player into the Android MediaSession/MediaStyle layer.
/// All system transport and volume commands route back through the single shared
/// RrnPlaybackController so the Dial, mini-player, lock screen and notification
/// cannot intentionally own separate playback state.
class RrnSystemMediaBridge {
  RrnSystemMediaBridge._();

  static final RrnSystemMediaBridge instance = RrnSystemMediaBridge._();
  static const MethodChannel _channel = MethodChannel('com.rbew.rrn_official/system_media');

  RrnPlaybackController? _playback;
  Timer? _positionTicker;
  bool _attached = false;
  String _lastSignature = '';

  Future<void> attach(RrnPlaybackController playback) async {
    if (_attached) return;
    _attached = true;
    _playback = playback;
    _channel.setMethodCallHandler(_handleNativeCommand);
    playback.addListener(_publish);
    _positionTicker = Timer.periodic(const Duration(seconds: 3), (_) {
      if (playback.hasItem) _publish(positionTick: true);
    });
    await _publish(force: true);
  }

  double _volume(RrnPlaybackController playback) => playback.attached ? playback.player.volume : 1.0;

  Future<dynamic> _handleNativeCommand(MethodCall call) async {
    final playback = _playback;
    if (playback == null) return null;

    switch (call.method) {
      case 'play':
        await playback.resume();
        break;
      case 'pause':
        await playback.pause();
        break;
      case 'toggle':
        await playback.toggle();
        break;
      case 'stop':
        await playback.stop();
        break;
      case 'next':
        await playback.skipNext();
        break;
      case 'previous':
        await playback.skipPrevious();
        break;
      case 'seekTo':
        final value = call.arguments;
        final ms = value is num
            ? value.round()
            : value is Map && value['positionMs'] is num
                ? (value['positionMs'] as num).round()
                : 0;
        await playback.seek(Duration(milliseconds: ms));
        break;
      case 'setVolume':
        final value = call.arguments;
        final raw = value is num
            ? value.toDouble()
            : value is Map && value['volume'] is num
                ? (value['volume'] as num).toDouble()
                : _volume(playback);
        await playback.setVolume((raw > 1 ? raw / 100 : raw).clamp(0.0, 1.0));
        break;
    }
    await _publish(force: true);
    return null;
  }

  Future<void> _publish({bool force = false, bool positionTick = false}) async {
    final playback = _playback;
    if (playback == null) return;

    if (!playback.hasItem) {
      if (_lastSignature.isNotEmpty || force) {
        _lastSignature = '';
        try {
          await _channel.invokeMethod<void>('clear');
        } catch (_) {}
      }
      return;
    }

    final payload = <String, dynamic>{
      'title': playback.title,
      'subtitle': playback.subtitle,
      'album': playback.album,
      'artwork': playback.artwork,
      'live': playback.live,
      'playing': playback.playing,
      'loading': playback.transitioning,
      'canPrevious': playback.canSkip,
      'canNext': playback.canSkip,
      'canSeek': !playback.live && playback.duration > Duration.zero,
      'positionMs': playback.position.inMilliseconds,
      'durationMs': playback.duration.inMilliseconds,
      'sourceId': playback.sourceId,
      'volume': _volume(playback),
    };

    final signature = [
      payload['sourceId'],
      payload['title'],
      payload['subtitle'],
      payload['album'],
      payload['artwork'],
      payload['live'],
      payload['playing'],
      payload['loading'],
      payload['canPrevious'],
      payload['canNext'],
      payload['durationMs'],
      payload['volume'],
    ].join('|');

    if (!force && !positionTick && signature == _lastSignature) return;
    _lastSignature = signature;
    try {
      await _channel.invokeMethod<void>('update', payload);
    } catch (_) {
      // Non-Android builds simply continue without the Android media surface.
    }
  }
}
