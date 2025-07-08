#!/bin/bash

echo "🏗️  Building APK for Construction Management Platform"
echo "📱 App: منصة إدارة البناء - Construction Manager"
echo ""

# Set Java environment
export JAVA_HOME=/nix/store/2vwkssqpzykk37r996cafq7x63imf4sp-openjdk-21+35
export PATH=$JAVA_HOME/bin:$PATH

echo "☕ Java version:"
java -version
echo ""

echo "🔧 Building web assets..."
npm run build

echo ""
echo "📋 Syncing assets to Android..."
npx cap sync android

echo ""
echo "🛠️  Building APK..."
cd android

# Make gradlew executable
chmod +x gradlew

# Build the APK
./gradlew assembleDebug --no-daemon --info

echo ""
echo "✅ APK Build Complete!"
echo ""
echo "📦 APK Location: android/app/build/outputs/apk/debug/app-debug.apk"
echo "📱 App Name: منصة إدارة البناء"
echo "🔖 Package: com.construction.management.yemen"
echo ""
echo "🚀 Ready for installation on Android devices!"