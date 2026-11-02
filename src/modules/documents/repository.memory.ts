import { MemoryTable } from "@/shared/lib/memory-table";
import type { DocumentRepository, StoragePort } from "./repository";
import type { Attachment } from "./schemas";

export class InMemoryDocumentRepository implements DocumentRepository {
  private table = new MemoryTable<Attachment>();
  async insert(a: Attachment) { return this.table.insert(a); }
  async findById(id: string) { return this.table.get(id); }
  async listByProcess(processId: string) { return this.table.all((a) => a.processId === processId); }
  async update(id: string, changes: Partial<Attachment>) { return this.table.update(id, changes); }
}

export class InMemoryStorage implements StoragePort {
  readonly objects = new Map<string, Uint8Array>();
  /** Permite simular falha de upload nos testes. */
  failNextPut = false;

  async put(path: string, bytes: Uint8Array) {
    if (this.failNextPut) {
      this.failNextPut = false;
      throw new Error("falha simulada de storage");
    }
    this.objects.set(path, bytes);
  }
  async createSignedUploadUrl(path: string) { return { path, token: `memory-token:${path}` }; }
  async download(path: string) { return this.objects.get(path) ?? null; }
  async remove(path: string) { this.objects.delete(path); }
  async createSignedUrl(path: string, ttlSeconds: number) { return `memory://${path}?ttl=${ttlSeconds}`; }
}
