import type { SupabaseClient } from "@supabase/supabase-js";
import type { Attachment } from "@/modules/documents/schemas";
import type { DocumentRepository, StoragePort } from "@/modules/documents/repository";
import type { DocumentalSnapshot } from "@/modules/processes/domain/completion";
import type { DocumentTypeCode } from "@/modules/processes/domain/document-types";
import type { ProcessStatus } from "@/modules/processes/domain/process-status";
import type { ProcessRepository } from "@/modules/processes/repository";
import type { AdministrativeProcess } from "@/modules/processes/schemas";
import { fail, ok } from "@/shared/lib/result";
import { isUniqueViolation, selectAll, toDate, toDateOrNull, toIso, toIsoOrNull, unwrap } from "../db";

interface SnapshotJson {
  takenAt: string;
  types: Record<DocumentTypeCode, boolean>;
  percent: number;
}

interface ProcessRow {
  id: string;
  council_id: string;
  sequence: number;
  year: number;
  number: string;
  title: string;
  status: ProcessStatus;
  documental_completed_at: string | null;
  documental_snapshot: SnapshotJson | null;
  closing_report_registered: boolean;
  created_by: string;
  created_at: string;
}

const toProcess = (row: ProcessRow): AdministrativeProcess => ({
  id: row.id,
  councilId: row.council_id,
  sequence: row.sequence,
  year: row.year,
  number: row.number,
  title: row.title,
  status: row.status,
  documentalCompletedAt: toDateOrNull(row.documental_completed_at),
  snapshot: row.documental_snapshot ? { ...row.documental_snapshot, takenAt: toDate(row.documental_snapshot.takenAt) } : null,
  closingReportRegistered: row.closing_report_registered,
  createdBy: row.created_by,
  createdAt: toDate(row.created_at),
});

const snapshotToJson = (snapshot: DocumentalSnapshot | null): SnapshotJson | null =>
  snapshot ? { takenAt: toIso(snapshot.takenAt), types: snapshot.types, percent: snapshot.percent } : null;

/** Converte somente os campos presentes em `changes` (update parcial). */
function toProcessChanges(changes: Partial<AdministrativeProcess>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (changes.title !== undefined) row.title = changes.title;
  if (changes.status !== undefined) row.status = changes.status;
  if (changes.documentalCompletedAt !== undefined) row.documental_completed_at = toIsoOrNull(changes.documentalCompletedAt);
  if (changes.snapshot !== undefined) row.documental_snapshot = snapshotToJson(changes.snapshot);
  if (changes.closingReportRegistered !== undefined) row.closing_report_registered = changes.closingReportRegistered;
  return row;
}

export class SupabaseProcessRepository implements ProcessRepository {
  constructor(private readonly db: SupabaseClient) {}

  async insert(process: AdministrativeProcess) {
    const row = {
      id: process.id, council_id: process.councilId, sequence: process.sequence, year: process.year, number: process.number,
      title: process.title, status: process.status, documental_completed_at: toIsoOrNull(process.documentalCompletedAt),
      documental_snapshot: snapshotToJson(process.snapshot), closing_report_registered: process.closingReportRegistered,
      created_by: process.createdBy, created_at: toIso(process.createdAt),
    };
    const { data, error } = await this.db.from("administrative_processes").insert(row).select().single<ProcessRow>();
    if (isUniqueViolation(error)) return fail("CONFLICT", "Já existe um processo com este número neste conselho.");
    return ok(toProcess(unwrap("processes.insert", { data, error })));
  }

  async findById(id: string) {
    const row = unwrap("processes.find", await this.db.from("administrative_processes").select().eq("id", id).maybeSingle<ProcessRow>());
    return row ? toProcess(row) : null;
  }

  async listByCouncils(councilIds: readonly string[] | "all") {
    if (councilIds !== "all" && councilIds.length === 0) return [];
    const rows = await selectAll<ProcessRow>("processes.list", (from, to) => {
      const query = this.db.from("administrative_processes").select().order("created_at", { ascending: false }).range(from, to);
      return councilIds === "all" ? query : query.in("council_id", [...councilIds]);
    });
    return rows.map(toProcess);
  }

  async update(id: string, changes: Partial<AdministrativeProcess>) {
    const patch = toProcessChanges(changes);
    if (Object.keys(patch).length === 0) return this.findById(id);
    const row = unwrap("processes.update", await this.db.from("administrative_processes").update(patch).eq("id", id).select().maybeSingle<ProcessRow>());
    return row ? toProcess(row) : null;
  }

