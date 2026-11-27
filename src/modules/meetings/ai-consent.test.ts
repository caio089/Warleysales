import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { COUNCIL_A, COUNCIL_B, managerOf, viewerOf } from "@/shared/testing/fixtures";
import { fail, ok } from "@/shared/lib/result";

const mocks = vi.hoisted(() => ({
  get: vi.fn(), audit: vi.fn(), from: vi.fn(), update: vi.fn(), rpc: vi.fn(), storage: vi.fn(),
  generate: vi.fn(), actor: undefined as unknown,
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/server/action-runner", () => ({
  runAction: async (fn: (ctx: unknown) => Promise<{ok:boolean;message?:string}>, message: string) => {
    if (!mocks.actor) return {status:"error", message:"Entre novamente."};
    const result = await fn({actor:mocks.actor, services:{meetings:{get:mocks.get},audit:{record:mocks.audit}}});
    return result.ok ? {status:"success",message} : {status:"error",message:result.message};
  },
}));
vi.mock("@/server/supabase/client", () => ({getServiceClient: () => ({
  from:mocks.from, rpc:mocks.rpc, storage:{from:mocks.storage},
})}));
vi.mock("ai", () => ({generateText:mocks.generate}));
vi.mock("@ai-sdk/groq", () => ({groq:vi.fn((model: string)=>model)}));

import * as legacyModule from "@/modules/meetings/media-actions";
import { meetingReviewAction } from "@/modules/meetings/review-actions";
import { GET } from "@/app/api/cron/meeting-ai/route";

const id = "12345678-1234-4234-8234-123456789abc";
const manager = managerOf(COUNCIL_A);
const secret = "local-test-cron-placeholder";
const audioPath = () => `${COUNCIL_A}/${id}/${id}.webm`;
function submit(consent?: string) {
  const form = new FormData();
  form.set("meetingId",id);
  form.set("operation","transcript");
  if (consent) form.set("consent",consent);
  return meetingReviewAction({status:"idle"},form);
}
function work(auth = true) {
  return GET(new Request("http://localhost/api/cron/meeting-ai",{headers:auth ? {authorization:`Bearer ${secret}`} : {}}));
}
function claimed(stage: "draft" | "transcript", consent = true) {
  mocks.rpc.mockReturnValue({maybeSingle: async () => ({data:{
    id, council_id:COUNCIL_A, ai_claim:"claim", ai_stage:stage, status:"realizada",
    ai_consent_at:consent ? "2026-11-27T12:00:00Z" : null, ai_consent_by:consent ? id : null,
    audio_path:audioPath(), transcript_text:stage==="draft" ? "Fala sintética" : null,
    title:"Reunião sintética", scheduled_at:"2026-11-27T12:00:00Z",
  }})});
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("MEETING_EXTERNAL_AI","enabled");
  vi.stubEnv("GROQ_API_KEY","mock-only");
  vi.stubEnv("CRON_SECRET",secret);
  vi.stubGlobal("fetch",vi.fn());
  mocks.actor = manager;
  mocks.get.mockResolvedValue(ok({id,councilId:COUNCIL_A,status:"realizada",audioPath:audioPath()}));
  const query = { eq:vi.fn().mockReturnThis(), or:vi.fn().mockReturnThis(),
    is:vi.fn().mockReturnThis(), select:vi.fn().mockReturnThis(), maybeSingle:async()=>({data:{id}}) };
  mocks.update.mockReturnValue(query);
  mocks.from.mockReturnValue({update:mocks.update});
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe("consentimento da IA de reuniões", () => {
  it("remove a ação pública legada", () => {
    expect(legacyModule).not.toHaveProperty("draftMeetingMinutesAction");
  });
  it("nega chamada sem sessão, sem consentimento, de visualizador ou de outro órgão", async () => {
    expect((await submit()).status).toBe("error");
    mocks.actor = undefined;
    expect((await submit("on")).status).toBe("error");
    mocks.actor = viewerOf(COUNCIL_A);
    expect((await submit("on")).status).toBe("error");
    mocks.actor = managerOf(COUNCIL_B);
    mocks.get.mockResolvedValue(fail("NOT_FOUND","Reunião não encontrada."));
    expect((await submit("on")).status).toBe("error");
    expect(mocks.update).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
    expect(mocks.generate).not.toHaveBeenCalled();
  });
  it("nega o worker sem autenticação e bloqueia fila e worker com a integração desligada", async () => {
    expect((await work(false)).status).toBe(401);
    vi.stubEnv("MEETING_EXTERNAL_AI","");
    expect((await work()).status).toBe(503);
    expect((await submit("on")).status).toBe("error");
    expect(mocks.rpc).not.toHaveBeenCalled();
    expect(mocks.update).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
    expect(mocks.generate).not.toHaveBeenCalled();
  });
  it("registra autor e data na fila sem chamar o provedor na ação", async () => {
    expect((await submit("on")).status).toBe("success");
    expect(mocks.update).toHaveBeenCalledWith(expect.objectContaining({
      ai_stage:"transcript",ai_state:"queued",ai_consent_by:manager.userId,ai_consent_at:expect.any(String),
    }));
    expect(fetch).not.toHaveBeenCalled();
  });
  it("recusa consentimento ausente mesmo se a RPC devolver um trabalho", async () => {
    claimed("transcript",false);
    expect((await work()).status).toBe(502);
    expect(mocks.storage).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
    expect(mocks.generate).not.toHaveBeenCalled();
  });
  it("processa transcrição e minuta autorizadas com respostas simuladas", async () => {
    claimed("transcript");
    mocks.storage.mockReturnValue({
      info:async()=>({data:{size:1}}),
      download:async()=>({data:new Blob(["a"],{type:"audio/webm"})}),
    });
    vi.mocked(fetch).mockResolvedValue(Response.json({text:"Fala sintética."}));
    expect((await work()).status).toBe(204);
    expect(fetch).toHaveBeenCalledOnce();
    expect(mocks.update).toHaveBeenCalledWith(expect.objectContaining({transcript_text:"Fala sintética.",ai_state:"done"}));
    claimed("draft");
    mocks.generate.mockResolvedValue({text:'{"minuta":"Texto sintético.","atividades":["Revisar minuta"]}'});
    expect((await work()).status).toBe(204);
    expect(mocks.generate).toHaveBeenCalledOnce();
    expect(mocks.update).toHaveBeenCalledWith(expect.objectContaining({minutes_draft:"Texto sintético.",ai_state:"done"}));
  });
});
