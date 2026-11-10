// Verificação SOMENTE LEITURA do projeto Supabase configurado em .env.local.
// Uso: npm run db:check   (nunca imprime chaves)
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n").filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
);
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const publishable = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRole = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !publishable) { console.error("Faltam URL/chave publicável em .env.local"); process.exit(2); }
if (!serviceRole) { console.error("SUPABASE_SERVICE_ROLE_KEY vazia em .env.local (cole de Settings > API)."); process.exit(2); }

const opts = { auth: { persistSession: false, autoRefreshToken: false } };
const admin = createClient(url, serviceRole, opts);
const anon = createClient(url, publishable, opts);
const results = [];
const check = (ok, name, detail = "") => { results.push(ok); console.log(`${ok ? "OK   " : "FALHA"} ${name}${detail ? ` — ${detail}` : ""}`); };

const TABLES = ["profiles", "councils", "council_memberships", "audit_logs", "document_types", "administrative_processes", "attachments",
  "retention_authorizations", "retention_holds", "document_cleanup_runs", "suppliers", "materials", "stock_balances", "stock_movements",
  "price_registration_atas", "ata_items", "ata_allocations", "ata_extensions", "ata_commitments", "contracts", "contract_amendments",
  "purchase_requests", "purchase_request_items", "purchase_request_events", "purchase_receipt_keys", "stock_transfers", "stock_transfer_items",
  "stock_transfer_events", "meetings", "meeting_action_items", "notifications", "scheduled_job_runs"];

for (const table of TABLES) {
  const { error } = await admin.from(table).select("*").limit(1);
  check(!error, `tabela public.${table}`, error?.message ?? "");
}
let types = await admin.from("document_types").select("code").eq("is_required", true).order("position");
if (types.error && types.error.message.includes("is_required")) {
  types = await admin.from("document_types").select("code").in("code", ["DFD", "ETP", "MR", "TR", "PP", "PJ", "ED"]).order("position");
}
check(types.data?.length === 7, "seed: 7 tipos documentais obrigatórios", types.data?.map((t) => t.code).join(",") ?? types.error?.message);

const buckets = await admin.storage.listBuckets();
const bucket = buckets.data?.find((b) => b.id === "process-documents");
check(Boolean(bucket) && bucket.public === false, "bucket process-documents existe e é privado");

for (const [fn, args] of [["approve_purchase_request", { p_request: "00000000-0000-0000-0000-000000000000", p_actor: "00000000-0000-0000-0000-000000000000", p_at: new Date().toISOString() }]]) {
  const r = await admin.rpc(fn, args);
  check(r.data?.code === "NOT_FOUND", `RPC ${fn} responde (service_role)`, r.error?.message ?? "");
  const denied = await anon.rpc(fn, args);
  check(Boolean(denied.error), `RPC ${fn} negada à chave publicável`, denied.error?.code ?? "sem erro!");
}
const anonRead = await anon.from("administrative_processes").select("id").limit(1);
check(Boolean(anonRead.error), "chave publicável não lê tabelas de domínio", anonRead.error?.code ?? "leitura permitida!");

const failed = results.filter((ok) => !ok).length;
console.log(failed === 0 ? "\nTudo certo." : `\n${failed} verificação(ões) falharam.`);
process.exit(failed === 0 ? 0 : 1);
