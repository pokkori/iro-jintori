import { create } from 'zustand';
import { PlayerProfile, ThemeId } from '../types/player';
import { BlockId } from '../types/block';
import { AIDifficulty, GameResult } from '../types/game';
import { loadJSON, saveJSON, STORAGE_KEYS } from '../utils/storage';
import { getUnlockableBlocks } from '../constants/blocks';

interface PlayerStore {
  profile: PlayerProfile;
  isLoaded: boolean;

  loadProfile: () => Promise<void>;
  saveProfile: () => Promise<void>;
  recordGameResult: (result: GameResult, difficulty: AIDifficulty | null, playerWon: boolean) => Promise<BlockId[]>;
  recordDailyComplete: (dateStr: string) => Promise<void>;
  addCoins: (amount: number) => void;
  addGems: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  spendGems: (amount: number) => boolean;
  setTheme: (theme: ThemeId) => void;
  setAdFree: () => void;
}

const DEFAULT_PROFILE: PlayerProfile = {
  totalWins: 0,
  totalLosses: 0,
  totalDraws: 0,
  winsPerDifficulty: { easy: 0, normal: 0, hard: 0, expert: 0 },
  unlockedBlocks: ['B01', 'B02', 'B03', 'B04', 'B05'],
  coins: 0,
  gems: 0,
  selectedTheme: 'default',
  dailyStreak: 0,
  lastDailyCompleted: null,
  dailyCompletedDates: [],
  gameCenterName: null,
  tutorialCompleted: false,
  firstLaunchDate: new Date().toISOString().split('T')[0],
  adFree: false,
};

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  profile: { ...DEFAULT_PROFILE },
  isLoaded: false,

  loadProfile: async () => {
    const stored = await loadJSON<PlayerProfile>(STORAGE_KEYS.PLAYER_PROFILE);
    if (stored) {
      set({ profile: { ...DEFAULT_PROFILE, ...stored }, isLoaded: true });
    } else {
      set({ isLoaded: true });
    }
  },

  saveProfile: async () => {
    await saveJSON(STORAGE_KEYS.PLAYER_PROFILE, get().profile);
  },

  recordGameResult: async (result, difficulty, playerWon) => {
    const profile = { ...get().profile };
    const newUnlocks: BlockId[] = [];

    if (result.winner === null) {
      profile.totalDraws++;
    } else if (playerWon) {
      profile.totalWins++;
      profile.coins += 50;
      if (difficulty) {
        profile.winsPerDifficulty = { ...profile.winsPerDifficulty };
        profile.winsPerDifficulty[difficulty]++;
      }
      const unlockable = getUnlockableBlocks(profile.totalWins);
      for (const block of unlockable) {
        if (!profile.unlockedBlocks.includes(block.id)) {
          profile.unlockedBlocks = [...profile.unlockedBlocks, block.id];
          newUnlocks.push(block.id);
        }
      }
    } else {
      profile.totalLosses++;
      profile.coins += 10;
    }

    set({ profile });
    await get().saveProfile();
    return newUnlocks;
  },

  recordDailyComplete: async (dateStr) => {
    const profile = { ...get().profile };

    if (profile.lastDailyCompleted) {
      const lastDate = new Date(profile.lastDailyCompleted);
      const today = new Date(dateStr);
      const diffDays = Math.floor(
        (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diffDays === 1) {
        profile.dailyStreak++;
      } else if (diffDays > 1) {
        profile.dailyStreak = 1;
      }
    } else {
      profile.dailyStreak = 1;
    }

    profile.lastDailyCompleted = dateStr;
    if (!profile.dailyCompletedDates.includes(dateStr)) {
      profile.dailyCompletedDates = [...profile.dailyCompletedDates, dateStr];
    }

    const streakRewards: Record<number, { coins: number; gems: number }> = {
      3: { coins: 100, gems: 0 },
      7: { coins: 300, gems: 10 },
      14: { coins: 500, gems: 30 },
      30: { coins: 0, gems: 100 },
    };
    const reward = streakRewards[profile.dailyStreak];
    if (reward) {
      profile.coins += reward.coins;
      profile.gems += reward.gems;
    } else {
      profile.coins += 30;
    }

    set({ profile });
    await get().saveProfile();
  },

  addCoins: (amount) => {
    const profile = { ...get().profile, coins: get().profile.coins + amount };
    set({ profile });
    get().saveProfile();
  },

  addGems: (amount) => {
    const profile = { ...get().profile, gems: get().profile.gems + amount };
    set({ profile });
    get().saveProfile();
  },

  spendCoins: (amount) => {
    if (get().profile.coins < amount) return false;
    const profile = { ...get().profile, coins: get().profile.coins - amount };
    set({ profile });
    get().saveProfile();
    return true;
  },

  spendGems: (amount) => {
    if (get().profile.gems < amount) return false;
    const profile = { ...get().profile, gems: get().profile.gems - amount };
    set({ profile });
    get().saveProfile();
    return true;
  },

  setTheme: (theme) => {
    const profile = { ...get().profile, selectedTheme: theme };
    set({ profile });
    get().saveProfile();
  },

  setAdFree: () => {
    const profile = { ...get().profile, adFree: true };
    set({ profile });
    get().saveProfile();
  },
}));
