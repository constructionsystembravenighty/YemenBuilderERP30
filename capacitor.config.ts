import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.construction.management.yemen',
  appName: 'منصة إدارة البناء',
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
    webContentsDebuggingEnabled: true,
    minWebViewVersion: 60,
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
      releaseType: 'debug'
    }
  }
};

export default config;