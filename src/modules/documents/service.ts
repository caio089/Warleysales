import type { AuditRecorder } from "@/modules/audit/service";
import { refreshCompletion } from "@/modules/processes/completion-refresher";
import type { ProcessRepository } from "@/modules/processes/repository";
import { guard } from "@/shared/lib/authz/guard";
import { can } from "@/shared/lib/authz/policy";
import { log } from "@/shared/lib/logger";
import { fail, ok, type Result } from "@/shared/lib/result";
import { internalError, parseInput, type RuntimeDeps } from "@/shared/lib/service-support";
import { ALLOWED_FILE_TYPES, extensionOf, validateFileMeta } from "@/shared/lib/upload-rules";
import { sanitizeFileName, validateUpload } from "./domain/file-validation";
import type { DocumentRepository, StoragePort } from "./repository";
import { attachmentIdSchema, prepareUploadSchema, uploadDocumentSchema, type Attachment, type PreparedUpload } from "./schemas";

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
   * Upload direto ao Storage em 2 fases (R2), sem trafegar o arquivo pela função serverless:
   *  1) `prepareUpload`: autoriza, valida extensão/tamanho declarados, registra o anexo "pending" e devolve um
   *     token de upload assinado, restrito ao caminho calculado no servidor (R14: conselho vem do processo salvo);
   *  2) o navegador envia o arquivo direto ao bucket privado;
   *  3) `confirmUpload`: o servidor relê o objeto, confere tamanho, magic bytes e SHA-256 e só então marca "confirmed".
   * Anexo pendente/falho NÃO conta no progresso.
   */
  async prepareUpload(actor: Parameters<typeof guard>[1], input: unknown): Promise<Result<PreparedUpload>> {
    const parsed = parseInput(prepareUploadSchema, input);
    if (!parsed.ok) return parsed;

    const process = await this.processes.findById(parsed.data.processId);
    if (!process) return fail("NOT_FOUND", "Processo não encontrado.");

    const allowed = await guard(this.audit, actor, "document.attach", process.councilId, "attachment", process.id);
    if (!allowed.ok) return allowed;
    if (process.status === "arquivado" || process.status === "cancelado") {
      return fail("INVALID_STATE", "Não é possível anexar documentos a processo arquivado ou cancelado.");
    }

    const meta = validateFileMeta(parsed.data.fileName, parsed.data.size);
    if (meta) return fail("VALIDATION", meta, { file: [meta] });
    const mime = ALLOWED_FILE_TYPES[extensionOf(parsed.data.fileName)]!;

    const id = this.runtime.newId();
    const storagePath = `${process.councilId}/${process.id}/${id}-${sanitizeFileName(parsed.data.fileName)}`;
    await this.documents.insert({
      id,
      processId: process.id,
      councilId: process.councilId,
      typeCode: parsed.data.typeCode as Attachment["typeCode"],
      fileName: parsed.data.fileName,
      mime,
      size: parsed.data.size,
      sha256: parsed.data.sha256,
      storagePath,
      uploadedBy: actor.userId,
      createdAt: this.runtime.now(),
      linkStatus: "active",
      uploadStatus: "pending",
      retentionState: "retained",
    });

    try {
      const signed = await this.storage.createSignedUploadUrl(storagePath);
      return ok({ attachmentId: id, storagePath, token: signed.token, mime });
    } catch (error) {
      log("error", "document.signed_upload_failed", { attachmentId: id, error: String(error) });
      await this.documents.update(id, { uploadStatus: "failed" });
      return fail("INTERNAL", "Não foi possível iniciar o envio. Tente novamente.");
    }
  }

  /** Fase final: valida o objeto realmente gravado contra o que foi declarado e confirma o anexo. */
  async confirmUpload(actor: Parameters<typeof guard>[1], input: unknown): Promise<Result<Attachment>> {
    const parsed = parseInput(attachmentIdSchema, input);
    if (!parsed.ok) return parsed;
    const attachment = await this.documents.findById(parsed.data.attachmentId);
    if (!attachment) return fail("NOT_FOUND", "Documento não encontrado.");

    const allowed = await guard(this.audit, actor, "document.attach", attachment.councilId, "attachment", attachment.id);
    if (!allowed.ok) return allowed;
    if (attachment.uploadedBy !== actor.userId) return fail("FORBIDDEN", "Somente quem iniciou o envio pode confirmá-lo.");
    if (attachment.uploadStatus === "confirmed") return ok(attachment); // idempotente
    if (attachment.uploadStatus !== "pending") return fail("INVALID_STATE", "Este envio não está mais pendente. Inicie um novo envio.");

    const bytes = await this.storage.download(attachment.storagePath).catch(() => null);
    if (!bytes) return fail("VALIDATION", "O arquivo não foi encontrado no armazenamento. Reenvie o documento.");

    const checked = validateUpload(attachment.fileName, bytes);
    const mismatch = !checked.ok
      ? checked.message
      : checked.data.size !== attachment.size || checked.data.sha256 !== attachment.sha256
        ? "O arquivo enviado não confere com o declarado (tamanho ou SHA-256)."
        : null;
    if (mismatch) {
      // Conteúdo inválido/adulterado: remove o objeto e marca como falho (não conta no progresso).
      await this.storage.remove(attachment.storagePath).catch((error) => log("error", "document.storage_remove_failed", { attachmentId: attachment.id, error: String(error) }));
      await this.documents.update(attachment.id, { uploadStatus: "failed" });
      await this.audit.record({ actorId: actor.userId, action: "document.upload", entity: "attachment", entityId: attachment.id, councilId: attachment.councilId, result: "error", details: { reason: "validation" } });
      return fail("VALIDATION", mismatch, { file: [mismatch] });
    }

    const confirmed = await this.documents.update(attachment.id, { uploadStatus: "confirmed" });
    await this.audit.record({ actorId: actor.userId, action: "document.upload", entity: "attachment", entityId: attachment.id, councilId: attachment.councilId, result: "success", details: { type: attachment.typeCode, sha256: attachment.sha256 } });
    await refreshCompletion({ processes: this.processes, documents: this.documents, audit: this.audit }, attachment.processId, actor.userId, this.runtime.now());
    return ok(confirmed!);
  }

  /**
   * Envio com os bytes já no servidor (jobs, importações, testes): valida, e então percorre o MESMO fluxo
   * prepare → gravação no Storage → confirm. A UI não usa este método (usa upload direto por URL assinada).
   */
  async upload(actor: Parameters<typeof guard>[1], input: unknown, bytes: Uint8Array): Promise<Result<Attachment>> {
    const base = parseInput(uploadDocumentSchema, input);
    if (!base.ok) return base;
    const file = validateUpload(base.data.fileName, bytes);
    if (!file.ok) return file;

    const prepared = await this.prepareUpload(actor, { ...base.data, size: file.data.size, sha256: file.data.sha256 });
    if (!prepared.ok) return prepared;
    try {
      await this.storage.put(prepared.data.storagePath, bytes, prepared.data.mime);
    } catch (error) {
      log("error", "document.storage_put_failed", { attachmentId: prepared.data.attachmentId, error: String(error) });
      const failed = await this.documents.update(prepared.data.attachmentId, { uploadStatus: "failed" });
      await this.audit.record({ actorId: actor.userId, action: "document.upload", entity: "attachment", entityId: prepared.data.attachmentId, councilId: failed?.councilId ?? null, result: "error", details: {} });
      return fail("INTERNAL", "Não foi possível armazenar o arquivo. Tente novamente.");
    }
    return this.confirmUpload(actor, { attachmentId: prepared.data.attachmentId });
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
