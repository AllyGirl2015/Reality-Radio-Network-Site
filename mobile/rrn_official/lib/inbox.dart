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
      final values = await Future.wait([app.api.get('/messages'), app.api.get('/notifications', query: {'limit': 1})]);
      final conversations = listFrom(values[0], const ['conversations']);
      messages = conversations.fold<int>(0, (sum, raw) {
        if (raw is! Map) return sum;
        return sum + numi(raw['unread']);
      });
      notifications = values[1] is Map ? numi((values[1] as Map)['unread']) : 0;
      if (mounted) setState(() {});
    } catch (_) {}
  }

  Future<bool> _ensureAuth() async {
    final app = RrnScope.of(context);
    if (app.auth.signedIn) return true;
    await Navigator.push(context, MaterialPageRoute(builder: (_) => const AccountScreen()));
    return app.auth.signedIn;
  }

  Future<void> _openMessages() async {
    if (!await _ensureAuth() || !mounted) return;
    await Navigator.push(context, MaterialPageRoute(builder: (_) => const MessagesScreen()));
    await _refresh();
  }

  Future<void> _openNotifications() async {
    if (!await _ensureAuth() || !mounted) return;
    await Navigator.push(context, MaterialPageRoute(builder: (_) => const NotificationsScreen()));
    await _refresh();
  }

  @override
  Widget build(BuildContext context) => Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _BadgeIconButton(count: messages, icon: Icons.chat_bubble_outline, tooltip: 'Messages', onPressed: _openMessages),
          _BadgeIconButton(count: notifications, icon: Icons.notifications_none, tooltip: 'Notifications', onPressed: _openNotifications),
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
  List<Map<String, dynamic>> conversations = [];
  bool busy = true;
  String? error;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (busy && conversations.isEmpty && error == null) _load();
  }

  Future<void> _load() async {
    try {
      final body = await RrnScope.of(context).api.get('/messages');
      conversations = listFrom(body, const ['conversations']).whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList();
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
              onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const MatrixPageScreen(path: '/messages', title: 'Start Conversation'))).then((_) => _load()),
              icon: const Icon(Icons.edit_square),
              tooltip: 'Start conversation',
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
                subtitle: 'These are the same RRN conversations and permissions used on RealityRadio.net.',
              ),
              if (busy) const Padding(padding: EdgeInsets.all(30), child: Center(child: CircularProgressIndicator())),
              if (!busy && error != null) _errorCard('Messages unavailable', error!, _load),
              if (!busy && error == null && conversations.isEmpty)
                const Card(child: Padding(padding: EdgeInsets.all(18), child: Text('No conversations yet.'))),
              ...conversations.map(_conversationCard),
            ],
          ),
        ),
      );

  Widget _conversationCard(Map<String, dynamic> m) {
    final id = str(m['id']);
    final peers = listFrom(m['peers']);
    String peerName = '';
    String peerAvatar = '';
    if (peers.isNotEmpty && peers.first is Map) {
      peerName = str((peers.first as Map)['name']);
      peerAvatar = str((peers.first as Map)['avatarUrl']);
    }
    final title = str(m['title']).trim().isNotEmpty ? str(m['title']) : (peerName.isNotEmpty ? peerName : 'Conversation');
    final preview = str(m['last_body'] ?? m['lastBody']);
    final unread = numi(m['unread']);
    return Card(
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: const Color(0xFF10262B),
          backgroundImage: peerAvatar.startsWith('http') ? NetworkImage(peerAvatar) : null,
          child: peerAvatar.startsWith('http') ? null : const Icon(Icons.person, color: rrnCyan),
        ),
        title: Text(title, style: TextStyle(fontWeight: unread > 0 ? FontWeight.w900 : FontWeight.w700)),
        subtitle: preview.isEmpty ? null : Text(preview, maxLines: 2, overflow: TextOverflow.ellipsis),
        trailing: unread > 0
            ? CircleAvatar(radius: 12, backgroundColor: rrnPink, child: Text('$unread', style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w900)))
            : const Icon(Icons.chevron_right),
        onTap: id.isEmpty ? null : () => Navigator.push(context, MaterialPageRoute(builder: (_) => MessageThreadScreen(conversationId: id, title: title))).then((_) => _load()),
      ),
    );
  }
}

class MessageThreadScreen extends StatefulWidget {
  final String conversationId;
  final String title;
  const MessageThreadScreen({super.key, required this.conversationId, required this.title});

  @override
  State<MessageThreadScreen> createState() => _MessageThreadScreenState();
}

