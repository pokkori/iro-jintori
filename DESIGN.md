# Color Conquest / 色陣取り - 詳細設計書 v1.0

> 最終更新: 2026-03-20
> ステータス: 設計完了 / 実装待ち

---

## 1. ゲーム概要

### 1.1 コンセプト
ヘックスマスを自分の色で塗り広げ、相手より多く陣地を取る2人対戦パズル。
テトリス型ブロックを配置して陣地を拡大し、リバーシのように相手の色を反転させる。

### 1.2 参考ゲーム
- **Othello/リバーシ**: 反転メカニクス（挟んで裏返す）
- **Blokus**: ブロック形状を選んで配置する戦略性
- **Hexxagon**: ヘックスグリッド上での陣取り

### 1.3 技術スタック
| 項目 | 技術 |
|---|---|
| フレームワーク | React Native (Expo SDK 52) |
| 言語 | TypeScript 5.x (strict mode) |
| 状態管理 | zustand v5 |
| 描画 | react-native-svg |
| ナビゲーション | expo-router (file-based routing) |
| 永続化 | @react-native-async-storage/async-storage |
| 広告 | react-native-google-mobile-ads (AdMob) |
| 課金 | expo-in-app-purchases |
| ハプティクス | expo-haptics |
| 通知 | expo-notifications |
| シェア | expo-sharing + react-native-view-shot |
| サウンド | expo-av |
| Game Center | expo-game-center (iOS) / Google Play Games (Android) |

---

## 2. プロジェクト構成

```
color-conquest/
├── app.json
├── package.json
├── tsconfig.json
├── eas.json
├── app/
│   ├── _layout.tsx                  # Root layout (Stack navigator)
│   ├── index.tsx                    # メニュー画面
│   ├── game.tsx                     # ゲーム画面
│   ├── result.tsx                   # リザルト画面
│   ├── collection.tsx               # ブロック図鑑画面
│   ├── shop.tsx                     # ショップ画面
│   ├── daily.tsx                    # デイリーパズル画面
│   ├── settings.tsx                 # 設定画面
│   └── tutorial.tsx                 # チュートリアル画面
├── src/
│   ├── types/
│   │   ├── index.ts                 # 全型定義のre-export
│   │   ├── hex.ts                   # HexCoord, HexDirection
│   │   ├── block.ts                 # BlockShape, BlockDefinition
│   │   ├── board.ts                 # BoardState, CellState
│   │   ├── game.ts                  # GameState, TurnAction, GameResult
│   │   ├── player.ts               # Player, PlayerColor, AIConfig
│   │   ├── daily.ts                 # DailyPuzzle, DailyResult
│   │   └── shop.ts                  # ShopItem, Currency
│   ├── constants/
│   │   ├── blocks.ts                # 全ブロック形状定義（15種）
│   │   ├── colors.ts                # カラーパレット
│   │   ├── layout.ts                # グリッドサイズ・セルサイズ
│   │   ├── daily-puzzles.ts         # デイリーパズルデータ（30日分シード）
│   │   └── sounds.ts                # サウンドファイルマッピング
│   ├── engine/
│   │   ├── hex-math.ts              # ヘックス座標計算
│   │   ├── board.ts                 # ボード操作ロジック
│   │   ├── placement.ts             # ブロック配置判定
│   │   ├── capture.ts              # 反転（キャプチャ）ロジック
│   │   ├── ai.ts                    # AIエンジン（ミニマックス）
│   │   ├── game-loop.ts             # ゲームループ管理
│   │   ├── scoring.ts              # スコア計算
│   │   └── daily-generator.ts       # デイリーパズル生成
│   ├── store/
│   │   ├── game-store.ts            # ゲーム状態zustandストア
│   │   ├── player-store.ts          # プレイヤーデータストア
│   │   └── settings-store.ts        # 設定ストア
│   ├── components/
│   │   ├── HexGrid.tsx              # ヘックスグリッド全体
│   │   ├── HexCell.tsx              # 個別ヘックスセル
│   │   ├── BlockSelector.tsx        # ブロック選択UI
│   │   ├── BlockPreview.tsx         # ブロックプレビュー（ドラッグ中）
│   │   ├── ScoreBar.tsx             # スコアバー（上部）
│   │   ├── TurnIndicator.tsx        # ターン表示
│   │   ├── GameOverModal.tsx        # ゲーム終了モーダル
│   │   ├── DailyPuzzleCard.tsx      # デイリーパズルカード
│   │   ├── BlockCollectionItem.tsx  # 図鑑アイテム
│   │   ├── ShopItemCard.tsx         # ショップアイテムカード
│   │   ├── AdBanner.tsx             # AdMobバナー
│   │   ├── RewardedAdButton.tsx     # リワード広告ボタン
│   │   ├── ShareButton.tsx          # シェアボタン
│   │   └── AnimatedCapture.tsx      # 反転アニメーション
│   ├── hooks/
│   │   ├── useGameEngine.ts         # ゲームエンジンフック
│   │   ├── useBlockPlacement.ts     # ブロック配置操作フック
│   │   ├── useHexLayout.ts          # ヘックスレイアウト計算フック
│   │   ├── useSound.ts             # サウンド再生フック
│   │   ├── useHaptics.ts           # ハプティクスフック
│   │   └── useDaily.ts             # デイリーパズルフック
│   ├── utils/
│   │   ├── storage.ts              # AsyncStorageラッパー
│   │   ├── share.ts                # シェア機能
│   │   ├── analytics.ts            # イベントトラッキング
│   │   └── date.ts                 # 日付ユーティリティ
│   └── assets/
│       ├── sounds/
│       │   ├── place.mp3           # ブロック配置音
│       │   ├── capture.mp3         # 反転音
│       │   ├── victory.mp3         # 勝利音
│       │   └── defeat.mp3          # 敗北音
│       └── images/
│           ├── logo.png            # アプリロゴ
│           └── tutorial/           # チュートリアル画像
│               ├── step1.png
│               ├── step2.png
│               └── step3.png
└── __tests__/
    ├── engine/
    │   ├── hex-math.test.ts
    │   ├── placement.test.ts
    │   ├── capture.test.ts
    │   └── ai.test.ts
    └── components/
        └── HexGrid.test.tsx
```

---

## 3. TypeScript型定義

### 3.1 `src/types/hex.ts`

```typescript
/**
 * Axial座標系（q, r）
 * ヘックスグリッドの各セルを一意に識別する。
 * 参考: https://www.redblobgames.com/grids/hexagons/#coordinates-axial
 *
 * 座標配置（flat-top hexagon）:
 *       (0,-3)  (1,-3)  (2,-3)  (3,-3)
 *    (-1,-2) (0,-2)  (1,-2)  (2,-2)  (3,-2)
 *  (-2,-1) (-1,-1) (0,-1)  (1,-1)  (2,-1)  (3,-1)
 * (-3,0) (-2,0) (-1,0)  (0,0)  (1,0)  (2,0)  (3,0)
 *  (-3,1) (-2,1) (-1,1) (0,1)  (1,1)  (2,1)
 *    (-3,2) (-2,2) (-1,2) (0,2)  (1,2)
 *       (-3,3) (-2,3) (-1,3) (0,3)
 */
export interface HexCoord {
  /** 列（q軸）: 右方向が正 */
  readonly q: number;
  /** 行（r軸）: 右下方向が正 */
  readonly r: number;
}

/**
 * Cube座標系（q, r, s） where q + r + s = 0
 * 距離計算・直線描画で使用。axialから s = -q - r で変換。
 */
export interface CubeCoord {
  readonly q: number;
  readonly r: number;
  readonly s: number;
}

/**
 * ピクセル座標（画面描画用）
 */
export interface PixelCoord {
  readonly x: number;
  readonly y: number;
}

/**
 * ヘックスの6方向（flat-top hexagon）
 * axial座標系でのオフセット値
 */
export const HEX_DIRECTIONS: readonly HexCoord[] = [
  { q: +1, r:  0 }, // 右
  { q: +1, r: -1 }, // 右上
  { q:  0, r: -1 }, // 左上
  { q: -1, r:  0 }, // 左
  { q: -1, r: +1 }, // 左下
  { q:  0, r: +1 }, // 右下
] as const;

/** 方向インデックス（0-5） */
export type HexDirectionIndex = 0 | 1 | 2 | 3 | 4 | 5;

/** ヘックス座標を一意文字列に変換（MapのキーやSetで使用） */
export type HexKey = `${number},${number}`;
```

### 3.2 `src/types/block.ts`

```typescript
import { HexCoord } from './hex';

/** ブロックID: 'B01' ~ 'B15' */
export type BlockId =
  | 'B01' | 'B02' | 'B03' | 'B04' | 'B05'   // 初期ブロック
  | 'B06' | 'B07' | 'B08' | 'B09' | 'B10'   // アンロックTier1
  | 'B11' | 'B12' | 'B13' | 'B14' | 'B15';  // アンロックTier2

/** ブロックのレアリティ */
export type BlockRarity = 'common' | 'rare' | 'epic' | 'legendary';

/**
 * ブロック形状定義
 * cells: 原点(0,0)を基準としたaxial座標の配列
 * 配置時にプレイヤーが選んだ位置にオフセットされる
 */
export interface BlockShape {
  /** ブロック固有ID */
  readonly id: BlockId;
  /** 表示名（日本語） */
  readonly name: string;
  /** 表示名（英語・Game Center用） */
  readonly nameEn: string;
  /** セル座標配列（原点基準） */
  readonly cells: readonly HexCoord[];
  /** セル数 */
  readonly size: number;
  /** レアリティ */
  readonly rarity: BlockRarity;
  /** アンロック条件: 勝利数 */
  readonly unlockWins: number;
  /** アイコンカラー（図鑑表示用） */
  readonly color: string;
  /** 説明テキスト */
  readonly description: string;
}

/**
 * 回転済みブロック（配置候補）
 * ヘックスは60度単位で6回転
 */
export interface RotatedBlock {
  readonly base: BlockShape;
  /** 回転角度（0, 60, 120, 180, 240, 300） */
  readonly rotation: number;
  /** 回転後のセル座標 */
  readonly cells: readonly HexCoord[];
}
```

### 3.3 `src/types/board.ts`

```typescript
import { HexCoord, HexKey } from './hex';

/** プレイヤー色 */
export type PlayerColor = 'red' | 'blue';

/** セルの状態 */
export type CellOwner = PlayerColor | 'empty';

/**
 * セル状態
 */
export interface CellState {
  /** 座標 */
  readonly coord: HexCoord;
  /** 所有者 */
  owner: CellOwner;
  /** 直前ターンで反転されたか（アニメーション用） */
  justCaptured: boolean;
  /** 直前ターンで配置されたか（アニメーション用） */
  justPlaced: boolean;
}

/**
 * ボード状態
 * Map<HexKey, CellState> で全セルを管理
 */
export interface BoardState {
  /** 全セルのMap */
  readonly cells: Map<HexKey, CellState>;
  /** グリッド半径（7x7は半径3） */
  readonly radius: number;
  /** 赤の所有セル数 */
  redCount: number;
  /** 青の所有セル数 */
  blueCount: number;
  /** 空セル数 */
  emptyCount: number;
}
```

### 3.4 `src/types/game.ts`

```typescript
import { BlockId } from './block';
import { BoardState, PlayerColor } from './board';
import { HexCoord } from './hex';

/** ゲームモード */
export type GameMode = 'pvp' | 'pve' | 'daily';

/** AI難易度 */
export type AIDifficulty = 'easy' | 'normal' | 'hard' | 'expert';

/** ゲームフェーズ */
export type GamePhase =
  | 'selecting_block'    // ブロック選択中
  | 'placing_block'      // ブロック配置中（タップ/ドラッグ）
  | 'animating_capture'  // 反転アニメーション再生中
  | 'ai_thinking'        // AI思考中
  | 'game_over';         // ゲーム終了

/**
 * ターンアクション（1手の記録）
 */
export interface TurnAction {
  /** ターン番号（1始まり） */
  readonly turnNumber: number;
  /** 実行プレイヤー */
  readonly player: PlayerColor;
  /** 使用ブロックID */
  readonly blockId: BlockId;
  /** 配置位置（ブロックの原点をどこに置いたか） */
  readonly position: HexCoord;
  /** 回転角度 */
  readonly rotation: number;
  /** このターンで反転されたセル座標 */
  readonly capturedCells: readonly HexCoord[];
  /** 配置後の赤セル数 */
  readonly redCountAfter: number;
  /** 配置後の青セル数 */
  readonly blueCountAfter: number;
  /** パスしたか */
  readonly isPass: boolean;
  /** タイムスタンプ（ms） */
  readonly timestamp: number;
}

/**
 * ゲームリザルト
 */
export interface GameResult {
  /** 勝者（引き分けはnull） */
  readonly winner: PlayerColor | null;
  /** 最終赤セル数 */
  readonly redCount: number;
  /** 最終青セル数 */
  readonly blueCount: number;
  /** 総ターン数 */
  readonly totalTurns: number;
  /** 最大逆転（セル差） */
  readonly biggestSwing: number;
  /** 逆転が発生したか */
  readonly hadComeback: boolean;
  /** ゲーム時間（秒） */
  readonly durationSeconds: number;
  /** 新規アンロックブロック（あれば） */
  readonly unlockedBlocks: readonly BlockId[];
}

/**
 * ゲーム全体の状態
 */
export interface GameState {
  /** ゲームモード */
  readonly mode: GameMode;
  /** AI難易度（pveモードのみ） */
  readonly aiDifficulty: AIDifficulty | null;
  /** 現在のゲームフェーズ */
  phase: GamePhase;
  /** ボード状態 */
  board: BoardState;
  /** 現在のターンプレイヤー */
  currentPlayer: PlayerColor;
  /** 赤プレイヤーの使用可能ブロック */
  readonly redBlocks: BlockId[];
  /** 青プレイヤーの使用可能ブロック */
  readonly blueBlocks: BlockId[];
  /** 選択中のブロック */
  selectedBlock: BlockId | null;
  /** 選択中の回転角度 */
  selectedRotation: number;
  /** ターン履歴 */
  readonly history: TurnAction[];
  /** 連続パス数（2で終了） */
  consecutivePasses: number;
  /** ゲーム開始タイムスタンプ */
  readonly startedAt: number;
  /** リザルト（game_overフェーズでセット） */
  result: GameResult | null;
}
```

