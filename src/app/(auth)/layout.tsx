import type { ReactNode } from "react";
import { AuthStage } from "@/shared/ui/auth-stage";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <AuthStage>{children}</AuthStage>;
}
