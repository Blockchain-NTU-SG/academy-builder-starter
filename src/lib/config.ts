import { abi, chain } from '../../shared/contract'

// One place for everything the app needs to find the Registry on Sepolia.
export const registryAddress = '0xf3eea9aa5a43846490a638f1b2bebb29ac2938b0' as const
export const registryAbi = abi
export const registryChain = chain

// Block the Registry was deployed in (see deployments/sepolia.json).
// Event history is read from here onwards.
export const deploymentBlock = 11853110n
