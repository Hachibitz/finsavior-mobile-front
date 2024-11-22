import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'finsavior-mobile-front',
  webDir: 'www',
  plugins: {
    CapacitorCookies: {
      enabled: true
    },
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: '#ffffff',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      spinnerColor: '#007bff',
    }
  },
  server: {
    cleartext: true,
    allowNavigation: ['*']
  }
};

export default config;
