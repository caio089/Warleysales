import { describe, expect, it } from "vitest";
import { guardNatureza, naturezaFromNotes, planDossier, requestFacets, valueBand } from "./request-facets";

const pcaNote = [
  "PCA 2027, item 3.",
  "Grupo: B. Saúde.",
  "Prioridade Alta. Mês previsto: Mar/Abr.",
  "Demanda já identificada pelo órgão no PCA.",
].join(" ");

describe("facetas da solicitação", () => {
  it("usa a última prioridade registrada em uma correção", () => {
    expect(requestFacets([pcaNote, "Correção: prazo revisto | Prioridade Baixa"], 100).priority).toBe("Baixa");
  });
  it("extrai grupo, prioridade, mês e origem do histórico do PCA", () => {
    expect(requestFacets([pcaNote], 25000)).toEqual({
      priority: "Alta",
      group: "B. Saúde",
      plannedMonth: "Mar/Abr",
      valueBand: "R$ 10 mil a R$ 50 mil",
      origin: "Demanda do PCA 2027",
      natureza: "Não informado",
    });
  });

  it("marca sugestão em vermelho mesmo quando o status ainda não diz isso", () => {
    const note = "PCA 2027, item 9. Grupo: A. Apoio. Prioridade Baixa. Mês previsto: Fev. Sugestão do plano (texto em vermelho no documento).";
    expect(requestFacets([note], null).origin).toBe("Sugestão do PCA");
    expect(requestFacets([note], null).valueBand).toBe("Sem valor estimado");
  });

  it("não inventa faceta para solicitação avulsa", () => {
    expect(requestFacets(["Registrada manualmente."], 500)).toMatchObject({
      priority: "Não informado",
      group: "Não informado",
      plannedMonth: "Não informado",
      origin: "Cadastro avulso",
      valueBand: "Até R$ 10 mil",
    });
  });

  it("separa vencimento com dia, mês/ano e marca de verificação", () => {
    const note = [
      "PCA 2027, item 29.",
      "Grupo: C. Manutenção predial, engenharia e segurança.",
      "Prioridade Média. Mês previsto: 2º trim.",
      "Vencimento atual: abr/2027 [VERIFICAR].",
      "Forma prevista: Prorrogação ou nova contratação.",
      "Valor no plano: a estimar.",
      "Valor estimado não gravado: o plano marca a definir.",
      "A quantidade 1 é só o marcador desta contratação.",
    ].join(" ");
    const dossier = planDossier([note], null, "CFTV e segurança eletrônica (Disp. 004/2025)");
    expect(dossier.itemNumber).toBe("29");
    expect(dossier.plannedMonth).toBe("2º trim");
    expect(dossier.expiry).toMatchObject({ monthLabel: "abril de 2027", day: null });
    expect(dossier.needsVerification).toBe(true);
    expect(dossier.contractingForm).toBe("Prorrogação ou nova contratação");
    expect(dossier.instruments).toContain("Disp. 004/2025");
  });

  it("reconhece vencimento com dia, mês e ano", () => {
    const note = "PCA 2027, item 1. Grupo: A. Apoio. Prioridade Alta. Mês previsto: Dez/Jan. Vencimento atual: 02/01/2027. Forma prevista: Nova inexigibilidade. Valor no plano: R$ 13.177,08. Valor estimado gravado: R$ 13.177,08.";
    expect(planDossier([note], 13177.08).expiry).toMatchObject({ day: "2027-01-02", monthLabel: null });
  });

  it("não deixa mão de obra passar como material", () => {
    expect(guardNatureza("Terceirização de mão de obra – auxiliar administrativo", "material")).toBe("Serviços e mão de obra");
    expect(guardNatureza("Material de consumo, limpeza, expediente e EPI", "servico")).toBe("Apenas materiais");
    expect(guardNatureza("Gêneros alimentícios para as secretarias", "servico")).toBe("Apenas materiais");
    expect(guardNatureza("Locação de veículos para as secretarias", "material")).toBe("Serviços e mão de obra");
    expect(guardNatureza("Material de limpeza, inclusive para eventos", "material")).toBe("Apenas materiais");
    expect(guardNatureza("Coffee break e buffet para eventos", "material")).toBe("Serviços e mão de obra");
    expect(guardNatureza("Combustível para a frota", "material")).toBe("Apenas materiais");
    expect(naturezaFromNotes(["Natureza: Apenas materiais."])).toBe("Apenas materiais");
  });

  it("separa as faixas de valor nos limites", () => {
    expect(valueBand(10_000)).toBe("Até R$ 10 mil");
    expect(valueBand(10_000.01)).toBe("R$ 10 mil a R$ 50 mil");
    expect(valueBand(200_000)).toBe("R$ 50 mil a R$ 200 mil");
    expect(valueBand(200_000.01)).toBe("Acima de R$ 200 mil");
  });
});
