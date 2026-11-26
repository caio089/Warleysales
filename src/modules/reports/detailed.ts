import type { Meeting } from "@/modules/meetings/schemas";
import type { Services } from "@/server/container";
import type { AuditEntry, AuditFilter } from "@/modules/audit/schemas";
import { can, type Actor } from "@/shared/lib/authz/policy";
import { fail, ok, type Result } from "@/shared/lib/result";

export type DetailedKind = "colaborador" | "estagiarios" | "processos" | "atas" | "contratos" | "estoque";
export interface DetailedFilter {
  kind: DetailedKind;
  councilId?: string;
  actorId?: string;
  start?: string;
  end?: string;
  dateBasis?: "criacao" | "movimentacao" | "conclusao";
  status?: string;
  supplierId?: string;
  responsibleId?: string;
  processType?: string;
  mode?: string;
  materialId?: string;
}
export interface DetailedReport {
  title: string;
  filters: string[];
  summary: string;
  indicators: { label: string; value: string }[];
  columns: string[];
  rows: string[][];
  limitations: string[];
}

import { toFortalezaDate } from "@/shared/lib/time";

const inRange = (value: Date | string | null | undefined, start?: string, end?: string) => {
  if (!value) return false;
  const day = value instanceof Date ? toFortalezaDate(value) : value.slice(0, 10);
  return (!start || day >= start) && (!end || day <= end);
};
const n = (value: number) => new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 3 }).format(value);
const money = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
const date = (value: Date | string) => value instanceof Date ? toFortalezaDate(value) : value.slice(0, 10);
const report = (title: string, filters: string[], columns: string[], rows: string[][], indicators: DetailedReport["indicators"], limitations: string[] = []): DetailedReport => ({
  title, filters, columns, rows, indicators, limitations,
  summary: `${n(rows.length)} registro(s) encontrados para os filtros selecionados.`,
});

export function followedProcessIds(
  events: readonly AuditEntry[],
  author: string,
  filter: Pick<DetailedFilter, "start" | "end">,
): Set<string> {
  const ids = new Set<string>();
  for (const event of events) {
    if (event.actorId === author && event.result === "success" && event.entity === "administrative_process"
      && event.action !== "process.create" && event.entityId && inRange(event.createdAt, filter.start, filter.end)) {
      ids.add(event.entityId);
    }
  }
  return ids;
}

export function productivity(meetings: readonly Meeting[], author: string, filter: Pick<DetailedFilter, "start" | "end">) {
  const tasks = meetings.flatMap((meeting) => meeting.actionItems);
  const completed = tasks.filter((task) => task.completion?.actorId === author
    && inRange(task.completion.at, filter.start, filter.end));
  const pending = tasks.filter((task) => !task.done && task.responsibleId === author);
  const onTime = completed.filter(({ completion }) => completion?.dueDate
    && toFortalezaDate(completion.at) <= completion.dueDate).length;
  const late = completed.filter(({ completion }) => completion?.dueDate
    && toFortalezaDate(completion.at) > completion.dueDate).length;
  return { completed, pending, onTime, late };
}

async function auditEvents(services: Services, actor: Actor, filter: AuditFilter): Promise<Result<{ entries: AuditEntry[]; truncated: boolean }>> {
  const entries: AuditEntry[] = [];
  let beforeId: string | undefined;
  for (let batch = 0; batch < 5; batch++) {
    const result = await services.audit.list(actor, { ...filter, beforeId });
    if (!result.ok) return result;
    entries.push(...result.data);
    if (result.data.length < 1000) return ok({ entries, truncated: false });
    beforeId = result.data.at(-1)?.id;
  }
  return ok({ entries, truncated: true });
}

