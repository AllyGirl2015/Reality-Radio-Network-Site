import 'dart:async';

import 'package:audio_service/audio_service.dart';
import 'package:flutter/foundation.dart';
import 'package:just_audio/just_audio.dart';

import 'core.dart';

enum RrnPlaybackKind { none, station, music }

class RrnAudioHandler extends BaseAudioHandler with SeekHandler {
  final AudioPlayer player = AudioPlayer();

  RrnAudioHandler() {
    player.playbackEventStream.listen((event) {
      playbackState.add(_transformEvent(event));
    });
    player.durationStream.listen((duration) {
      final current = mediaItem.value;
      if (current != null && duration != null && current.duration != duration) {
        mediaItem.add(current.copyWith(duration: duration));
      }
    });
  }

  Future<void> load(Uri uri, MediaItem item) async {
    mediaItem.add(item);
    await player.setAudioSource(AudioSource.uri(uri));
    playbackState.add(_transformEvent(player.playbackEvent));
  }

  void updateMediaItem(MediaItem item) {
    mediaItem.add(item);
  }

  void clearMediaItem() {
    mediaItem.add(null);
  }

  @override
  Future<void> play() => player.play();

  @override
  Future<void> pause() => player.pause();

  @override
  Future<void> seek(Duration position) => player.seek(position);

  @override
  Future<void> stop() async {
    await player.stop();
    playbackState.add(_transformEvent(player.playbackEvent));
  }

  PlaybackState _transformEvent(PlaybackEvent event) {
    return PlaybackState(
      controls: [
        if (player.playing) MediaControl.pause else MediaControl.play,
        MediaControl.stop,
      ],
      systemActions: const {
        MediaAction.seek,
        MediaAction.seekForward,
        MediaAction.seekBackward,
      },
      androidCompactActionIndices: const [0, 1],
      processingState: const {
        ProcessingState.idle: AudioProcessingState.idle,
        ProcessingState.loading: AudioProcessingState.loading,
        ProcessingState.buffering: AudioProcessingState.buffering,
        ProcessingState.ready: AudioProcessingState.ready,
        ProcessingState.completed: AudioProcessingState.completed,
      }[player.processingState]!,
      playing: player.playing,
      updatePosition: player.position,
      bufferedPosition: player.bufferedPosition,
      speed: player.speed,
      queueIndex: event.currentIndex,
    );
  }
}

class RrnPlaybackController extends ChangeNotifier {
  RrnPlaybackController._();

  static final RrnPlaybackController instance = RrnPlaybackController._();

  RrnAudioHandler? _handler;
  StreamSubscription<PlayerState>? _stateSub;
  StreamSubscription<Duration>? _positionSub;
  StreamSubscription<Duration?>? _durationSub;
  StreamSubscription<PlaybackState>? _serviceStateSub;
  StreamSubscription<MediaItem?>? _serviceItemSub;

  RrnPlaybackKind kind = RrnPlaybackKind.none;
  String sourceId = '';
  String title = '';
  String subtitle = '';
  String album = '';
  String artwork = '';
  bool live = false;
  Map<String, dynamic> raw = const {};

  AudioPlayer get player {
    final handler = _handler;
    if (handler == null) throw StateError('RRN audio service is not initialized.');
    return handler.player;
  }

  RrnAudioHandler get handler {
    final value = _handler;
    if (value == null) throw StateError('RRN audio service is not initialized.');
    return value;
  }

  bool get hasItem => kind != RrnPlaybackKind.none && title.isNotEmpty;
  bool get playing => _handler?.player.playing ?? false;
  Duration get position => _handler?.player.position ?? Duration.zero;
  Duration get duration => _handler?.player.duration ?? Duration.zero;

