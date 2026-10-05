# Education team handoff

The handbook is the canonical lesson source. This repo provides the runnable contract, TypeScript scripts and small frontend required by the team plan. It does not replace the six Part tasks with a separate weekly submission.

## Two coherent starting points

- **`main`: working reference.** The W6.1 Guestbook behaviour is implemented end to end, including owner-only clearing and both event types.
- **`w5-start`: earlier runnable checkpoint.** Guestbook writes, validation, scripts, wallet UI and update history work; ownership and clearing are absent. Learners can branch from here for an extension task. The baseline has constructor validation; `main` follows the W6 draft's unvalidated constructor exactly.

The owner-only extension is already published as code in W6.1. This repo does not publish the team's private model answers, planted-bug fixtures, security challenge answers or independent challenge specifications.

## Current contract promises (`main`)

- Constructor sets `owner` to the deployer and accepts the initial message unchanged, matching W6.1.
- Every `setMessage` rejects empty input and input longer than 140 UTF-8 bytes.
- Each successful write replaces `message`, sets `lastVisitor`, increments `visitCount` and emits `MessageChanged(address indexed visitor, string newMessage)`.
- Only `owner` can call `clearMessage`; another caller receives `NotOwner(address caller)`.
- Clearing deletes only `message`, emits `MessageCleared(address indexed by)`, and preserves visitor/count. Repeated clears are allowed.
- Anyone can write a valid message after a clear.
- `getMessage()` remains as a harmless Week 3-compatible convenience read.
- Deployment emits no message-update event and starts count at zero.

## Lesson handoffs

| Part owner | Supporting material | Education team work still needed |
|---|---|---|
| Arjun W5.1 | README setup, Foundry + forge-std, tests, deployment, read script with chain/block/state | Lesson page, worked example and task evidence |
| Arjun W5.2 | `w5-start` before extension; `main` with ownership rule, clear event and failure | Select and specify the learner extension; keep model answer in reviewer space |
| Arjun W5.3 | `scripts/interact.ts`: read, simulate, write, wait for receipt, read back; clear script | Lesson and task built on the same app |
| Arjun W5.4 | Demo plus actual wallet path; network guards; pending, success, rejection and error states | Browser-wallet walkthrough and cohort-wallet acceptance check |
| Sowmiya W5.5 | `shared/history.ts`, events script, real event-history UI | Events lesson and agreed learner exercise |
| Arjun W5.6 | Integrated contract/scripts/wallet/frontend/history | Mini-dApp task and evidence requirements |
| Thet W6.1 | Contract matches current handbook behaviour; forge-std and repeatable tests | Final lesson review and private model answer |
| Thet W6.2–W6.6 | Reusable app, error paths, tests and reproducible local deployment | Broken/unsafe exercise variants, unfamiliar-tool task, shipping spec and independent challenge |

These mappings are supporting implementation evidence, not new assessment requirements. In particular, `main`'s reference code is not itself a learner submission. Both weeks' independent-challenge wording should be resolved against the pivot specification by Education leadership.

## Events integration for Sowmiya

- ABI is generated in `shared/abi.ts`; never hand-edit it.
- `frontend/public/deployment.json` records contract address, chain, deployment block and identity.
- `readHistory` queries both event types up to one fixed latest block and orders them by block/log index.
- The frontend displays the latest 20 events and total event count. Click Refresh for changes made by other clients.
- `npm run write -- "Example activity"` creates an update; `npm run clear` creates a clear as local account 0 (the default deployer).
- Small local chains need no indexer. Public-RPC pagination, persistent indexing and reorg recovery are outside this local starter.

## Before the cohort uses it

1. Review the app choice and exercise boundaries against the full pivot document (not supplied during implementation).
2. Use current handbook locations `docs/tracks/builder/week-5/` and `week-6/`; the PDF's `docs/foundation/week-5/` path predates the current structure.
3. Use `templates/deep-dive-part.md` for final lesson pages, with explanation, worked example, one 100-point task, evidence, completion/revision criteria and source links. Keep model answers in the agreed reviewer location.
4. Test with the actual browser wallet used by the cohort, including rejection, network and account changes. Provider mocks supplement but do not replace that check.
5. Create explicitly labelled broken/unsafe exercise versions only when their specifications exist; do not weaken the working default.
6. Public testnet deployment belongs to the W6 shipping lesson, not a mainnet requirement. Agree its target chain and configuration with Thet.
