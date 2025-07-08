#!/usr/bin/env node

/**
 * REPLIT AGENT ENHANCED APK BUILDER
 * Leveraging Replit's full infrastructure power for rapid Android APK generation
 * Optimized for Yemen Construction Management Platform
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 REPLIT AGENT ADVANCED APK BUILDER');
console.log('⚡ Leveraging full Replit infrastructure power');
console.log('🇾🇪 Building Yemen Construction Management Platform APK');

class ReplitAgentAPKBuilder {
  constructor() {
    this.projectRoot = '/home/runner/workspace';
    this.androidPath = path.join(this.projectRoot, 'android');
    this.uploadsPath = path.join(this.projectRoot, 'uploads/apk-builds');
    this.buildAttempts = 0;
    this.maxAttempts = 3;
  }

  async executeCommand(command, description, timeout = 300000) {
    console.log(`⚡ ${description}...`);
    try {
      const output = execSync(command, { 
        stdio: 'pipe', 
        cwd: this.projectRoot,
        timeout: timeout,
        encoding: 'utf8'
      });
      console.log(`✅ ${description} completed`);
      return output;
    } catch (error) {
      console.error(`❌ ${description} failed:`, error.message.slice(0, 200));
      throw error;
    }
  }

  async verifyEnvironment() {
    console.log('\n🔍 REPLIT ENVIRONMENT ANALYSIS');
    
    // Check Java version
    try {
      const javaVersion = await this.executeCommand('java -version', 'Java version check');
      console.log('☕ Java environment ready');
    } catch (error) {
      throw new Error('Java not available in Replit environment');
    }

    // Check Android SDK
    const androidSdkPaths = [
      '/opt/android-sdk-linux',
      '/usr/lib/android-sdk',
      process.env.ANDROID_HOME
    ].filter(Boolean);

    for (const sdkPath of androidSdkPaths) {
      if (fs.existsSync(sdkPath)) {
        process.env.ANDROID_HOME = sdkPath;
        console.log(`📱 Android SDK found at: ${sdkPath}`);
        break;
      }
    }

    // Check project structure
    if (!fs.existsSync(this.androidPath)) {
      throw new Error('Android project not found');
    }

    console.log('✅ Replit environment verified');
  }

  async optimizeGradleBuild() {
    console.log('\n⚙️ GRADLE BUILD OPTIMIZATION');
    
    // Create optimized gradle.properties
    const gradleProps = `
# Replit-optimized Gradle settings
org.gradle.jvmargs=-Xmx1024m -XX:MaxPermSize=256m
org.gradle.parallel=false
org.gradle.daemon=false
org.gradle.configureondemand=false
org.gradle.caching=false

# Android optimizations
android.useAndroidX=true
android.enableJetifier=true
android.enableBuildCache=false
android.enableR8=false

# Network timeouts for Replit
systemProp.http.connectionTimeout=30000
systemProp.http.socketTimeout=30000
`;

    fs.writeFileSync(path.join(this.androidPath, 'gradle.properties'), gradleProps);
    console.log('✅ Gradle optimized for Replit environment');
  }

  async buildWebAssets() {
    console.log('\n📦 BUILDING WEB ASSETS');
    
    // Build web application
    await this.executeCommand('npm run build', 'Web application build', 180000);
    
    // Verify dist directory
    const distPath = path.join(this.projectRoot, 'dist');
    if (!fs.existsSync(distPath)) {
      throw new Error('Web build failed - dist directory not created');
    }

    console.log('✅ Web assets built successfully');
  }

  async syncCapacitor() {
    console.log('\n🔄 CAPACITOR SYNCHRONIZATION');
    
    // Copy web assets
    await this.executeCommand('npx cap copy android', 'Capacitor copy', 60000);
    
    // Sync Android project
    await this.executeCommand('npx cap sync android --no-deps', 'Capacitor sync (no deps)', 60000);
    
    console.log('✅ Capacitor sync completed');
  }

  async buildAPKWithRetry() {
    console.log('\n🔨 ANDROID APK BUILD WITH INTELLIGENT RETRY');
    
    while (this.buildAttempts < this.maxAttempts) {
      this.buildAttempts++;
      console.log(`🎯 Build attempt ${this.buildAttempts}/${this.maxAttempts}`);
      
      try {
        process.chdir(this.androidPath);
        
        if (this.buildAttempts > 1) {
          // Clean build for retry attempts
          await this.executeCommand('./gradlew clean', 'Gradle clean', 60000);
        }
        
        // Build APK with progressive timeout
        const timeout = 120000 + (this.buildAttempts * 60000); // Increase timeout each attempt
        await this.executeCommand(
          './gradlew assembleDebug --no-daemon --stacktrace --info', 
          'APK build', 
          timeout
        );
        
        console.log('✅ APK build completed successfully');
        return true;
        
      } catch (error) {
        console.log(`⚠️ Build attempt ${this.buildAttempts} failed`);
        
        if (this.buildAttempts >= this.maxAttempts) {
          console.log('❌ All build attempts exhausted');
          return false;
        }
        
        // Wait before retry
        console.log('⏳ Waiting 10 seconds before retry...');
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }
    
    return false;
  }

  async verifyAndCopyAPK() {
    console.log('\n📱 APK VERIFICATION AND DEPLOYMENT');
    
    const apkPath = path.join(this.androidPath, 'app/build/outputs/apk/debug/app-debug.apk');
    
    if (!fs.existsSync(apkPath)) {
      // Check if APK exists in alternative locations
      const alternativePaths = [
        path.join(this.androidPath, 'app/build/outputs/apk/app-debug.apk'),
        path.join(this.androidPath, 'build/outputs/apk/debug/app-debug.apk')
      ];
      
      for (const altPath of alternativePaths) {
        if (fs.existsSync(altPath)) {
          console.log(`📱 APK found at alternative location: ${altPath}`);
          fs.copyFileSync(altPath, apkPath);
          break;
        }
      }
    }
    
    if (!fs.existsSync(apkPath)) {
      throw new Error('APK file not found after build');
    }
    
    // Verify APK size
    const stats = fs.statSync(apkPath);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    if (stats.size < 1024 * 1024) { // Less than 1MB
      throw new Error(`APK too small (${sizeInMB}MB) - likely corrupted`);
    }
    
    console.log(`✅ APK verified: ${sizeInMB}MB`);
    
    // Copy to uploads directory
    if (!fs.existsSync(this.uploadsPath)) {
      fs.mkdirSync(this.uploadsPath, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const targetPath = path.join(this.uploadsPath, `yemen-construction-${timestamp}.apk`);
    const latestPath = path.join(this.uploadsPath, 'yemen-construction-latest.apk');
    
    fs.copyFileSync(apkPath, targetPath);
    fs.copyFileSync(apkPath, latestPath);
    
    // Remove old placeholder files
    const placeholderFiles = ['yemen-construction-demo.apk', 'yemen-construction-production.apk'];
    placeholderFiles.forEach(file => {
      const placeholderPath = path.join(this.uploadsPath, file);
      if (fs.existsSync(placeholderPath)) {
        fs.unlinkSync(placeholderPath);
        console.log(`🗑️ Removed placeholder file: ${file}`);
      }
    });
    
    console.log(`📱 APK copied to: ${targetPath}`);
    console.log(`📱 Latest APK: ${latestPath}`);
    
    return { size: sizeInMB, path: targetPath };
  }

  async generateInstallationGuide() {
    console.log('\n📖 GENERATING INSTALLATION GUIDE');
    
    const guide = `# Yemen Construction Management Platform - Android APK
## منصة إدارة البناء - تطبيق الأندرويد

### 🏗️ APK SUCCESSFULLY BUILT BY REPLIT AGENT
**Generated**: ${new Date().toLocaleString()}
**Platform**: Android 7.0+ (API 24+)
**Package**: com.construction.management.yemen
**Version**: 2.0

### Installation Instructions

#### Arabic (العربية)
1. **تحميل الملف**: احفظ ملف APK على هاتفك
2. **تفعيل المصادر المجهولة**: 
   - اذهب إلى الإعدادات → الأمان
   - فعّل "مصادر غير معروفة" أو "السماح من هذا المصدر"
3. **التثبيت**: اضغط على ملف APK واتبع التعليمات
4. **التشغيل**: ابحث عن "منصة إدارة البناء" في تطبيقاتك

#### English
1. **Download APK**: Save the APK file to your device
2. **Enable Unknown Sources**:
   - Go to Settings → Security
   - Enable "Unknown Sources" or "Allow from this source"
3. **Install**: Tap the APK file and follow prompts
4. **Launch**: Find "منصة إدارة البناء" in your app drawer

### Features
✅ Complete offline functionality
✅ Arabic RTL interface
✅ Construction project management
✅ Financial tracking in YER
✅ Employee management
✅ Equipment tracking
✅ Business intelligence

### Support
For technical support, contact the development team.

---
*Built with Replit Agent Advanced APK Builder*
*Yemen Construction Management Platform - Mobile Division*
`;

    const guidePath = path.join(this.uploadsPath, 'INSTALLATION_GUIDE.md');
    fs.writeFileSync(guidePath, guide);
    console.log('✅ Installation guide generated');
  }

  async run() {
    console.log('\n🚀 STARTING REPLIT AGENT APK BUILD PROCESS');
    
    try {
      await this.verifyEnvironment();
      await this.optimizeGradleBuild();
      await this.buildWebAssets();
      await this.syncCapacitor();
      
      const buildSuccess = await this.buildAPKWithRetry();
      
      if (buildSuccess) {
        const apkInfo = await this.verifyAndCopyAPK();
        await this.generateInstallationGuide();
        
        console.log('\n🎉 REPLIT AGENT APK BUILD COMPLETED SUCCESSFULLY!');
        console.log(`📱 APK Size: ${apkInfo.size}MB`);
        console.log(`📁 Location: ${apkInfo.path}`);
        console.log('✅ Ready for distribution to Yemen construction companies');
        
        return true;
      } else {
        console.log('\n⚠️ APK build failed after multiple attempts');
        console.log('📱 Recommend using PWA deployment for immediate mobile access');
        return false;
      }
      
    } catch (error) {
      console.error('\n💥 Build process failed:', error.message);
      console.log('\n📱 FALLBACK: PWA deployment available for immediate use');
      console.log('   • Open browser on mobile device');
      console.log('   • Navigate to application URL');
      console.log('   • Tap "Add to Home Screen"');
      console.log('   • Complete construction management functionality available');
      
      return false;
    }
  }
}

// Execute the builder
const builder = new ReplitAgentAPKBuilder();
builder.run().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});