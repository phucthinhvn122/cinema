import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DeviceSettings {
  autoPlay: boolean;
  autoNext: boolean;
  skipIntro: boolean;
  skipEnding: boolean;
  quality: string;
  server: string;
  subtitle: string;
  tvMode: boolean;
  setSetting: <K extends keyof DeviceSettings>(key: K, value: DeviceSettings[K]) => void;
  resetSettings: () => void;
}

const defaultSettings = {
  autoPlay: true,
  autoNext: true,
  skipIntro: false,
  skipEnding: false,
  quality: '1080p',
  server: 'Vietsub #1',
  subtitle: 'vi',
  tvMode: false,
};

export const useDeviceSettings = create<DeviceSettings>()(
  persist(
    (set) => ({
      ...defaultSettings,
      setSetting: (key, value) => {
        set({ [key]: value } as any);
      },
      resetSettings: () => {
        set(defaultSettings);
      },
    }),
    {
      name: 'cineva-device-settings',
    }
  )
);
