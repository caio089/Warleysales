import {
  AlertTriangle,
  ArrowLeftRight,
  BarChart3,
  Building2,
  CalendarDays,
  FileSignature,
  FileText,
  History,
  Home,
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
  /** Grupo de navegação lateral (novo modelo colapsável). */
  group: "acompanhamento" | "estoque" | "conselho" | "sistema";
}

/** Metadados visuais de cada grupo do menu lateral. */
export interface NavGroup {
  id: "acompanhamento" | "estoque" | "conselho" | "sistema";
  label: string;
  icon: LucideIcon;
}

export const NAV_GROUPS: NavGroup[] = [
  { id: "acompanhamento", label: "Acompanhamento", icon: LayoutDashboard },
  { id: "estoque",        label: "Estoque",         icon: Package },
  { id: "conselho",       label: "Assessoria",       icon: Building2 },
  { id: "sistema",        label: "Sistema",          icon: Settings },
];

const ALL_ROLES: CouncilRole[] = ["council_manager", "council_operator", "viewer"];

export const NAV_ITEMS: NavItem[] = [
  // ── Acompanhamento Geral ──────────────────────────────────────────────
  { label: "Visão geral",   href: "/dashboard",    icon: LayoutDashboard, allowedRoles: ALL_ROLES, group: "acompanhamento" },
  { label: "Meu painel",    href: "/meu-conselho", icon: Home,            allowedRoles: ALL_ROLES, group: "acompanhamento" },
  { label: "Órgãos",        href: "/conselhos",    icon: Building2,       allowedRoles: [], centralOnly: true, group: "acompanhamento" },
  { label: "Solicitações",  href: "/solicitacoes", icon: ShoppingCart,    allowedRoles: ALL_ROLES, group: "acompanhamento" },
  { label: "Reuniões",      href: "/reunioes",     icon: CalendarDays,    allowedRoles: ALL_ROLES, group: "acompanhamento" },

  // ── Estoque ───────────────────────────────────────────────────────────
  { label: "Estoque",        href: "/estoque",        icon: Package,       allowedRoles: ALL_ROLES, group: "estoque" },
  { label: "Entregas",       href: "/entregas",       icon: Truck,         allowedRoles: ALL_ROLES, group: "estoque" },
  { label: "Transferências", href: "/transferencias", icon: ArrowLeftRight, allowedRoles: ALL_ROLES, group: "estoque" },

  // ── Assessoria / Conselho ─────────────────────────────────────────────
  { label: "Processos",    href: "/processos",  icon: FileText,      allowedRoles: ALL_ROLES, group: "conselho" },
  { label: "Contratos",    href: "/contratos",  icon: FileSignature, allowedRoles: ALL_ROLES, group: "conselho" },
  { label: "Atas",         href: "/atas",       icon: ScrollText,    allowedRoles: ALL_ROLES, group: "conselho" },
  { label: "Fornecedores", href: "/fornecedores", icon: Truck,       allowedRoles: ALL_ROLES, group: "conselho" },

  // ── Sistema ───────────────────────────────────────────────────────────
  { label: "Alertas",        href: "/alertas",                icon: AlertTriangle, allowedRoles: ALL_ROLES, group: "sistema" },
  { label: "Relatórios",     href: "/relatorios",             icon: BarChart3,     allowedRoles: ["council_manager", "viewer"], group: "sistema" },
  { label: "Auditoria",      href: "/administracao/auditoria", icon: History,      allowedRoles: ["council_manager"], group: "sistema" },
  { label: "Administração",  href: "/administracao",          icon: Settings,      allowedRoles: [], centralOnly: true, group: "sistema" },
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
