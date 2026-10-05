import assert from "node:assert/strict";
import { abi } from "../shared/abi.js";
import {
  publicClient,
  parseDeployment,
  assertDeployment,
} from "../shared/chain.js";
import { deployment, localWallet } from "./local.js";

// Uses the running local practice chain. Appends two clearly labelled messages.
const d = await deployment();
const contract = { address: d.address, abi };
const first = await localWallet(0);
const second = await localWallet(1);
const before = await publicClient.readContract({
  ...contract,
  functionName: "visitCount",
});
const original = await publicClient.readContract({
  ...contract,
  functionName: "message",
});
const { request } = await publicClient.simulateContract({
  ...contract,
  functionName: "setMessage",
  args: ["Integration: first visitor"],
  account: first.account,
});
assert.equal(
  await publicClient.readContract({ ...contract, functionName: "message" }),
  original,
  "Simulation must not change state",
);
assert.equal(
  await publicClient.readContract({ ...contract, functionName: "visitCount" }),
  before,
);
const hash = await first.writeContract(request);
const receipt = await publicClient.waitForTransactionReceipt({ hash });
assert.equal(receipt.status, "success");
assert.equal(
  await publicClient.readContract({ ...contract, functionName: "message" }),
  "Integration: first visitor",
);
assert.equal(
  await publicClient.readContract({ ...contract, functionName: "lastVisitor" }),
  first.account.address,
);

for (const invalid of ["", "a".repeat(141), "你".repeat(47)]) {
  await assert.rejects(
    publicClient.simulateContract({
      ...contract,
      functionName: "setMessage",
      args: [invalid],
      account: first.account,
    }),
    /EmptyMessage|MessageTooLong/,
  );
}
assert.equal(
  await publicClient.readContract({ ...contract, functionName: "visitCount" }),
  before + 1n,
  "Rejected calls must preserve state",
);
const next = await publicClient.simulateContract({
  ...contract,
  functionName: "setMessage",
  args: ["Integration: second visitor"],
  account: second.account,
});
const secondHash = await second.writeContract(next.request);
assert.equal(
  (await publicClient.waitForTransactionReceipt({ hash: secondHash })).status,
  "success",
);
assert.equal(
  await publicClient.readContract({ ...contract, functionName: "lastVisitor" }),
  second.account.address,
);
assert.equal(
  await publicClient.readContract({ ...contract, functionName: "visitCount" }),
  before + 2n,
);
const events = await publicClient.getContractEvents({
  ...contract,
  eventName: "MessageChanged",
  fromBlock: receipt.blockNumber,
  toBlock: "latest",
  strict: true,
});
assert.equal(events.length, 2);
assert.equal(events[0].args.newMessage, "Integration: first visitor");
assert.equal(
  events[1].args.visitor.toLowerCase(),
  second.account.address.toLowerCase(),
);
assert.throws(
  () => parseDeployment({ ...d, chainId: 1 }),
  /invalid deployment/,
);
await assert.rejects(
  assertDeployment({ ...d, runtimeCodeHash: `0x${"00".repeat(32)}` }),
  /missing or changed/,
);
await assert.rejects(
  assertDeployment({ ...d, blockHash: `0x${"00".repeat(32)}` }),
  /older chain/,
);
console.log(
  "PASS: simulation is read-only; two accounts write; receipts, state and events agree; invalid inputs and stale deployments are rejected.",
);
