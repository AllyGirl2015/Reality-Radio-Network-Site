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

if bad in text:
    path.write_text(text.replace(bad, good, 1))
else:
    # A prior regex may have left only one orphan closure. Remove the orphan
    # directly between the ListTile and Card closes without touching other cards.
    marker = "              onTap: () => _openMore(context, path, title),\n"
    start = text.find(marker)
    if start < 0:
        raise SystemExit('v0.9.1 fix failed: More onTap marker missing')
    tail = text[start:start + 220]
    repaired = tail.replace("\n            ),\n            ),\n          );", "\n            ),\n          );", 1)
    if repaired == tail:
        print('Generated More block did not contain the expected duplicate closure; leaving it unchanged.')
        print(tail)
    else:
        text = text[:start] + repaired + text[start + len(tail):]
        path.write_text(text)
