from pathlib import Path

path = Path('/tmp/rrn_mobile/android/app/src/main/kotlin/com/rbew/rrn_official/MainActivity.kt')
text = path.read_text()


def replace_once(old, new, label):
    global text
    if old not in text:
        raise SystemExit(f'v0.8.1 Android patch failed: {label}')
    text = text.replace(old, new, 1)

replace_once(
    '    private var sourceId = ""\n',
    '    private var sourceId = ""\n    private var volume = 1.0\n',
    'native volume state',
)
replace_once(
    '            ACTION_NEXT -> RrnNativeMediaBridge.emit("next")\n            ACTION_STOP -> RrnNativeMediaBridge.emit("stop")\n',
    '            ACTION_NEXT -> RrnNativeMediaBridge.emit("next")\n            ACTION_VOLUME_DOWN -> RrnNativeMediaBridge.emit("volumeDown")\n            ACTION_VOLUME_UP -> RrnNativeMediaBridge.emit("volumeUp")\n            ACTION_STOP -> RrnNativeMediaBridge.emit("stop")\n',
    'native volume actions',
)
replace_once(
    '        return START_NOT_STICKY\n',
    '        return START_STICKY\n',
    'sticky media foreground service',
)
replace_once(
    '        sourceId = intent.getStringExtra(EXTRA_SOURCE_ID).orEmpty()\n',
    '        sourceId = intent.getStringExtra(EXTRA_SOURCE_ID).orEmpty()\n        volume = intent.getDoubleExtra(EXTRA_VOLUME, 1.0).coerceIn(0.0, 1.0)\n',
    'read native volume state',
)
replace_once(
    '            .setSubText(album.takeIf { it.isNotBlank() })\n',
    '            .setSubText((album.takeIf { it.isNotBlank() } ?: "RRN") + " · VOL ${(volume * 100).toInt()}%")\n',
    'notification volume display',
)
replace_once(
    '''        builder.addAction(
            android.R.drawable.ic_media_next,
            if (live) "Scan up" else "Next",
            serviceAction(ACTION_NEXT, 103),
        )
        builder.addAction(
            android.R.drawable.ic_menu_close_clear_cancel,
            "Stop",
            serviceAction(ACTION_STOP, 104),
        )
''',
    '''        builder.addAction(
            android.R.drawable.ic_media_next,
            if (live) "Scan up" else "Next",
            serviceAction(ACTION_NEXT, 103),
        )
        builder.addAction(
            android.R.drawable.ic_media_rew,
            "Volume down",
            serviceAction(ACTION_VOLUME_DOWN, 106),
        )
        builder.addAction(
            android.R.drawable.ic_media_ff,
            "Volume up",
            serviceAction(ACTION_VOLUME_UP, 107),
        )
        builder.addAction(
            android.R.drawable.ic_menu_close_clear_cancel,
            "Stop",
            serviceAction(ACTION_STOP, 104),
        )
''',
    'notification volume buttons',
)
replace_once(
    '        private const val ACTION_NEXT = "com.rbew.rrn_official.media.NEXT"\n        private const val ACTION_STOP = "com.rbew.rrn_official.media.STOP"\n',
    '        private const val ACTION_NEXT = "com.rbew.rrn_official.media.NEXT"\n        private const val ACTION_VOLUME_DOWN = "com.rbew.rrn_official.media.VOLUME_DOWN"\n        private const val ACTION_VOLUME_UP = "com.rbew.rrn_official.media.VOLUME_UP"\n        private const val ACTION_STOP = "com.rbew.rrn_official.media.STOP"\n',
    'native volume action constants',
)
replace_once(
    '        private const val EXTRA_SOURCE_ID = "sourceId"\n',
    '        private const val EXTRA_SOURCE_ID = "sourceId"\n        private const val EXTRA_VOLUME = "volume"\n',
    'native volume extra constant',
)
replace_once(
    '                .putExtra(EXTRA_SOURCE_ID, values[EXTRA_SOURCE_ID]?.toString().orEmpty())\n',
    '                .putExtra(EXTRA_SOURCE_ID, values[EXTRA_SOURCE_ID]?.toString().orEmpty())\n                .putExtra(EXTRA_VOLUME, (values[EXTRA_VOLUME] as? Number)?.toDouble() ?: 1.0)\n',
    'publish volume to service',
)

path.write_text(text)
