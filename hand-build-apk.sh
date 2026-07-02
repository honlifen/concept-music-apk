#!/bin/bash
# ==================================
# 概念音乐 APK 手动构建脚本
# 使用 ARM64 原生工具: aapt2, d8, javac
# ==================================
set -e

export ANDROID_HOME=~/android-sdk
export JAVA_HOME=/data/data/com.termux/files/usr/lib/jvm/java-21-openjdk
export PATH=$JAVA_HOME/bin:$ANDROID_HOME/build-tools/35.0.0:$PATH
BT=$ANDROID_HOME/build-tools/35.0.0
PLATFORM=$ANDROID_HOME/platforms/android-36
PROJ=~/concept-music-apk/android
OUT=~/concept-music-apk/apk-build
APP=$PROJ/app

echo "🔨 概念音乐 APK 手动构建"
echo "=========================="

# Clean
rm -rf $OUT
mkdir -p $OUT/classes $OUT/dex $OUT/apk

# === 1. 编译资源 (aapt2 link) ===
echo "📦 编译资源..."
# 先编译所有 res 为 flat 格式
$BT/aapt2 compile \
  --dir $APP/src/main/res \
  -o $OUT/res.zip \
  -v 2>&1 | tail -3

# link 资源 + 生成 R.java
$BT/aapt2 link \
  -I $PLATFORM/android.jar \
  --manifest $APP/src/main/AndroidManifest.xml \
  --java $OUT/classes \
  --proto-format \
  -o $OUT/apk/base.apk \
  $OUT/res.zip \
  --auto-add-overlay \
  -v 2>&1 | tail -3

echo "✅ 资源编译完成"

# === 2. 编译 Java 源码 ===
echo "☕ 编译 Java..."
# 收集所有 Java 文件
find $APP/src/main/java -name "*.java" > $OUT/java_sources.txt

# 收集所有依赖 jar (从 gradle cache)
DEPS=$(find ~/.gradle/caches -name "*.jar" -path "*capacitor*" 2>/dev/null | head -20)
DEPS="$DEPS $(find ~/.gradle/caches -name "*.jar" -path "*androidx*" 2>/dev/null | head -30)"
DEPS="$DEPS $(find ~/.gradle/caches -name "*.aar" 2>/dev/null | head -20)"

# Build classpath
CP="$PLATFORM/android.jar"
for jar in $DEPS; do CP="$CP:$jar"; done

# 编译 (如果 Java 文件为空，用 Capacitor 的模板)
JAVA_COUNT=$(wc -l < $OUT/java_sources.txt 2>/dev/null || echo 0)
if [ "$JAVA_COUNT" -eq 0 ]; then
  echo "  (无自定义 Java 文件，使用默认)"
  touch $OUT/classes/placeholder
else
  javac -d $OUT/classes -cp "$CP" @$OUT/java_sources.txt 2>&1 | tail -5
fi
echo "✅ Java 编译完成"

# === 3. 编译 DEX ===
echo "📱 编译 DEX..."
CLASSES=$(find $OUT/classes -name "*.class" 2>/dev/null)
if [ -n "$CLASSES" ]; then
  java -cp $BT/lib/d8.jar com.android.tools.r8.D8 \
    --lib $PLATFORM/android.jar \
    --output $OUT/dex \
    $(find $OUT/classes -name "*.class") \
    2>&1 | tail -3
else
  # 无 Java 代码的纯 WebView APK
  mkdir -p $OUT/dex
  touch $OUT/dex/classes.dex
fi
echo "✅ DEX 编译完成"

# === 4. 打包 APK ===
echo "📦 打包 APK..."

# 最终 APK 结构
FINAL=$OUT/final
mkdir -p $FINAL

# 复制基础 APK (包含资源和 manifest)
cp $OUT/apk/base.apk $FINAL/unsigned.apk

# 添加 DEX
if [ -f $OUT/dex/classes.dex ]; then
  cd $OUT/dex && zip -q $FINAL/unsigned.apk classes.dex
elif [ -f $OUT/dex/classes2.dex ]; then
  cd $OUT/dex && zip -q $FINAL/unsigned.apk classes*.dex
fi

# 添加 assets (web 内容)
cd $PROJ/app/src/main
if [ -d assets/public ]; then
  # 已有 web 资源
  zip -qr $FINAL/unsigned.apk assets/ 2>/dev/null
fi

APK_SIZE=$(du -h $FINAL/unsigned.apk | cut -f1)
echo "✅ APK 打包完成 ($APK_SIZE)"

# === 5. 签名 ===
echo "✍️ 签名..."

# 生成调试密钥
if [ ! -f ~/.android/debug.keystore ]; then
  mkdir -p ~/.android
  keytool -genkey -v \
    -keystore ~/.android/debug.keystore \
    -storepass android \
    -alias androiddebugkey \
    -keypass android \
    -keyalg RSA -keysize 2048 -validity 10000 \
    -dname "CN=Debug,OU=Concept,O=Music,L=CN,S=GD,C=CN" \
    2>&1 | tail -2
fi

# 对齐
# (skip zipalign for now - debug builds work without it)

# 签名
java -cp $BT/lib/apksigner.jar com.android.apksigner.ApkSignerTool \
  sign \
  --ks ~/.android/debug.keystore \
  --ks-pass pass:android \
  --ks-key-alias androiddebugkey \
  --key-pass pass:android \
  --out $FINAL/app-debug.apk \
  $FINAL/unsigned.apk \
  2>&1 | tail -3

FINAL_APK=$FINAL/app-debug.apk
echo ""
echo "╔══════════════════════════════════╗"
echo "║  ✅ APK 构建成功！              ║"
echo "╠══════════════════════════════════╣"
echo "║  $(ls -lh $FINAL_APK | awk '{print $5}')                    ║"
echo "║  $FINAL_APK"
echo "╚══════════════════════════════════╝"
echo ""
echo "📲 安装: adb install $FINAL_APK"
echo "📲 或直接: cp $FINAL_APK /storage/emulated/0/Download/concept-music.apk"

# 返回最终 APK 路径
echo "$FINAL_APK"