### 3.5 `src/types/player.ts`

```typescript
import { AIDifficulty } from './game';
import { BlockId } from './block';

/**
 * AIの評価設定
 */
export interface AIConfig {
  /** 探索深度 */
  readonly depth: number;
  /** 評価関数の重み */
  readonly weights: {
    /** 自陣セル数の重み */
    readonly territory: number;
    /** 角（グリッド端）の重み */
    readonly corner: number;
    /** 隣接空きセル数（拡張性）の重み */
    readonly mobility: number;
    /** 相手のmobilityを減らす重み */
    readonly opponentMobility: number;
    /** 中央寄りの重み */
    readonly center: number;
  };
  /** 思考時間の演出ディレイ（ms） */
  readonly thinkingDelay: number;
}

/** AI難易度別設定 */
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

/**
 * プレイヤープロフィール（永続化）
 */
export interface PlayerProfile {
  /** 累計勝利数 */
  totalWins: number;
  /** 累計敗北数 */
  totalLosses: number;
  /** 累計引き分け数 */
  totalDraws: number;
  /** AI難易度別勝利数 */
  winsPerDifficulty: Record<AIDifficulty, number>;
  /** アンロック済みブロックID */
  unlockedBlocks: BlockId[];
  /** 所持コイン */
  coins: number;
  /** 所持ジェム（プレミアム通貨） */
  gems: number;
  /** 選択中のテーマ */
  selectedTheme: ThemeId;
  /** デイリーパズル連続達成日数 */
  dailyStreak: number;
  /** デイリーパズル最終クリア日 (YYYY-MM-DD) */
  lastDailyCompleted: string | null;
  /** デイリーパズル全クリア日のセット */
  dailyCompletedDates: string[];
  /** Game Centerのプレイヤー名 */
  gameCenterName: string | null;
  /** チュートリアル完了フラグ */
  tutorialCompleted: boolean;
  /** 初回起動日 */
  firstLaunchDate: string;
  /** 広告非表示購入済みか */
  adFree: boolean;
}

/** テーマID */
export type ThemeId = 'default' | 'neon' | 'pastel' | 'earth' | 'monochrome';
```

### 3.6 `src/types/daily.ts`

```typescript
import { BlockId } from './block';
import { BoardState, PlayerColor } from './board';
import { HexCoord } from './hex';

/**
 * デイリーパズル定義
 * 「3手で勝利する配置を見つけよ」形式
 */
export interface DailyPuzzle {
  /** パズルID (YYYY-MM-DD) */
  readonly id: string;
  /** 初期盤面（途中の状態） */
  readonly initialBoard: BoardState;
  /** プレイヤーの色（通常red） */
  readonly playerColor: PlayerColor;
  /** 使用可能ブロック（3つ） */
  readonly availableBlocks: readonly BlockId[];
  /** 正解手順（複数解答あり得る。1つ目が模範解答） */
  readonly solutions: readonly DailySolution[];
  /** 制限手数 */
  readonly maxMoves: number;
  /** 難易度 (1-5) */
  readonly difficulty: number;
  /** ヒントテキスト */
  readonly hint: string;
}

/**
 * デイリーパズルの正解手順
 */
export interface DailySolution {
  readonly moves: readonly {
    readonly blockId: BlockId;
    readonly position: HexCoord;
    readonly rotation: number;
  }[];
}

/**
 * デイリーパズル結果
 */
export interface DailyResult {
  /** パズルID */
  readonly puzzleId: string;
  /** クリアしたか */
  readonly cleared: boolean;
  /** 使用手数 */
  readonly movesUsed: number;
  /** クリア時間（秒） */
  readonly timeSeconds: number;
  /** ヒントを使ったか */
  readonly usedHint: boolean;
}
```

### 3.7 `src/types/shop.ts`

```typescript
/** ショップアイテムカテゴリ */
export type ShopCategory = 'theme' | 'block_skin' | 'currency' | 'ad_free';

/**
 * ショップアイテム
 */
export interface ShopItem {
  readonly id: string;
  readonly category: ShopCategory;
  readonly name: string;
  readonly description: string;
  readonly price: ShopPrice;
  readonly previewImage: string;
}

/**
 * 価格（コイン or ジェム or リアルマネー）
 */
export type ShopPrice =
  | { readonly type: 'coins'; readonly amount: number }
  | { readonly type: 'gems'; readonly amount: number }
  | { readonly type: 'iap'; readonly productId: string; readonly displayPrice: string };
```

---

## 4. 画面設計

### 4.1 メニュー画面 (`app/index.tsx`)

```
┌─────────────────────────┐
│                         │
│     COLOR CONQUEST      │  ← ロゴ + タイトルアニメーション
│       色 陣 取 り        │     (ヘックスが1つずつ着色)
│                         │
│  ┌───────────────────┐  │
│  │  ▶ ひとりで遊ぶ    │  │  → AI対戦モード選択
│  └───────────────────┘  │    (easy/normal/hard/expert)
│  ┌───────────────────┐  │
│  │  👥 ふたりで遊ぶ   │  │  → PvPモード（1台のデバイス）
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │  📅 今日の詰め陣取り │  │  → デイリーパズル
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │  📖 図鑑           │  │  → ブロック図鑑
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │  🛒 ショップ       │  │  → テーマ・アイテム購入
│  └───────────────────┘  │
│                         │
│  ⚙️設定  🏆ランキング   │  ← 下部アイコン
│                         │
│  ─── AdMob Banner ───  │  ← 320x50バナー広告
└─────────────────────────┘
```

**操作フロー**:
1. 「ひとりで遊ぶ」タップ → 難易度選択シート表示 → 選択後 `game.tsx?mode=pve&difficulty=normal` へ遷移
2. 「ふたりで遊ぶ」タップ → `game.tsx?mode=pvp` へ遷移
3. 「今日の詰め陣取り」タップ → `daily.tsx` へ遷移
4. 初回起動時 → `tutorial.tsx` を先に表示

### 4.2 ゲーム画面 (`app/game.tsx`)

```
┌─────────────────────────┐
│ 🔴 23  ━━━━━━━━━  19 🔵│  ← ScoreBar（セル数・プログレスバー）
│ Turn 12      00:45      │  ← ターン数・経過時間
├─────────────────────────┤
│                         │
│      ⬡ ⬡ ⬡ ⬡          │
│     ⬡ ⬡ ⬡ ⬡ ⬡         │
│    ⬡ ⬡ ⬡ ⬡ ⬡ ⬡        │  ← HexGrid
│   ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡       │     (7x7 = 半径3のヘックスグリッド)
│    ⬡ ⬡ ⬡ ⬡ ⬡ ⬡        │     合計37セル
│     ⬡ ⬡ ⬡ ⬡ ⬡         │
│      ⬡ ⬡ ⬡ ⬡          │
│                         │
├─────────────────────────┤
│  ← 回転  [選択中ブロック]  回転 →  │  ← 回転ボタン
├─────────────────────────┤
│ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐│
│ │B1│ │B2│ │B3│ │B4│ │B5││  ← BlockSelector
│ └──┘ └──┘ └──┘ └──┘ └──┘│     (横スクロール)
│ ─── AdMob Banner ───    │
└─────────────────────────┘
```

**操作フロー**:
1. BlockSelectorからブロックをタップして選択（`phase: 'selecting_block'` → `'placing_block'`）
2. グリッド上の配置可能セルがハイライト表示される
3. 配置したいセルをタップ → ブロックがプレビュー表示
4. 確定ボタンまたはもう一度タップで配置確定
5. 反転アニメーション再生（`phase: 'animating_capture'`）
6. ターン交代

**ブロック配置のインタラクション詳細**:
- 配置可能なセル: 黄色の点滅ハイライト
- 配置不可能なセル: グレーアウト
- プレビュー中: 半透明の自色で表示
- 回転: 左右ボタンで60度ずつ回転（HEX_DIRECTIONS基準）
- 配置確定時: ハプティクスフィードバック（`Haptics.impactAsync(ImpactFeedbackStyle.Medium)`）
- 反転時: 1セルずつ0.15秒間隔でフリップアニメーション + ハプティクス（`Light`）

### 4.3 リザルト画面 (`app/result.tsx`)

```
┌─────────────────────────┐
│                         │
│        🎉 勝利！         │  ← 勝敗表示（紙吹雪アニメ）
│                         │
│  ┌─────────────────────┐│
│  │  最終盤面            ││
│  │  (ミニHexGrid表示)   ││  ← 最終盤面のスナップショット
│  └─────────────────────┘│
│                         │
│  🔴 赤: 23マス          │
│  🔵 青: 14マス          │
│  📊 最大逆転: 8マス     │  ← スタッツ
│  ⏱️ 所要時間: 3:45      │
│  🧩 新ブロック解放！    │  ← アンロック通知
│                         │
│  ┌───────┐ ┌───────┐   │
│  │📤シェア │ │▶もう1回│   │
│  └───────┘ └───────┘   │
│  ┌───────────────────┐  │
│  │  🏠 メニューに戻る  │  │
│  └───────────────────┘  │
│                         │
│ ─ インタースティシャル広告 ─│  ← 3回に1回表示
└─────────────────────────┘
```

**シェア内容**:
- 盤面画像（`react-native-view-shot`でキャプチャ）
- テキスト: `色陣取りで${redCount}対${blueCount}で勝利！ #ColorConquest #色陣取り`

### 4.4 ブロック図鑑画面 (`app/collection.tsx`)

```
┌─────────────────────────┐
│ ← 戻る   ブロック図鑑    │
├─────────────────────────┤
│  解放済み: 7/15         │
│  ━━━━━━━━━━━━━[47%]    │
├─────────────────────────┤
│ ■ 初期ブロック          │
│ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐│
│ │⬡ │ │⬡⬡│ │⬡ │ │⬡⬡│ │⬡ ││
│ │  │ │  │ │⬡ │ │⬡ │ │⬡⬡││
│ └──┘ └──┘ └──┘ └──┘ └──┘│
│ 単体  双子  直線  L字  T字 │
│                         │
│ ■ Tier1（5勝で解放）    │
│ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐│
│ │🔒│ │🔒│ │🔒│ │⬡⬡│ │⬡ ││
│ │  │ │  │ │  │ │⬡⬡│ │⬡⬡││
│ └──┘ └──┘ └──┘ └──┘ │⬡ ││
│ Z字  S字 十字 四角  矢印 │ └──┘│
│                         │
│ ■ Tier2（15勝で解放）   │
│ (ロック状態で形状はシルエット)│
│ ─── AdMob Banner ───    │
└─────────────────────────┘
```

### 4.5 ショップ画面 (`app/shop.tsx`)

```
┌─────────────────────────┐
│ ← 戻る    ショップ      │
│  💰 1,250  💎 15        │  ← 所持通貨
├─────────────────────────┤
│ [テーマ] [スキン] [通貨]  │  ← タブ切替
├─────────────────────────┤
│ ┌───────────────────┐   │
│ │ 🌈 ネオンテーマ     │   │
│ │ ヘックスが光り輝く   │   │
│ │ 💰 500             │   │
│ │ [購入する]          │   │
│ └───────────────────┘   │
│ ┌───────────────────┐   │
│ │ 🍃 アーステーマ     │   │
│ │ 自然の色合い        │   │
│ │ 💰 500             │   │
│ └───────────────────┘   │
│                         │
│ ── プレミアム ──        │
│ ┌───────────────────┐   │
│ │ 🚫 広告非表示       │   │
│ │ ¥480 (買い切り)     │   │
│ │ [購入する]          │   │
│ └───────────────────┘   │
│ ─── AdMob Banner ───   │
└─────────────────────────┘
```

### 4.6 デイリーパズル画面 (`app/daily.tsx`)

```
┌─────────────────────────┐
│ ← 戻る  今日の詰め陣取り │
│ 🔥 連続 5日達成         │  ← ストリーク表示
├─────────────────────────┤
│  ★★★☆☆ (難易度3)       │
│  「3手で青を全滅させよ」  │  ← 問題文
├─────────────────────────┤
│      (HexGrid)          │
│   途中盤面を表示         │
│   配置可能箇所ハイライト  │
├─────────────────────────┤
│  残り手数: ●●○          │  ← 3手中1手使用
│                         │
│  [💡ヒント] (リワード広告) │  ← ヒント=リワード広告視聴
│                         │
│ BlockSelector (制限3つ)  │
│ ─── AdMob Banner ───    │
└─────────────────────────┘
```

### 4.7 チュートリアル画面 (`app/tutorial.tsx`)

4ステップのスワイプ式チュートリアル:

1. **ステップ1**: 「自陣（赤）の隣にブロックを置いて陣地を広げよう」
   - アニメーション: 単体ブロックを隣接マスに配置
2. **ステップ2**: 「いろんな形のブロックが使えるよ」
   - アニメーション: L字ブロックを配置
