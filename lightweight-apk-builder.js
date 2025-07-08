#!/usr/bin/env node

/**
 * Lightweight APK Builder - Optimized for Replit environment
 * Fast and reliable APK generation for Construction Management Platform
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Lightweight APK Builder');
console.log('📱 منصة إدارة البناء - Construction Manager\n');

const config = {
  appName: 'منصة إدارة البناء',
  packageId: 'com.construction.management.yemen',
  outputDir: './uploads/apk-builds'
};

function runCommandSync(command, description, options = {}) {
  console.log(`🔧 ${description}...`);
  try {
    const output = execSync(command, {
      stdio: options.silent ? 'pipe' : 'inherit',
      encoding: 'utf8',
      cwd: options.cwd || process.cwd(),
      timeout: 180000, // 3 minutes max
      ...options
    });
    console.log(`✅ ${description} completed`);
    return output;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    if (!options.optional) {
      throw error;
    }
    return null;
  }
}

function ensureBuildDirectory() {
  if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
    console.log(`📁 Created output directory: ${config.outputDir}`);
  }
}

function buildWebAssets() {
  console.log('\n📦 Building web assets...');
  runCommandSync('npm run build', 'Building production assets');
}

function syncCapacitor() {
  console.log('\n🔄 Syncing Capacitor...');
  runCommandSync('npx cap sync android', 'Syncing assets to Android');
}

function buildAPKSimple() {
  console.log('\n🛠️  Building APK...');
  
  // Make gradlew executable
  runCommandSync('chmod +x gradlew', 'Making gradlew executable', { cwd: './android' });
  
  // Build with minimal options for speed
  runCommandSync(
    './gradlew assembleDebug --no-daemon --no-parallel --max-workers=1',
    'Building debug APK',
    { cwd: './android' }
  );
}

function copyAndPackageAPK() {
  console.log('\n📦 Packaging APK...');
  
  const apkSource = './android/app/build/outputs/apk/debug/app-debug.apk';
  
  if (!fs.existsSync(apkSource)) {
    throw new Error(`APK not found at ${apkSource}`);
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
  const apkOutput = `${config.outputDir}/construction-manager-${timestamp}.apk`;
  
  fs.copyFileSync(apkSource, apkOutput);
  
  const stats = fs.statSync(apkOutput);
  const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
  
  console.log('\n🎉 APK Build Complete!');
  console.log(`📱 App: ${config.appName}`);
  console.log(`📦 Package: ${config.packageId}`);
  console.log(`📁 Location: ${apkOutput}`);
  console.log(`📏 Size: ${sizeInMB} MB`);
  console.log(`🕒 Built: ${new Date().toLocaleString()}`);
  
  // Generate QR code for easy download (if possible)
  generateInstallationInfo(apkOutput);
  
  return apkOutput;
}

function generateInstallationInfo(apkPath) {
  const infoText = `# APK Installation Guide
App: ${config.appName}
Package: ${config.packageId}
File: ${path.basename(apkPath)}
Size: ${(fs.statSync(apkPath).size / (1024 * 1024)).toFixed(2)} MB

Installation Steps:
1. Download APK to Android device
2. Enable "Install from Unknown Sources" in Settings > Security
3. Tap APK file and install
4. Find "منصة إدارة البناء" in your app drawer

Built: ${new Date().toLocaleString()}
`;

  const infoPath = `${config.outputDir}/installation-info.txt`;
  fs.writeFileSync(infoPath, infoText);
  console.log(`📋 Installation guide: ${infoPath}`);
}

async function main() {
  try {
    console.log('🏗️  Starting APK build process...\n');
    
    ensureBuildDirectory();
    buildWebAssets();
    syncCapacitor();
    buildAPKSimple();
    const apkPath = copyAndPackageAPK();
    
    console.log('\n✨ Build completed successfully!');
    console.log('🚀 APK ready for installation and testing');
    
    return apkPath;
    
  } catch (error) {
    console.error('\n💥 Build failed:', error.message);
    console.log('\n🔍 Troubleshooting tips:');
    console.log('- Check that Node.js and npm are working');
    console.log('- Ensure Android SDK is properly configured');
    console.log('- Try running: npm install && npm run build');
    console.log('- Check Gradle logs for specific errors');
    
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}