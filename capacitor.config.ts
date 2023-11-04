import { CapacitorConfig } from '@capacitor/cli';

// https://capacitorjs.com/docs/config
const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: '7 Wonders: Assistant',
  webDir: 'dist',
  server: {
    hostname: 'localhost',
    androidScheme: 'https',
  },
  loggingBehavior: 'debug',
};

export default config;
