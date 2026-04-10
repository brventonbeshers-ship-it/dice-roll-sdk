import type { DiceRollClient } from "./client";

export {
  DiceRollClient,
  DEFAULT_CONFIG,
  callReadOnly,
  createRollCall,
  getLeaderboard,
  getTotalRolls,
  getUserRolls,
  getUserLastResult,
} from "./client";

export type {
  DiceRollConfig,
  LeaderEntry,
  ReadOnlyResponse,
  RollCall,
} from "./types";

export type TotalRollsResult = Awaited<
  ReturnType<DiceRollClient["getTotalRolls"]>
>;
