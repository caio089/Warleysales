import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { createSessionClient } from "@/server/supabase/session-client";
import { GET } from "./route";

vi.mock("@/server/supabase/session-client", () => ({ createSessionClient: vi.fn() }));

const createClient = vi.mocked(createSessionClient);

function request(query = "") {
  return new NextRequest(`http://localhost:3000/auth/callback${query}`);
}

describe("auth callback", () => {
  beforeEach(() => createClient.mockReset());

  it("sends missing code to login without contacting provider", async () => {
    const response = await GET(request());
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/login");
    expect(createClient).not.toHaveBeenCalled();
  });

  it("sends missing configuration to login without exposing errors", async () => {
    createClient.mockRejectedValueOnce(new Error("configuration unavailable"));
    const response = await GET(request("?code=sensitive-code"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/login");
    expect(response.headers.get("location")).not.toContain("sensitive-code");
  });

  it("sends provider exchange error or throw to login", async () => {
    createClient.mockResolvedValue({ auth: { exchangeCodeForSession: vi.fn().mockResolvedValue({ error: new Error("invalid") }) } } as never);
    expect((await GET(request("?code=invalid"))).headers.get("location")).toBe("http://localhost:3000/login");

    createClient.mockResolvedValue({ auth: { exchangeCodeForSession: vi.fn().mockRejectedValue(new Error("provider failure")) } } as never);
    expect((await GET(request("?code=invalid"))).headers.get("location")).toBe("http://localhost:3000/login");
  });

  it.each(["/dashboard", "/redefinir-senha"])("redirects success only to allowlisted %s", async (next) => {
    createClient.mockResolvedValue({ auth: { exchangeCodeForSession: vi.fn().mockResolvedValue({ error: null }) } } as never);
    const response = await GET(request(`?code=valid&next=${encodeURIComponent(next)}`));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(`http://localhost:3000${next}`);
  });

  it("rejects external redirect destinations", async () => {
    createClient.mockResolvedValue({ auth: { exchangeCodeForSession: vi.fn().mockResolvedValue({ error: null }) } } as never);
    const response = await GET(request("?code=valid&next=https%3A%2F%2Fevil.example"));
    expect(response.headers.get("location")).toBe("http://localhost:3000/dashboard");
  });
});
