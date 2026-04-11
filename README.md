[![npm](https://img.shields.io/npm/v/dice-roll-sdk?color=blueviolet)](https://www.npmjs.com/package/dice-roll-sdk) ![Stacks Mainnet](https://img.shields.io/badge/Stacks-Mainnet-blueviolet) ![license](https://img.shields.io/badge/license-MIT-blue)

# dice-roll-sdk

TypeScript SDK for interacting with the Dice Roll contract on Stacks.

## Installation

```bash
npm install dice-roll-sdk
```

## Usage

```ts
import { getLeaderboard, getTotalRolls, createRollCall } from "dice-roll-sdk";

const total = await getTotalRolls();
const leaderboard = await getLeaderboard();
const tx = createRollCall();
```

## License

MIT
