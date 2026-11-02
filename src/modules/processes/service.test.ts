import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryAuditRepository } from "@/modules/audit/repository.memory";
import { AuditService } from "@/modules/audit/service";
import { InMemoryDocumentRepository, InMemoryStorage } from "@/modules/documents/repository.memory";
import { DocumentService } from "@/modules/documents/service";
import { InMemoryRetentionRepository } from "@/modules/retention/repository.memory";
import { RetentionService } from "@/modules/retention/service";
import { DOCUMENT_TYPE_CODES } from "./domain/document-types";
import { InMemoryProcessRepository } from "./repository.memory";
import { ProcessService } from "./service";
import { COUNCIL_A, COUNCIL_B, centralAdmin, makeRuntime, managerOf, operatorOf, specialDeleter, viewerOf } from "@/shared/testing/fixtures";

const PDF = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31]);

function setup() {
  const runtime = makeRuntime();
  const auditRepo = new InMemoryAuditRepository(runtime.now);
  const audit = new AuditService(auditRepo);
  const processRepo = new InMemoryProcessRepository();
  const docRepo = new InMemoryDocumentRepository();
  const storage = new InMemoryStorage();
  const retentionRepo = new InMemoryRetentionRepository();
  return {
    runtime, auditRepo, storage, docRepo, processRepo,
    processes: new ProcessService(processRepo, docRepo, audit, runtime),
    documents: new DocumentService(docRepo, processRepo, storage, audit, runtime),
    retention: new RetentionService(retentionRepo, processRepo, docRepo, storage, audit, runtime),
  };
}

type Ctx = ReturnType<typeof setup>;
async function newProcess(ctx: Ctx, councilId = COUNCIL_A) {
  const created = await ctx.processes.create(managerOf(councilId), { councilId, number: "001/2026", title: "Aquisição de materiais" });
  if (!created.ok) throw new Error(created.message);
  return created.data;
}
async function attachAll(ctx: Ctx, processId: string, types = DOCUMENT_TYPE_CODES) {
  const actor = managerOf(COUNCIL_A);
  for (const typeCode of types) {
    const r = await ctx.documents.upload(actor, { processId, typeCode, fileName: `${typeCode}.pdf` }, PDF);
    if (!r.ok) throw new Error(r.message);
  }
}

let ctx: Ctx;
beforeEach(() => { ctx = setup(); });

describe("ProcessService", () => {
  it("cria processo, audita e impede número duplicado no conselho (P4)", async () => {
    await newProcess(ctx);
    const dup = await ctx.processes.create(managerOf(COUNCIL_A), { councilId: COUNCIL_A, number: "001/2026", title: "Outro" });
    expect(!dup.ok && dup.code).toBe("CONFLICT");
    expect(ctx.auditRepo.all().some((e) => e.action === "process.create" && e.result === "success")).toBe(true);
  });
  it("mesmo número em outro conselho é permitido (numeração por conselho)", async () => {
    await newProcess(ctx, COUNCIL_A);
    const other = await ctx.processes.create(managerOf(COUNCIL_B), { councilId: COUNCIL_B, number: "001/2026", title: "Outro conselho" });
    expect(other.ok).toBe(true);
  });
  it("valida entrada com Zod e informa erros por campo", async () => {
    const r = await ctx.processes.create(managerOf(COUNCIL_A), { councilId: "x", number: "1", title: "" });
    expect(!r.ok && r.code).toBe("VALIDATION");
    expect(!r.ok && Object.keys(r.fieldErrors ?? {})).toEqual(expect.arrayContaining(["councilId", "number", "title"]));
  });
  it("consulta não cria processo; operador cria, consulta não", async () => {
    expect((await ctx.processes.create(viewerOf(COUNCIL_A), { councilId: COUNCIL_A, number: "002/2026", title: "Teste" })).ok).toBe(false);
    expect((await ctx.processes.create(operatorOf(COUNCIL_A), { councilId: COUNCIL_A, number: "002/2026", title: "Teste" })).ok).toBe(true);
    expect(ctx.auditRepo.all().some((e) => e.result === "denied")).toBe(true);
  });
  it("R14: usuário de outro conselho não vê nem lista o processo", async () => {
    const p = await newProcess(ctx);
    const intruder = managerOf(COUNCIL_B);
    const got = await ctx.processes.get(intruder, p.id);
    expect(!got.ok && got.code).toBe("NOT_FOUND");
    const list = await ctx.processes.list(intruder);
    expect(list.ok && list.data).toHaveLength(0);
    expect((await ctx.processes.list(centralAdmin())).ok).toBe(true);
  });
  it("progresso é derivado dos anexos (R1–R3)", async () => {
    const p = await newProcess(ctx);
    await attachAll(ctx, p.id, DOCUMENT_TYPE_CODES.slice(0, 3));
    const view = await ctx.processes.get(managerOf(COUNCIL_A), p.id);
    expect(view.ok && view.data.progress.percent).toBe(42.86);
    expect(view.ok && view.data.completion).toBe("pendente");
  });
  it("transição de situação inválida é rejeitada", async () => {
    const p = await newProcess(ctx);
    const r = await ctx.processes.changeStatus(managerOf(COUNCIL_A), { processId: p.id, status: "arquivado" });
    expect(!r.ok && r.code).toBe("INVALID_STATE");
  });
});

