import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:just_audio/just_audio.dart';
import 'package:just_audio_background/just_audio_background.dart';

import 'core.dart';

enum RrnPlaybackKind { none, station, music }

class RrnPlaybackController extends ChangeNotifier {
  RrnPlaybackController._() {
    _stateSub = player.playerStateStream.listen((_) => notifyListeners());
    _positionSub = player.positionStream.listen((_) => notifyListeners());
    _durationSub = player.durationStream.listen((_) => notifyListeners());
  }

  static final RrnPlaybackController instance = RrnPlaybackController._();

  final AudioPlayer player = AudioPlayer();
  StreamSubscription<PlayerState>? _stateSub;
  StreamSubscription<Duration>? _positionSub;
  StreamSubscription<Duration?>? _durationSub;

  RrnPlaybackKind kind = RrnPlaybackKind.none;
  String sourceId = '';
  String title = '';
  String subtitle = '';
  String album = '';
  String artwork = '';
  bool live = false;
  Map<String, dynamic> raw = const {};

  bool get hasItem => kind != RrnPlaybackKind.none && title.isNotEmpty;
  bool get playing => player.playing;
  Duration get position => player.position;
  Duration get duration => player.duration ?? Duration.zero;

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

  Future<void> playStation(
    Station station, {
    RadioMetadata? metadata,
    double volume = 1,
    bool autoplay = true,
  }) async {
    final stream = station.streamUrl;
    if (stream.isEmpty) throw StateError('This station does not currently expose a playable stream.');

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

    if (sourceId != nextId || player.audioSource == null) {
      await player.setAudioSource(
        AudioSource.uri(
          Uri.parse(stream),
          tag: MediaItem(
            id: nextId,
            title: mediaTitle,
            artist: mediaArtist,
            album: mediaAlbum,
            artUri: art.isNotEmpty ? Uri.tryParse(art) : null,
          ),
        ),
      );
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
    if (autoplay && !player.playing) await player.play();
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

    if (sourceId != nextId || player.audioSource == null) {
      await player.setAudioSource(
        AudioSource.uri(
          Uri.parse(stream),
          tag: MediaItem(
            id: nextId,
            title: itemTitle,
            artist: itemArtist.isEmpty ? 'Reality Radio Network' : itemArtist,
            album: itemAlbum,
            artUri: art.isNotEmpty ? Uri.tryParse(art) : null,
          ),
        ),
      );
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
    if (autoplay && !player.playing) await player.play();
    notifyListeners();
  }

  Future<void> pause() async {
    await player.pause();
    notifyListeners();
  }

  Future<void> resume() async {
    if (player.audioSource != null) await player.play();
    notifyListeners();
  }

  Future<void> toggle() => player.playing ? pause() : resume();

  Future<void> stop() async {
    await player.stop();
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
    if (!live) await player.seek(position);
  }

  Future<void> setVolume(double value) => player.setVolume(value.clamp(0, 1).toDouble());
}
