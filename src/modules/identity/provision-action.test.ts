import { beforeEach, expect, it, vi } from "vitest";
import type { ActionContext } from "@/server/action-runner";
import type { Result } from "@/shared/lib/result";
import { specialDeleter } from "@/shared/testing/fixtures";
import { provisionCouncilAccess } from "./provision-action";

const { createUser } = vi.hoisted(() => ({ createUser: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/server/supabase/client", () => ({ getServiceClient: () => ({ auth: { admin: { createUser } } }) }));
vi.mock("@/server/action-runner", () => ({
  runAction: async (execute: (context: ActionContext) => Promise<Result<unknown>>, message: string) => {
    const result = await execute({ actor: specialDeleter(), services: {} as ActionContext["services"] });
    return result.ok ? { status: "success", data: result.data, message } : { status: "error", message: result.message };
  },
}));

beforeEach(() => createUser.mockReset());

it("exibe as credenciais geradas em um novo cadastro sem vínculo", async () => {
  createUser.mockResolvedValue({ data: { user: { id: "new-user" } }, error: null });
  const form = new FormData();
  form.set("fullName", "Usuário de teste");
  const result = await provisionCouncilAccess(null, form);
  expect(result).toMatchObject({ status: "success", data: { email: expect.stringMatching(/@acesso\.invalid$/), password: expect.any(String) } });
  expect(createUser).toHaveBeenCalledWith(expect.objectContaining({ ...result.data, email_confirm: true }));
});

it("explica que um e-mail já cadastrado pode ser vinculado como usuário existente", async () => {
  createUser.mockResolvedValue({ error: { code: "email_exists", status: 422 } });
  const form = new FormData();
  form.set("fullName", "Usuário de teste");
  form.set("email", "teste@example.com");
  expect(await provisionCouncilAccess(null, form)).toMatchObject({ status: "error", message: expect.stringContaining("Usuário existente") });
});