3. **ステップ3**: 「相手を挟むと色が反転！」
   - アニメーション: リバーシ式反転のデモ
4. **ステップ4**: 「勝利するとブロックが増える！」
   - アニメーション: アンロック演出

各ステップは`react-native-reanimated`の`SharedTransition`でスムーズに遷移。

### 4.8 設定画面 (`app/settings.tsx`)

| 項目 | デフォルト | 型 |
|---|---|---|
| BGM音量 | 0.7 | number (0-1) |
| SE音量 | 1.0 | number (0-1) |
| ハプティクス | ON | boolean |
| 通知（デイリーリマインダー） | ON | boolean |
| 通知時刻 | 08:00 | string (HH:mm) |
| テーマ | default | ThemeId |
| Game Center連携 | OFF | boolean |
| データリセット | - | button |

---

## 5. ゲームロジック

### 5.1 ヘックスグリッド座標系 (`src/engine/hex-math.ts`)

```typescript
import { HexCoord, CubeCoord, PixelCoord, HEX_DIRECTIONS, HexKey } from '../types/hex';

// ─── 座標変換 ───

/** Axial → Cube */
export function axialToCube(hex: HexCoord): CubeCoord {
  return { q: hex.q, r: hex.r, s: -hex.q - hex.r };
}

/** Cube → Axial */
export function cubeToAxial(cube: CubeCoord): HexCoord {
  return { q: cube.q, r: cube.r };
}

/**
 * Axial → Pixel (flat-top hexagon)
 * @param hex axial座標
 * @param size ヘックスの半径（中心から頂点まで）
 * @returns 中心のピクセル座標
 */
export function axialToPixel(hex: HexCoord, size: number): PixelCoord {
  const x = size * (3/2 * hex.q);
  const y = size * (Math.sqrt(3)/2 * hex.q + Math.sqrt(3) * hex.r);
  return { x, y };
}

/**
 * Pixel → Axial (タッチ位置からセル特定)
 * @param pixel ピクセル座標
 * @param size ヘックスの半径
 * @returns 最も近いaxial座標
 */
export function pixelToAxial(pixel: PixelCoord, size: number): HexCoord {
  const q = (2/3 * pixel.x) / size;
  const r = (-1/3 * pixel.x + Math.sqrt(3)/3 * pixel.y) / size;
  return cubeRound({ q, r, s: -q - r });
}

/** Cube座標の丸め（浮動小数点→整数） */
export function cubeRound(cube: CubeCoord): HexCoord {
  let rq = Math.round(cube.q);
  let rr = Math.round(cube.r);
  let rs = Math.round(cube.s);

  const qDiff = Math.abs(rq - cube.q);
  const rDiff = Math.abs(rr - cube.r);
  const sDiff = Math.abs(rs - cube.s);

  if (qDiff > rDiff && qDiff > sDiff) {
    rq = -rr - rs;
  } else if (rDiff > sDiff) {
    rr = -rq - rs;
  }
  // sは使わない（axialではq, rのみ）
  return { q: rq, r: rr };
}

// ─── ヘックス操作 ───

/** 2つのヘックス座標を加算 */
export function hexAdd(a: HexCoord, b: HexCoord): HexCoord {
  return { q: a.q + b.q, r: a.r + b.r };
}

/** 指定方向の隣接セル */
export function hexNeighbor(hex: HexCoord, direction: number): HexCoord {
  return hexAdd(hex, HEX_DIRECTIONS[direction]);
}

/** 全6方向の隣接セル */
export function hexNeighbors(hex: HexCoord): HexCoord[] {
  return HEX_DIRECTIONS.map(dir => hexAdd(hex, dir));
}

/** 2セル間の距離 */
export function hexDistance(a: HexCoord, b: HexCoord): number {
  const ac = axialToCube(a);
  const bc = axialToCube(b);
  return Math.max(
    Math.abs(ac.q - bc.q),
    Math.abs(ac.r - bc.r),
    Math.abs(ac.s - bc.s)
  );
}

/** HexKey生成 */
export function hexKey(hex: HexCoord): HexKey {
  return `${hex.q},${hex.r}`;
}

/** HexKeyからHexCoordに復元 */
export function keyToHex(key: HexKey): HexCoord {
  const [q, r] = key.split(',').map(Number);
  return { q, r };
}

/**
 * ヘックス座標を60度回転
 * Cube座標系で (q, r, s) → (-r, -s, -q) が60度時計回り
 * @param hex 回転対象（原点基準）
 * @param times 回転回数（1=60度, 2=120度, ...）
 */
export function hexRotate(hex: HexCoord, times: number): HexCoord {
  let cube = axialToCube(hex);
  const n = ((times % 6) + 6) % 6; // 0-5に正規化
  for (let i = 0; i < n; i++) {
    cube = { q: -cube.r, r: -cube.s, s: -cube.q };
  }
  return cubeToAxial(cube);
}

/**
 * 半径rのヘックスグリッドの全座標を生成
 * @param radius グリッド半径（7x7なら radius=3、合計37セル）
 */
export function generateHexGrid(radius: number): HexCoord[] {
  const coords: HexCoord[] = [];
  for (let q = -radius; q <= radius; q++) {
    const r1 = Math.max(-radius, -q - radius);
    const r2 = Math.min(radius, -q + radius);
    for (let r = r1; r <= r2; r++) {
      coords.push({ q, r });
    }
  }
  return coords;
}
```

### 5.2 ボード操作 (`src/engine/board.ts`)

```typescript
import { BoardState, CellState, CellOwner, PlayerColor } from '../types/board';
import { HexCoord, HexKey } from '../types/hex';
import { generateHexGrid, hexKey } from './hex-math';

const GRID_RADIUS = 3; // 7x7ヘックスグリッド（37セル）

/**
 * 初期ボード生成
 * 対角に各プレイヤーの初期陣地を配置
 *
 * 赤の初期位置: (-3, 0), (-3, 1), (-2, -1) → 左上角
 * 青の初期位置: (3, 0), (3, -1), (2, 1)   → 右下角
 */
export function createInitialBoard(): BoardState {
  const cells = new Map<HexKey, CellState>();
  const allCoords = generateHexGrid(GRID_RADIUS);

  // 赤の初期陣地（左上隅3セル）
  const redStart: HexCoord[] = [
    { q: -3, r: 0 },
    { q: -3, r: 1 },
    { q: -2, r: -1 },
  ];

  // 青の初期陣地（右下隅3セル）
  const blueStart: HexCoord[] = [
    { q: 3, r: 0 },
    { q: 3, r: -1 },
    { q: 2, r: 1 },
  ];

  const redKeys = new Set(redStart.map(hexKey));
  const blueKeys = new Set(blueStart.map(hexKey));

  for (const coord of allCoords) {
    const key = hexKey(coord);
    let owner: CellOwner = 'empty';
    if (redKeys.has(key)) owner = 'red';
    if (blueKeys.has(key)) owner = 'blue';

    cells.set(key, {
      coord,
      owner,
      justCaptured: false,
      justPlaced: false,
    });
  }

  return {
    cells,
    radius: GRID_RADIUS,
    redCount: 3,
    blueCount: 3,
    emptyCount: 37 - 6,
  };
}

/** ボードのディープコピー（AI探索用） */
export function cloneBoard(board: BoardState): BoardState {
  const newCells = new Map<HexKey, CellState>();
  for (const [key, cell] of board.cells) {
    newCells.set(key, { ...cell });
  }
  return {
    cells: newCells,
    radius: board.radius,
    redCount: board.redCount,
    blueCount: board.blueCount,
    emptyCount: board.emptyCount,
  };
}

/** セル数を再計算 */
export function recountBoard(board: BoardState): void {
  let red = 0, blue = 0, empty = 0;
  for (const cell of board.cells.values()) {
    if (cell.owner === 'red') red++;
    else if (cell.owner === 'blue') blue++;
    else empty++;
  }
  board.redCount = red;
  board.blueCount = blue;
  board.emptyCount = empty;
}
```

### 5.3 ブロック配置判定 (`src/engine/placement.ts`)

```typescript
import { BlockShape, RotatedBlock } from '../types/block';
import { BoardState, PlayerColor } from '../types/board';
import { HexCoord, HexKey } from '../types/hex';
import { hexAdd, hexKey, hexNeighbors, hexRotate } from './hex-math';

/**
 * ブロックを指定角度で回転
 */
export function rotateBlock(block: BlockShape, rotation: number): RotatedBlock {
  const times = rotation / 60; // 0,1,2,3,4,5
  const rotatedCells = block.cells.map(cell => hexRotate(cell, times));
  return { base: block, rotation, cells: rotatedCells };
}

/**
 * ブロック配置の有効性チェック
 *
 * 条件:
 * 1. ブロックの全セルがグリッド内に存在する
 * 2. ブロックの全セルが空（empty）である
 * 3. ブロックの少なくとも1セルが自陣に隣接している
 *
 * @returns 配置可能ならtrue
 */
export function canPlaceBlock(
  board: BoardState,
  block: RotatedBlock,
  position: HexCoord,
  player: PlayerColor,
): boolean {
  const absoluteCells = block.cells.map(c => hexAdd(c, position));

  for (const cell of absoluteCells) {
    const key = hexKey(cell);
    const boardCell = board.cells.get(key);

    // 条件1: グリッド内に存在するか
    if (!boardCell) return false;

    // 条件2: 空マスか
    if (boardCell.owner !== 'empty') return false;
  }

  // 条件3: 少なくとも1セルが自陣に隣接
  let adjacentToOwn = false;
  for (const cell of absoluteCells) {
    const neighbors = hexNeighbors(cell);
    for (const neighbor of neighbors) {
      const nKey = hexKey(neighbor);
      const nCell = board.cells.get(nKey);
      if (nCell && nCell.owner === player) {
        // ただし、今回配置するブロック自身のセルは除外
        const isPartOfBlock = absoluteCells.some(
          bc => bc.q === neighbor.q && bc.r === neighbor.r
        );
        if (!isPartOfBlock) {
          adjacentToOwn = true;
          break;
        }
      }
    }
    if (adjacentToOwn) break;
  }

  return adjacentToOwn;
}

/**
 * 現在のプレイヤーが配置可能な全手を列挙
 * AI探索で使用
 */
export function getAllValidPlacements(
  board: BoardState,
  blocks: BlockShape[],
  player: PlayerColor,
): Array<{ block: RotatedBlock; position: HexCoord }> {
  const placements: Array<{ block: RotatedBlock; position: HexCoord }> = [];

  for (const block of blocks) {
    // 6回転分チェック
    for (let rot = 0; rot < 360; rot += 60) {
      const rotated = rotateBlock(block, rot);

      // グリッド上の全空セルについて配置を試行
      for (const [, cell] of board.cells) {
        if (cell.owner === 'empty') {
          if (canPlaceBlock(board, rotated, cell.coord, player)) {
            placements.push({ block: rotated, position: cell.coord });
          }
        }
      }
    }
  }

  return placements;
}

/**
 * ブロックを配置し、ボードを更新
 * ※反転処理はcapture.tsで行う
 * @returns 配置されたセルの座標配列
 */
export function placeBlock(
  board: BoardState,
  block: RotatedBlock,
  position: HexCoord,
  player: PlayerColor,
): HexCoord[] {
  const absoluteCells = block.cells.map(c => hexAdd(c, position));

  // 全セルのjustPlaced/justCapturedフラグをリセット
  for (const cell of board.cells.values()) {
    cell.justPlaced = false;
    cell.justCaptured = false;
  }

  // ブロック配置
  for (const coord of absoluteCells) {
    const key = hexKey(coord);
    const cell = board.cells.get(key)!;
    cell.owner = player;
    cell.justPlaced = true;
  }

  return absoluteCells;
}
```

### 5.4 反転ロジック (`src/engine/capture.ts`)

```typescript
import { BoardState, PlayerColor } from '../types/board';
import { HexCoord, HexKey } from '../types/hex';
import { hexKey, hexNeighbors } from './hex-math';
import { recountBoard } from './board';

/**
 * 反転判定アルゴリズム（リバーシ方式・6方向）
 *
 * ルール:
 * 配置されたブロックの各セルから6方向に走査し、
 * 相手色のセルが連続した後に自色のセルがあれば、
 * その間の相手色セルを全て反転する。
 *
 * 擬似コード:
 * ```
 * for each placed_cell in newly_placed_cells:
 *   for each direction in 6_hex_directions:
 *     candidates = []
 *     current = placed_cell + direction
 *     while current is on board AND current is opponent_color:
 *       candidates.push(current)
 *       current = current + direction
 *     if current is on board AND current is my_color AND candidates.length > 0:
 *       flip all candidates to my_color
 * ```
 *
 * @param board 現在のボード状態（破壊的に更新される）
 * @param placedCells 今回配置されたセル座標
 * @param player 配置プレイヤー
 * @returns 反転されたセルの座標配列（アニメーション用）
 */
export function performCapture(
  board: BoardState,
  placedCells: HexCoord[],
  player: PlayerColor,
): HexCoord[] {
  const opponent: PlayerColor = player === 'red' ? 'blue' : 'red';
  const capturedSet = new Set<HexKey>();
  const capturedCoords: HexCoord[] = [];

  // ヘックスの6方向ベクトル
  const directions: HexCoord[] = [
    { q: +1, r:  0 },
    { q: +1, r: -1 },
    { q:  0, r: -1 },
    { q: -1, r:  0 },
    { q: -1, r: +1 },
    { q:  0, r: +1 },
  ];

  for (const origin of placedCells) {
    for (const dir of directions) {
      const candidates: HexCoord[] = [];
      let current: HexCoord = { q: origin.q + dir.q, r: origin.r + dir.r };

      // 相手色が続く限り候補に追加
      while (true) {
        const key = hexKey(current);
        const cell = board.cells.get(key);

        if (!cell) break;              // グリッド外
        if (cell.owner === 'empty') break;  // 空マス → 挟めない
        if (cell.owner === player) {
          // 自色に到達 → 候補を全て反転
          for (const cand of candidates) {
            const candKey = hexKey(cand);
            if (!capturedSet.has(candKey)) {
              capturedSet.add(candKey);
              capturedCoords.push(cand);
            }
          }
          break;
        }
        // 相手色 → 候補に追加
        candidates.push(current);
        current = { q: current.q + dir.q, r: current.r + dir.r };
      }
    }
  }

  // 反転を実行
  for (const coord of capturedCoords) {
    const key = hexKey(coord);
    const cell = board.cells.get(key)!;
    cell.owner = player;
    cell.justCaptured = true;
  }

  // セル数を再計算
  recountBoard(board);

  return capturedCoords;
}
```

