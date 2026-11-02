import type { Result } from "@/shared/lib/result";
import type { StockBalance } from "./domain/stock";
import type { Material, MovementRecord } from "./schemas";

export interface StockKey {
  councilId: string;
  materialId: string;
}

/** Estado lido sob lock: saldo, mínimo e chaves de idempotência já processadas. */
export interface StockState {
  balance: StockBalance;
  minimum: number;
  processedKeys: ReadonlySet<string>;
}

export interface StockMutation<T> {
  balance: StockBalance;
  /** Movimentação a gravar no ledger (append-only), quando houver. */
  movement?: Omit<MovementRecord, "id" | "createdAt">;
  value: T;
}

export interface StockRow extends StockKey, StockState {}

/**
 * Port de estoque. `transact` é o ponto de atomicidade: lê o saldo com lock
 * (SELECT … FOR UPDATE / função SQL), executa `mutate` e persiste saldo + ledger na
 * mesma transação (H2). Se `mutate` falhar, nada é gravado.
 */
export interface InventoryRepository {
  insertMaterial(material: Material): Promise<Result<Material>>;
  findMaterial(id: string): Promise<Material | null>;
  listMaterials(): Promise<Material[]>;
  transact<T>(key: StockKey, mutate: (state: StockState) => Result<StockMutation<T>>): Promise<Result<T>>;
  setMinimum(key: StockKey, minimum: number): Promise<void>;
  listStock(councilIds: readonly string[] | "all"): Promise<StockRow[]>;
  listMovements(key?: StockKey): Promise<MovementRecord[]>;
}
