import { can, readableCouncilIds, type Actor } from "@/shared/lib/authz/policy";
import { fail, ok, type Result } from "@/shared/lib/result";
import type { TransferRepository } from "./repository";
import type { Transfer } from "./schemas";

export class TransferService {
  constructor(private readonly transfers: TransferRepository) {}

  async list(actor: Actor): Promise<Result<Transfer[]>> {
    const scope = readableCouncilIds(actor);
    if (scope !== "all" && scope.length === 0) return ok([]);
    return ok(await this.transfers.listByCouncils(scope));
  }

  async get(actor: Actor, id: string): Promise<Result<Transfer>> {
    const transfer = await this.transfers.findById(id);
    if (!transfer || !(can(actor, "council.read", transfer.originCouncilId) || can(actor, "council.read", transfer.destinationCouncilId))) {
      return fail("NOT_FOUND", "Transferência não encontrada.");
    }
    return ok(transfer);
  }
}
