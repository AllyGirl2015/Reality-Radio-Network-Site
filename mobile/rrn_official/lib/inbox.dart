import 'dart:async';

import 'package:flutter/material.dart';

import 'account.dart';
import 'core.dart';
import 'site.dart';

class RrnTopInboxActions extends StatefulWidget {
  const RrnTopInboxActions({super.key});

  @override
  State<RrnTopInboxActions> createState() => _RrnTopInboxActionsState();
}

class _RrnTopInboxActionsState extends State<RrnTopInboxActions> {
  Timer? timer;
  int messages = 0;
  int notifications = 0;
  bool initialized = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (initialized) return;
    initialized = true;
    _refresh();
    timer = Timer.periodic(const Duration(seconds: 45), (_) => _refresh());
  }

  @override
  void dispose() {
    timer?.cancel();
    super.dispose();
  }

  Future<void> _refresh() async {
    final app = RrnScope.of(context);
    if (!app.auth.signedIn) {
      if (mounted) setState(() {
        messages = 0;
        notifications = 0;
      });
      return;
    }
    try {
      final body = await app.api.get('/social/unread-counts');
      if (body is Map) {
        final m = Map<String, dynamic>.from(body);
        messages = numi(m['messages'] ?? m['unreadMessages'] ?? m['unread_messages']);
        notifications = numi(m['notifications'] ?? m['unreadNotifications'] ?? m['unread_notifications']);
        if (mounted) setState(() {});
        return;
      }
    } catch (_) {}

    try {
      final body = await app.api.get('/notifications/unread-counts');
      if (body is Map) {
        final m = Map<String, dynamic>.from(body);
        messages = numi(m['messages'] ?? m['unreadMessages']);
        notifications = numi(m['notifications'] ?? m['count'] ?? m['unreadNotifications']);
        if (mounted) setState(() {});
      }
    } catch (_) {}
  }

  Future<void> _openMessages() async {
    final app = RrnScope.of(context);
    if (!app.auth.signedIn) {
      await Navigator.push(context, MaterialPageRoute(builder: (_) => const AccountScreen()));
      if (!app.auth.signedIn) return;
    }
    if (!mounted) return;
    await Navigator.push(context, MaterialPageRoute(builder: (_) => const MessagesScreen()));
    await _refresh();
  }

  Future<void> _openNotifications() async {
    final app = RrnScope.of(context);
    if (!app.auth.signedIn) {
      await Navigator.push(context, MaterialPageRoute(builder: (_) => const AccountScreen()));
      if (!app.auth.signedIn) return;
    }
    if (!mounted) return;
    await Navigator.push(context, MaterialPageRoute(builder: (_) => const NotificationsScreen()));
    await _refresh();
  }

  @override
  Widget build(BuildContext context) => Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _BadgeIconButton(
            count: messages,
            icon: Icons.chat_bubble_outline,
            tooltip: 'Messages',
            onPressed: _openMessages,
          ),
          _BadgeIconButton(
            count: notifications,
            icon: Icons.notifications_none,
            tooltip: 'Notifications',
            onPressed: _openNotifications,
          ),
        ],
      );
}

class _BadgeIconButton extends StatelessWidget {
  final int count;
  final IconData icon;
  final String tooltip;
  final VoidCallback onPressed;

  const _BadgeIconButton({required this.count, required this.icon, required this.tooltip, required this.onPressed});

  @override
  Widget build(BuildContext context) => Stack(
        clipBehavior: Clip.none,
        children: [
          IconButton(onPressed: onPressed, icon: Icon(icon), tooltip: tooltip),
          if (count > 0)
            Positioned(
              right: 4,
              top: 4,
              child: Container(
                constraints: const BoxConstraints(minWidth: 17, minHeight: 17),
                padding: const EdgeInsets.symmetric(horizontal: 4),
                decoration: BoxDecoration(color: rrnPink, borderRadius: BorderRadius.circular(99), border: Border.all(color: rrnBg, width: 1.5)),
                alignment: Alignment.center,
                child: Text(count > 99 ? '99+' : '$count', style: const TextStyle(fontSize: 8, fontWeight: FontWeight.w900, color: Colors.white)),
              ),
            ),
        ],
      );
}

class MessagesScreen extends StatefulWidget {
  const MessagesScreen({super.key});

  @override
  State<MessagesScreen> createState() => _MessagesScreenState();
}

