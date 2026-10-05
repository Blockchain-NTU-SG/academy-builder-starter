import "./style.css";
import { startParticles } from "./particles";
const stopParticles = startParticles();
if (import.meta.hot) import.meta.hot.dispose(() => stopParticles?.());
import {
  createWalletClient,
  custom,
  http,
  type Address,
  type EIP1193Provider,
  type Hex,
} from "viem";
import { abi } from "../shared/abi";
import {
  chain,
  rpcUrl,
  publicClient,
  parseDeployment,
  assertDeployment,
  describeError,
  type Deployment,
} from "../shared/chain";

const $ = <T extends HTMLElement>(id: string) =>
  document.getElementById(id) as T;
const input = $<HTMLTextAreaElement>("message-input");
const submit = $<HTMLButtonElement>("submit");
const provider = (window as Window & { ethereum?: EIP1193Provider }).ethereum;
let deployed: Deployment | undefined;
let account: Address | undefined;
let mode: "demo" | "wallet" | undefined;
let busy = false;
let walletChain: number | undefined;
let refreshPromise: Promise<void> | undefined;
const short = (s: string) => `${s.slice(0, 8)}…${s.slice(-6)}`;
const status = (message: string, error = false) => {
  $("status").textContent = message;
  $("status").classList.toggle("error", error);
};

function controls() {
  const bytes = new TextEncoder().encode(input.value).length;
  $("byte-count").textContent = `${bytes} / 140`;
  $("byte-count").classList.toggle("over", bytes > 140);
  submit.disabled =
    busy ||
    !deployed ||
    !account ||
    bytes === 0 ||
    bytes > 140 ||
    (mode === "wallet" && walletChain !== 31337);
  $<HTMLButtonElement>("demo").disabled = busy;
  $<HTMLButtonElement>("connect").disabled = busy;
  $("switch-network").hidden = mode !== "wallet" || walletChain === 31337;
  $("account-label").textContent = account
    ? `${mode === "demo" ? "Local demo" : "Wallet"} · ${short(account)}`
    : "Choose an account to get started";
  $("account-label").title = account ?? "";
}

async function refreshInner() {
  const response = await fetch(`/deployment.json?time=${Date.now()}`, {
    cache: "no-store",
  });
  if (!response.ok)
    throw new Error(
      "No deployment yet. Run npm run deploy, then click Refresh.",
    );
  let raw: unknown;
  try {
    raw = await response.json();
  } catch {
    throw new Error(
      "No deployment yet. Run npm run deploy, then click Refresh.",
    );
  }
  const d = parseDeployment(raw);
  await assertDeployment(d);
  const contract = { address: d.address, abi };
  const [message, count, visitor, events] = await Promise.all([
    publicClient.readContract({ ...contract, functionName: "message" }),
    publicClient.readContract({ ...contract, functionName: "visitCount" }),
    publicClient.readContract({ ...contract, functionName: "lastVisitor" }),
    publicClient.getContractEvents({
      ...contract,
      eventName: "MessageChanged",
      fromBlock: BigInt(d.blockNumber),
      toBlock: "latest",
      strict: true,
    }),
  ]);
  deployed = d;
  $("current-message").textContent = message;
  $("visit-count").textContent = count.toString();
  $("last-visitor").textContent =
    count === 0n ? "You could be first" : short(visitor);
  $("last-visitor").title = visitor;
  $("contract-address").textContent = short(d.address);
  $("contract-address").title = d.address;
  $("chain-status").textContent = "Connected · 31337";
  $("event-count").textContent =
    `${events.length} event${events.length === 1 ? "" : "s"}`;
  const list = $("event-list");
  list.replaceChildren();
  for (const event of events.slice(-20).reverse()) {
    const li = document.createElement("li");
    const icon = document.createElement("span");
    icon.className = "event-icon";
    icon.textContent = "↗";
    const body = document.createElement("div");
    const text = document.createElement("p");
    text.className = "event-message";
    text.textContent = event.args.newMessage;
    const detail = document.createElement("div");
    detail.className = "event-details";
    detail.textContent = `${short(event.args.visitor)} · tx ${short(event.transactionHash)}`;
    detail.title = event.transactionHash;
    const block = document.createElement("span");
    block.className = "event-block";
    block.textContent = `Block ${event.blockNumber}`;
    body.append(text, detail);
    li.append(icon, body, block);
    list.append(li);
  }
  if (!events.length) {
    const li = document.createElement("li");
    li.className = "empty";
    li.textContent = "No messages yet. Your first update starts the story.";
    list.append(li);
  }
}

async function refresh() {
  if (refreshPromise) return refreshPromise;
  refreshPromise = refreshInner()
    .catch((error) => {
      deployed = undefined;
      $("chain-status").textContent = "Not connected";
      status(describeError(error), true);
      throw error;
    })
    .finally(() => {
      refreshPromise = undefined;
      controls();
    });
  return refreshPromise;
}

