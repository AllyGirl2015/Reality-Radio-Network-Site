import 'package:flutter/material.dart';

import 'core.dart';
import 'external_links.dart';
import 'native_endpoint.dart';

class RrnStudioScreen extends StatelessWidget {
  const RrnStudioScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final modules = <_StudioModule>[
      const _StudioModule('Stations', Icons.radio_outlined, '/account/stations', 'Manage the stations connected to your account.'),
      const _StudioModule('Presenter', Icons.mic_external_on_outlined, '/account/presenter', 'Presenter programs, shows and related tools.'),
      const _StudioModule('Creator catalog', Icons.album_outlined, '/account/creator', 'Artists, releases and creator-side catalog resources.'),
      const _StudioModule('Labels', Icons.label_outline, '/account/labels', 'Label identities and label-owned resources.'),
      const _StudioModule('Services', Icons.hub_outlined, '/account/services', 'RRN services available to your account.'),
      const _StudioModule('Applications', Icons.assignment_outlined, '/account/applications', 'Review your submitted applications and available application actions.'),
      const _StudioModule('Charts', Icons.leaderboard_outlined, '/charts', 'Chart creation, management and voting resources.'),
      const _StudioModule('Submissions', Icons.upload_file_outlined, '/submissions', 'Submission forms and creator/station intake tools.'),
      const _StudioModule('Platform actions', Icons.bolt_outlined, '/actions', 'Server-authorized actions currently exposed to this account.'),
      const _StudioModule('Support', Icons.support_agent_outlined, '/support', 'Reports, support and operational help.'),
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('RRN Studio')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 110),
        children: [
          const RrnSectionHeader(
            eyebrow: 'Native Studio',
            title: 'RRN Studio',
            subtitle: 'This hub uses the live native RRN resources directly instead of depending on the broken /studio page translation.',
          ),
          const SizedBox(height: 14),
          ...modules.map(
            (module) => Card(
              child: ListTile(
                leading: Icon(module.icon, color: rrnCyan),
                title: Text(module.title, style: const TextStyle(fontWeight: FontWeight.w900)),
                subtitle: Text(module.description),
                trailing: const Icon(Icons.chevron_right),
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => MatrixEndpointScreen(endpoint: module.endpoint, title: module.title),
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 10),
          OutlinedButton.icon(
            onPressed: () => openExternalUrl(context, '$rrnBase/studio'),
            icon: const Icon(Icons.open_in_new),
            label: const Text('Open web Studio'),
          ),
        ],
      ),
    );
  }
}

class _StudioModule {
  final String title;
  final IconData icon;
  final String endpoint;
  final String description;

  const _StudioModule(this.title, this.icon, this.endpoint, this.description);
}
