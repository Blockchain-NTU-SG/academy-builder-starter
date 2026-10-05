import { readFile, writeFile, mkdir } from "node:fs/promises";
import { keccak256, type Hex } from "viem";
import { abi } from "../shared/abi.js";
import { publicClient, describeError } from "../shared/chain.js";
import { localWallet } from "./local.js";

try {
  const wallet = await localWallet();
  const artifact = JSON.parse(
    await readFile("contracts/out/Guestbook.sol/Guestbook.json", "utf8"),
  );
  const hash = await wallet.deployContract({
    abi,
    bytecode: artifact.bytecode.object as Hex,
    args: ["Hello from Blockchain@NTU"],
  });
  const receipt = await publicClient.waitForTransactionReceipt({
    hash,
    timeout: 30_000,
  });
  if (receipt.status !== "success" || !receipt.contractAddress)
    throw new Error("Deployment failed.");
  const address = receipt.contractAddress;
  const code = await publicClient.getCode({ address });
  if (!code) throw new Error("Deployed contract has no code.");
  const d = {
    address,
    chainId: 31337,
    blockNumber: receipt.blockNumber.toString(),
    blockHash: receipt.blockHash,
    transactionHash: hash,
    runtimeCodeHash: keccak256(code),
  };
  await mkdir("frontend/public", { recursive: true });
  await writeFile(
    "frontend/public/deployment.json",
    JSON.stringify(d, null, 2) + "\n",
  );
  console.log(
    `Guestbook deployed on LOCAL Anvil\nAddress: ${address}\nTransaction: ${hash}\nRun npm run read or npm run dev next.`,
  );
} catch (error) {
  console.error(describeError(error));
  process.exitCode = 1;
}
