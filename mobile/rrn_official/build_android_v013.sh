#!/usr/bin/env bash
set -euxo pipefail

ROOT="${GITHUB_WORKSPACE:-$(pwd)}"
APP=/tmp/rrn_mobile

rm -rf "$APP"
flutter create --platforms=android --org com.rbew --project-name rrn_official "$APP"
cp "$ROOT/mobile/rrn_official/pubspec.yaml" "$APP/pubspec.yaml"
rm -rf "$APP/lib"
cp -R "$ROOT/mobile/rrn_official/lib" "$APP/lib"
rm -rf "$APP/test" "$APP/analysis_options.yaml"

# Temporary compatibility cleanup only. v0.13 does NOT run the historical
# feature patch chain; checked-in Dart source is the source of truth.
sed -i 's#package:just_audio_background/just_audio_background.dart#package:audio_service/audio_service.dart#g' "$APP/lib/tuner.dart"
sed -i 's/Colors.white45/Colors.white54/g' "$APP/lib/tuner_v04.dart"

python3 -m pip install --quiet pillow
mkdir -p "$APP/assets"
python3 - <<'PY'
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import math, random, struct, wave
APP=Path('/tmp/rrn_mobile')
assets=APP/'assets'
def logo(size):
    im=Image.new('RGB',(size,size),(2,4,10)); d=ImageDraw.Draw(im); cx=cy=size/2
    for i,c in enumerate([(0,243,255),(95,110,255),(168,85,247),(236,72,153)]):
        pad=size*(.055+i*.025); d.ellipse((pad,pad,size-pad,size-pad),outline=c,width=max(2,size//70))
    for n in range(36):
        a=2*math.pi*n/36-math.pi/2; r1=size*.395; r2=size*(.435 if n%3 else .455)
        d.line((cx+math.cos(a)*r1,cy+math.sin(a)*r1,cx+math.cos(a)*r2,cy+math.sin(a)*r2),fill=(0,243,255) if n<18 else (236,72,153),width=max(1,size//95))
    d.rounded_rectangle((size*.14,size*.43,size*.86,size*.72),radius=size*.06,fill=(5,8,18),outline=(168,85,247),width=max(3,size//65))
    try: font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',int(size*.245))
    except Exception: font=ImageFont.load_default()
    b=d.textbbox((0,0),'RRN',font=font)
    d.text(((size-(b[2]-b[0]))/2,size*.46),'RRN',font=font,fill=(245,247,255),stroke_width=max(1,size//110),stroke_fill=(168,85,247))
    return im
logo(1024).save(assets/'rrn_app_logo.png')
for bucket,sz in {'mdpi':48,'hdpi':72,'xhdpi':96,'xxhdpi':144,'xxxhdpi':192}.items():
    p=APP/'android/app/src/main/res'/f'mipmap-{bucket}'; p.mkdir(parents=True,exist_ok=True); logo(sz).save(p/'ic_launcher.png')
sr=44100; seconds=4; random.seed(2015); samples=[]; prev=0.0
for _ in range(sr*seconds):
    white=random.uniform(-1,1); prev=.72*prev+.28*white; value=max(-1,min(1,white*.48+prev*.42)); samples.append(int(value*8500))
with wave.open(str(assets/'radio_static.wav'),'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(b''.join(struct.pack('<h',s) for s in samples))
PY

cp "$ROOT/mobile/rrn_official/android_native/RrnNativeMedia.kt" "$APP/android/app/src/main/kotlin/com/rbew/rrn_official/MainActivity.kt"
cat >> "$APP/android/app/build.gradle.kts" <<'EOF'

dependencies {
    implementation("androidx.media:media:1.7.0")
}
EOF
mkdir -p "$APP/android/app/src/main/res/xml"
cat > "$APP/android/app/src/main/res/xml/automotive_app_desc.xml" <<'EOF'
<?xml version="1.0" encoding="utf-8"?>
<automotiveApp><uses name="media" /></automotiveApp>
EOF
cat > "$APP/android/app/src/main/AndroidManifest.xml" <<'EOF'
<manifest xmlns:android="http://schemas.android.com/apk/res/android" xmlns:tools="http://schemas.android.com/tools">
  <uses-permission android:name="android.permission.INTERNET" />
  <uses-permission android:name="android.permission.WAKE_LOCK" />
  <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
  <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK" />
  <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
  <application android:label="Reality Radio Network" android:name="${applicationName}" android:icon="@mipmap/ic_launcher" android:usesCleartextTraffic="false">
    <activity android:name=".MainActivity" android:exported="true" android:launchMode="singleTop" android:theme="@style/LaunchTheme" android:configChanges="orientation|keyboardHidden|keyboard|screenSize|smallestScreenSize|locale|layoutDirection|fontScale|screenLayout|density|uiMode" android:hardwareAccelerated="true" android:windowSoftInputMode="adjustResize">
      <meta-data android:name="io.flutter.embedding.android.NormalTheme" android:resource="@style/NormalTheme" />
      <intent-filter><action android:name="android.intent.action.MAIN" /><category android:name="android.intent.category.LAUNCHER" /></intent-filter>
    </activity>
    <service android:name="com.ryanheise.audioservice.AudioService" android:foregroundServiceType="mediaPlayback" android:exported="true" android:stopWithTask="false" tools:ignore="Instantiatable">
      <intent-filter><action android:name="android.media.browse.MediaBrowserService" /></intent-filter>
    </service>
    <receiver android:name="com.ryanheise.audioservice.MediaButtonReceiver" android:exported="true" tools:ignore="Instantiatable"><intent-filter><action android:name="android.intent.action.MEDIA_BUTTON" /></intent-filter></receiver>
    <service android:name=".RrnMediaSurfaceService" android:foregroundServiceType="mediaPlayback" android:exported="false" android:stopWithTask="false" />
    <meta-data android:name="com.google.android.gms.car.application" android:resource="@xml/automotive_app_desc" />
    <meta-data android:name="flutterEmbedding" android:value="2" />
  </application>
</manifest>
EOF

cd "$APP"
flutter pub get
python3 - <<'PY'
from pathlib import Path
for path in Path.home().glob('.pub-cache/hosted/pub.dev/file_picker-*/android/build.gradle'):
    text=path.read_text()
    for old,new in [('compileSdkVersion 34','compileSdkVersion 36'),('compileSdkVersion = 34','compileSdkVersion = 36'),('compileSdk 34','compileSdk 36'),('compileSdk = 34','compileSdk = 36')]: text=text.replace(old,new)
    path.write_text(text)
PY

dart format lib
flutter analyze --no-fatal-infos --no-fatal-warnings
flutter build apk --release || { sleep 12; flutter build apk --release; }
cp build/app/outputs/flutter-apk/app-release.apk "$ROOT/RRN-Mobile-0.13.0-Source-First-RC1.apk"
cp assets/rrn_app_logo.png "$ROOT/RRN-Mobile-0.13.0-App-Logo.png"
