import type { FormalizationStatus, ProcessFormalization } from "./domain/formalization";

export interface FormalizationFilter {
  status?: FormalizationStatus;
}

export interface FormalizationRepository {
  insert(formalization: ProcessFormalization): Promise<ProcessFormalization>;
  findByProcessId(processId: string): Promise<ProcessFormalization | null>;
  findById(id: string): Promise<ProcessFormalization | null>;
  update(
    id: string,
    patch: Partial<Pick<ProcessFormalization, "status" | "homologatedBy" | "homologatedAt" | "homologationNote">>,
  ): Promise<ProcessFormalization>;
  listByCouncils(
    councilIds: readonly string[] | "all",
    filter?: FormalizationFilter,
  ): Promise<ProcessFormalization[]>;
}
