import type { AuditRecorder } from "@/modules/audit/service";
import { refreshCompletion } from "@/modules/processes/completion-refresher";
import type { ProcessRepository } from "@/modules/processes/repository";
import { guard } from "@/shared/lib/authz/guard";
import { can } from "@/shared/lib/authz/policy";
import { log } from "@/shared/lib/logger";
import { fail, ok, type Result } from "@/shared/lib/result";
import { internalError, parseInput, type RuntimeDeps } from "@/shared/lib/service-support";
import { sanitizeFileName, validateUpload } from "./domain/file-validation";
import type { DocumentRepository, StoragePort } from "./repository";
import { attachmentIdSchema, uploadDocumentSchema, type Attachment } from "./schemas";

const SIGNED_URL_TTL_SECONDS = 60;

export class DocumentService {
  constructor(
    private readonly documents: DocumentRepository,
    private readonly processes: ProcessRepository,
    private readonly storage: StoragePort,
    private readonly audit: AuditRecorder,
    private readonly runtime: RuntimeDeps,
  ) {}

  /**
   * Upload em 2 fases (R2): (1) registra anexo "pending"; (2) grava no Storage privado e
   * só então confirma. Falha de Storage deixa o anexo "failed", que NÃO conta no progresso.
   * O council_id vem do processo salvo, jamais do cliente (R14).
   */
  async upload(actor: Parameters<typeof guard>[1], input: unknown, bytes: Uint8Array): Promise<Result<Attachment>> {
    const parsed = parseInput(uploadDocumentSchema, input);
    if (!parsed.ok) return parsed;

    const process = await this.processes.findById(parsed.data.processId);
    if (!process) return fail("NOT_FOUND", "Processo não encontrado.");

    const allowed = await guard(this.audit, actor, "document.attach", process.councilId, "attachment", process.id);
    if (!allowed.ok) return allowed;
    if (process.status === "arquivado" || process.status === "cancelado") {
      return fail("INVALID_STATE", "Não é possível anexar documentos a processo arquivado ou cancelado.");
    }

    const file = validateUpload(parsed.data.fileName, bytes);
    if (!file.ok) return file;

    const id = this.runtime.newId();
    const storagePath = `${process.councilId}/${process.id}/${id}-${sanitizeFileName(parsed.data.fileName)}`;
    const pending = await this.documents.insert({
      id,
      processId: process.id,
      councilId: process.councilId,
      typeCode: parsed.data.typeCode as Attachment["typeCode"],
      fileName: parsed.data.fileName,
      mime: file.data.mime,
      size: file.data.size,
      sha256: file.data.sha256,
      storagePath,
      uploadedBy: actor.userId,
      createdAt: this.runtime.now(),
      linkStatus: "active",
      uploadStatus: "pending",
      retentionState: "retained",
    });

    try {
      await this.storage.put(storagePath, bytes, file.data.mime);
    } catch (error) {
      log("error", "document.storage_put_failed", { attachmentId: id, error: String(error) });
      await this.documents.update(id, { uploadStatus: "failed" });
      await this.audit.record({ actorId: actor.userId, action: "document.upload", entity: "attachment", entityId: id, councilId: process.councilId, result: "error", details: {} });
      return fail("INTERNAL", "Não foi possível armazenar o arquivo. Tente novamente.");
    }

    const confirmed = await this.documents.update(pending.id, { uploadStatus: "confirmed" });
    await this.audit.record({ actorId: actor.userId, action: "document.upload", entity: "attachment", entityId: id, councilId: process.councilId, result: "success", details: { type: parsed.data.typeCode, sha256: file.data.sha256 } });
    await refreshCompletion({ processes: this.processes, documents: this.documents, audit: this.audit }, process.id, actor.userId, this.runtime.now());
    return ok(confirmed!);
  }