### 5.5 AI対戦 (`src/engine/ai.ts`)

```typescript
import { BoardState, PlayerColor } from '../types/board';
import { BlockShape } from '../types/block';
import { HexCoord } from '../types/hex';
import { RotatedBlock } from '../types/block';
import { AIConfig, AI_CONFIGS } from '../types/player';
import { AIDifficulty } from '../types/game';
import { getAllValidPlacements } from './placement';
import { placeBlock } from './placement';
import { performCapture } from './capture';
import { cloneBoard, recountBoard } from './board';
import { hexDistance } from './hex-math';

interface AIMove {
  block: RotatedBlock;
  position: HexCoord;
  score: number;
}

/**
 * AIの手を決定する
 *
 * アルゴリズム: ミニマックス法 + アルファベータ枝刈り
 *
 * 擬似コード:
 * ```
 * function bestMove(board, depth, player, blocks):
 *   moves = getAllValidPlacements(board, blocks, player)
 *   if moves is empty: return PASS
 *
 *   bestScore = -Infinity
 *   bestMove = null
 *
 *   for each move in moves:
 *     newBoard = clone(board)
 *     placed = placeBlock(newBoard, move.block, move.position, player)
 *     performCapture(newBoard, placed, player)
 *
 *     if depth <= 1:
 *       score = evaluate(newBoard, player)
 *     else:
 *       score = -bestMove(newBoard, depth-1, opponent, opponentBlocks).score
 *
 *     if score > bestScore:
 *       bestScore = score
 *       bestMove = move
 *
 *   return { ...bestMove, score: bestScore }
 * ```
 *
 * @returns 最善手（nullの場合はパス）
 */
export function findBestMove(
  board: BoardState,
  playerBlocks: BlockShape[],
  opponentBlocks: BlockShape[],
  player: PlayerColor,
  difficulty: AIDifficulty,
): AIMove | null {
  const config = AI_CONFIGS[difficulty];
  const placements = getAllValidPlacements(board, playerBlocks, player);

  if (placements.length === 0) return null; // パス

  // Easy: ランダム要素を加える（上位3手からランダム選択）
  if (difficulty === 'easy') {
    const scored = placements.map(p => {
      const testBoard = cloneBoard(board);
      const placed = placeBlock(testBoard, p.block, p.position, player);
      performCapture(testBoard, placed, player);
      return { ...p, score: evaluateBoard(testBoard, player, config) };
    });
    scored.sort((a, b) => b.score - a.score);
    const topN = scored.slice(0, Math.min(3, scored.length));
    const chosen = topN[Math.floor(Math.random() * topN.length)];
    return chosen;
  }

  // Normal以上: ミニマックス + アルファベータ
  let bestMove: AIMove | null = null;
  let alpha = -Infinity;
  const beta = Infinity;

  for (const placement of placements) {
    const testBoard = cloneBoard(board);
    const placed = placeBlock(testBoard, placement.block, placement.position, player);
    performCapture(testBoard, placed, player);

    const score = -alphabeta(
      testBoard,
      config.depth - 1,
      -beta,
      -alpha,
      player === 'red' ? 'blue' : 'red',
      player === 'red' ? opponentBlocks : playerBlocks,
      player === 'red' ? playerBlocks : opponentBlocks,
      config,
    );

    if (score > alpha) {
      alpha = score;
      bestMove = { ...placement, score };
    }
  }

  return bestMove;
}

/**
 * アルファベータ枝刈り
 */
function alphabeta(
  board: BoardState,
  depth: number,
  alpha: number,
  beta: number,
  currentPlayer: PlayerColor,
  currentBlocks: BlockShape[],
  opponentBlocks: BlockShape[],
  config: AIConfig,
): number {
  if (depth === 0 || board.emptyCount === 0) {
    return evaluateBoard(board, currentPlayer, config);
  }

  const placements = getAllValidPlacements(board, currentBlocks, currentPlayer);
  if (placements.length === 0) {
    // パス → 相手のターン
    return -alphabeta(
      board, depth - 1, -beta, -alpha,
      currentPlayer === 'red' ? 'blue' : 'red',
      opponentBlocks, currentBlocks, config,
    );
  }

  for (const placement of placements) {
    const testBoard = cloneBoard(board);
    const placed = placeBlock(testBoard, placement.block, placement.position, currentPlayer);
    performCapture(testBoard, placed, currentPlayer);

    const score = -alphabeta(
      testBoard, depth - 1, -beta, -alpha,
      currentPlayer === 'red' ? 'blue' : 'red',
      opponentBlocks, currentBlocks, config,
    );

    if (score >= beta) return beta; // ベータカットオフ
    if (score > alpha) alpha = score;
  }

  return alpha;
}

/**
 * 盤面評価関数
 *
 * 評価項目:
 * 1. territory: 自陣セル数 - 相手セル数
 * 2. corner: グリッド端セルの所有数（取りにくい＝価値が高い）
 * 3. mobility: 自分の配置可能手数
 * 4. opponentMobility: 相手の配置可能手数を減らす
 * 5. center: 中央寄りセルの所有数（序盤の展開力）
 */
function evaluateBoard(
  board: BoardState,
  player: PlayerColor,
  config: AIConfig,
): number {
  const opponent: PlayerColor = player === 'red' ? 'blue' : 'red';
  const w = config.weights;

  // 1. 領地差
  const myCount = player === 'red' ? board.redCount : board.blueCount;
  const opCount = player === 'red' ? board.blueCount : board.redCount;
  const territory = myCount - opCount;

  // 2. 角（端）の評価
  let cornerScore = 0;
  for (const cell of board.cells.values()) {
    const dist = hexDistance(cell.coord, { q: 0, r: 0 });
    if (dist === board.radius) { // 最外周
      if (cell.owner === player) cornerScore += 1;
      else if (cell.owner === opponent) cornerScore -= 1;
    }
  }

  // 3. 中央寄り評価
  let centerScore = 0;
  for (const cell of board.cells.values()) {
    if (cell.owner === player) {
      const dist = hexDistance(cell.coord, { q: 0, r: 0 });
      centerScore += (board.radius - dist); // 中央ほど高スコア
    }
  }

  // mobility は計算コストが高いため depth <= 1 でのみ計算
  // ここでは簡易的に領地差と角のみで返す
  return (
    w.territory * territory +
    w.corner * cornerScore +
    w.center * centerScore
  );
}
```

### 5.6 ゲームループ (`src/engine/game-loop.ts`)

```typescript
import { GameState, GamePhase, TurnAction, GameResult, GameMode, AIDifficulty } from '../types/game';
import { PlayerColor, BoardState } from '../types/board';
import { BlockId, BlockShape, RotatedBlock } from '../types/block';
import { HexCoord } from '../types/hex';
import { createInitialBoard } from './board';
import { canPlaceBlock, placeBlock, rotateBlock, getAllValidPlacements } from './placement';
import { performCapture } from './capture';
import { findBestMove } from './ai';
import { INITIAL_BLOCKS, getBlockById } from '../constants/blocks';

/**
 * 新規ゲーム作成
 */
export function createGame(mode: GameMode, difficulty: AIDifficulty | null): GameState {
  const initialBlockIds: BlockId[] = ['B01', 'B02', 'B03', 'B04', 'B05'];

  return {
    mode,
    aiDifficulty: difficulty,
    phase: 'selecting_block',
    board: createInitialBoard(),
    currentPlayer: 'red',
    redBlocks: [...initialBlockIds],
    blueBlocks: [...initialBlockIds],
    selectedBlock: null,
    selectedRotation: 0,
    history: [],
    consecutivePasses: 0,
    startedAt: Date.now(),
    result: null,
  };
}

/**
 * ブロック選択
 */
export function selectBlock(state: GameState, blockId: BlockId): void {
  state.selectedBlock = blockId;
  state.selectedRotation = 0;
  state.phase = 'placing_block';
}

/**
 * ブロック回転（60度単位）
 */
export function rotateSelected(state: GameState, direction: 1 | -1): void {
  state.selectedRotation = (state.selectedRotation + direction * 60 + 360) % 360;
}

/**
 * ブロック配置実行
 * @returns { placedCells, capturedCells } アニメーション用
 */
export function executePlace(
  state: GameState,
  position: HexCoord,
): { placedCells: HexCoord[]; capturedCells: HexCoord[] } | null {
  if (!state.selectedBlock) return null;

  const block = getBlockById(state.selectedBlock);
  if (!block) return null;

  const rotated = rotateBlock(block, state.selectedRotation);

  if (!canPlaceBlock(state.board, rotated, position, state.currentPlayer)) {
    return null; // 配置不可
  }

  // 配置実行
  const placedCells = placeBlock(state.board, rotated, position, state.currentPlayer);

  // 反転実行
  const capturedCells = performCapture(state.board, placedCells, state.currentPlayer);

  // 履歴記録
  const action: TurnAction = {
    turnNumber: state.history.length + 1,
    player: state.currentPlayer,
    blockId: state.selectedBlock,
    position,
    rotation: state.selectedRotation,
    capturedCells,
    redCountAfter: state.board.redCount,
    blueCountAfter: state.board.blueCount,
    isPass: false,
    timestamp: Date.now(),
  };
  state.history.push(action);

  // リセット
  state.selectedBlock = null;
  state.selectedRotation = 0;
  state.consecutivePasses = 0;

  // アニメーションフェーズへ
  state.phase = 'animating_capture';

  return { placedCells, capturedCells };
}

/**
 * パス実行
 */
export function executePass(state: GameState): void {
  const action: TurnAction = {
    turnNumber: state.history.length + 1,
    player: state.currentPlayer,
    blockId: 'B01', // ダミー
    position: { q: 0, r: 0 },
    rotation: 0,
    capturedCells: [],
    redCountAfter: state.board.redCount,
    blueCountAfter: state.board.blueCount,
    isPass: true,
    timestamp: Date.now(),
  };
  state.history.push(action);
  state.consecutivePasses++;
}

/**
 * ターン終了処理
 * アニメーション完了後に呼ぶ
 */
export function endTurn(state: GameState): void {
  // 終了判定
  if (state.board.emptyCount === 0 || state.consecutivePasses >= 2) {
    finishGame(state);
    return;
  }

  // ターン交代
  state.currentPlayer = state.currentPlayer === 'red' ? 'blue' : 'red';

  // AI思考フェーズへ
  if (state.mode === 'pve' && state.currentPlayer === 'blue') {
    state.phase = 'ai_thinking';
  } else {
    state.phase = 'selecting_block';
  }
}

/**
 * ゲーム終了処理
 */
function finishGame(state: GameState): void {
  state.phase = 'game_over';

  // 最大逆転計算
  let maxSwing = 0;
  let prevDiff = 0;
  for (const action of state.history) {
    const diff = action.redCountAfter - action.blueCountAfter;
    const swing = Math.abs(diff - prevDiff);
    if (swing > maxSwing) maxSwing = swing;
    prevDiff = diff;
  }

  // 逆転判定（途中で負けていた側が最終的に勝つ）
  let hadComeback = false;
  if (state.history.length >= 4) {
    const mid = Math.floor(state.history.length / 2);
    const midAction = state.history[mid];
    const midDiff = midAction.redCountAfter - midAction.blueCountAfter;
    const finalDiff = state.board.redCount - state.board.blueCount;
    if ((midDiff > 0 && finalDiff < 0) || (midDiff < 0 && finalDiff > 0)) {
      hadComeback = true;
    }
  }

  const winner: PlayerColor | null =
    state.board.redCount > state.board.blueCount ? 'red' :
    state.board.blueCount > state.board.redCount ? 'blue' : null;

  state.result = {
    winner,
    redCount: state.board.redCount,
    blueCount: state.board.blueCount,
    totalTurns: state.history.length,
    biggestSwing: maxSwing,
    hadComeback,
    durationSeconds: Math.floor((Date.now() - state.startedAt) / 1000),
    unlockedBlocks: [], // 別途計算
  };
}
```

### 5.7 デイリーパズル生成 (`src/engine/daily-generator.ts`)