class _MessagesScreenState extends State<MessagesScreen> {
  List<dynamic> threads = [];
  bool busy = true;
  String? error;
  bool initialized = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (initialized) return;
    initialized = true;
    _load();
  }

  Future<void> _load() async {
    setState(() => busy = true);
    try {
      final body = await RrnScope.of(context).api.get('/social/messages');
      threads = listFrom(body, const ['threads', 'conversations', 'messages']);
      error = null;
    } catch (e) {
      error = '$e';
    } finally {
      busy = false;
      if (mounted) setState(() {});
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(
          title: const Text('Messages'),
          actions: [
            IconButton(
              onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const MatrixPageScreen(path: '/account/social/messages/new', title: 'New Message'))),
              icon: const Icon(Icons.edit_square),
              tooltip: 'New message',
            ),
          ],
        ),
        body: RefreshIndicator(
          onRefresh: _load,
          child: ListView(
            padding: const EdgeInsets.fromLTRB(14, 12, 14, 90),
            children: [
              const RrnSectionHeader(
                eyebrow: 'RRN Messenger',
                title: 'Your conversations.',
                subtitle: 'The mobile messenger uses the same RRN account, conversations and permissions as RealityRadio.net.',
              ),
              if (busy) const Padding(padding: EdgeInsets.all(30), child: Center(child: CircularProgressIndicator())),
              if (!busy && error != null)
                _PendingBridgeCard(
                  title: 'Messenger Matrix bridge pending',
                  detail: error!,
                  path: '/account/social/messages',
                  button: 'Open current messages surface',
                ),
              ...threads.map((raw) {
                final m = raw is Map ? Map<String, dynamic>.from(raw) : <String, dynamic>{};
                final id = str(m['id'] ?? m['threadId'] ?? m['thread_id'] ?? m['conversationId'] ?? m['conversation_id']);
                final name = str(m['title'] ?? m['displayName'] ?? m['display_name'] ?? m['name'] ?? m['participantName'] ?? m['participant_name'], 'Conversation');
                final preview = str(m['preview'] ?? m['lastMessage'] ?? m['last_message'] ?? m['body']);
                final unread = numi(m['unread'] ?? m['unreadCount'] ?? m['unread_count']);
                return Card(
                  child: ListTile(
                    leading: const CircleAvatar(backgroundColor: Color(0xFF10262B), child: Icon(Icons.person, color: rrnCyan)),
                    title: Text(name, style: TextStyle(fontWeight: unread > 0 ? FontWeight.w900 : FontWeight.w700)),
                    subtitle: preview.isEmpty ? null : Text(preview, maxLines: 2, overflow: TextOverflow.ellipsis),
                    trailing: unread > 0
                        ? CircleAvatar(radius: 12, backgroundColor: rrnPink, child: Text('$unread', style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w900)))
                        : const Icon(Icons.chevron_right),
                    onTap: id.isEmpty ? null : () => Navigator.push(context, MaterialPageRoute(builder: (_) => MessageThreadScreen(threadId: id, title: name))).then((_) => _load()),
                  ),
                );
              }),
            ],
          ),
        ),
      );
}

class MessageThreadScreen extends StatefulWidget {
  final String threadId;
  final String title;
  const MessageThreadScreen({super.key, required this.threadId, required this.title});

  @override
  State<MessageThreadScreen> createState() => _MessageThreadScreenState();
}

class _MessageThreadScreenState extends State<MessageThreadScreen> {
  final composer = TextEditingController();
  List<dynamic> messages = [];
  bool busy = true;
  bool sending = false;
  String? error;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  Future<void> _load() async {
    try {
      final app = RrnScope.of(context);
      final body = await app.api.get('/social/messages/${widget.threadId}');
      messages = listFrom(body, const ['messages', 'items']);
      error = null;
      try {
        await app.api.post('/social/messages/${widget.threadId}/read', body: const {});
      } catch (_) {}
    } catch (e) {
      error = '$e';
    } finally {
      busy = false;
      if (mounted) setState(() {});
    }
  }

