"use client";

import Link from "next/link";
import { type ReactNode, useId, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Paperclip,
  Search,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  type FilterDefinition,
  type QueryColumn,
  type SortDirection,
  nextSort,
  runTableQuery,
} from "@/shared/ui/data-table-logic";
import { EmptyState } from "@/shared/ui/feedback-states";
import { ProgressBar } from "@/shared/ui/progress-bar";
import { StatusBadge } from "@/shared/ui/status-badge";
import {
  COMPLETION_STATUS,
  PROCESS_STATUS,
  presentationOf,
} from "@/shared/ui/status-presentation";
export interface ProcessTableRow {
  id: string;
  number: string;
  title: string;
  council: string;
  status: string;
  completion: string;
  progress: number;
  href: string;
}

export interface ProcessesTableProps {
  rows: ProcessTableRow[];
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
}

/** Tabela interativa de processos com ordenação, busca, filtros e ação rápida de anexar. */
export function ProcessesTable({
  rows,
  emptyTitle = "Nenhum processo ainda",
  emptyDescription = "Crie o primeiro processo e anexe DFD, ETP, MR, TR, PP, PJ e ED — o progresso sobe sozinho.",
  emptyAction,
}: ProcessesTableProps) {
  const searchId = useId();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<{ key: string | null; direction: SortDirection }>({
    key: null,
    direction: "asc",
  });
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);

  const queryColumns: QueryColumn<ProcessTableRow>[] = useMemo(
    () => [
      { key: "number", accessor: (r) => r.number },
      { key: "title", accessor: (r) => r.title },
      { key: "council", accessor: (r) => r.council },
      { key: "status", accessor: (r) => r.status },
      { key: "completion", accessor: (r) => r.completion },
      { key: "progress", accessor: (r) => r.progress },
    ],
    [],
  );

  const statusValues = useMemo(
    () => [...new Set(rows.map((r) => r.status))].filter(Boolean).sort(),
    [rows],
  );
  const statusOptions = useMemo(
    () =>
      statusValues.map((v) => ({
        value: v,
        label: presentationOf(PROCESS_STATUS, v).label,
      })),
    [statusValues],
  );

  const councilValues = useMemo(
    () => [...new Set(rows.map((r) => r.council))].filter(Boolean).sort(),
    [rows],
  );
  const councilOptions = useMemo(
    () => councilValues.map((c) => ({ value: c, label: c })),
    [councilValues],
  );

  const filterDefs: FilterDefinition<ProcessTableRow>[] = useMemo(
    () => [
      { id: "status", label: "Situação", options: statusOptions, accessor: (r) => r.status },
      { id: "council", label: "Conselho", options: councilOptions, accessor: (r) => r.council },
    ],
    [statusOptions, councilOptions],
  );

  const result = useMemo(
    () =>
      runTableQuery(rows, queryColumns, filterDefs, {
        search,
        sortKey: sort.key,
        sortDirection: sort.direction,
        filters: activeFilters,
        page,
        pageSize: 10,
      }),
    [rows, queryColumns, filterDefs, search, sort, activeFilters, page],
  );

  const headers: { key: string; label: string; sortable: boolean }[] = [
    { key: "number", label: "Número", sortable: true },
    { key: "title", label: "Objeto", sortable: true },
    { key: "council", label: "Conselho", sortable: true },
    { key: "status", label: "Situação", sortable: true },
    { key: "completion", label: "Documentação", sortable: true },
    { key: "progress", label: "Progresso", sortable: true },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative w-full sm:w-72">
          <label htmlFor={searchId} className="sr-only">
            Buscar na tabela
          </label>
          <Search
            className="pointer-events-none absolute top-3 left-3 size-4 text-muted-foreground"
            aria-hidden
          />
          <Input
            id={searchId}
            type="text"
            placeholder="Buscar…"
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            autoComplete="off"
          />
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-[0.7rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
            Situação
          </span>
          <select
            className="h-10 min-w-40 rounded-lg border border-input bg-card px-3 text-sm font-medium text-foreground focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 focus-visible:outline-none"
            value={activeFilters["status"] ?? ""}
            onChange={(e) => {
              setActiveFilters((f) => ({ ...f, status: e.target.value }));
              setPage(1);
            }}
          >
            <option value="">Todos</option>
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[0.7rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
            Conselho
          </span>
          <select
            className="h-10 min-w-40 rounded-lg border border-input bg-card px-3 text-sm font-medium text-foreground focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 focus-visible:outline-none"
            value={activeFilters["council"] ?? ""}
            onChange={(e) => {
              setActiveFilters((f) => ({ ...f, council: e.target.value }));
              setPage(1);
            }}
          >
            <option value="">Todos</option>
            {councilOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {result.total === 0 ? (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
        />
      ) : (
        <div className="surface-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">Processos administrativos</caption>
              <thead className="sticky top-0 bg-secondary/90 text-left backdrop-blur-sm">
                <tr>
                  {headers.map((h) => {
                    const active = sort.key === h.key;
                    const ariaSort = active
                      ? sort.direction === "asc"
                        ? "ascending"
                        : "descending"
                      : "none";
                    const Icon = !active
                      ? ArrowUpDown
                      : sort.direction === "asc"
                        ? ArrowUp
                        : ArrowDown;

                    return (
                      <th
                        key={h.key}
                        scope="col"
                        aria-sort={h.sortable ? ariaSort : undefined}
                        className="px-4 py-3.5 text-[0.7rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase"
                      >
                        {h.sortable ? (
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 rounded-md tracking-[0.12em] uppercase transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                            onClick={() => {
                              setSort((s) => nextSort(s, h.key));
                              setPage(1);
                            }}
                          >
                            {h.label}
                            <Icon className="size-3.5" aria-hidden />
                          </button>
                        ) : (
                          h.label
                        )}
                      </th>
                    );
                  })}
                  <th
                    scope="col"
                    className="px-4 py-3.5 text-right text-[0.7rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase"
                  >
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => {
                  const pStatus = presentationOf(PROCESS_STATUS, row.status);
                  const pCompletion = presentationOf(COMPLETION_STATUS, row.completion);

                  return (
                    <tr
                      key={row.id}
                      onClick={() => {
                        window.location.assign(row.href);
                      }}
                      className="cursor-pointer border-t border-border/70 transition-colors hover:bg-primary/[0.035]"
                    >
                      <td className="px-4 py-3.5">
                        <Link
                          href={row.href}
                          onClick={(e) => e.stopPropagation()}
                          className="font-medium text-primary underline-offset-4 transition-colors hover:text-highlight hover:underline"
                        >
                          {row.number}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5">
                        <Link
                          href={row.href}
                          onClick={(event) => event.stopPropagation()}
                          className="line-clamp-2 font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
                        >
                          {row.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5">{row.council}</td>
                      <td className="px-4 py-3.5">
                        <StatusBadge label={pStatus.label} tone={pStatus.tone} />
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge
                          label={pCompletion.label}
                          tone={pCompletion.tone}
                        />
                      </td>
                      <td className="px-4 py-3.5">
                        <ProgressBar
                          value={row.progress}
                          label="Progresso"
                          className="min-w-32"
                        />
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Link
                          href={row.href}
                          onClick={(e) => e.stopPropagation()}
                          title={`Abrir a página do processo ${row.number}`}
                          className={buttonVariants({
                            variant: "outline",
                            size: "sm",
                            className: "inline-flex items-center gap-1.5",
                          })}
                        >
                          <Paperclip className="size-3.5" aria-hidden />
                          <span>Abrir</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {result.total > 0 ? (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span aria-live="polite">{result.total} registro(s) no banco</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={result.page <= 1}
              onClick={() => setPage(result.page - 1)}
            >
              Anterior
            </Button>
            <span>
              Página {result.page} de {result.pageCount}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={result.page >= result.pageCount}
              onClick={() => setPage(result.page + 1)}
            >
              Próxima
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
