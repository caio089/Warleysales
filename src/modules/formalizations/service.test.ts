import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryAuditRepository } from "@/modules/audit/repository.memory";
import { AuditService } from "@/modules/audit/service";
import { InMemoryDocumentRepository, InMemoryStorage } from "@/modules/documents/repository.memory";
import { DocumentService } from "@/modules/documents/service";
import { DOCUMENT_TYPE_CODES } from "@/modules/processes/domain/document-types";
import { InMemoryProcessRepository } from "@/modules/processes/repository.memory";
import { ProcessService } from "@/modules/processes/service";
import { InMemoryPurchaseRequestRepository } from "@/modules/purchases/repository.memory";
import { InMemoryInventoryRepository } from "@/modules/inventory/repository.memory";
import { InventoryService } from "@/modules/inventory/service";
import { COUNCIL_A, COUNCIL_B, centralAdmin, makeRuntime, managerOf, operatorOf, viewerOf } from "@/shared/testing/fixtures";
import { InMemoryFormalizationRepository } from "./repository.memory";
import { FormalizationService } from "./service";

const PDF = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31]);
const SUPPLIER_ID = "22222222-2222-4222-8222-222222222222";
const MATERIAL_ID = "33333333-3333-4333-8333-333333333333";

function setup() {
  const runtime = makeRuntime();
  const auditRepo = new InMemoryAuditRepository(runtime.now);
  const audit = new AuditService(auditRepo);
  const processRepo = new InMemoryProcessRepository();
  const docRepo = new InMemoryDocumentRepository();
  const storage = new InMemoryStorage();
  const processes = new ProcessService(processRepo, docRepo, audit, runtime);
  const documents = new DocumentService(docRepo, processRepo, storage, audit, runtime);
  const inventoryRepo = new InMemoryInventoryRepository(runtime.now);
  const inventory = new InventoryService(inventoryRepo, audit, runtime);
  const purchasesRepo = new InMemoryPurchaseRequestRepository();
  const formalizationRepo = new InMemoryFormalizationRepository();

  const formalizations = new FormalizationService(
    formalizationRepo,
    processes,
    inventory,
    audit,
    runtime,
    purchasesRepo,
  );

  return {
    runtime,
    auditRepo,
    audit,
    processRepo,
    docRepo,
    storage,
    processes,
    documents,
    inventoryRepo,
    inventory,
    purchasesRepo,
    formalizationRepo,
    formalizations,
  };
}

type Ctx = ReturnType<typeof setup>;

async function createProcessWithProgress(ctx: Ctx, complete: boolean, councilId = COUNCIL_A) {
  const number = await ctx.processes.getNextNumber(councilId, 2026);
  const p = await ctx.processes.create(managerOf(councilId), {
    councilId,
    number,
    title: "Aquisição de cadeiras ergonômicas",
  });
  if (!p.ok) throw new Error(p.message);

  const typesToAttach = complete ? DOCUMENT_TYPE_CODES : DOCUMENT_TYPE_CODES.slice(0, 3);
  for (const typeCode of typesToAttach) {
    const r = await ctx.documents.upload(
      managerOf(councilId),
      { processId: p.data.id, typeCode, fileName: `${typeCode}.pdf` },
      PDF,
    );
    if (!r.ok) throw new Error(r.message);
  }

  return p.data;
}

let ctx: Ctx;
beforeEach(() => {
  ctx = setup();
});

