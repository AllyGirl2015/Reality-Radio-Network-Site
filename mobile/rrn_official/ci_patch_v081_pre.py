from pathlib import Path
import re

path = Path('/tmp/rrn_mobile/lib/main.dart')
text = path.read_text()

pattern = re.compile(
    r"\s*onTap: \(\) => Navigator\.push\(\s*context,\s*MaterialPageRoute\(\s*builder: \(_\) => path == '/store'\s*\? MatrixEndpointScreen\(endpoint: '/store', title: title\)\s*:\s*MatrixPageScreen\(path: path, title: title\),\s*\),\s*\),",
    re.S,
)
replacement = "\n              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => MatrixPageScreen(path: path, title: title))),"
text, count = pattern.subn(replacement, text, count=1)
if count != 1:
    raise SystemExit('v0.8.1 pre-patch failed: could not normalize More menu route')

path.write_text(text)
print('RRN Mobile v0.8.1 pre-patch applied successfully.')
