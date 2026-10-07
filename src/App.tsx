import { useCallback, useEffect, useState } from 'react'
import { BaseError, getAddress, type Address, type Hash } from 'viem'
import { registryAbi, registryAddress, registryChain } from './lib/config'
import { getPublicClient, getWalletClient } from './lib/clients'
import { loadHistory, type HistoryItem } from './lib/history'
import './App.css'

type TxState =
  | { kind: 'idle' }
  | { kind: 'pending'; hash?: Hash }
  | { kind: 'success'; hash: Hash }
  | { kind: 'error'; message: string }

const explorer = registryChain.blockExplorers?.default.url ?? 'https://sepolia.etherscan.io'

function toMessage(error: unknown) {
  if (error instanceof BaseError) return error.shortMessage
  if (error instanceof Error) return error.message
  return String(error)
}

function short(value: string) {
  return `${value.slice(0, 6)}…${value.slice(-4)}`
}

function App() {
  const [setupError, setSetupError] = useState<string>()
  const [account, setAccount] = useState<Address>()
  const [walletChainId, setWalletChainId] = useState<number>()
  const [record, setRecord] = useState<string>()
  const [readError, setReadError] = useState<string>()
  const [draft, setDraft] = useState('')
  const [tx, setTx] = useState<TxState>({ kind: 'idle' })
  const [history, setHistory] = useState<HistoryItem[]>()
  const [historyError, setHistoryError] = useState<string>()

  const wrongNetwork = walletChainId !== undefined && walletChainId !== registryChain.id

  const refreshRecord = useCallback(async (who: Address) => {
    try {
      setReadError(undefined)
      if (!registryAddress) throw new Error('No Registry address in shared/contract.ts.')
      const value = await getPublicClient().readContract({
        address: registryAddress, abi: registryAbi, functionName: 'records', args: [who],
      })
      setRecord(value)
    } catch (error) {
      setReadError(toMessage(error))
    }
  }, [])

  const refreshHistory = useCallback(async () => {
    try {
      setHistoryError(undefined)
      setHistory(await loadHistory(getPublicClient()))
    } catch (error) {
      setHistoryError(toMessage(error))
    }
  }, [])

  useEffect(() => {
    try {
      getPublicClient()
      refreshHistory()
    } catch (error) {
      setSetupError(toMessage(error))
    }
  }, [refreshHistory])

  useEffect(() => {
    const provider = window.ethereum
    if (!provider) return
    const onAccounts = (accounts: string[]) => setAccount(accounts[0] ? getAddress(accounts[0]) : undefined)
    const onChain = (id: string) => setWalletChainId(Number(id))
    provider.on('accountsChanged', onAccounts)
    provider.on('chainChanged', onChain)
    return () => {
      provider.removeListener('accountsChanged', onAccounts)
      provider.removeListener('chainChanged', onChain)
    }
  }, [])

  useEffect(() => {
    if (account) refreshRecord(account)
  }, [account, refreshRecord])

  async function connect() {
    try {
      if (!window.ethereum) throw new Error('No browser wallet found. Install MetaMask, then reload.')
      const [first] = await window.ethereum.request({ method: 'eth_requestAccounts' })
      setWalletChainId(Number(await window.ethereum.request({ method: 'eth_chainId' })))
      setAccount(getAddress(first))
    } catch (error) {
      setSetupError(toMessage(error))
    }
  }

  async function switchNetwork() {
    try {
      await window.ethereum?.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${registryChain.id.toString(16)}` }],
      })
    } catch (error) {
      setTx({ kind: 'error', message: toMessage(error) })
    }
  }

  async function save() {
    if (!account || !registryAddress) return
    try {
      setTx({ kind: 'pending' })
      const publicClient = getPublicClient()
      const { request } = await publicClient.simulateContract({
        account, address: registryAddress, abi: registryAbi, functionName: 'setRecord', args: [draft],
      })
      const hash = await getWalletClient(account).writeContract(request)
      setTx({ kind: 'pending', hash })
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      if (receipt.status !== 'success') throw new Error('The transaction reverted.')
      setTx({ kind: 'success', hash })
      setDraft('')
    } catch (error) {
      setTx({ kind: 'error', message: toMessage(error) })
    }
  }

  return (
    <main>
      <header>
        <img src="/brand/blockchain-ntu-logo-dark.png" alt="Blockchain at NTU" width="72" height="72" />
        <div><p className="eyebrow">ACADEMY · BUILDER</p><h1>Registry on {registryChain.name}</h1></div>
      </header>
      <p className="address">Contract: {registryAddress ?? 'not deployed'}</p>
      {setupError && <p className="error" role="alert">{setupError}</p>}

      <section>
        <h2>1. Account & network</h2>
        {account ? (
          <p>Connected: <code>{account}</code><br />Wallet network: {walletChainId === registryChain.id ? registryChain.name : `chain ${walletChainId}`}</p>
        ) : (
          <button onClick={connect}>Connect wallet</button>
        )}
        {wrongNetwork && (
          <p className="error">Your wallet is on the wrong network. <button onClick={switchNetwork}>Switch to {registryChain.name}</button></p>
        )}
      </section>

      <section>
        <h2>2. Your record</h2>
        {!account && <p>Connect a wallet to read your record.</p>}
        {account && readError && <p className="error">Could not read: {readError}</p>}
        {account && !readError && <output>{record === undefined ? 'Loading…' : record || '(empty)'}</output>}
      </section>

      <section>
        <h2>3. Write your record</h2>
        <label htmlFor="record">New record</label>
        <input id="record" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Up to 140 UTF-8 bytes" disabled={!account} />
        <button onClick={save} disabled={!account || wrongNetwork || tx.kind === 'pending'}>Save record</button>
        {tx.kind === 'pending' && <p>Pending… {tx.hash ? <a href={`${explorer}/tx/${tx.hash}`} target="_blank" rel="noreferrer">view transaction</a> : 'confirm in your wallet'}</p>}
        {tx.kind === 'success' && <p className="ok">Saved. <a href={`${explorer}/tx/${tx.hash}`} target="_blank" rel="noreferrer">View transaction</a></p>}
        {tx.kind === 'error' && <p className="error">Failed: {tx.message}</p>}
      </section>

      <section>
        <h2>4. Activity</h2>
        {historyError && <p className="error">Could not load activity: {historyError}</p>}
        {!historyError && history === undefined && <p>Loading…</p>}
        {history?.length === 0 && <p>No activity yet.</p>}
        <ul>
          {history?.map((item) => (
            <li key={`${item.hash}-${item.account}-${item.value}`}>
              <code>{short(item.account)}</code> set “{item.value || '(cleared)'}” in block {item.block.toString()}{' '}
              <a href={`${explorer}/tx/${item.hash}`} target="_blank" rel="noreferrer">tx</a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}

export default App
