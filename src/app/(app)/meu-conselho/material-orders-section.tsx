"use client";

import { useMemo, useState } from "react";
import { PackagePlus, Search } from "lucide-react";
import type { MaterialOrder } from "@/modules/orders/schemas";
import { formatDateTimeFortaleza } from "@/shared/lib/time";
import { StatusBadge } from "@/shared/ui/status-badge";
import { ORDER_STATUS, presentationOf } from "@/shared/ui/status-presentation";
import { MaterialOrderDialog, type AvailableStockItem } from "./material-order-dialog";

interface MaterialOrdersSectionProps {
  councilId: string;
  orders: MaterialOrder[];
  availableStock: AvailableStockItem[];
  materialLabelMap: Record<string, string>;
  canCreateOrder: boolean;
}

export function MaterialOrdersSection({
  councilId,
  orders,
  availableStock,
  materialLabelMap,
  canCreateOrder,
}: MaterialOrdersSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const q = searchQuery.toLowerCase().trim();
    return orders.filter((o) => {
      const num = o.number.toLowerCase();
      const notes = (o.notes || "").toLowerCase();
      const rejection = (o.rejectionReason || "").toLowerCase();
      const items = o.items
        .map((it) => (materialLabelMap[it.materialId] || it.materialId).toLowerCase())
        .join(" ");
      const pres = presentationOf(ORDER_STATUS, o.status).label.toLowerCase();
      return (
        num.includes(q) ||
        notes.includes(q) ||
        rejection.includes(q) ||
        items.includes(q) ||
        pres.includes(q)
      );
    });
  }, [orders, searchQuery, materialLabelMap]);

  return (
    <section
      id="pedidos-materiais"
      aria-label="Pedidos de Materiais da Empresa"
      className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold text-slate-900">Pedidos de Materiais da Empresa</h3>
            {orders.length > 0 ? (
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                {orders.length} {orders.length === 1 ? "pedido" : "pedidos"}
              </span>
            ) : null}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Solicitações de retirada efetuadas contra o saldo liberado em estoque, aguardando ou homologados por Warley.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {orders.length > 0 ? (
            <div className="relative">
              <Search className="size-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nº, item ou status..."
                className="w-56 pl-8.5 pr-3 py-1.5 text-xs bg-slate-50/80 border border-slate-200 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0F2942]"
              />
            </div>
          ) : null}

          {canCreateOrder ? (
            <MaterialOrderDialog councilId={councilId} availableStock={availableStock} />
          ) : null}
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-slate-50/60 border border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-2">
          <PackagePlus className="size-6 text-slate-400" aria-hidden />
          <p className="text-sm font-semibold text-slate-700">Nenhum pedido de material realizado</p>
          <p className="text-xs text-slate-500 max-w-sm">
            Quando você solicitar materiais do saldo liberado, eles aparecerão registrados aqui.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-slate-50/60 border border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-1.5">
          <Search className="size-5 text-slate-400" aria-hidden />
          <p className="text-xs font-semibold text-slate-700">Nenhum pedido encontrado para a busca</p>
          <p className="text-[11px] text-slate-400">Tente buscar por outro termo ou limpe o campo de busca.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                <th className="pb-2.5 font-semibold w-28">Nº Pedido</th>
                <th className="pb-2.5 font-semibold w-32">Data</th>
                <th className="pb-2.5 font-semibold">Itens Solicitados</th>
                <th className="pb-2.5 font-semibold">Observações / Motivo</th>
                <th className="pb-2.5 font-semibold text-center w-28">Situação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((o) => {
                const pres = presentationOf(ORDER_STATUS, o.status);
                const itemsText = o.items
                  .map((it) => `${it.quantity}x ${materialLabelMap[it.materialId] ?? it.materialId}`)
                  .join(", ");

                return (
                  <tr key={o.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 font-mono font-bold text-slate-900">{o.number}</td>
                    <td className="py-3 text-slate-500 tabular-nums whitespace-nowrap">
                      {formatDateTimeFortaleza(o.createdAt)}
                    </td>
                    <td className="py-3 text-slate-700 max-w-xs truncate" title={itemsText}>
                      {itemsText}
                    </td>
                    <td
                      className="py-3 text-slate-500 max-w-xs truncate"
                      title={
                        o.status === "rejeitado" && o.rejectionReason
                          ? `Recusado: ${o.rejectionReason}`
                          : o.notes || ""
                      }
                    >
                      {o.status === "rejeitado" && o.rejectionReason
                        ? `Recusado: ${o.rejectionReason}`
                        : o.notes || "—"}
                    </td>
                    <td className="py-3 text-center whitespace-nowrap">
                      <StatusBadge label={pres.label} tone={pres.tone} className="whitespace-nowrap" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