describe("FormalizationService", () => {
  it("exige 100% dos documentos para submeter e exige Warley para homologar e liberar estoque", async () => {
    // 1. Processo com < 100% -> submit falha
    const incompleteProc = await createProcessWithProgress(ctx, false);
    const failSubmit = await ctx.formalizations.submit(operatorOf(COUNCIL_A), {
      processId: incompleteProc.id,
      councilId: COUNCIL_A,
      supplierId: SUPPLIER_ID,
      instrumentType: "ata",
      instrumentNumber: "ATA-001/2026",
      estimatedValue: 10000,
      contractedValue: 8000,
    });
    expect(failSubmit.ok).toBe(false);

    // 2. Processo com 100% -> submit gera status aguardando_homologacao e calcula economia
    const completeProc = await createProcessWithProgress(ctx, true);

    // Provisionar estoque bloqueado para o órgão
    const mat = await ctx.inventory.createMaterial(managerOf(COUNCIL_A), {
      code: "CAD-001",
      name: "Cadeira",
      unit: "un",
    });
    expect(mat.ok).toBe(true);
    if (!mat.ok) return;
    const materialId = mat.data.id;

    const prov = await ctx.inventory.provisionBlocked(operatorOf(COUNCIL_A), COUNCIL_A, [
      { materialId, quantity: 10 },
    ]);
    expect(prov.ok).toBe(true);

    const levelsBefore = await ctx.inventory.listLevels(operatorOf(COUNCIL_A), COUNCIL_A);
    expect(levelsBefore.ok).toBe(true);
    if (!levelsBefore.ok) return;
    const itemBefore = levelsBefore.data.find((l) => l.materialId === materialId);
    expect(itemBefore?.blocked).toBe(10);
    expect(itemBefore?.physical).toBe(0);
    expect(itemBefore?.available).toBe(0);

    // Submeter formalização válida com item provisionado vinculado
    const successSubmit = await ctx.formalizations.submit(operatorOf(COUNCIL_A), {
      processId: completeProc.id,
      councilId: COUNCIL_A,
      supplierId: SUPPLIER_ID,
      instrumentType: "contrato",
      instrumentNumber: "CONT-001/2026",
      estimatedValue: 10000,
      contractedValue: 7500,
    });
    expect(successSubmit.ok).toBe(true);
    if (!successSubmit.ok) return;
    expect(successSubmit.data.status).toBe("aguardando_homologacao");
    expect(successSubmit.data.savingsValue).toBe(2500);
    expect(successSubmit.data.savingsPercent).toBe(25);

    // 3. Operador tenta homologar -> FORBIDDEN
    const opHomologate = await ctx.formalizations.homologate(operatorOf(COUNCIL_A), {
      processId: completeProc.id,
      note: "Tentativa de operador",
      items: [{ materialId, quantity: 10 }],
    });
    expect(!opHomologate.ok && opHomologate.code).toBe("FORBIDDEN");

    // Gestor do conselho tenta homologar -> FORBIDDEN (somente Warley / isCentralAdmin)
    const mgrHomologate = await ctx.formalizations.homologate(managerOf(COUNCIL_A), {
      processId: completeProc.id,
      items: [{ materialId, quantity: 10 }],
    });
    expect(!mgrHomologate.ok && mgrHomologate.code).toBe("FORBIDDEN");

    // 4. Warley (isCentralAdmin) homologa -> status homologado, blocked -> physical no estoque
    const warley = centralAdmin();
    const warleyHomologate = await ctx.formalizations.homologate(warley, {
      processId: completeProc.id,
      note: "Veredito Warley: homologado com sucesso",
      items: [{ materialId, quantity: 10 }],
    });
    expect(warleyHomologate.ok).toBe(true);
    if (!warleyHomologate.ok) return;
    expect(warleyHomologate.data.status).toBe("homologado");
    expect(warleyHomologate.data.homologatedBy).toBe(warley.userId);
    expect(warleyHomologate.data.homologatedAt).toBeDefined();

    // Verificar transição no estoque: blocked 10 -> 0, physical 0 -> 10, available 0 -> 10
    const levelsAfter = await ctx.inventory.listLevels(operatorOf(COUNCIL_A), COUNCIL_A);
    expect(levelsAfter.ok).toBe(true);
    if (!levelsAfter.ok) return;
    const itemAfter = levelsAfter.data.find((l) => l.materialId === materialId);
    expect(itemAfter?.blocked).toBe(0);
    expect(itemAfter?.physical).toBe(10);
    expect(itemAfter?.available).toBe(10);
  });

  it("permite a Warley rejeitar formalização com justificativa obrigatória", async () => {
    const completeProc = await createProcessWithProgress(ctx, true);
    const submitRes = await ctx.formalizations.submit(operatorOf(COUNCIL_A), {
      processId: completeProc.id,
      councilId: COUNCIL_A,
      supplierId: SUPPLIER_ID,
      instrumentType: "empenho",
      instrumentNumber: "EMP-001/2026",
      estimatedValue: 5000,
      contractedValue: 4800,
    });
    expect(submitRes.ok).toBe(true);

    // Operador tenta rejeitar -> FORBIDDEN
    const opReject = await ctx.formalizations.reject(operatorOf(COUNCIL_A), {
      processId: completeProc.id,
      note: "Preço muito alto",
    });
    expect(!opReject.ok && opReject.code).toBe("FORBIDDEN");

    // Warley rejeita com justificativa válida
    const warleyReject = await ctx.formalizations.reject(centralAdmin(), {
      processId: completeProc.id,
      note: "Justificativa de preço insuficiente. Refazer cotações.",
    });
    expect(warleyReject.ok).toBe(true);
    if (!warleyReject.ok) return;
    expect(warleyReject.data.status).toBe("rejeitada");
    expect(warleyReject.data.homologationNote).toBe("Justificativa de preço insuficiente. Refazer cotações.");

    // Não permite segunda decisão após rejeitada
    const secondTry = await ctx.formalizations.homologate(centralAdmin(), {
      processId: completeProc.id,
    });
    expect(!secondTry.ok && secondTry.code).toBe("INVALID_STATE");
  });

  it("recupera formalização por processo respeitando permissão do conselho", async () => {
    const completeProc = await createProcessWithProgress(ctx, true);
    await ctx.formalizations.submit(operatorOf(COUNCIL_A), {
      processId: completeProc.id,
      councilId: COUNCIL_A,
      supplierId: SUPPLIER_ID,
      instrumentType: "ata",
      instrumentNumber: "ATA-002/2026",
      estimatedValue: 2000,
      contractedValue: 1500,
    });

    // Membro de COUNCIL_A encontra a formalização
    const found = await ctx.formalizations.getByProcess(viewerOf(COUNCIL_A), completeProc.id);
    expect(found.ok).toBe(true);
    if (!found.ok) return;
    expect(found.data?.instrumentNumber).toBe("ATA-002/2026");

    // Membro de COUNCIL_B não encontra (NOT_FOUND por isolamento)
    const hidden = await ctx.formalizations.getByProcess(viewerOf(COUNCIL_B), completeProc.id);
    expect(!hidden.ok && hidden.code).toBe("NOT_FOUND");
  });

  it("lista formalizações pendentes de homologação (fila de Warley)", async () => {
    const completeProc = await createProcessWithProgress(ctx, true);
    await ctx.formalizations.submit(operatorOf(COUNCIL_A), {
      processId: completeProc.id,
      councilId: COUNCIL_A,
      supplierId: SUPPLIER_ID,
      instrumentType: "ata",
      instrumentNumber: "ATA-003/2026",
      estimatedValue: 3000,
      contractedValue: 2500,
    });

    const pending = await ctx.formalizations.listPending(centralAdmin());
    expect(pending.ok).toBe(true);
    if (!pending.ok) return;
    expect(pending.data.length).toBeGreaterThanOrEqual(1);
    expect(pending.data.some((f) => f.processId === completeProc.id)).toBe(true);
  });

  it("calcula resumo consolidado de economia (getSavingsSummary)", async () => {
    const proc1 = await createProcessWithProgress(ctx, true);
    await ctx.formalizations.submit(operatorOf(COUNCIL_A), {
      processId: proc1.id,
      councilId: COUNCIL_A,
      supplierId: SUPPLIER_ID,
      instrumentType: "contrato",
      instrumentNumber: "CONT-001/2026",
      estimatedValue: 10000,
      contractedValue: 7000, // Economia: 3000 (30%)
    });
    await ctx.formalizations.homologate(centralAdmin(), { processId: proc1.id });

    // Segundo processo com outra economia
    const proc2 = await ctx.processes.create(managerOf(COUNCIL_A), {
      councilId: COUNCIL_A,
      number: "002/2026",
      title: "Outro processo",
    });
    expect(proc2.ok).toBe(true);
    if (!proc2.ok) return;
    for (const typeCode of DOCUMENT_TYPE_CODES) {
      await ctx.documents.upload(managerOf(COUNCIL_A), { processId: proc2.data.id, typeCode, fileName: `${typeCode}.pdf` }, PDF);
    }
    await ctx.formalizations.submit(operatorOf(COUNCIL_A), {
      processId: proc2.data.id,
      councilId: COUNCIL_A,
      supplierId: SUPPLIER_ID,
      instrumentType: "contrato",
      instrumentNumber: "CONT-002/2026",
      estimatedValue: 20000,
      contractedValue: 16000, // Economia: 4000 (20%)
    });
    await ctx.formalizations.homologate(centralAdmin(), { processId: proc2.data.id });

    const summary = await ctx.formalizations.getSavingsSummary(viewerOf(COUNCIL_A), COUNCIL_A);
    expect(summary.ok).toBe(true);
    if (!summary.ok) return;
    expect(summary.data.count).toBe(2);
    expect(summary.data.totalEstimated).toBe(30000);
    expect(summary.data.totalContracted).toBe(23000);
    expect(summary.data.totalSavings).toBe(7000);
    // (7000 / 30000) * 100 = 23.33%
    expect(summary.data.averageSavingsPercent).toBe(23.33);
  });
});
