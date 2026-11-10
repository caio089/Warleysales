import { createHash } from "node:crypto";
import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryAuditRepository } from "@/modules/audit/repository.memory";
import { AuditService } from "@/modules/audit/service";
import { InMemoryProcessRepository } from "@/modules/processes/repository.memory";
import { ProcessService } from "@/modules/processes/service";
import { COUNCIL_A, COUNCIL_B, makeRuntime, managerOf, operatorOf, viewerOf } from "@/shared/testing/fixtures";
import { InMemoryDocumentRepository, InMemoryStorage } from "./repository.memory";
import { DocumentService } from "./service";

const PDF = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x0a]);
const sha = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");

function setup() {
  const runtime = makeRuntime();
  const audit = new AuditService(new InMemoryAuditRepository(runtime.now));
  const processRepo = new InMemoryProcessRepository();
  const docRepo = new InMemoryDocumentRepository();
  const storage = new InMemoryStorage();
  return {
    storage, docRepo,
    processes: new ProcessService(processRepo, docRepo, audit, runtime),
    documents: new DocumentService(docRepo, processRepo, storage, audit, runtime),
  };
}
let ctx: ReturnType<typeof setup>;
beforeEach(() => { ctx = setup(); });

async function newProcess() {
  const created = await ctx.processes.create(managerOf(COUNCIL_A), { councilId: COUNCIL_A, number: "001/2026", title: "Aquisição de materiais" });
  if (!created.ok) throw new Error(created.message);
  return created.data.id;
}
const declared = (bytes: Uint8Array, fileName = "dfd.pdf") => ({ fileName, size: bytes.byteLength, sha256: sha(bytes) });

