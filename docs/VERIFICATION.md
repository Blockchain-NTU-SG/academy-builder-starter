# Verification record

Checked on 5 October 2026 on macOS arm64, Node 24.19.0, Foundry 1.8.4 and Solidity 0.8.28.

## Passed

- Fresh Git clone with recursive submodules and `npm ci`.
- `npm run check`: compilation, 10 Foundry tests (including 256 fuzz runs), strict TypeScript checking and production frontend build.
- `npm run test:integration`: simulation leaves state unchanged; two local accounts write; successful receipts match resulting state and logs; empty, overlong and multibyte-overlong input is rejected; invalid chain metadata and stale deployments are rejected.
- Browser local-demo flow: choose account, submit a message, observe pending then confirmed status, updated message/count, and matching event history.
- Browser refresh preserves the on-chain message.
- Browser byte counter disables submission at 141 UTF-8 bytes; empty submission is disabled.
- Browser with no wallet extension shows a useful fallback message.
- `npm audit --audit-level=moderate`: zero reported vulnerabilities at verification time.

## Not yet verified

- An actual browser-wallet approval, rejection, account change and network switch. Wallet integration is implemented and type-checked, but the test browser has no wallet extension. Complete this check with the cohort's chosen wallet before teaching W5.4.
- Windows/WSL and Linux learner installations locally. The supplied GitHub Actions workflow is configured to check Linux with Node 22.18.0 once the repository is published.
- Public-testnet deployment: deliberately outside the starter's local-only scope.
- Final curriculum fit against the team's full pivot specification, which was not supplied.
