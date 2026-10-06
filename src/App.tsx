import { address, abi, chain } from '../shared/contract'
import './App.css'

function App() {
  // W5.4 TODO: account/network — request a wallet account and check its chain.
  // W5.4 TODO: read — use viem with the shared address, chain and ABI.
  // W5.4 TODO: write — set your record; show pending, success and error states.
  // W5.5 TODO: events — load RecordUpdated logs and render the activity list.
  // Keep wallet and chain interactions as learner work; this page is a scaffold.
  return (
    <main>
      <header>
        <img src="/brand/blockchain-ntu-logo-dark.png" alt="Blockchain at NTU" width="72" height="72" />
        <div><p className="eyebrow">ACADEMY · BUILDER STARTER</p><h1>Hello from NTU Blockchain Builder Lab</h1></div>
      </header>
      <p>A small Registry on {chain.name}. Build the four sections below in W5.4 and W5.5.</p>
      <p className="address">Contract: {address ?? 'Deployment pending'}<br />Chain ID: {chain.id} · ABI loaded: {abi.length} entries</p>
      <section><h2>1. Account & network</h2><p>TODO: connect an account and show the selected network.</p><button disabled>Connect account (TODO)</button></section>
      <section><h2>2. Read a record</h2><p>TODO: read a record from the contract and display its value.</p><output>No value loaded yet.</output></section>
      <section><h2>3. Write your record</h2><p>TODO: submit a record and show the transaction status.</p><label htmlFor="record">Your record</label><input id="record" placeholder="Up to 140 UTF-8 bytes" disabled /><button disabled>Save record (TODO)</button></section>
      <section><h2>4. Events</h2><p>TODO: fetch RecordUpdated events and render a list.</p><ul><li>No events loaded yet.</li></ul></section>
      <footer>No wallet is connected. These TODOs are intentionally unfinished.</footer>
    </main>
  )
}
export default App
