import type { SupabaseClient } from "@supabase/supabase-js";
import type { FormalizationFilter, FormalizationRepository } from "@/modules/formalizations/repository";
import type { FormalizationStatus, InstrumentType, ProcessFormalization } from "@/modules/formalizations/domain/formalization";
import { selectAll, toDate, toIso, toNumber, unwrap } from "../db";

interface FormalizationRow {
  id: string;
  process_id: string;
  request_id: string | null;
  council_id: string;
  supplier_id: string;
  instrument_type: string;
  instrument_number: string;
  estimated_value: number | string;
  contracted_value: number | string;
  savings_value: number | string;
  savings_percent: number | string;
  auction_date?: string | null;
  contracted_quantity?: number | string | null;
  status: string;
  homologated_by: string | null;
  homologated_at: string | null;
  homologation_note: string | null;
  created_by: string;
  created_at: string;
}

const toRow = (f: ProcessFormalization) => ({
  id: f.id,
  process_id: f.processId,
  request_id: f.requestId,
  council_id: f.councilId,
  supplier_id: f.supplierId,
  instrument_type: f.instrumentType,
  instrument_number: f.instrumentNumber,
  estimated_value: f.estimatedValue,
  contracted_value: f.contractedValue,
  savings_value: f.savingsValue,
  savings_percent: f.savingsPercent,
  status: f.status,
  homologated_by: f.homologatedBy,
  homologated_at: f.homologatedAt ? toIso(f.homologatedAt) : null,
  homologation_note: f.homologationNote,
  created_by: f.createdBy,
  created_at: toIso(f.createdAt),
});

const fromRow = (row: FormalizationRow): ProcessFormalization => ({
  id: row.id,
  processId: row.process_id,
  requestId: row.request_id,
  councilId: row.council_id,
  supplierId: row.supplier_id,
  instrumentType: row.instrument_type as InstrumentType,
  instrumentNumber: row.instrument_number,
  estimatedValue: toNumber(row.estimated_value),
  contractedValue: toNumber(row.contracted_value),
  savingsValue: toNumber(row.savings_value),
  savingsPercent: toNumber(row.savings_percent),
  auctionDate: row.auction_date,
  contractedQuantity: row.contracted_quantity == null ? null : toNumber(row.contracted_quantity),
  status: row.status as FormalizationStatus,
  homologatedBy: row.homologated_by,
  homologatedAt: row.homologated_at ? toDate(row.homologated_at) : null,
  homologationNote: row.homologation_note,
  createdBy: row.created_by,
  createdAt: toDate(row.created_at),
});

export class SupabaseFormalizationRepository implements FormalizationRepository {
  constructor(private readonly db: SupabaseClient) {}

  async insert(formalization: ProcessFormalization): Promise<ProcessFormalization> {
    const { error } = await this.db.from("process_formalizations").insert(toRow(formalization));
    unwrap("formalizations.insert", { data: null, error });
    return formalization;
  }

  async findByProcessId(processId: string): Promise<ProcessFormalization | null> {
    const row = unwrap(
      "formalizations.findByProcessId",
      await this.db.from("process_formalizations").select().eq("process_id", processId).maybeSingle<FormalizationRow>(),
    );
    return row ? fromRow(row) : null;
  }

  async findById(id: string): Promise<ProcessFormalization | null> {
    const row = unwrap(
      "formalizations.findById",
      await this.db.from("process_formalizations").select().eq("id", id).maybeSingle<FormalizationRow>(),
    );
    return row ? fromRow(row) : null;
  }

  async update(
    id: string,
    patch: Partial<Pick<ProcessFormalization, "status" | "homologatedBy" | "homologatedAt" | "homologationNote">>,
  ): Promise<ProcessFormalization> {
    const patchRow: Record<string, unknown> = {};
    if (patch.status !== undefined) patchRow.status = patch.status;
    if (patch.homologatedBy !== undefined) patchRow.homologated_by = patch.homologatedBy;
    if (patch.homologatedAt !== undefined) patchRow.homologated_at = patch.homologatedAt ? toIso(patch.homologatedAt) : null;
    if (patch.homologationNote !== undefined) patchRow.homologation_note = patch.homologationNote;

    const { data, error } = await this.db
      .from("process_formalizations")
      .update(patchRow)
      .eq("id", id)
      .select()
      .single<FormalizationRow>();
    const row = unwrap("formalizations.update", { data, error });
    return fromRow(row);
  }

  async listByCouncils(
    councilIds: readonly string[] | "all",
    filter?: FormalizationFilter,
  ): Promise<ProcessFormalization[]> {
    if (councilIds !== "all" && councilIds.length === 0) return [];
    const rows = await selectAll<FormalizationRow>("formalizations.list", (from, to) => {
      let query = this.db.from("process_formalizations").select().order("created_at", { ascending: false }).range(from, to);
      if (councilIds !== "all") query = query.in("council_id", [...councilIds]);
      if (filter?.status) query = query.eq("status", filter.status);
      return query;
    });
    return rows.map(fromRow);
  }
}
