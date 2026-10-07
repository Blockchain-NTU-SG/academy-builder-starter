import { parseAbiItem, type Address, type Hash, type PublicClient } from 'viem'
import { deploymentBlock, registryAddress } from './config'

const recordUpdated = parseAbiItem('event RecordChanged(address indexed account, string value)')

// Public RPCs limit how many blocks one getLogs call may cover, so read in windows.
const WINDOW = 40_000n

export type HistoryItem = { account: Address; value: string; block: bigint; hash: Hash }

export async function loadHistory(client: PublicClient, limit = 20): Promise<HistoryItem[]> {
  if (!registryAddress) return []
  const latest = await client.getBlockNumber()
  const items: HistoryItem[] = []
  for (let from = deploymentBlock; from <= latest; from += WINDOW) {
    const to = from + WINDOW - 1n < latest ? from + WINDOW - 1n : latest
    const logs = await client.getLogs({ address: registryAddress, event: recordUpdated, fromBlock: from, toBlock: to })
    for (const log of logs) {
      items.push({ account: log.args.account!, value: log.args.value ?? '', block: log.blockNumber, hash: log.transactionHash })
    }
  }
  return items.reverse().slice(0, limit)
}
