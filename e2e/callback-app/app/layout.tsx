import type { ReactNode } from "react";
import { Suspense } from "react";
import "./fixture.css";
import { FixtureReady } from "./fixture-ready";

export default function FixtureLayout({ children }: { children: ReactNode }) {
  return <html lang="pt-BR"><body><FixtureReady><Suspense fallback={<div data-fixture-ready="false" />}>{children}</Suspense></FixtureReady></body></html>;
}