  async nextSequence(councilId: string, year: number): Promise<number> {
    const { data, error } = await this.db
      .from("administrative_processes")
      .select("sequence")
      .eq("council_id", councilId)
      .eq("year", year)
      .order("sequence", { ascending: false })
      .limit(1)
      .maybeSingle<{ sequence: number }>();
    if (error || !data) return 1;
    return Number(data.sequence) + 1;
  }
}

interface AttachmentRow {
  id: string;
  process_id: string;
  council_id: string;
  type_code: DocumentTypeCode;
  file_name: string;
  mime: string;
  size: number;
  sha256: string;
  storage_path: string;
  uploaded_by: string;
  created_at: string;
  link_status: Attachment["linkStatus"];
  upload_status: Attachment["uploadStatus"];
  retention_state: Attachment["retentionState"];
}

const toAttachment = (row: AttachmentRow): Attachment => ({
  id: row.id, processId: row.process_id, councilId: row.council_id, typeCode: row.type_code, fileName: row.file_name,
  mime: row.mime, size: Number(row.size), sha256: row.sha256, storagePath: row.storage_path, uploadedBy: row.uploaded_by,
  createdAt: toDate(row.created_at), linkStatus: row.link_status, uploadStatus: row.upload_status, retentionState: row.retention_state,
});

export class SupabaseDocumentRepository implements DocumentRepository {
  constructor(private readonly db: SupabaseClient) {}

  async insert(a: Attachment) {
    const row = {
      id: a.id, process_id: a.processId, council_id: a.councilId, type_code: a.typeCode, file_name: a.fileName, mime: a.mime,
      size: a.size, sha256: a.sha256, storage_path: a.storagePath, uploaded_by: a.uploadedBy, created_at: toIso(a.createdAt),
      link_status: a.linkStatus, upload_status: a.uploadStatus, retention_state: a.retentionState,
    };
    return toAttachment(unwrap("attachments.insert", await this.db.from("attachments").insert(row).select().single<AttachmentRow>()));
  }

  async findById(id: string) {
    const row = unwrap("attachments.find", await this.db.from("attachments").select().eq("id", id).maybeSingle<AttachmentRow>());
    return row ? toAttachment(row) : null;
  }

  async listByProcess(processId: string) {
    const rows = unwrap("attachments.list", await this.db.from("attachments").select().eq("process_id", processId).order("created_at").returns<AttachmentRow[]>());
    return rows.map(toAttachment);
  }

  async update(id: string, changes: Partial<Attachment>) {
    const patch: Record<string, unknown> = {};
    if (changes.linkStatus !== undefined) patch.link_status = changes.linkStatus;
    if (changes.uploadStatus !== undefined) patch.upload_status = changes.uploadStatus;
    if (changes.retentionState !== undefined) patch.retention_state = changes.retentionState;
    if (Object.keys(patch).length === 0) return this.findById(id);
    const row = unwrap("attachments.update", await this.db.from("attachments").update(patch).eq("id", id).select().maybeSingle<AttachmentRow>());
    return row ? toAttachment(row) : null;
  }
}

const BUCKET = "process-documents";

/** Storage privado (R15): sem URL pública; somente URLs assinadas e temporárias. */
export class SupabaseStorage implements StoragePort {
  constructor(private readonly db: SupabaseClient) {}

  async put(path: string, bytes: Uint8Array, mime: string) {
    const { error } = await this.db.storage.from(BUCKET).upload(path, bytes, { contentType: mime, upsert: false });
    if (error) throw new Error(`Falha no upload para o Storage: ${error.message}`);
  }

  async createSignedUploadUrl(path: string) {
    const { data, error } = await this.db.storage.from(BUCKET).createSignedUploadUrl(path);
    if (error || !data) throw new Error(`Falha ao gerar URL de upload: ${error?.message ?? "sem dados"}`);
    return { path: data.path, token: data.token };
  }

  async download(path: string) {
    const { data, error } = await this.db.storage.from(BUCKET).download(path);
    if (error || !data) return null;
    return new Uint8Array(await data.arrayBuffer());
  }

  async remove(path: string) {
    const { error } = await this.db.storage.from(BUCKET).remove([path]);
    if (error) throw new Error(`Falha ao remover do Storage: ${error.message}`);
  }

  async createSignedUrl(path: string, ttlSeconds: number) {
    const { data, error } = await this.db.storage.from(BUCKET).createSignedUrl(path, ttlSeconds);
    if (error || !data) throw new Error("Falha ao gerar URL assinada.");
    return data.signedUrl;
  }
}
