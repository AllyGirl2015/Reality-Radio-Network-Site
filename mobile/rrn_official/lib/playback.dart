import 'dart:async';

import 'package:audio_service/audio_service.dart';
import 'package:audio_session/audio_session.dart';
import 'package:flutter/foundation.dart';
import 'package:just_audio/just_audio.dart';

import 'audio_handler.dart';
import 'core.dart';

enum RrnPlaybackKind { none, station, music }

enum RrnPlaybackPhase { detached, idle, loading, playing, paused, error }

class RrnPlaybackController extends ChangeNotifier {
  RrnPlaybackController._();

  static final RrnPlaybackController instance = RrnPlaybackController._();

  RrnAudioHandler? _handler;
  Future<void> _operationChain = Future<void>.value();
  String _desiredSourceId = '';
  bool _switchingSource = false;

  RrnPlaybackKind kind = RrnPlaybackKind.none;
  RrnPlaybackPhase phase = RrnPlaybackPhase.detached;
  String sourceId = '';
  String title = '';
  String subtitle = '';
  String album = '';
  String artwork = '';
  String? lastError;
  bool live = false;
  Map<String, dynamic> raw = const {};

  bool get attached => _handler != null;
  AudioPlayer get player {
    final handler = _handler;
    if (handler == null) throw StateError('RRN audio service has not been attached yet.');
    return handler.player;
  }

  bool get hasItem => kind != RrnPlaybackKind.none && title.isNotEmpty;
  bool get playing => attached && player.playing;
  bool get transitioning => _switchingSource || phase == RrnPlaybackPhase.loading;
  Duration get position => attached ? player.position : Duration.zero;
  Duration get duration => attached ? (player.duration ?? Duration.zero) : Duration.zero;

  Future<void> attachHandler(RrnAudioHandler handler) async {
    if (_handler != null) return;
    _handler = handler;

    final session = await AudioSession.instance;
    await session.configure(const AudioSessionConfiguration.music());

    handler.onSystemPlay = resume;
    handler.onSystemPause = pause;
    handler.onSystemStop = stop;
    handler.onSystemSeek = seek;

    player.playerStateStream.listen((state) {
      if (!_switchingSource) {
        phase = state.playing ? RrnPlaybackPhase.playing : hasItem ? RrnPlaybackPhase.paused : RrnPlaybackPhase.idle;
      }
      notifyListeners();
    });
    player.positionStream.listen((_) => notifyListeners());
    player.durationStream.listen((_) => notifyListeners());
    player.playbackEventStream.listen(
      (_) {},
      onError: (Object error, StackTrace stackTrace) {
        lastError = '$error';
        phase = RrnPlaybackPhase.error;
        notifyListeners();
      },
    );

    phase = RrnPlaybackPhase.idle;
    notifyListeners();
  }

  Future<T> _serialize<T>(Future<T> Function() operation) {
    final completer = Completer<T>();
    _operationChain = _operationChain.catchError((_) {}).then((_) async {
      try {
        completer.complete(await operation());
      } catch (error, stackTrace) {
        completer.completeError(error, stackTrace);
      }
    });
    return completer.future;
  }

  String _absoluteArt(String value) {
    if (value.isEmpty) return '';
    if (value.startsWith('http://') || value.startsWith('https://')) return value;
    return '$rrnBase${value.startsWith('/') ? value : '/$value'}';
  }

  String musicUrl(Map<String, dynamic> item) => str(
        item['streamUrl'] ??
            item['stream_url'] ??
            item['audioUrl'] ??
            item['audio_url'] ??
            item['previewUrl'] ??
            item['preview_url'] ??
            item['fileUrl'] ??
            item['file_url'],
      );

  String _stationIdentity(Station station) => station.id.isNotEmpty
      ? station.id
      : station.slug.isNotEmpty
          ? station.slug
          : '${station.band}-${station.frequency.toStringAsFixed(3)}';

  String _stationSubtitle(Station station, RadioMetadata? metadata) {
    return [
      if (metadata?.artist.isNotEmpty == true) metadata!.artist,
      if (metadata?.title.isNotEmpty == true) metadata!.title,
      if (metadata?.presenter.isNotEmpty == true) metadata!.presenter,
      if (metadata?.show.isNotEmpty == true) metadata!.show,
      if ((metadata?.title.isEmpty ?? true) && metadata?.program.isNotEmpty == true) metadata!.program,
      if (metadata == null || (metadata.artist.isEmpty && metadata.title.isEmpty && metadata.program.isEmpty))
        station.designation.isNotEmpty ? station.designation : '${station.frequency.toStringAsFixed(1)} ${station.band}',
    ].where((e) => e.isNotEmpty).join(' · ');
  }

  MediaItem _stationMediaItem(Station station, RadioMetadata? metadata) {
    final art = _absoluteArt(metadata?.artwork.isNotEmpty == true ? metadata!.artwork : station.artwork);
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
    return MediaItem(
      id: 'station:${_stationIdentity(station)}',
      title: trackTitle,
      artist: artist,
      album: '${station.name} · $designation',
      artUri: art.isNotEmpty ? Uri.tryParse(art) : null,
      extras: {
        'rrnType': 'station',
        'stationId': station.id,
        'slug': station.slug,
        'stationName': station.name,
        'band': station.band,
        'frequency': station.frequency,
        'designation': designation,
        'isLive': true,
      },
    );
  }

