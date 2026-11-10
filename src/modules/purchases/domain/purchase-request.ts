import type { PurchaseRequestStatus } from "./request-status";
import type { PurchaseRequestItem, RequestEvent } from "../schemas";

export type RequestStatus = PurchaseRequestStatus;
export type PurchaseRequestEvent = RequestEvent;
export type { PurchaseRequestItem, RequestEvent };

export interface PurchaseRequest {
  id: string;
  councilId: string;
  title: string;
  status: PurchaseRequestStatus;
  processId?: string | null;
  estimatedValue?: number | null;
  items: PurchaseRequestItem[];
  events: RequestEvent[];
  /** Chaves de recebimento já aplicadas (idempotência do recebimento). */
  receiptKeys: string[];
  createdBy: string;
  createdAt: Date;
}
