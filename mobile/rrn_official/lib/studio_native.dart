import 'package:flutter/material.dart';

import 'core.dart';
import 'site.dart';

/// Native Studio launcher for the website's real, permission-checked management
/// pages. This screen intentionally contains navigation only; each destination
/// is translated through the App Matrix so the same forms/actions and server
/// authorization rules used by RealityRadio.net remain authoritative.
class RrnStudioScreen extends StatelessWidget {
  const RrnStudioScreen({super.key});

  static const _modules = <_StudioModule>[
    _StudioModule('Platform moderation', Icons.gavel_outlined, '/studio/moderation', 'Warnings, restrictions, suspensions and moderation history.'),
    _StudioModule('Users & roles', Icons.manage_accounts_outlined, '/studio/users', 'Account administration, roles and authorized user controls.'),
    _StudioModule('Radio management', Icons.radio_outlined, '/studio/radio', 'Stations, presenters, shows, applications and broadcast operations.'),
    _StudioModule('Submissions', Icons.fact_check_outlined, '/studio/submissions', 'Review general, artist, music, label, advertising and persona submissions.'),
    _StudioModule('Music catalog', Icons.library_music_outlined, '/studio/catalog', 'Artists, labels, releases, tracks and catalog review.'),
    _StudioModule('RRN Feed', Icons.dynamic_feed_outlined, '/studio/feed', 'Create, review and manage network Feed publishing.'),
    _StudioModule('Charts', Icons.leaderboard_outlined, '/studio/charts', 'Manage chart systems and chart operations.'),
    _StudioModule('Store', Icons.storefront_outlined, '/studio/store', 'Products, orders, services, coupons, payments and fulfillment.'),
    _StudioModule('Support', Icons.support_agent_outlined, '/studio/support', 'Support tickets and staff responses.'),
    _StudioModule('Media', Icons.perm_media_outlined, '/studio/media', 'Managed media assets and uploads.'),
    _StudioModule('Analytics', Icons.analytics_outlined, '/studio/analytics', 'Network and platform analytics.'),
    _StudioModule('Pages', Icons.web_outlined, '/studio/pages', 'Managed pages, publishing and navigation content.'),
    _StudioModule('Notifications', Icons.notifications_active_outlined, '/studio/notifications', 'Network notification controls and delivery tools.'),
    _StudioModule('Social', Icons.groups_outlined, '/studio/social', 'Social platform administration, sounds and emojis.'),
    _StudioModule('Discord bot services', Icons.smart_toy_outlined, '/studio/services/discord-bots', 'Discord bot service provisioning and management.'),
    _StudioModule('Reality Dial services', Icons.tune_outlined, '/studio/services/reality-dial', 'Reality Dial service provisioning and management.'),
    _StudioModule('Payouts', Icons.payments_outlined, '/studio/payouts', 'Creator and partner payout operations.'),
    _StudioModule('Operations', Icons.settings_suggest_outlined, '/studio/operations', 'Operational controls and platform maintenance surfaces.'),
    _StudioModule('Outreach', Icons.campaign_outlined, '/studio/outreach', 'Outreach and relationship-management tools.'),
    _StudioModule('Launch controls', Icons.rocket_launch_outlined, '/studio/launch', 'Launch-state and rollout controls.'),
    _StudioModule('Developer', Icons.code_outlined, '/studio/developer', 'Developer-only platform tooling.'),
  ];

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: const Text('RRN Studio')),
        body: ListView(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 110),
          children: [
            const RrnSectionHeader(
              eyebrow: 'RRN Studio',
              title: 'Management & moderation',
              subtitle: 'These destinations open the real permission-checked Studio pages through the native Translation Matrix. Internal API payloads are not shown as management screens.',
            ),
            const SizedBox(height: 14),
            ..._modules.map(
              (module) => Card(
                child: ListTile(
                  leading: Icon(module.icon, color: rrnCyan),
                  title: Text(module.title, style: const TextStyle(fontWeight: FontWeight.w900)),
                  subtitle: Text(module.description),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => MatrixPageScreen(path: module.path, title: module.title),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      );
}

class _StudioModule {
  final String title;
  final IconData icon;
  final String path;
  final String description;
  const _StudioModule(this.title, this.icon, this.path, this.description);
}
