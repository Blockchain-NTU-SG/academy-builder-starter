# Builder W6 Part 3 lab: find, reproduce, fix

This branch adds `contracts/src/TipRegistry.sol`: the Registry from `main`, plus
tipping. Anyone can send test ETH to thank the author of a record, and authors
withdraw what they have received.

**The contract is deliberately unsafe.** It contains planted weaknesses for the
Week 6 Part 3 exercise in the Academy handbook. Run it only in local Foundry
tests. Do not deploy it, and never send it real funds.

```bash
git checkout w6-3-security-lab
forge test --match-contract TipRegistryTest
```

All six tests in `contracts/test/TipRegistry.t.sol` pass. That does not mean the
contract is safe. Your job is to find what the tests never check.

Follow the task in the handbook page for Builder Week 6 Part 3.