$("demo").addEventListener("click", async () => {
  try {
    await refresh();
    const accounts = await createWalletClient({
      chain,
      transport: http(rpcUrl),
    }).getAddresses();
    if (!accounts[0])
      throw new Error("No local demo account. Restart npm run chain.");
    account = accounts[0];
    mode = "demo";
    $("mode-note").textContent =
      "Local demo: the practice node approves transactions automatically. A real wallet asks you to approve each transaction.";
    status("Local demo account ready. Enter a message to begin.");
  } catch (error) {
    status(describeError(error), true);
  }
  controls();
});

$("connect").addEventListener("click", async () => {
  try {
    if (!provider)
      throw new Error(
        "No browser wallet detected. Install a wallet, or choose Use local demo.",
      );
    const accounts = await provider.request({ method: "eth_requestAccounts" });
    account = accounts[0];
    mode = "wallet";
    walletChain = Number(await provider.request({ method: "eth_chainId" }));
    $("mode-note").textContent =
      "Wallet mode: use a disposable practice account funded with local test ETH. Never import your real wallet into a demo.";
    status(
      walletChain === 31337
        ? "Wallet connected. Enter a message."
        : "Your wallet is on another network. Switch to the local practice network.",
    );
  } catch (error) {
    status(describeError(error), true);
  }
  controls();
});

$("switch-network").addEventListener("click", async () => {
  try {
    if (!provider) return;
    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x7a69" }],
      });
    } catch (error) {
      if ((error as { code?: number }).code !== 4902) throw error;
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x7a69",
            chainName: "Anvil Local Practice",
            nativeCurrency: { name: "Test Ether", symbol: "ETH", decimals: 18 },
            rpcUrls: [rpcUrl],
          },
        ],
      });
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x7a69" }],
      });
    }
    walletChain = Number(await provider.request({ method: "eth_chainId" }));
    status(
      "Local network selected. Make sure your practice account has local test ETH.",
    );
  } catch (error) {
    status(describeError(error), true);
  }
  controls();
});

provider?.on("accountsChanged", (accounts) => {
  if (mode === "wallet") {
    account = accounts[0];
    status(
      account
        ? "Wallet account changed."
        : "Wallet disconnected. Connect again to write.",
    );
    controls();
  }
});
provider?.on("chainChanged", (id) => {
  walletChain = Number(id);
  if (mode === "wallet") {
    status(
      walletChain === 31337
        ? "Wallet is on the local practice network."
        : "Wrong wallet network. Switch back to local practice.",
    );
    controls();
  }
});
provider?.on("disconnect", () => {
  if (mode === "wallet") {
    account = undefined;
    controls();
    status("Wallet disconnected.");
  }
});
input.addEventListener("input", controls);
$("refresh").addEventListener("click", () => {
  void refresh()
    .then(() => status("Latest chain data loaded."))
    .catch(() => {});
});

$("message-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (submit.disabled || busy || !account || !deployed) return;
  busy = true;
  controls();
  let hash: Hex | undefined;
  let confirmed = false;
  for (const id of ["simulate", "submit", "confirm"])
    $(`step-${id}`).className = "";
  $("transaction-hash").textContent = "";
  try {
    await assertDeployment(deployed);
    const writer = account;
    const text = input.value;
    const wallet = createWalletClient({
      account: writer,
      chain,
      transport:
        mode === "wallet" && provider ? custom(provider) : http(rpcUrl),
    });
    if ((await wallet.getChainId()) !== 31337)
      throw new Error(
        "Wrong wallet network. Select the local practice network.",
      );
    $("step-simulate").className = "active";
    status("Checking the contract rules…");
    const { request } = await publicClient.simulateContract({
      address: deployed.address,
      abi,
      functionName: "setMessage",
      args: [text],
      account: writer,
    });
    $("step-simulate").className = "done";
    $("step-submit").className = "active";
    status(
      mode === "wallet"
        ? "Approve the transaction in your wallet."
        : "Sending from the local demo account…",
    );
    hash = await wallet.writeContract(request);
    $("transaction-hash").textContent = hash;
    $("step-submit").className = "done";
    $("step-confirm").className = "active";
    status("Transaction sent. Waiting for the chain to confirm it…");
    const receipt = await publicClient.waitForTransactionReceipt({
      hash,
      timeout: 30_000,
    });
    if (receipt.status !== "success")
      throw new Error(
        "The transaction was included but reverted. Your message was not saved.",
      );
    confirmed = true;
    $("step-confirm").className = "done";
    await refresh();
    status("Confirmed. Your message was saved to the blockchain.");
    if (input.value === text) input.value = "";
  } catch (error) {
    status(
      confirmed
        ? `Transaction confirmed, but refreshing failed. ${describeError(error)}`
        : hash
          ? `Transaction ${short(hash)} was submitted. ${describeError(error)} Check its receipt before retrying.`
          : describeError(error),
      true,
    );
  } finally {
    busy = false;
    controls();
  }
});

void refresh()
  .then(() =>
    status("Guestbook ready. Choose a local demo account or connect a wallet."),
  )
  .catch(() => {});
