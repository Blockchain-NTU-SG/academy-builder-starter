# Verification — updated starter, 6 October 2026

Tested with Node 22.18.0, npm 10.9.3, Foundry 1.8.4 and Solidity 0.8.28 on macOS arm64.

- Root `forge test`: six Registry tests passed.
- TypeScript project checks and Vite production build passed.
- `npm audit`: zero reported vulnerabilities.
- `npm run dev`: React page inspected in browser; all four TODO sections present and controls intentionally disabled. No wallet or RPC actions run from this page.
- Actual official create-vite 7.1.3 react-ts scaffold used; React entry point, React plugin and TypeScript project structure retained.
- Rollup 4.64.0 stalled in tree-shaking this React build; pinning 4.63.6 resolved it (production build under one second).
- Sepolia RPC chain ID checked: 11155111.
- Fresh recursive clone: npm ci, root forge test, production build and browser preview passed under Node 22.18.0.
- Deployment script smoke-tested in a separate disposable local chain/copy: transaction, confirmations, owner verification, generated exports, README replacement and read output passed. That local test address was discarded and is not presented as a Sepolia deployment.

- Actual Ethereum Sepolia deployment confirmed twice: `0xf3eea9aa5a43846490a638f1b2bebb29ac2938b1`.
- Transaction: `0xc825e4ce7ecd413817ae4e45c89de9f80d4f28e4b468efea5beb038ac8008cc3`.
- `npm run read` against the public Sepolia RPC returned `Hello from NTU Blockchain Builder Lab` from that contract.

Hosted CI status is available in the repository's Actions tab. Windows/WSL setup has not been tested locally. The page remains a TODO scaffold by design; wallet approval and UI read/write/events are learner work.
