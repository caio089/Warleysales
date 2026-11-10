import { describe, expect, it } from "vitest";
import { DOCUMENT_TYPE_CODES } from "./document-types";
import { calculateProgress, type ProcessAttachment } from "./progress";
import { buildSnapshot, effectiveProgressPercent, reevaluateCompletion } from "./completion";
import { evaluateCleanupEligibility } from "./cleanup-eligibility";
import { changeProcessStatus } from "./process-status";
import { formatProcessNumber, parseProcessNumber } from "./process-number";

const attach = (typeCode: string, overrides: Partial<ProcessAttachment> = {}): ProcessAttachment => ({
  typeCode,
  linkStatus: "active",
  uploadStatus: "confirmed",
  retentionState: "retained",
  ...overrides,
});
const allSeven = () => DOCUMENT_TYPE_CODES.map((c) => attach(c));
const day = (iso: string) => new Date(`${iso}T12:00:00Z`);

describe("Cenário A — progresso documental (R1–R3)", () => {
  it("0 anexos = 0%", () => {
    expect(calculateProgress([]).percent).toBe(0);
  });
  it("3 tipos = 42,86% (2 casas)", () => {
    expect(calculateProgress(DOCUMENT_TYPE_CODES.slice(0, 3).map((c) => attach(c))).percent).toBe(42.86);
  });
  it("vários arquivos do mesmo tipo contam uma única vez", () => {
    const p = calculateProgress([attach("DFD"), attach("DFD"), attach("DFD")]);
    expect(p.percent).toBe(14.29);
    expect(p.validTypes).toEqual(["DFD"]);
  });
  it("upload pendente, falho, substituído ou eliminado não conta", () => {
    const p = calculateProgress([
      attach("DFD", { uploadStatus: "pending" }),
      attach("ETP", { uploadStatus: "failed" }),
      attach("MR", { linkStatus: "replaced" }),
      attach("TR", { retentionState: "disposed" }),
    ]);
    expect(p.percent).toBe(0);
  });
  it("7 tipos = 100% e completo", () => {
    const p = calculateProgress(allSeven());
    expect(p.percent).toBe(100);
    expect(p.isComplete).toBe(true);
    expect(p.missingTypes).toEqual([]);
  });
  it("anexos contendo os 7 obrigatórios + 2 adicionais (OUTRO) atingem 100% e completo", () => {
    const p = calculateProgress([
      ...allSeven(),
      attach("OUTRO"),
      attach("OUTRO"),
    ]);
    expect(p.percent).toBe(100);
    expect(p.isComplete).toBe(true);
    expect(p.missingTypes).toEqual([]);
    expect(p.validTypes).toEqual(DOCUMENT_TYPE_CODES);
  });
  it("anexos contendo 5 obrigatórios + 3 adicionais atingem 71.43% (5/7)", () => {
    const five = DOCUMENT_TYPE_CODES.slice(0, 5).map((c) => attach(c));
    const p = calculateProgress([
      ...five,
      attach("OUTRO"),
      attach("OUTRO"),
      attach("OUTRO"),
    ]);
    expect(p.percent).toBe(71.43);
    expect(p.isComplete).toBe(false);
    expect(p.validTypes.length).toBe(5);
    expect(p.missingTypes.length).toBe(2);
  });
  it("anexos contendo 5 obrigatórios + 4 adicionais atingem 71.43% (5/7)", () => {
    const five = DOCUMENT_TYPE_CODES.slice(0, 5).map((c) => attach(c));
    const p = calculateProgress([
      ...five,
      attach("OUTRO"),
      attach("OUTRO"),
      attach("OUTRO"),
      attach("OUTRO"),
    ]);
    expect(p.percent).toBe(71.43);
    expect(p.isComplete).toBe(false);
    expect(p.validTypes.length).toBe(5);
    expect(p.missingTypes.length).toBe(2);
  });
  it("anexos contendo apenas documentos adicionais resultam em 0%", () => {
    const p = calculateProgress([
      attach("OUTRO"),
      attach("OUTRO"),
    ]);
    expect(p.percent).toBe(0);
    expect(p.isComplete).toBe(false);
    expect(p.validTypes).toEqual([]);
    expect(p.missingTypes).toEqual(DOCUMENT_TYPE_CODES);
  });
});

