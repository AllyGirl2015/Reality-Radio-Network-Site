#!/usr/bin/env bash
set -euxo pipefail

# Apply the final v0.12 Studio/deep-link patch in the existing build pipeline
# without duplicating the full Android build script.
SCRIPT="mobile/rrn_official/build_android_v012.sh"
python3 - <<'PY'
from pathlib import Path
path=Path('mobile/rrn_official/build_android_v012.sh')
text=path.read_text()

# v0.10's Android hardening patch expects the RRN native media activity/service
# source to already be present, matching the established v0.11 workflow order.
android_anchor='python3 "$ROOT/mobile/rrn_official/ci_patch_v010.py"\n'
android_prep='cp "$ROOT/mobile/rrn_official/android_native/RrnNativeMedia.kt" "$APP/android/app/src/main/kotlin/com/rbew/rrn_official/MainActivity.kt"\n\n'
if android_prep not in text.split(android_anchor,1)[0]:
    if android_anchor not in text:
        raise SystemExit('v0.12.1 build wrapper could not find Android hardening insertion point')
    text=text.replace(android_anchor, android_prep+android_anchor, 1)

old='python3 "$ROOT/mobile/rrn_official/ci_patch_v012.py"\n'
new=old+'python3 "$ROOT/mobile/rrn_official/ci_patch_v0121.py"\n'
if 'ci_patch_v0121.py' not in text:
    if old not in text:
        raise SystemExit('v0.12.1 build wrapper could not find patch insertion point')
    text=text.replace(old,new,1)

text=text.replace(
    'grep -q "MatrixPageScreen(path: \'/studio\'" "$APP/lib/account.dart"',
    'grep -q "screen = const RrnStudioScreen();" "$APP/lib/account.dart"',
)
if 'item[\'deepLink\']' not in text:
    marker='grep -q "redirect\\[\'webUrl\'\\]" "$APP/lib/site.dart"\n'
    if marker in text:
        text=text.replace(marker, marker+'grep -q "item[\'deepLink\']" "$APP/lib/site.dart"\n',1)

path.write_text(text)
PY

exec bash "$SCRIPT"
