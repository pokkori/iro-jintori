import { AIDifficulty } from './game';
import { BlockId } from './block';

export interface AIConfig {
  readonly depth: number;
  readonly weights: {
    readonly territory: number;
    readonly corner: number;
    readonly mobility: number;
    readonly opponentMobility: number;
    readonly center: number;
  };
  readonly thinkingDelay: number;
}

export const AI_CONFIGS: Record<AIDifficulty, AIConfig> = {
  easy: {
    depth: 1,
    weights: { territory: 1.0, corner: 0.2, mobility: 0.1, opponentMobility: 0, center: 0.1 },
    thinkingDelay: 500,
  },
  normal: {
    depth: 2,
    weights: { territory: 1.0, corner: 0.5, mobility: 0.3, opponentMobility: 0.2, center: 0.2 },
    thinkingDelay: 800,
  },
  hard: {
    depth: 3,
    weights: { territory: 1.0, corner: 0.8, mobility: 0.5, opponentMobility: 0.4, center: 0.3 },
    thinkingDelay: 1200,
  },
  expert: {
    depth: 4,
    weights: { territory: 1.0, corner: 1.0, mobility: 0.7, opponentMobility: 0.6, center: 0.4 },
    thinkingDelay: 1500,
  },
};

export interface PlayerProfile {
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
  winsPerDifficulty: Record<AIDifficulty, number>;
  unlockedBlocks: BlockId[];
  coins: number;
  gems: number;
  selectedTheme: ThemeId;
  dailyStreak: number;
  lastDailyCompleted: string | null;
  dailyCompletedDates: string[];
  gameCenterName: string | null;
  tutorialCompleted: boolean;
  firstLaunchDate: string;
  adFree: boolean;
}

export type ThemeId = 'default' | 'neon' | 'pastel' | 'earth' | 'monochrome';
