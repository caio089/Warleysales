import type { StatusTone } from "./status-badge";

/** Rótulo e tom de cada status exibido nas telas (único ponto de apresentação). */
export interface StatusPresentation {
  label: string;
  tone: StatusTone;
}

type Dictionary = Record<string, StatusPresentation>;

export const PROCESS_STATUS: Dictionary = {
  em_andamento: { label: "Em andamento", tone: "info" },
  aguardando_providencia: { label: "Aguardando providência", tone: "warning" },
  concluido: { label: "Concluído", tone: "success" },
  cancelado: { label: "Cancelado", tone: "danger" },
  arquivado: { label: "Arquivado", tone: "neutral" },
};

export const REQUEST_STATUS: Dictionary = {
  rascunho: { label: "Rascunho", tone: "neutral" },
  enviada: { label: "Enviada", tone: "info" },
  em_analise: { label: "Em análise", tone: "info" },
  aguardando_correcao: { label: "Aguardando correção", tone: "warning" },
  aprovada: { label: "Aprovada", tone: "success" },
  rejeitada: { label: "Rejeitada", tone: "danger" },
  em_atendimento: { label: "Em atendimento", tone: "info" },
  parcialmente_atendida: { label: "Parcialmente atendida", tone: "warning" },
  atendida: { label: "Atendida", tone: "success" },
  cancelada: { label: "Cancelada", tone: "neutral" },
};

export const TRANSFER_STATUS: Dictionary = {
  solicitada: { label: "Solicitada", tone: "neutral" },
  em_analise: { label: "Em análise", tone: "info" },
  aprovada: { label: "Aprovada", tone: "success" },
  separada: { label: "Separada", tone: "info" },
  em_transito: { label: "Em trânsito", tone: "warning" },
  recebida: { label: "Recebida", tone: "success" },
  rejeitada: { label: "Rejeitada", tone: "danger" },
  cancelada: { label: "Cancelada", tone: "neutral" },
};

export const MEETING_STATUS: Dictionary = {
  agendada: { label: "Agendada", tone: "info" },
  realizada: { label: "Realizada", tone: "success" },
  cancelada: { label: "Cancelada", tone: "neutral" },
  reagendada: { label: "Reagendada", tone: "warning" },
};

export const STOCK_LEVEL: Dictionary = {
  normal: { label: "Normal", tone: "success" },
  atencao: { label: "Atenção", tone: "warning" },
  critico: { label: "Crítico", tone: "danger" },
  sem_disponibilidade: { label: "Sem disponibilidade", tone: "danger" },
};

export const COMPLETION_STATUS: Dictionary = {
  completa: { label: "Documentação completa", tone: "success" },
  pendente: { label: "Documentação pendente", tone: "warning" },
};

/** Situação da solicitação dentro do estoque, até o saldo ficar disponível para pedido. */
export const STOCK_HOLD_STATUS: Dictionary = {
  bloqueado: { label: "Bloqueado", tone: "warning" },
  apto: { label: "Bloqueado · pronto para contratar", tone: "info" },
  aguardando_homologacao: { label: "Bloqueado · aguardando liberação", tone: "warning" },
  disponivel: { label: "Disponível", tone: "success" },
};

export const ORDER_STATUS: Dictionary = {
  pendente: { label: "Pendente", tone: "warning" },
  aprovado: { label: "Aprovado", tone: "success" },
  rejeitado: { label: "Rejeitado", tone: "danger" },
  cancelado: { label: "Cancelado", tone: "neutral" },
};

/** Busca segura: status desconhecido nunca quebra a tela. */
export function presentationOf(dictionary: Dictionary, key: string): StatusPresentation {
  return dictionary[key] ?? { label: key, tone: "neutral" };
}
