import type { AtaView } from "@/modules/atas/service";
import { formatCurrency, formatNumber } from "@/shared/lib/format";

export interface AtaBalanceRow {
  itemId: string;
  description: string;
  materialLabel: string;
  registered: number;
  committed: number;
  balance: number;
  unitPrice: number;
}

export function buildAtaBalanceRows(view: AtaView, materialLabels: Record<string, string>): AtaBalanceRow[] {
  const prices = new Map(view.ata.items.map((item) => [item.id, item.unitPrice]));
  return view.items.map((row) => ({
    itemId: row.itemId,
    description: row.description,
    materialLabel: row.materialId ? materialLabels[row.materialId] ?? "—" : "—",
    registered: row.balance.registered,
    committed: row.balance.committed,
    balance: row.balance.balance,
    unitPrice: prices.get(row.itemId) ?? 0,
  }));
}

export function AtaBalancePanel({ headingId, items, isDraft, isCancelled = false }: {
  headingId: string;
  items: AtaBalanceRow[];
  isDraft: boolean;
  isCancelled?: boolean;
}) {
  const totalRegistered = items.reduce((sum, row) => sum + row.registered, 0);
  const totalCommitted = items.reduce((sum, row) => sum + row.committed, 0);
  const totalBalance = items.reduce((sum, row) => sum + row.balance, 0);
  return (
    <section aria-labelledby={headingId} className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id={headingId} className="font-heading text-lg font-semibold text-primary">
            Saldo por item
          </h2>
          <p className="text-sm text-muted-foreground">
            Registrada − comprometida = saldo. {isCancelled ? "Saldo histórico da ata cancelada." : isDraft ? "No rascunho o saldo ainda não é consumido." : "Pedidos aprovados consomem este saldo."}
          </p>
        </div>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-muted/40 px-4 py-3">
          <p className="text-xs font-medium text-muted-foreground">Registrada</p>
          <p className="mt-1 text-xl font-semibold tabular-nums">{formatNumber(totalRegistered)}</p>
        </div>
        <div className="rounded-xl bg-amber-50 px-4 py-3 ring-1 ring-amber-100">
          <p className="text-xs font-medium text-amber-800/80">Comprometida</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-amber-800">{formatNumber(totalCommitted)}</p>
        </div>
        <div className="rounded-xl bg-emerald-50 px-4 py-3 ring-1 ring-emerald-100">
          <p className="text-xs font-medium text-emerald-800/80">Saldo</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-emerald-700">{formatNumber(totalBalance)}</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border/60">
        <table className="w-full min-w-[640px] text-left text-sm">
          <caption className="sr-only">Itens da ata com quantidades, valores e saldo</caption>
          <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-2.5 font-semibold">Item</th>
              <th className="px-3 py-2.5 font-semibold">Material</th>
              <th className="px-3 py-2.5 text-right font-semibold">Qtd</th>
              <th className="px-3 py-2.5 text-right font-semibold">Unitário</th>
              <th className="px-3 py-2.5 text-right font-semibold">Total</th>
              <th className="px-3 py-2.5 text-right font-semibold">Comprometida</th>
              <th className="px-3 py-2.5 text-right font-semibold">Saldo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {items.map((row) => (
              <tr key={row.itemId} className="hover:bg-muted/30">
                <td className="px-3 py-3 font-medium text-foreground">{row.description}</td>
                <td className="px-3 py-3 text-muted-foreground">
                  {row.materialLabel}
                </td>
                <td className="px-3 py-3 text-right tabular-nums">{formatNumber(row.registered)}</td>
                <td className="px-3 py-3 text-right tabular-nums">{formatCurrency(row.unitPrice)}</td>
                <td className="px-3 py-3 text-right tabular-nums font-medium">{formatCurrency(row.registered * row.unitPrice)}</td>
                <td className="px-3 py-3 text-right tabular-nums text-amber-800">{formatNumber(row.committed)}</td>
                <td className="px-3 py-3 text-right tabular-nums font-semibold text-emerald-700">
                  {formatNumber(row.balance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
