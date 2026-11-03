"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { formatCurrency, formatNumber } from "@/shared/lib/format";
import { formatDateOnly, formatDateTimeFortaleza } from "@/shared/lib/time";
import { DataTable, type DataTableColumn } from "./data-table";
import type { FilterDefinition } from "./data-table-logic";
import { ProgressBar } from "./progress-bar";
import { StatusBadge } from "./status-badge";
import {
  COMPLETION_STATUS,
  MEETING_STATUS,
  presentationOf,
  PROCESS_STATUS,
  REQUEST_STATUS,
  STOCK_LEVEL,
  TRANSFER_STATUS,
} from "./status-presentation";

const DICTIONARIES = {
  process: PROCESS_STATUS,
  request: REQUEST_STATUS,
  transfer: TRANSFER_STATUS,
  meeting: MEETING_STATUS,
  stock: STOCK_LEVEL,
  completion: COMPLETION_STATUS,
} as const;

export type StatusDictionary = keyof typeof DICTIONARIES;

type Cell = string | number | null;
export type SimpleRow = { id: string } & Record<string, Cell>;

/** Coluna 100% serializável (pode ser criada em Server Components). */
export interface SimpleColumn {
  key: string;
  header: string;
  kind?: "text" | "number" | "currency" | "percent" | "date" | "datetime" | "status" | "progress" | "link";
  dictionary?: StatusDictionary;
  /** Para kind "link": chave da linha que contém o href. */
  hrefKey?: string;
  sortable?: boolean;
}

interface SimpleTableProps {
  caption: string;
  rows: SimpleRow[];
  columns: SimpleColumn[];
  /** Filtros por valor exato de uma coluna. */
  filterKeys?: { key: string; label: string; dictionary?: StatusDictionary }[];
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
}

function renderCell(column: SimpleColumn, row: SimpleRow) {
  const value = row[column.key];
  if (value === null || value === undefined || value === "") return "—";
  switch (column.kind) {
    case "number": return formatNumber(Number(value));
    case "currency": return formatCurrency(Number(value));
    case "percent": return `${Number(value).toFixed(2).replace(".", ",")}%`;
    case "date": return formatDateOnly(String(value));
    case "datetime": return formatDateTimeFortaleza(String(value));
    case "status": {
      const p = presentationOf(DICTIONARIES[column.dictionary ?? "process"], String(value));
      return <StatusBadge label={p.label} tone={p.tone} />;
    }
    case "progress": return <ProgressBar value={Number(value)} label={column.header} className="min-w-32" />;
    case "link": {
      const href = column.hrefKey ? row[column.hrefKey] : null;
      return href ? <Link href={String(href)} className="font-medium text-primary underline-offset-4 transition-colors hover:text-highlight hover:underline">{String(value)}</Link> : String(value);
    }
    default: return String(value);
  }
}

/** Tabela de leitura com busca/ordenação/paginação, configurada apenas por dados serializáveis. */
export function SimpleTable({ caption, rows, columns, filterKeys = [], emptyTitle, emptyDescription, emptyAction }: SimpleTableProps) {
  const tableColumns: DataTableColumn<SimpleRow>[] = columns.map((c) => ({
    key: c.key,
    header: c.header,
    accessor: (row) => row[c.key],
    render: (row) => renderCell(c, row),
    sortable: c.sortable ?? true,
  }));

  const filters: FilterDefinition<SimpleRow>[] = filterKeys.map((f) => {
    const values = [...new Set(rows.map((r) => String(r[f.key] ?? "")).filter(Boolean))].sort();
    return {
      id: f.key,
      label: f.label,
      accessor: (row) => String(row[f.key] ?? ""),
      options: values.map((v) => ({ value: v, label: f.dictionary ? presentationOf(DICTIONARIES[f.dictionary], v).label : v })),
    };
  });

  return <DataTable caption={caption} data={rows} columns={tableColumns} getRowId={(r) => r.id} filters={filters} emptyTitle={emptyTitle} emptyDescription={emptyDescription} emptyAction={emptyAction} />;
}
