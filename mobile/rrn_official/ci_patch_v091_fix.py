from pathlib import Path

path = Path('/tmp/rrn_mobile/lib/main.dart')
text = path.read_text()

bad = """              onTap: () => _openMore(context, path, title),
              ),
            ),
          );
"""
good = """              onTap: () => _openMore(context, path, title),
            ),
          );
"""

if bad not in text:
    marker = "              onTap: () => _openMore(context, path, title),\n"
    start = text.find(marker)
    if start < 0:
        raise SystemExit('v0.9.1 fix failed: More onTap marker missing')
    print(text[start:start + 220])
    raise SystemExit('v0.9.1 fix failed: generated More closure shape changed')

text = text.replace(bad, good, 1)

# audio_service requires androidNotificationOngoing=false when
# androidStopForegroundOnPause=false. The latter already keeps the audio service
# in the foreground during pause, and our explicit native media notification is
# itself ongoing. Setting both modes caused a const-constructor assertion.
text = text.replace(
    'androidNotificationOngoing: true,',
    'androidNotificationOngoing: false,',
    1,
)

path.write_text(text)
print('RRN v0.9 generated More menu and persistent audio config repaired.')
