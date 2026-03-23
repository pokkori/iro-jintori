import { create } from 'zustand';
import { loadJSON, saveJSON, STORAGE_KEYS } from '../utils/storage';

interface SettingsState {
  bgmVolume: number;
  seVolume: number;
  hapticsEnabled: boolean;
  notificationEnabled: boolean;
  notificationHour: number;
  notificationMinute: number;
}

interface SettingsStore extends SettingsState {
  loadSettings: () => Promise<void>;
  setBgmVolume: (v: number) => void;
  setSeVolume: (v: number) => void;
  toggleHaptics: () => void;
  toggleNotification: () => void;
  setNotificationTime: (hour: number, minute: number) => void;
}

function saveSettings(state: SettingsState) {
  saveJSON(STORAGE_KEYS.SETTINGS, {
    bgmVolume: state.bgmVolume,
    seVolume: state.seVolume,
    hapticsEnabled: state.hapticsEnabled,
    notificationEnabled: state.notificationEnabled,
    notificationHour: state.notificationHour,
    notificationMinute: state.notificationMinute,
  });
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  bgmVolume: 0.7,
  seVolume: 1.0,
  hapticsEnabled: true,
  notificationEnabled: true,
  notificationHour: 8,
  notificationMinute: 0,

  loadSettings: async () => {
    const stored = await loadJSON<SettingsState>(STORAGE_KEYS.SETTINGS);
    if (stored) {
      set(stored);
    }
  },

  setBgmVolume: (v) => {
    set({ bgmVolume: v });
    saveSettings(get());
  },
  setSeVolume: (v) => {
    set({ seVolume: v });
    saveSettings(get());
  },
  toggleHaptics: () => {
    set(s => ({ hapticsEnabled: !s.hapticsEnabled }));
    saveSettings(get());
  },
  toggleNotification: () => {
    set(s => ({ notificationEnabled: !s.notificationEnabled }));
    saveSettings(get());
  },
  setNotificationTime: (hour, minute) => {
    set({ notificationHour: hour, notificationMinute: minute });
    saveSettings(get());
  },
}));