  Future<void> _send() async {
    final text = composer.text.trim();
    if (text.isEmpty || sending) return;
    setState(() => sending = true);
    try {
      await RrnScope.of(context).api.post('/social/messages/${widget.threadId}', body: {'body': text, 'text': text});
      composer.clear();
      await _load();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Message failed: $e')));
    } finally {
      sending = false;
      if (mounted) setState(() {});
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: Text(widget.title)),
        body: Column(
          children: [
            Expanded(
              child: busy
                  ? const Center(child: CircularProgressIndicator())
                  : error != null
                      ? ListView(padding: const EdgeInsets.all(16), children: [
                          _PendingBridgeCard(title: 'Native thread bridge pending', detail: error!, path: '/account/social/messages/${widget.threadId}', button: 'Open website-equivalent thread'),
                        ])
                      : ListView.builder(
                          reverse: true,
                          padding: const EdgeInsets.all(12),
                          itemCount: messages.length,
                          itemBuilder: (context, index) {
                            final raw = messages[messages.length - 1 - index];
                            final m = raw is Map ? Map<String, dynamic>.from(raw) : <String, dynamic>{};
                            final mine = boolish(m['mine'] ?? m['isMine'] ?? m['is_mine']);
                            final body = str(m['body'] ?? m['text'] ?? m['content']);
                            final author = str(m['authorName'] ?? m['author_name'] ?? m['senderName'] ?? m['sender_name']);
                            return Align(
                              alignment: mine ? Alignment.centerRight : Alignment.centerLeft,
                              child: Container(
                                constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * .78),
                                margin: const EdgeInsets.symmetric(vertical: 4),
                                padding: const EdgeInsets.all(11),
                                decoration: BoxDecoration(
                                  color: mine ? const Color(0xFF123E46) : rrnPanel2,
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(color: mine ? rrnCyan.withValues(alpha: .25) : Colors.white10),
                                ),
                                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                  if (!mine && author.isNotEmpty) Text(author, style: const TextStyle(color: rrnPurple, fontSize: 10, fontWeight: FontWeight.w900)),
                                  Text(body),
                                ]),
                              ),
                            );
                          },
                        ),
            ),
            SafeArea(
              top: false,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(10, 7, 7, 7),
                child: Row(
                  children: [
                    Expanded(child: TextField(controller: composer, minLines: 1, maxLines: 5, decoration: const InputDecoration(hintText: 'Message…'), onSubmitted: (_) => _send())),
                    const SizedBox(width: 6),
                    IconButton.filled(onPressed: sending ? null : _send, icon: sending ? const SizedBox(width: 17, height: 17, child: CircularProgressIndicator(strokeWidth: 2)) : const Icon(Icons.send)),
                  ],
                ),
              ),
            ),
          ],
        ),
      );
}

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  List<dynamic> notifications = [];
  bool busy = true;
  String? error;
  bool initialized = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (initialized) return;
    initialized = true;
    _load();
  }

  Future<void> _load() async {
    setState(() => busy = true);
    try {
      final body = await RrnScope.of(context).api.get('/social/notifications');
      notifications = listFrom(body, const ['notifications', 'items']);
      error = null;
    } catch (first) {
      try {
        final body = await RrnScope.of(context).api.get('/notifications');
        notifications = listFrom(body, const ['notifications', 'items']);
        error = null;
      } catch (second) {
        error = '$first';
      }
    } finally {
      busy = false;
      if (mounted) setState(() {});
    }
  }

  Future<void> _markAllRead() async {
    try {
      await RrnScope.of(context).api.post('/social/notifications/read-all', body: const {});
      await _load();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    }
  }

  Future<void> _openNotification(Map<String, dynamic> m) async {
    final id = str(m['id']);
    if (id.isNotEmpty) {
      try {
        await RrnScope.of(context).api.post('/social/notifications/$id/read', body: const {});
      } catch (_) {}
    }
    final path = str(m['path'] ?? m['href'] ?? m['route'] ?? m['deepLink'] ?? m['deep_link']);
    if (path.isNotEmpty && mounted) {
      await Navigator.push(context, MaterialPageRoute(builder: (_) => MatrixPageScreen(path: path, title: str(m['title'], 'Notification'))));
    }
    await _load();
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(
          title: const Text('Notifications'),
          actions: [
            IconButton(onPressed: _markAllRead, icon: const Icon(Icons.done_all), tooltip: 'Mark all read'),
            IconButton(onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const PushNotificationSettingsScreen())), icon: const Icon(Icons.settings_outlined), tooltip: 'Notification settings'),
          ],
        ),
        body: RefreshIndicator(
          onRefresh: _load,
          child: ListView(
            padding: const EdgeInsets.fromLTRB(14, 12, 14, 90),
            children: [
              const RrnSectionHeader(
                eyebrow: 'RRN Notifications',
                title: 'Everything that needs your attention.',
                subtitle: 'Social activity, messages, stations, shows, requests, charts, events, giveaways, purchases and future push alerts share one RRN notification model.',
              ),
              if (busy) const Padding(padding: EdgeInsets.all(30), child: Center(child: CircularProgressIndicator())),
              if (!busy && error != null)
                _PendingBridgeCard(title: 'Native notification bridge pending', detail: error!, path: '/account/social/notifications', button: 'Open current notification surface'),
              ...notifications.map((raw) {
                final m = raw is Map ? Map<String, dynamic>.from(raw) : <String, dynamic>{};
                final unread = !(boolish(m['read'] ?? m['isRead'] ?? m['is_read']));
                final title = str(m['title'] ?? m['type'], 'RRN Notification');
                final body = str(m['body'] ?? m['message'] ?? m['text']);
                return Card(
                  color: unread ? const Color(0xFF101A23) : null,
                  child: ListTile(
                    leading: Icon(unread ? Icons.notifications_active : Icons.notifications_none, color: unread ? rrnCyan : Colors.white38),
                    title: Text(title, style: TextStyle(fontWeight: unread ? FontWeight.w900 : FontWeight.w700)),
                    subtitle: body.isEmpty ? null : Text(body, maxLines: 3, overflow: TextOverflow.ellipsis),
                    trailing: unread ? const Icon(Icons.circle, size: 9, color: rrnPink) : const Icon(Icons.chevron_right),
                    onTap: () => _openNotification(m),
                  ),
                );
              }),
            ],
          ),
        ),
      );
}

