import { spawnSync } from "node:child_process";
let failed = false;
console.log(`Node ${process.version}`);
if (Number(process.versions.node.split(".")[0]) < 22) {
  console.error("Use Node 22.18+ (recommended: the .nvmrc version).");
  failed = true;
}
for (const name of ["git", "forge", "anvil"]) {
  const result = spawnSync(name, ["--version"], { encoding: "utf8" });
  if (result.status !== 0) {
    console.error(`${name} is missing. See README → Install the tools.`);
    failed = true;
  } else console.log(result.stdout.split("\n")[0]);
}
console.log(
  failed
    ? "Fix the missing tools, then run npm run doctor again."
    : "Tools ready. Start npm run chain in another terminal, then npm run deploy.",
);
process.exitCode = failed ? 1 : 0;
