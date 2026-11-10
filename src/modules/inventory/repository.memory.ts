import { fail, ok, type Result } from "@/shared/lib/result";
import type { InventoryRepository, StockKey, StockMutation, StockRow, StockState } from "./repository";
import type { Material, MovementRecord } from "./schemas";

const keyOf = (k: StockKey) => `${k.councilId}:${k.materialId}`;

/** Implementação em memória (somente testes). Cada transact é síncrono => atômico. */
export class InMemoryInventoryRepository implements InventoryRepository {
  private materials = new Map<string, Material>();
  private rows = new Map<string, StockRow>();
  private ledger: MovementRecord[] = [];
  constructor(private readonly clock: () => Date = () => new Date()) {}

  async insertMaterial(material: Material): Promise<Result<Material>> {
    if ([...this.materials.values()].some((m) => m.code === material.code)) return fail("CONFLICT", "Já existe material com este código.");
    this.materials.set(material.id, material);
    return ok(material);
  }
  async findMaterial(id: string) { return this.materials.get(id) ?? null; }
  async listMaterials() { return [...this.materials.values()]; }

  async transact<T>(key: StockKey, mutate: (state: StockState) => Result<StockMutation<T>>): Promise<Result<T>> {
    const row = this.rows.get(keyOf(key)) ?? { ...key, balance: { physical: 0, reserved: 0, blocked: 0 }, minimum: 0, processedKeys: new Set<string>() };
    const result = mutate({ balance: row.balance, minimum: row.minimum, processedKeys: row.processedKeys });
    if (!result.ok) return result;

    const processedKeys = new Set(row.processedKeys);
    if (result.data.movement) {
      processedKeys.add(result.data.movement.idempotencyKey);
      this.ledger.push({ ...result.data.movement, id: String(this.ledger.length + 1), createdAt: this.clock() });
    }
    this.rows.set(keyOf(key), { ...row, balance: result.data.balance, processedKeys });
    return ok(result.data.value);
  }

  async setMinimum(key: StockKey, minimum: number) {
    const row = this.rows.get(keyOf(key)) ?? { ...key, balance: { physical: 0, reserved: 0, blocked: 0 }, minimum: 0, processedKeys: new Set<string>() };
    this.rows.set(keyOf(key), { ...row, minimum });
  }
  async listStock(councilIds: readonly string[] | "all") {
    return [...this.rows.values()].filter((r) => councilIds === "all" || councilIds.includes(r.councilId));
  }
  async listMovements(key?: StockKey) {
    return this.ledger.filter((m) => !key || (m.councilId === key.councilId && m.materialId === key.materialId));
  }
  /** Teste de reconciliação: corrompe o saldo de propósito. */
  corruptPhysical(key: StockKey, physical: number) {
    const row = this.rows.get(keyOf(key))!;
    this.rows.set(keyOf(key), { ...row, balance: { ...row.balance, physical } });
  }
}
