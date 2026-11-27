import { buildDetailedReport, type DetailedKind } from "@/modules/reports/detailed";
import { parseDetailedFilter } from "@/modules/reports/detailed-filter";
import { loadScreen } from "@/server/screen";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectControl } from "@/shared/ui/form-field";
import { canReportOnPerson } from "@/shared/lib/authz/policy";
import { Screen } from "@/shared/ui/screen";
import { loadReportNames } from "@/modules/reports/load-names";
import { presentDetailedReport } from "@/modules/reports/presentation";

const kinds: [DetailedKind, string][] = [["colaborador", "Colaborador"], ["estagiarios", "Estagiários"], ["processos", "Processos"], ["atas", "Atas"], ["contratos", "Contratos"], ["estoque", "Estoque"]];

export async function ReportCentral({ raw }: { raw: Record<string, string | string[] | undefined> }) {
  const filter = parseDetailedFilter(raw);
  const [result, directory] = await Promise.all([
    loadScreen(async ({ services, actor }) => buildDetailedReport(services, actor, filter)),
    loadScreen(async ({ services, actor }) => {
      const [people, names] = await Promise.all([services.memberships.reportDirectory(actor, filter.councilId), loadReportNames(services, actor)]);
      return people.ok ? { ok: true, data: {
        all: people.data,
        eligible: people.data.filter((person) => canReportOnPerson(actor, person.id)),
        names,
      } } : people;
    }),
  ]);
  const people = directory.kind === "ok" ? directory.data.all : [];
  const eligiblePeople = directory.kind === "ok" ? directory.data.eligible : [];
  const names = directory.kind === "ok" ? directory.data.names : { councils: [], suppliers: [], materials: [], people: [], atas: [] };
  const presented = result.kind === "ok" ? { ...result, data: presentDetailedReport(result.data, names) } : result;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(filter)) if (value) query.set(key, value);
  return <div className="space-y-6">
    <form key={query.toString()} action="/relatorios" className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-6">
      <input type="hidden" name="tab" value="central" />
      <div>
        <h2 className="font-heading text-lg font-semibold text-primary">Criar relatório</h2>
        <p className="mt-1 text-sm text-muted-foreground">Escolha o assunto e, se quiser, limite por órgão e período. Os campos abaixo são opcionais.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium">O que deseja ver?<SelectControl name="kind" defaultValue={filter.kind} className="mt-1">{kinds.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</SelectControl></label>
        <label className="text-sm font-medium">Órgão<SelectControl name="councilId" defaultValue={filter.councilId ?? ""} className="mt-1"><option value="">Todos os órgãos permitidos</option>{names.councils.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</SelectControl></label>
        <label className="text-sm font-medium">De<Input type="date" name="start" defaultValue={filter.start} className="mt-1" /></label>
        <label className="text-sm font-medium">Até<Input type="date" name="end" defaultValue={filter.end} className="mt-1" /></label>
        <label className="text-sm font-medium sm:col-span-2">Pessoa <span className="font-normal text-muted-foreground">(escolha para relatório individual)</span><SelectControl name="actorId" defaultValue={filter.actorId ?? ""} className="mt-1"><option value="">Nenhuma pessoa selecionada</option>{eligiblePeople.map((p) => <option key={p.id} value={p.id}>{p.fullName || "Pessoa não identificada"}</option>)}</SelectControl></label>
      </div>
      <details className="rounded-xl border border-border/70 bg-muted/20 p-4" open={Boolean(filter.actorId || filter.responsibleId || filter.supplierId || filter.materialId || filter.dateBasis !== "criacao")}>
        <summary className="cursor-pointer text-sm font-medium text-primary">Mais filtros, se precisar</summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm">Responsável pelo processo<SelectControl name="responsibleId" defaultValue={filter.responsibleId ?? ""} className="mt-1"><option value="">Todos</option>{people.map((p) => <option key={p.id} value={p.id}>{p.fullName || "Pessoa não identificada"}</option>)}</SelectControl></label>
          <label className="text-sm">Fornecedor<SelectControl name="supplierId" defaultValue={filter.supplierId ?? ""} className="mt-1"><option value="">Todos</option>{names.suppliers.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</SelectControl></label>
          <label className="text-sm">Produto<SelectControl name="materialId" defaultValue={filter.materialId ?? ""} className="mt-1"><option value="">Todos</option>{names.materials.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</SelectControl></label>
          <label className="text-sm">Data considerada nos processos<SelectControl name="dateBasis" defaultValue={filter.dateBasis} className="mt-1"><option value="criacao">Criação</option><option value="movimentacao">Última movimentação</option><option value="conclusao">Conclusão</option></SelectControl></label>
        </div>
      </details>
      <div className="flex flex-wrap gap-2">
        <Button type="submit">Visualizar relatório</Button>
        <Link className={buttonVariants({ variant: "outline" })} href={`/relatorios?tab=central&kind=${filter.kind}`}>Limpar filtros</Link>
      </div>
    </form>
    <Screen result={presented}>{(data) => <section className="rounded-xl border border-border bg-card p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold">{data.title}</h2><a href={`/api/reports/detailed?${query}`} className={buttonVariants({ variant: "outline" })}>Exportar PDF</a></div>
      <p className="text-sm text-muted-foreground">{data.filters.join(" · ") || "Sem filtros adicionais"}</p><p>{data.summary}</p>
      <div className="grid gap-3 sm:grid-cols-3">{data.indicators.map((item) => <div key={item.label} className="rounded-lg border p-3"><div className="text-xs text-muted-foreground">{item.label}</div><strong>{item.value}</strong></div>)}</div>
      <div tabIndex={0} role="region" aria-label={data.title} className="overflow-x-auto rounded-lg border border-border focus-visible:ring-2 focus-visible:ring-ring"><table className="w-full min-w-[1000px] text-left text-sm"><thead><tr>{data.columns.map((column) => <th key={column} scope="col" className="whitespace-nowrap border-b bg-secondary p-3">{column}</th>)}</tr></thead><tbody>{data.rows.map((row, index) => <tr key={index}>{row.map((value, col) => <td key={col} className={`border-b p-2 align-top ${["Objeto", "Atividade", "Registro"].includes(data.columns[col] ?? "") ? "max-w-80 break-words" : "whitespace-nowrap"}`}>{value}</td>)}</tr>)}</tbody></table></div>
      {data.rows.length === 0 && <p className="text-sm text-muted-foreground">Nenhum registro encontrado.</p>}
      {data.limitations.map((item) => <p key={item} className="text-sm text-muted-foreground">{item}</p>)}
    </section>}</Screen>
  </div>;
}
