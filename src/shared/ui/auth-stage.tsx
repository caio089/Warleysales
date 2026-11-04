"use client";

import { Fingerprint, ScrollText, ShieldCheck } from "lucide-react";
import { useRef, type ReactNode } from "react";
import { BrandMark } from "./brand-mark";
import { gsap, useGSAP } from "./motion";

const PILLARS = [
  { icon: ScrollText, label: "Atas e decisões", detail: "Histórico do conselho em um só lugar" },
  { icon: ShieldCheck, label: "Permissão por unidade", detail: "Cada perfil vê apenas o que lhe cabe" },
  { icon: Fingerprint, label: "Rastreabilidade", detail: "Contratos, estoque e processos auditáveis" },
] as const;

export function AuthHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description: string;
}) {
  return (
    <header className="mb-7">
      {eyebrow ? (
        <p className="mb-3 text-[0.68rem] font-semibold tracking-[0.22em] text-highlight uppercase">{eyebrow}</p>
      ) : (
        <span className="mb-4 block h-0.5 w-10 rounded-full bg-highlight" aria-hidden />
      )}
      <h2 className="font-heading text-[1.9rem] leading-[1.05] font-medium text-primary">{title}</h2>
      <p className="mt-2.5 max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>
    </header>
  );
}

/** Palco de autenticação: painel institucional à esquerda e formulário à direita. */
export function AuthStage({ children }: { children: ReactNode }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.to("[data-auth-glow]", { opacity: 0.7, duration: 3.2, yoyo: true, repeat: -1, ease: "sine.inOut" });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <main ref={root} className="grid min-h-screen bg-background lg:grid-cols-[minmax(340px,46%)_1fr]">
      <section
        data-auth-brand
        className="relative hidden overflow-hidden bg-primary px-12 py-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.14]"
          aria-hidden
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "linear-gradient(to bottom, black 10%, transparent 78%)",
          }}
        />
        <div data-auth-glow className="pointer-events-none absolute inset-0 opacity-50" aria-hidden>
          <div className="absolute -top-28 -left-20 size-80 rounded-full bg-highlight/25 blur-3xl" />
          <div className="absolute right-[-4rem] bottom-[-3rem] size-[28rem] rounded-full bg-white/6 blur-3xl" />
        </div>

        <div className="relative">
          <BrandMark inverted />
        </div>

        <div className="relative max-w-md">
          <p className="mb-4 text-[0.68rem] font-semibold tracking-[0.24em] text-highlight uppercase">Portal do conselho</p>
          <span data-auth-accent className="mb-6 block h-px w-16 origin-left bg-highlight" />
          <h1 className="font-heading text-[2.65rem] leading-[1.05] font-medium text-balance text-white">
            Governança com a clareza que o conselho exige.
          </h1>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/62">
            Processos, atas, contratos e estoque reunidos com o rigor de um ambiente restrito.
          </p>
          <ul className="mt-10 space-y-4">
            {PILLARS.map(({ icon: Icon, label, detail }) => (
              <li key={label} className="flex items-start gap-3">
                <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/10">
                  <Icon className="size-3.5 text-highlight" aria-hidden />
                </span>
                <span>
                  <span className="block text-sm font-medium text-white">{label}</span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-white/50">{detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-[0.7rem] tracking-[0.16em] text-white/40 uppercase">Acesso restrito a usuários convidados</p>
      </section>

      <section className="relative flex items-center justify-center overflow-hidden p-6 sm:p-10">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute top-0 right-0 size-72 rounded-full bg-highlight/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 size-80 rounded-full bg-primary/8 blur-3xl" />
        </div>
        <div data-auth-form className="relative w-full max-w-[26.5rem]">
          <div className="mb-8 lg:hidden">
            <BrandMark />
          </div>
          <div className="relative overflow-hidden rounded-[1.4rem] border border-border/70 bg-card/90 p-6 shadow-[0_1px_0_oklch(1_0_0_/_0.7)_inset,0_30px_70px_-36px_oklch(0.23_0.05_250_/_0.55)] backdrop-blur-sm sm:p-8">
            <span className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-highlight to-transparent" aria-hidden />
            {children}
          </div>
        </div>
      </section>
    </main>
  );
}
