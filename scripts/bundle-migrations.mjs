// Concatena as migrations em ordem em supabase/apply_all.sql para colar no SQL Editor do painel Supabase
// (alternativa a `supabase link` + `supabase db push`). Regenere sempre que uma migration mudar.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const migrationsDir = resolve(root, "supabase/migrations");
const outFile = resolve(root, "supabase/apply_all.sql");

const files = readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

let content = "-- GERADO por scripts/bundle-migrations.mjs — não edite; edite supabase/migrations/*.sql e regenere.\n";
content += "-- Aplicar UMA vez em projeto novo/vazio (SQL Editor). Roda tudo em uma transação: falhou = nada é aplicado.\n";
content += "begin;\n";

for (const file of files) {
  const filePath = resolve(migrationsDir, file);
  const sql = readFileSync(filePath, "utf8").trim();
  content += `\n-- ===== ${basename(file)} =====\n${sql}\n`;
}

content += "\ncommit;\n";

writeFileSync(outFile, content, "utf8");
const lineCount = content.split("\n").length;
console.log(`Gerado supabase/apply_all.sql (${lineCount} linhas)`);