/** Consulta os serviços existentes, que já aplicam o recorte do ator, e confere report.view antes de agregar. */
export async function buildDetailedReport(services: Services, actor: Actor, filter: DetailedFilter): Promise<Result<DetailedReport>> {
  const allowed = filter.councilId
    ? can(actor, "report.view", filter.councilId)
    : actor.isCentralAdmin || actor.memberships.some((m) => can(actor, "report.view", m.councilId));
  if (!allowed) return fail("FORBIDDEN", "Você não tem permissão para consultar relatórios deste órgão.");
  if (filter.start && filter.end && filter.start > filter.end) return fail("VALIDATION", "O início deve ser anterior ao fim do período.");
  const labels = [filter.councilId && `Órgão: ${filter.councilId}`, filter.start && `De: ${filter.start}`, filter.end && `Até: ${filter.end}`, filter.status && `Situação: ${filter.status}`, filter.actorId && `Colaborador: ${filter.actorId}`, filter.supplierId && `Empresa: ${filter.supplierId}`, filter.responsibleId && `Responsável: ${filter.responsibleId}`, filter.processType && `Tipo: ${filter.processType}`, filter.mode && `Modalidade: ${filter.mode}`, filter.materialId && `Produto: ${filter.materialId}`, filter.dateBasis && `Data: ${filter.dateBasis}`].filter((x): x is string => Boolean(x));
  const scoped = (councilId: string) => (!filter.councilId || councilId === filter.councilId) && (actor.isCentralAdmin || can(actor, "report.view", councilId));

  if (filter.kind === "processos") {
    const [ps, cs, requests, audits] = await Promise.all([services.processes.list(actor), services.contracts.list(actor), services.purchases.list(actor), auditEvents(services, actor, { councilId: filter.councilId })]);
    if (!ps.ok) return ps; if (!cs.ok) return cs; if (!requests.ok) return requests;
    if (!audits.ok && filter.dateBasis !== "criacao") return audits;
    const eventsForProcess = audits.ok ? audits.data.entries : [];
    const rows = ps.data.filter(({ process: p }) => {
      const events = eventsForProcess.filter((a) => a.entityId === p.id && a.entity === "administrative_process" && a.result === "success");
      const matchesDate = filter.dateBasis === "conclusao"
        ? events.some((a) => a.action === "process.status_change" && a.details.to === "concluido" && inRange(a.createdAt, filter.start, filter.end))
        : filter.dateBasis === "movimentacao"
          ? events.some((a) => a.action !== "process.create" && inRange(a.createdAt, filter.start, filter.end))
          : inRange(p.createdAt, filter.start, filter.end);
      return scoped(p.councilId) && matchesDate && (!filter.status || p.status === filter.status)
        && (!filter.responsibleId || p.responsibleId === filter.responsibleId)
        && (!filter.processType || p.processType === filter.processType)
        && (!filter.mode || p.contractingMode === filter.mode)
        && (!filter.supplierId || cs.data.some((c) => c.contract.processId === p.id && c.contract.supplierId === filter.supplierId));
    }).map(({ process: p }) => [p.number, p.title, p.councilId, p.status, p.contractingMode ?? "Não informado", p.estimatedValue == null ? "Não informado" : money(p.estimatedValue), date(p.createdAt), p.createdBy, p.responsibleId ?? "Não atribuído", p.processType ?? "Não classificado"]);
    const counts = Object.fromEntries(["em_andamento", "aguardando_providencia", "concluido", "cancelado"].map((s) => [s, rows.filter((r) => r[3] === s).length]));
    const selectedIds = new Set(rows.map((row) => ps.data.find((p) => p.process.number === row[0] && p.process.councilId === row[2])?.process.id));
    const withApprovedRequest = new Set(requests.data.filter((r) => r.processId && selectedIds.has(r.processId) && r.events.some((e) => e.to === "aprovada")).map((r) => r.processId)).size;
    return ok(report("Relatório de processos", labels, ["Número", "Objeto", "Órgão", "Situação", "Modalidade", "Valor estimado", "Criação", "Criado por", "Responsável", "Tipo"], rows,
      [...Object.entries(counts).map(([label, value]) => ({ label, value: n(value) })), { label: "Com solicitação aprovada", value: n(withApprovedRequest) }],
      ["Processos antigos podem não ter responsável ou tipo. O processo não possui estado próprio de aprovação; o indicador usa solicitações aprovadas. Data de conclusão depende de evento de auditoria disponível.", ...(!audits.ok ? ["Eventos de auditoria indisponíveis para este perfil."] : audits.data.truncated ? ["O limite de 5.000 eventos de auditoria foi atingido; refine os filtros para obter o restante."] : [])]));
  }
  if (filter.kind === "atas") {
    const [as, cs] = await Promise.all([services.atas.list(actor), services.contracts.list(actor)]);
    if (!as.ok) return as; if (!cs.ok) return cs;
    const selected = as.data.filter(({ ata: a, validity }) => scoped(a.councilId) && inRange(a.createdAt, filter.start, filter.end) && (!filter.status || filter.status === a.status || filter.status === validity));
    const rows = selected.map(({ ata: a, items, validity, endDate }) => {
      const linked = cs.data.filter((c) => c.contract.ataId === a.id);
      const registered = items.reduce((s, i) => s + i.balance.registered, 0);
      const committed = items.reduce((s, i) => s + i.balance.committed, 0);
      return [a.number, a.councilId, validity, date(a.createdAt), endDate, n(registered), n(committed), n(registered - committed), money(a.items.reduce((s, i) => s + i.registeredQuantity * i.unitPrice, 0)), linked.map((c) => c.contract.number).join(", ") || "—"];
    });
    return ok(report("Relatório de atas", labels, ["Ata", "Órgão", "Vigência", "Registro", "Fim", "Quantidade", "Contratada", "Saldo", "Valor registrado", "Contratos"], rows,
      [{ label: "Registradas", value: n(rows.length) }, { label: "Vigentes", value: n(selected.filter((a) => a.validity === "vigente").length) }, { label: "Vencidas", value: n(selected.filter((a) => a.validity === "vencida").length) }]));
  }
  if (filter.kind === "contratos") {
    const [cs, ps, rs, receiptLines] = await Promise.all([services.contracts.list(actor), services.processes.list(actor), services.purchases.list(actor), services.contracts.listReceiptLines(actor)]);
    if (!cs.ok) return cs; if (!ps.ok) return ps; if (!rs.ok) return rs; if (!receiptLines.ok) return receiptLines;
    const selected = cs.data.filter(({ contract: c, status }) => scoped(c.councilId) && inRange(c.createdAt, filter.start, filter.end) && (!filter.status || status === filter.status) && (!filter.supplierId || c.supplierId === filter.supplierId));
    const rows = selected.map(({ contract: c, terms, status, remainingDays }) => {
      const linked = c.ataItems.map((item) => item.ataItemId);
      const received = receiptLines.data.filter((line) => line.contractId === c.id).reduce((s, line) => s + line.quantity, 0);
      const contracted = c.ataItems.reduce((s, i) => s + i.quantity, 0);
      const historical = rs.data.filter((r) => c.processId && r.processId === c.processId && r.councilId === c.councilId)
        .flatMap((r) => r.items.map((item) => ({ requestId: r.id, item })))
        .filter(({ item }) => linked.includes(item.ataItemId ?? ""))
        .reduce((s, { item }) => s + item.receivedTotal, 0)
        - receiptLines.data.filter((line) => linked.includes(line.ataItemId ?? "") && cs.data.some((other) => other.contract.id === line.contractId && other.contract.processId === c.processId)).reduce((s, line) => s + line.quantity, 0);
      return [c.number, c.councilId, c.supplierId ?? "—", c.processId ? ps.data.find((p) => p.process.id === c.processId)?.process.number ?? c.processId : "—", c.ataId ?? "—", status, money(terms.value), c.ataItems.length ? n(contracted) : "Não registrado", n(received), !c.ataItems.length ? "Não registrado" : historical > 0 ? "Não atribuível" : n(Math.max(0, contracted - received)), terms.endDate, String(remainingDays)];
    });
    return ok(report("Relatório de contratos", labels, ["Contrato", "Órgão", "Empresa (ID)", "Processo", "Ata (ID)", "Situação", "Valor", "Quantidade", "Recebido", "Pendente", "Fim", "Dias restantes"], rows,
      [{ label: "Registrados", value: n(rows.length) }, { label: "Ativos", value: n(selected.filter((c) => c.status === "vigente").length) }, { label: "Próximos do vencimento (30 dias)", value: n(selected.filter((c) => c.status !== "encerrado" && c.remainingDays >= 0 && c.remainingDays <= 30).length) }, { label: "Encerrados", value: n(selected.filter((c) => c.status === "encerrado").length) }, { label: "Vencidos", value: n(selected.filter((c) => c.status === "vencido").length) }, { label: "Valor contratado", value: money(selected.reduce((s, c) => s + c.terms.value, 0)) }],
      ["Recebimentos anteriores sem vínculo individual permanecem sem atribuição; saldos desses contratos aparecem como não atribuíveis. Contratos sem itens de ata não têm quantidade contratada registrada."]));
  }
  if (filter.kind === "estoque") {
    const [levels, materials, requests, contracts, councils, receiptLines] = await Promise.all([services.inventory.listLevels(actor, filter.councilId), services.inventory.listMaterials(actor), services.purchases.list(actor), services.contracts.list(actor), services.councils.list(actor), services.contracts.listReceiptLines(actor)]);
    if (!levels.ok) return levels; if (!materials.ok) return materials; if (!requests.ok) return requests; if (!contracts.ok) return contracts; if (!councils.ok) return councils; if (!receiptLines.ok) return receiptLines;
    const councilIds = councils.data.filter((c) => scoped(c.id) && can(actor, "council.read", c.id)).map((c) => c.id);
    const movements = await Promise.all(councilIds.map((id) => services.inventory.listMovements(actor, id)));
    const error = movements.find((m) => !m.ok); if (error && !error.ok) return error;
    const all = movements.flatMap((m) => m.ok ? m.data : []);
    const selected = all.filter((m) => inRange(m.createdAt, filter.start, filter.end) && (!filter.materialId || m.materialId === filter.materialId));
    const rows = selected.map((m) => {
      const request = m.reference?.startsWith("request:") ? requests.data.find((r) => r.id === m.reference?.slice(8) && r.councilId === m.councilId) : undefined;
      const linked = receiptLines.data.find((line) => request?.id === line.requestId && m.idempotencyKey === `receipt:${line.receiptKey}:${line.requestItemId}`);
      const contract = linked ? contracts.data.find((c) => c.contract.id === linked.contractId && c.contract.councilId === m.councilId) : undefined;
      return [date(m.createdAt), m.councilId, materials.data.find((x) => x.id === m.materialId)?.name ?? m.materialId, m.type, n(m.quantity), m.reference ?? "—", request?.title ?? "—", contract?.contract.number ?? "Não identificado", m.actorId ?? "—"];
    });
    return ok(report("Relatório de estoque", labels, ["Data", "Órgão", "Produto", "Tipo", "Quantidade", "Referência", "Origem", "Contrato do recebimento", "Autor"], rows,
      [{ label: "Entradas", value: n(selected.filter((m) => m.type === "entry" || m.type === "adjustment_in" || m.type === "transfer_in").reduce((s, m) => s + m.quantity, 0)) }, { label: "Saídas", value: n(selected.filter((m) => m.type === "consumption" || m.type === "adjustment_out" || m.type === "transfer_out").reduce((s, m) => s + m.quantity, 0)) }, { label: "Saldo físico atual", value: n(levels.data.filter((l) => scoped(l.councilId) && (!filter.materialId || l.materialId === filter.materialId)).reduce((s, l) => s + l.physical, 0)) }],
      ["Movimentações históricas sem vínculo individual aparecem como contrato não identificado."]));
  }
  if (filter.kind === "colaborador") {
    if (!filter.actorId) return fail("VALIDATION", "Selecione um colaborador.");
    const [audits, requests, processes, meetings] = await Promise.all([auditEvents(services, actor, { councilId: filter.councilId, actorId: filter.actorId, startDate: filter.start ? `${filter.start}T00:00:00-03:00` : undefined, endDate: filter.end ? `${filter.end}T23:59:59.999999-03:00` : undefined }), services.purchases.list(actor), services.processes.list(actor), services.meetings.list(actor)]);
    if (!requests.ok) return requests; if (!processes.ok) return processes; if (!meetings.ok) return meetings;
    const activity = (audits.ok ? audits.data.entries : []).filter((a) => scoped(a.councilId ?? "") && inRange(a.createdAt, filter.start, filter.end));
    const createdRequests = requests.data.filter((r) => r.createdBy === filter.actorId && scoped(r.councilId) && inRange(r.createdAt, filter.start, filter.end));
    const createdProcesses = processes.data.filter((p) => p.process.createdBy === filter.actorId && scoped(p.process.councilId) && inRange(p.process.createdAt, filter.start, filter.end));
    const followed = followedProcessIds(activity, filter.actorId, filter);
    const followedProcesses = processes.data.filter(({ process }) => scoped(process.councilId) && followed.has(process.id));
    const meetingRows = meetings.data.filter((m) => scoped(m.councilId) && (m.createdBy === filter.actorId || m.minutes?.registeredBy === filter.actorId) && inRange(m.scheduledAt, filter.start, filter.end));
    const authorizedMeetings = meetings.data.filter((m) => scoped(m.councilId));
    const attendance = authorizedMeetings.filter((m) => inRange(m.scheduledAt, filter.start, filter.end)
      && m.attendance?.some((entry) => entry.participantId === filter.actorId));
    const output = productivity(authorizedMeetings, filter.actorId, filter);
    const rows = [
      ...attendance.map((m) => [date(m.scheduledAt), "Reunião", "Presença confirmada", m.title, m.id, "Confirmada"]),
      ...output.completed.map((t) => [date(t.completion!.at), "Tarefa", "Concluída", t.description, t.id, t.completion!.dueDate ? `Prazo: ${t.completion!.dueDate}` : "Sem prazo"]),
      ...output.pending.map((t) => ["—", "Tarefa", "Pendência atual atribuída", t.description, t.id, t.dueDate ?? "Sem prazo"]),
      ...activity.map((a) => [date(a.createdAt), "Auditoria", a.action, a.entity, a.entityId ?? "—", a.result]),
      ...createdRequests.map((r) => [date(r.createdAt), "Solicitação", "Registrada", r.title, r.id, "success"]),
      ...createdProcesses.map((p) => [date(p.process.createdAt), "Processo", "Cadastrado", p.process.number, p.process.id, "success"]),
      ...followedProcesses.map(({ process }) => ["—", "Processo", "Movimentação comprovada no período", process.number, process.id, "success"]),
      ...meetingRows.map((m) => [date(m.scheduledAt), "Reunião", m.createdBy === filter.actorId ? "Registrada" : "Ata registrada", m.title, m.id, m.status]),
    ].sort((a, b) => b[0]!.localeCompare(a[0]!));
    return ok(report("Relatório individual de colaborador", labels, ["Data", "Fonte", "Atividade", "Registro", "ID", "Resultado"], rows,
      [{ label: "Eventos auditados", value: n(activity.length) }, { label: "Solicitações registradas", value: n(createdRequests.length) }, { label: "Processos cadastrados", value: n(createdProcesses.length) }, { label: "Processos acompanhados", value: n(followedProcesses.length) }, { label: "Reuniões relacionadas", value: n(meetingRows.length) }, { label: "Presenças confirmadas", value: n(attendance.length) }, { label: "Tarefas concluídas no período", value: n(output.completed.length) }, { label: "Tarefas pendentes atribuídas (estado atual)", value: n(output.pending.length) }, { label: "Prazos cumpridos", value: n(output.onTime) }, { label: "Conclusões em atraso", value: n(output.late) }],
      ["Conclusões antigas sem autor e data ficam fora dos indicadores. As pendências atribuídas refletem o estado atual.", "Processos acompanhados incluem movimentações com autoria registrada. Reuniões sem confirmação registrada têm presença desconhecida.", "Eventos de auditoria podem representar a mesma criação já exibida nas seções de solicitações e processos.", ...(!audits.ok ? ["Eventos de auditoria indisponíveis para este perfil."] : audits.data.truncated ? ["O limite de 5.000 eventos de auditoria foi atingido; refine os filtros para obter o restante."] : [])]));
  }
  if (filter.kind === "estagiarios") {
    if (!filter.start || !filter.end) return fail("VALIDATION", "Selecione o mês do relatório de estagiários.");
    const [directory, requests, processes, meetings] = await Promise.all([services.memberships.reportDirectory(actor), services.purchases.list(actor), services.processes.list(actor), services.meetings.list(actor)]);
    if (!directory.ok) return directory; if (!requests.ok) return requests; if (!processes.ok) return processes; if (!meetings.ok) return meetings;
    const interns = directory.data.filter((p) => p.staffCategory === "intern" && p.active && (!filter.actorId || p.id === filter.actorId));
    if (filter.actorId && interns.length === 0) return fail("NOT_FOUND", "Estagiário classificado não encontrado no escopo autorizado.");
    if (filter.actorId) {
      const individual = await buildDetailedReport(services, actor, { ...filter, kind: "colaborador" });
      if (!individual.ok) return individual;
      return ok({ ...individual.data, title: `Relatório mensal de estagiário — ${interns[0]!.fullName || interns[0]!.id}`, limitations: [...individual.data.limitations, "A pontualidade considera apenas conclusões registradas com prazo."] });
    }
    const rows: string[][] = [];
    for (const intern of interns) {
      const audit = await auditEvents(services, actor, { councilId: filter.councilId, actorId: intern.id, startDate: filter.start ? `${filter.start}T00:00:00-03:00` : undefined, endDate: filter.end ? `${filter.end}T23:59:59.999999-03:00` : undefined });
      const actions = audit.ok ? audit.data.entries.filter((a) => scoped(a.councilId ?? "") && inRange(a.createdAt, filter.start, filter.end)) : [];
      const createdRequests = requests.data.filter((r) => r.createdBy === intern.id && scoped(r.councilId) && inRange(r.createdAt, filter.start, filter.end));
      const createdProcesses = processes.data.filter((p) => p.process.createdBy === intern.id && scoped(p.process.councilId) && inRange(p.process.createdAt, filter.start, filter.end));
      const followed = followedProcessIds(actions, intern.id, filter);
      const followedCount = processes.data.filter(({ process }) => scoped(process.councilId) && followed.has(process.id)).length;
      const output = productivity(meetings.data.filter((m) => scoped(m.councilId)), intern.id, filter);
      rows.push([intern.fullName || intern.id, n(actions.length), n(createdRequests.length), n(createdProcesses.length), n(output.completed.length), n(output.pending.length), n(output.late), n(followedCount), n(output.onTime)]);
    }
    return ok(report("Relatório mensal de estagiários — equipe", labels, ["Estagiário", "Atividades auditadas", "Solicitações", "Processos", "Tarefas concluídas", "Pendências atuais", "Conclusões em atraso", "Processos acompanhados", "Prazos cumpridos"], rows,
      [{ label: "Estagiários classificados", value: n(interns.length) }, { label: "Atividades auditadas", value: n(rows.reduce((s, r) => s + Number(r[1]!.replaceAll(".", "")), 0)) }, { label: "Solicitações registradas", value: n(rows.reduce((s, r) => s + Number(r[2]!.replaceAll(".", "")), 0)) }],
      ["Conclusões antigas sem autoria e data ficam fora dos indicadores. A pontualidade usa o prazo registrado na conclusão.", "Pessoas sem classificação explícita não entram neste consolidado; não há atribuição retroativa presumida."]));
  }
  return fail("VALIDATION", "Tipo de relatório inválido.");
}
