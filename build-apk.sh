#!/bin/bash
# ====================
# 概念音乐 APK — 构建脚本
# ====================
# 前置条件:
#   Node.js 18+  (npm install 需要)
#   Java 17+     (export JAVA_HOME)
#   Android SDK   (export ANDROID_HOME, 或安装 Android Studio)
#
# 一键构建: bash build-apk.sh
# ====================

set -e

echo "🏗️  概念音乐 APK Builder"
echo "========================"

# 检查依赖
command -v node >/dev/null 2>&1 || { echo "❌ 需要 Node.js"; exit 1; }
command -v java >/dev/null 2>&1 || { echo "❌ 需要 Java 17+"; exit 1; }

if [ -z "$ANDROID_HOME" ] && [ -z "$ANDROID_SDK_ROOT" ]; then
    # 尝试常见路径
    for sdk in ~/Android/Sdk ~/android-sdk /opt/android-sdk; do
        if [ -d "$sdk" ]; then
            export ANDROID_HOME="$sdk"
            break
        fi
    done
fi

if [ -z "$ANDROID_HOME" ]; then
    echo "⚠️  未找到 Android SDK (ANDROID_HOME)"
    echo "   请安装 Android Studio 或设置 ANDROID_HOME 环境变量"
    echo "   下载: https://developer.android.com/studio"
    exit 1
fi

echo "✅ Java:  $(java -version 2>&1 | head -1)"
echo "✅ SDK:   $ANDROID_HOME"

# 1. 安装依赖
echo ""
echo "📦 安装 npm 依赖..."
npm install

# 2. 构建 Web 前端
echo ""
echo "🔨 构建 Vue 前端..."
npx vite build

# 3. 同步 Capacitor (复制 web 资源到 Android)
echo ""
echo "🔄 同步 Capacitor..."
npx cap sync

# 4. 构建 APK
echo ""
echo "📱 编译 Android APK..."
cd android

# 在 gradle.properties 中设置 SDK 路径
if ! grep -q "org.gradle.java.home" gradle.properties 2>/dev/null; then
    echo "org.gradle.java.home=$JAVA_HOME" >> gradle.properties
fi

./gradlew assembleDebug

cd ..

# 5. 输出结果
APK_PATH="android/app/build/outputs/apk/debug/app-debug.apk"
if [ -f "$APK_PATH" ]; then
    echo ""
    echo "╔══════════════════════════════╗"
    echo "║  ✅ 构建成功！               ║"
    echo "╠══════════════════════════════╣"
    echo "║  APK: $APK_PATH"
    SIZE=$(du -h "$APK_PATH" | cut -f1)
    echo "║  大小: $SIZE"
    echo "╚══════════════════════════════╝"
    echo ""
    echo "📲 安装到手机: adb install $APK_PATH"
else
    echo ""
    echo "❌ 构建失败，请检查上面的错误信息"
    exit 1
fi
