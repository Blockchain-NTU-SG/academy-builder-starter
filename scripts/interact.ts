import { abi } from "../shared/abi.js";
import { publicClient, describeError } from "../shared/chain.js";
import { deployment, localWallet } from "./local.js";

try {
  const d = await deployment();
  const contract = { address: d.address, abi };
  const command = process.argv[2];
  if (command === "read") {
    const message = await publicClient.readContract({
      ...contract,
      functionName: "message",
    });
    const count = await publicClient.readContract({
      ...contract,
      functionName: "visitCount",
    });
    const visitor = await publicClient.readContract({
      ...contract,
      functionName: "lastVisitor",
    });
    console.log(
      `Message: ${message}\nUpdates: ${count}\nLast visitor: ${visitor}`,
    );
  } else if (command === "events") {
    const logs = await publicClient.getContractEvents({
      ...contract,
      eventName: "MessageChanged",
      fromBlock: BigInt(d.blockNumber),
      toBlock: "latest",
      strict: true,
    });
    if (!logs.length)
      console.log('No updates yet. Run npm run write -- "Hello from NTU Blockchain Builder Lab".');
    for (const log of logs)
      console.log(
        `Block ${log.blockNumber}: ${log.args.visitor} → ${log.args.newMessage}\n  Transaction: ${log.transactionHash}`,
      );
  } else if (command === "simulate" || command === "write") {
    const message = process.argv[3] ?? "Hello from NTU Blockchain Builder Lab";
    const wallet = await localWallet();
    const before = await publicClient.readContract({
      ...contract,
      functionName: "message",
    });
    const { request } = await publicClient.simulateContract({
      ...contract,
      functionName: "setMessage",
      args: [message],
      account: wallet.account,
    });
    console.log(
      `Before: ${before}\nSimulation passed. No change has been saved yet.`,
    );
    if (command === "write") {
      const hash = await wallet.writeContract(request);
      console.log(`Submitted: ${hash}`);
      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
        timeout: 30_000,
      });
      if (receipt.status !== "success")
        throw new Error("Transaction reverted.");
      const after = await publicClient.readContract({
        ...contract,
        functionName: "message",
      });
      if (after !== message)
        throw new Error(
          "Saved message differs; another writer may have updated it. Inspect the receipt.",
        );
      console.log(`Receipt: success\nAfter: ${after}`);
    }
  } else throw new Error("Use read, simulate, write or events.");
} catch (error) {
  console.error(describeError(error));
  process.exitCode = 1;
}
