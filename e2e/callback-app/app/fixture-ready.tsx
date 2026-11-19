"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";

export function FixtureReady({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => { container.current?.setAttribute("data-fixture-ready", "true"); }, [pathname]);
  return <div key={pathname} ref={container} data-fixture-ready="false">{children}</div>;
}