describe("Cenário B — completude e reversão (R4/R5)", () => {
  const t0 = day("2026-01-10");
  it("grava documental_completed_at ao atingir 100%", () => {
    const r = reevaluateCompletion({ documentalCompletedAt: null }, calculateProgress(allSeven()), t0);
    expect(r.event).toBe("completed");
    expect(r.state.documentalCompletedAt).toEqual(t0);
  });
  it("preserva o instante original se continuar completo", () => {
    const r = reevaluateCompletion({ documentalCompletedAt: t0 }, calculateProgress(allSeven()), day("2026-02-01"));
    expect(r.event).toBe("none");
    expect(r.state.documentalCompletedAt).toEqual(t0);
  });
  it("reverte, zera o instante e cancela elegibilidade ao perder 100%", () => {
    const six = DOCUMENT_TYPE_CODES.slice(1).map((c) => attach(c));
    const r = reevaluateCompletion({ documentalCompletedAt: t0 }, calculateProgress(six), day("2026-01-20"));
    expect(r.event).toBe("reverted");
    expect(r.state.documentalCompletedAt).toBeNull();
    expect(r.cancelCleanupEligibility).toBe(true);
  });
  it("nova conclusão reinicia a contagem dos 30 dias", () => {
    const again = reevaluateCompletion({ documentalCompletedAt: null }, calculateProgress(allSeven()), day("2026-03-01"));
    expect(again.state.documentalCompletedAt).toEqual(day("2026-03-01"));
  });
  it("100% não conclui o processo administrativo (R4)", () => {
    expect(changeProcessStatus("em_andamento", "arquivado").ok).toBe(false);
  });
});

describe("Cenário C — elegibilidade de limpeza (R6)", () => {
  const completedAt = day("2026-01-01");
  const base = {
    documentalCompletedAt: completedAt,
    hasClosingReport: true,
    activeHoldCount: 0,
    hasRetentionAuthorization: true,
  };
  it("antes de 30 dias não é elegível", () => {
    expect(evaluateCleanupEligibility({ ...base, now: day("2026-01-30") }).action).toBe("not_eligible");
  });
  it("exatamente aos 30 dias com tudo OK é elegível", () => {
    expect(evaluateCleanupEligibility({ ...base, now: day("2026-01-31") }).action).toBe("eligible_for_disposal");
  });
  it("sem relatório de encerramento fica bloqueado", () => {
    expect(evaluateCleanupEligibility({ ...base, hasClosingReport: false, now: day("2026-03-01") }).action).toBe("blocked");
  });
  it("bloqueio de retenção ativo impede", () => {
    expect(evaluateCleanupEligibility({ ...base, activeHoldCount: 1, now: day("2026-03-01") }).action).toBe("blocked");
  });
  it("sem autorização de retenção apenas arquiva (P2)", () => {
    expect(evaluateCleanupEligibility({ ...base, hasRetentionAuthorization: false, now: day("2026-03-01") }).action).toBe("archive_only");
  });
  it("processo incompleto nunca é elegível", () => {
    expect(evaluateCleanupEligibility({ ...base, documentalCompletedAt: null, now: day("2026-03-01") }).action).toBe("not_eligible");
  });
});

describe("Cenário D — snapshot pós-limpeza (R7)", () => {
  it("não volta a 0% após a eliminação dos anexos", () => {
    const snapshot = buildSnapshot(allSeven(), day("2026-02-01"));
    const disposed = DOCUMENT_TYPE_CODES.map((c) => attach(c, { retentionState: "disposed" }));
    expect(calculateProgress(disposed).percent).toBe(0);
    expect(effectiveProgressPercent(disposed, snapshot)).toBe(100);
    expect(snapshot.types.DFD).toBe(true);
  });
  it("sem snapshot usa o cálculo ao vivo", () => {
    expect(effectiveProgressPercent([attach("DFD")], null)).toBe(14.29);
  });
});

describe("situação administrativa e numeração", () => {
  it("aceita transições válidas e rejeita inválidas", () => {
    expect(changeProcessStatus("em_andamento", "concluido").ok).toBe(true);
    expect(changeProcessStatus("arquivado", "em_andamento").ok).toBe(false);
  });
  it("formata e interpreta número NNN/AAAA", () => {
    expect(formatProcessNumber(7, 2026)).toBe("007/2026");
    expect(parseProcessNumber("007/2026")).toEqual({ ok: true, data: { sequence: 7, year: 2026 } });
    expect(parseProcessNumber("abc").ok).toBe(false);
  });
});
