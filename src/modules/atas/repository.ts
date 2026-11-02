import type { Result } from "@/shared/lib/result";
import type { CommitmentEvent } from "./domain/balance";
import type { PriceRegistrationAta } from "./schemas";

export interface AtaRepository {
  insert(ata: PriceRegistrationAta): Promise<PriceRegistrationAta>;
  findById(id: string): Promise<PriceRegistrationAta | null>;
  findByItemId(itemId: string): Promise<PriceRegistrationAta | null>;
  listByCouncils(councilIds: readonly string[] | "all"): Promise<PriceRegistrationAta[]>;
  save(ata: PriceRegistrationAta): Promise<PriceRegistrationAta>;
  listEvents(itemId: string): Promise<CommitmentEvent[]>;
  /**
   * Leitura + validação + gravação do evento sob lock do item da ata (FOR UPDATE, H3).
   * `decide` recebe o ledger atual e devolve o evento a gravar, ou a falha que aborta tudo.
   */
  appendEventAtomically(itemId: string, decide: (events: readonly CommitmentEvent[]) => Result<CommitmentEvent>): Promise<Result<CommitmentEvent>>;
}