```typescript
import { DailyPuzzle } from '../types/daily';
import { BoardState, CellOwner } from '../types/board';
import { HexCoord, HexKey } from '../types/hex';
import { generateHexGrid, hexKey } from './hex-math';

/**
 * 日付からシード値を生成（決定的ランダム）
 * 同じ日付なら全ユーザーで同じパズルが出る
 */
function dateToSeed(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

/** シード付き疑似乱数（Mulberry32） */
function mulberry32(seed: number): () => number {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/**
 * デイリーパズル生成
 *
 * 手順:
 * 1. 日付からシードを生成
 * 2. シードで盤面をランダム生成（赤やや不利の状態）
 * 3. 正解手順を逆算（3手で赤が勝つ配置）
 * 4. 検証: 正解手順が確実に勝利することを確認
 *
 * @param dateStr YYYY-MM-DD形式
 */
export function generateDailyPuzzle(dateStr: string): DailyPuzzle {
  const seed = dateToSeed(dateStr);
  const rng = mulberry32(seed);
  const radius = 3;
  const allCoords = generateHexGrid(radius);

  // 盤面生成: ランダムに赤・青・空を配置
  // 赤がやや不利（赤10 vs 青13 vs 空14 程度）
  const cells = new Map<HexKey, any>();
  const owners: CellOwner[] = [];

  for (let i = 0; i < allCoords.length; i++) {
    const r = rng();
    let owner: CellOwner;
    if (r < 0.27) owner = 'red';
    else if (r < 0.62) owner = 'blue';
    else owner = 'empty';
    owners.push(owner);
  }

  for (let i = 0; i < allCoords.length; i++) {
    const coord = allCoords[i];
    const key = hexKey(coord);
    cells.set(key, {
      coord,
      owner: owners[i],
      justCaptured: false,
      justPlaced: false,
    });
  }

  // 使用可能ブロック3つをランダム選択
  const blockPool = ['B01', 'B02', 'B03', 'B04', 'B05'] as const;
  const available = [
    blockPool[Math.floor(rng() * blockPool.length)],
    blockPool[Math.floor(rng() * blockPool.length)],
    blockPool[Math.floor(rng() * blockPool.length)],
  ];

  // 難易度 = 日付のハッシュ % 5 + 1
  const difficulty = (seed % 5) + 1;

  const hints = [
    '左上の隅を狙ってみよう',
    '相手を挟む配置を探そう',
    'L字ブロックが鍵になるかも',
    '中央を制圧しよう',
    '端から攻めてみよう',
  ];

  return {
    id: dateStr,
    initialBoard: {
      cells,
      radius,
      redCount: owners.filter(o => o === 'red').length,
      blueCount: owners.filter(o => o === 'blue').length,
      emptyCount: owners.filter(o => o === 'empty').length,
    },
    playerColor: 'red',
    availableBlocks: available,
    solutions: [], // 実際にはソルバーで事前計算
    maxMoves: 3,
    difficulty: Math.min(5, difficulty) as 1 | 2 | 3 | 4 | 5,
    hint: hints[seed % hints.length],
  };
}
```

---

## 6. ブロック形状データ (`src/constants/blocks.ts`)

全15種のブロック形状をaxial座標で定義。原点`(0,0)`を基準とし、配置時にオフセットする。

```
ヘックスのレイアウト参考（flat-top）:
    (0,-1) (1,-1)
  (-1,0) (0,0) (1,0)
    (-1,1) (0,1)
```

```typescript
import { BlockShape, BlockId } from '../types/block';

/** 全ブロック定義 */
export const ALL_BLOCKS: readonly BlockShape[] = [
  // ═══ 初期ブロック（5種・アンロック不要） ═══

  {
    id: 'B01',
    name: '単体',
    nameEn: 'Single',
    cells: [{ q: 0, r: 0 }],
    size: 1,
    rarity: 'common',
    unlockWins: 0,
    color: '#4CAF50',
    description: '1マスだけ。確実に置ける万能ブロック。',
  },
  {
    id: 'B02',
    name: '双子',
    nameEn: 'Twin',
    cells: [{ q: 0, r: 0 }, { q: 1, r: 0 }],
    size: 2,
    rarity: 'common',
    unlockWins: 0,
    color: '#2196F3',
    description: '2マス横並び。序盤の拡張に最適。',
  },
  {
    id: 'B03',
    name: '直線',
    nameEn: 'Line',
    cells: [{ q: -1, r: 0 }, { q: 0, r: 0 }, { q: 1, r: 0 }],
    size: 3,
    rarity: 'common',
    unlockWins: 0,
    color: '#FF9800',
    description: '3マス直線。長く伸ばして挟み込め。',
  },
  {
    id: 'B04',
    name: 'L字',
    nameEn: 'L-Shape',
    cells: [{ q: 0, r: 0 }, { q: 1, r: 0 }, { q: 0, r: 1 }],
    size: 3,
    rarity: 'common',
    unlockWins: 0,
    color: '#9C27B0',
    description: 'L字型。角を曲がって配置できる。',
  },
  {
    id: 'B05',
    name: 'くの字',
    nameEn: 'V-Shape',
    cells: [{ q: 0, r: -1 }, { q: 0, r: 0 }, { q: -1, r: 1 }],
    size: 3,
    rarity: 'common',
    unlockWins: 0,
    color: '#F44336',
    description: 'くの字型。ジグザグに陣地を広げる。',
  },

  // ═══ Tier1 アンロックブロック（5種・5勝で解放） ═══

  {
    id: 'B06',
    name: 'Z字',
    nameEn: 'Z-Shape',
    cells: [{ q: 0, r: -1 }, { q: 0, r: 0 }, { q: 1, r: 0 }, { q: 1, r: 1 }],
    size: 4,
    rarity: 'rare',
    unlockWins: 5,
    color: '#00BCD4',
    description: 'Z字型4マス。大きく陣地を広げる。',
  },
  {
    id: 'B07',
    name: 'S字',
    nameEn: 'S-Shape',
    cells: [{ q: 1, r: -1 }, { q: 0, r: 0 }, { q: 1, r: 0 }, { q: 0, r: 1 }],
    size: 4,
    rarity: 'rare',
    unlockWins: 5,
    color: '#E91E63',
    description: 'S字型4マス。Z字の鏡像。',
  },
  {
    id: 'B08',
    name: '三角',
    nameEn: 'Triangle',
    cells: [{ q: 0, r: -1 }, { q: -1, r: 0 }, { q: 0, r: 0 }, { q: 1, r: 0 }],
    size: 4,
    rarity: 'rare',
    unlockWins: 7,
    color: '#FF5722',
    description: '三角形4マス。面で押し広げる。',
  },
  {
    id: 'B09',
    name: '四角',
    nameEn: 'Diamond',
    cells: [
      { q: 0, r: -1 }, { q: 1, r: -1 },
      { q: 0, r: 0 },  { q: 1, r: 0 },
    ],
    size: 4,
    rarity: 'rare',
    unlockWins: 10,
    color: '#795548',
    description: 'ひし形4マス。密集した陣地を作る。',
  },
  {
    id: 'B10',
    name: '矢印',
    nameEn: 'Arrow',
    cells: [
      { q: 0, r: -1 },
      { q: -1, r: 0 }, { q: 0, r: 0 }, { q: 1, r: 0 },
      { q: 0, r: 1 },
    ],
    size: 5,
    rarity: 'rare',
    unlockWins: 12,
    color: '#607D8B',
    description: '十字型5マス。全方向に影響力を持つ。',
  },

  // ═══ Tier2 アンロックブロック（5種・15勝以上で解放） ═══

  {
    id: 'B11',
    name: '大L字',
    nameEn: 'Big L',
    cells: [
      { q: 0, r: -1 }, { q: 0, r: 0 },
      { q: 0, r: 1 },  { q: 1, r: 1 },
    ],
    size: 4,
    rarity: 'epic',
    unlockWins: 15,
    color: '#3F51B5',
    description: '大きなL字。遠くまで手が届く。',
  },
  {
    id: 'B12',
    name: 'T字',
    nameEn: 'T-Shape',
    cells: [
      { q: -1, r: 0 }, { q: 0, r: 0 }, { q: 1, r: 0 },
      { q: 0, r: 1 },
    ],
    size: 4,
    rarity: 'epic',
    unlockWins: 18,
    color: '#009688',
    description: 'T字型。攻めと守りの両方に使える。',
  },
  {
    id: 'B13',
    name: '稲妻',
    nameEn: 'Lightning',
    cells: [
      { q: -1, r: 0 }, { q: 0, r: 0 },
      { q: 0, r: 1 },  { q: 1, r: 1 },
      { q: 1, r: 2 },
    ],
    size: 5,
    rarity: 'epic',
    unlockWins: 20,
    color: '#FFC107',
    description: '稲妻型5マス。長く蛇行して配置。',
  },
  {
    id: 'B14',
    name: '花',
    nameEn: 'Flower',
    cells: [
      { q: 0, r: -1 }, { q: 1, r: -1 },
      { q: -1, r: 0 }, { q: 0, r: 0 },  { q: 1, r: 0 },
      { q: -1, r: 1 }, { q: 0, r: 1 },
    ],
    size: 7,
    rarity: 'legendary',
    unlockWins: 25,
    color: '#E040FB',
    description: '花型7マス。一撃で盤面を制圧する最強ブロック。',
  },
  {
    id: 'B15',
    name: 'リング',
    nameEn: 'Ring',
    cells: [
      { q: 0, r: -1 }, { q: 1, r: -1 },
      { q: -1, r: 0 },                   { q: 1, r: 0 },
      { q: -1, r: 1 }, { q: 0, r: 1 },
    ],
    size: 6,
    rarity: 'legendary',
    unlockWins: 30,
    color: '#FFD700',
    description: 'リング型6マス。中央を空けて囲い込む戦術用。',
  },
] as const;

/** 初期ブロック（ゲーム開始時に使用可能） */
export const INITIAL_BLOCKS: readonly BlockShape[] = ALL_BLOCKS.filter(b => b.unlockWins === 0);

/** IDからブロックを取得 */
export function getBlockById(id: BlockId): BlockShape | undefined {
  return ALL_BLOCKS.find(b => b.id === id);
}

/** 勝利数に応じたアンロック可能ブロック */
export function getUnlockableBlocks(wins: number): BlockShape[] {
  return ALL_BLOCKS.filter(b => b.unlockWins > 0 && b.unlockWins <= wins);
}
```

### ブロック形状ビジュアル図

```
B01 単体 (1マス)        B02 双子 (2マス)        B03 直線 (3マス)
    ⬡                     ⬡ ⬡                  ⬡ ⬡ ⬡

B04 L字 (3マス)         B05 くの字 (3マス)
    ⬡ ⬡                     ⬡
    ⬡                     ⬡
                         ⬡

B06 Z字 (4マス)         B07 S字 (4マス)         B08 三角 (4マス)
    ⬡                      ⬡                      ⬡
    ⬡ ⬡                  ⬡ ⬡                   ⬡ ⬡ ⬡
       ⬡                 ⬡

B09 四角 (4マス)        B10 矢印/十字 (5マス)
    ⬡ ⬡                     ⬡
    ⬡ ⬡                  ⬡ ⬡ ⬡
                             ⬡

B11 大L字 (4マス)       B12 T字 (4マス)
    ⬡                   ⬡ ⬡ ⬡
    ⬡                      ⬡
    ⬡ ⬡

B13 稲妻 (5マス)        B14 花 (7マス)          B15 リング (6マス)
 ⬡ ⬡                     ⬡ ⬡                    ⬡ ⬡
    ⬡ ⬡                 ⬡ ⬡ ⬡                  ⬡   ⬡
       ⬡                 ⬡ ⬡                    ⬡ ⬡
```

---

## 7. ヘックスグリッド描画仕様 (`src/components/HexGrid.tsx`)

### 7.1 座標変換（Axial → SVG PixelCoord）

```typescript
/**
 * ヘキサゴンのSVG描画仕様
 *
 * ヘックスの向き: flat-top（上辺が水平）
 * サイズ: 半径 HEX_SIZE = (画面幅 - パディング) / (3 * radius + 2) で自動計算
 *
 * 1つのヘキサゴンの頂点座標（中心を(cx, cy)として）:
 * for i in 0..5:
 *   angle = 60 * i (degrees)
 *   x = cx + size * cos(angle)
 *   y = cy + size * sin(angle)
 */

import { Dimensions } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_PADDING = 20;
const GRID_RADIUS = 3;

/** ヘックスセルの半径（自動計算） */
export const HEX_SIZE = Math.floor(
  (SCREEN_WIDTH - GRID_PADDING * 2) / (3 * GRID_RADIUS + 2)
);

/** ヘキサゴンの6頂点を生成（flat-top） */
export function hexCorners(cx: number, cy: number, size: number): string {
  const points: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angleDeg = 60 * i;
    const angleRad = (Math.PI / 180) * angleDeg;
    const x = cx + size * Math.cos(angleRad);
    const y = cy + size * Math.sin(angleRad);
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return points.join(' ');
}

/**
 * Axial座標 → SVGのピクセル座標
 * グリッド全体をSVG viewBox内に中央配置する
 */
export function axialToSvgPixel(
  q: number,
  r: number,
  size: number,
  centerX: number,
  centerY: number,
): { x: number; y: number } {
  const x = centerX + size * (3/2 * q);
  const y = centerY + size * (Math.sqrt(3)/2 * q + Math.sqrt(3) * r);
  return { x, y };
}
```

### 7.2 HexGrid コンポーネント構造