class PushNotificationSettingsScreen extends StatefulWidget {
  const PushNotificationSettingsScreen({super.key});

  @override
  State<PushNotificationSettingsScreen> createState() => _PushNotificationSettingsScreenState();
}

class _PushNotificationSettingsScreenState extends State<PushNotificationSettingsScreen> {
  final categories = <String, bool>{
    'messages': true,
    'social': true,
    'stations': true,
    'shows': true,
    'requests': true,
    'callins': true,
    'charts': true,
    'events': true,
    'giveaways': true,
    'music': true,
    'store': true,
  };
  bool pushEnabled = true;
  String? status;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final prefs = RrnScope.of(context).prefs;
    pushEnabled = prefs?.getBool('rrn_push_enabled') ?? true;
    for (final key in categories.keys.toList()) {
      categories[key] = prefs?.getBool('rrn_push_$key') ?? categories[key]!;
    }
  }

  Future<void> _save() async {
    final app = RrnScope.of(context);
    await app.prefs?.setBool('rrn_push_enabled', pushEnabled);
    for (final entry in categories.entries) {
      await app.prefs?.setBool('rrn_push_${entry.key}', entry.value);
    }
    try {
      await app.api.post('/notifications/preferences', body: {
        'enabled': pushEnabled,
        'categories': categories,
        'platform': 'android',
        'source': 'rrn-mobile',
      });
      status = 'Notification preferences synced with RRN.';
    } catch (e) {
      status = 'Saved on this device. The push-preference Matrix bridge is still pending: $e';
    }
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: const Text('Notification Settings')),
        body: ListView(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 90),
          children: [
            const RrnSectionHeader(
              eyebrow: 'Push Ready',
              title: 'Choose what RRN can alert you about.',
              subtitle: 'These settings are already modeled for the app. Actual remote push delivery will activate when the backend device-token bridge and Android push provider configuration are connected.',
            ),
            SwitchListTile(contentPadding: EdgeInsets.zero, title: const Text('Push notifications'), value: pushEnabled, onChanged: (v) => setState(() => pushEnabled = v)),
            const Divider(),
            ...categories.entries.map((entry) => SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  title: Text(_label(entry.key)),
                  value: entry.value && pushEnabled,
                  onChanged: pushEnabled ? (v) => setState(() => categories[entry.key] = v) : null,
                )),
            const SizedBox(height: 12),
            FilledButton.icon(onPressed: _save, icon: const Icon(Icons.save), label: const Text('Save notification preferences')),
            if (status != null) Padding(padding: const EdgeInsets.only(top: 12), child: Text(status!, style: const TextStyle(color: Colors.white60))),
          ],
        ),
      );

  String _label(String key) => switch (key) {
        'messages' => 'Messages',
        'social' => 'Social activity',
        'stations' => 'Stations going live',
        'shows' => 'Shows & presenters',
        'requests' => 'Song request status',
        'callins' => 'Call-in status',
        'charts' => 'Reality Charts',
        'events' => 'Events',
        'giveaways' => 'Giveaways',
        'music' => 'Music & releases',
        'store' => 'Store, purchases & entitlements',
        _ => key,
      };
}

class _PendingBridgeCard extends StatelessWidget {
  final String title;
  final String detail;
  final String path;
  final String button;
  const _PendingBridgeCard({required this.title, required this.detail, required this.path, required this.button});

  @override
  Widget build(BuildContext context) => Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(title, style: const TextStyle(fontWeight: FontWeight.w900)),
            const SizedBox(height: 6),
            const Text('The native client is ready for the same RRN data. Until that Matrix route is live, the current site-equivalent surface remains available.', style: TextStyle(color: Colors.white70)),
            const SizedBox(height: 8),
            Text(detail, style: const TextStyle(fontSize: 10, color: Colors.white38)),
            const SizedBox(height: 10),
            OutlinedButton.icon(
              onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => MatrixPageScreen(path: path, title: title))),
              icon: const Icon(Icons.open_in_new),
              label: Text(button),
            ),
          ]),
        ),
      );
}
