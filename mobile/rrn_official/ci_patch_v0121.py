from pathlib import Path

ROOT = Path('/tmp/rrn_mobile/lib')


def edit(name: str, old: str, new: str, label: str) -> None:
    path = ROOT / name
    text = path.read_text()
    if old not in text:
        raise SystemExit(f'v0.12.1 patch failed: {label}')
    path.write_text(text.replace(old, new, 1))


# Keep the native Studio launcher because the top-level /studio page itself has
# previously failed translation. The hub now links to the real permission-
# checked Studio subpages (including moderation) instead of raw API resources.
edit(
    'account.dart',
    "screen = const MatrixPageScreen(path: '/studio', title: 'RRN Studio');",
    "screen = const RrnStudioScreen();",
    'native Studio hub route',
)

# App account resources already expose rrn:// deep links for their real website
# management/detail pages. Treat those as navigation descriptors rather than
# falling back to a raw-record viewer.
edit(
    'site.dart',
    "        item['detailPath'] ??\n        item['detail_path'],",
    "        item['detailPath'] ??\n        item['detail_path'] ??\n        item['deepLink'] ??\n        item['deep_link'],",
    'resource deep-link recognition',
)

# Translate rrn://account/... into the corresponding registered site path.
edit(
    'site.dart',
    "  if (rawPath.startsWith('http://') || rawPath.startsWith('https://')) {",
    "  if (rawPath.startsWith('rrn://')) {\n"
    "    final uri = Uri.tryParse(rawPath);\n"
    "    if (uri != null && uri.host.isNotEmpty) {\n"
    "      final internal = '/${uri.host}${uri.path}';\n"
    "      await Navigator.push(\n"
    "        context,\n"
    "        MaterialPageRoute(builder: (_) => MatrixPageScreen(path: internal, title: title)),\n"
    "      );\n"
    "    }\n"
    "    return;\n"
    "  }\n\n"
    "  if (rawPath.startsWith('http://') || rawPath.startsWith('https://')) {",
    'RRN deep-link navigation',
)

print('RRN Mobile v0.12.1 Studio/deep-link fixes applied.')
