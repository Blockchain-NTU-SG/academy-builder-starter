import { abi } from "./abi.js";
import { publicClient, type Deployment } from "./chain.js";

export async function readHistory(d: Deployment) {
  // A fixed upper block makes the two event queries a consistent snapshot.
  const toBlock = await publicClient.getBlockNumber({ cacheTime: 0 });
  const filter = {
    address: d.address,
    abi,
    fromBlock: BigInt(d.blockNumber),
    toBlock,
    strict: true,
  } as const;
  const [changed, cleared] = await Promise.all([
    publicClient.getContractEvents({ ...filter, eventName: "MessageChanged" }),
    publicClient.getContractEvents({ ...filter, eventName: "MessageCleared" }),
  ]);
  return [
    ...changed.map((log) => ({
      ...log,
      visitor: log.args.visitor,
      message: log.args.newMessage,
      kind: "changed" as const,
    })),
    ...cleared.map((log) => ({
      ...log,
      visitor: log.args.by,
      message: "Message cleared by owner",
      kind: "cleared" as const,
    })),
  ].sort((a, b) =>
    a.blockNumber === b.blockNumber
      ? a.logIndex - b.logIndex
      : a.blockNumber < b.blockNumber
        ? -1
        : 1,
  );
}
