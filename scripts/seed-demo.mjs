/**
 * Popula o Supabase com dados de demonstração reais (service_role).
 * Idempotente: usa IDs/chaves estáveis com prefixo demo — pode rodar de novo.
 *
 * Uso: node scripts/seed-demo.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";
import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnv() {
  const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  return Object.fromEntries(
    raw
      .split("\n")
      .filter((l) => l && !l.startsWith("#") && l.includes("="))
      .map((l) => {
        const i = l.indexOf("=");
        return [l.slice(0, i), l.slice(i + 1).replace(/^["']|["']$/g, "")];
      }),
  );
}

const env = loadEnv();
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/** UUID estável (SHA-1 → formato UUID) a partir do rótulo — idempotente entre execuções. */
function demoId(label) {
  const hex = createHash("sha1").update(`warleysales-demo:${label}`).digest("hex").slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

function assertOk(label, error) {
  if (error) throw new Error(`${label}: ${error.message}`);
}

async function upsertCouncil({ id, name, acronym, whatsappE164 }) {
  const { error } = await sb.from("councils").upsert(
    {
      id,
      name,
      acronym,
      whatsapp_e164: whatsappE164 ?? null,
      institutional_info: "Dados de demonstração para visualizar o painel.",
      active: true,
    },
    { onConflict: "id" },
  );
  assertOk(`council ${acronym}`, error);
}

async function upsertMaterial({ id, code, name, unit }) {
  const { error } = await sb.from("materials").upsert({ id, code, name, unit, active: true }, { onConflict: "id" });
  assertOk(`material ${code}`, error);
}

async function ensureStock({ councilId, materialId, physical, key, reason, actorId, minimum }) {
  const { data: bal } = await sb
    .from("stock_balances")
    .select("physical, reserved, version, minimum")
    .eq("council_id", councilId)
    .eq("material_id", materialId)
    .maybeSingle();

  const current = Number(bal?.physical ?? 0);
  const version = bal?.version ?? 0;

  if (!bal && physical === 0) {
    const { error } = await sb.from("stock_balances").insert({
      council_id: councilId,
      material_id: materialId,
      physical: 0,
      reserved: 0,
      minimum: minimum ?? 0,
      version: 0,
    });
    if (error && !error.message.includes("duplicate")) assertOk(`stock zero ${key}`, error);
  } else if (physical > current) {
    const { data, error } = await sb.rpc("apply_stock_mutation", {
      p_council: councilId,
      p_material: materialId,
      p_expected_version: version,
      p_physical: physical,
      p_reserved: bal?.reserved ?? 0,
      p_movement: {
        type: "entry",
        quantity: physical - current,
        idempotency_key: key,
        reason,
        actor_id: actorId,
        reference: null,
      },
    });
    assertOk(`stock ${key}`, error);
    if (data !== "ok" && data !== "conflict") throw new Error(`stock ${key}: ${data}`);
  }

  if (minimum != null) {
    const { error: minErr } = await sb
      .from("stock_balances")
      .update({ minimum })
      .eq("council_id", councilId)
      .eq("material_id", materialId);
    assertOk(`min ${key}`, minErr);
  }
}

async function main() {
  const { data: profiles, error: pErr } = await sb.from("profiles").select("id, full_name, is_central_admin").limit(5);
  assertOk("profiles", pErr);
  const warley = profiles?.[0];
  if (!warley) throw new Error("Nenhum perfil no banco. Faça login uma vez antes do seed.");

  const actorId = warley.id;
  console.log(`Usor: ${warley.full_name} (${actorId})`);

  // ── Conselhos ─────────────────────────────────────────────
  const CRQ = "b01cf629-c085-4be2-9838-438ce5526391"; // já existe
  const CREA = demoId("council-crea");
  const CRF = demoId("council-crf");

  await upsertCouncil({
    id: CRQ,
    name: "Conselho Regional de Química — 10ª Região",
    acronym: "CRQ",
    whatsappE164: "5585999887766",
  });
  await upsertCouncil({
    id: CREA,
    name: "Conselho Regional de Engenharia e Agronomia",
    acronym: "CREA",
    whatsappE164: "5585988776655",
  });
  await upsertCouncil({
    id: CRF,
    name: "Conselho Regional de Farmácia",
    acronym: "CRF",
    whatsappE164: "5585977665544",
  });

  // Vínculo do Warley nos conselhos (além de admin central)
  for (const [councilId, role] of [
    [CRQ, "council_manager"],
    [CREA, "council_manager"],
    [CRF, "council_operator"],
  ]) {
    const { error } = await sb.from("council_memberships").upsert(
      { user_id: actorId, council_id: councilId, role },
      { onConflict: "user_id,council_id" },
    );
    assertOk("membership", error);
  }

  // ── Materiais ─────────────────────────────────────────────
  const CADEIRA = "b2ecbd91-7a4f-46f8-b0ed-8d784899c38d";
  const MESA = demoId("mat-mesa");
  const NOTEBOOK = demoId("mat-notebook");
  const PAPEL = demoId("mat-papel");
  // ID legado da 1ª tentativa (já tem movimento imutável no ledger)
  const TONER = "7761726c-6579-4361-ac65-732d64656d6f";

  await upsertMaterial({ id: CADEIRA, code: "001", name: "Cadeira giratória", unit: "un" });
  await upsertMaterial({ id: MESA, code: "MESA-01", name: "Mesa de escritório 1,40m", unit: "un" });
  await upsertMaterial({ id: NOTEBOOK, code: "NB-14", name: "Notebook 14\" i5", unit: "un" });
  await upsertMaterial({ id: PAPEL, code: "PAP-A4", name: "Resma papel A4", unit: "resma" });
  await upsertMaterial({ id: TONER, code: "TON-HP", name: "Toner HP LaserJet", unit: "un" });

  // Alinha saldo CRQ/toner ao movimento órfão (qty 8) sem novo lançamento
  {
    const { data: bal } = await sb
      .from("stock_balances")
      .select("version")
      .eq("council_id", CRQ)
      .eq("material_id", TONER)
      .maybeSingle();
    if (!bal) {
      const { data, error } = await sb.rpc("apply_stock_mutation", {
        p_council: CRQ,
        p_material: TONER,
        p_expected_version: 0,
        p_physical: 8,
        p_reserved: 0,
        p_movement: null,
      });
      assertOk("align toner", error);
      if (data !== "ok") throw new Error(`align toner: ${data}`);
    }
  }

  // ── Estoque ───────────────────────────────────────────────
  for (const [councilId, materialId, qty, min, key] of [
    [CRQ, MESA, 8, 2, "demo-crq-mesa-8"],
    [CRQ, NOTEBOOK, 3, 1, "demo-crq-nb-3"],
    [CRQ, PAPEL, 4, 10, "demo-crq-papel-4"],
    [CRQ, TONER, 8, 3, "demo-crq-toner-8"],
    [CREA, MESA, 12, 3, "demo-crea-mesa-12"],
    [CREA, PAPEL, 25, 10, "demo-crea-papel-25"],
    [CREA, TONER, 6, 2, "demo-crea-toner-6"],
    [CRF, PAPEL, 0, 5, "demo-crf-papel-0"],
    [CRF, TONER, 1, 2, "demo-crf-toner-1"],
  ]) {
    await ensureStock({
      councilId,
      materialId,
      physical: qty,
      key,
      reason: "Carga inicial demonstração",
      actorId,
      minimum: min,
    });
  }

  await ensureStock({
    councilId: CRQ,
    materialId: CADEIRA,
    physical: 15,
    key: "demo-crq-cadeira-15",
    reason: "Saldo demonstração CRQ",
    actorId,
    minimum: 5,
  });

  // ── Fornecedores ──────────────────────────────────────────
  const SUP_ALPHA = demoId("sup-alpha");
  const SUP_BETA = demoId("sup-beta");
  for (const row of [
    { id: SUP_ALPHA, name: "Alpha Escritório Ltda", cnpj: "11222333000181", email: "contato@alpha.example", phone: "8533334444" },
    { id: SUP_BETA, name: "Beta Tecnologia SA", cnpj: "22333444000172", email: "vendas@beta.example", phone: "8532221111" },
  ]) {
    const { error } = await sb.from("suppliers").upsert({ ...row, active: true }, { onConflict: "id" });
    assertOk(`supplier ${row.name}`, error);
  }

  // ── Processos ─────────────────────────────────────────────
  const existingProcess = "fa90e287-7725-42d1-a77a-d5dffc2ac34e";
  const processes = [
    {
      id: existingProcess,
      council_id: CRQ,
      sequence: 1,
      year: 2026,
      number: "001/2026",
      title: "Aquisição de cadeiras e mesas para sede",
      status: "em_andamento",
      created_by: actorId,
    },
    {
      id: demoId("proc-crq-002"),
      council_id: CRQ,
      sequence: 2,
      year: 2026,
      number: "002/2026",
      title: "Contratação de serviços de TI",
      status: "aguardando_providencia",
      created_by: actorId,
    },
    {
      id: demoId("proc-crea-001"),
      council_id: CREA,
      sequence: 1,
      year: 2026,
      number: "001/2026",
      title: "Licenciamento de software de engenharia",
      status: "em_andamento",
      created_by: actorId,
    },
    {
      id: demoId("proc-crf-001"),
      council_id: CRF,
      sequence: 1,
      year: 2026,
      number: "001/2026",
      title: "Reforma do laboratório de análises",
      status: "concluido",
      closing_report_registered: true,
      created_by: actorId,
    },
  ];
  for (const p of processes) {
    const { error } = await sb.from("administrative_processes").upsert(p, { onConflict: "id" });
    assertOk(`process ${p.number}`, error);
  }

  // ── Atas ──────────────────────────────────────────────────
  const ATA_CRQ = demoId("ata-crq-01");
  const ATA_ITEM_MESA = demoId("ata-item-mesa");
  const ATA_ITEM_NB = demoId("ata-item-nb");
  const startAta = "2026-01-15";
  const { error: ataErr } = await sb.rpc("save_ata", {
    p: {
      id: ATA_CRQ,
      council_id: CRQ,
      number: "ARP-001/2026",
      supplier_id: SUP_ALPHA,
      start_date: startAta,
      status: "vigente",
      created_at: new Date("2026-01-15T12:00:00-03:00").toISOString(),
      items: [
        {
          id: ATA_ITEM_MESA,
          description: "Mesa de escritório 1,40m",
          material_id: MESA,
          registered_quantity: 40,
          unit_price: 890.5,
          allocations: [
            { council_id: CRQ, quantity: 25 },
            { council_id: CREA, quantity: 15 },
          ],
        },
        {
          id: ATA_ITEM_NB,
          description: "Notebook 14\" i5",
          material_id: NOTEBOOK,
          registered_quantity: 20,
          unit_price: 4200,
          allocations: [{ council_id: CRQ, quantity: 20 }],
        },
      ],
      extensions: [],
    },
  });
  assertOk("save_ata", ataErr);

  const ATA_CREA = demoId("ata-crea-01");
  const { error: ata2Err } = await sb.rpc("save_ata", {
    p: {
      id: ATA_CREA,
      council_id: CREA,
      number: "ARP-010/2026",
      supplier_id: SUP_BETA,
      start_date: "2025-11-01",
      status: "vigente",
      created_at: new Date("2025-11-01T12:00:00-03:00").toISOString(),
      items: [
        {
          id: demoId("ata-item-papel"),
          description: "Resma papel A4",
          material_id: PAPEL,
          registered_quantity: 200,
          unit_price: 28.9,
          allocations: [],
        },
      ],
      extensions: [],
    },
  });
  assertOk("save_ata crea", ata2Err);

  // ── Contratos ─────────────────────────────────────────────
  const CONTRACT_CRQ = demoId("contract-crq-01");
  const today = new Date();
  const in20 = new Date(today);
  in20.setDate(in20.getDate() + 20);
  const in90 = new Date(today);
  in90.setDate(in90.getDate() + 90);
  const pastStart = new Date(today);
  pastStart.setMonth(pastStart.getMonth() - 8);

  const { error: cErr } = await sb.rpc("save_contract", {
    p: {
      id: CONTRACT_CRQ,
      council_id: CRQ,
      number: "CT-042/2026",
      supplier_id: SUP_BETA,
      object: "Suporte e manutenção de infraestrutura de TI",
      start_date: pastStart.toISOString().slice(0, 10),
      end_date: in20.toISOString().slice(0, 10),
      value: 86400,
      created_at: pastStart.toISOString(),
      amendments: [
        {
          sequence: 1,
          reason: "Reajuste anual de valores",
          signed_at: new Date(today.getFullYear(), today.getMonth() - 1, 10).toISOString().slice(0, 10),
          previous_start_date: pastStart.toISOString().slice(0, 10),
          previous_end_date: in20.toISOString().slice(0, 10),
          previous_value: 78000,
          next_start_date: pastStart.toISOString().slice(0, 10),
          next_end_date: in20.toISOString().slice(0, 10),
          next_value: 86400,
        },
      ],
    },
  });
  assertOk("save_contract", cErr);

  const { error: c2Err } = await sb.rpc("save_contract", {
    p: {
      id: demoId("contract-crea-01"),
      council_id: CREA,
      number: "CT-015/2026",
      supplier_id: SUP_ALPHA,
      object: "Fornecimento contínuo de material de expediente",
      start_date: pastStart.toISOString().slice(0, 10),
      end_date: in90.toISOString().slice(0, 10),
      value: 45000,
      created_at: pastStart.toISOString(),
      amendments: [],
    },
  });
  assertOk("save_contract crea", c2Err);

  // ── Solicitações ──────────────────────────────────────────
  const REQ1 = demoId("req-crq-rascunho");
  const REQ2 = demoId("req-crq-analise");
  const REQ3 = demoId("req-crq-aprovada");
  const now = new Date().toISOString();

  const { error: r1 } = await sb.rpc("save_purchase_request", {
    p: {
      id: REQ1,
      council_id: CRQ,
      title: "Repos de toner para impressoras da sede",
      status: "rascunho",
      created_by: actorId,
      created_at: now,
      items: [
        {
          id: demoId("req1-item1"),
          material_id: TONER,
          quantity: 5,
          ata_item_id: null,
          received_total: 0,
        },
      ],
      events: [],
      receipt_keys: [],
    },
  });
  assertOk("req rascunho", r1);

  const { error: r2 } = await sb.rpc("save_purchase_request", {
    p: {
      id: REQ2,
      council_id: CRQ,
      title: "Compra de mesas para sala de reunião",
      status: "em_analise",
      created_by: actorId,
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      items: [
        {
          id: demoId("req2-item1"),
          material_id: MESA,
          quantity: 4,
          ata_item_id: ATA_ITEM_MESA,
          received_total: 0,
        },
      ],
      events: [
        {
          from_status: null,
          to_status: "rascunho",
          actor_id: actorId,
          at: new Date(Date.now() - 86400000 * 3).toISOString(),
          note: null,
        },
        {
          from_status: "rascunho",
          to_status: "enviada",
          actor_id: actorId,
          at: new Date(Date.now() - 86400000 * 2).toISOString(),
          note: null,
        },
        {
          from_status: "enviada",
          to_status: "em_analise",
          actor_id: actorId,
          at: new Date(Date.now() - 86400000).toISOString(),
          note: null,
        },
      ],
      receipt_keys: [],
    },
  });
  assertOk("req analise", r2);

  const { error: r3 } = await sb.rpc("save_purchase_request", {
    p: {
      id: REQ3,
      council_id: CRQ,
      title: "Notebooks para equipe administrativa",
      status: "aprovada",
      created_by: actorId,
      created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
      items: [
        {
          id: demoId("req3-item1"),
          material_id: NOTEBOOK,
          quantity: 2,
          ata_item_id: ATA_ITEM_NB,
          received_total: 0,
        },
      ],
      events: [
        {
          from_status: null,
          to_status: "rascunho",
          actor_id: actorId,
          at: new Date(Date.now() - 86400000 * 10).toISOString(),
          note: null,
        },
        {
          from_status: "rascunho",
          to_status: "enviada",
          actor_id: actorId,
          at: new Date(Date.now() - 86400000 * 9).toISOString(),
          note: null,
        },
        {
          from_status: "enviada",
          to_status: "em_analise",
          actor_id: actorId,
          at: new Date(Date.now() - 86400000 * 8).toISOString(),
          note: null,
        },
        {
          from_status: "em_analise",
          to_status: "aprovada",
          actor_id: actorId,
          at: new Date(Date.now() - 86400000 * 7).toISOString(),
          note: "Aprovado para demonstração",
        },
      ],
      receipt_keys: [],
    },
  });
  assertOk("req aprovada", r3);

  // Comprometer ata dos itens aprovados (ledger)
  const { data: commitCount } = await sb.from("ata_commitments").select("id", { count: "exact", head: true }).eq("item_id", ATA_ITEM_NB);
  const expected = commitCount ?? 0;
  // count from head returns null data - use select
  const { count: nbCommits } = await sb
    .from("ata_commitments")
    .select("*", { count: "exact", head: true })
    .eq("item_id", ATA_ITEM_NB);
  if ((nbCommits ?? 0) === 0) {
    const { data: cRes, error: cE } = await sb.rpc("append_commitment_event", {
      p_item: ATA_ITEM_NB,
      p_expected_count: 0,
      p_event: {
        event_type: "commit",
        quantity: 2,
        council_id: CRQ,
        legal_basis: "demo-aprovacao",
      },
    });
    assertOk("commit nb", cE);
    if (cRes !== "ok" && cRes !== "conflict") console.warn("commit nb:", cRes);
  }

  const { count: mesaCommits } = await sb
    .from("ata_commitments")
    .select("*", { count: "exact", head: true })
    .eq("item_id", ATA_ITEM_MESA);
  // em_analise ainda não compromete — ok

  void expected;
  void mesaCommits;

  // ── Reuniões ──────────────────────────────────────────────
  const meetSoon = new Date();
  meetSoon.setDate(meetSoon.getDate() + 5);
  meetSoon.setHours(14, 0, 0, 0);
  const meetPast = new Date();
  meetPast.setDate(meetPast.getDate() - 12);
  meetPast.setHours(10, 0, 0, 0);

  const { error: m1 } = await sb.rpc("save_meeting", {
    p: {
      id: demoId("meet-crq-1"),
      council_id: CRQ,
      title: "Pauta ordinária — compras e estoque",
      scheduled_at: meetSoon.toISOString(),
      status: "agendada",
      minutes_text: null,
      minutes_registered_by: null,
      minutes_registered_at: null,
      created_by: actorId,
      action_items: [
        {
          id: demoId("meet-crq-1-item"),
          description: "Definir prioridade dos notebooks aprovados",
          responsible_id: actorId,
          due_date: meetSoon.toISOString().slice(0, 10),
          done: false,
        },
      ],
    },
  });
  assertOk("meeting agendada", m1);

  const { error: m2 } = await sb.rpc("save_meeting", {
    p: {
      id: demoId("meet-crea-1"),
      council_id: CREA,
      title: "Alinhamento de documentação processual",
      scheduled_at: meetPast.toISOString(),
      status: "realizada",
      minutes_text: "Discussão sobre prazos do processo 001/2026. Decinição de responsáveis pelos anexos pendentes.",
      minutes_registered_by: actorId,
      minutes_registered_at: new Date(meetPast.getTime() + 3600000 * 3).toISOString(),
      created_by: actorId,
      action_items: [
        {
          id: demoId("meet-crea-1-item"),
          description: "Anexar ETP faltante no processo 001/2026",
          responsible_id: actorId,
          due_date: new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10),
          done: false,
        },
      ],
    },
  });
  assertOk("meeting realizada", m2);

  // ── Notificações / alertas ────────────────────────────────
  const milestones = [30, 15, 7];
  for (const milestone of milestones) {
    const dedup = `contract:${CONTRACT_CRQ}:${actorId}:${milestone}`;
    const { error } = await sb.from("notifications").upsert(
      {
        id: demoId(`notif-ct-${milestone}`),
        recipient_id: actorId,
        dedup_key: dedup,
        entity_type: "contract",
        entity_id: CONTRACT_CRQ,
        milestone,
        title: `Contrato CT-042/2026 vence em ${milestone} dias`,
        body: "Suporte e manutenção de infraestrutura de TI — prazo próximo.",
        read_at: null,
      },
      { onConflict: "dedup_key" },
    );
    assertOk(`notif ${milestone}`, error);
  }

  const { error: nAta } = await sb.from("notifications").upsert(
    {
      id: demoId("notif-ata-90"),
      recipient_id: actorId,
      dedup_key: `ata:${ATA_CREA}:${actorId}:90`,
      entity_type: "ata",
      entity_id: ATA_CREA,
      milestone: 90,
      title: "Ata ARP-010/2026 — marco de 90 dias",
      body: "Acompanhe a vigência da ata de papel A4 no CREA.",
      read_at: null,
    },
    { onConflict: "dedup_key" },
  );
  assertOk("notif ata", nAta);

  // ── Contagem final ────────────────────────────────────────
  const tables = [
    "councils",
    "council_memberships",
    "materials",
    "stock_balances",
    "suppliers",
    "administrative_processes",
    "price_registration_atas",
    "ata_items",
    "contracts",
    "purchase_requests",
    "meetings",
    "notifications",
  ];
  console.log("\nContagens após seed:");
  for (const t of tables) {
    const { count, error } = await sb.from(t).select("*", { count: "exact", head: true });
    console.log(`  ${t}: ${error ? error.message : count}`);
  }
  console.log("\nPronto. Abra /dashboard, /meu-conselho, /solicitacoes, /processos, /estoque, /reunioes.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
