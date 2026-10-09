import 'package:flutter/material.dart';

import 'core.dart';
import 'playback.dart';

class RrnStreamControlsCard extends StatefulWidget {
  final Station? station;
  final RadioMetadata metadata;
  final double volume;
  final ValueChanged<double> onVolumeChanged;
  final VoidCallback onPreviousStation;
  final VoidCallback onNextStation;

  const RrnStreamControlsCard({
    super.key,
    required this.station,
    required this.metadata,
    required this.volume,
    required this.onVolumeChanged,
    required this.onPreviousStation,
    required this.onNextStation,
  });

  @override
  State<RrnStreamControlsCard> createState() => _RrnStreamControlsCardState();
}

class _RrnStreamControlsCardState extends State<RrnStreamControlsCard> {
  double rememberedVolume = 1;

  String _identity(Station station) => station.id.isNotEmpty
      ? station.id
      : station.slug.isNotEmpty
          ? station.slug
          : '${station.band}-${station.frequency.toStringAsFixed(3)}';

  bool _isCurrent(RrnPlaybackController playback, Station station) =>
      playback.kind == RrnPlaybackKind.station && playback.sourceId == 'station:${_identity(station)}';

  Future<void> _play(RrnPlaybackController playback, Station station) async {
    if (_isCurrent(playback, station)) {
      await playback.resume();
    } else {
      await playback.playStation(
        station,
        metadata: widget.metadata,
        volume: widget.volume,
        autoplay: true,
      );
    }
  }

  void _toggleMute() {
    if (widget.volume > .001) {
      rememberedVolume = widget.volume;
      widget.onVolumeChanged(0);
    } else {
      widget.onVolumeChanged(rememberedVolume <= .001 ? 1 : rememberedVolume);
    }
  }

  @override
  Widget build(BuildContext context) {
    final station = widget.station;
    final playback = RrnPlaybackController.instance;

    return AnimatedBuilder(
      animation: playback,
      builder: (context, _) {
        final current = station != null && _isCurrent(playback, station);
        final livePlaying = current && playback.playing;
        final playable = station != null && station.streamUrl.isNotEmpty;
        final status = !playable
            ? 'OFF AIR'
            : current
                ? switch (playback.phase) {
                    RrnPlaybackPhase.loading => 'BUFFERING',
                    RrnPlaybackPhase.playing => 'LIVE',
                    RrnPlaybackPhase.paused => 'PAUSED',
                    RrnPlaybackPhase.error => 'ERROR',
                    _ => 'READY',
                  }
                : 'READY';

        return Card(
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.graphic_eq, color: rrnCyan),
                    const SizedBox(width: 8),
                    const Expanded(
                      child: Text(
                        'STREAM CONTROLS',
                        style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1.2),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(99),
                        border: Border.all(color: livePlaying ? rrnCyan : Colors.white24),
                      ),
                      child: Text(
                        status,
                        style: TextStyle(
                          color: livePlaying ? rrnCyan : Colors.white60,
                          fontSize: 9,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Text(
                  station?.name ?? 'No station locked',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900),
                ),
                if (widget.metadata.title.isNotEmpty || widget.metadata.artist.isNotEmpty)
                  Text(
                    [widget.metadata.artist, widget.metadata.title].where((e) => e.isNotEmpty).join(' · '),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(color: Colors.white60),
                  ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    IconButton.filledTonal(
                      onPressed: widget.onPreviousStation,
                      icon: const Icon(Icons.skip_previous),
                      tooltip: 'Previous station',
                    ),
                    const SizedBox(width: 8),
                    IconButton.filledTonal(
                      onPressed: playable && current && playback.playing ? playback.pause : null,
                      icon: const Icon(Icons.pause),
                      tooltip: 'Pause stream',
                    ),
                    const SizedBox(width: 8),
                    FilledButton.icon(
                      onPressed: playable ? () => _play(playback, station!) : null,
                      icon: Icon(livePlaying ? Icons.graphic_eq : Icons.play_arrow),
                      label: Text(livePlaying ? 'ON AIR' : current ? 'RESUME' : 'PLAY'),
                    ),
                    const SizedBox(width: 8),
                    IconButton.filledTonal(
                      onPressed: current ? playback.stop : null,
                      icon: const Icon(Icons.stop),
                      tooltip: 'Stop stream',
                    ),
                    const SizedBox(width: 8),
                    IconButton.filledTonal(
                      onPressed: widget.onNextStation,
                      icon: const Icon(Icons.skip_next),
                      tooltip: 'Next station',
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    IconButton(
                      onPressed: _toggleMute,
                      icon: Icon(widget.volume <= .001 ? Icons.volume_off : Icons.volume_up),
                      tooltip: widget.volume <= .001 ? 'Unmute' : 'Mute',
                    ),
                    Expanded(
                      child: Slider(
                        value: widget.volume.clamp(0, 1),
                        onChanged: widget.onVolumeChanged,
                      ),
                    ),
                    SizedBox(
                      width: 42,
                      child: Text(
                        '${(widget.volume * 100).round()}%',
                        textAlign: TextAlign.right,
                        style: const TextStyle(fontFamily: 'monospace', color: Colors.white60, fontSize: 11),
                      ),
                    ),
                  ],
                ),
                if (playback.lastError != null && current)
                  Padding(
                    padding: const EdgeInsets.only(top: 6),
                    child: Text(playback.lastError!, style: const TextStyle(color: rrnPink, fontSize: 11)),
                  ),
              ],
            ),
          ),
        );
      },
    );
  }
}
