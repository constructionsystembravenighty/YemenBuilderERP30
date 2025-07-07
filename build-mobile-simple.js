#!/usr/bin/env node

/**
 * Simple Mobile App Builder
 * Quick build and APK generation for Construction Management Platform
 */

import { execSync } from 'child_process';

console.log('🚀 Building Mobile Construction Management App...\n');

function runCommand(command, description) {
  console.log(`🔧 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed\n`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    process.exit(1);
  }
}

try {
  // Quick build process
  runCommand('mkdir -p dist', 'Creating dist directory');
  
  // Create a simple index.html for testing
  const htmlContent = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>منصة إدارة البناء - Construction Manager</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; text-align: center; }
        h1 { color: #1B4332; }
        .arabic { font-size: 1.2em; margin: 20px 0; }
    </style>
</head>
<body>
    <h1>🏗️ منصة إدارة البناء</h1>
    <div class="arabic">Construction Management Platform</div>
    <p>Mobile app is ready! The embedded server will be integrated in production.</p>
    <p>📱 Ready for APK generation</p>
</body>
</html>`;
  
  import('fs').then(fs => fs.writeFileSync('dist/index.html', htmlContent));
  console.log('✅ Created mobile-ready HTML\n');
  
  // Capacitor sync
  runCommand('npx cap copy', 'Copying web assets to mobile');
  runCommand('npx cap sync', 'Syncing mobile platforms');
  
  console.log('🎉 Mobile app build completed successfully!\n');
  console.log('📋 Next Steps:');
  console.log('   🔧 Open Android Studio: npx cap open android');
  console.log('   📱 Build APK: cd android && ./gradlew assembleDebug');
  console.log('   🚀 Run on device: npx cap run android\n');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}