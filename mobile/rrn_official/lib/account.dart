import 'package:flutter/material.dart';

import 'core.dart';
import 'points.dart';
import 'site.dart';
import 'studio_native.dart';

class AccountScreen extends StatefulWidget {
  const AccountScreen({super.key});

  @override
  State<AccountScreen> createState() => _AccountScreenState();
}

class _AccountScreenState extends State<AccountScreen> {
  final email = TextEditingController();
  final password = TextEditingController();
  bool obscure = true;

  @override
  void dispose() {
    email.dispose();
    password.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final app = RrnScope.of(context);
    return Scaffold(
      appBar: AppBar(title: const Text('RRN Account')),
      body: AnimatedBuilder(
        animation: app.auth,
        builder: (_, __) => app.auth.signedIn ? _signedIn(app) : _signedOut(app),
      ),
    );
  }

  Widget _signedOut(RrnAppController app) => ListView(
        padding: const EdgeInsets.all(18),
        children: [
          const RrnSectionHeader(
            eyebrow: 'One RRN identity',
            title: 'Sign in to the network.',
            subtitle: 'The same account controls your presets, library, purchases, points, charts, social identity and authorized creator, station or staff access.',
          ),
          const SizedBox(height: 20),
          TextField(
            controller: email,
            keyboardType: TextInputType.emailAddress,
            autofillHints: const [AutofillHints.email],
            decoration: const InputDecoration(labelText: 'Email'),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: password,
            obscureText: obscure,
            autofillHints: const [AutofillHints.password],
            decoration: InputDecoration(
              labelText: 'Password',
              suffixIcon: IconButton(
                onPressed: () => setState(() => obscure = !obscure),
                icon: Icon(obscure ? Icons.visibility : Icons.visibility_off),
              ),
            ),
          ),
          if (app.auth.error != null)
            Padding(
              padding: const EdgeInsets.only(top: 10),
              child: Text(app.auth.error!, style: const TextStyle(color: Color(0xFFFCA5A5))),
            ),
          const SizedBox(height: 16),
          FilledButton.icon(
            onPressed: app.auth.busy
                ? null
                : () async {
                    final ok = await app.auth.login(email.text, password.text);
                    if (ok) await app.loadStations();
                  },
            icon: app.auth.busy
                ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                : const Icon(Icons.login),
            label: const Text('Sign in'),
          ),
          const SizedBox(height: 8),
          OutlinedButton(
            onPressed: () => _openPage('/account/register', 'Create RRN Account'),
            child: const Text('Create account'),
          ),
          TextButton(
            onPressed: () => _openPage('/account/forgot-password', 'Reset password'),
            child: const Text('Forgot password?'),
          ),
        ],
      );

  Widget _signedIn(RrnAppController app) {
    final u = app.auth.user!;
    return RefreshIndicator(
      onRefresh: () => app.auth.loadMe(),
      child: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 34,
                backgroundColor: const Color(0xFF10262B),
                backgroundImage: u.avatar.startsWith('http') ? NetworkImage(u.avatar) : null,
                child: u.avatar.isEmpty ? const Icon(Icons.person, size: 36, color: rrnCyan) : null,
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(u.displayName, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900)),
                    Text(u.email, style: const TextStyle(color: Colors.white60)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Card(
            child: ListTile(
              leading: const Icon(Icons.toll, color: rrnCyan),
              title: const Text('RRN Points', style: TextStyle(fontWeight: FontWeight.w900)),
              subtitle: const Text('Balance, listening rewards and participating RRN services.'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const PointsWalletScreen())),
            ),
          ),
          _tile('Profile & settings', Icons.manage_accounts_outlined, '/account/settings'),
          _tile('My library', Icons.library_music_outlined, '/library'),
          _tile('Orders & purchases', Icons.receipt_long_outlined, '/account/orders'),
          _tile('Social & messages', Icons.people_outline, '/account/social'),
          _tile('My stations', Icons.radio_outlined, '/account/stations'),
          _tile('Presenter', Icons.mic_external_on_outlined, '/account/presenter'),
          _tile('Creator catalog', Icons.album_outlined, '/account/artists'),
          _tile('Labels', Icons.label_outline, '/account/labels'),
          _tile('Services', Icons.hub_outlined, '/account/services'),
          _tile('Applications', Icons.assignment_outlined, '/account/applications'),
          _tile('Reports & support', Icons.support_agent_outlined, '/account/reports'),
          if (_hasStudioAccess(u))
            Card(
              child: ListTile(
                leading: const Icon(Icons.admin_panel_settings_outlined, color: rrnPurple),
                title: const Text('RRN Studio', style: TextStyle(fontWeight: FontWeight.w900)),
                subtitle: const Text('Authorized network, moderation and management controls.'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const RrnStudioScreen())),
              ),
            ),
          const SizedBox(height: 14),
          OutlinedButton.icon(
            onPressed: app.auth.busy ? null : app.auth.logout,
            icon: const Icon(Icons.logout),
            label: const Text('Sign out'),
          ),
        ],
      ),
    );
  }

  bool _hasStudioAccess(AccountUser user) {
    if (user.permissions.contains('studio.access')) return true;
    const staffRoles = {'creator', 'editor', 'support', 'admin', 'developer', 'superadmin', 'owner', 'manager'};
    return user.roles.any((role) => staffRoles.contains(role.toLowerCase()));
  }

  void _openPage(String path, String title) {
    Navigator.push(context, MaterialPageRoute(builder: (_) => MatrixPageScreen(path: path, title: title)));
  }

  Widget _tile(String title, IconData icon, String path) => Card(
        child: ListTile(
          leading: Icon(icon, color: rrnCyan),
          title: Text(title),
          trailing: const Icon(Icons.chevron_right),
          onTap: () => _openPage(path, title),
        ),
      );
}
