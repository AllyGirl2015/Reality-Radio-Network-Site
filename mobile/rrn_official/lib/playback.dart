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
  StreamSubscription<MediaItem?>? _mediaSub;

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

    player.playerStateStream.listen((state) {
      if (!_switchingSource) {
        phase = state.playing
            ? RrnPlaybackPhase.playing
            : hasItem
                ? RrnPlaybackPhase.paused
                : RrnPlaybackPhase.idle;
      }
      notifyListeners();
    });
    player.positionStream.listen((_) => notifyListeners());
    player.durationStream.listen((_) => notifyListeners());
    player.playbackEventStream.listen(
      (_) {},
      onError: (Object error, StackTrace _) {
        lastError = '$error';
        phase = RrnPlaybackPhase.error;
        notifyListeners();
      },
    );
    _mediaSub = handler.mediaItem.listen((item) {
      if (item == null && hasItem) {
        _clearLocalState();
        notifyListeners();
      }
    });

    phase = RrnPlaybackPhase.idle;
    notifyListeners();
  }

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
          station.designation.isNotEmpty ? station.designation : '${station.frequency.toStringAsFixed(1)} ${station.band}',
      ].where((e) => e.isNotEmpty).join(' · ');

  MediaItem _stationMediaItem(Station station, RadioMetadata? metadata) {
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
    return MediaItem(
      id: 'station:${_stationIdentity(station)}',
      title: trackTitle,
      artist: artist,
      album: '${station.name} · $designation',
      artUri: art.isNotEmpty ? Uri.tryParse(art) : null,
      extras: {
        'rrnType': 'station',
        'resourceType': 'station',
        'resourceId': station.id.isNotEmpty ? station.id : _stationIdentity(station),
        'stationId': station.id,
        'slug': station.slug,
        'stationName': station.name,
        'band': station.band,
        'frequency': station.frequency,
        'designation': designation,
        'presenter': metadata?.presenter ?? '',
        'show': metadata?.show ?? '',
        'program': metadata?.program ?? '',
        'trackTitle': metadata?.title ?? '',
        'trackArtist': metadata?.artist ?? '',
        'isLive': true,
      },
    );
  }

  MediaItem _musicMediaItem(Map<String, dynamic> item, {Duration? duration}) {
    final itemTitle = str(item['title'] ?? item['name'], 'RRN Music');
    final itemArtist = str(item['artist'] ?? item['artistName'] ?? item['artist_name']);
    final itemAlbum = str(item['album'] ?? item['albumTitle'] ?? item['album_title'] ?? item['releaseTitle'] ?? item['release_title']);
    final art = _absolute(str(item['artwork'] ?? item['artwork_url'] ?? item['image'] ?? item['coverUrl'] ?? item['cover_url'] ?? item['artworkUrl']));
    final id = str(item['id'] ?? item['slug'] ?? item['catalog'], musicUrl(item));
    return MediaItem(
      id: 'music:$id',
      title: itemTitle,
      artist: itemArtist.isEmpty ? 'Reality Radio Network' : itemArtist,
      album: itemAlbum,
      duration: duration,
      artUri: art.isNotEmpty ? Uri.tryParse(art) : null,
      extras: {'rrnType': 'music', 'resourceType': 'track', 'resourceId': id, 'isLive': false},
    );
  }

  Future<void> playStation(
    Station station, {
    RadioMetadata? metadata,
    double volume = 1,
    bool autoplay = true,
  }) {
    final stream = _absolute(station.streamUrl);
    if (stream.isEmpty) return Future.error(StateError('This station does not currently expose a playable stream.'));
    final nextId = 'station:${_stationIdentity(station)}';
    _desiredSourceId = nextId;

    return _serialize(() async {
      if (_desiredSourceId != nextId || _handler == null) return;
      lastError = null;
      _switchingSource = sourceId != nextId;
      phase = RrnPlaybackPhase.loading;
      notifyListeners();

      final media = _stationMediaItem(station, metadata);
      kind = RrnPlaybackKind.station;
      title = station.name;
      subtitle = _stationSubtitle(station, metadata);
      album = media.album ?? '';
      artwork = media.artUri?.toString() ?? '';
      live = true;
      raw = station.raw;

      try {
        await _handler!.loadSource(url: stream, item: media, autoplay: autoplay, volume: volume);
        if (_desiredSourceId != nextId) return;
        sourceId = nextId;
        phase = autoplay ? RrnPlaybackPhase.playing : RrnPlaybackPhase.paused;
      } finally {
        _switchingSource = false;
      }
      notifyListeners();
    });
  }

  Future<void> playMusic(Map<String, dynamic> item, {bool autoplay = true}) {
    final stream = musicUrl(item);
    if (stream.isEmpty) return Future.error(StateError('This RRN track does not expose a playable stream.'));
    final itemId = str(item['id'] ?? item['slug'] ?? item['catalog'], stream);
    final nextId = 'music:$itemId';
    _desiredSourceId = nextId;

    return _serialize(() async {
      if (_desiredSourceId != nextId || _handler == null) return;
      lastError = null;
      _switchingSource = sourceId != nextId;
      phase = RrnPlaybackPhase.loading;
      notifyListeners();

      final media = _musicMediaItem(item);
      kind = RrnPlaybackKind.music;
      title = media.title;
      subtitle = [media.artist ?? '', media.album ?? ''].where((e) => e.isNotEmpty).join(' · ');
      album = media.album ?? '';
      artwork = media.artUri?.toString() ?? '';
      live = false;
      raw = Map<String, dynamic>.from(item);

      try {
        await _handler!.loadSource(url: stream, item: media, autoplay: autoplay, volume: 1);
        if (_desiredSourceId != nextId) return;
        sourceId = nextId;
        phase = autoplay ? RrnPlaybackPhase.playing : RrnPlaybackPhase.paused;
      } finally {
        _switchingSource = false;
      }
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
    _handler?.updateNowPlaying(media);
    notifyListeners();
  }

  Future<void> pause() => _serialize(() async {
        if (_handler == null || player.audioSource == null) return;
        await _handler!.pause();
        phase = RrnPlaybackPhase.paused;
        notifyListeners();
      });

  Future<void> resume() => _serialize(() async {
        if (_handler == null || player.audioSource == null) return;
        await _handler!.play();
        phase = RrnPlaybackPhase.playing;
        notifyListeners();
      });

  Future<void> toggle() => playing ? pause() : resume();

  Future<void> stop() {
    _desiredSourceId = '';
    return _serialize(() async {
      if (_handler != null) await _handler!.stop();
      _clearLocalState();
      notifyListeners();
    });
  }

  Future<void> seek(Duration value) => _serialize(() async {
        if (_handler == null || live || player.audioSource == null) return;
        await _handler!.seek(value);
        notifyListeners();
      });

  Future<void> setVolume(double value) async {
    if (_handler == null) return;
    await _handler!.setOutputVolume(value);
  }

  void _clearLocalState() {
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
    _switchingSource = false;
  }
}
