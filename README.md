# NTU Blockchain Builder Starter

A small **Registry** built with Solidity + Foundry, TypeScript + viem, React + Vite, and Ethereum Sepolia. The frontend is intentionally unfinished so learners can implement W5.4 and W5.5.

<!-- deployment:start -->
**Ethereum Sepolia (11155111)** · Registry: [`0xf3eea9aa5a43846490a638f1b2bebb29ac2938b1`](https://sepolia.etherscan.io/address/0xf3eea9aa5a43846490a638f1b2bebb29ac2938b1)

[Deployment transaction](https://sepolia.etherscan.io/tx/0xc825e4ce7ecd413817ae4e45c89de9f80d4f28e4b468efea5beb038ac8008cc3)
<!-- deployment:end -->

## 1. Install the pinned tools

Use **Node 22.18.0** (npm 10.9.3), **Foundry 1.8.4**, and Git. Solidity **0.8.28** is pinned in `foundry.toml` and downloaded by Forge on first use.

- [Node installation](https://nodejs.org/en/download). If you use nvm, run `nvm install` and `nvm use` after cloning; `.nvmrc` selects the version.
- [Foundry installation](https://getfoundry.sh/introduction/installation/), then `foundryup --install v1.8.4`.
- **Windows:** use [WSL 2](https://learn.microsoft.com/en-us/windows/wsl/install), a Linux environment that runs alongside Windows, for the terminal commands in this guide. Open your project from the WSL terminal after installation.

Open a terminal (a text app where you type commands and read their output) and check the tools:

```bash
node --version
npm --version
git --version
forge --version
```

Node should report **v22.18.0**, npm **10.9.3**, and Forge **1.8.4**; Git should print its installed version. Seeing version numbers means each command is available. If a command is not recognised, install the pinned tool above before continuing.

## 2. Clone and install

```bash
git clone --recurse-submodules https://github.com/Blockchain-NTU-SG/academy-builder-starter.git
cd academy-builder-starter
npm ci
cp .env.example .env
```

- `git clone` copies the project and its test-library submodule onto your laptop.
- `cd academy-builder-starter` moves the terminal into that project folder; commands that follow run there.
- `npm ci` installs the exact JavaScript packages recorded in the lockfile. It may take a few minutes; completion returns you to the command prompt.
- `cp .env.example .env` creates your private local settings file. The command normally prints nothing; `.env` should appear in the folder and is ignored by Git.

If you forgot `--recurse-submodules`, run `git submodule update --init --recursive`. The pinned submodule is the Foundry test library, forge-std v1.9.7.

`.env.example` provides a public Sepolia `RPC_URL`. You can replace it in `.env` with your own Ethereum Sepolia provider URL if rate-limited. Leave `PRIVATE_KEY` blank for reading and running the frontend. No wallet, private key, test ETH or Anvil is needed for those steps.

## 3. Test the contract

From the repository root:

```bash
forge test
```

`forge test` compiles and runs the Solidity tests locally. All six should pass; they check initial state, per-account writes, the event, empty/overlong reverts, and owner-only clearing. Tests do not spend Sepolia ETH.

## 4. Read a value from Sepolia

```bash
npm run read
```

The script uses viem and `shared/contract.ts` to read the deployed owner's record. Expected output includes:

```text
Network: Sepolia (11155111)
Contract: <the address above>
Owner: <deployer address>
Record read from Sepolia: Hello from NTU Blockchain Builder Lab
```

This is a real RPC read, not a mock. The value can change if the owner updates its record. The script rejects an RPC on the wrong chain. Public RPC outages or rate limits can be resolved by using another Sepolia RPC URL in `.env`.

## 5. Open the frontend

```bash
npm run dev
```

`npm run dev` asks Vite to start a local web server. Open the URL it prints (normally **http://127.0.0.1:5173**). The terminal stays occupied while the server runs; press **Ctrl+C** there to stop it.

The page loads immediately and shows the shared contract metadata plus four scaffolded sections in `src/App.tsx`:

1. **Account/network** — connect an account and show/check its network (W5.4).
2. **One read** — read and display a Registry record (W5.4).
3. **One write** — submit `setRecord` and show pending/success/error (W5.4).
4. **Events list** — retrieve and display `RecordUpdated` logs (W5.5). The starter includes an inspectable block-range helper, but you still connect it to the right contract event and display/verify the results.

Ordinary React input and display state are already scaffolded; clicking an unfinished control shows the Web3 work still to implement. No wallet is wired up and no read/write/event solution is included in the frontend. There is no wagmi, RainbowKit, Scaffold-ETH or UI library.

## 6. Deploy your own Registry (maintainer / optional learner step)

The published address is sufficient for steps 3–5. To create another deployment:

1. Use a **disposable Sepolia-only account** and obtain free Sepolia test ETH from an [Ethereum-listed faucet](https://ethereum.org/en/developers/docs/networks/#sepolia). Do not buy ETH for this exercise.
2. In your local `.env`, set `RPC_URL` and `PRIVATE_KEY=0x...` for that test account. Never share this file. Never put a private key in a `VITE_` variable or browser code.
3. Run:

```bash
npm run deploy
npm run read
```

The deploy script checks chain ID 11155111, compiles with Foundry, sends the deployment, waits for two confirmations, verifies the owner, and updates:

- `deployments/sepolia.json` — public deployment receipt details.
- `shared/contract.ts` — one shared export file for address, chain and generated ABI.
- The address and transaction link at the top of this README.

If a transaction was submitted but waiting timed out, run `npm run deploy` again: it resumes the recorded transaction instead of immediately sending another. `.deployment-pending.json` is local and ignored. Commit the three public files when intentionally changing the shared deployment; never commit `.env`.

## Small contract, shared configuration

`contracts/src/Registry.sol` is about 30 lines. Each account can set only its own record. Empty records and values over 140 UTF-8 bytes revert. The deployer is the owner and can clear any record. Writes and clears emit `RecordUpdated`. Nothing accepts or moves ETH.

| Path | Purpose |
|---|---|
| `contracts/src/Registry.sol` | Contract |
| `contracts/test/Registry.t.sol` | Six Foundry tests |
| `scripts/read.ts` | Read an actual Sepolia value using viem |
| `scripts/contract-error-name.ts` | Find the ABI-decoded custom-error name inside a viem error |
| `scripts/deploy.ts` | Deploy to Sepolia and record the address |
| `scripts/export-contract.ts` | Export ABI from `out/Registry.sol/Registry.json` |
| `shared/contract.ts` | Address, Sepolia chain and ABI; imported by scripts and frontend |
| `src/App.tsx` | Ordinary React state and UI scaffold; Web3 behaviour remains TODO |
| `src/lib/readEventRange.ts` | Read block ranges with bounded windows; inspect the comments and adapt it in W5.5 |
| `.env.example` | RPC and private-key placeholders |

Run `npm run compile` after changing Solidity to regenerate the shared ABI. It is committed so a fresh `npm ci && npm run dev` works without an extra build step. Run `npm run check` to compile, test and build everything. Dependency versions are exact in `package.json` and locked in `package-lock.json`.

The React structure comes from the official Vite `react-ts` template, generated with `npm create vite@7.1.3 … -- --template react-ts`. We kept its React entry point, Vite React plugin and TypeScript project structure, replaced the example UI with TODOs, and pinned dependency versions. [Official Vite setup guide](https://vite.dev/guide/).


Code: [MIT](LICENSE). Club logo: [attribution](public/brand/ATTRIBUTION.md), excluded from the code licence.
