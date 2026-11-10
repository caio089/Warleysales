import type { SupabaseClient } from "@supabase/supabase-js";
import type { InventoryRepository, StockKey, StockMutation, StockRow, StockState } from "@/modules/inventory/repository";
import type { Material, MovementRecord } from "@/modules/inventory/schemas";
import type { MovementType } from "@/modules/inventory/domain/stock";
import { fail, ok, type Result } from "@/shared/lib/result";
import { MAX_CAS_ATTEMPTS, callRpc, isUniqueViolation, selectAll, toDate, toNumber, unwrap } from "../db";

interface MaterialRow {
  id: string;
  code: string;
  name: string;
  unit: string;
  active: boolean;
}

interface BalanceRow {
  council_id: string;
  material_id: string;
  physical: number | string;
  reserved: number | string;
  blocked?: number | string;
  minimum: number | string;
  version: number;
}

interface MovementRow {
  id: number;
  council_id: string;
  material_id: string;
  type: MovementType;
  quantity: number | string;
  idempotency_key: string;
  reason: string;
  reference: string | null;
  actor_id: string | null;
  created_at: string;
}

const toMovement = (row: MovementRow): MovementRecord => ({
  id: String(row.id), councilId: row.council_id, materialId: row.material_id, type: row.type, quantity: toNumber(row.quantity),
  idempotencyKey: row.idempotency_key, reason: row.reason, reference: row.reference, actorId: row.actor_id, createdAt: toDate(row.created_at),
});

export class SupabaseInventoryRepository implements InventoryRepository {
  constructor(private readonly db: SupabaseClient) {}

  async insertMaterial(material: Material): Promise<Result<Material>> {
    const { error } = await this.db.from("materials").insert(material);
    if (isUniqueViolation(error)) return fail("CONFLICT", "Já existe material com este código.");
    unwrap("materials.insert", { data: null, error });
    return ok(material);
  }

  async findMaterial(id: string) {
    return unwrap("materials.find", await this.db.from("materials").select().eq("id", id).maybeSingle<Material>());
  }

  async listMaterials() {
    return selectAll<MaterialRow>("materials.list", (from, to) => this.db.from("materials").select().order("code").range(from, to));
  }

  /**
   * Atomicidade por controle otimista: lê saldo+versão, calcula em memória e grava via RPC
   * `apply_stock_mutation` (FOR UPDATE + checagem de versão + ledger na mesma transação).
   * Se outra transação alterar o saldo no meio, a RPC devolve 'conflict' e relemos (até MAX_CAS_ATTEMPTS).
   */
  async transact<T>(key: StockKey, mutate: (state: StockState) => Result<StockMutation<T>>): Promise<Result<T>> {
    for (let attempt = 0; attempt < MAX_CAS_ATTEMPTS; attempt += 1) {
      const row = unwrap(
        "stock.read",
        await this.db.from("stock_balances").select().eq("council_id", key.councilId).eq("material_id", key.materialId).maybeSingle<BalanceRow>(),
      );
      const keys = await selectAll<{ idempotency_key: string }>("stock.keys", (from, to) =>
        this.db.from("stock_movements").select("idempotency_key").eq("council_id", key.councilId).eq("material_id", key.materialId).order("id").range(from, to),
      );
      const state: StockState = {
        balance: {
          physical: toNumber(row?.physical ?? 0),
          reserved: toNumber(row?.reserved ?? 0),
          blocked: toNumber(row?.blocked ?? 0),
        },
        minimum: toNumber(row?.minimum ?? 0),
        processedKeys: new Set(keys.map((k) => k.idempotency_key)),
      };

      const result = mutate(state);
      if (!result.ok) return result;
      const { balance, movement, value } = result.data;

      const outcome = await callRpc<string>(this.db, "apply_stock_mutation", {
        p_council: key.councilId,
        p_material: key.materialId,
        p_expected_version: row?.version ?? 0,
        p_physical: balance.physical,
        p_reserved: balance.reserved,
        p_blocked: balance.blocked,
        p_movement: movement
          ? { type: movement.type, quantity: movement.quantity, idempotency_key: movement.idempotencyKey, reason: movement.reason, reference: movement.reference, actor_id: movement.actorId }
          : null,
      });
      if (outcome === "ok") return ok(value);
    }
    return fail("CONFLICT", "O estoque está sendo alterado por outra operação. Tente novamente.");
  }

  async setMinimum(key: StockKey, minimum: number) {
    unwrap("stock.setMinimum", await this.db.from("stock_balances").upsert(
      { council_id: key.councilId, material_id: key.materialId, minimum },
      { onConflict: "council_id,material_id" },
    ));
  }

  /** `processedKeys` vem vazio nas listagens (só é necessário dentro de `transact`). */
  async listStock(councilIds: readonly string[] | "all"): Promise<StockRow[]> {
    if (councilIds !== "all" && councilIds.length === 0) return [];
    const rows = await selectAll<BalanceRow>("stock.list", (from, to) => {
      const query = this.db.from("stock_balances").select().order("council_id").order("material_id").range(from, to);
      return councilIds === "all" ? query : query.in("council_id", [...councilIds]);
    });
    return rows.map((r) => ({
      councilId: r.council_id, materialId: r.material_id, minimum: toNumber(r.minimum),
      balance: { physical: toNumber(r.physical), reserved: toNumber(r.reserved), blocked: toNumber(r.blocked ?? 0) }, processedKeys: new Set<string>(),
    }));
  }

  async listMovements(key?: StockKey) {
    const rows = await selectAll<MovementRow>("stock.movements", (from, to) => {
      let query = this.db.from("stock_movements").select().order("id").range(from, to);
      if (key) query = query.eq("council_id", key.councilId).eq("material_id", key.materialId);
      return query;
    });
    return rows.map(toMovement);
  }
}
