import type { StacksNetwork } from "@stacks/network";
import type { PostConditionMode } from "@stacks/transactions";

export interface DiceRollConfig {
  contractAddress?: string;
  contractName?: string;
  apiBase?: string;
  network?: StacksNetwork;
}

export interface LeaderEntry {
  who: string;
  rolls: number;
}

export interface ReadOnlyResponse {
  okay?: boolean;
  result?: string;
  cause?: string;
}

export interface RollCall {
  contractAddress: string;
  contractName: string;
  functionName: "roll";
  functionArgs: [];
  postConditionMode: PostConditionMode;
  postConditions: [];
  network: StacksNetwork;
}
