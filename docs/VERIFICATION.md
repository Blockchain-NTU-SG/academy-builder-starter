# Verification record

Checked on 5 October 2026 on macOS arm64, Node 24.19.0, Foundry 1.8.4 and Solidity 0.8.28.

## Passed

- Fresh Git clone with recursive submodules and `npm ci`.
- `npm run check`: compilation, 13 Foundry tests (including 256 fuzz runs), six wallet-provider tests, strict TypeScript checking and production frontend build.
- `npm run test:integration`: simulation leaves state unchanged; two local accounts write; successful receipts match resulting state and logs; empty, overlong and multibyte-overlong input is rejected; non-owner clearing fails; owner clearing preserves count/visitor; merged events are ordered; invalid chain metadata and stale deployments are rejected.
- Browser local-demo flow: choose account, submit a message, observe pending then confirmed status, updated message/count, and matching event history.
- Browser refresh preserves the on-chain message.
- Browser owner clearing confirms successfully, displays the empty state, retains message-update count and adds a clear event to the existing activity history.
- Dark frontend inspected at desktop (1280px), mobile (390px) and narrow (320px) widths; no horizontal overflow at 320px or 390px.
- Actual club logo copied unchanged and palette anchors checked against handbook styles. Greeting and examples contain no personal name.
- Browser byte counter disables submission at 141 UTF-8 bytes; empty submission is disabled.
- Browser with no wallet extension shows a useful fallback message.
- `npm audit --audit-level=moderate`: zero reported vulnerabilities at verification time.

## Not yet verified

- An actual browser-wallet approval, rejection, account change and network switch. Six provider-mock tests cover connect permission, wrong network, empty accounts, rejection, missing-chain addition and switch verification. The test browser has no wallet extension, so complete the actual-wallet check before teaching W5.4.
- Windows/WSL and Linux learner installations locally. The supplied GitHub Actions workflow is configured to check Linux with Node 22.18.0 once the repository is published.
- Public-testnet deployment: deliberately outside the starter's local-only scope.
- Final curriculum fit against the team's full pivot specification, which was not supplied.
