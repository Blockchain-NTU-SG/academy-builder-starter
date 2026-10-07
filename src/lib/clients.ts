import { createPublicClient, createWalletClient, custom, http, type Address } from 'viem'
import { mainnet } from 'viem/chains'
import { registryChain } from './config'

// Reads go through the RPC in .env, so they work before a wallet is connected.
export function getPublicClient() {
  const rpcUrl = import.meta.env.VITE_RPC_URL
  if (!rpcUrl) {
    throw new Error('VITE_RPC_URL is not set. Copy .env.example to .env, then restart npm run dev.')
  }
  return createPublicClient({ chain: registryChain, transport: http(rpcUrl) })
}

// Writes are signed by the browser wallet (for example MetaMask).
export function getWalletClient(account: Address) {
  if (!window.ethereum) throw new Error('No browser wallet found. Install MetaMask, then reload.')
  return createWalletClient({ account, chain: mainnet, transport: custom(window.ethereum) })
}
