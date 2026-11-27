import ComponentShowcase from "../page";
import { ProcessesTable, type ProcessTableRow } from "@/app/(app)/processos/processes-table";
import { SimpleTable, type SimpleRow, type SimpleColumn } from "@/shared/ui/simple-table";
import { ReturnLink } from "@/shared/ui/contextual-link";

const kinds = ["solicitacoes", "processos", "atas", "contratos", "transferencias"] as const;
type Kind = typeof kinds[number];
const titles: Record<Kind, string> = { solicitacoes: "Solicitações", processos: "Processos", atas: "Atas", contratos: "Contratos", transferencias: "Transferências" };
const rows: SimpleRow[] = Array.from({ length: 25 }, (_, i) => ({ id: String(i + 1), number: i === 0 ? "123/2026" : `${String(i + 1).padStart(3, "0")}/2026`, title: i === 0 ? "Aquisição / equipamento teste" : `Registro sintético ${i + 1}`, status: i % 2 ? "em_andamento" : "pendente", href: `/${i === 0 ? "123-2026" : `registro-${i + 1}`}` }));
const processRows: ProcessTableRow[] = rows.map((r, i) => ({ id: r.id, number: String(r.number), title: String(r.title), council: i % 2 ? "Conselho Azul" : "Conselho Verde", status: String(r.status), completion: "pendente", progress: i * 7, href: `/processos${String(r.href)}` }));
const columns: SimpleColumn[] = [{ key: "number", header: "Número", kind: "link", hrefKey: "href", sortable: true }, { key: "title", header: "Objeto", kind: "link", hrefKey: "href", sortable: true }, { key: "status", header: "Situação", kind: "text", sortable: true }];

export default async function RouteFixture({ params }: { params: Promise<{ path: string[] }> }) {
 const { path } = await params;
 if (["process", "confirm", "upload", "table", "sheet"].includes(path[0]!)) return <ComponentShowcase />;
 const kind = path[0] as Kind;
 if (!kinds.includes(kind)) return <main><h1>Fixture não encontrada</h1></main>;
 const base = `/${kind}`;
 if (path.length > 1) return <main><ReturnLink expectedPath={base} className="underline">Voltar</ReturnLink><h1>Detalhe sintético</h1><p>Registro {path[1]}</p></main>;
 return <main><h1>{titles[kind]}</h1>{kind === "processos" ? <ProcessesTable rows={processRows} /> : <SimpleTable caption={titles[kind]} rows={rows.map(r => ({ ...r, href: `${base}${String(r.href)}` }))} columns={columns} queryKey={`dt-${kind}`} filterKeys={[{ key: "status", label: "Situação" }]} pageSize={10} />}</main>;
}
