import assert from 'node:assert/strict'
import { readEventRange } from '../src/lib/readEventRange.js'

async function run() {
  const normal = await readEventRange(
    async (from, to) => [`${from}-${to}`],
    10n,
    14n,
    { initialWindow: 2n, minimumWindow: 1n },
  )
  assert.deepEqual(normal, ['10-11', '12-13', '14-14'])

  const attempted: string[] = []
  const shrunk = await readEventRange(
    async (from, to) => {
      attempted.push(`${from}-${to}`)
      if (to - from + 1n > 2n) throw new Error('block range too large')
      return [`${from}-${to}`]
    },
    100n,
    111n,
    { initialWindow: 8n, minimumWindow: 2n },
  )
  assert.deepEqual(shrunk, ['100-101', '102-103', '104-105', '106-107', '108-109', '110-111'])
  assert.deepEqual(attempted, [
    '100-107',
    '100-103',
    '100-101',
    '102-103',
    '104-105',
    '106-107',
    '108-109',
    '110-111',
  ])

  await assert.rejects(
    readEventRange(
      async () => {
        throw new Error('block range limit exceeded')
      },
      1n,
      2n,
      { initialWindow: 2n, minimumWindow: 2n },
    ),
    /minimum window/,
  )

  let prunedCalls = 0
  await assert.rejects(
    readEventRange(
      async () => {
        prunedCalls += 1
        throw new Error('historical data unavailable: pruned')
      },
      1n,
      10n,
      { initialWindow: 8n, minimumWindow: 2n },
    ),
    /provider with archive history/,
  )
  assert.equal(prunedCalls, 1, 'pruned history should not be retried with smaller windows')

  const unrelated = new Error('network disconnected')
  await assert.rejects(
    readEventRange(async () => { throw unrelated }, 1n, 2n),
    (error: unknown) => error === unrelated,
  )

  console.log('readEventRange: 5 checks passed')
}

run().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
