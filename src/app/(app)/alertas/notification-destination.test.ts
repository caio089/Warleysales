import { describe, expect, it, vi } from "vitest";
import { notificationDestination, notificationResourceKey, resolveNotificationDestinations } from "./notification-destination";

const ata = { entityType: "ata" as const, entityId: "123e4567-e89b-42d3-a456-426614174000" };
const contract = { entityType: "contract" as const, entityId: "123e4567-e89b-42d3-a456-426614174001" };

describe("notification destination resolution", () => {
  it("links only existing resources returned by authorized lookups", async () => {
    const lookup = vi.fn(async (item: typeof ata | typeof contract) => item.entityType === "ata");
    const resolved = await resolveNotificationDestinations([ata, contract], lookup);
    expect(notificationDestination(ata, resolved)).toBe("/atas/123e4567-e89b-42d3-a456-426614174000");
    expect(notificationDestination(contract, resolved)).toBeNull();
  });

  it("leaves links absent for forbidden, cross-org, missing, lookup errors, and unknown references", async () => {
    const invalid = { entityType: "ata" as const, entityId: "not-an-id" };
    const unknown = { entityType: "process" as "ata", entityId: ata.entityId };
    const lookup = vi.fn(async () => false);
    const resolved = await resolveNotificationDestinations([ata, contract, invalid, unknown], lookup);
    expect(notificationDestination(ata, resolved)).toBeNull();
    expect(notificationDestination(contract, resolved)).toBeNull();
    expect(notificationResourceKey(invalid)).toBeNull();
    expect(notificationResourceKey(unknown)).toBeNull();
    expect(lookup).toHaveBeenCalledTimes(2);

    const failed = await resolveNotificationDestinations([ata], async () => { throw new Error("read failed"); });
    expect(notificationDestination(ata, failed)).toBeNull();
  });
});
