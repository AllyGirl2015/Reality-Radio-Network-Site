import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart';

import 'account.dart';
import 'core.dart';

class RrnNotificationPreferencesScreen extends StatefulWidget {
  const RrnNotificationPreferencesScreen({super.key});

  @override
  State<RrnNotificationPreferencesScreen> createState() => _RrnNotificationPreferencesScreenState();
}

class _RrnNotificationPreferencesScreenState extends State<RrnNotificationPreferencesScreen> {
  bool busy = true;
  bool saving = false;
  String? error;
  PermissionStatus notificationPermission = PermissionStatus.denied;

  String profileVisibility = 'public';
  String friendRequestPolicy = 'everyone';
  String dmPolicy = 'friends_and_following';
  String presenceVisibility = 'friends';
  bool friendOnline = false;
  bool emailMessages = true;
  bool emailFollows = true;
  bool emailMusic = true;
  bool emailAnnouncements = true;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (busy) _load();
  }

  Map<String, dynamic> _jsonMap(dynamic value) {
    if (value is Map) return Map<String, dynamic>.from(value);
    if (value is String && value.trim().isNotEmpty) {
      try {
        final decoded = jsonDecode(value);
        if (decoded is Map) return Map<String, dynamic>.from(decoded);
      } catch (_) {}
    }
    return {};
  }

  Future<void> _load() async {
    final app = RrnScope.of(context);
    try {
      notificationPermission = await Permission.notification.status;
    } catch (_) {}
    if (!app.auth.signedIn) {
      busy = false;
      if (mounted) setState(() {});
      return;
    }
    setState(() {
      busy = true;
      error = null;
    });
    try {
      final result = await app.api.get('/account/settings');
      final settings = result is Map && result['settings'] is Map ? Map<String, dynamic>.from(result['settings']) : <String, dynamic>{};
      profileVisibility = str(settings['social_profile_visibility'], 'public');
      friendRequestPolicy = str(settings['friend_request_policy'], 'everyone');
      dmPolicy = str(settings['dm_policy'], 'friends_and_following');
      final prefs = _jsonMap(settings['notification_email_settings'] ?? settings['social_notification_preferences']);
      emailMessages = boolish(prefs['email_messages'], true);
      emailFollows = boolish(prefs['email_follows'], true);
      emailMusic = boolish(prefs['email_music'], true);
      emailAnnouncements = boolish(prefs['email_announcements'], true);
      friendOnline = boolish(prefs['friend_online']);
    } catch (e) {
      error = '$e';
    } finally {
      busy = false;
      if (mounted) setState(() {});
    }
  }

  Future<void> _signIn() async {
    await Navigator.push(context, MaterialPageRoute(builder: (_) => const AccountScreen()));
    if (mounted) await _load();
  }

  Future<void> _requestNotificationPermission() async {
    try {
      notificationPermission = await Permission.notification.request();
      if (mounted) setState(() {});
      await _registerDevice();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    }
  }

  Future<void> _registerDevice() async {
    final app = RrnScope.of(context);
    if (!app.auth.signedIn || app.api.deviceId == null) return;
    try {
      await app.api.post('/device/register', body: {
        'installationId': app.api.deviceId,
        'appVersion': '0.9.0',
        'buildNumber': 10,
        'deviceName': 'RRN Android',
        'platform': 'android',
        'capabilities': {
          'mediaSession': true,
          'notificationInbox': true,
          'notificationPreferences': true,
        },
        'notificationsEnabled': notificationPermission.isGranted,
      });
    } catch (_) {}
  }

  Future<void> _save() async {
    final app = RrnScope.of(context);
    if (!app.auth.signedIn) return;
    setState(() {
      saving = true;
      error = null;
    });
    try {
      await app.api.postForm('/controller/social/settings', fields: {
        'profileVisibility': profileVisibility,
        'friendRequestPolicy': friendRequestPolicy,
        'dmPolicy': dmPolicy,
        'presenceVisibility': presenceVisibility,
        if (friendOnline) 'friendOnlineNotifications': 'on',
      });
      await app.api.postForm('/controller/account/notification-email-settings', fields: {
        if (emailMessages) 'email_messages': 'on',
        if (emailFollows) 'email_follows': 'on',
        if (emailMusic) 'email_music': 'on',
        if (emailAnnouncements) 'email_announcements': 'on',
      });
      await _registerDevice();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('RRN notification preferences saved.')));
    } catch (e) {
      setState(() => error = '$e');
    } finally {
      saving = false;
      if (mounted) setState(() {});
    }
  }

  @override
  Widget build(BuildContext context) {
    final app = RrnScope.of(context);
    return Scaffold(
      appBar: AppBar(title: const Text('Notification Preferences')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 14, 16, 100),
        children: [
          const RrnSectionHeader(
            eyebrow: 'RRN Notifications',
            title: 'Native notification preferences.',
            subtitle: 'Control account notification categories and this Android device from inside the app.',
          ),
          const SizedBox(height: 14),
          if (!app.auth.signedIn)
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  const Text('Sign in to manage preferences', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18)),
                  const SizedBox(height: 10),
                  FilledButton.icon(onPressed: _signIn, icon: const Icon(Icons.login), label: const Text('Sign in')),
                ]),
              ),
            ),
          if (busy) const Center(child: Padding(padding: EdgeInsets.all(30), child: CircularProgressIndicator())),
          if (!busy && app.auth.signedIn) ...[
            Card(
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  const Text('Android delivery', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18)),
                  const SizedBox(height: 8),
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: Icon(notificationPermission.isGranted ? Icons.notifications_active : Icons.notifications_off_outlined, color: notificationPermission.isGranted ? rrnCyan : Colors.white54),
                    title: Text(notificationPermission.isGranted ? 'Android notifications allowed' : 'Android notifications not allowed'),
                    subtitle: const Text('Controls permission and device registration for this installation.'),
                    trailing: notificationPermission.isGranted
                        ? const Icon(Icons.check_circle, color: rrnCyan)
                        : FilledButton.tonal(onPressed: _requestNotificationPermission, child: const Text('Allow')),
                  ),
                  const Divider(),
                  const ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: Icon(Icons.cloud_off_outlined, color: rrnPurple),
                    title: Text('Remote push provider'),
                    subtitle: Text('RRN device registration is supported, but provider push delivery is not configured on the current backend yet. The in-app notification inbox remains active.'),
                  ),
                ]),
              ),
            ),
            const SizedBox(height: 10),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  const Text('Social notification controls', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18)),
                  const SizedBox(height: 10),
                  DropdownButtonFormField<String>(
                    initialValue: profileVisibility,
                    decoration: const InputDecoration(labelText: 'Profile visibility'),
                    items: const [
                      DropdownMenuItem(value: 'public', child: Text('Public')),
                      DropdownMenuItem(value: 'friends', child: Text('Friends')),
                      DropdownMenuItem(value: 'private', child: Text('Private')),
                    ],
                    onChanged: (value) => setState(() => profileVisibility = value ?? profileVisibility),
                  ),
                  const SizedBox(height: 10),
                  DropdownButtonFormField<String>(
                    initialValue: friendRequestPolicy,
                    decoration: const InputDecoration(labelText: 'Friend requests'),
                    items: const [
                      DropdownMenuItem(value: 'everyone', child: Text('Everyone')),
                      DropdownMenuItem(value: 'following', child: Text('People I follow')),
                      DropdownMenuItem(value: 'nobody', child: Text('Nobody')),
                    ],
                    onChanged: (value) => setState(() => friendRequestPolicy = value ?? friendRequestPolicy),
                  ),
                  const SizedBox(height: 10),
                  DropdownButtonFormField<String>(
                    initialValue: dmPolicy,
                    decoration: const InputDecoration(labelText: 'Direct messages'),
                    items: const [
                      DropdownMenuItem(value: 'everyone', child: Text('Everyone')),
                      DropdownMenuItem(value: 'friends_and_following', child: Text('Friends & following')),
                      DropdownMenuItem(value: 'friends', child: Text('Friends only')),
                      DropdownMenuItem(value: 'nobody', child: Text('Nobody')),
                    ],
                    onChanged: (value) => setState(() => dmPolicy = value ?? dmPolicy),
                  ),
                  const SizedBox(height: 10),
                  DropdownButtonFormField<String>(
                    initialValue: presenceVisibility,
                    decoration: const InputDecoration(labelText: 'Active-status visibility'),
                    items: const [
                      DropdownMenuItem(value: 'everyone', child: Text('Everyone')),
                      DropdownMenuItem(value: 'friends', child: Text('Friends')),
                      DropdownMenuItem(value: 'private', child: Text('Private')),
                    ],
                    onChanged: (value) => setState(() => presenceVisibility = value ?? presenceVisibility),
                  ),
                  SwitchListTile(contentPadding: EdgeInsets.zero, title: const Text('Friend online notifications'), value: friendOnline, onChanged: (value) => setState(() => friendOnline = value)),
                ]),
              ),
            ),
            const SizedBox(height: 10),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  const Text('Email notification categories', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18)),
                  SwitchListTile(contentPadding: EdgeInsets.zero, title: const Text('Messages'), value: emailMessages, onChanged: (value) => setState(() => emailMessages = value)),
                  SwitchListTile(contentPadding: EdgeInsets.zero, title: const Text('Follows & social'), value: emailFollows, onChanged: (value) => setState(() => emailFollows = value)),
                  SwitchListTile(contentPadding: EdgeInsets.zero, title: const Text('Music'), value: emailMusic, onChanged: (value) => setState(() => emailMusic = value)),
                  SwitchListTile(contentPadding: EdgeInsets.zero, title: const Text('Announcements'), value: emailAnnouncements, onChanged: (value) => setState(() => emailAnnouncements = value)),
                ]),
              ),
            ),
            if (error != null) Padding(padding: const EdgeInsets.symmetric(vertical: 10), child: Text(error!, style: const TextStyle(color: Color(0xFFFCA5A5)))),
            const SizedBox(height: 10),
            FilledButton.icon(
              onPressed: saving ? null : _save,
              icon: saving ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2)) : const Icon(Icons.save),
              label: const Text('Save Preferences'),
            ),
          ],
        ],
      ),
    );
  }
}
