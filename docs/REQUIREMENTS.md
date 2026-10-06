# Updated starter acceptance checklist

The direct October 6 brief supersedes the earlier local Guestbook interpretation. Target: a runnable starter for Wednesday October 7.

| Requirement | Location / check |
|---|---|
| `forge test` from a fresh root clone | Root `foundry.toml`, six Registry tests |
| TypeScript prints a value read from Sepolia | `npm run read`; `scripts/read.ts` |
| `npm run dev` opens frontend | Official Vite React TypeScript scaffold, `src/App.tsx` |
| Contract deployed on Sepolia, README address | `deployments/sepolia.json`, README deployment block; pending until funded |
| Solidity + Foundry; TypeScript + viem; React + Vite | Exact dependency versions and compiler/tool pins |
| No wagmi, RainbowKit, Scaffold-ETH, UI library | None included |
| Small Registry with access rule, event, revert | Own-record writes; owner clearing; RecordUpdated; three custom errors |
| A few passing Foundry tests | Six normal, event, boundary and access tests |
| `.env.example` has RPC_URL and PRIVATE_KEY | Provided; `.env` and variants ignored |
| Bare account/network, read, write, events TODOs | Four sections in `src/App.tsx`; no wallet implementation |
| Shared address, chain and Foundry ABI | `shared/contract.ts`, used by script and frontend |
| Deploy script and clone-to-running README | `npm run deploy`; README numbered steps |
| Node 22, pinned versions | `.nvmrc` 22.18.0, package engine 22.x, exact dependencies and lockfile |
| No W5 answers or W6 broken/vulnerable variants needed | Excluded from current starter |

The previous polished local demo is retained only in Git history. The frontend's disabled controls are intentional learner TODOs, not acceptance failures.
