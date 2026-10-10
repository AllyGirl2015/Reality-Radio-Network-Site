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

path.write_text(text.replace(bad, good, 1))
print('RRN v0.9 generated More menu closure repaired.')
