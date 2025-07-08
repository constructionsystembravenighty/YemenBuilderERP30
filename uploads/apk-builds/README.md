# APK Storage Directory
# دليل تخزين ملفات APK

This directory contains all Android APK builds for the Construction Management Platform (منصة إدارة البناء).

## Directory Structure
```
/uploads/apk-builds/
├── construction-manager-2025-07-08T00-07-XX.apk
├── construction-manager-latest.apk
└── archive/
    └── older-versions/
```

## APK Information
- **App Name**: منصة إدارة البناء - Construction Manager
- **Package**: com.construction.management.yemen
- **Architecture**: "Server inside your phone" with offline capabilities
- **Features**: 
  - Complete offline functionality
  - Arabic RTL interface
  - Construction project management
  - Financial tracking with YER/USD support
  - Employee and equipment management

## File Naming Convention
- Format: `construction-manager-{timestamp}.apk`
- Example: `construction-manager-2025-07-08T00-07-26.apk`
- Latest build is also saved as `construction-manager-latest.apk`

## Installation Instructions
1. Download the APK file
2. Enable "Install from unknown sources" on Android device
3. Install the APK
4. Launch "منصة إدارة البناء" from app drawer
5. Enjoy complete offline construction management

## Build Information
- Built with: Capacitor.js + Android SDK
- Target: Android API 24+ (Android 7.0+)
- Size: ~15-20MB (estimated)
- Internet Required: Only for initial setup and data sync
- Offline Mode: Full functionality available offline

Generated automatically by the Construction Management Platform build system.