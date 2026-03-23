import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  PLAYER_PROFILE: '@color_conquest/player_profile',
  SETTINGS: '@color_conquest/settings',
  DAILY_HISTORY: '@color_conquest/daily_history',
  PURCHASED_ITEMS: '@color_conquest/purchased_items',
  AD_COUNTER: '@color_conquest/ad_counter',
  TUTORIAL_DONE: '@color_conquest/tutorial_done',
  LAST_PLAYED: '@color_conquest/last_played',
  AUTO_SAVE: '@color_conquest/auto_save',
} as const;

export async function loadJSON<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function saveJSON<T>(key: string, data: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(data));
}

export async function removeKey(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}
