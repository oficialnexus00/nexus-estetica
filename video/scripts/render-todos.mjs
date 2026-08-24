// Renderiza todos os roteiros de uma vez: `npm run render:todos`.
// E esse o gancho pro n8n depois — trocar o loop por uma chamada HTTP.
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { ROTEIROS } from "../src/lib/roteiros.ts";

mkdirSync("out", { recursive: true });

for (const roteiro of ROTEIROS) {
  console.log(`\n▶  ${roteiro.id} — ${roteiro.tema}`);
  execFileSync(
    "npx",
    ["remotion", "render", roteiro.id, `out/${roteiro.id}.mp4`],
    { stdio: "inherit" },
  );
}

console.log(`\n✅ ${ROTEIROS.length} videos em out/`);
