import { test } from "node:test";
import assert from "node:assert/strict";
import type { EIP1193Provider } from "viem";
import {
  connectPracticeWallet,
  switchToLocalNetwork,
} from "../shared/wallet.js";
import { describeError } from "../shared/chain.js";

const address = "0x0000000000000000000000000000000000000001";
function provider(
  fn: (request: { method: string; params?: unknown }) => unknown,
) {
  return {
    request: async (r: { method: string; params?: unknown }) => fn(r),
  } as EIP1193Provider;
}
test("connect requests permission and reports wrong network without pretending to switch", async () => {
  const calls: string[] = [];
  const p = provider((r) => {
    calls.push(r.method);
    return r.method === "eth_requestAccounts" ? [address] : "0x1";
  });
  assert.deepEqual(await connectPracticeWallet(p), {
    account: address,
    chainId: 1,
  });
  assert.deepEqual(calls, ["eth_requestAccounts", "eth_chainId"]);
});
test("connect handles empty accounts", async () => {
  await assert.rejects(
    connectPracticeWallet(provider(() => [])),
    /did not share/,
  );
});
test("wallet rejection propagates as a readable cancellation", async () => {
  const error = Object.assign(new Error("User rejected request"), {
    code: 4001,
  });
  await assert.rejects(
    connectPracticeWallet(
      provider(() => {
        throw error;
      }),
    ),
    error,
  );
  assert.match(describeError(error), /declined/);
});
test("missing local network is added then selected and verified", async () => {
  const calls: string[] = [];
  let switches = 0;
  const p = provider((r) => {
    calls.push(r.method);
    if (r.method === "wallet_switchEthereumChain" && ++switches === 1)
      throw { code: 4902 };
    if (r.method === "wallet_addEthereumChain")
      assert.deepEqual((r.params as { rpcUrls: string[] }[])[0].rpcUrls, [
        "http://127.0.0.1:8545",
      ]);
    return r.method === "eth_chainId" ? "0x7a69" : null;
  });
  assert.equal(await switchToLocalNetwork(p), 31337);
  assert.deepEqual(calls, [
    "wallet_switchEthereumChain",
    "wallet_addEthereumChain",
    "wallet_switchEthereumChain",
    "eth_chainId",
  ]);
});
test("a rejected switch never adds another network", async () => {
  const calls: string[] = [];
  const error = Object.assign(new Error("User rejected request"), {
    code: 4001,
  });
  await assert.rejects(
    switchToLocalNetwork(
      provider((r) => {
        calls.push(r.method);
        throw error;
      }),
    ),
    error,
  );
  assert.deepEqual(calls, ["wallet_switchEthereumChain"]);
});
test("switch success is not assumed when wallet stays on the wrong chain", async () => {
  await assert.rejects(
    switchToLocalNetwork(
      provider((r) => (r.method === "eth_chainId" ? "0x1" : null)),
    ),
    /still on another network/,
  );
});
