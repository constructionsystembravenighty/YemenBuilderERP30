#!/bin/bash

# Quick APK Build Script for Yemen Construction Management Platform
# Optimized for Replit environment with proper error handling

set -e  # Exit on any error

echo "🚀 REPLIT AGENT ANDROID APK BUILDER"
echo "Building production-ready Yemen Construction Management Platform APK"

# Function to check command success
check_success() {
    if [ $? -eq 0 ]; then
        echo "✅ $1 completed successfully"
    else
        echo "❌ $1 failed"
        exit 1
    fi
}

# Step 1: Clean and prepare environment
echo "🧹 Cleaning build environment..."
cd /home/runner/workspace
rm -rf android/app/build/outputs/apk/* 2>/dev/null || true
rm -rf android/.gradle/caches/* 2>/dev/null || true
check_success "Environment cleanup"

# Step 2: Build web application
echo "📦 Building web application..."
npm run build
check_success "Web application build"

# Step 3: Sync with Capacitor
echo "🔄 Syncing with Capacitor..."
npx cap copy android
check_success "Capacitor copy"

npx cap sync android
check_success "Capacitor sync"

# Step 4: Build Android APK with timeout handling
echo "🔨 Building Android APK..."
cd android

# Set Gradle properties for better performance
export GRADLE_OPTS="-Xmx2048m -XX:MaxPermSize=512m"
export ANDROID_HOME="/opt/android-sdk-linux"

# Build with proper timeout and retry logic
timeout 300 ./gradlew assembleDebug --no-daemon --stacktrace || {
    echo "⚠️ First build attempt timed out, retrying with clean..."
    ./gradlew clean
    timeout 600 ./gradlew assembleDebug --no-daemon --stacktrace
}
check_success "Android APK build"

# Step 5: Verify APK was created
APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
if [ -f "$APK_PATH" ]; then
    APK_SIZE=$(stat -c%s "$APK_PATH")
    APK_SIZE_MB=$((APK_SIZE / 1024 / 1024))
    echo "✅ APK created successfully: ${APK_SIZE_MB}MB"
    
    # Copy to uploads directory
    cd /home/runner/workspace
    mkdir -p uploads/apk-builds
    cp "android/$APK_PATH" "uploads/apk-builds/yemen-construction-production-$(date +%Y%m%d).apk"
    cp "android/$APK_PATH" "uploads/apk-builds/yemen-construction-production-latest.apk"
    
    echo "📱 APK copied to uploads/apk-builds/"
    echo "🎉 PRODUCTION APK BUILD COMPLETED SUCCESSFULLY!"
    echo "APK Size: ${APK_SIZE_MB}MB (proper Android application)"
    
    # Remove old placeholder files
    rm -f uploads/apk-builds/yemen-construction-demo.apk 2>/dev/null || true
    rm -f uploads/apk-builds/yemen-construction-production.apk 2>/dev/null || true
    
else
    echo "❌ APK build failed - file not found at $APK_PATH"
    echo "Checking build directory..."
    ls -la app/build/outputs/apk/ || echo "Build outputs directory not found"
    exit 1
fi

echo "🏁 Build process completed successfully!"