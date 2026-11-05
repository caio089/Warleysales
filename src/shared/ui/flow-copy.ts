import type { PurchaseRequestStatus } from "@/modules/purchases/domain/request-status";
import type { NextStepProps } from "./flow-guide";

/** Caminho feliz da solicitação — o que a pessoa comum precisa enxergar. */
export const REQUEST_LIFECYCLE = [
  { key: "rascunho", label: "Rascunho" },
  { key: "enviada", label: "Enviada" },
  { key: "em_analise", label: "Em análise" },
  { key: "aprovada", label: "Aprovada" },
  { key: "em_atendimento", label: "Recebendo" },
  { key: "atendida", label: "Concluída" },
] as const;

/** Mapeia status “laterais” para a etapa do trilho mais próxima. */
const REQUEST_RAIL_ALIAS: Partial<Record<PurchaseRequestStatus, string>> = {
  aguardando_correcao: "em_analise",
  parcialmente_atendida: "em_atendimento",
  rejeitada: "em_analise",
  cancelada: "rascunho",
};

export function requestRailKey(status: PurchaseRequestStatus): string {
  return REQUEST_RAIL_ALIAS[status] ?? status;
}

export function requestNextStep(
  status: PurchaseRequestStatus,
  perms: { canCreate: boolean; canDecide: boolean; canReceive: boolean },
): NextStepProps {
  switch (status) {
    case "rascunho":
      return {
        title: "Enviar a solicitação",
        description: perms.canCreate
          ? "Revise os itens e clique em Enviar. Enquanto for rascunho, o gestor ainda não analisa."
          : "Peça a quem criou a solicitação para clicar em Enviar.",
        tone: perms.canCreate ? "action" : "info",
      };
    case "enviada":
      return {
        title: "Iniciar a análise",
        description: perms.canDecide
          ? "Clique em Iniciar análise para revisar e decidir (aprovar, pedir correção ou rejeitar)."
          : "Aguardando o gestor do conselho iniciar a análise.",
        tone: perms.canDecide ? "action" : "info",
      };
    case "em_analise":
      return {
        title: "Aprovar ou não",
        description: perms.canDecide
          ? "Sim autoriza a compra. O estoque só muda quando o material chegar. Não pede o motivo."
          : "Aguardando a decisão de quem analisa.",
        tone: perms.canDecide ? "action" : "info",
      };
    case "aguardando_correcao":
      return {
        title: "Corrigir e reenviar",
        description: perms.canCreate
          ? "Ajuste o que foi pedido e clique em Reenviar após correção."
          : "Aguardando quem criou a solicitação corrigir e reenviar.",
        tone: perms.canCreate ? "action" : "info",
      };
    case "aprovada":
      return {
        title: "Registrar o recebimento",
        description: perms.canReceive
          ? "O material só entra no estoque quando você registrar o recebimento abaixo. Informe as quantidades que chegaram."
          : "Solicitação aprovada. Quem opera o estoque precisa registrar o recebimento.",
        tone: perms.canReceive ? "action" : "info",
      };
    case "em_atendimento":
    case "parcialmente_atendida":
      return {
        title: "Continuar o recebimento",
        description: perms.canReceive
          ? "Ainda há quantidade pendente. Registre o que chegou agora; quando tudo for recebido, a solicitação fica concluída."
          : "Recebimento em andamento. Quem opera o estoque registra as entradas.",
        tone: perms.canReceive ? "action" : "info",
      };
    case "atendida":
      return {
        title: "Solicitação concluída",
        description: "Tudo foi recebido e o estoque já foi atualizado. Não há mais ações pendentes.",
        tone: "done",
      };
    case "rejeitada":
      return {
        title: "Solicitação rejeitada",
        description: perms.canDecide
          ? "Fluxo encerrado. Só reabra com justificativa se for excepcional."
          : "Fluxo encerrado. Fale com o gestor se precisar reabrir.",
        tone: "info",
      };
    case "cancelada":
      return {
        title: "Solicitação cancelada",
        description: "Nada foi aprovado nem lançado no estoque. Você pode criar outra solicitação se precisar.",
        tone: "info",
      };
    default:
      return {
        title: "Acompanhe o histórico",
        description: "Veja o status atual e o histórico abaixo para saber o que já aconteceu.",
        tone: "info",
      };
  }
}

export function processNextStep(input: {
  completion: "completa" | "pendente";
  typesDone: number;
  typesTotal: number;
  canUpload: boolean;
  status: string;
}): NextStepProps {
  if (input.completion === "pendente") {
    const faltam = input.typesTotal - input.typesDone;
    return {
      title: "Anexar os documentos",
      description: input.canUpload
        ? `Faltam ${faltam} tipo(s) dos ${input.typesTotal} obrigatórios. Em cada card abaixo, envie o arquivo correspondente (DFD, ETP, MR, TR, PP, PJ e ED).`
        : `Documentação incompleta (${input.typesDone}/${input.typesTotal}). Peça a quem tem permissão para anexar os arquivos.`,
      tone: input.canUpload ? "action" : "info",
    };
  }
  if (input.status === "em_andamento" || input.status === "aguardando_providencia") {
    return {
      title: "Documentação completa",
      description:
        "Os 7 documentos estão anexados. A situação administrativa (em andamento, concluído etc.) é outra coisa — atualize-a no bloco acima quando o processo realmente terminar.",
      tone: "info",
    };
  }
  if (input.status === "concluido") {
    return {
      title: "Processo concluído",
      description: "Situação administrativa encerrada. A limpeza documental só ocorre depois, com regras de retenção.",
      tone: "done",
    };
  }
  return {
    title: "Processo atualizado",
    description: "Use os cards de documento e a situação administrativa conforme a necessidade do conselho.",
    tone: "info",
  };
}

export const REQUEST_FLOW_STEPS = [
  { title: "Criar", detail: "Informe conselho, título e os materiais. Salva como rascunho." },
  { title: "Enviar", detail: "Quem criou envia para o gestor analisar." },
  { title: "Aprovar", detail: "Gestor decide. Se houver ata, o saldo é comprometido — estoque ainda não muda." },
  { title: "Receber", detail: "No recebimento, o estoque sobe. Pronto." },
];

export const PROCESS_FLOW_STEPS = [
  { title: "Abrir processo", detail: "Número no formato NNN/AAAA e o objeto (o que está sendo licitado/contratado)." },
  { title: "Anexar 7 docs", detail: "DFD, ETP, MR, TR, PP, PJ e ED — um por tipo. O progresso sobe sozinho." },
  { title: "Acompanhar", detail: "Documentação completa ≠ processo concluído. A situação administrativa é à parte." },
  { title: "Encerrar", detail: "Quando acabar de fato, mude a situação para Concluído." },
];
