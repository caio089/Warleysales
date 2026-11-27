import type { SupabaseClient } from "@supabase/supabase-js";
import { idSchema } from "@/shared/lib/service-support";
import type { AtaRepository } from "@/modules/atas/repository";
import type { AtaStatus, PriceRegistrationAta } from "@/modules/atas/schemas";
import type { CommitmentEvent } from "@/modules/atas/domain/balance";
import { fail, ok, type Result } from "@/shared/lib/result";
import { MAX_CAS_ATTEMPTS, callRpc, isUniqueViolation, selectAll, toDate, toIso, toNumber, unwrap, type DbResponse } from "../db";

interface AtaRow {
  id: string;
  council_id: string;
  number: string;
  supplier_id: string | null;
  process_id?: string | null;
  start_date: string;
  status: AtaStatus;
  created_at: string;
  ata_items: {
    id: string;
    seq: number;
    description: string;
    material_id: string | null;
    registered_quantity: number | string;
    unit_price: number | string;
    ata_allocations: { council_id: string; quantity: number | string }[];
  }[];
  ata_extensions: { position: number; requested_by: string; previous_end_date: string; new_end_date: string; legal_basis: string }[];
}

const ATA_SELECT = "*, ata_items(*, ata_allocations(*)), ata_extensions(*)";

const toAta = (row: AtaRow): PriceRegistrationAta => ({
  id: row.id,
  councilId: row.council_id,
  number: row.number,
  supplierId: row.supplier_id,
  processId: row.process_id ?? null,
  startDate: row.start_date,
  status: row.status,
  createdAt: toDate(row.created_at),
  items: [...row.ata_items].sort((a, b) => a.seq - b.seq).map((item) => ({
    id: item.id,
    description: item.description,
    materialId: item.material_id,
    registeredQuantity: toNumber(item.registered_quantity),
    unitPrice: toNumber(item.unit_price),
    allocations: item.ata_allocations.map((a) => ({ councilId: a.council_id, quantity: toNumber(a.quantity) })),
  })),
  extensions: [...row.ata_extensions].sort((a, b) => a.position - b.position).map((e) => ({
    requestedBy: e.requested_by, previousEndDate: e.previous_end_date, newEndDate: e.new_end_date, legalBasis: e.legal_basis,
  })),
});

const toPayload = (ata: PriceRegistrationAta) => ({
  id: ata.id, council_id: ata.councilId, number: ata.number, supplier_id: ata.supplierId, process_id: ata.processId ?? null, start_date: ata.startDate,
  status: ata.status, created_at: toIso(ata.createdAt),
  items: ata.items.map((i) => ({
    id: i.id, description: i.description, material_id: i.materialId, registered_quantity: i.registeredQuantity, unit_price: i.unitPrice,
    allocations: i.allocations.map((a) => ({ council_id: a.councilId, quantity: a.quantity })),
  })),
  extensions: ata.extensions.map((e) => ({
    requested_by: e.requestedBy, previous_end_date: e.previousEndDate, new_end_date: e.newEndDate, legal_basis: e.legalBasis,
  })),
});

interface CommitmentRow {
  item_id?: string;
  event_type: CommitmentEvent["type"];
  quantity: number | string;
  council_id: string;
  legal_basis: string | null;
}

const toCommitment = (r: CommitmentRow): CommitmentEvent => ({
  type: r.event_type,
  quantity: toNumber(r.quantity),
  councilId: r.council_id,
  ...(r.legal_basis ? { legalBasis: r.legal_basis } : {}),
});

export class SupabaseAtaRepository implements AtaRepository {
  constructor(private readonly db: SupabaseClient) {}

  async insert(ata: PriceRegistrationAta, replacementJustification?: string) {
    const response = (ata.processId
      ? await this.db.rpc("register_process_ata", { p: toPayload(ata), p_justification: replacementJustification ?? null })
      : await this.db.rpc("save_ata", { p: toPayload(ata) })) as DbResponse<null>;
    if (response.error?.code === "P0001" && response.error.message === "ata_replacement_justification_required") {
      return fail("VALIDATION", "Informe a justificativa para cadastrar outra ata neste processo.", {
        replacementJustification: ["A justificativa é obrigatória."],
      });
    }
    if (isUniqueViolation(response.error)) {
      return fail("CONFLICT", "Já existe uma ata com este número neste órgão. Altere o número.", {
        number: ["Número já cadastrado."],
      });
    }
    unwrap("rpc.save_ata", response);
    return ok(ata);
  }

