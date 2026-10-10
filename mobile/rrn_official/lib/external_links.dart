import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import 'core.dart';

Future<void> openExternalUrl(BuildContext context, String rawUrl) async {
  final uri = Uri.tryParse(rawUrl);
  if (uri == null || !['http', 'https'].contains(uri.scheme)) {
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('That link is not valid.')));
    }
    return;
  }
  final ok = await launchUrl(uri, mode: LaunchMode.externalApplication);
  if (!ok && context.mounted) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Could not open ${uri.host}.')));
  }
}

class ExternalLinkScreen extends StatelessWidget {
  final String title;
  final String url;
  final String description;
  final IconData icon;

  const ExternalLinkScreen({
    super.key,
    required this.title,
    required this.url,
    required this.description,
    this.icon = Icons.open_in_browser,
  });

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: Text(title)),
        body: ListView(
          padding: const EdgeInsets.all(18),
          children: [
            RrnSectionHeader(
              eyebrow: 'External RRN destination',
              title: title,
              subtitle: description,
            ),
            const SizedBox(height: 18),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(18),
                child: Column(
                  children: [
                    Icon(icon, size: 48, color: rrnCyan),
                    const SizedBox(height: 14),
                    SelectableText(url, textAlign: TextAlign.center, style: const TextStyle(color: Colors.white60)),
                    const SizedBox(height: 16),
                    FilledButton.icon(
                      onPressed: () => openExternalUrl(context, url),
                      icon: const Icon(Icons.open_in_new),
                      label: Text('Open $title'),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      );
}
