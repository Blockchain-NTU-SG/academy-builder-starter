import type { EIP1193Provider } from "viem";
import { rpcUrl } from "./chain.js";

export async function connectPracticeWallet(provider: EIP1193Provider) {
  const accounts = await provider.request({ method: "eth_requestAccounts" });
  if (!accounts[0])
    throw new Error(
      "The wallet did not share an account. Connect an account to continue.",
    );
  const chainId = Number(await provider.request({ method: "eth_chainId" }));
  return { account: accounts[0], chainId };
}

export async function switchToLocalNetwork(provider: EIP1193Provider) {
  const params: [{ chainId: string }] = [{ chainId: "0x7a69" }];
  try {
    await provider.request({ method: "wallet_switchEthereumChain", params });
  } catch (error) {
    if ((error as { code?: number }).code !== 4902) throw error;
    await provider.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: "0x7a69",
          chainName: "Anvil Local Practice",
          nativeCurrency: { name: "Test Ether", symbol: "ETH", decimals: 18 },
          rpcUrls: [rpcUrl],
        },
      ],
    });
    await provider.request({ method: "wallet_switchEthereumChain", params });
  }
  const chainId = Number(await provider.request({ method: "eth_chainId" }));
  if (chainId !== 31337)
    throw new Error(
      "Your wallet is still on another network. Select Anvil Local Practice.",
    );
  return chainId;
}
