# Builder W6 Part 2 lab: the broken dApp

This branch turns the starter into a finished Registry app: wallet connection,
your record, a form to update it, and an activity list built from events.

It has also been broken in several places. Your job is to find each fault,
work out which layer it lives in, fix it, and record the evidence that led
you there. Follow the task on the handbook page for Builder Week 6 Part 2.

## Run it

```bash
git checkout w6-2-broken-dapp
npm ci
cp .env.example .env
npm run dev
```

You need MetaMask (or another browser wallet) on Ethereum Sepolia with a
little free test ETH for the write steps. Use your Academy test wallet only.

## Bug reports from users

Each report is a symptom, written by someone who does not know the code.

1. "As soon as I open the page I get a red message, even though I copied
   `.env.example` to `.env`."
2. "My record never loads. It says the contract function returned no data."
3. "The Activity list says 'No activity yet', but Etherscan shows plenty of
   `RecordUpdated` events for the Registry."
4. "Saving a record fails with an error about the wallet's chain, and my
   MetaMask is definitely on Sepolia."
5. "After a save succeeds, 'Your record' still shows the old value until I
   refresh the page."

Fixing one fault can reveal the next, so work through them in order.
