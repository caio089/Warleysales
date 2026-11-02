import { checkTransition, type TransitionMap } from "@/shared/lib/state-machine";

export type MeetingStatus = "agendada" | "realizada" | "cancelada" | "reagendada";

/** §7: reagendada volta a agendada com nova data; realizada e cancelada são finais. */
export const MEETING_TRANSITIONS: TransitionMap<MeetingStatus> = {
  agendada: ["realizada", "cancelada", "reagendada"],
  reagendada: ["agendada"],
  realizada: [],
  cancelada: [],
};

export const changeMeetingStatus = (from: MeetingStatus, to: MeetingStatus) =>
  checkTransition(MEETING_TRANSITIONS, from, to, "reunião");
