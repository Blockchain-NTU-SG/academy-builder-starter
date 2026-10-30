import { BaseError, ContractFunctionRevertedError } from 'viem'

/** Return the ABI-decoded custom contract error name, when viem found one. */
export function contractErrorName(error: unknown): string | undefined {
  if (!(error instanceof BaseError)) return undefined

  const revert = error.walk((cause) => cause instanceof ContractFunctionRevertedError)
  if (!(revert instanceof ContractFunctionRevertedError)) return undefined

  return revert.data?.errorName
}