describe("DocumentService", () => {
  it("100% grava documental_completed_at mas não conclui o processo (R4/R5)", async () => {
    const p = await newProcess(ctx);
    await attachAll(ctx, p.id);
    const view = await ctx.processes.get(managerOf(COUNCIL_A), p.id);
    expect(view.ok && view.data.progress.percent).toBe(100);
    expect(view.ok && view.data.process.documentalCompletedAt).toEqual(ctx.runtime.now());
    expect(view.ok && view.data.process.status).toBe("em_andamento");
  });
  it("desvincular documento reverte a completude e audita", async () => {
    const p = await newProcess(ctx);
    await attachAll(ctx, p.id);
    const [first] = await ctx.docRepo.listByProcess(p.id);
    const r = await ctx.documents.unlink(managerOf(COUNCIL_A), { attachmentId: first!.id });
    expect(r.ok).toBe(true);
    const view = await ctx.processes.get(managerOf(COUNCIL_A), p.id);
    expect(view.ok && view.data.process.documentalCompletedAt).toBeNull();
    expect(ctx.auditRepo.all().some((e) => e.action === "process.documental_reverted")).toBe(true);
  });
  it("operador não desvincula (matriz §6)", async () => {
    const p = await newProcess(ctx);
    await attachAll(ctx, p.id, ["DFD"]);
    const [a] = await ctx.docRepo.listByProcess(p.id);
    const r = await ctx.documents.unlink(operatorOf(COUNCIL_A), { attachmentId: a!.id });
    expect(!r.ok && r.code).toBe("FORBIDDEN");
  });
  it("falha de storage deixa anexo 'failed' e não conta no progresso", async () => {
    const p = await newProcess(ctx);
    ctx.storage.failNextPut = true;
    const r = await ctx.documents.upload(managerOf(COUNCIL_A), { processId: p.id, typeCode: "DFD", fileName: "a.pdf" }, PDF);
    expect(!r.ok && r.code).toBe("INTERNAL");
    const view = await ctx.processes.get(managerOf(COUNCIL_A), p.id);
    expect(view.ok && view.data.progress.percent).toBe(0);
    expect((await ctx.docRepo.listByProcess(p.id))[0]?.uploadStatus).toBe("failed");
  });
  it("rejeita arquivo com conteúdo incompatível e não cria registro", async () => {
    const p = await newProcess(ctx);
    const r = await ctx.documents.upload(managerOf(COUNCIL_A), { processId: p.id, typeCode: "DFD", fileName: "a.pdf" }, new Uint8Array([1, 2, 3]));
    expect(r.ok).toBe(false);
    expect(await ctx.docRepo.listByProcess(p.id)).toHaveLength(0);
  });
  it("storage path usa council/processo do servidor (R14) e nome sanitizado", async () => {
    const p = await newProcess(ctx);
    const r = await ctx.documents.upload(managerOf(COUNCIL_A), { processId: p.id, typeCode: "DFD", fileName: "../../x y.pdf", councilId: COUNCIL_B }, PDF);
    expect(r.ok && r.data.storagePath.startsWith(`${COUNCIL_A}/${p.id}/`)).toBe(true);
    expect(r.ok && r.data.storagePath).not.toContain("..");
  });
  it("não anexa a processo de outro conselho", async () => {
    const p = await newProcess(ctx);
    const r = await ctx.documents.upload(managerOf(COUNCIL_B), { processId: p.id, typeCode: "DFD", fileName: "a.pdf" }, PDF);
    expect(!r.ok && r.code).toBe("FORBIDDEN");
  });
  it("R13: exclusão manual só pelo is_special_deleter; admin central é negado", async () => {
    const p = await newProcess(ctx);
    await attachAll(ctx, p.id, ["DFD"]);
    const [a] = await ctx.docRepo.listByProcess(p.id);
    const denied = await ctx.documents.manualDelete(centralAdmin(), { attachmentId: a!.id });
    expect(!denied.ok && denied.code).toBe("FORBIDDEN");
    expect(ctx.storage.objects.size).toBe(1);
    const done = await ctx.documents.manualDelete(specialDeleter(), { attachmentId: a!.id });
    expect(done.ok).toBe(true);
    expect(ctx.storage.objects.size).toBe(0);
    expect(ctx.auditRepo.all().some((e) => e.action === "document.manual_delete")).toBe(true);
  });
  it("download usa URL temporária e só para quem lê o conselho", async () => {
    const p = await newProcess(ctx);
    await attachAll(ctx, p.id, ["DFD"]);
    const [a] = await ctx.docRepo.listByProcess(p.id);
    const ok = await ctx.documents.getDownloadUrl(viewerOf(COUNCIL_A), { attachmentId: a!.id });
    expect(ok.ok && ok.data).toContain("ttl=60");
    expect((await ctx.documents.getDownloadUrl(viewerOf(COUNCIL_B), { attachmentId: a!.id })).ok).toBe(false);
  });
});

