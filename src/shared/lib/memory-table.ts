/**
 * Tabela em memória usada APENAS por implementações de teste dos ports.
 * Nunca é ligada às telas como fonte de dados.
 */
export class MemoryTable<T extends { id: string }> {
  protected rows = new Map<string, T>();

  insert(row: T): T {
    this.rows.set(row.id, structuredClone(row));
    return structuredClone(row);
  }
  get(id: string): T | null {
    const row = this.rows.get(id);
    return row ? structuredClone(row) : null;
  }
  update(id: string, changes: Partial<T>): T | null {
    const current = this.rows.get(id);
    if (!current) return null;
    const next = { ...current, ...changes };
    this.rows.set(id, next);
    return structuredClone(next);
  }
  all(predicate: (row: T) => boolean = () => true): T[] {
    return [...this.rows.values()].filter(predicate).map((r) => structuredClone(r));
  }
}
