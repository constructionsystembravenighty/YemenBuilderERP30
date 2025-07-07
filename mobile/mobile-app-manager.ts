import { App } from '@capacitor/app';
import { Device } from '@capacitor/device';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { embeddedServer } from './embedded-server';

// Mobile Application Manager for Self-Hosted Construction Management
export class MobileAppManager {
  private isInitialized = false;
  private deviceInfo: any = null;

  async initialize(): Promise<void> {
    try {
      console.log('🚀 Initializing mobile construction management app...');
      
      // Get device information
      this.deviceInfo = await Device.getInfo();
      console.log('📱 Device Info:', this.deviceInfo);

      // Initialize embedded server first
      await this.startEmbeddedServer();

      // Configure mobile app appearance
      await this.configureMobileUI();

      // Set up app event listeners
      this.setupAppEventListeners();

      // Hide splash screen
      await SplashScreen.hide();

      this.isInitialized = true;
      console.log('✅ Mobile construction management app initialized successfully');
      
      this.showOfflineReadyNotification();
    } catch (error) {
      console.error('❌ Failed to initialize mobile app:', error);
      throw error;
    }
  }

  private async startEmbeddedServer(): Promise<void> {
    try {
      console.log('🔧 Starting embedded construction server...');
      await embeddedServer.start();
      console.log('✅ Embedded server operational - complete offline functionality enabled');
    } catch (error) {
      console.error('❌ Failed to start embedded server:', error);
      throw error;
    }
  }

  private async configureMobileUI(): Promise<void> {
    try {
      // Configure status bar for Arabic app
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#1B4332' });

      // Set app language based on device locale
      const language = await Device.getLanguageCode();
      console.log('🌐 Device language:', language);
      
      // Set RTL if Arabic locale detected
      if (language.code === 'ar' || language.code.startsWith('ar-')) {
        document.documentElement.dir = 'rtl';
        document.documentElement.lang = 'ar';
      }

      console.log('🎨 Mobile UI configured for construction management');
    } catch (error) {
      console.error('⚠️ UI configuration warning:', error);
      // Non-critical, continue anyway
    }
  }

  private setupAppEventListeners(): void {
    // App state change listeners
    App.addListener('appStateChange', ({ isActive }) => {
      console.log('App state changed. Is active?', isActive);
      
      if (isActive) {
        // App came to foreground - check server status
        this.verifyServerHealth();
      }
    });

    // App URL open (for deep linking)
    App.addListener('appUrlOpen', (event) => {
      console.log('App opened via URL:', event.url);
      this.handleDeepLink(event.url);
    });

    // Back button handling for Android
    App.addListener('backButton', ({ canGoBack }) => {
      if (!canGoBack) {
        // Show exit confirmation for main screen
        this.showExitConfirmation();
      }
    });

    console.log('📡 App event listeners configured');
  }

  private async verifyServerHealth(): Promise<void> {
    try {
      const response = await fetch('http://localhost:3000/api/health');
      const health = await response.json();
      
      if (health.status === 'healthy') {
        console.log('✅ Embedded server health check passed');
      } else {
        console.warn('⚠️ Server health check failed, attempting restart...');
        await this.restartEmbeddedServer();
      }
    } catch (error) {
      console.error('❌ Server health check failed:', error);
      await this.restartEmbeddedServer();
    }
  }

  private async restartEmbeddedServer(): Promise<void> {
    try {
      console.log('🔄 Restarting embedded server...');
      embeddedServer.stop();
      await embeddedServer.start();
      console.log('✅ Server restarted successfully');
    } catch (error) {
      console.error('❌ Failed to restart server:', error);
    }
  }

  private handleDeepLink(url: string): void {
    // Handle deep links for direct navigation
    console.log('🔗 Processing deep link:', url);
    
    if (url.includes('/projects/')) {
      const projectId = url.split('/projects/')[1];
      // Navigate to specific project
      window.location.hash = `/projects/${projectId}`;
    } else if (url.includes('/financial')) {
      window.location.hash = '/financial';
    }
  }

  private showExitConfirmation(): void {
    // Show Arabic exit confirmation
    const confirmed = confirm('هل تريد الخروج من التطبيق؟');
    if (confirmed) {
      App.exitApp();
    }
  }

  private showOfflineReadyNotification(): void {
    // Show user that app is ready for offline use
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        left: 20px;
        background: linear-gradient(135deg, #1B4332, #40916C);
        color: white;
        padding: 16px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        z-index: 10000;
        text-align: center;
        font-family: 'Noto Sans Arabic', sans-serif;
        animation: slideDown 0.5s ease-out;
      ">
        <div style="font-size: 18px; font-weight: bold; margin-bottom: 8px;">
          📱 التطبيق جاهز للعمل بدون إنترنت
        </div>
        <div style="font-size: 14px; opacity: 0.9;">
          جميع المميزات متاحة محلياً على جهازك
        </div>
      </div>
      <style>
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      </style>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-hide after 4 seconds
    setTimeout(() => {
      notification.style.animation = 'slideDown 0.5s ease-out reverse';
      setTimeout(() => {
        notification.remove();
      }, 500);
    }, 4000);
  }

  public getDeviceInfo() {
    return this.deviceInfo;
  }

  public isAppInitialized(): boolean {
    return this.isInitialized;
  }

  public async getServerStatus(): Promise<any> {
    try {
      const response = await fetch('http://localhost:3000/api/health');
      return await response.json();
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }
}

// Export singleton instance
export const mobileAppManager = new MobileAppManager();