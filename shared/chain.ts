import {
  createPublicClient,
  http,
  isAddress,
  keccak256,
  type Address,
  type Hex,
} from "viem";
import { foundry } from "viem/chains";

export const chain = foundry;
export const rpcUrl = "http://127.0.0.1:8545";
export const publicClient = createPublicClient({
  chain,
  transport: http(rpcUrl, { timeout: 5000, retryCount: 0 }),
});

export type Deployment = {
  address: Address;
  chainId: number;
  blockNumber: string;
  blockHash: Hex;
  transactionHash: Hex;
  runtimeCodeHash: Hex;
};

export async function assertLocalChain() {
  if ((await publicClient.getChainId()) !== 31337)
    throw new Error(
      "Wrong chain. Start the local Anvil chain with npm run chain.",
    );
  const version = await publicClient.request({ method: "web3_clientVersion" });
  if (!version.toLowerCase().includes("anvil"))
    throw new Error(
      "This starter only supports the local Anvil practice blockchain.",
    );
}

export function parseDeployment(value: unknown): Deployment {
  const d = value as Partial<Deployment> | null;
  const hash = (s: unknown) =>
    typeof s === "string" && /^0x[0-9a-fA-F]{64}$/.test(s);
  if (
    !d ||
    d.chainId !== 31337 ||
    typeof d.address !== "string" ||
    !isAddress(d.address) ||
    typeof d.blockNumber !== "string" ||
    !/^\d+$/.test(d.blockNumber) ||
    !hash(d.blockHash) ||
    !hash(d.transactionHash) ||
    !hash(d.runtimeCodeHash)
  ) {
    throw new Error(
      "Missing or invalid deployment. Run npm run deploy, then refresh.",
    );
  }
  return d as Deployment;
}

export async function assertDeployment(d: Deployment) {
  await assertLocalChain();
  const code = await publicClient.getCode({ address: d.address });
  if (!code || code === "0x" || keccak256(code) !== d.runtimeCodeHash) {
    throw new Error(
      "Contract missing or changed. The local chain may have restarted. Run npm run deploy, then refresh.",
    );
  }
  const block = await publicClient
    .getBlock({ blockNumber: BigInt(d.blockNumber) })
    .catch(() => null);
  if (!block || block.hash !== d.blockHash)
    throw new Error(
      "Deployment belongs to an older chain. Run npm run deploy, then refresh.",
    );
}

export function describeError(error: unknown): string {
  const text = error instanceof Error ? error.message : String(error);
  if (/EmptyMessage/.test(text))
    return "The contract rejected an empty message. Enter a message and try again.";
  if (/MessageTooLong/.test(text))
    return "The contract rejected this message: the limit is 140 UTF-8 bytes.";
  if (/rejected|denied|4001/i.test(text))
    return "You declined the wallet request. Nothing was submitted; you can try again.";
  if (/fetch|HTTP request failed|ECONNREFUSED/i.test(text))
    return "Cannot reach the local blockchain. Keep npm run chain running, then try again.";
  return text.split("\n")[0].slice(0, 350);
}
