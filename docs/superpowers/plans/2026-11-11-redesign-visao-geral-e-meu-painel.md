# Redesign Visual e Proporcional de "Visão Geral" e "Meu Painel" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar as páginas de "Visão Geral" (`/dashboard`) e "Meu Painel" (`/meu-conselho`) em layouts executivos proporcionais, eliminando a sobrecarga de cards ("card soup"), o desequilíbrio de alturas verticais e a desproporção tipográfica.

**Architecture:** Adotar uma régua de 4 KPIs estratégicos por tela, substituir o layout triplo assimétrico por um grid de 2 colunas 50/50 balanceado, encapsular ações secundárias e agendamento de reuniões em diálogos modais limpos, e converter o briefing de IA em um card executivo compacto com chips de ação.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide React, Radix/Base-UI Dialog, Vitest (`renderToStaticMarkup`).

## Global Constraints

- Preserve all existing auth, permissions (`can`, `isWarley`, `isCentralAdmin`), and query parameter handling (`councilId`, `focus`).
- Do not invent mock data or alter Server Actions / database queries.
- Maintain responsive support across mobile, tablet, and desktop breakpoints.
- Adhere strictly to the Next.js agent rules in `AGENTS.md`.

---

### Task 1: Refatoração do componente compartilhado `KpiCard`

**Files:**
- Modify: `src/shared/ui/kpi-card.tsx`
- Modify: `src/shared/ui/ui.test.tsx:31-33`

**Interfaces:**
- Consumes:
  ```ts
  interface KpiCardProps {
    label: string;
    value: string | number | null | undefined;
    hint?: ReactNode;
    icon?: ReactNode;
    href?: string;
    accent?: boolean;
  }
  ```
- Produces:
  `export function KpiCard({ label, value, hint, icon, href, accent }: KpiCardProps): JSX.Element`

- [ ] **Step 1: Escrever teste unitário para novas classes e hierarquia do KpiCard**

Adicionar verificação em `src/shared/ui/ui.test.tsx`:
```tsx
it("KpiCard renderiza com hierarquia proporcional e sem truncamento", () => {
  const html = renderToStaticMarkup(
    <KpiCard label="Solicitações Pendentes" value={5} hint="2 em andamento" accent />
  );
  expect(html).toContain("Solicitações Pendentes");
  expect(html).toContain("5");
  expect(html).toContain("2 em andamento");
});
```

- [ ] **Step 2: Executar teste para verificar comportamento atual**

Run: `npx vitest run src/shared/ui/ui.test.tsx`
Expected: PASS (base atual)

- [ ] **Step 3: Implementar melhorias de proporção no `KpiCard`**

Editar `src/shared/ui/kpi-card.tsx`:
```tsx
import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  /** Valor já formatado; null/undefined exibe "—" (nunca inventa número). */
  value: string | number | null | undefined;
  hint?: ReactNode;
  icon?: ReactNode;
  href?: string;
  /** Aplica o realce no número (prazos, estoque crítico). */
  accent?: boolean;
}

export function KpiCard({ label, value, hint, icon, href, accent = false }: KpiCardProps) {
  const inner = (
    <>
      <span
        aria-hidden
        className={cn(
          "absolute top-4 left-0 h-6 w-1 rounded-r-full transition-colors",
          accent ? "bg-amber-500 dark:bg-amber-400" : "bg-primary/20 group-hover:bg-primary/40",
        )}
      />
      <div className="relative flex items-center justify-between gap-2 pl-2">
        <p className="text-xs font-medium text-muted-foreground truncate">{label}</p>
        {icon ? (
          <span
            className={cn(
              "grid size-8 shrink-0 place-items-center rounded-lg transition-transform duration-200 group-hover:scale-105",
              accent
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                : "bg-secondary/80 text-muted-foreground group-hover:text-primary",
            )}
          >
            {icon}
          </span>
        ) : null}
      </div>
      <p
        className={cn(
          "relative mt-2 pl-2 font-heading text-2xl sm:text-3xl font-semibold tabular-nums tracking-tight",
          accent ? "text-amber-600 dark:text-amber-400" : "text-primary",
        )}
      >
        {value ?? "—"}
      </p>
      {hint ? <div className="relative mt-1 pl-2 text-xs text-muted-foreground/80 line-clamp-1">{hint}</div> : null}
    </>
  );

  const className = cn(
    "kpi-card surface-card card-hover group relative overflow-hidden p-4 sm:p-5 rounded-2xl border transition-all",
    href && "block focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none hover:border-border/80",
  );

  if (href) {
    return (
      <Link href={href} aria-label={label} className={className}>
        {inner}
      </Link>
    );
  }

  return (
    <section aria-label={label} className={className}>
      {inner}
    </section>
  );
}
```