class _MessageThreadScreenState extends State<MessageThreadScreen> {
  final composer = TextEditingController();
  List<Map<String, dynamic>> messages = [];
  String viewerId = '';
  bool busy = true;
  bool sending = false;
  String? error;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  @override
  void dispose() {
    composer.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    try {
      final app = RrnScope.of(context);
      final body = await app.api.get('/messages', query: {'conversation': widget.conversationId});
      messages = listFrom(body, const ['messages']).whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList();
      viewerId = body is Map ? str(body['viewerId']) : '';
      error = null;
      try {
        await app.api.post('/messages', body: {'action': 'read', 'conversationId': widget.conversationId});
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
      await RrnScope.of(context).api.post('/messages', body: {
        'action': 'send',
        'conversationId': widget.conversationId,
        'body': text,
      });
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
                      ? ListView(padding: const EdgeInsets.all(16), children: [_errorCard('Conversation unavailable', error!, _load)])
                      : ListView.builder(
                          padding: const EdgeInsets.all(12),
                          itemCount: messages.length,
                          itemBuilder: (context, index) {
                            final m = messages[index];
                            final mine = str(m['sender_user_id'] ?? m['senderUserId']) == viewerId;
                            final text = str(m['body']);
                            final author = str(m['sender_name'] ?? m['senderName'], 'RRN Member');
                            return Align(
                              alignment: mine ? Alignment.centerRight : Alignment.centerLeft,
                              child: Container(
                                constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * .80),
                                margin: const EdgeInsets.symmetric(vertical: 4),
                                padding: const EdgeInsets.all(11),
                                decoration: BoxDecoration(
                                  color: mine ? const Color(0xFF123E46) : rrnPanel2,
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(color: mine ? rrnCyan.withValues(alpha: .25) : Colors.white10),
                                ),
                                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                  if (!mine) Text(author, style: const TextStyle(color: rrnPurple, fontSize: 10, fontWeight: FontWeight.w900)),
                                  Text(text),
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
                child: Row(children: [
                  Expanded(child: TextField(controller: composer, minLines: 1, maxLines: 5, decoration: const InputDecoration(hintText: 'Message…'), onSubmitted: (_) => _send())),
                  const SizedBox(width: 6),
                  IconButton.filled(
                    onPressed: sending ? null : _send,
                    icon: sending ? const SizedBox(width: 17, height: 17, child: CircularProgressIndicator(strokeWidth: 2)) : const Icon(Icons.send),
                  ),
                ]),
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
  List<Map<String, dynamic>> notifications = [];
  int unread = 0;
  bool busy = true;
  String? error;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (busy && notifications.isEmpty && error == null) _load();
  }

  Future<void> _load() async {
    try {
      final body = await RrnScope.of(context).api.get('/notifications', query: {'limit': 100});
      notifications = listFrom(body, const ['items']).whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList();
      unread = body is Map ? numi(body['unread']) : 0;
      error = null;
    } catch (e) {
      error = '$e';
    } finally {
      busy = false;
      if (mounted) setState(() {});
    }
  }

  Future<void> _markAllRead() async {
    try {
      await RrnScope.of(context).api.post('/notifications', body: const {'action': 'read_all'});
      await _load();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    }
  }

  Future<void> _open(Map<String, dynamic> item) async {
    final id = str(item['id']);
    if (!boolish(item['read']) && id.isNotEmpty) {
      try {
        await RrnScope.of(context).api.post('/notifications', body: {'action': 'read', 'notificationId': id});
      } catch (_) {}
    }
    final path = str(item['webUrl']);
    if (path.isNotEmpty && mounted) {
      await Navigator.push(context, MaterialPageRoute(builder: (_) => MatrixPageScreen(path: path, title: str(item['title'], 'Notification'))));
    }
    await _load();
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(
          title: Text(unread > 0 ? 'Notifications ($unread)' : 'Notifications'),
          actions: [
            IconButton(onPressed: unread > 0 ? _markAllRead : null, icon: const Icon(Icons.done_all), tooltip: 'Mark all read'),
            IconButton(onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const PushNotificationSettingsScreen())), icon: const Icon(Icons.settings_outlined)),
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
                subtitle: 'This inbox is driven by the native App Translation Matrix notification model.',
              ),
              if (busy) const Padding(padding: EdgeInsets.all(30), child: Center(child: CircularProgressIndicator())),
              if (!busy && error != null) _errorCard('Notifications unavailable', error!, _load),
              if (!busy && error == null && notifications.isEmpty)
                const Card(child: Padding(padding: EdgeInsets.all(18), child: Text('You have no notifications.'))),
              ...notifications.map((m) {
                final read = boolish(m['read']);
                return Card(
                  color: read ? null : const Color(0xFF111C29),
                  child: ListTile(
                    leading: Icon(read ? Icons.notifications_none : Icons.notifications_active, color: read ? Colors.white54 : rrnCyan),
                    title: Text(str(m['title'], 'RRN Notification'), style: TextStyle(fontWeight: read ? FontWeight.w700 : FontWeight.w900)),
                    subtitle: Text([str(m['actorName']), str(m['body'])].where((e) => e.isNotEmpty).join(' · '), maxLines: 3, overflow: TextOverflow.ellipsis),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () => _open(m),
                  ),
                );
              }),
            ],
          ),
        ),
      );
}

class PushNotificationSettingsScreen extends StatelessWidget {
  const PushNotificationSettingsScreen({super.key});

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: const Text('Notification Settings')),
        body: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            const RrnSectionHeader(
              eyebrow: 'Device Notifications',
              title: 'RRN notification delivery.',
              subtitle: 'The Matrix supports device and push registration. Provider push delivery is not yet enabled on the backend, while the in-app notification inbox is active now.',
            ),
            const SizedBox(height: 14),
            Card(
              child: ListTile(
                leading: const Icon(Icons.notifications_active_outlined, color: rrnCyan),
                title: const Text('RRN inbox', style: TextStyle(fontWeight: FontWeight.w900)),
                subtitle: const Text('Messages and social/account notifications are available inside the app.'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const NotificationsScreen())),
              ),
            ),
            Card(
              child: ListTile(
                leading: const Icon(Icons.settings_applications, color: rrnPurple),
                title: const Text('Account notification preferences', style: TextStyle(fontWeight: FontWeight.w900)),
                subtitle: const Text('Open the current RRN preference surface.'),
                trailing: const Icon(Icons.open_in_new),
                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const MatrixPageScreen(path: '/account/settings', title: 'Notification Preferences'))),
              ),
            ),
          ],
        ),
      );
}

Widget _errorCard(String title, String detail, Future<void> Function() retry) => Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(title, style: const TextStyle(fontWeight: FontWeight.w900)),
          const SizedBox(height: 5),
          Text(detail, style: const TextStyle(color: Colors.white60)),
          const SizedBox(height: 8),
          FilledButton.tonal(onPressed: retry, child: const Text('Retry')),
        ]),
      ),
    );