describe("RetentionService (R6/R7, P2)", () => {
  async function completedProcess() {
    const p = await newProcess(ctx);
    await attachAll(ctx, p.id);
    await ctx.processes.registerClosingReport(centralAdmin(), p.id);
    return p;
  }

  it("antes de 30 dias nada acontece", async () => {
    await completedProcess();
    ctx.runtime.advanceDays(29);
    expect(await ctx.retention.runCleanup()).toMatchObject({ archived: 0, disposed: 0, skipped: 1 });
  });
  it("sem autorização: apenas arquiva; nenhum arquivo é eliminado (P2) e é idempotente", async () => {
    const p = await completedProcess();
    ctx.runtime.advanceDays(31);
    expect(await ctx.retention.runCleanup()).toMatchObject({ archived: 1, disposed: 0 });
    expect(ctx.storage.objects.size).toBe(7);
    expect((await ctx.docRepo.listByProcess(p.id)).every((a) => a.retentionState === "archived")).toBe(true);
    expect(await ctx.retention.runCleanup()).toMatchObject({ archived: 0 });
  });
  it("com autorização e relatório: grava snapshot, elimina binários e mantém 100%", async () => {
    const p = await completedProcess();
    expect((await ctx.retention.authorizeDisposal(centralAdmin(), { processId: p.id, reference: "Portaria 12/2026" })).ok).toBe(true);
    ctx.runtime.advanceDays(31);
    expect(await ctx.retention.runCleanup()).toMatchObject({ disposed: 1 });
    expect(ctx.storage.objects.size).toBe(0);
    const view = await ctx.processes.get(managerOf(COUNCIL_A), p.id);
    expect(view.ok && view.data.displayPercent).toBe(100);
    expect(view.ok && view.data.completion).toBe("completa");
    expect(await ctx.retention.runCleanup()).toMatchObject({ disposed: 0 });
  });
  it("bloqueio de retenção impede a limpeza", async () => {
    const p = await completedProcess();
    await ctx.retention.authorizeDisposal(centralAdmin(), { processId: p.id, reference: "Portaria 12/2026" });
    await ctx.retention.placeHold(centralAdmin(), { processId: p.id, reason: "Auditoria externa" });
    ctx.runtime.advanceDays(40);
    expect(await ctx.retention.runCleanup()).toMatchObject({ disposed: 0, archived: 0, skipped: 1 });
    expect(ctx.storage.objects.size).toBe(7);
  });
  it("reversão antes de 30 dias reinicia a contagem", async () => {
    const p = await completedProcess();
    ctx.runtime.advanceDays(20);
    const [a] = await ctx.docRepo.listByProcess(p.id);
    await ctx.documents.unlink(managerOf(COUNCIL_A), { attachmentId: a!.id });
    await ctx.documents.upload(managerOf(COUNCIL_A), { processId: p.id, typeCode: a!.typeCode, fileName: "novo.pdf" }, PDF);
    ctx.runtime.advanceDays(15); // 35 desde a 1ª conclusão, 15 desde a 2ª
    expect(await ctx.retention.runCleanup()).toMatchObject({ archived: 0, disposed: 0 });
  });
  it("somente admin central gerencia retenção", async () => {
    const p = await completedProcess();
    const r = await ctx.retention.authorizeDisposal(managerOf(COUNCIL_A), { processId: p.id, reference: "Portaria 12/2026" });
    expect(!r.ok && r.code).toBe("FORBIDDEN");
  });
});