  MediaItem _musicMediaItem(Map<String, dynamic> item, {Duration? duration}) {
    final itemTitle = str(item['title'] ?? item['name'], 'RRN Music');
    final itemArtist = str(item['artist'] ?? item['artistName'] ?? item['artist_name']);
    final itemAlbum = str(item['album'] ?? item['albumTitle'] ?? item['album_title'] ?? item['releaseTitle'] ?? item['release_title']);
    final art = _absoluteArt(str(item['artwork'] ?? item['image'] ?? item['coverUrl'] ?? item['cover_url'] ?? item['artworkUrl'] ?? item['artwork_url']));
    final id = str(item['id'] ?? item['slug'] ?? item['catalog'], musicUrl(item));
    return MediaItem(
      id: 'music:$id',
      title: itemTitle,
      artist: itemArtist.isEmpty ? 'Reality Radio Network' : itemArtist,
      album: itemAlbum,
      duration: duration,
      artUri: art.isNotEmpty ? Uri.tryParse(art) : null,
      extras: const {'rrnType': 'music', 'isLive': false},
    );
  }

  Future<void> playStation(
    Station station, {
    RadioMetadata? metadata,
    double volume = 1,
    bool autoplay = true,
  }) {
    final stream = station.streamUrl;
    if (stream.isEmpty) return Future.error(StateError('This station does not currently expose a playable stream.'));
    final nextId = 'station:${_stationIdentity(station)}';
    _desiredSourceId = nextId;

    return _serialize(() async {
      if (_desiredSourceId != nextId) return;
      lastError = null;
      final sameSource = sourceId == nextId && player.audioSource != null;
      final media = _stationMediaItem(station, metadata);

      if (!sameSource) {
        _switchingSource = true;
        phase = RrnPlaybackPhase.loading;
        notifyListeners();
        try {
          if (player.audioSource != null || player.processingState != ProcessingState.idle) {
            await player.stop();
          }
          if (_desiredSourceId != nextId) return;
          await player.setAudioSource(AudioSource.uri(Uri.parse(stream)));
          if (_desiredSourceId != nextId) return;
          sourceId = nextId;
        } finally {
          _switchingSource = false;
        }
      }

      kind = RrnPlaybackKind.station;
      title = station.name;
      subtitle = _stationSubtitle(station, metadata);
      album = media.album ?? '';
      artwork = media.artUri?.toString() ?? '';
      live = true;
      raw = station.raw;
      _handler!.setNowPlaying(media);
      await player.setVolume(volume.clamp(0, 1).toDouble());
      if (autoplay && !player.playing) await player.play();
      phase = player.playing ? RrnPlaybackPhase.playing : RrnPlaybackPhase.paused;
      notifyListeners();
    });
  }

  Future<void> playMusic(Map<String, dynamic> item, {bool autoplay = true}) {
    final stream = musicUrl(item);
    if (stream.isEmpty) return Future.error(StateError('This music item does not expose a playable preview or stream.'));
    final itemId = str(item['id'] ?? item['slug'] ?? item['catalog'], stream);
    final nextId = 'music:$itemId';
    _desiredSourceId = nextId;

    return _serialize(() async {
      if (_desiredSourceId != nextId) return;
      lastError = null;
      final sameSource = sourceId == nextId && player.audioSource != null;

      if (!sameSource) {
        _switchingSource = true;
        phase = RrnPlaybackPhase.loading;
        notifyListeners();
        try {
          if (player.audioSource != null || player.processingState != ProcessingState.idle) {
            await player.stop();
          }
          if (_desiredSourceId != nextId) return;
          await player.setAudioSource(AudioSource.uri(Uri.parse(stream)));
          if (_desiredSourceId != nextId) return;
          sourceId = nextId;
        } finally {
          _switchingSource = false;
        }
      }

      final media = _musicMediaItem(item, duration: player.duration);
      kind = RrnPlaybackKind.music;
      title = media.title;
      subtitle = [media.artist ?? '', media.album ?? ''].where((e) => e.isNotEmpty).join(' · ');
      album = media.album ?? '';
      artwork = media.artUri?.toString() ?? '';
      live = false;
      raw = Map<String, dynamic>.from(item);
      _handler!.setNowPlaying(media);
      await player.setVolume(1);
      if (autoplay && !player.playing) await player.play();
      phase = player.playing ? RrnPlaybackPhase.playing : RrnPlaybackPhase.paused;
      notifyListeners();
    });
  }

  void updateStationMetadata(Station station, RadioMetadata metadata) {
    final expected = 'station:${_stationIdentity(station)}';
    if (kind != RrnPlaybackKind.station || sourceId != expected) return;
    final media = _stationMediaItem(station, metadata);
    title = station.name;
    subtitle = _stationSubtitle(station, metadata);
    album = media.album ?? '';
    artwork = media.artUri?.toString() ?? '';
    _handler?.setNowPlaying(media);
    notifyListeners();
  }

  Future<void> pause() => _serialize(() async {
        if (!attached || player.audioSource == null) return;
        await player.pause();
        phase = RrnPlaybackPhase.paused;
        notifyListeners();
      });

  Future<void> resume() => _serialize(() async {
        if (!attached || player.audioSource == null) return;
        await player.play();
        phase = RrnPlaybackPhase.playing;
        notifyListeners();
      });

  Future<void> toggle() => playing ? pause() : resume();

  Future<void> stop() {
    _desiredSourceId = '';
    return _serialize(() async {
      if (attached) await player.stop();
      kind = RrnPlaybackKind.none;
      phase = RrnPlaybackPhase.idle;
      sourceId = '';
      title = '';
      subtitle = '';
      album = '';
      artwork = '';
      live = false;
      raw = const {};
      lastError = null;
      _handler?.clearNowPlaying();
      notifyListeners();
    });
  }

  Future<void> seek(Duration position) => _serialize(() async {
        if (!attached || live || player.audioSource == null) return;
        await player.seek(position);
        notifyListeners();
      });

  Future<void> setVolume(double value) async {
    if (!attached) return;
    await player.setVolume(value.clamp(0, 1).toDouble());
  }
}
