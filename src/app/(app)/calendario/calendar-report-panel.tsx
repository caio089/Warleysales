"use client";

import { Printer } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import type { CalendarReport } from "@/modules/calendar/calendar-report";

interface CalendarReportPanelProps {
  report: CalendarReport;
  councilLabel: Record<string, string>;
  scopeLabel: string;
}

/** Relatório do ano: totais por órgão e por mês, com impressão. */
export function CalendarReportPanel({ report, councilLabel, scopeLabel }: CalendarReportPanelProps) {
  const monthsWithData = report.byMonth.filter((month) => month.total > 0);

  return (
    <section id="relatorio" aria-labelledby="relatorio-titulo" className="mt-8 scroll-mt-24 print:mt-0">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="relatorio-titulo" className="text-sm font-semibold text-slate-800">
            Relatório {report.year} · {scopeLabel}
          </h2>
          <p className="text-xs text-slate-500">
            {report.total} datas do plano: {report.conclude} para concluir e {report.expiry} de vencimento.
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className={`${buttonVariants({ variant: "outline", size: "sm" })} print:hidden`}
        >
          <Printer className="size-3.5" aria-hidden />
          Imprimir relatório
        </button>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">Total no ano</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{report.total}</p>
        </article>
        <article className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
          <p className="text-[11px] font-semibold tracking-wide text-sky-800 uppercase">Concluir</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-sky-950">{report.conclude}</p>
        </article>
        <article className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
          <p className="text-[11px] font-semibold tracking-wide text-amber-800 uppercase">Vencimento</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-amber-950">{report.expiry}</p>
        </article>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <caption className="border-b border-slate-100 px-4 py-3 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Por órgão
            </caption>
            <thead className="bg-slate-50 text-[11px] tracking-wide text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-2 font-semibold">Órgão</th>
                <th className="px-4 py-2 font-semibold">Concluir</th>
                <th className="px-4 py-2 font-semibold">Vence</th>
                <th className="px-4 py-2 font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {report.byCouncil.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-slate-500">Nenhuma contratação neste ano.</td>
                </tr>
              ) : report.byCouncil.map((row) => (
                <tr key={row.councilId} className="border-t border-slate-100">
                  <td className="px-4 py-2 font-medium text-slate-800">{councilLabel[row.councilId] ?? "Órgão"}</td>
                  <td className="px-4 py-2 tabular-nums text-slate-700">{row.conclude}</td>
                  <td className="px-4 py-2 tabular-nums text-slate-700">{row.expiry}</td>
                  <td className="px-4 py-2 font-semibold tabular-nums text-slate-900">{row.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <caption className="border-b border-slate-100 px-4 py-3 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Por mês
            </caption>
            <thead className="bg-slate-50 text-[11px] tracking-wide text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-2 font-semibold">Mês</th>
                <th className="px-4 py-2 font-semibold">Concluir</th>
                <th className="px-4 py-2 font-semibold">Vence</th>
                <th className="px-4 py-2 font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {monthsWithData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-slate-500">Nenhuma contratação neste ano.</td>
                </tr>
              ) : monthsWithData.map((row) => (
                <tr key={row.month} className="border-t border-slate-100">
                  <td className="px-4 py-2 font-medium text-slate-800">{row.label}</td>
                  <td className="px-4 py-2 tabular-nums text-slate-700">{row.conclude}</td>
                  <td className="px-4 py-2 tabular-nums text-slate-700">{row.expiry}</td>
                  <td className="px-4 py-2 font-semibold tabular-nums text-slate-900">{row.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
