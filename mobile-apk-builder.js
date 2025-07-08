#!/usr/bin/env node

/**
 * Complete APK Building System for Construction Management Platform
 * Advanced build strategies for offline-first mobile deployment
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🏗️  Advanced APK Building System for Construction Management');
console.log('📱 منصة إدارة البناء - Construction Manager\n');

const buildConfig = {
  appName: 'منصة إدارة البناء',
  appId: 'com.construction.management.yemen', 
  versionName: '1.0.0',
  versionCode: 1,
  buildType: process.argv[2] || 'debug', // debug, release, bundle
  outputDir: './uploads/apk-builds',
  embedServer: true,
  offlineMode: true
};

function runCommand(command, description, options = {}) {
  console.log(`🔧 ${description}...`);
  try {
    const output = execSync(command, { 
      stdio: options.silent ? 'pipe' : 'inherit', 
      encoding: 'utf8',
      timeout: 300000, // 5 minutes timeout
      ...options 
    });
    console.log(`✅ ${description} completed\n`);
    return output;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    if (options.critical !== false) {
      process.exit(1);
    }
    return null;
  }
}

function ensureDirectories() {
  const dirs = [buildConfig.outputDir, './dist', './android/app/build'];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  });
}

function optimizeForMobile() {
  console.log('📱 Optimizing for mobile deployment...');
  
  // Update capacitor config for mobile optimization
  const capacitorConfig = `import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: '${buildConfig.appId}',
  appName: '${buildConfig.appName}',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    hostname: 'localhost',
    url: 'http://localhost:3000',
    allowNavigation: ['*']
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      backgroundColor: '#1B4332',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      spinnerColor: '#D4AF37',
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#1B4332'
    },
    App: {
      allowMixedContent: true,
      handleInitialLoad: true
    },
    Device: {
      enable: true
    },
    Filesystem: {
      enable: true
    }
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: ${buildConfig.buildType === 'debug'},
    minWebViewVersion: 60,
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
      releaseType: '${buildConfig.buildType}'
    }
  }
};

export default config;`;

  fs.writeFileSync('./capacitor.config.ts', capacitorConfig);
  console.log('⚙️  Updated capacitor configuration for mobile optimization');
}

function enhanceAndroidManifest() {
  console.log('📋 Enhancing Android manifest...');
  
  const manifestPath = './android/app/src/main/AndroidManifest.xml';
  
  if (fs.existsSync(manifestPath)) {
    let manifest = fs.readFileSync(manifestPath, 'utf8');
    
    // Add RTL support
    if (!manifest.includes('android:supportsRtl="true"')) {
      manifest = manifest.replace(
        'android:theme="@style/AppTheme"',
        'android:theme="@style/AppTheme"\n        android:supportsRtl="true"'
      );
    }
    
    // Add network security config for localhost
    if (!manifest.includes('android:networkSecurityConfig')) {
      manifest = manifest.replace(
        'android:theme="@style/AppTheme"',
        'android:theme="@style/AppTheme"\n        android:networkSecurityConfig="@xml/network_security_config"'
      );
    }
    
    fs.writeFileSync(manifestPath, manifest);
    console.log('📱 Enhanced Android manifest with RTL and network config');
  }
}

function createNetworkSecurityConfig() {
  const networkConfigDir = './android/app/src/main/res/xml';
  
  if (!fs.existsSync(networkConfigDir)) {
    fs.mkdirSync(networkConfigDir, { recursive: true });
  }
  
  const networkConfig = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">10.0.2.2</domain>
        <domain includeSubdomains="true">127.0.0.1</domain>
    </domain-config>
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system"/>
        </trust-anchors>
    </base-config>
</network-security-config>`;

  fs.writeFileSync(`${networkConfigDir}/network_security_config.xml`, networkConfig);
  console.log('🔒 Created network security configuration');
}

function buildWebAssets() {
  console.log('🌐 Building optimized web assets...');
  
  // Set environment variables for mobile build
  process.env.VITE_MOBILE_BUILD = 'true';
  process.env.VITE_OFFLINE_MODE = 'true';
  process.env.VITE_EMBEDDED_SERVER = 'true';
  
  runCommand('npm run build', 'Building production web assets');
}

function syncToAndroid() {
  console.log('🔄 Syncing assets to Android project...');
  runCommand('npx cap sync android', 'Syncing Capacitor assets');
}

function buildAPK() {
  console.log('🛠️  Building APK file...');
  
  const buildCommand = buildConfig.buildType === 'release' 
    ? './gradlew assembleRelease --no-daemon --info'
    : './gradlew assembleDebug --no-daemon --info';
    
  runCommand(`cd android && chmod +x gradlew && ${buildCommand}`, 
             `Building ${buildConfig.buildType} APK`);
}

function copyAPKToOutput() {
  console.log('📦 Copying APK to output directory...');
  
  const apkSource = buildConfig.buildType === 'release'
    ? './android/app/build/outputs/apk/release/app-release.apk'
    : './android/app/build/outputs/apk/debug/app-debug.apk';
    
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const apkDestination = `${buildConfig.outputDir}/construction-manager-${buildConfig.buildType}-${timestamp}.apk`;
  
  if (fs.existsSync(apkSource)) {
    fs.copyFileSync(apkSource, apkDestination);
    
    const stats = fs.statSync(apkDestination);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    console.log(`✅ APK copied successfully!`);
    console.log(`📱 App Name: ${buildConfig.appName}`);
    console.log(`📦 Package: ${buildConfig.appId}`);
    console.log(`🔖 Version: ${buildConfig.versionName} (${buildConfig.versionCode})`);
    console.log(`📁 Location: ${apkDestination}`);
    console.log(`📏 Size: ${sizeInMB} MB`);
    console.log(`🛡️  Build Type: ${buildConfig.buildType}`);
    
    return apkDestination;
  } else {
    console.error(`❌ APK not found at: ${apkSource}`);
    return null;
  }
}

function generateInstallationGuide(apkPath) {
  const guide = `# APK Installation Guide
## منصة إدارة البناء - Construction Manager

### App Information
- **App Name**: ${buildConfig.appName}
- **Package**: ${buildConfig.appId}
- **Version**: ${buildConfig.versionName}
- **Build Type**: ${buildConfig.buildType}
- **File**: ${path.basename(apkPath)}

### Installation Steps
1. **Download APK**: Transfer the APK file to your Android device
2. **Enable Unknown Sources**: 
   - Go to Settings → Security
   - Enable "Install from Unknown Sources"
3. **Install**: Tap the APK file and follow installation prompts
4. **Launch**: Find "منصة إدارة البناء" in your app drawer

### Features
- ✅ Complete offline functionality
- ✅ Arabic RTL interface
- ✅ Construction project management
- ✅ Financial tracking in YER currency
- ✅ Employee management
- ✅ Equipment and warehouse tracking
- ✅ Business intelligence insights

### System Requirements
- Android 7.0+ (API level 24)
- 100MB storage space
- 2GB RAM recommended

### Support
For technical support or issues, contact the development team.

Generated: ${new Date().toLocaleString()}
`;

  const guidePath = `${buildConfig.outputDir}/installation-guide.md`;
  fs.writeFileSync(guidePath, guide);
  console.log(`📋 Installation guide created: ${guidePath}`);
}

async function main() {
  try {
    console.log(`🚀 Starting ${buildConfig.buildType} build process...\n`);
    
    ensureDirectories();
    optimizeForMobile();
    enhanceAndroidManifest();
    createNetworkSecurityConfig();
    buildWebAssets();
    syncToAndroid();
    buildAPK();
    
    const apkPath = copyAPKToOutput();
    if (apkPath) {
      generateInstallationGuide(apkPath);
      console.log('\n🎉 APK Build Process Completed Successfully!');
      console.log('🚀 Ready for mobile deployment and testing!');
    } else {
      console.error('\n❌ APK build failed - check logs above for details');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('💥 Build process failed:', error.message);
    process.exit(1);
  }
}

// Run the build process
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { buildConfig, runCommand, main };