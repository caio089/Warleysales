import { buildDetailedReport, type DetailedKind } from "@/modules/reports/detailed";
import { parseDetailedFilter } from "@/modules/reports/detailed-filter";
import { loadScreen } from "@/server/screen";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectControl } from "@/shared/ui/form-field";
import { Screen } from "@/shared/ui/screen";

const kinds: [DetailedKind, string][] = [["colaborador", "Colaborador"], ["estagiarios", "Estagiários"], ["processos", "Processos"], ["atas", "Atas"], ["contratos", "Contratos"], ["estoque", "Estoque"]];

export async function ReportCentral({ raw }: { raw: Record<string, string | string[] | undefined> }) {
  const filter = parseDetailedFilter(raw);
  const [result, directory] = await Promise.all([
    loadScreen(async ({ services, actor }) => buildDetailedReport(services, actor, filter)),
    loadScreen(({ services, actor }) => services.memberships.reportDirectory(actor)),
  ]);
  const people = directory.kind === "ok" ? directory.data : [];
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(filter)) if (value) query.set(key, value);
  return <div className="space-y-6">
    <form key={query.toString()} action="/relatorios" className="space-y-4 rounded-xl border border-border bg-card p-4">
      <input type="hidden" name="tab" value="central" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        <label className="text-sm">Relatório<SelectControl name="kind" defaultValue={filter.kind} className="mt-1">{kinds.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</SelectControl></label>
        <label className="text-sm">Órgão (ID)<Input name="councilId" defaultValue={filter.councilId} className="mt-1" /></label>
        <label className="text-sm">Início<Input type="date" name="start" defaultValue={filter.start} className="mt-1" /></label>
        <label className="text-sm">Fim<Input type="date" name="end" defaultValue={filter.end} className="mt-1" /></label>
        <label className="text-sm">Mês (processos ou estagiários)<Input type="month" name="month" defaultValue={typeof raw.month === "string" ? raw.month : undefined} className="mt-1" /></label>
        <label className="text-sm">Colaborador<SelectControl name="actorId" defaultValue={filter.actorId ?? ""} className="mt-1"><option value="">Selecione</option>{people.map((p) => <option key={p.id} value={p.id}>{p.fullName || p.id.slice(0, 8)}</option>)}</SelectControl></label>
        <label className="text-sm">Responsável<SelectControl name="responsibleId" defaultValue={filter.responsibleId ?? ""} className="mt-1"><option value="">Todos</option>{people.map((p) => <option key={p.id} value={p.id}>{p.fullName || p.id.slice(0, 8)}</option>)}</SelectControl></label>
        <label className="text-sm">Empresa (ID)<Input name="supplierId" defaultValue={filter.supplierId} className="mt-1" /></label>
        <label className="text-sm">Produto (ID)<Input name="materialId" defaultValue={filter.materialId} className="mt-1" /></label>
        <label className="text-sm">Situação<Input name="status" defaultValue={filter.status} className="mt-1" /></label>
        <label className="text-sm">Modalidade<Input name="mode" defaultValue={filter.mode} className="mt-1" /></label>
        <label className="text-sm">Tipo de processo<Input name="processType" defaultValue={filter.processType} className="mt-1" /></label>
        <label className="text-sm">Data do processo<SelectControl name="dateBasis" defaultValue={filter.dateBasis} className="mt-1"><option value="criacao">Criação</option><option value="movimentacao">Movimentação</option><option value="conclusao">Conclusão</option></SelectControl></label>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit">Visualizar relatório</Button>
        <Link className={buttonVariants({ variant: "outline" })} href={`/relatorios?tab=central&kind=${filter.kind}`}>Limpar filtros</Link>
      </div>
    </form>
    <Screen result={result}>{(data) => <section className="rounded-xl border border-border bg-card p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold">{data.title}</h2><a href={`/api/reports/detailed?${query}`} className={buttonVariants({ variant: "outline" })}>Exportar PDF</a></div>
      <p className="text-sm text-muted-foreground">{data.filters.join(" · ") || "Sem filtros adicionais"}</p><p>{data.summary}</p>
      <div className="grid gap-3 sm:grid-cols-3">{data.indicators.map((item) => <div key={item.label} className="rounded-lg border p-3"><div className="text-xs text-muted-foreground">{item.label}</div><strong>{item.value}</strong></div>)}</div>
      <div tabIndex={0} role="region" aria-label={data.title} className="overflow-x-auto rounded-lg border border-border focus-visible:ring-2 focus-visible:ring-ring"><table className="w-full text-left text-sm"><thead><tr>{data.columns.map((column) => <th key={column} scope="col" className="border-b bg-secondary p-3">{column}</th>)}</tr></thead><tbody>{data.rows.map((row, index) => <tr key={index}>{row.map((value, col) => <td key={col} className="border-b p-2">{value}</td>)}</tr>)}</tbody></table></div>
      {data.rows.length === 0 && <p className="text-sm text-muted-foreground">Nenhum registro encontrado.</p>}
      {data.limitations.map((item) => <p key={item} className="text-sm text-muted-foreground">{item}</p>)}
    </section>}</Screen>
  </div>;
}