```tsx
// src/components/HexGrid.tsx

import React from 'react';
import { View, Dimensions } from 'react-native';
import Svg, { Polygon, Text as SvgText, G } from 'react-native-svg';
import { BoardState, CellState, PlayerColor } from '../types/board';
import { HexCoord } from '../types/hex';
import { axialToSvgPixel, hexCorners, HEX_SIZE } from './hex-layout';
import HexCell from './HexCell';

interface HexGridProps {
  board: BoardState;
  validPlacements: Set<string>; // HexKey set
  previewCells: HexCoord[] | null;
  onCellPress: (coord: HexCoord) => void;
  currentPlayer: PlayerColor;
}

/**
 * SVGベースのヘックスグリッド
 *
 * viewBox計算:
 * - 幅 = HEX_SIZE * (3 * radius + 1) * 2
 * - 高さ = HEX_SIZE * sqrt(3) * (2 * radius + 1)
 * - 中心 = (viewBoxWidth/2, viewBoxHeight/2)
 */
export default function HexGrid({
  board,
  validPlacements,
  previewCells,
  onCellPress,
  currentPlayer,
}: HexGridProps) {
  const size = HEX_SIZE;
  const vbWidth = size * (3 * board.radius + 2) * 2;
  const vbHeight = size * Math.sqrt(3) * (2 * board.radius + 1) * 1.1;
  const cx = vbWidth / 2;
  const cy = vbHeight / 2;

  const cells: JSX.Element[] = [];

  for (const [key, cell] of board.cells) {
    const { x, y } = axialToSvgPixel(cell.coord.q, cell.coord.r, size, cx, cy);
    const isValid = validPlacements.has(key);
    const isPreview = previewCells?.some(
      p => p.q === cell.coord.q && p.r === cell.coord.r
    ) ?? false;

    cells.push(
      <HexCell
        key={key}
        cx={x}
        cy={y}
        size={size * 0.95} // 隙間用に5%縮小
        cell={cell}
        isValidPlacement={isValid}
        isPreview={isPreview}
        previewColor={currentPlayer}
        onPress={() => onCellPress(cell.coord)}
      />
    );
  }

  return (
    <View style={{ width: '100%', aspectRatio: vbWidth / vbHeight }}>
      <Svg viewBox={`0 0 ${vbWidth} ${vbHeight}`} width="100%" height="100%">
        {cells}
      </Svg>
    </View>
  );
}
```

### 7.3 HexCell コンポーネント

```tsx
// src/components/HexCell.tsx

import React from 'react';
import { Polygon, G } from 'react-native-svg';
import { CellState, PlayerColor } from '../types/board';
import { hexCorners } from './hex-layout';

interface HexCellProps {
  cx: number;
  cy: number;
  size: number;
  cell: CellState;
  isValidPlacement: boolean;
  isPreview: boolean;
  previewColor: PlayerColor;
  onPress: () => void;
}

/** セルの色マッピング */
const CELL_COLORS = {
  empty: '#E8E8E8',
  red: '#EF4444',
  blue: '#3B82F6',
  validHighlight: '#FBBF24',       // 配置可能（黄色ハイライト）
  preview: { red: '#FCA5A5', blue: '#93C5FD' }, // プレビュー（半透明）
  captured: { red: '#DC2626', blue: '#2563EB' }, // 反転直後（濃い色）
} as const;

export default function HexCell({
  cx, cy, size, cell,
  isValidPlacement, isPreview, previewColor,
  onPress,
}: HexCellProps) {
  let fill: string;
  let strokeWidth = 1;
  let stroke = '#BDBDBD';

  if (isPreview) {
    fill = CELL_COLORS.preview[previewColor];
    strokeWidth = 2;
    stroke = previewColor === 'red' ? '#EF4444' : '#3B82F6';
  } else if (cell.justCaptured) {
    fill = CELL_COLORS.captured[cell.owner as PlayerColor];
    strokeWidth = 2;
    stroke = '#FFD700';
  } else if (cell.justPlaced) {
    fill = CELL_COLORS[cell.owner as PlayerColor];
    strokeWidth = 2;
    stroke = '#FFFFFF';
  } else if (cell.owner !== 'empty') {
    fill = CELL_COLORS[cell.owner];
  } else if (isValidPlacement) {
    fill = CELL_COLORS.validHighlight;
  } else {
    fill = CELL_COLORS.empty;
  }

  const points = hexCorners(cx, cy, size);

  return (
    <G onPress={onPress}>
      <Polygon
        points={points}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    </G>
  );
}
```

### 7.4 カラーパレット (`src/constants/colors.ts`)

```typescript
export const COLORS = {
  // プレイヤー色
  red: {
    primary: '#EF4444',
    light: '#FCA5A5',
    dark: '#DC2626',
    bg: '#FEF2F2',
  },
  blue: {
    primary: '#3B82F6',
    light: '#93C5FD',
    dark: '#2563EB',
    bg: '#EFF6FF',
  },
  // UI色
  background: '#1A1A2E',
  surface: '#16213E',
  surfaceLight: '#0F3460',
  text: '#EAEAEA',
  textSecondary: '#A0A0A0',
  accent: '#E94560',
  gold: '#FFD700',
  // セル色
  cellEmpty: '#2D2D44',
  cellBorder: '#3D3D5C',
  validHighlight: '#FBBF24',
  // テーマ別（ショップ購入）
  themes: {
    default: { bg: '#1A1A2E', cell: '#2D2D44' },
    neon: { bg: '#0D0D0D', cell: '#1A1A1A' },
    pastel: { bg: '#FFF5E6', cell: '#FFE4C9' },
    earth: { bg: '#2C1A0E', cell: '#3D2B1F' },
    monochrome: { bg: '#1A1A1A', cell: '#333333' },
  },
} as const;
```

---

## 8. 収益化設計

### 8.1 AdMob広告

| 広告タイプ | 配置場所 | 頻度 | 広告ユニットID命名規則 |
|---|---|---|---|
| バナー (320x50) | メニュー下部 | 常時 | `ca-app-pub-XXX/menu_banner` |
| バナー (320x50) | ゲーム画面下部 | 常時 | `ca-app-pub-XXX/game_banner` |
| バナー (320x50) | 図鑑下部 | 常時 | `ca-app-pub-XXX/collection_banner` |
| インタースティシャル | リザルト画面 | 3ゲームに1回 | `ca-app-pub-XXX/result_interstitial` |
| リワード動画 | デイリーヒント解放 | ユーザー任意 | `ca-app-pub-XXX/daily_hint_reward` |
| リワード動画 | コイン獲得 | ユーザー任意 | `ca-app-pub-XXX/coin_reward` |
| リワード動画 | 敗北後リベンジ | ユーザー任意 | `ca-app-pub-XXX/revenge_reward` |

**実装詳細**:

```typescript
// src/utils/ad-manager.ts

import { InterstitialAd, RewardedAd, BannerAd, TestIds } from 'react-native-google-mobile-ads';

const AD_UNIT_IDS = __DEV__ ? {
  banner_menu: TestIds.BANNER,
  banner_game: TestIds.BANNER,
  interstitial_result: TestIds.INTERSTITIAL,
  reward_hint: TestIds.REWARDED,
  reward_coin: TestIds.REWARDED,
  reward_revenge: TestIds.REWARDED,
} : {
  banner_menu: 'ca-app-pub-XXXXXXXX/menu_banner',
  banner_game: 'ca-app-pub-XXXXXXXX/game_banner',
  interstitial_result: 'ca-app-pub-XXXXXXXX/result_interstitial',
  reward_hint: 'ca-app-pub-XXXXXXXX/daily_hint_reward',
  reward_coin: 'ca-app-pub-XXXXXXXX/coin_reward',
  reward_revenge: 'ca-app-pub-XXXXXXXX/revenge_reward',
};

/** インタースティシャル表示カウンター */
let gamesSinceLastAd = 0;
const INTERSTITIAL_INTERVAL = 3; // 3ゲームに1回

export function shouldShowInterstitial(): boolean {
  gamesSinceLastAd++;
  if (gamesSinceLastAd >= INTERSTITIAL_INTERVAL) {
    gamesSinceLastAd = 0;
    return true;
  }
  return false;
}
```

### 8.2 アプリ内課金 (IAP)

| 商品ID | 種類 | 価格 | 内容 |
|---|---|---|---|
| `color_conquest_ad_free` | Non-consumable | ¥480 | 広告完全非表示 |
| `color_conquest_gems_100` | Consumable | ¥120 | ジェム100個 |
| `color_conquest_gems_500` | Consumable | ¥480 | ジェム500個 (+50ボーナス) |
| `color_conquest_gems_1200` | Consumable | ¥960 | ジェム1200個 (+200ボーナス) |
| `color_conquest_starter_pack` | Non-consumable | ¥360 | ジェム200 + 全Tier1ブロック即解放 |

**通貨設計**:
- **コイン**: ゲーム内で獲得（勝利=50、敗北=10、デイリー=30）。テーマ購入に使用
- **ジェム**: プレミアム通貨。リアルマネーまたはリワード広告で獲得。特別スキン購入に使用

**テーマ価格**:
| テーマ | コイン価格 | ジェム価格 |
|---|---|---|
| ネオン | 500 | 50 |
| パステル | 500 | 50 |
| アース | 800 | 80 |
| モノクロ | 300 | 30 |

---

## 9. アプリ特有機能

### 9.1 ハプティクス (`src/hooks/useHaptics.ts`)

```typescript
import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '../store/settings-store';

export function useHaptics() {
  const hapticsEnabled = useSettingsStore(s => s.hapticsEnabled);

  return {
    /** ブロック選択時 */
    selectBlock: () => {
      if (!hapticsEnabled) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    /** ブロック配置確定時 */
    placeBlock: () => {
      if (!hapticsEnabled) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    },
    /** 反転1セルごと */
    captureCell: () => {
      if (!hapticsEnabled) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    /** 配置不可タップ */
    invalidPlacement: () => {
      if (!hapticsEnabled) return;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
    /** 勝利時 */
    victory: () => {
      if (!hapticsEnabled) return;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    /** 敗北時 */
    defeat: () => {
      if (!hapticsEnabled) return;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    },
  };
}
```

### 9.2 通知（デイリーリマインダー）

```typescript
// src/utils/notifications.ts

import * as Notifications from 'expo-notifications';

/**
 * デイリーパズルリマインダーを設定
 * 毎日指定時刻にローカル通知を送信
 */
export async function scheduleDailyReminder(hour: number, minute: number): Promise<void> {
  // 既存のリマインダーをキャンセル
  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '今日の詰め陣取り',
      body: '新しいパズルが届いています！連続記録を途切れさせないで！',
      sound: true,
      badge: 1,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

/**
 * 通知許可をリクエスト
 */
export async function requestNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}
```

### 9.3 Game Center / Google Play Games

```typescript
// src/utils/game-center.ts

import { Platform } from 'react-native';

/**
 * リーダーボード定義
 */
export const LEADERBOARDS = {
  /** 累計勝利数 */
  totalWins: Platform.select({
    ios: 'grp.color_conquest.total_wins',
    android: 'CgkI_total_wins', // Google Play Games ID
  }),
  /** デイリー最長ストリーク */
  dailyStreak: Platform.select({
    ios: 'grp.color_conquest.daily_streak',
    android: 'CgkI_daily_streak',
  }),
  /** Expert AI撃破数 */
  expertWins: Platform.select({
    ios: 'grp.color_conquest.expert_wins',
    android: 'CgkI_expert_wins',
  }),
} as const;

/**
 * 実績定義
 */
export const ACHIEVEMENTS = {
  /** 初勝利 */
  firstWin: { ios: 'color_conquest.first_win', android: 'CgkI_first_win' },
  /** 10勝 */
  tenWins: { ios: 'color_conquest.ten_wins', android: 'CgkI_ten_wins' },
  /** 50勝 */
  fiftyWins: { ios: 'color_conquest.fifty_wins', android: 'CgkI_fifty_wins' },
  /** Expert撃破 */
  beatExpert: { ios: 'color_conquest.beat_expert', android: 'CgkI_beat_expert' },
  /** 全ブロック解放 */
  allBlocks: { ios: 'color_conquest.all_blocks', android: 'CgkI_all_blocks' },
  /** デイリー7日連続 */
  weekStreak: { ios: 'color_conquest.week_streak', android: 'CgkI_week_streak' },
  /** デイリー30日連続 */
  monthStreak: { ios: 'color_conquest.month_streak', android: 'CgkI_month_streak' },
  /** 逆転勝利 */
  comeback: { ios: 'color_conquest.comeback', android: 'CgkI_comeback' },
  /** 全セル自色で勝利（完全制圧） */
  perfectWin: { ios: 'color_conquest.perfect_win', android: 'CgkI_perfect_win' },
} as const;
```

### 9.4 サウンド (`src/hooks/useSound.ts`)

```typescript
import { Audio } from 'expo-av';
import { useSettingsStore } from '../store/settings-store';
import { useRef, useEffect } from 'react';

const SOUNDS = {
  place: require('../assets/sounds/place.mp3'),
  capture: require('../assets/sounds/capture.mp3'),
  victory: require('../assets/sounds/victory.mp3'),
  defeat: require('../assets/sounds/defeat.mp3'),
} as const;

type SoundName = keyof typeof SOUNDS;

export function useSound() {
  const seVolume = useSettingsStore(s => s.seVolume);
  const soundRefs = useRef<Map<SoundName, Audio.Sound>>(new Map());

  // プリロード
  useEffect(() => {
    async function load() {
      for (const [name, source] of Object.entries(SOUNDS)) {
        const { sound } = await Audio.Sound.createAsync(source, { volume: seVolume });
        soundRefs.current.set(name as SoundName, sound);
      }
    }
    load();

    return () => {
      for (const sound of soundRefs.current.values()) {
        sound.unloadAsync();
      }
    };
  }, []);

  const play = async (name: SoundName) => {
    const sound = soundRefs.current.get(name);
    if (sound) {
      await sound.setVolumeAsync(seVolume);
      await sound.replayAsync();
    }
  };

  return { play };
}
```