- [ ] **Step 4: Executar testes de UI**

Run: `npx vitest run src/shared/ui/ui.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/shared/ui/kpi-card.tsx src/shared/ui/ui.test.tsx
git commit -m "feat(ui): refatorar KpiCard para proporcao executiva e tipografia equilibrada"
```

---

### Task 2: Redesign Executivo do Briefing de IA (`BriefingCard`)

**Files:**
- Modify: `src/app/(app)/dashboard/briefing-card.tsx`
- Create: `src/app/(app)/dashboard/briefing-card.test.tsx`

**Interfaces:**
- Consumes:
  `BriefingFacts` from `@/modules/insights/briefing`
- Produces:
  `export function BriefingCard({ facts }: { facts: BriefingFacts }): Promise<JSX.Element>`
  `export function BriefingFallback(): JSX.Element`

- [ ] **Step 1: Criar teste de renderização do BriefingCard**

Criar `src/app/(app)/dashboard/briefing-card.test.tsx`:
```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BriefingFallback } from "./briefing-card";

describe("BriefingCard", () => {
  it("renderiza fallback sem quebrar e com semântica de carregamento", () => {
    const html = renderToStaticMarkup(<BriefingFallback />);
    expect(html).toContain("Briefing Operacional");
  });
});
```

- [ ] **Step 2: Executar teste de fallback**

Run: `npx vitest run src/app/(app)/dashboard/briefing-card.test.tsx`
Expected: PASS

- [ ] **Step 3: Implementar o redesign compacto do `BriefingCard`**

