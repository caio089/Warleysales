import type { AppNotification } from "@/modules/notifications/schemas";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type NotificationReference = Pick<AppNotification, "entityType" | "entityId">;
type Lookup = (item: NotificationReference) => Promise<boolean>;

export function notificationResourceKey(item: NotificationReference): string | null {
  if (!UUID.test(item.entityId)) return null;
  if (item.entityType !== "ata" && item.entityType !== "contract") return null;
  return `${item.entityType}:${item.entityId}`;
}

export async function resolveNotificationDestinations(
  items: readonly NotificationReference[],
  lookup: Lookup,
): Promise<ReadonlySet<string>> {
  const references = new Map<string, NotificationReference>();
  for (const item of items) {
    const key = notificationResourceKey(item);
    if (key) references.set(key, item);
  }
  const resolved = await Promise.all([...references].map(async ([key, item]) => {
    try {
      return [key, await lookup(item)] as const;
    } catch {
      return [key, false] as const;
    }
  }));
  return new Set(resolved.filter(([, exists]) => exists).map(([key]) => key));
}

export function notificationDestination(item: NotificationReference, verified: ReadonlySet<string>): string | null {
  if (!notificationResourceKey(item) || !verified.has(notificationResourceKey(item)!)) return null;
  const id = encodeURIComponent(item.entityId);
  return item.entityType === "ata" ? `/atas/${id}` : `/contratos/${id}`;
}