  /** Remoção comum = desvincular (soft): o arquivo permanece no Storage, status "archived". */
  async unlink(actor: Parameters<typeof guard>[1], input: unknown): Promise<Result<Attachment>> {
    const parsed = parseInput(attachmentIdSchema, input);
    if (!parsed.ok) return parsed;
    const attachment = await this.documents.findById(parsed.data.attachmentId);
    if (!attachment) return fail("NOT_FOUND", "Documento não encontrado.");

    const allowed = await guard(this.audit, actor, "document.unlink", attachment.councilId, "attachment", attachment.id);
    if (!allowed.ok) return allowed;
    if (attachment.linkStatus !== "active") return fail("INVALID_STATE", "O documento já não está ativo.");

    const updated = await this.documents.update(attachment.id, { linkStatus: "archived" });
    await this.audit.record({ actorId: actor.userId, action: "document.unlink", entity: "attachment", entityId: attachment.id, councilId: attachment.councilId, result: "success", details: {} });
    await refreshCompletion({ processes: this.processes, documents: this.documents, audit: this.audit }, attachment.processId, actor.userId, this.runtime.now());
    return ok(updated!);
  }

  /**
   * R13: exclusão manual definitiva, exclusiva do usuário is_special_deleter (Warley).
   * Admin central NÃO pode. Remove o binário e marca "disposed" (a linha é mantida para auditoria).
   */
  async manualDelete(actor: Parameters<typeof guard>[1], input: unknown): Promise<Result<true>> {
    const parsed = parseInput(attachmentIdSchema, input);
    if (!parsed.ok) return parsed;
    const attachment = await this.documents.findById(parsed.data.attachmentId);
    if (!attachment) return fail("NOT_FOUND", "Documento não encontrado.");

    const allowed = await guard(this.audit, actor, "data.delete_manual", attachment.councilId, "attachment", attachment.id);
    if (!allowed.ok) return allowed;
    if (attachment.retentionState === "disposed") return fail("INVALID_STATE", "O documento já foi eliminado.");

    try {
      await this.storage.remove(attachment.storagePath);
    } catch (error) {
      log("error", "document.storage_remove_failed", { attachmentId: attachment.id, error: String(error) });
      return internalError();
    }
    await this.documents.update(attachment.id, { retentionState: "disposed", linkStatus: "archived" });
    await this.audit.record({ actorId: actor.userId, action: "document.manual_delete", entity: "attachment", entityId: attachment.id, councilId: attachment.councilId, result: "success", details: { sha256: attachment.sha256 } });
    await refreshCompletion({ processes: this.processes, documents: this.documents, audit: this.audit }, attachment.processId, actor.userId, this.runtime.now());
    return ok(true);
  }

  /** URL temporária e curta (R15); exige leitura do conselho dono. */
  async getDownloadUrl(actor: Parameters<typeof guard>[1], input: unknown): Promise<Result<string>> {
    const parsed = parseInput(attachmentIdSchema, input);
    if (!parsed.ok) return parsed;
    const attachment = await this.documents.findById(parsed.data.attachmentId);
    if (!attachment || attachment.uploadStatus !== "confirmed" || attachment.retentionState === "disposed") {
      return fail("NOT_FOUND", "Documento não encontrado.");
    }
    const allowed = await guard(this.audit, actor, "council.read", attachment.councilId, "attachment", attachment.id);
    if (!allowed.ok) return fail("NOT_FOUND", "Documento não encontrado.");
    return ok(await this.storage.createSignedUrl(attachment.storagePath, SIGNED_URL_TTL_SECONDS));
  }

  /** Lista os anexos de um processo (somente de quem lê o conselho dono). */
  async listByProcess(actor: Parameters<typeof guard>[1], processId: string): Promise<Result<Attachment[]>> {
    const process = await this.processes.findById(processId);
    if (!process || !can(actor, "council.read", process.councilId)) return fail("NOT_FOUND", "Processo não encontrado.");
    return ok((await this.documents.listByProcess(processId)).filter((a) => a.retentionState !== "disposed" && a.uploadStatus === "confirmed"));
  }
}
