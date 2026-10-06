# Verification — updated starter, 6 October 2026

Tested with Node 22.18.0, npm 10.9.3, Foundry 1.8.4 and Solidity 0.8.28 on macOS arm64.

- Root `forge test`: six Registry tests passed.
- TypeScript project checks and Vite production build passed.
- `npm audit`: zero reported vulnerabilities.
- `npm run dev`: React page inspected in browser; all four TODO sections present and controls intentionally disabled. No wallet or RPC actions run from this page.
- Actual official create-vite 7.1.3 react-ts scaffold used; React entry point, React plugin and TypeScript project structure retained.
- Rollup 4.64.0 stalled in tree-shaking this React build; pinning 4.63.6 resolved it (production build under one second).
- Sepolia RPC chain ID checked: 11155111.

Pending: funded Sepolia deployment, real contract read, fresh-clone acceptance and hosted CI. These will be recorded after they run; an RPC connection alone is not a deployed contract.