---

## 10. データ永続化 (AsyncStorage)

### 10.1 キー設計

```typescript
// src/utils/storage.ts

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * AsyncStorageキー一覧
 * プレフィックス: @color_conquest/
 */
export const STORAGE_KEYS = {
  /** プレイヤープロフィール */
  PLAYER_PROFILE: '@color_conquest/player_profile',
  /** 設定 */
  SETTINGS: '@color_conquest/settings',
  /** デイリーパズル完了履歴 */
  DAILY_HISTORY: '@color_conquest/daily_history',
  /** 購入済みアイテムID配列 */
  PURCHASED_ITEMS: '@color_conquest/purchased_items',
  /** インタースティシャル広告カウンター */
  AD_COUNTER: '@color_conquest/ad_counter',
  /** チュートリアル完了フラグ */
  TUTORIAL_DONE: '@color_conquest/tutorial_done',
  /** 最終プレイ日時 */
  LAST_PLAYED: '@color_conquest/last_played',
  /** 進行中ゲームの自動セーブ */
  AUTO_SAVE: '@color_conquest/auto_save',
} as const;

// ─── ヘルパー関数 ───

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
```

### 10.2 保存データ構造

```typescript
/** @color_conquest/player_profile の構造 */
interface StoredPlayerProfile {
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
  winsPerDifficulty: { easy: number; normal: number; hard: number; expert: number };
  unlockedBlocks: string[];  // BlockId[]
  coins: number;
  gems: number;
  selectedTheme: string;
  dailyStreak: number;
  lastDailyCompleted: string | null;
  dailyCompletedDates: string[];
  gameCenterName: string | null;
  tutorialCompleted: boolean;
  firstLaunchDate: string;
  adFree: boolean;
}

/** @color_conquest/settings の構造 */
interface StoredSettings {
  bgmVolume: number;     // 0.0-1.0
  seVolume: number;       // 0.0-1.0
  hapticsEnabled: boolean;
  notificationEnabled: boolean;
  notificationHour: number;   // 0-23
  notificationMinute: number; // 0-59
}

/** @color_conquest/auto_save の構造 */
// GameState をそのままJSON化（Map→配列変換が必要）
interface StoredGameState {
  mode: string;
  aiDifficulty: string | null;
  currentPlayer: string;
  boardCells: Array<{ key: string; owner: string; q: number; r: number }>;
  redBlocks: string[];
  blueBlocks: string[];
  history: TurnAction[];
  consecutivePasses: number;
  startedAt: number;
}
```

### 10.3 自動セーブ・復帰

```typescript
/**
 * ゲーム自動セーブ（ターン終了ごと）
 * アプリがバックグラウンドに移行した際も保存
 */
export async function autoSaveGame(state: GameState): Promise<void> {
  // Map → 配列に変換してシリアライズ
  const boardCells = Array.from(state.board.cells.entries()).map(([key, cell]) => ({
    key,
    owner: cell.owner,
    q: cell.coord.q,
    r: cell.coord.r,
  }));

  const stored: StoredGameState = {
    mode: state.mode,
    aiDifficulty: state.aiDifficulty,
    currentPlayer: state.currentPlayer,
    boardCells,
    redBlocks: state.redBlocks,
    blueBlocks: state.blueBlocks,
    history: state.history,
    consecutivePasses: state.consecutivePasses,
    startedAt: state.startedAt,
  };

  await saveJSON(STORAGE_KEYS.AUTO_SAVE, stored);
}

/**
 * 自動セーブから復帰
 * メニュー画面で「続きから」ボタンを表示するかの判定にも使用
 */
export async function loadAutoSave(): Promise<StoredGameState | null> {
  return loadJSON<StoredGameState>(STORAGE_KEYS.AUTO_SAVE);
}

/**
 * ゲーム終了時にセーブデータを削除
 */
export async function clearAutoSave(): Promise<void> {
  await removeKey(STORAGE_KEYS.AUTO_SAVE);
}
```

---

## 11. シェア機能

### 11.1 最終盤面画像シェア

```typescript
// src/utils/share.ts

import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { GameResult } from '../types/game';
import { PlayerColor } from '../types/board';

/**
 * 最終盤面をキャプチャしてシェア
 *
 * @param gridRef HexGridコンポーネントのref
 * @param result ゲーム結果
 * @param playerColor 自分の色
 */
export async function shareGameResult(
  gridRef: React.RefObject<any>,
  result: GameResult,
  playerColor: PlayerColor,
): Promise<void> {
  try {
    // 盤面をPNG画像としてキャプチャ
    const uri = await captureRef(gridRef, {
      format: 'png',
      quality: 1.0,
      result: 'tmpfile',
    });

    // 勝敗テキスト
    const won = result.winner === playerColor;
    const statusText = result.winner === null ? '引き分け' : won ? '勝利' : '敗北';
    const emoji = won ? '🎉' : result.winner === null ? '🤝' : '😤';

    const message = [
      `${emoji} 色陣取りで${statusText}！`,
      `🔴 ${result.redCount} vs ${result.blueCount} 🔵`,
      result.hadComeback ? '🔥 逆転勝利！' : '',
      `${result.totalTurns}ターン / ${Math.floor(result.durationSeconds / 60)}分${result.durationSeconds % 60}秒`,
      '',
      '#ColorConquest #色陣取り',
      'https://apps.apple.com/app/id_PLACEHOLDER',
    ].filter(Boolean).join('\n');

    // シェアダイアログ表示
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: '色陣取りの結果をシェア',
        UTI: 'public.png', // iOS用
      });
    }
  } catch (error) {
    console.error('Share failed:', error);
  }
}
```

### 11.2 逆転リプレイ機能

```typescript
/**
 * 逆転リプレイ動画生成
 *
 * 条件: result.hadComeback === true の場合にリプレイボタンを表示
 *
 * 仕組み:
 * 1. history配列からターンを順番に再生
 * 2. 各ターンを0.5秒間隔で盤面に反映
 * 3. セル差のグラフを同時に描画（上部にスコアバー）
 * 4. 反転セルはハイライト表示
 * 5. 最終ターンはスローモーション（1.5秒）
 *
 * 実装: react-native-reanimated の withTiming で各ターンをアニメーション
 * シェア用: react-native-view-shot で各フレームをキャプチャ → 動画は非対応のため
 *           盤面のキーフレーム4枚（序盤・中盤・逆転ポイント・最終）を1枚の画像に合成
 */

export interface ReplayFrame {
  turnNumber: number;
  boardSnapshot: Map<string, string>; // HexKey -> CellOwner
  redCount: number;
  blueCount: number;
  capturedCells: HexCoord[];
}

/**
 * 履歴からリプレイフレームを生成
 */
export function generateReplayFrames(
  history: TurnAction[],
  initialBoard: BoardState,
): ReplayFrame[] {
  // 初期盤面から各ターンを順に適用してスナップショットを作成
  const frames: ReplayFrame[] = [];

  // ... 各ターンの盤面をcloneBoardで再構築
  // （実装時はcreateInitialBoard→各TurnActionを順次applyで盤面再現）

  return frames;
}

/**
 * 逆転ポイントを特定
 * スコア差が初めて符号反転したターン番号を返す
 */
export function findComebackTurn(history: TurnAction[]): number | null {
  for (let i = 1; i < history.length; i++) {
    const prev = history[i - 1];
    const curr = history[i];
    const prevDiff = prev.redCountAfter - prev.blueCountAfter;
    const currDiff = curr.redCountAfter - curr.blueCountAfter;
    if ((prevDiff > 0 && currDiff <= 0) || (prevDiff < 0 && currDiff >= 0)) {
      return curr.turnNumber;
    }
  }
  return null;
}
```

### 11.3 シェア画像レイアウト（4コマ形式）

```
┌─────────────────────────────────┐
│  COLOR CONQUEST  🔴23 vs 14🔵  │  ← ヘッダー
├────────┬────────┬────────┬──────┤
│ Turn 1 │Turn 10 │Turn 18 │Final │
│(初期)  │(逆転前)│(逆転!) │(結果)│
│  ⬡⬡⬡  │ ⬡⬡⬡  │  ⬡⬡⬡  │⬡⬡⬡  │  ← ミニ盤面4枚
│  ⬡⬡⬡  │ ⬡⬡⬡  │  ⬡⬡⬡  │⬡⬡⬡  │
│  3-3   │ 8-15  │ 16-14 │23-14 │
├────────┴────────┴────────┴──────┤
│ 🔥 逆転勝利！ #色陣取り         │  ← フッター
└─────────────────────────────────┘

画像サイズ: 1200 x 630px (OGP対応)
```

---

## 12. デイリー「詰め色陣取り」

### 12.1 ルール

- 毎日00:00 JST に新しいパズルが出題される
- **お題**: 与えられた盤面から**3手以内**に赤が勝利する配置を見つける
- 使用可能ブロックは3つに限定（お題ごとに固定）
- 制限時間なし（ただしクリア時間を記録）
- ヒントはリワード広告視聴で1つ解放（最初の1手の配置位置をハイライト）

### 12.2 ストリーク報酬

| 連続日数 | 報酬 |
|---|---|
| 1日 | コイン 30 |
| 3日連続 | コイン 100 |
| 7日連続 | コイン 300 + ジェム 10 |
| 14日連続 | コイン 500 + ジェム 30 |
| 30日連続 | ジェム 100 + 特別テーマ「虹」解放 |

### 12.3 パズル生成アルゴリズム

```
1. 日付文字列 "YYYY-MM-DD" → Mulberry32シード
2. シードでランダム盤面を生成（赤10, 青13, 空14 程度の分布）
3. ブロック3つをランダム選択
4. ソルバーで全探索:
   a. 3手の全組み合わせを列挙
   b. 各組み合わせで盤面をシミュレーション
   c. 赤が勝利（redCount > blueCount）する手順を正解とする
5. 正解が存在しない場合 → シードを +1 して再生成
6. 正解が10通り以上ある場合 → 難しい盤面を再生成（難易度調整）
7. 最終的な正解手順のうち最短のものを模範解答とする
```

### 12.4 デイリーパズルUI状態遷移

```
[未挑戦] → タップ → [プレイ中]
  ↓                    ↓ 成功
[翌日リセット]        [クリア済み]
                       ↓
                    [シェア画面]
                    (ストリーク表示 + シェアボタン)
```

---

## 13. 状態管理 (zustand)

### 13.1 ゲームストア (`src/store/game-store.ts`)

```typescript
import { create } from 'zustand';
import { GameState, GameMode, AIDifficulty } from '../types/game';
import { BlockId } from '../types/block';
import { HexCoord } from '../types/hex';
import { PlayerColor } from '../types/board';
import {
  createGame,
  selectBlock,
  rotateSelected,
  executePlace,
  executePass,
  endTurn,
} from '../engine/game-loop';
import { findBestMove } from '../engine/ai';
import { getBlockById } from '../constants/blocks';
import { autoSaveGame, clearAutoSave } from '../utils/storage';

interface GameStore {
  /** 現在のゲーム状態（null=ゲーム未開始） */
  game: GameState | null;

  // アクション
  startGame: (mode: GameMode, difficulty: AIDifficulty | null) => void;
  selectBlock: (blockId: BlockId) => void;
  rotate: (direction: 1 | -1) => void;
  placeBlock: (position: HexCoord) => Promise<{
    placedCells: HexCoord[];
    capturedCells: HexCoord[];
  } | null>;
  pass: () => void;
  endTurn: () => void;
  executeAITurn: () => Promise<void>;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  game: null,

  startGame: (mode, difficulty) => {
    set({ game: createGame(mode, difficulty) });
  },

  selectBlock: (blockId) => {
    const { game } = get();
    if (!game) return;
    selectBlock(game, blockId);
    set({ game: { ...game } }); // 再レンダリングトリガー
  },

  rotate: (direction) => {
    const { game } = get();
    if (!game) return;
    rotateSelected(game, direction);
    set({ game: { ...game } });
  },

  placeBlock: async (position) => {
    const { game } = get();
    if (!game) return null;

    const result = executePlace(game, position);
    if (!result) return null;

    set({ game: { ...game } });
    await autoSaveGame(game);
    return result;
  },

  pass: () => {
    const { game } = get();
    if (!game) return;
    executePass(game);
    set({ game: { ...game } });
  },

  endTurn: () => {
    const { game } = get();
    if (!game) return;
    endTurn(game);
    set({ game: { ...game } });

    if (game.phase === 'game_over') {
      clearAutoSave();
    }
  },

  executeAITurn: async () => {
    const { game } = get();
    if (!game || !game.aiDifficulty) return;

    const blocks = game.blueBlocks
      .map(id => getBlockById(id))
      .filter(Boolean) as any[];
    const opponentBlocks = game.redBlocks
      .map(id => getBlockById(id))
      .filter(Boolean) as any[];

    const config = AI_CONFIGS[game.aiDifficulty];

    // 思考演出用のディレイ
    await new Promise(resolve => setTimeout(resolve, config.thinkingDelay));

    const move = findBestMove(
      game.board,
      blocks,
      opponentBlocks,
      'blue',
      game.aiDifficulty,
    );

    if (!move) {
      // パス
      executePass(game);
    } else {
      game.selectedBlock = move.block.base.id;
      game.selectedRotation = move.block.rotation;
      executePlace(game, move.position);
    }

    set({ game: { ...game } });
    await autoSaveGame(game);
  },

  resetGame: () => {
    clearAutoSave();
    set({ game: null });
  },
}));
```

### 13.2 プレイヤーストア (`src/store/player-store.ts`)

