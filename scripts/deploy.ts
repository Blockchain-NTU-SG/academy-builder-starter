import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'node:fs'
import { createWalletClient, isHex, type Hex } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { abi, chain } from '../shared/contract.js'
import { client, transport, requireSepolia } from './client.js'

async function main() {
  await requireSepolia()
  const key = process.env.PRIVATE_KEY
  if (!key || !isHex(key) || key.length !== 66) throw new Error('Set a disposable Sepolia PRIVATE_KEY in .env.')
  const account = privateKeyToAccount(key)
  console.log(`Sepolia deployer: ${account.address}`)
  const pendingFile = '.deployment-pending.json'
  let hash: Hex
  if (existsSync(pendingFile)) {
    const pending = JSON.parse(readFileSync(pendingFile, 'utf8'))
    if (pending.deployer !== account.address || pending.chainId !== chain.id) throw new Error('Pending deployment belongs to a different account/network.')
    hash = pending.hash
    console.log('Resuming receipt check for the previously submitted deployment.')
  } else {
    if (await client.getBalance({ address: account.address }) === 0n) throw new Error('Fund this address with free Sepolia test ETH, then retry.')
    const artifact = JSON.parse(readFileSync('out/Registry.sol/Registry.json', 'utf8'))
    const wallet = createWalletClient({ account, chain, transport })
    hash = await wallet.deployContract({ abi, bytecode: artifact.bytecode.object as Hex })
    writeFileSync(pendingFile, JSON.stringify({ hash, deployer: account.address, chainId: chain.id }))
  }
  console.log(`Transaction: ${hash}`)
  const receipt = await client.waitForTransactionReceipt({ hash, confirmations: 2, timeout: 180_000 })
  if (receipt.status !== 'success' || !receipt.contractAddress) {
    unlinkSync(pendingFile)
    throw new Error('Deployment reverted. Check the transaction before retrying.')
  }
  const address = receipt.contractAddress
  const owner = await client.readContract({ address, abi, functionName: 'owner' })
  if (owner !== account.address) throw new Error('Deployed contract owner did not match the deployer.')
  writeFileSync('deployments/sepolia.json', JSON.stringify({ chainId: chain.id, address,
    transactionHash: hash, blockNumber: receipt.blockNumber.toString(), owner }, null, 2) + '\n')
  await import('./export-contract.js')
  const readme = readFileSync('README.md', 'utf8')
  writeFileSync('README.md', readme.replace(/<!-- deployment:start -->[\s\S]*?<!-- deployment:end -->/,
    `<!-- deployment:start -->
**Ethereum Sepolia (11155111)** · Registry: [\`${address}\`](https://sepolia.etherscan.io/address/${address})

[Deployment transaction](https://sepolia.etherscan.io/tx/${hash})
<!-- deployment:end -->`))
  unlinkSync(pendingFile)
  console.log(`Deployed and verified: ${address}. Shared config and README updated.`)
}
main().catch((error: unknown) => {
  console.error(error instanceof Error && !('shortMessage' in error)
    ? error.message : 'Sepolia deployment failed. Check RPC access, test ETH and any printed transaction hash. Retry to resume a pending receipt.')
  process.exitCode = 1
})
