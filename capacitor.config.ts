import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.stabileusa.iloveyousomuch',
  appName: 'I Love You So Much',
  webDir: 'build',

  plugins: {
    SplashScreen: {
      launchShowDuration: 300,
      launchAutoHide: true,
      showSpinner: false,
      backgroundColor: '#fff4f5',
    },
  },
};

export default config;
