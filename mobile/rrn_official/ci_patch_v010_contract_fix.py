from pathlib import Path

path = Path('/tmp/rrn_mobile/lib/feed_composer.dart')
text = path.read_text()
old = "files: {if (heroImageFile.isNotEmpty) 'heroImage': heroImageFile},"
new = "files: {if (heroImageFile.isNotEmpty) 'uploads': heroImageFile},"
if old not in text:
    raise SystemExit('v0.10 contract fix failed: feed upload field anchor missing')
path.write_text(text.replace(old, new, 1))
print('RRN Mobile v0.10 feed upload contract corrected.')
