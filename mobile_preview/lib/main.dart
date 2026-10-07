import 'package:flutter/material.dart';

void main() => runApp(const RrnPreviewApp());

class Station {
  const Station(this.frequency, this.format, this.name, this.tagline, this.status);
  final String frequency;
  final String format;
  final String name;
  final String tagline;
  final String status;
}

const stations = <Station>[
  Station('201.5', 'RMP', 'Reality Central Radio', 'The Realest Mix Around!', 'Live'),
  Station('33.9', 'PFL', 'RRN Music', 'Music for the Masses!', 'Testing'),
  Station('265.5', 'TFP', 'Reality Direct', 'Direct from the Mic!', 'Coming soon'),
];

const pink = Color(0xffff65bc);
const bg = Color(0xff0c0b15);

class RrnPreviewApp extends StatelessWidget {
  const RrnPreviewApp({super.key});
  @override
  Widget build(BuildContext context) => MaterialApp(
    title: 'RRN Mobile Preview',
    debugShowCheckedModeBanner: false,
    theme: ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: bg,
      colorScheme: ColorScheme.fromSeed(seedColor: pink, brightness: Brightness.dark),
      cardTheme: CardThemeData(color: const Color(0xff201728), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20))),
    ),
    home: const Shell(),
  );
}

class Shell extends StatefulWidget {
  const Shell({super.key});
  @override
  State<Shell> createState() => _ShellState();
}

class _ShellState extends State<Shell> {
  int section = 0;
  int selectedStation = 0;
  int radioView = 0;
  final Set<int> saved = <int>{};

  void showNote(String message) {
    ScaffoldMessenger.of(context).clearSnackBars();
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
  }

  void tune(int i) => setState(() => selectedStation = (i + stations.length) % stations.length);

