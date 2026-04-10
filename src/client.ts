import { STACKS_MAINNET } from "@stacks/network";
import {
  PostConditionMode,
  cvToValue,
  hexToCV,
  principalCV,
  serializeCV,
} from "@stacks/transactions";
import type {
  DiceRollConfig,
  LeaderEntry,
  ReadOnlyResponse,
  RollCall,
} from "./types";

export const DEFAULT_CONFIG: Required<DiceRollConfig> = {
  contractAddress: "SP1Q7YR67R6WGP28NXDJD1WZ11REPAAXRJJ3V6RKM",
  contractName: "dice-roll",
  apiBase: "https://api.mainnet.hiro.so",
  network: STACKS_MAINNET,
};

function resolveConfig(overrides: DiceRollConfig = {}): Required<DiceRollConfig> {
  return { ...DEFAULT_CONFIG, ...overrides };
}

function serializeCvToHex(cv: unknown): string {
  const serialized = serializeCV(cv as never);
  if (typeof serialized === "string") {
    return serialized.startsWith("0x") ? serialized : `0x${serialized}`;
  }
  return `0x${Buffer.from(serialized).toString("hex")}`;
}

export async function callReadOnly(
  functionName: string,
  args: string[] = [],
  config: DiceRollConfig = {}
): Promise<ReadOnlyResponse> {
  const resolved = resolveConfig(config);
  const response = await fetch(
    `${resolved.apiBase}/v2/contracts/call-read/${resolved.contractAddress}/${resolved.contractName}/${functionName}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sender: resolved.contractAddress,
        arguments: args,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Read-only call failed with status ${response.status}`);
  }

  return response.json() as Promise<ReadOnlyResponse>;
}

function normalizeLeaderboardValue(raw: unknown): LeaderEntry[] {
  const entries = Array.isArray(raw) ? raw : [];

  return entries
    .map(item => {
      const entry =
        item && typeof item === "object" && "value" in item
          ? (item as { value: unknown }).value
          : item;
      const record = entry as {
        who?: { value?: string } | string;
        rolls?: { value?: string | number } | string | number;
      };

      return {
        who: String(record?.who && typeof record.who === "object" ? record.who.value ?? "" : record?.who ?? ""),
        rolls: Number(
          record?.rolls && typeof record.rolls === "object"
            ? record.rolls.value ?? 0
            : record?.rolls ?? 0
        ),
      };
    })
    .filter(entry => entry.who && entry.rolls > 0);
}

export async function getTotalRolls(config: DiceRollConfig = {}): Promise<number> {
  const data = await callReadOnly("get-total-rolls", [], config);
  if (!data.okay || !data.result) {
    return 0;
  }

  const clarityValue = hexToCV(data.result);
  const parsed = cvToValue(clarityValue, true) as { value?: unknown } | unknown;
  return Number(
    parsed && typeof parsed === "object" && "value" in parsed
      ? parsed.value ?? 0
      : parsed ?? 0
  );
}

export async function getUserRolls(
  userAddress: string,
  config: DiceRollConfig = {}
): Promise<number> {
  const principalArg = serializeCvToHex(principalCV(userAddress));
  const data = await callReadOnly("get-user-rolls", [principalArg], config);
  if (!data.okay || !data.result) {
    return 0;
  }

  const clarityValue = hexToCV(data.result);
  const parsed = cvToValue(clarityValue, true) as { value?: unknown } | unknown;
  return Number(
    parsed && typeof parsed === "object" && "value" in parsed
      ? parsed.value ?? 0
      : parsed ?? 0
  );
}

export async function getUserLastResult(
  userAddress: string,
  config: DiceRollConfig = {}
): Promise<number> {
  const principalArg = serializeCvToHex(principalCV(userAddress));
  const data = await callReadOnly("get-user-last-result", [principalArg], config);
  if (!data.okay || !data.result) {
    return 0;
  }

  const clarityValue = hexToCV(data.result);
  const parsed = cvToValue(clarityValue, true) as { value?: unknown } | unknown;
  return Number(
    parsed && typeof parsed === "object" && "value" in parsed
      ? parsed.value ?? 0
      : parsed ?? 0
  );
}

export async function getLeaderboard(
  config: DiceRollConfig = {}
): Promise<LeaderEntry[]> {
  const data = await callReadOnly("get-leaderboard", [], config);
  if (!data.okay || !data.result) {
    return [];
  }

  const clarityValue = hexToCV(data.result);
  const parsed = cvToValue(clarityValue, true);
  return normalizeLeaderboardValue(parsed);
}

export function createRollCall(config: DiceRollConfig = {}): RollCall {
  const resolved = resolveConfig(config);
  return {
    contractAddress: resolved.contractAddress,
    contractName: resolved.contractName,
    functionName: "roll",
    functionArgs: [],
    postConditionMode: PostConditionMode.Deny,
    postConditions: [],
    network: resolved.network,
  };
}

export class DiceRollClient {
  private readonly config: Required<DiceRollConfig>;

  constructor(config: DiceRollConfig = {}) {
    this.config = resolveConfig(config);
  }

  getTotalRolls(): Promise<number> {
    return getTotalRolls(this.config);
  }

  getUserRolls(userAddress: string): Promise<number> {
    return getUserRolls(userAddress, this.config);
  }

  getUserLastResult(userAddress: string): Promise<number> {
    return getUserLastResult(userAddress, this.config);
  }

  getLeaderboard(): Promise<LeaderEntry[]> {
    return getLeaderboard(this.config);
  }

  createRollCall(): RollCall {
    return createRollCall(this.config);
  }
}
