import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'Scoring 7 Wonders',
  webDir: 'dist',
  server: {
    // url: 'http://192.168.x.xx:3000',
    androidScheme: 'https'
  }
};

export default config;