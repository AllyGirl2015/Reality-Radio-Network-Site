import 'package:flutter/material.dart';
import 'package:just_audio/just_audio.dart';
import 'package:audio_service/audio_service.dart';

import 'account.dart';
import 'core.dart';
import 'site.dart';

class MusicScreen extends StatefulWidget {
  const MusicScreen({super.key});
  @override
  State<MusicScreen> createState() => _MusicScreenState();
}

class _MusicScreenState extends State<MusicScreen> {
  final query = TextEditingController();
  List<dynamic> results = [];
  bool busy = false;
  String? error;
  bool loaded = false;
