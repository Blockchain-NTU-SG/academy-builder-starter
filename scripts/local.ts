import { readFile } from "node:fs/promises";
import { createWalletClient, http } from "viem";
import {
  chain,
  rpcUrl,
  publicClient,
  assertLocalChain,
  assertDeployment,
  parseDeployment,
} from "../shared/chain.js";

export async function localWallet(index = 0) {
  await assertLocalChain();
  const accounts = await createWalletClient({
    chain,
    transport: http(rpcUrl),
  }).getAddresses();
  const account = accounts[index];
  if (!account)
    throw new Error("No local test account found. Restart with npm run chain.");
  return createWalletClient({ account, chain, transport: http(rpcUrl) });
}

export async function deployment() {
  let raw: string;
  try {
    raw = await readFile("frontend/public/deployment.json", "utf8");
  } catch {
    throw new Error("No deployment yet. Run npm run deploy first.");
  }
  const d = parseDeployment(JSON.parse(raw));
  await assertDeployment(d);
  return d;
}
