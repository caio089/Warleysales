import type { TransitionMap } from "@/shared/lib/state-machine";
import { checkTransition } from "@/shared/lib/state-machine";

export type ProcessStatus =
  | "em_andamento"
  | "aguardando_providencia"
  | "concluido"
  | "cancelado"
  | "arquivado";

/** Situação administrativa (independente da completude documental, R4). */
export const PROCESS_TRANSITIONS: TransitionMap<ProcessStatus> = {
  em_andamento: ["aguardando_providencia", "concluido", "cancelado"],
  aguardando_providencia: ["em_andamento", "concluido", "cancelado"],
  concluido: ["arquivado"],
  cancelado: ["arquivado"],
  arquivado: [],
};

export const changeProcessStatus = (from: ProcessStatus, to: ProcessStatus) =>
  checkTransition(PROCESS_TRANSITIONS, from, to, "processo");