```typescript
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
    const { profile, saveProfile: save } = get();
    const newUnlocks: BlockId[] = [];

    if (result.winner === null) {
      profile.totalDraws++;
    } else if (playerWon) {
      profile.totalWins++;
      profile.coins += 50;
      if (difficulty) {
        profile.winsPerDifficulty[difficulty]++;
      }
      // ブロックアンロック判定
      const unlockable = getUnlockableBlocks(profile.totalWins);
      for (const block of unlockable) {
        if (!profile.unlockedBlocks.includes(block.id)) {
          profile.unlockedBlocks.push(block.id);
          newUnlocks.push(block.id);
        }
      }
    } else {
      profile.totalLosses++;
      profile.coins += 10;
    }

    set({ profile: { ...profile } });
    await save();
    return newUnlocks;
  },

  recordDailyComplete: async (dateStr) => {
    const { profile, saveProfile: save } = get();

    // ストリーク計算
    if (profile.lastDailyCompleted) {
      const lastDate = new Date(profile.lastDailyCompleted);
      const today = new Date(dateStr);
      const diffDays = Math.floor(
        (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diffDays === 1) {
        profile.dailyStreak++;
      } else if (diffDays > 1) {
        profile.dailyStreak = 1; // リセット
      }
    } else {
      profile.dailyStreak = 1;
    }

    profile.lastDailyCompleted = dateStr;
    if (!profile.dailyCompletedDates.includes(dateStr)) {
      profile.dailyCompletedDates.push(dateStr);
    }

    // ストリーク報酬
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
      profile.coins += 30; // 毎日のベース報酬
    }

    set({ profile: { ...profile } });
    await save();
  },

  addCoins: (amount) => {
    const { profile } = get();
    profile.coins += amount;
    set({ profile: { ...profile } });
    get().saveProfile();
  },

  addGems: (amount) => {
    const { profile } = get();
    profile.gems += amount;
    set({ profile: { ...profile } });
    get().saveProfile();
  },

  spendCoins: (amount) => {
    const { profile } = get();
    if (profile.coins < amount) return false;
    profile.coins -= amount;
    set({ profile: { ...profile } });
    get().saveProfile();
    return true;
  },

  spendGems: (amount) => {
    const { profile } = get();
    if (profile.gems < amount) return false;
    profile.gems -= amount;
    set({ profile: { ...profile } });
    get().saveProfile();
    return true;
  },

  setTheme: (theme) => {
    const { profile } = get();
    profile.selectedTheme = theme;
    set({ profile: { ...profile } });
    get().saveProfile();
  },

  setAdFree: () => {
    const { profile } = get();
    profile.adFree = true;
    set({ profile: { ...profile } });
    get().saveProfile();
  },
}));
```

### 13.3 設定ストア (`src/store/settings-store.ts`)

```typescript
import { create } from 'zustand';
import { loadJSON, saveJSON, STORAGE_KEYS } from '../utils/storage';

interface SettingsStore {
  bgmVolume: number;
  seVolume: number;
  hapticsEnabled: boolean;
  notificationEnabled: boolean;
  notificationHour: number;
  notificationMinute: number;

  loadSettings: () => Promise<void>;
  setBgmVolume: (v: number) => void;
  setSeVolume: (v: number) => void;
  toggleHaptics: () => void;
  toggleNotification: () => void;
  setNotificationTime: (hour: number, minute: number) => void;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  bgmVolume: 0.7,
  seVolume: 1.0,
  hapticsEnabled: true,
  notificationEnabled: true,
  notificationHour: 8,
  notificationMinute: 0,

  loadSettings: async () => {
    const stored = await loadJSON<any>(STORAGE_KEYS.SETTINGS);
    if (stored) {
      set(stored);
    }
  },

  setBgmVolume: (v) => { set({ bgmVolume: v }); save(get()); },
  setSeVolume: (v) => { set({ seVolume: v }); save(get()); },
  toggleHaptics: () => {
    set(s => ({ hapticsEnabled: !s.hapticsEnabled }));
    save(get());
  },
  toggleNotification: () => {
    set(s => ({ notificationEnabled: !s.notificationEnabled }));
    save(get());
  },
  setNotificationTime: (hour, minute) => {
    set({ notificationHour: hour, notificationMinute: minute });
    save(get());
  },
}));

function save(state: any) {
  const { loadSettings, ...data } = state;
  saveJSON(STORAGE_KEYS.SETTINGS, data);
}
```

---

## 14. アニメーション仕様

### 14.1 反転アニメーション (`src/components/AnimatedCapture.tsx`)

```typescript
/**
 * 反転アニメーション仕様:
 *
 * 1. 配置されたブロックのセルが「ポップイン」(scale 0→1, 200ms, easeOutBack)
 * 2. 0.3秒待機
 * 3. 反転対象セルが順番に「フリップ」:
 *    - 各セルを0.15秒間隔で順次実行
 *    - フリップ = scaleX 1→0→1 (300ms) の間に色を変更
 *    - 同時にセルの枠が金色に光る (borderColor: gold, 500ms)
 *    - ハプティクス: 各セルの反転ごとにLight
 * 4. 全反転完了後0.3秒待機
 * 5. スコアバーのカウントがアニメーション更新 (300ms)
 *
 * 使用ライブラリ: react-native-reanimated
 * - withSequence, withTiming, withDelay を組み合わせ
 */
```

### 14.2 その他アニメーション一覧

| アニメーション | トリガー | 演出 | 時間 |
|---|---|---|---|
| セルポップイン | ブロック配置 | scale 0→1 (easeOutBack) | 200ms |
| セルフリップ | 反転 | scaleX 1→0→1 + 色変更 | 300ms/セル |
| スコアバー更新 | ターン終了 | 数値カウントアップ + バー幅変更 | 300ms |
| 勝利紙吹雪 | ゲーム終了（勝利） | confetti particles (30個) | 2000ms |
| 敗北暗転 | ゲーム終了（敗北） | overlay opacity 0→0.3 | 500ms |
| ブロック選択 | ブロックタップ | scale 1→1.1→1 + border glow | 200ms |
| 配置プレビュー | グリッドタップ | opacity 0.5 点滅 | 800ms loop |
| AI思考中 | AIターン | 3点ドットアニメ + "考え中..." | loop |
| メニューロゴ | メニュー表示 | ヘックスが1つずつ着色 | 1500ms |
| ブロックアンロック | 新ブロック解放 | 金色パーティクル + scale 0→1.2→1 | 800ms |

---

## 15. パフォーマンス最適化

### 15.1 AI探索の最適化

```typescript
/**
 * パフォーマンス対策:
 *
 * 1. Web Worker使用（Expo では Hermes で同期的に動くため不可）
 *    → 代替: InteractionManager.runAfterInteractions() でUIブロック回避
 *
 * 2. トランスポジションテーブル（盤面ハッシュキャッシュ）
 *    → 同一盤面を再評価しない
 *    → ハッシュ: Zobrist hashing (各セル×各色に乱数を割り当て、XORで結合)
 *
 * 3. 手の順序最適化（Move Ordering）
 *    → キラーヒューリスティック: 前の探索で枝刈りを引き起こした手を先に試す
 *    → 簡易評価で有望な手を先にソート
 *
 * 4. 探索深度の動的調整
 *    → 残り空セル数が少ない場合は深度を+1（終盤は分岐が少ない）
 *    → expert: 残り10セル以下で depth=6
 *
 * 5. ボードのcloneをMap→ArrayBufferに変更（メモリ/速度改善）
 */
```

### 15.2 レンダリング最適化

```typescript
/**
 * - HexCell: React.memo + カスタム比較関数
 *   (owner, justCaptured, justPlaced, isValidPlacement, isPreview のみ比較)
 *
 * - BlockSelector: FlatList の horizontal + getItemLayout で固定高さ
 *
 * - SVGの再描画: 変更されたセルのみ再描画
 *   (Svgは内部的にdiffしないため、個別<Polygon>をmemo化)
 *
 * - アニメーション: useAnimatedStyle (Reanimated) でJSスレッド非依存
 */
```

---

## 16. テスト計画

### 16.1 ユニットテスト

| テスト対象 | ファイル | テストケース数 |
|---|---|---|
| hex-math | `__tests__/engine/hex-math.test.ts` | 15 |
| placement | `__tests__/engine/placement.test.ts` | 12 |
| capture | `__tests__/engine/capture.test.ts` | 10 |
| ai | `__tests__/engine/ai.test.ts` | 8 |
| scoring | `__tests__/engine/scoring.test.ts` | 5 |

### 16.2 重要テストケース

```typescript
// capture.test.ts

describe('performCapture', () => {
  test('直線方向で1セル反転', () => {
    // 赤-青-赤 の並びで青が反転
  });

  test('直線方向で複数セル反転', () => {
    // 赤-青-青-青-赤 で青3つが反転
  });

  test('複数方向同時反転', () => {
    // 配置セルから2方向以上で同時に反転
  });

  test('空マスで挟めない場合は反転しない', () => {
    // 赤-青-空-赤 → 空マスがあるため反転しない
  });

  test('グリッド端で反転しない', () => {
    // 赤-青-[グリッド外] → 端に到達したため反転しない
  });

  test('配置ブロックの複数セルそれぞれから反転判定', () => {
    // 3セルブロック配置時、各セルから独立に反転判定
  });
});
```

---

## 17. ビルド・リリース設定

### 17.1 app.json

```json
{
  "expo": {
    "name": "色陣取り",
    "slug": "color-conquest",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./src/assets/images/logo.png",
    "scheme": "color-conquest",
    "userInterfaceStyle": "dark",
    "splash": {
      "image": "./src/assets/images/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#1A1A2E"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.pokkori.colorconquest",
      "buildNumber": "1",
      "infoPlist": {
        "NSUserTrackingUsageDescription": "広告の最適化のためトラッキングを使用します"
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./src/assets/images/adaptive-icon.png",
        "backgroundColor": "#1A1A2E"
      },
      "package": "com.pokkori.colorconquest",
      "versionCode": 1
    },
    "plugins": [
      "expo-router",
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": "ca-app-pub-XXXXXXXX~XXXXXXXX",
          "iosAppId": "ca-app-pub-XXXXXXXX~XXXXXXXX"
        }
      ],
      "expo-in-app-purchases",
      "expo-haptics",
      "expo-notifications",
      "expo-av"
    ]
  }
}
```

### 17.2 eas.json

```json
{
  "cli": { "version": ">= 12.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": { "simulator": true }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "pokkori@example.com",
        "ascAppId": "PLACEHOLDER",
        "appleTeamId": "PLACEHOLDER"
      },
      "android": {
        "serviceAccountKeyPath": "./google-services.json",
        "track": "production"
      }
    }
  }
}
```

---

## 18. 実装順序（推奨）

### Phase 1: コアエンジン（目標: 3日）
1. `src/types/` 全型定義
2. `src/engine/hex-math.ts` ヘックス座標計算
3. `src/engine/board.ts` ボード生成
4. `src/constants/blocks.ts` ブロック定義
5. `src/engine/placement.ts` 配置判定
6. `src/engine/capture.ts` 反転ロジック
7. `__tests__/` ユニットテスト（ここで全ロジックを検証）

### Phase 2: 基本UI（目標: 3日）
8. `src/components/HexGrid.tsx` + `HexCell.tsx` SVG描画
9. `src/components/BlockSelector.tsx` ブロック選択UI
10. `app/game.tsx` ゲーム画面（PvP）
11. `src/store/game-store.ts` zustand状態管理
12. `app/result.tsx` リザルト画面

### Phase 3: AI・永続化（目標: 2日）
13. `src/engine/ai.ts` AIエンジン
14. `src/utils/storage.ts` AsyncStorage永続化
15. `src/store/player-store.ts` プレイヤーストア
16. PvEモード完成

### Phase 4: ポリッシュ（目標: 2日）
17. アニメーション（react-native-reanimated）
18. サウンド・ハプティクス
19. `app/index.tsx` メニュー画面
20. `app/tutorial.tsx` チュートリアル
21. `app/collection.tsx` 図鑑
22. `app/settings.tsx` 設定

### Phase 5: 収益化・シェア（目標: 2日）
23. AdMob統合
24. IAP統合
25. `app/shop.tsx` ショップ
26. シェア機能
27. Game Center / Google Play Games

### Phase 6: デイリー・リリース（目標: 2日）
28. `src/engine/daily-generator.ts` デイリーパズル生成
29. `app/daily.tsx` デイリーパズル画面
30. 通知設定
31. EASビルド・ストア申請

**合計目標: 14日（2週間）**

---

## 19. 既知の技術的リスクと対策

| リスク | 影響 | 対策 |
|---|---|---|
| AI探索が遅い（expert depth=4） | UIフリーズ | InteractionManager + 探索時間制限(3秒) + transposition table |
| ヘックスのタッチ判定ズレ | 操作性低下 | pixelToAxial の丸め精度検証 + タッチ領域を5%拡大 |
| SVGのパフォーマンス（37セル） | 再描画が重い | React.memo + shouldComponentUpdate + セル単位更新 |
| デイリーパズルに解なし | ユーザー体験破壊 | 生成時にソルバーで検証、解なし→シード変更 |
| AsyncStorageデータ破損 | データロスト | try-catch + デフォルト値フォールバック + バックアップキー |
| AdMob審査遅延 | リリース遅延 | テスト広告IDで先行リリース → 審査通過後に本番IDに差替え |

---

*このドキュメントの内容だけで実装を開始できます。不明点がある場合は Red Blob Games のヘックスグリッドガイド (https://www.redblobgames.com/grids/hexagons/) を参照してください。*
