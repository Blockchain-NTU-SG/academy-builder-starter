export type EventRangeQuery<T> = (
  fromBlock: bigint,
  toBlock: bigint,
) => Promise<readonly T[]>

export interface ReadEventRangeOptions {
  initialWindow?: bigint
  minimumWindow?: bigint
}

function errorMessage(error: unknown): string {
  const messages: string[] = []
  let current: unknown = error

  for (let depth = 0; depth < 5 && current; depth += 1) {
    if (current instanceof Error) {
      messages.push(current.message)
      current = current.cause
    } else if (typeof current === 'string') {
      messages.push(current)
      break
    } else {
      break
    }
  }

  return messages.join(' ').toLowerCase()
}

function isPrunedHistoryError(error: unknown): boolean {
  const message = errorMessage(error)
  return [
    'pruned',
    'missing trie node',
    'historical state unavailable',
    'historical data unavailable',
    'archive node',
  ].some((phrase) => message.includes(phrase))
}

function isRangeLimitError(error: unknown): boolean {
  const message = errorMessage(error)
  return [
    'block range',
    'range too large',
    'range is too large',
    'too many results',
    'query returned more than',
    'maximum block range',
    'limit exceeded',
  ].some((phrase) => message.includes(phrase))
}

/**
 * Query an inclusive block range in windows. Start at the contract's
 * deployment block (not block zero) when calling this helper.
 */
export async function readEventRange<T>(
  query: EventRangeQuery<T>,
  startBlock: bigint,
  endBlock: bigint,
  options: ReadEventRangeOptions = {},
): Promise<T[]> {
  const initialWindow = options.initialWindow ?? 2_000n
  const minimumWindow = options.minimumWindow ?? 50n

  if (startBlock < 0n || endBlock < 0n) {
    throw new RangeError('Block numbers cannot be negative.')
  }
  if (initialWindow < 1n || minimumWindow < 1n) {
    throw new RangeError('Block windows must be at least one block.')
  }
  if (minimumWindow > initialWindow) {
    throw new RangeError('The minimum window cannot exceed the initial window.')
  }
  if (startBlock > endBlock) return []

  const rows: T[] = []
  let nextBlock = startBlock
  let windowSize = initialWindow

  while (nextBlock <= endBlock) {
    const windowEnd = nextBlock + windowSize - 1n
    const toBlock = windowEnd > endBlock ? endBlock : windowEnd

    try {
      rows.push(...(await query(nextBlock, toBlock)))
      nextBlock = toBlock + 1n
    } catch (error) {
      if (isPrunedHistoryError(error)) {
        throw new Error(
          'This RPC does not retain the requested history. Try a provider with archive history.',
          { cause: error },
        )
      }

      if (!isRangeLimitError(error)) throw error

      if (windowSize <= minimumWindow) {
        throw new Error(
          `The RPC rejected a block range at the minimum window (${minimumWindow} blocks).`,
          { cause: error },
        )
      }

      const halfWindow = windowSize / 2n
      windowSize = halfWindow < minimumWindow ? minimumWindow : halfWindow
    }
  }

  return rows
}
