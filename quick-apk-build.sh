#!/bin/bash

echo "🚀 Quick APK Builder for Construction Management Platform"
echo "📱 منصة إدارة البناء - Construction Manager"
echo ""

# Set error handling
set -e

# Create output directory
mkdir -p ./uploads/apk-builds

echo "🔧 Step 1: Building web assets..."
npm run build

echo ""
echo "📱 Step 2: Syncing to Android..."
npx cap sync android

echo ""
echo "🛠️  Step 3: Building APK..."
cd android

# Make gradlew executable
chmod +x gradlew

# Build APK with concise output
echo "Building debug APK..."
./gradlew assembleDebug --console=plain --no-daemon

echo ""
echo "📦 Step 4: Copying APK to output..."
cd ..

# Find the built APK
APK_PATH="android/app/build/outputs/apk/debug/app-debug.apk"

if [ -f "$APK_PATH" ]; then
    # Create timestamped filename
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    OUTPUT_APK="uploads/apk-builds/construction-manager-debug-${TIMESTAMP}.apk"
    
    # Copy APK to output directory
    cp "$APK_PATH" "$OUTPUT_APK"
    
    # Get file size
    SIZE=$(du -h "$OUTPUT_APK" | cut -f1)
    
    echo "✅ APK Build Successful!"
    echo ""
    echo "📱 App: منصة إدارة البناء (Construction Manager)"
    echo "📦 Package: com.construction.management.yemen"
    echo "📁 Location: $OUTPUT_APK"
    echo "📏 Size: $SIZE"
    echo "🔖 Build: Debug"
    echo ""
    echo "🎉 Ready for installation on Android devices!"
    echo ""
    echo "Installation steps:"
    echo "1. Transfer APK to Android device"
    echo "2. Enable 'Install from Unknown Sources' in Settings"
    echo "3. Tap APK file to install"
    echo "4. Launch 'منصة إدارة البناء' from app drawer"
    
else
    echo "❌ APK build failed - APK not found at $APK_PATH"
    echo "Check the Gradle build output above for errors"
    exit 1
fi