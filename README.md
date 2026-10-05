# Academy Builder Starter

A small, working Guestbook for **Blockchain@NTU Academy**. Change a message on a local blockchain, use the contract from TypeScript, connect a browser wallet, and inspect the resulting events.

**Start here:** no real money, API key, wallet extension, or public testnet is needed for the local demo. You need Node.js, Git and Foundry installed. This is a teaching project, not a production application.

## What happens when you use it?

```text
Webpage or TypeScript script
            ↓
Simulate → approve/send → wait for receipt
            ↓
Guestbook contract on your local Anvil blockchain
            ↓
Updated message + visitor count + MessageChanged event
```

The webpage includes a **local demo account** so you can try the complete flow before setting up a wallet. It also has a **Connect wallet** path for the wallet lesson. Demo mode signs through Anvil's unlocked practice account; it does not teach wallet approval by itself.

## 1. Install the tools (once)

Open your computer's **Terminal** application. A terminal runs the commands below. Run them from the project folder unless a step says otherwise.

| Tool | Tested version | Installation |
|---|---|---|
| Node.js (includes npm) | Tested with 24.19.0 locally; CI uses 22.18.0 | [Node downloads](https://nodejs.org/en/download) |
| Git | Current stable | [Git installation](https://git-scm.com/downloads) |
| Foundry (Forge + Anvil + Cast) | 1.8.4 | [Official Foundry installation](https://getfoundry.sh/introduction/installation/) |

After installing Foundry, run `foundryup --install v1.8.4` to select the tested version. Close and reopen Terminal if `forge` or `anvil` is not recognised. Windows users should use **WSL2** and run all project commands inside that Linux terminal; Foundry's normal installer does not support PowerShell/CMD.

The Solidity compiler is pinned to **0.8.28** in `contracts/foundry.toml`; Forge downloads it on the first build. Initial installation requires internet access. The app itself uses your local blockchain.

## 2. Download and install the project

```bash
git clone --recurse-submodules https://github.com/Blockchain-NTU-SG/academy-builder-starter.git
cd academy-builder-starter
npm ci
npm run doctor
```

`--recurse-submodules` also downloads the pinned `forge-std` test library. If you already cloned without that option, run:

```bash
git submodule update --init --recursive
```

For an extracted release ZIP that includes `contracts/lib/forge-std/src/Test.sol`, you can simply open a terminal in the extracted folder and run `npm ci`.

## 3. Start the practice blockchain — Terminal A

```bash
npm run chain
```

Leave this terminal running. Anvil creates practice accounts with fake ETH. It listens at `http://127.0.0.1:8545` with chain ID `31337`. Its displayed private keys are public test keys: never send real assets to them. Keep Anvil bound to your own computer, not a public interface.

## 4. Deploy and check the contract — Terminal B

Open a second terminal in the same project folder:

```bash
npm run deploy
npm run test:contract
npm run read
```

You should see a contract address, passing tests, and:

```text
Message: Hello from NTU Blockchain Builder Lab
Updates: 0
Last visitor: 0x0000000000000000000000000000000000000000
```

Deployment compiles the contract, regenerates its TypeScript interface (ABI), deploys it, and saves the address in `frontend/public/deployment.json`. Do not manually copy an address into multiple files.

## 5. Run the webpage — Terminal B

```bash
npm run dev
```

Open **http://127.0.0.1:5173**. Keep both terminals running.

1. Click **Use local demo**.
2. Enter `Hello from NTU Blockchain Builder Lab`.
3. Click **Save to blockchain**.
4. Watch Simulate → Submit → Confirm.
5. The saved message and count update. The activity trail shows the contract event.
6. Refresh the page: the value remains because it is stored on the running chain.

The **Clear message** action is available only to the account that deployed the contract. Clearing emits an event and preserves the visit count and last visitor, matching the handbook W6.1 example.

The interface uses the actual club logo and official blue/cyan/charcoal palette, with a secondary purple accent. Background particles run locally, can be paused in the footer, and respect your system’s reduced-motion preference.

The app renders message text safely as text, not HTML. Messages are limited to **140 UTF-8 bytes**, which may be fewer than 140 visible characters.

## 6. Try the TypeScript scripts — Terminal C

In another terminal in this folder:

```bash
npm run read
npm run simulate -- "Hello from a script"
npm run read
npm run write -- "Hello from a script"
npm run events
npm run clear
npm run events
```

Simulation checks the contract rules without saving changes. The write script sends the transaction, waits for a successful receipt, then reads the saved message. A transaction hash alone is not proof of success. Click **Refresh** in the webpage to load updates made by scripts or other users; the app does not poll continuously.

See a rejected call (expected failure, no change saved):

```bash
npm run simulate -- ""
```

## Optional: use a browser wallet

The local demo is enough to check installation. For the W5.4 wallet flow:

1. Install your chosen browser wallet from its official source, in the same browser used to open the app.
2. Use a disposable practice wallet/account. In Anvil's Terminal A, take **one displayed local test private key** and import it into that wallet using the wallet's import-account function. Never use that account on a public network or fund it with real assets.
3. Click **Connect wallet**. If prompted, click **Switch wallet to local network** and approve the local network in your wallet.
4. The network is `http://127.0.0.1:8545`, chain ID `31337`, currency symbol `ETH` (fake local ETH).
5. Submit a message and approve the transaction in the wallet. Reject a second request to see the cancelled-request state.

Wallet mode blocks writes on other networks. This repository deliberately has **no mainnet or public-testnet deployment path**. A later deployment lesson can introduce a separate, reviewed testnet configuration.

## Restarting tomorrow

Stop a terminal process with **Ctrl+C**. Stopping Anvil normally discards the practice chain. Next time:

```text
Terminal A: npm run chain
Terminal B: npm run deploy
Terminal B: npm run dev
```

The app checks deployment code and block identity to detect an old deployment. If it asks you to redeploy, run `npm run deploy` and refresh. A redeployment starts a new Guestbook; old history is not carried into it.

## Checks before sharing a change

```bash
npm run check
```

This compiles, runs contract tests and wallet-provider tests, checks TypeScript, and builds the frontend. With Anvil running and a deployment ready, also run:

```bash
npm run test:integration
```

The integration test writes two labelled messages, rejects a non-owner clear, then clears as the owner. It verifies account permissions, successful receipts, stored data, ordered events, rejected input, read-only simulation, and stale-deployment rejection. GitHub Actions runs both check sets on pushes and pull requests.

## Where things live

| File/folder | Purpose |
|---|---|
| `contracts/src/Guestbook.sol` | Contract rules and stored data |
| `contracts/test/Guestbook.t.sol` | Foundry tests using forge-std |
| `scripts/deploy.ts` | Local deployment and shared address export |
| `scripts/interact.ts` | Read, simulate, write, verify and event examples |
| `shared/chain.ts` | Local network checks, deployment validation, error text |
| `shared/history.ts` | Ordered update and clear event history |
| `shared/wallet.ts` | Wallet connection and local-network switching |
| `shared/abi.ts` | Generated contract interface; run `npm run compile` |
| `frontend/main.ts` | Wallet/demo connection, transaction flow and activity list |
| `frontend/public/deployment.json` | Generated local deployment record; do not commit |
| `docs/TEACHING-NOTES.md` | Handoff to Arjun, Sowmiya and Thet |
| `docs/TROUBLESHOOTING.md` | Common setup problems and recovery |

Dependencies are locked in `package-lock.json`; use `npm ci` to install those exact versions. Never upload `node_modules`, private keys or `.env` secrets.

## Lesson starting point versus working reference

`main` is the complete working reference, including the owner-only clearing behaviour already published in the handbook W6.1 example.

The `w5-start` tag preserves the simpler, runnable Guestbook before owner-only clearing. For a separate W5.2 exercise copy:

```bash
git clone --recurse-submodules --branch w5-start https://github.com/Blockchain-NTU-SG/academy-builder-starter.git academy-w5-exercise
cd academy-w5-exercise
git switch -c exercise/contract-extension
npm ci
```

Use one practice app at a time (they share ports 8545 and 5173). Compile and deploy after changing versions. The baseline validates its constructor input; `main` deliberately follows W6.1's constructor semantics, which accept the initial message unchanged. Both validate every `setMessage` call.

The Education team still owns the lesson text, task specs, model answers and approval. See [requirements coverage](docs/REQUIREMENTS.md) and [teaching notes](docs/TEACHING-NOTES.md).

## Scope and attribution

This repository is a runnable **starter/reference**, not the final lesson text or official assessment. The handbook remains the canonical lesson source. Students need clear exercise starting points agreed by the Education team; see the teaching notes.

Guestbook adapts the MIT-marked Solidity example in [Academy Week 3](https://github.com/Blockchain-NTU-SG/academy-handbook/blob/9443a1bfe4a75345975ed21252bf872cc6f8acd0/docs/foundation/week-3/part-3-remix-lab.md). The current [Week 6 testing draft](https://github.com/Blockchain-NTU-SG/academy-handbook/blob/9443a1bfe4a75345975ed21252bf872cc6f8acd0/docs/tracks/builder/week-6/part-1-testing-contract-behaviour.md) is implemented in `main`, including constructor semantics, owner-only clearing, errors, and event behaviour. The earlier `w5-start` checkpoint leaves ownership and clearing for extension work. No handbook prose is copied here.

Code and these original setup notes: [MIT](LICENSE). Club branding is excluded from that licence; see [logo attribution](frontend/public/brand/ATTRIBUTION.md). The pinned `forge-std` submodule retains its own licences. Official references: [Foundry](https://getfoundry.sh/), [viem](https://viem.sh/), [Vite](https://vite.dev/).