Atualizar `src/app/(app)/dashboard/briefing-card.tsx`:
```tsx
import { Sparkles, AlertTriangle, CheckCircle2, ChevronRight } from "lucide-react";
import Link from "next/link";
import { generateBriefing } from "@/modules/insights/service";
import type { BriefingFacts } from "@/modules/insights/briefing";

export async function BriefingCard({ facts }: { facts: BriefingFacts }) {
  const insight = await generateBriefing(facts);

  return (
    <section
      aria-label="Briefing Operacional de IA"
      className="relative overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-r from-card via-card to-amber-500/5 p-4 sm:p-5 shadow-xs"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <Sparkles className="size-4" aria-hidden />
          </span>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Briefing Operacional
          </h2>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.68rem] font-semibold ${
              insight.hasBlockers
                ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
            }`}
          >
            {insight.hasBlockers ? (
              <>
                <AlertTriangle className="size-3 text-amber-600 dark:text-amber-400" />
                Pontos de atenção
              </>
            ) : (
              <>
                <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
                Operação estável
              </>
            )}
          </span>
        </div>
        <p className="text-xs font-semibold text-primary">{insight.headline}</p>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {insight.bullets.map((bullet, index) => (
          <div
            key={index}
            className="flex items-start gap-2 rounded-xl bg-background/60 p-2.5 text-xs text-foreground/90 border border-border/40"
          >
            <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-amber-500" />
            <span className="leading-snug">{bullet}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function BriefingFallback() {
  return (
    <div
      aria-label="Carregando briefing"
      className="flex items-center gap-2 rounded-2xl border border-border/40 bg-card p-4 text-xs text-muted-foreground"
    >
      <Sparkles className="size-4 animate-spin text-amber-500" />
      <span>Carregando briefing operacional...</span>
    </div>
  );
}
```

- [ ] **Step 4: Executar testes de briefing**

Run: `npx vitest run src/app/(app)/dashboard/briefing-card.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/(app)/dashboard/briefing-card.tsx src/app/(app)/dashboard/briefing-card.test.tsx
git commit -m "feat(dashboard): redesenhar BriefingCard em formato executivo com chips de alerta"
```

---

### Task 3: Reestruturação da Visão Geral em 4 KPIs Mestres e Grid 2 Colunas Balanceadas

**Files:**
- Modify: `src/app/(app)/dashboard/panels.tsx`
- Modify: `src/app/(app)/dashboard/page.tsx`
- Create: `src/app/(app)/dashboard/dashboard-layout.test.tsx`

**Interfaces:**
- Consumes: Lookups, savingsSummary, scopedRequests, stockLevels, alerts, meetings.
- Produces: 4 master KPIs, 2-column balanced grid, elimination of bottom `ShortcutGrid`.

- [ ] **Step 1: Criar teste para validar a estrutura e renderização de `panels.tsx`**

Criar `src/app/(app)/dashboard/dashboard-layout.test.tsx`:
```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { UpcomingMeetingsPanel, AlertsPanel, DeliveriesSummaryPanel } from "./panels";

describe("Dashboard Panels", () => {
  it("UpcomingMeetingsPanel renderiza lista com empty state harmonioso", () => {
    const html = renderToStaticMarkup(<UpcomingMeetingsPanel items={[]} />);
    expect(html).toContain("Próximas Reuniões");
    expect(html).toContain("Nenhuma reunião agendada");
  });

  it("AlertsPanel limita visualização e informa não lidos", () => {
    const html = renderToStaticMarkup(
      <AlertsPanel items={[{ id: "1", title: "Ata vencendo", body: "Aviso", unread: true, at: new Date().toISOString(), href: "/atas" }]} unread={1} />
    );
    expect(html).toContain("Alertas &amp; Avisos");
    expect(html).toContain("Ata vencendo");
  });
});
```

- [ ] **Step 2: Executar teste dos painéis**

Run: `npx vitest run src/app/(app)/dashboard/dashboard-layout.test.tsx`
Expected: PASS

- [ ] **Step 3: Ajustar alturas e densidade dos painéis em `panels.tsx`**

Editar `src/app/(app)/dashboard/panels.tsx`:
- Ajustar `UpcomingMeetingsPanel`: fixar altura mínima proporcional, remover excesso de margens em branco.
- Ajustar `AlertsPanel`: limitar altura com `max-h-[380px] overflow-y-auto pr-1` para não esticar a coluna desproporcionalmente.
- Ajustar `ReplenishmentPanel` e `RecentRequestsPanel` com acabamento de tabela limpo.

- [ ] **Step 4: Refatorar `src/app/(app)/dashboard/page.tsx` para 4 KPIs e grid 2 colunas**

Atualizar o retorno de `DashboardContent` em `src/app/(app)/dashboard/page.tsx`:
1. Régua de 4 KPIs mestres:
   ```tsx
   <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
     <KpiCard
       href="/solicitacoes"
       icon={<ShoppingCart className="size-4" aria-hidden />}
       label="Solicitações Pendentes"
       value={reqPending}
       accent={reqPending > 0}
       hint={`${reqInProgress} em andamento`}
     />
     <KpiCard
       href="/solicitacoes"
       icon={<Truck className="size-4" aria-hidden />}
       label="Entregas Pendentes"
       value={`${pendingDeliveryUnits} un`}
       accent={pendingDeliveryUnits > 0}
       hint={`${deliveredUnits} un já entregues`}
     />
     <KpiCard
       href="/estoque"
       icon={<PackageX className="size-4" aria-hidden />}
       label="Estoque Crítico"
       value={replenishmentItems.length}
       accent={replenishmentItems.length > 0}
       hint={replenishmentItems.length > 0 ? "Exige reposição" : "Estável"}
     />
     <KpiCard
       icon={<TrendingDown className="size-4" aria-hidden />}
       label="Economia Gerada"
       value={formatCurrency(savingsSummary.totalSavings)}
       hint={`${formatPercent(savingsSummary.averageSavingsPercent)} redução média`}
     />
   </div>
   ```
2. Grade principal em 2 colunas balanceadas:
   ```tsx
   <div className="grid gap-6 lg:grid-cols-2 items-start">
     <div className="space-y-6">
       <RecentRequestsPanel items={recentRequests} />
       <ReplenishmentPanel items={replenishmentItems} />
       <DeliveriesSummaryPanel delivered={deliveredUnits} pending={pendingDeliveryUnits} />
     </div>
     <div className="space-y-6">
       <UpcomingMeetingsPanel items={upcomingMeetings.slice(0, 4)} />
       <AlertsPanel items={alertItems} unread={alerts.unread} />
       {showDocs ? (
         <StatusDistribution rows={dash.processStatuses} total={s.processes.total} />
       ) : null}
     </div>
   </div>
   ```
3. Remover `<ShortcutGrid />` do rodapé.

- [ ] **Step 5: Executar testes de dashboard**

Run: `npx vitest run src/app/(app)/dashboard`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/app/(app)/dashboard/page.tsx src/app/(app)/dashboard/panels.tsx src/app/(app)/dashboard/dashboard-layout.test.tsx
git commit -m "feat(dashboard): balancear layout em 4 KPIs e 2 colunas proporcionais"
```

---

### Task 4: Refatoração da Barra de Atalhos Rápidos do Meu Painel (`ActionHub`)

**Files:**
- Modify: `src/app/(app)/meu-conselho/action-hub.tsx`
- Create: `src/app/(app)/meu-conselho/action-hub.test.tsx`

**Interfaces:**
- Consumes:
  `canCreateRequest`, `canCreateProcess`, `canManageMeeting`, `canCreateOrder`, `councilId`, `onOpenMeetingDialog?: () => void`
- Produces:
  `export function ActionHub(props): JSX.Element`

- [ ] **Step 1: Criar teste para validar a barra de atalhos**

Criar `src/app/(app)/meu-conselho/action-hub.test.tsx`:
```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ActionHub } from "./action-hub";

describe("ActionHub", () => {
  it("renderiza atalhos rápidos compactos", () => {
    const html = renderToStaticMarkup(
      <ActionHub
        councilId="c1"
        canCreateRequest
        canCreateProcess
        canManageMeeting
        canCreateOrder
      />
    );
    expect(html).toContain("Nova solicitação");
    expect(html).toContain("Novo processo");
  });
});
```

- [ ] **Step 2: Executar teste**

Run: `npx vitest run src/app/(app)/meu-conselho/action-hub.test.tsx`
Expected: PASS ou FAIL dependendo da assinatura atual

- [ ] **Step 3: Implementar a nova barra compacta de atalhos em `action-hub.tsx`**

Editar `src/app/(app)/meu-conselho/action-hub.tsx` para renderizar uma barra moderna de atalhos horizontais em vez de 6 cartões gigantescos:
- Layout em flex/grid compacto (`grid grid-cols-2 sm:grid-cols-4 gap-3`).
- Cards compactos com ícone sutil, label claro e setinha indicativa.
- Agendar reunião aciona abertura do modal.

- [ ] **Step 4: Executar testes**

Run: `npx vitest run src/app/(app)/meu-conselho/action-hub.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/(app)/meu-conselho/action-hub.tsx src/app/(app)/meu-conselho/action-hub.test.tsx
git commit -m "feat(meu-conselho): converter ActionHub em barra de atalhos compacta e executiva"
```

---

### Task 5: Modal de Agendamento de Reuniões no Meu Painel (`MeetingDialog`)

**Files:**
- Create: `src/app/(app)/meu-conselho/meeting-dialog.tsx`
- Create: `src/app/(app)/meu-conselho/meeting-dialog.test.tsx`

**Interfaces:**
- Consumes:
  `councilId: string`, `councilLabel: string`, `trigger?: ReactNode`
- Produces:
  `export function MeetingDialog({ councilId, councilLabel, trigger }: MeetingDialogProps): JSX.Element`

- [ ] **Step 1: Criar teste de renderização do `MeetingDialog`**

Criar `src/app/(app)/meu-conselho/meeting-dialog.test.tsx`:
```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MeetingDialog } from "./meeting-dialog";

describe("MeetingDialog", () => {
  it("renderiza botão de disparo com acessibilidade", () => {
    const html = renderToStaticMarkup(
      <MeetingDialog councilId="123" councilLabel="CREA" />
    );
    expect(html).toContain("Agendar Reunião");
  });
});
```

- [ ] **Step 2: Executar teste**

Run: `npx vitest run src/app/(app)/meu-conselho/meeting-dialog.test.tsx`
Expected: FAIL (arquivo ainda não existe)

- [ ] **Step 3: Implementar `src/app/(app)/meu-conselho/meeting-dialog.tsx`**

Criar o componente utilizando o padrão de Sheet/Dialog do projeto com `NewMeetingForm`:
```tsx
"use client";

import { useState, type ReactNode } from "react";
import { CalendarDays, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NewMeetingForm } from "@/app/(app)/reunioes/meeting-forms";

interface MeetingDialogProps {
  councilId: string;
  councilLabel: string;
  trigger?: ReactNode;
}

export function MeetingDialog({ councilId, councilLabel, trigger }: MeetingDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm" className="gap-2">
            <CalendarDays className="size-4" />
            Agendar Reunião
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="flex items-center gap-2">
            <CalendarDays className="size-5 text-primary" />
            Solicitar Reunião ou Alinhamento
          </SheetTitle>
          <SheetDescription>
            A reunião fica registrada diretamente na agenda operacional da empresa ({councilLabel}) com o Warley.
          </SheetDescription>
        </SheetHeader>
        <div className="pt-2">
          <NewMeetingForm
            councils={[{ value: councilId, label: councilLabel }]}
            defaultCouncilId={councilId}
            lockCouncil
            onSuccess={() => setOpen(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

- [ ] **Step 4: Executar teste**

Run: `npx vitest run src/app/(app)/meu-conselho/meeting-dialog.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/(app)/meu-conselho/meeting-dialog.tsx src/app/(app)/meu-conselho/meeting-dialog.test.tsx
git commit -m "feat(meu-conselho): criar MeetingDialog para agendamento de reunioes sem quebrar o rodape"
```

---

### Task 6: Reestruturação do Meu Painel em 4 KPIs e Grid 2 Colunas Balanceadas

**Files:**
- Modify: `src/app/(app)/meu-conselho/page.tsx`
- Modify: `src/app/(app)/meu-conselho/overview-lists.tsx`

**Interfaces:**
- Consumes: 4 master KPIs, compact budget efficiency badge, 2-column balanced layout, integrated `MeetingDialog`.
- Produces: Proportional, clutter-free Meu Painel page.

- [ ] **Step 1: Ajustar `overview-lists.tsx` para manter alinhamento proporcional**

Editar `src/app/(app)/meu-conselho/overview-lists.tsx` para assegurar que as listas de Solicitações, Processos e Reuniões tenham alturas calibradas e cabeçalhos uniformes.

- [ ] **Step 2: Refatorar `src/app/(app)/meu-conselho/page.tsx`**

1. Substituir a régua de 6 cards por 4 KPIs operacionais mestres:
   - Solicitações em Andamento
   - Materiais Recebidos
   - Entregas Pendentes
   - Pedidos de Material
2. Substituir o banner gigante de "Eficiência Orçamentária" por uma barra/card proporcional compacta.
3. Organizar o corpo em 2 colunas balanceadas:
   - **Coluna 1 (Materiais & Pedidos):** Estoque disponível na empresa + Pedidos de materiais com empty state compacto.
   - **Coluna 2 (Demandas & Agenda):** Solicitações recentes + Processos + Reuniões agendadas (com botão que aciona o `MeetingDialog`).
4. Remover a seção isolada de agendamento de reuniões no rodapé (`section id="agendar-reuniao"`).

- [ ] **Step 3: Executar testes de `meu-conselho`**

Run: `npx vitest run src/app/(app)/meu-conselho`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/app/(app)/meu-conselho/page.tsx src/app/(app)/meu-conselho/overview-lists.tsx
git commit -m "feat(meu-conselho): reestruturar pagina em 4 KPIs, 2 colunas e modal de reuniao"
```

---

### Task 7: Verificação Integrada de Qualidade (Testes, Typecheck e Build)

**Files:**
- Test: All suites

- [ ] **Step 1: Executar suite completa de testes**

Run: `npm run test`
Expected: All tests pass cleanly.

- [ ] **Step 2: Executar checagem de tipos TypeScript**

Run: `npm run typecheck`
Expected: 0 errors.

- [ ] **Step 3: Commit de finalização (se houver ajustes)**

```bash
git status
git commit -m "chore: validar testes e integridade de tipos do redesign"
```