describe("DocumentService — upload direto por URL assinada", () => {
  it("fluxo feliz: prepare → envio direto ao storage → confirm", async () => {
    const processId = await newProcess();
    const actor = operatorOf(COUNCIL_A);
    const prepared = await ctx.documents.prepareUpload(actor, { processId, typeCode: "DFD", ...declared(PDF) });
    expect(prepared.ok).toBe(true);
    if (!prepared.ok) return;
    expect(prepared.data.storagePath.startsWith(`${COUNCIL_A}/${processId}/`)).toBe(true);
    expect((await ctx.docRepo.findById(prepared.data.attachmentId))?.uploadStatus).toBe("pending");

    await ctx.storage.put(prepared.data.storagePath, PDF); // simula o navegador
    const confirmed = await ctx.documents.confirmUpload(actor, { attachmentId: prepared.data.attachmentId });
    expect(confirmed.ok && confirmed.data.uploadStatus).toBe("confirmed");
  });

  it("pendente (arquivo nunca enviado) não conta no progresso e confirmar falha", async () => {
    const processId = await newProcess();
    const actor = managerOf(COUNCIL_A);
    const prepared = await ctx.documents.prepareUpload(actor, { processId, typeCode: "DFD", ...declared(PDF) });
    if (!prepared.ok) throw new Error(prepared.message);
    const confirm = await ctx.documents.confirmUpload(actor, { attachmentId: prepared.data.attachmentId });
    expect(!confirm.ok && confirm.code).toBe("VALIDATION");
    const view = await ctx.processes.get(actor, processId);
    expect(view.ok && view.data.progress.percent).toBe(0);
  });

  it("hash divergente do declarado: remove o objeto e marca como falho", async () => {
    const processId = await newProcess();
    const actor = managerOf(COUNCIL_A);
    const prepared = await ctx.documents.prepareUpload(actor, { processId, typeCode: "DFD", ...declared(PDF) });
    if (!prepared.ok) throw new Error(prepared.message);
    const tampered = new Uint8Array([...PDF.slice(0, 6), 0x7a]); // mesmo tamanho e assinatura, conteúdo diferente
    await ctx.storage.put(prepared.data.storagePath, tampered);

    const confirm = await ctx.documents.confirmUpload(actor, { attachmentId: prepared.data.attachmentId });
    expect(!confirm.ok && confirm.code).toBe("VALIDATION");
    expect(ctx.storage.objects.has(prepared.data.storagePath)).toBe(false);
    expect((await ctx.docRepo.findById(prepared.data.attachmentId))?.uploadStatus).toBe("failed");
  });

  it("conteúdo que não corresponde à extensão (magic bytes) é rejeitado", async () => {
    const processId = await newProcess();
    const actor = managerOf(COUNCIL_A);
    const fake = new Uint8Array([1, 2, 3, 4, 5, 6]);
    const prepared = await ctx.documents.prepareUpload(actor, { processId, typeCode: "DFD", ...declared(fake) });
    if (!prepared.ok) throw new Error(prepared.message);
    await ctx.storage.put(prepared.data.storagePath, fake);
    const confirm = await ctx.documents.confirmUpload(actor, { attachmentId: prepared.data.attachmentId });
    expect(confirm.ok).toBe(false);
    expect((await ctx.docRepo.findById(prepared.data.attachmentId))?.uploadStatus).toBe("failed");
  });

  it("valida extensão, tamanho declarado e formato do hash na fase 1", async () => {
    const processId = await newProcess();
    const actor = managerOf(COUNCIL_A);
    const bad = await ctx.documents.prepareUpload(actor, { processId, typeCode: "DFD", ...declared(PDF, "malware.exe") });
    expect(!bad.ok && bad.code).toBe("VALIDATION");
    const huge = await ctx.documents.prepareUpload(actor, { processId, typeCode: "DFD", fileName: "a.pdf", size: 30 * 1024 * 1024, sha256: sha(PDF) });
    expect(!huge.ok && huge.code).toBe("VALIDATION");
    const badHash = await ctx.documents.prepareUpload(actor, { processId, typeCode: "DFD", fileName: "a.pdf", size: 10, sha256: "xyz" });
    expect(!badHash.ok && badHash.code).toBe("VALIDATION");
    expect(await ctx.docRepo.listByProcess(processId)).toHaveLength(0);
  });

  it("autorização: leitor e outro conselho não preparam; só quem iniciou confirma", async () => {
    const processId = await newProcess();
    const input = { processId, typeCode: "DFD", ...declared(PDF) };
    expect((await ctx.documents.prepareUpload(viewerOf(COUNCIL_A), input))).toMatchObject({ ok: false, code: "FORBIDDEN" });
    expect((await ctx.documents.prepareUpload(managerOf(COUNCIL_B), input))).toMatchObject({ ok: false, code: "FORBIDDEN" });

    const prepared = await ctx.documents.prepareUpload(managerOf(COUNCIL_A), input);
    if (!prepared.ok) throw new Error(prepared.message);
    await ctx.storage.put(prepared.data.storagePath, PDF);
    const other = await ctx.documents.confirmUpload(operatorOf(COUNCIL_A), { attachmentId: prepared.data.attachmentId });
    expect(!other.ok && other.code).toBe("FORBIDDEN");
  });

  it("confirmar duas vezes é idempotente", async () => {
    const processId = await newProcess();
    const actor = managerOf(COUNCIL_A);
    const prepared = await ctx.documents.prepareUpload(actor, { processId, typeCode: "DFD", ...declared(PDF) });
    if (!prepared.ok) throw new Error(prepared.message);
    await ctx.storage.put(prepared.data.storagePath, PDF);
    const first = await ctx.documents.confirmUpload(actor, { attachmentId: prepared.data.attachmentId });
    const second = await ctx.documents.confirmUpload(actor, { attachmentId: prepared.data.attachmentId });
    expect(first.ok && second.ok).toBe(true);
  });

  it("listByProcess e processes.get fornecem dados e tipos válidos para anexagem rápida", async () => {
    const processId = await newProcess();
    const actor = managerOf(COUNCIL_A);
    const prepared = await ctx.documents.prepareUpload(actor, { processId, typeCode: "DFD", ...declared(PDF) });
    if (!prepared.ok) throw new Error(prepared.message);
    await ctx.storage.put(prepared.data.storagePath, PDF);
    await ctx.documents.confirmUpload(actor, { attachmentId: prepared.data.attachmentId });

    const docs = await ctx.documents.listByProcess(actor, processId);
    expect(docs.ok).toBe(true);
    if (!docs.ok) return;
    expect(docs.data).toHaveLength(1);
    expect(docs.data[0].typeCode).toBe("DFD");
    expect(docs.data[0].uploadStatus).toBe("confirmed");

    const proc = await ctx.processes.get(actor, processId);
    expect(proc.ok).toBe(true);
    if (!proc.ok) return;
    expect(proc.data.progress.validTypes).toContain("DFD");
  });

  it("permite upload de artefato complementar com typeCode OUTRO sem afetar validTypes obrigatórios", async () => {
    const processId = await newProcess();
    const actor = managerOf(COUNCIL_A);
    const prepared = await ctx.documents.prepareUpload(actor, { processId, typeCode: "OUTRO", ...declared(PDF, "anexo-extra.pdf") });
    expect(prepared.ok).toBe(true);
    if (!prepared.ok) return;
    await ctx.storage.put(prepared.data.storagePath, PDF);
    const confirmed = await ctx.documents.confirmUpload(actor, { attachmentId: prepared.data.attachmentId });
    expect(confirmed.ok).toBe(true);

    const docs = await ctx.documents.listByProcess(actor, processId);
    expect(docs.ok && docs.data).toHaveLength(1);
    expect(docs.ok && docs.data[0].typeCode).toBe("OUTRO");

    const proc = await ctx.processes.get(actor, processId);
    expect(proc.ok && proc.data.progress.validTypes).toHaveLength(0);
    expect(proc.ok && proc.data.progress.percent).toBe(0);
  });
});
