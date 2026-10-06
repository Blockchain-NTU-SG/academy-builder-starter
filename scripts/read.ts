import { address, abi, chain } from '../shared/contract.js'
import { client, requireSepolia } from './client.js'

async function main() {
  await requireSepolia()
  if (!address) throw new Error('No Sepolia address yet. Run npm run deploy first.')
  if (!await client.getCode({ address })) throw new Error('No contract at the shared address.')
  const owner = await client.readContract({ address, abi, functionName: 'owner' })
  const value = await client.readContract({ address, abi, functionName: 'records', args: [owner] })
  console.log(`Network: ${chain.name} (${chain.id})`)
  console.log(`Contract: ${address}`)
  console.log(`Owner: ${owner}`)
  console.log(`Record read from Sepolia: ${value}`)
}
main().catch((error: unknown) => {
  // Avoid logging provider URLs (which can contain API keys) or request payloads.
  console.error(error instanceof Error && !('shortMessage' in error)
    ? error.message : 'Sepolia read failed. Check RPC_URL, connectivity and the deployed contract.')
  process.exitCode = 1
})
