import { existsSync } from 'node:fs'
import { createPublicClient, http } from 'viem'
import { chain } from '../shared/contract.js'

if (existsSync('.env')) process.loadEnvFile('.env')
const rpcUrl = process.env.RPC_URL
if (!rpcUrl) throw new Error('Set RPC_URL in .env first (copy .env.example).')

export const client = createPublicClient({ chain, transport: http(rpcUrl) })
export const transport = http(rpcUrl)
export async function requireSepolia() {
  if (await client.getChainId() !== chain.id) throw new Error('RPC_URL must point to Ethereum Sepolia (11155111).')
}
