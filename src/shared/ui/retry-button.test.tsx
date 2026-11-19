import { describe, expect, it, vi } from "vitest";

const refresh = vi.hoisted(() => vi.fn());
const startTransition = vi.hoisted(() => (callback: () => void) => callback());
vi.mock("react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react")>()),
  useTransition: () => [false, startTransition],
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));
vi.mock("@/components/ui/button", () => ({ Button: "button" }));
import { RetryButton } from "./retry-button";

describe("RetryButton", () => {
  it("allows another retry after a refresh transition completes", () => {
    const button = RetryButton().props as { onClick: () => void; disabled: boolean };
    expect(button.disabled).toBe(false);
    button.onClick();
    button.onClick();
    expect(refresh).toHaveBeenCalledTimes(2);
  });
});
