import type { Attachment } from "./schemas";

/** Port de metadados de anexos. */
export interface DocumentRepository {
  insert(attachment: Attachment): Promise<Attachment>;
  findById(id: string): Promise<Attachment | null>;
  listByProcess(processId: string): Promise<Attachment[]>;
  update(id: string, changes: Partial<Attachment>): Promise<Attachment | null>;
}

/** Port do Storage privado (R15): nunca URL pública, apenas URLs temporárias. */
export interface StoragePort {
  put(path: string, bytes: Uint8Array, mime: string): Promise<void>;
  remove(path: string): Promise<void>;
  createSignedUrl(path: string, ttlSeconds: number): Promise<string>;
}
