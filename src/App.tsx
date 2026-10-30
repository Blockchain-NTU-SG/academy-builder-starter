import { useEffect, useState, type FormEvent } from 'react'
import { address, abi, chain } from '../shared/contract'
import './App.css'

function App() {
  const [recordInput, setRecordInput] = useState('')
  const [account, setAccount] = useState<string | null>(null)
  const [walletStatus, setWalletStatus] = useState('Not connected')
  const [networkStatus, setNetworkStatus] = useState('Not checked')
  const [recordValue, setRecordValue] = useState('No value loaded yet.')
  const [readStatus, setReadStatus] = useState('Not loaded')
  const [writeStatus, setWriteStatus] = useState('Not started')
  const [events, setEvents] = useState<string[]>([])
  const [eventsStatus, setEventsStatus] = useState('Not loaded')

  useEffect(() => {
    // W5.4 TODO: inspect the wallet on page load and subscribe to account and
    // chain changes. Remove those listeners in the cleanup function.
    return () => {
      // W5.4 TODO: remove the wallet event listeners registered above.
    }
  }, [])

  function connectWallet() {
    setAccount(null)
    setWalletStatus('W5.4 TODO: request an account from the browser wallet.')
    setNetworkStatus('W5.4 TODO: check that the wallet is on Sepolia.')
  }

  function readRecord() {
    setReadStatus('W5.4 TODO: read records(account) with viem.')
    setRecordValue('The contract read has not been implemented yet.')
  }

  function saveRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setWriteStatus('W5.4 TODO: simulate, request a wallet signature, and verify the receipt.')
  }

  function loadEvents() {
    setEvents([])
    setEventsStatus('W5.5 TODO: query and display RecordUpdated events.')
  }

  return (
    <main>
      <header>
        <img src="/brand/blockchain-ntu-logo-dark.png" alt="Blockchain at NTU" width="72" height="72" />
        <div><p className="eyebrow">ACADEMY · BUILDER STARTER</p><h1>Hello from NTU Blockchain Builder Lab</h1></div>
      </header>
      <p>A small Registry on {chain.name}. Build the Web3 behaviour in the four sections below in W5.4 and W5.5.</p>
      <p className="address">Contract: {address ?? 'Deployment pending'}<br />Chain ID: {chain.id} · ABI loaded: {abi.length} entries</p>

      <section>
        <h2>1. Account &amp; network</h2>
        <p>Wallet: {account ?? walletStatus}</p>
        <p>Network: {networkStatus}</p>
        <button type="button" onClick={connectWallet}>Connect account (W5.4 TODO)</button>
      </section>

      <section>
        <h2>2. Read a record</h2>
        <p>{readStatus}</p>
        <output>{recordValue}</output>
        <p><button type="button" onClick={readRecord}>Load record (W5.4 TODO)</button></p>
      </section>

      <section>
        <h2>3. Write your record</h2>
        <form onSubmit={saveRecord}>
          <label htmlFor="record">Your record</label>
          <input
            id="record"
            value={recordInput}
            onChange={(event) => setRecordInput(event.target.value)}
            placeholder="Up to 140 UTF-8 bytes"
          />
          <button type="submit">Save record (W5.4 TODO)</button>
        </form>
        <p aria-live="polite">{writeStatus}</p>
      </section>

      <section>
        <h2>4. Events</h2>
        <p>{eventsStatus}</p>
        <button type="button" onClick={loadEvents}>Load events (W5.5 TODO)</button>
        {events.length === 0 ? (
          <p>No events loaded yet.</p>
        ) : (
          <ul>{events.map((event, index) => <li key={`${event}-${index}`}>{event}</li>)}</ul>
        )}
      </section>

      <footer>
        This page is an unfinished scaffold. Wallet requests, contract reads and writes,
        transaction states, and event retrieval are still learner work.
      </footer>
    </main>
  )
}

export default App
