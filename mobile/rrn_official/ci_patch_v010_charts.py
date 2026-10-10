from pathlib import Path

path = Path('/tmp/rrn_mobile/lib/charts.dart')
text = path.read_text()


def replace_once(old: str, new: str, label: str) -> None:
    global text
    if old not in text:
        raise SystemExit(f'v0.10 charts patch failed: {label}')
    text = text.replace(old, new, 1)


# Prefer the short directory teaser while retaining legacy descriptions.
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
    "                      width: 64,\n"
    "                      height: 64,\n"
    "                      child: artwork.isEmpty\n"
    "                          ? const ColoredBox(color: Color(0xFF201135), child: Icon(Icons.leaderboard, color: rrnPurple))\n"
    "                          : Image.network(artwork, fit: BoxFit.cover, errorBuilder: (_, __, ___) => const ColoredBox(color: Color(0xFF201135), child: Icon(Icons.leaderboard, color: rrnPurple))),\n"
    "                    ),\n"
    "                  ),\n",
    'chart directory artwork',
)

# Billboards is ranked-ballot voting. Never send the legacy one-tap vote shape
# for that method. The Translation Matrix is server-authoritative and can expose
# the exact live ballot/actions while the app remains fully native-rendered.
insert = r'''  String get _votingMethod {
    final voting = chart['voting'] is Map ? Map<String, dynamic>.from(chart['voting']) : const <String, dynamic>{};
    return str(
      chart['votingMethod'] ??
          chart['voting_method'] ??
          chart['voteMethod'] ??
          chart['vote_method'] ??
          voting['method'] ??
          voting['type'],
    ).toLowerCase();
  }

  bool get _isBillboards => _votingMethod.contains('billboard');

  String get _bannerArtwork => rrnAbsoluteUrl(str(
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

  Future<void> _openAuthoritativeChart() async {
    await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => MatrixPageScreen(path: '/charts/${widget.slug}', title: widget.title),
      ),
    );
    if (mounted) await _load();
  }

'''
replace_once(
    "  Future<void> _vote(dynamic raw) async {\n",
    insert + "  Future<void> _vote(dynamic raw) async {\n    if (_isBillboards) {\n      await _openAuthoritativeChart();\n      return;\n    }\n",
    'Billboards authoritative ballot routing',
)
replace_once(
    "            IconButton(onPressed: _nominate, icon: const Icon(Icons.add_chart), tooltip: 'Nominate'),\n",
    "            IconButton(onPressed: _nominate, icon: const Icon(Icons.add_chart), tooltip: 'Nominate'),\n"
    "            if (_isBillboards) IconButton(onPressed: _openAuthoritativeChart, icon: const Icon(Icons.ballot_outlined), tooltip: 'Rank ballot'),\n",
    'Billboards app bar action',
)
replace_once(
    "                    if (str(chart['description']).isNotEmpty) Text(str(chart['description']), style: const TextStyle(color: Colors.white70, height: 1.4)),\n",
    "                    if (_bannerArtwork.isNotEmpty) ...[\n"
    "                      ClipRRect(\n"
    "                        borderRadius: BorderRadius.circular(18),\n"
    "                        child: AspectRatio(aspectRatio: 16 / 5, child: Image.network(_bannerArtwork, fit: BoxFit.cover)),\n"
    "                      ),\n"
    "                      const SizedBox(height: 12),\n"
    "                    ],\n"
    "                    if (_featureArtwork.isNotEmpty) ...[\n"
    "                      Align(\n"
    "                        alignment: Alignment.centerLeft,\n"
    "                        child: ClipRRect(\n"
    "                          borderRadius: BorderRadius.circular(18),\n"
    "                          child: SizedBox(width: 180, height: 180, child: Image.network(_featureArtwork, fit: BoxFit.cover)),\n"
    "                        ),\n"
    "                      ),\n"
    "                      const SizedBox(height: 12),\n"
    "                    ],\n"
    "                    if (str(chart['description']).isNotEmpty) Text(str(chart['description']), style: const TextStyle(color: Colors.white70, height: 1.4)),\n"
    "                    if (_isBillboards) ...[\n"
    "                      const SizedBox(height: 10),\n"
    "                      Card(\n"
    "                        child: ListTile(\n"
    "                          leading: const Icon(Icons.format_list_numbered, color: rrnCyan),\n"
    "                          title: const Text('Ranked Billboards ballot', style: TextStyle(fontWeight: FontWeight.w900)),\n"
    "                          subtitle: const Text('Choose and rank your favorites. The server applies the chart weighting and keeps only your latest ballot before voting closes.'),\n"
    "                          trailing: const Icon(Icons.chevron_right),\n"
    "                          onTap: _openAuthoritativeChart,\n"
    "                        ),\n"
    "                      ),\n"
    "                    ],\n",
    'chart presentation media and Billboards notice',
)
replace_once(
    "                          trailing: FilledButton.tonal(onPressed: () => _vote(indexed.value), child: const Text('Vote')),\n",
    "                          trailing: FilledButton.tonal(\n"
    "                            onPressed: () => _vote(indexed.value),\n"
    "                            child: Text(_isBillboards ? 'Rank' : 'Vote'),\n"
    "                          ),\n",
    'Billboards rank button',
)

path.write_text(text)
print('RRN Mobile v0.10 chart parity patch applied.')
