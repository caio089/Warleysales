"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Package, Search } from "lucide-react";
import type { StockLevelView } from "@/modules/inventory/service";
import { StatusBadge } from "@/shared/ui/status-badge";
import { STOCK_LEVEL, presentationOf } from "@/shared/ui/status-presentation";

interface StockSectionProps {
  councilId: string;
  stockLevels: StockLevelView[];
  materialLabelMap: Record<string, string>;
  materialNameMap: Record<string, string>;
}

function parseMaterial(
  materialId: string,
  labelMap: Record<string, string>,
  nameMap: Record<string, string>,
) {
  const fullLabel = labelMap[materialId] || "";
  const directName = nameMap[materialId];
  if (fullLabel.includes(" — ")) {
    const parts = fullLabel.split(" — ");
    const sku = parts[0]?.trim() || "";
    const name = directName || parts.slice(1).join(" — ").trim() || materialId;
    return { name, sku };
  }
  return {
    name: directName || fullLabel || materialId,
    sku: "",
  };
}

export function StockSection({
  councilId,
  stockLevels,
  materialLabelMap,
  materialNameMap,
}: StockSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return stockLevels;
    const q = searchQuery.toLowerCase().trim();
    return stockLevels.filter((s) => {
      const { name, sku } = parseMaterial(s.materialId, materialLabelMap, materialNameMap);
      return (
        name.toLowerCase().includes(q) ||
        sku.toLowerCase().includes(q) ||
        s.level.toLowerCase().includes(q)
      );
    });
  }, [stockLevels, searchQuery, materialLabelMap, materialNameMap]);

  return (
    <section
      aria-label="Estoque Disponível da Empresa"
      className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between h-full"
    >
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Estoque Disponível na Empresa</h3>
            <p className="text-xs text-slate-500">
              Materiais atualmente disponíveis para utilização na sua sede.
            </p>
          </div>
          <Link
            href={`/estoque?councilId=${councilId}`}
            className="text-xs font-bold text-[#0F2942] hover:underline shrink-0"
          >
            Ver detalhes do estoque →
          </Link>
        </div>

        {/* Campo de Busca Inline */}
        <div className="relative mt-3.5 mb-2">
          <Search className="size-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar produto ou SKU no estoque..."
            className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-slate-50/80 border border-slate-200 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0F2942]"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-8 px-4 text-center my-2">
            <Package className="size-5 text-slate-400" aria-hidden />
            <p className="text-xs font-semibold text-slate-700">Nenhum produto em estoque encontrado</p>
            <p className="text-[11px] text-slate-400">
              Quando as solicitações forem aprovadas e recebidas, os itens aparecerão disponíveis aqui.
            </p>
          </div>
        ) : (
          <div className="overflow-x-visible mt-2">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                  <th className="pb-2 font-semibold">Produto / Material</th>
                  <th className="pb-2 font-semibold text-center w-20">Disponível</th>
                  <th className="pb-2 font-semibold text-center w-20">Mínimo</th>
                  <th className="pb-2 font-semibold text-center w-36">Situação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((s) => {
                  const { name, sku } = parseMaterial(s.materialId, materialLabelMap, materialNameMap);
                  const pres = presentationOf(STOCK_LEVEL, s.level);
                  return (
                    <tr
                      key={`${s.councilId}:${s.materialId}`}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="py-2.5 pr-2">
                        <p className="text-xs font-bold text-slate-900 leading-snug">{name}</p>
                        {sku ? (
                          <span className="font-mono text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                            {sku}
                          </span>
                        ) : null}
                      </td>
                      <td className="py-2.5 text-center font-bold text-slate-900 tabular-nums">
                        {s.available}
                      </td>
                      <td className="py-2.5 text-center text-slate-500 tabular-nums">
                        {s.minimum}
                      </td>
                      <td className="py-2.5 text-center">
                        <StatusBadge
                          label={pres.label}
                          tone={pres.tone}
                          className="whitespace-nowrap"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