  /** Persiste a ata de forma transacional (RPC): itens são imutáveis, alocações são substituídas, prorrogações são acrescentadas. */
  async save(ata: PriceRegistrationAta) {
    await callRpc(this.db, "save_ata", { p: toPayload(ata) });
    return ata;
  }

  async findById(id: string) {
    const row = unwrap("atas.find", await this.db.from("price_registration_atas").select(ATA_SELECT).eq("id", id).maybeSingle<AtaRow>());
    return row ? toAta(row) : null;
  }

  async findByItemId(itemId: string) {
    const item = unwrap("atas.findItem", await this.db.from("ata_items").select("ata_id").eq("id", itemId).maybeSingle<{ ata_id: string }>());
    return item ? this.findById(item.ata_id) : null;
  }

  async listByCouncils(councilIds: readonly string[] | "all", process?: { id: string; councilId: string }) {
    if (councilIds !== "all" && councilIds.length === 0) return [];
    const rows = await selectAll<AtaRow>("atas.list", (from, to) => {
      let query = this.db.from("price_registration_atas").select(ATA_SELECT).order("created_at", { ascending: false }).range(from, to);
      if (process) {
        const processId = idSchema.parse(process.id);
        const councilId = idSchema.parse(process.councilId);
        query = query.or(`process_id.eq.${processId},and(process_id.is.null,council_id.eq.${councilId})`);
      }
      return councilIds === "all" ? query : query.in("council_id", [...councilIds]);
    });
    return rows.map(toAta);
  }

  async listEvents(itemId: string): Promise<CommitmentEvent[]> {
    const rows = await selectAll<CommitmentRow>("atas.events", (from, to) =>
      this.db.from("ata_commitments").select("event_type, quantity, council_id, legal_basis").eq("item_id", itemId).order("id").range(from, to),
    );
    return rows.map(toCommitment);
  }

  async listEventsByItemIds(itemIds: readonly string[]): Promise<Map<string, CommitmentEvent[]>> {
    const map = new Map<string, CommitmentEvent[]>();
    for (const itemId of itemIds) map.set(itemId, []);
    if (itemIds.length === 0) return map;

    const CHUNK = 100;
    for (let i = 0; i < itemIds.length; i += CHUNK) {
      const chunk = itemIds.slice(i, i + CHUNK);
      const rows = await selectAll<CommitmentRow>("atas.events", (from, to) =>
        this.db
          .from("ata_commitments")
          .select("item_id, event_type, quantity, council_id, legal_basis")
          .in("item_id", chunk)
          .order("id")
          .range(from, to),
      );
      for (const row of rows) {
        if (!row.item_id) continue;
        const bucket = map.get(row.item_id);
        if (bucket) bucket.push(toCommitment(row));
        else map.set(row.item_id, [toCommitment(row)]);
      }
    }
    return map;
  }

  /**
   * Lê o ledger, deixa o serviço decidir (saldo/alocação) e grava pela RPC `append_commitment_event`,
   * que trava o item (FOR UPDATE) e confirma que o ledger não mudou desde a leitura (H3).
   */
  async appendEventAtomically(itemId: string, decide: (events: readonly CommitmentEvent[]) => Result<CommitmentEvent>): Promise<Result<CommitmentEvent>> {
    for (let attempt = 0; attempt < MAX_CAS_ATTEMPTS; attempt += 1) {
      const events = await this.listEvents(itemId);
      const decision = decide(events);
      if (!decision.ok) return decision;
      const event = decision.data;
      const outcome = await callRpc<string>(this.db, "append_commitment_event", {
        p_item: itemId,
        p_expected_count: events.length,
        p_event: { event_type: event.type, quantity: event.quantity, council_id: event.councilId, legal_basis: event.legalBasis ?? null },
      });
      if (outcome === "ok") return decision;
    }
    return fail("CONFLICT", "O saldo da ata está sendo alterado por outra operação. Tente novamente.");
  }
}
