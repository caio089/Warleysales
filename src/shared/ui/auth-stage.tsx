"use client";

import { useRef, type ReactNode } from "react";
import { BrandMark } from "./brand-mark";
import { gsap, useGSAP } from "./motion";

export function AuthHeading({ title, description }: { title: string; description: string }) {
  return (
    <>
      <span className="mb-4 block h-0.5 w-10 rounded-full bg-highlight" aria-hidden />
      <h2 className="font-heading text-2xl font-medium tracking-tight text-primary">{title}</h2>
      <p className="mt-1.5 mb-6 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </>
  );
}

/** Palco de autenticação: painel institucional à esquerda e formulário à direita. */
export function AuthStage({ children }: { children: ReactNode }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.to("[data-auth-glow]", { opacity: 0.55, duration: 2.4, yoyo: true, repeat: -1, ease: "sine.inOut" });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <main ref={root} className="grid min-h-screen bg-background lg:grid-cols-[minmax(280px,42%)_1fr]">
      <section
        data-auth-brand
        className="relative hidden overflow-hidden bg-primary px-10 py-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between"
      >
        <div data-auth-glow className="pointer-events-none absolute inset-0 opacity-40" aria-hidden>
          <div className="absolute -top-24 -left-16 size-72 rounded-full bg-highlight/30 blur-3xl" />
          <div className="absolute right-0 bottom-0 size-96 rounded-full bg-white/5 blur-3xl" />
        </div>
        <BrandMark inverted />
        <div className="relative max-w-sm">
          <span data-auth-accent className="mb-5 block h-1 w-16 origin-left rounded-full bg-highlight" />
          <h1 className="font-heading text-4xl leading-tight font-medium text-white">
            Uma visão clara de todos os conselhos.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-white/65">
            Processos, atas, contratos e estoque em um único lugar, com rastreabilidade e permissões por unidade.
          </p>
        </div>
        <p className="relative text-xs tracking-wide text-white/40">Acesso restrito a usuários convidados</p>
      </section>

      <section className="flex items-center justify-center p-6 sm:p-10">
        <div data-auth-form className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <BrandMark />
          </div>
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-[0_24px_60px_-28px_oklch(0.23_0.05_250_/_0.35)] sm:p-8">
            {children}
          </div>
        </div>
      </section>
    </main>
  );
}
