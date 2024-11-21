import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'finsavior-mobile-front',
  webDir: 'www',
  plugins: {
    CapacitorCookies: {
      enabled: true
    }
  },
  server: {
    cleartext: true,
    allowNavigation: ['*']
  }
};

export default config;