  Future<void> attach(RrnAudioHandler audioHandler) async {
    await _stateSub?.cancel();
    await _positionSub?.cancel();
    await _durationSub?.cancel();
    await _serviceStateSub?.cancel();
    await _serviceItemSub?.cancel();

    _handler = audioHandler;
    _stateSub = audioHandler.player.playerStateStream.listen((_) => notifyListeners());
    _positionSub = audioHandler.player.positionStream.listen((_) => notifyListeners());
    _durationSub = audioHandler.player.durationStream.listen((_) => notifyListeners());
    _serviceStateSub = audioHandler.playbackState.listen((_) => notifyListeners());
    _serviceItemSub = audioHandler.mediaItem.listen((_) => notifyListeners());
    notifyListeners();
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

  MediaItem _stationMediaItem(Station station, RadioMetadata? metadata) {
    final mediaTitle = metadata?.title.isNotEmpty == true
        ? metadata!.title
        : metadata?.program.isNotEmpty == true
            ? metadata!.program
            : station.name;
    final mediaArtist = metadata?.artist.isNotEmpty == true
        ? metadata!.artist
        : metadata?.presenter.isNotEmpty == true
            ? metadata!.presenter
            : 'Reality Radio Network';
    final mediaAlbum = station.designation.isNotEmpty
        ? '${station.name} · ${station.designation}'
        : '${station.name} · ${station.frequency.toStringAsFixed(1)} ${station.band}';
    final art = _absoluteArt(metadata?.artwork.isNotEmpty == true ? metadata!.artwork : station.artwork);
    final nextId = 'station:${station.id.isNotEmpty ? station.id : station.slug}';

    return MediaItem(
      id: nextId,
      title: mediaTitle,
      artist: mediaArtist,
      album: mediaAlbum,
      artUri: art.isNotEmpty ? Uri.tryParse(art) : null,
      extras: {
        'kind': 'station',
        'stationId': station.id,
        'slug': station.slug,
        'band': station.band,
        'frequency': station.frequency,
        'designation': station.designation,
        'live': true,
      },
    );
  }

  Future<void> playStation(
    Station station, {
    RadioMetadata? metadata,
    double volume = 1,
    bool autoplay = true,
  }) async {
    final stream = station.streamUrl;
    if (stream.isEmpty) throw StateError('This station does not currently expose a playable stream.');

    final item = _stationMediaItem(station, metadata);
    final nextId = item.id;
    final mediaAlbum = item.album ?? '';
    final art = item.artUri?.toString() ?? '';

    if (sourceId != nextId || player.audioSource == null) {
      await handler.load(Uri.parse(stream), item);
    } else {
      handler.updateMediaItem(item);
    }

    kind = RrnPlaybackKind.station;
    sourceId = nextId;
    title = station.name;
    subtitle = [
      if (metadata?.artist.isNotEmpty == true) metadata!.artist,
      if (metadata?.title.isNotEmpty == true) metadata!.title,
      if (metadata?.presenter.isNotEmpty == true) metadata!.presenter,
      if (metadata?.show.isNotEmpty == true) metadata!.show,
      if ((metadata?.title.isEmpty ?? true) && (metadata?.program.isNotEmpty == true)) metadata!.program,
      if (metadata == null || (metadata.artist.isEmpty && metadata.title.isEmpty && metadata.program.isEmpty))
        station.designation.isNotEmpty ? station.designation : '${station.frequency.toStringAsFixed(1)} ${station.band}',
    ].where((e) => e.isNotEmpty).join(' · ');
    album = mediaAlbum;
    artwork = art;
    live = true;
    raw = station.raw;
    await player.setVolume(volume.clamp(0, 1).toDouble());
    if (autoplay && !player.playing) await handler.play();
    notifyListeners();
  }

  Future<void> updateStationMetadata(Station station, RadioMetadata metadata) async {
    final expected = 'station:${station.id.isNotEmpty ? station.id : station.slug}';
    if (kind != RrnPlaybackKind.station || sourceId != expected) return;

    final item = _stationMediaItem(station, metadata);
    handler.updateMediaItem(item);
    subtitle = [
      if (metadata.artist.isNotEmpty) metadata.artist,
      if (metadata.title.isNotEmpty) metadata.title,
      if (metadata.presenter.isNotEmpty) metadata.presenter,
      if (metadata.show.isNotEmpty) metadata.show,
      if (metadata.title.isEmpty && metadata.program.isNotEmpty) metadata.program,
    ].where((e) => e.isNotEmpty).join(' · ');
    artwork = item.artUri?.toString() ?? artwork;
    notifyListeners();
  }

  Future<void> playMusic(Map<String, dynamic> item, {bool autoplay = true}) async {
    final stream = musicUrl(item);
    if (stream.isEmpty) throw StateError('This music item does not expose a playable preview or stream.');

    final itemTitle = str(item['title'] ?? item['name'], 'RRN Music');
    final itemArtist = str(item['artist'] ?? item['artistName'] ?? item['artist_name']);
    final itemAlbum = str(item['album'] ?? item['albumTitle'] ?? item['album_title'] ?? item['releaseTitle'] ?? item['release_title']);
    final art = _absoluteArt(str(item['artwork'] ?? item['image'] ?? item['coverUrl'] ?? item['cover_url'] ?? item['artworkUrl'] ?? item['artwork_url']));
    final id = str(item['id'] ?? item['slug'] ?? item['catalog'], stream);
    final nextId = 'music:$id';
    final media = MediaItem(
      id: nextId,
      title: itemTitle,
      artist: itemArtist.isEmpty ? 'Reality Radio Network' : itemArtist,
      album: itemAlbum,
      artUri: art.isNotEmpty ? Uri.tryParse(art) : null,
      extras: const {'kind': 'music', 'live': false},
    );

    if (sourceId != nextId || player.audioSource == null) {
      await handler.load(Uri.parse(stream), media);
    } else {
      handler.updateMediaItem(media);
    }

    kind = RrnPlaybackKind.music;
    sourceId = nextId;
    title = itemTitle;
    subtitle = [itemArtist, itemAlbum].where((e) => e.isNotEmpty).join(' · ');
    album = itemAlbum;
    artwork = art;
    live = false;
    raw = Map<String, dynamic>.from(item);
    await player.setVolume(1);
    if (autoplay && !player.playing) await handler.play();
    notifyListeners();
  }

  Future<void> pause() async {
    await handler.pause();
    notifyListeners();
  }

  Future<void> resume() async {
    if (player.audioSource != null) await handler.play();
    notifyListeners();
  }

  Future<void> toggle() => player.playing ? pause() : resume();

  Future<void> stop() async {
    await handler.stop();
    handler.clearMediaItem();
    kind = RrnPlaybackKind.none;
    sourceId = '';
    title = '';
    subtitle = '';
    album = '';
    artwork = '';
    live = false;
    raw = const {};
    notifyListeners();
  }

  Future<void> seek(Duration position) async {
    if (!live) await handler.seek(position);
  }

  Future<void> setVolume(double value) => player.setVolume(value.clamp(0, 1).toDouble());
}
