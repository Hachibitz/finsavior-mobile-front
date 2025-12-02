import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'br.com.finsavior',
  appName: 'FinSavior',
  webDir: 'www/browser',
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
    },
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '770396493441-m20ptqar465dckq4ur9hg597t6tq7v3o.apps.googleusercontent.com', //'770396493441-kva8gnbn5jr3dqe0gcodtu03sgpiolj1.apps.googleusercontent.com'
      forceCodeForRefreshToken: true,
    },
  },
  server: {
    cleartext: true,
    allowNavigation: ['*']
  }
};

export default config;
