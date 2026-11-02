/** Estado serializável devolvido pelas Server Actions aos formulários. */
export type ActionState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string; fieldErrors?: Record<string, string[]> };

export const IDLE_STATE: ActionState = { status: "idle" };
