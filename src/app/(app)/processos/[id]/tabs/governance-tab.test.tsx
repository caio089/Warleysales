import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

vi.mock("@/modules/processes/actions", () => ({
  changeProcessStatusFormAction: vi.fn(),
  registerClosingReportFormAction: vi.fn(),
}));

import { GovernanceTab, type GovernanceTabProps } from "./governance-tab";

const BASE_PROPS: GovernanceTabProps = {
  processId: "proc-test-123",
  status: "em_andamento",
  canChangeStatus: true,
  canRegisterClosing: true,
  closingReportRegistered: false,
  documentalComplete: true,
};

describe("GovernanceTab", () => {
  it("renderiza o cabeçalho institucional de Governança & Situação Administrativa", () => {
    const html = renderToStaticMarkup(<GovernanceTab {...BASE_PROPS} />);

    expect(html).toContain("Governança &amp; Situação Administrativa");
    expect(html).toContain(
      "Controle do ciclo de vida, transições de status e encerramento formal do processo."
    );
  });

  it("renderiza o card informativo da Trilha de Auditoria e conformidade", () => {
    const html = renderToStaticMarkup(<GovernanceTab {...BASE_PROPS} />);

    expect(html).toContain(
      "Todas as alterações de status, uploads de arquivos e homologações de compras são registradas de forma imutável na Trilha de Auditoria"
    );
  });

  it("renderiza o formulário de alteração de situação com microcopy higienizada", () => {
    const html = renderToStaticMarkup(<GovernanceTab {...BASE_PROPS} />);

    expect(html).toContain("Situação administrativa");
    expect(html).toContain(
      "Atualize a etapa administrativa do processo conforme o andamento das deliberações e sessões."
    );
    // Não deve conter microcopy antiga com jargões informais
    expect(html).not.toContain("É o andamento do processo");
    expect(html).not.toContain("Não confundir com “documentação completa”");
  });

  it("renderiza o formulário de encerramento com microcopy higienizada quando documentação completa", () => {
    const html = renderToStaticMarkup(
      <GovernanceTab {...BASE_PROPS} documentalComplete={true} />
    );

    expect(html).toContain("Relatório de encerramento");
    expect(html).toContain(
      "Emissão do relatório formal de encerramento do processo administrativo para fins de registro institucional e auditoria."
    );
    // Não deve conter termos técnicos ou jargões como R6 ou job pula
    expect(html).not.toContain("R6");
    expect(html).not.toContain("job só examina e pula");
  });

  it("exibe aviso e campo de justificativa quando encerramento com documentação incompleta", () => {
    const html = renderToStaticMarkup(
      <GovernanceTab {...BASE_PROPS} documentalComplete={false} />
    );

    expect(html).toContain(
      "Atenção: este processo não atingiu 100% dos documentos obrigatórios"
    );
    expect(html).toContain("Justificativa formal circunstanciada");
    expect(html).toContain("closingJustification");
  });

  it("exibe aviso de encerramento já registrado quando closingReportRegistered é true", () => {
    const html = renderToStaticMarkup(
      <GovernanceTab {...BASE_PROPS} closingReportRegistered={true} />
    );

    expect(html).toContain(
      "Registrado. A limpeza pode ocorrer após 30 dias, sem bloqueio e com autorização."
    );
    expect(html).not.toContain("Registrar relatório");
  });

  it("exibe aviso de permissão restrita quando usuário não pode alterar status nem registrar encerramento", () => {
    const html = renderToStaticMarkup(
      <GovernanceTab
        {...BASE_PROPS}
        canChangeStatus={false}
        canRegisterClosing={false}
      />
    );

    expect(html).toContain(
      "Você pode acompanhar e baixar documentos. Alterar a situação administrativa ou o relatório de encerramento exige permissão de gestão neste conselho."
    );
    expect(html).not.toContain("Atualizar situação");
    expect(html).not.toContain("Registrar relatório");
  });
});
