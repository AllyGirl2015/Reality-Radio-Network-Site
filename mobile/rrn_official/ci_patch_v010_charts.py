from pathlib import Path

path = Path('/tmp/rrn_mobile/lib/charts.dart')
text = path.read_text()


def replace_once(old: str, new: str, label: str) -> None:
    global text
    if old not in text:
        raise SystemExit(f'v0.10 charts patch failed: {label}')
    text = text.replace(old, new, 1)


# v0.8 already protects ranked Billboard charts from the legacy one-tap vote
# endpoint. Accept either the singular or plural method label.
replace_once(
    "    if (method == 'billboard') {\n",
    "    if (method.contains('billboard')) {\n",
    'Billboards method alias',
)

# Prefer the short directory teaser and render the chart's primary artwork.
replace_once(
    "              final description = str(m['description'] ?? m['summary']);\n",
    "              final description = str(m['teaser'] ?? m['teaserText'] ?? m['teaser_text'] ?? m['description'] ?? m['summary']);\n",
    'chart teaser',
)
replace_once(
    "              final type = str(m['type'] ?? m['chartType'] ?? m['chart_type']);\n",
    "              final type = str(m['type'] ?? m['chartType'] ?? m['chart_type']);\n"
    "              final artwork = rrnAbsoluteUrl(str(m['artworkUrl'] ?? m['artwork_url'] ?? m['imageUrl'] ?? m['image_url'] ?? m['artwork']));\n",
    'chart artwork value',
)
replace_once(
    "                  leading: const CircleAvatar(backgroundColor: Color(0xFF201135), child: Icon(Icons.leaderboard, color: rrnPurple)),\n",
    "                  leading: ClipRRect(\n"
    "                    borderRadius: BorderRadius.circular(12),\n"
    "                    child: SizedBox(\n"
    "                      width: 64, height: 64,\n"
    "                      child: artwork.isEmpty\n"
    "                          ? const ColoredBox(color: Color(0xFF201135), child: Icon(Icons.leaderboard, color: rrnPurple))\n"
    "                          : Image.network(artwork, fit: BoxFit.cover, errorBuilder: (_, __, ___) => const ColoredBox(color: Color(0xFF201135), child: Icon(Icons.leaderboard, color: rrnPurple))),\n"
    "                    ),\n"
    "                  ),\n",
    'chart directory artwork',
)

# The newer site contract can expose separate banner + larger feature/page art.
# Render them when present and harmlessly omit them against older payloads.
insert = r'''  String get _bannerArtwork => rrnAbsoluteUrl(str(
        chart['bannerUrl'] ?? chart['banner_url'] ?? chart['headerImageUrl'] ?? chart['header_image_url'],
      ));

  String get _featureArtwork => rrnAbsoluteUrl(str(
        chart['featureArtworkUrl'] ??
            chart['feature_artwork_url'] ??
            chart['pageCardUrl'] ??
            chart['page_card_url'] ??
            chart['artworkUrl'] ??
            chart['artwork_url'],
      ));

'''
replace_once(
    "  Future<void> _vote(dynamic raw) async {\n",
    insert + "  Future<void> _vote(dynamic raw) async {\n",
    'chart presentation getters',
)
replace_once(
    "                    if (str(chart['description']).isNotEmpty) Text(str(chart['description']), style: const TextStyle(color: Colors.white70, height: 1.4)),\n",
    "                    if (_bannerArtwork.isNotEmpty) ...[\n"
    "                      ClipRRect(borderRadius: BorderRadius.circular(18), child: AspectRatio(aspectRatio: 16 / 5, child: Image.network(_bannerArtwork, fit: BoxFit.cover))),\n"
    "                      const SizedBox(height: 12),\n"
    "                    ],\n"
    "                    if (_featureArtwork.isNotEmpty) ...[\n"
    "                      Align(alignment: Alignment.centerLeft, child: ClipRRect(borderRadius: BorderRadius.circular(18), child: SizedBox(width: 180, height: 180, child: Image.network(_featureArtwork, fit: BoxFit.cover)))),\n"
    "                      const SizedBox(height: 12),\n"
    "                    ],\n"
    "                    if (str(chart['description']).isNotEmpty) Text(str(chart['description']), style: const TextStyle(color: Colors.white70, height: 1.4)),\n",
    'chart banner and feature artwork',
)

path.write_text(text)
print('RRN Mobile v0.10 chart presentation patch applied.')