  void toggleSave(int i) => setState(() {
    if (!saved.add(i)) saved.remove(i);
  });

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      backgroundColor: bg,
      title: const Row(children: [Icon(Icons.radio, color: pink), SizedBox(width: 10), Expanded(child: Text('REALITY RADIO NETWORK', style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold)))]),
      actions: const [Padding(padding: EdgeInsets.only(right: 12), child: Center(child: Text('PREVIEW', style: TextStyle(fontSize: 11, color: pink, fontWeight: FontWeight.bold))))],
    ),
    body: SafeArea(child: switch (section) {
      0 => radioPage(),
      1 => musicPage(),
      _ => networkPage(),
    }),
    bottomNavigationBar: NavigationBar(
      selectedIndex: section,
      onDestinationSelected: (index) => setState(() => section = index),
      destinations: const [
        NavigationDestination(icon: Icon(Icons.radio_outlined), selectedIcon: Icon(Icons.radio), label: 'Reality Dial'),
        NavigationDestination(icon: Icon(Icons.album_outlined), selectedIcon: Icon(Icons.album), label: 'RRN Music'),
        NavigationDestination(icon: Icon(Icons.hub_outlined), selectedIcon: Icon(Icons.hub), label: 'RRN'),
      ],
    ),
  );

  Widget radioPage() => ListView(padding: const EdgeInsets.fromLTRB(18, 12, 18, 30), children: [
    const Text('THE REALITY DIAL', style: TextStyle(color: pink, letterSpacing: 2, fontWeight: FontWeight.bold)),
    const SizedBox(height: 9),
    const Text('Turn the internet into a radio.', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
    const SizedBox(height: 16),
    SegmentedButton<int>(
      selected: {radioView},
      onSelectionChanged: (choice) => setState(() => radioView = choice.first),
      segments: const [ButtonSegment(value: 0, label: Text('Dial')), ButtonSegment(value: 1, label: Text('Stations')), ButtonSegment(value: 2, label: Text('Presets'))],
    ),
    const SizedBox(height: 20),
    if (radioView == 0) dialCard(),
    if (radioView == 1) for (int i = 0; i < stations.length; i++) stationCard(i),
    if (radioView == 2) ...[
      const Text('Your bookmarked stations (local preview only).'),
      const SizedBox(height: 12),
      if (saved.isEmpty) const Card(child: Padding(padding: EdgeInsets.all(22), child: Text('No presets yet. Bookmark a station on the dial.'))),
      for (final i in saved.toList()..sort()) stationCard(i),
    ],
    const SizedBox(height: 14),
    const Card(child: Padding(padding: EdgeInsets.all(14), child: Text('DEMO DATA • The tuning controls work, but this preview is not connected to live RRN streams or your website account.'))),
  ]);

  Widget dialCard() {
    final station = stations[selectedStation];
    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        gradient: const LinearGradient(colors: [Color(0xff442344), Color(0xff161323)], begin: Alignment.topLeft, end: Alignment.bottomRight),
        border: Border.all(color: const Color(0xff83426d)),
        borderRadius: BorderRadius.circular(25),
      ),
      child: Column(children: [
        const Row(children: [Icon(Icons.graphic_eq, color: pink), SizedBox(width: 8), Text('RRN DIGITAL', style: TextStyle(letterSpacing: 2, fontWeight: FontWeight.bold)), Spacer(), Icon(Icons.wifi_tethering, color: pink)]),
        const SizedBox(height: 27),
        Text(station.frequency, style: const TextStyle(fontSize: 66, height: 1.1, fontWeight: FontWeight.w900)),
        Text(station.format, style: const TextStyle(fontSize: 22, letterSpacing: 4, fontWeight: FontWeight.bold, color: pink)),
        const SizedBox(height: 20),
        Text(station.name, textAlign: TextAlign.center, style: const TextStyle(fontSize: 23, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Text(station.tagline, textAlign: TextAlign.center),
        const SizedBox(height: 10),
        Chip(label: Text(station.status.toUpperCase())),
        Row(children: [
          IconButton.filledTonal(onPressed: () => tune(selectedStation - 1), icon: const Icon(Icons.chevron_left)),
          Expanded(child: Slider(min: 0, max: (stations.length - 1).toDouble(), divisions: stations.length - 1, value: selectedStation.toDouble(), onChanged: (v) => tune(v.round()))),
          IconButton.filledTonal(onPressed: () => tune(selectedStation + 1), icon: const Icon(Icons.chevron_right)),
        ]),
        const SizedBox(height: 8),
        Row(children: [
          Expanded(child: FilledButton.icon(onPressed: () => showNote('Streaming is not connected in this interface preview.'), icon: const Icon(Icons.play_arrow), label: const Text('LISTEN LIVE'))),
          const SizedBox(width: 8),
          IconButton.outlined(onPressed: () => toggleSave(selectedStation), icon: Icon(saved.contains(selectedStation) ? Icons.bookmark : Icons.bookmark_outline), tooltip: 'Toggle preset'),
        ]),
      ]),
    );
  }

  Widget stationCard(int i) {
    final station = stations[i];
    return Card(child: ListTile(
      onTap: () => setState(() { selectedStation = i; radioView = 0; }),
      leading: CircleAvatar(backgroundColor: const Color(0xff5a2b52), child: Text(station.format.substring(0, 1))),
      title: Text(station.name, style: const TextStyle(fontWeight: FontWeight.bold)),
      subtitle: Text('${station.frequency} ${station.format} • ${station.status}'),
      trailing: IconButton(onPressed: () => toggleSave(i), icon: Icon(saved.contains(i) ? Icons.bookmark : Icons.bookmark_outline)),
    ));
  }

  Widget musicPage() => ListView(padding: const EdgeInsets.all(18), children: [
    const Text('RRN MUSIC', style: TextStyle(letterSpacing: 2, color: pink, fontWeight: FontWeight.bold)),
    const SizedBox(height: 10),
    const Text('Listen. Discover. Connect.', style: TextStyle(fontSize: 25, fontWeight: FontWeight.bold)),
    const SizedBox(height: 18),
    for (final entry in const [('Fearful', 'AllyOne ft. RRN Persona Alissa Michaels'), ('Rebound', 'Kaira Heartfelt'), ('Freedom EP', 'Mathew Cage')])
      Card(child: ListTile(leading: const Icon(Icons.album, color: pink, size: 36), title: Text(entry.$1), subtitle: Text(entry.$2), trailing: IconButton(onPressed: () => showNote('Audio previews are not connected yet.'), icon: const Icon(Icons.play_circle_outline)))),
    const Card(child: Padding(padding: EdgeInsets.all(15), child: Text('Sample catalog only • No payments, purchases or account access in this preview.'))),
  ]);

  Widget networkPage() => ListView(padding: const EdgeInsets.all(18), children: [
    const Text('MUSIC FOR THE MASSES!', style: TextStyle(color: pink, letterSpacing: 2, fontWeight: FontWeight.bold)),
    const SizedBox(height: 10),
    const Text('Reality Radio Network', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900)),
    const SizedBox(height: 10),
    const Text('Listen. Discover. Connect.'),
    const SizedBox(height: 16),
    Card(child: ListTile(leading: const Icon(Icons.radio), title: const Text('Explore the Reality Dial'), onTap: () => setState(() => section = 0))),
    Card(child: ListTile(leading: const Icon(Icons.album), title: const Text('Explore RRN Music'), onTap: () => setState(() => section = 1))),
    const Card(child: ListTile(leading: Icon(Icons.forum_outlined), title: Text('RRN Community'), subtitle: Text('Coming in the connected app'))),
    const Card(child: ListTile(leading: Icon(Icons.account_circle_outlined), title: Text('RRN Account'), subtitle: Text('Login is not connected yet'))),
    const SizedBox(height: 20),
    const Text('Interface test build • No changes to your RRN website or user accounts.', style: TextStyle(color: Colors.white60)),
  ]);
}
