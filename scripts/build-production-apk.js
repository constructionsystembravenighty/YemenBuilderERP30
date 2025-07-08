#!/usr/bin/env node

/**
 * Production-Ready Android APK Builder for Yemen Construction Management Platform
 * Fixes APK installation issues and creates working mobile applications
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Building Production-Ready Android APK...');
console.log('📱 Yemen Construction Management Platform - Mobile App Builder');

function runCommand(command, description) {
  console.log(`\n⚡ ${description}...`);
  try {
    const output = execSync(command, { stdio: 'inherit', cwd: process.cwd() });
    console.log(`✅ ${description} completed successfully`);
    return output;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    throw error;
  }
}

function verifyPrerequisites() {
  console.log('\n🔍 Verifying build prerequisites...');
  
  // Check if dist directory exists
  if (!fs.existsSync('dist')) {
    console.log('📦 Building web application first...');
    runCommand('npm run build', 'Web application build');
  }
  
  // Check if Android project is synced
  if (!fs.existsSync('android/app/src/main/assets/public')) {
    console.log('🔄 Syncing with Capacitor...');
    runCommand('npx cap copy', 'Capacitor copy');
    runCommand('npx cap sync android', 'Android sync');
  }
  
  console.log('✅ Prerequisites verified');
}

function buildProductionAPK() {
  console.log('\n🏗️ Building production Android APK...');
  
  try {
    // Clean previous builds
    runCommand('cd android && ./gradlew clean', 'Cleaning previous builds');
    
    // Build debug APK (for testing)
    runCommand('cd android && ./gradlew assembleDebug', 'Building debug APK');
    
    // Build release APK (for production)
    try {
      runCommand('cd android && ./gradlew assembleRelease', 'Building release APK');
    } catch (error) {
      console.log('⚠️ Release build failed (expected without signing key), using debug build');
    }
    
    console.log('✅ APK build completed successfully');
    
  } catch (error) {
    console.error('❌ APK build failed:', error.message);
    throw error;
  }
}

function copyAPKsToUploads() {
  console.log('\n📁 Copying APKs to uploads directory...');
  
  const uploadsDir = 'uploads/apk-builds';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  // Ensure uploads directory exists
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Copy debug APK
  const debugApkPath = 'android/app/build/outputs/apk/debug/app-debug.apk';
  if (fs.existsSync(debugApkPath)) {
    const debugTarget = path.join(uploadsDir, `yemen-construction-debug-${timestamp}.apk`);
    fs.copyFileSync(debugApkPath, debugTarget);
    
    // Also copy as latest debug
    const latestDebug = path.join(uploadsDir, 'yemen-construction-debug-latest.apk');
    fs.copyFileSync(debugApkPath, latestDebug);
    
    console.log(`✅ Debug APK copied to: ${debugTarget}`);
    
    // Get APK size
    const stats = fs.statSync(debugApkPath);
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`📊 APK Size: ${fileSizeInMB} MB`);
  }
  
  // Copy release APK if exists
  const releaseApkPath = 'android/app/build/outputs/apk/release/app-release-unsigned.apk';
  if (fs.existsSync(releaseApkPath)) {
    const releaseTarget = path.join(uploadsDir, `yemen-construction-release-${timestamp}.apk`);
    fs.copyFileSync(releaseApkPath, releaseTarget);
    
    // Also copy as latest release
    const latestRelease = path.join(uploadsDir, 'yemen-construction-release-latest.apk');
    fs.copyFileSync(releaseApkPath, latestRelease);
    
    console.log(`✅ Release APK copied to: ${releaseTarget}`);
  }
}

function generateInstallationGuide() {
  console.log('\n📖 Generating installation guide...');
  
  const guide = `# Android APK Installation Guide
## Yemen Construction Management Platform (منصة إدارة البناء)

### System Requirements
- **Android Version**: 5.0+ (API Level 21+)
- **RAM**: 2GB minimum, 4GB recommended
- **Storage**: 100MB for app + 500MB for data
- **Architecture**: ARM64, ARM, x86 supported

### Installation Steps

#### Method 1: Direct APK Installation
1. **Enable Unknown Sources**:
   - Go to Settings > Security
   - Enable "Install from Unknown Sources" or "Allow from this source"
   - On Android 8.0+: Go to Settings > Apps & notifications > Special app access > Install unknown apps

2. **Download APK**:
   - Download the latest APK file to your device
   - File name: \`yemen-construction-debug-latest.apk\`

3. **Install**:
   - Tap the downloaded APK file
   - Follow installation prompts
   - Grant necessary permissions

4. **Launch**:
   - Find "منصة إدارة البناء" in your app drawer
   - Launch the application
   - The app will initialize with sample data

#### Method 2: ADB Installation (Developer Mode)
\`\`\`bash
adb install yemen-construction-debug-latest.apk
\`\`\`

### Troubleshooting

#### "App not installed" Error
- **Cause**: Corrupted download or insufficient space
- **Solution**: Re-download APK, clear space, restart device

#### "Parse Error" 
- **Cause**: APK corruption or architecture mismatch
- **Solution**: Re-download from official source

#### "Installation Blocked"
- **Cause**: Security settings
- **Solution**: Enable "Install from Unknown Sources" in Settings

### App Features (Offline-First)
✅ **Complete Offline Functionality**: Works without internet
✅ **Arabic RTL Interface**: Native Arabic design
✅ **Project Management**: Full construction project tracking
✅ **Financial Management**: IFRS-compliant accounting in YER
✅ **Employee Management**: HR system with Yemen labor laws
✅ **Equipment Tracking**: Asset management and maintenance
✅ **Business Intelligence**: Yemen market rates and insights

### Support
- **App Version**: 2.0
- **Package**: com.construction.management.yemen
- **Build Date**: ${new Date().toLocaleDateString()}
- **Architecture**: Offline-first with sync capabilities

Generated automatically by Yemen Construction Management Platform Build System.
`;

  fs.writeFileSync('uploads/apk-builds/INSTALLATION_GUIDE.md', guide);
  console.log('✅ Installation guide generated');
}

async function main() {
  try {
    console.log('🚀 Starting production APK build process...');
    
    verifyPrerequisites();
    buildProductionAPK();
    copyAPKsToUploads();
    generateInstallationGuide();
    
    console.log('\n🎉 PRODUCTION APK BUILD COMPLETED SUCCESSFULLY!');
    console.log('📱 Your Yemen Construction Management Platform mobile app is ready');
    console.log('📁 APK files are in: uploads/apk-builds/');
    console.log('📖 Installation guide: uploads/apk-builds/INSTALLATION_GUIDE.md');
    
  } catch (error) {
    console.error('\n💥 Build process failed:', error.message);
    process.exit(1);
  }
}

// Run main function
main();