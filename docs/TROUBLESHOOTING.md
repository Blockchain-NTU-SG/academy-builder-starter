# Troubleshooting

| What you see | What to do |
|---|---|
| `node`, `npm`, `forge`, or `anvil` not found | Install the tool in README, reopen your terminal, and run `npm run doctor`. |
| Missing `forge-std/Test.sol` | Run `git submodule update --init --recursive` in a Git clone. A GitHub source ZIP does not include submodule contents: use the recursive clone. |
| Missing `shared/abi` | Run `npm run compile`. It generates the interface directly from the contract compiler output. |
| Cannot reach local blockchain | Start `npm run chain` in Terminal A and leave it running. |
| Port 8545 is already in use | Check whether your previous local chain is still running. Stop only the practice chain you started, or use it if it is the intended Anvil instance. |
| No deployment / old deployment / contract missing | With the chain running, run `npm run deploy` and click Refresh. |
| Wrong chain | This starter only uses local Anvil chain 31337. Restart with `npm run chain`. Do not point it at a public chain. |
| Webpage port 5173 is busy | Stop your previous starter frontend or open the already-running one. The dev server intentionally does not silently choose another port. |
| No browser wallet | Choose **Use local demo**, or install a wallet from its official source in this browser. |
| Wallet is on another network | Use **Switch wallet to local network**. If the wallet already has chain 31337 configured incorrectly, edit its RPC URL to `http://127.0.0.1:8545`. |
| Wallet has no local ETH | Import an Anvil test account in a disposable practice wallet. Public testnet ETH is not local Anvil ETH. |
| Wallet transaction rejected | Nothing is sent if you reject the approval. Click submit again when ready. |
| Wallet nonce error after restarting Anvil | The wallet may remember old local transactions. Use the wallet's documented clear-activity/reset-account feature for the disposable local account, then reconnect. This is not deleting the wallet or recovery phrase. |
| Message looks short but exceeds the limit | Limits are UTF-8 bytes: many emoji and non-English characters occupy multiple bytes. |
| Waiting for confirmation timed out | Keep the shown hash. Inspect its receipt before sending again; timeout is not proof of failure. |
| A script changed the message but the page did not | Click **Refresh**. There is no background polling. |

To inspect a submitted transaction (replace the placeholder with the shown hash):

```bash
cast receipt YOUR_TRANSACTION_HASH --rpc-url http://127.0.0.1:8545
```

If you need help, share the command, the error text, your operating system and the output of `npm run doctor`. Do not share wallet recovery phrases, personal keys or credentials.
