import {
  AlertTriangle,
  ArrowLeftRight,
  BarChart3,
  Building2,
  CalendarDays,
  FileSignature,
  FileText,
  History,
  LayoutDashboard,
  Package,
  ScrollText,
  Settings,
  ShoppingCart,
  Truck,
  type LucideIcon,
} from "lucide-react";

export type CouncilRole = "council_manager" | "council_operator" | "viewer";

/** Contexto de acesso do usuário autenticado (derivado no servidor). */
export interface AccessContext {
  isCentralAdmin: boolean;
  roles: CouncilRole[];
}

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Papéis de conselho que enxergam o item. Admin central sempre enxerga. */
  allowedRoles: CouncilRole[];
  /** Quando true, somente administração central. */
  centralOnly?: boolean;
}

const ALL_ROLES: CouncilRole[] = ["council_manager", "council_operator", "viewer"];

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, allowedRoles: ALL_ROLES },
  { label: "Conselhos", href: "/conselhos", icon: Building2, allowedRoles: [], centralOnly: true },
  { label: "Processos", href: "/processos", icon: FileText, allowedRoles: ALL_ROLES },
  { label: "Solicitações", href: "/solicitacoes", icon: ShoppingCart, allowedRoles: ALL_ROLES },
  { label: "Estoque", href: "/estoque", icon: Package, allowedRoles: ALL_ROLES },
  { label: "Transferências", href: "/transferencias", icon: ArrowLeftRight, allowedRoles: ALL_ROLES },
  { label: "Atas de registro de preços", href: "/atas", icon: ScrollText, allowedRoles: ALL_ROLES },
  { label: "Contratos", href: "/contratos", icon: FileSignature, allowedRoles: ALL_ROLES },
  { label: "Fornecedores", href: "/fornecedores", icon: Truck, allowedRoles: ALL_ROLES },
  { label: "Reuniões", href: "/reunioes", icon: CalendarDays, allowedRoles: ALL_ROLES },
  { label: "Relatórios", href: "/relatorios", icon: BarChart3, allowedRoles: ["council_manager", "viewer"] },
  { label: "Alertas", href: "/alertas", icon: AlertTriangle, allowedRoles: ALL_ROLES },
  { label: "Auditoria", href: "/administracao/auditoria", icon: History, allowedRoles: ["council_manager"] },
  { label: "Administração", href: "/administracao", icon: Settings, allowedRoles: [], centralOnly: true },
];

/**
 * Filtra a navegação conforme o acesso. Isto é apenas conveniência de UI:
 * a autorização real é reaplicada no servidor e no banco (RLS).
 */
export function filterNavigation(access: AccessContext, items: NavItem[] = NAV_ITEMS): NavItem[] {
  if (access.isCentralAdmin) return items;
  return items.filter(
    (item) => !item.centralOnly && item.allowedRoles.some((role) => access.roles.includes(role)),
  );
}
