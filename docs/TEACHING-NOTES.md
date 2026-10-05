# Education team handoff

This repo supplies a tested local environment and an end-to-end reference flow. It does not alter the approved curriculum or replace pages in `academy-handbook`. Agree the final exercise boundaries with Thet before distributing it to learners.

## Current contract promises

- Constructor accepts one nonempty message of at most 140 UTF-8 bytes.
- Anyone can call `setMessage` with a valid message, including the same message again.
- Each successful update replaces `message`, stores `lastVisitor`, increments `visitCount`, and emits `MessageChanged(address indexed visitor, string newMessage)`.
- Invalid messages revert without changing state or producing a successful event.
- The initial constructor message does not count as a visit and does not emit `MessageChanged`.
- No ownership, clearing, money or token behaviour exists in this baseline.

## Mapping to the team plan (proposed exercise boundaries)

| Part | Working support in this repo | Suggested learner work |
|---|---|---|
| Arjun W5.1 | Foundry, local deployment, passing baseline tests, read script | Run it and explain compile/deploy/read with evidence |
| Arjun W5.2 | Small contract with observable state, logs and errors | Add `owner`, owner-only `clearMessage`, `NotOwner` error and `MessageCleared` event; agree exact semantics with Thet |
| Arjun W5.3 | Complete `scripts/interact.ts` reference | Use it as a worked example; assign a new interaction with the W5.2 extension |
| Arjun W5.4 | Complete wallet/demo UI reference | Extend the UI for the new contract action; demonstrate approval, pending, rejection and success |
| Sowmiya W5.5 | Typed `getContractEvents`, block-bounded reads, safe text rendering | Extend activity history for `MessageCleared`, or filter activity by visitor |
| Arjun W5.6 | One working app and reusable config | Integrate the agreed extension across contract, scripts and frontend |
| Thet W6 | forge-std already installed; contract + integration tests | Add the agreed behavioural tests, debugging/security fixtures and later testnet deployment |

These are suggestions, not new assessment requirements. The existing reference flow stays runnable: no hidden TODO makes initial installation fail. This is not a public model answer for the owner-only extension. Keep instructor model answers in the team's agreed reviewer location.

## W6 compatibility checkpoint

The handbook's W6.1 example is a stand-in with ownership and clearing. This starter shares the initial-message constructor, state names, 140-byte limit, `EmptyMessage`, `MessageTooLong` and `MessageChanged`. It also validates the initial constructor message.

After W5.2, agree whether `clearMessage` preserves the visit count and last visitor (the existing W6 draft does), whether it emits only `MessageCleared`, and who the constructor sets as owner. Update the lesson example, tests and starter stage together. Do not point the unmodified W6 owner/clear tests at this baseline and expect them to pass.

## Files Sowmiya can rely on

- Generated ABI: `shared/abi.ts`, regenerated after every compile.
- Deployment: `frontend/public/deployment.json`, includes address, chain, deployment block and identity checks.
- Event schema: `MessageChanged(address indexed visitor, string newMessage)`.
- Script reference: `npm run events`.
- Frontend reference: activity rendering in `frontend/main.ts`.
- Generate activity: `npm run write -- "Example activity"`; use only invented messages.

The history lists the newest 20 events and loads all events since deployment. This is fine for a tiny local course chain. Public RPC pagination, reorg handling, indexing and production-scale history are outside the baseline.

## Before the cohort uses it

1. Review the Guestbook choice against the full pivot document (not available during implementation).
2. Agree lesson starting snapshots/tags or branches; avoid a maze of unrelated example apps.
3. Ask a second person to follow README from a fresh clone.
4. Test the wallet exercise in the browser wallet used by the cohort, including rejection, account change and wrong network.
5. Keep W6 unsafe/broken examples in explicit exercise branches, not the default working starter.
6. Keep handbook pages at the current `docs/tracks/builder/week-5/` and `week-6/` paths, not the older PDF's `docs/foundation/week-5/` suggestion.

No public-testnet deployment, hosting, grading system, authentication backend, API account or mainnet integration is included.
