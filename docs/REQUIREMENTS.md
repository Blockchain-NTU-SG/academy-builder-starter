# Requirements review — 5 October 2026

## Sources and limits

Reviewed against the user-supplied **Deep Dive W5–W6 — Team Plan**, dated 29 September 2026 (`BLOCKCHAIN CLUB.pdf`, all 5 pages), and handbook revision [`9443a1b`](https://github.com/Blockchain-NTU-SG/academy-handbook/tree/9443a1bfe4a75345975ed21252bf872cc6f8acd0), still current at review time.

The PDF mentions a separate pivot specification. It was not supplied and is not present in the reviewed handbook. W5 and most W6 pages are outlines. Therefore this records coverage of the available starter requirements; it cannot certify unseen lesson details or claim that all curriculum deliverables are complete.

## Starter requirements and evidence

| Source requirement | Implementation / evidence | Status |
|---|---|---|
| Ready-made contract, scripts, small frontend | `contracts/`, `scripts/`, `frontend/`; one README setup path | Implemented |
| Run, compile, test and read chain data (W5.1) | Foundry pinned, forge-std submodule, doctor, deploy, tests; read script prints chain ID, block, contract and state | Implemented |
| Extend a contract with a rule, event and failure (W5.2) | `w5-start` before ownership; reference `main` adds owner-only clear, MessageCleared and NotOwner | Supported; final learner task belongs in handbook |
| Read → simulate → write → verify (W5.3) | TypeScript calls, preflight simulation, transaction hash, successful receipt, post-write read | Implemented |
| Wallet connection, reads, writes, pending/success/error (W5.4) | Browser-wallet and demo paths; network guard; account/network/disconnect listeners; status flow | Implemented; actual cohort wallet acceptance remains |
| Past events as activity history (Sowmiya W5.5) | Both event types, deployment-block boundary, ordered history in script and UI | Implemented |
| Combine previous skills (W5.6) | One end-to-end app; no backend/API account needed | Implemented as reference; lesson/evidence not authored here |
| Normal and failure Foundry tests (W6.1) | 13 tests including events, permissions, boundaries, UTF-8, fuzz and unchanged state after failure | Implemented |
| W6.1 published Guestbook compatibility | Owner is deployer, same state, 140-byte write rule, exact custom errors, both events, clear preserves visitor/count, constructor accepts initial string | Aligned to available draft |
| No real-money/mainnet requirement | Anvil only, loopback RPC, chain/client validation, no private keys in app files | Implemented |
| Someone else can run/verify the app | Recursive clone, locked dependencies, pinned compiler/Foundry, setup/reset instructions, CI and integration checks | Implemented for local deployment |
| Avoid duplicating canonical curriculum | Setup/implementation docs here; lesson ownership stays in academy-handbook | Preserved |
| Branding requested by Arjun | Original logo copied unchanged, source attribution, official palette anchors, dark UI, neutral greeting | Implemented |

## Work explicitly outside this starter deliverable

- The PDF's five assigned lesson drafts, per-Part worked examples, private model answers and final source lists are separate authoring deliverables; a working repo does not complete them.
- Thet owns W6 broken-app, unsafe-contract, unfamiliar-tool, shipping and independent-challenge specifications. We have not invented their missing content or claimed completion.
- Public-testnet deployment configuration is not specified in the available plan. This starter deploys locally; a public shipping path still needs the W6 decision.
- The PDF says both weeks end with an unfamiliar challenge, while its W5.6 description says combine W5.1–W5.5. Education leadership must resolve that detail using the pivot spec.
- PDF paths under `docs/foundation/week-5/` conflict with the current handbook's `docs/tracks/builder/week-5/`. Current repository structure is retained.

## Tool and visual choices

Foundry and TypeScript follow explicit task/draft references. Viem, Vite, the Guestbook choice and local Anvil are implementation choices supporting them, not newly imposed curriculum requirements. The particle background is a dependency-free canvas decoration; it pauses when hidden, can be switched off, and respects reduced motion. No fonts or particle scripts are fetched from third-party CDNs at runtime.
