#!/usr/bin/env node

/**
 * Mobile App Build Script for Construction Management Platform
 * 
 * This script builds the mobile application with embedded server capability
 * for complete offline functionality on mobile devices.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🏗️ Building Construction Management Mobile App...\n');

function runCommand(command, description) {
  console.log(`📋 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed\n`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    process.exit(1);
  }
}

function createMobileDirectories() {
  const dirs = ['android', 'ios', 'dist/mobile'];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  });
}

function updatePackageJson() {
  const packagePath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  // Add mobile build scripts
  if (!packageJson.scripts['build:mobile']) {
    packageJson.scripts['build:mobile'] = 'node mobile/build-mobile.js';
    packageJson.scripts['android'] = 'npx cap run android';
    packageJson.scripts['ios'] = 'npx cap run ios';
    packageJson.scripts['mobile:dev'] = 'npx cap run android --livereload';
    
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    console.log('📦 Updated package.json with mobile scripts');
  }
}

function main() {
  try {
    console.log('🚀 Starting mobile app build process...\n');
    
    // Step 1: Create necessary directories
    console.log('📁 Setting up mobile project structure...');
    createMobileDirectories();
    
    // Step 2: Update package.json
    updatePackageJson();
    
    // Step 3: Build the web application
    runCommand('npm run build', 'Building web application');
    
    // Step 4: Initialize Capacitor (if not already done)
    if (!fs.existsSync('capacitor.config.ts') && !fs.existsSync('capacitor.config.js')) {
      runCommand('npx cap init', 'Initializing Capacitor');
    }
    
    // Step 5: Add mobile platforms
    if (!fs.existsSync('android/app')) {
      runCommand('npx cap add android', 'Adding Android platform');
    }
    
    if (!fs.existsSync('ios/App')) {
      runCommand('npx cap add ios', 'Adding iOS platform');
    }
    
    // Step 6: Copy web assets to mobile platforms
    runCommand('npx cap copy', 'Copying web assets to mobile platforms');
    
    // Step 7: Sync mobile platforms
    runCommand('npx cap sync', 'Syncing mobile platforms');
    
    console.log('🎉 Mobile app build completed successfully!\n');
    console.log('📱 Next Steps:');
    console.log('   For Android: npm run android');
    console.log('   For iOS: npm run ios');
    console.log('   For development with live reload: npm run mobile:dev\n');
    
    console.log('📋 App Features:');
    console.log('   ✅ Complete offline functionality');
    console.log('   ✅ Embedded Express server');
    console.log('   ✅ Local SQLite database');
    console.log('   ✅ Arabic RTL support');
    console.log('   ✅ Native mobile optimizations');
    console.log('   ✅ Self-hosted inside mobile phone\n');
    
  } catch (error) {
    console.error('❌ Mobile build failed:', error.message);
    process.exit(1);
  }
}

// Run the build process
main();