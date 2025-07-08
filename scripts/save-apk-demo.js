#!/usr/bin/env node

/**
 * APK Demo Creator for Construction Management Platform
 * Creates a demo APK file to showcase the file management system
 */

const fs = require('fs');
const path = require('path');

console.log('🏗️  Creating demo APK file for Construction Management Platform...');

// Create APK directory if it doesn't exist
const apkDir = path.join(__dirname, '..', 'uploads', 'apk-builds');
if (!fs.existsSync(apkDir)) {
  fs.mkdirSync(apkDir, { recursive: true });
}

// Create a demo APK file with metadata
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const apkName = `construction-manager-demo-${timestamp}.apk`;
const apkPath = path.join(apkDir, apkName);

// APK file content (demo simulation)
const apkContent = `
APK Demo File - Construction Management Platform
منصة إدارة البناء - ملف تجريبي

App Name: منصة إدارة البناء - Construction Manager
Package: com.construction.management.yemen
Version: 1.0.0
Build: ${timestamp}
Architecture: "Server inside your phone"

Features:
✅ Complete offline functionality
✅ Arabic RTL interface  
✅ Construction project management
✅ Financial tracking (YER/USD)
✅ Employee management
✅ Equipment tracking
✅ Document management
✅ Business intelligence engine

Build Information:
- Target: Android API 24+
- Size: ~15-20MB (estimated)
- Offline Mode: Full functionality
- Internet: Optional (sync only)

Generated: ${new Date().toLocaleString('ar')}
Platform: Capacitor.js + Android SDK

This is a demo file to showcase the APK storage and file management system.
For actual APK generation, use: ./build-apk.sh
`;

// Write the demo APK file
fs.writeFileSync(apkPath, apkContent);

// Also create a "latest" version
const latestPath = path.join(apkDir, 'construction-manager-latest.apk');
fs.writeFileSync(latestPath, apkContent);

console.log('✅ Demo APK files created successfully!');
console.log('📱 Files created:');
console.log(`   - ${apkName}`);
console.log(`   - construction-manager-latest.apk`);
console.log('📂 Location: uploads/apk-builds/');
console.log('');
console.log('🎯 You can now test the file management system!');
console.log('   Navigate to Documents page to see the APK files');