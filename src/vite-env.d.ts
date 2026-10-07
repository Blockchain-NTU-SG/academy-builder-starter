/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RPC_URL?: string
}

interface Window {
  ethereum?: import('viem').EIP1193Provider
}
