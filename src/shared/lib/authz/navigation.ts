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
  /** Seção lógica da barra de navegação. */
  section?: "Principal" | "Operação" | "Relacionamento" | "Sistema";
}

const ALL_ROLES: CouncilRole[] = ["council_manager", "council_operator", "viewer"];

export const NAV_ITEMS: NavItem[] = [
  { label: "Visão geral", href: "/dashboard", icon: LayoutDashboard, allowedRoles: ALL_ROLES, section: "Principal" },
  { label: "Meu conselho", href: "/meu-conselho", icon: Home, allowedRoles: ALL_ROLES, section: "Principal" },
  { label: "Conselhos", href: "/conselhos", icon: Building2, allowedRoles: [], centralOnly: true, section: "Principal" },
  { label: "Solicitações", href: "/solicitacoes", icon: ShoppingCart, allowedRoles: ALL_ROLES, section: "Operação" },
  { label: "Entregas", href: "/entregas", icon: Truck, allowedRoles: ALL_ROLES, section: "Operação" },
  { label: "Estoque", href: "/estoque", icon: Package, allowedRoles: ALL_ROLES, section: "Operação" },
  { label: "Transferências", href: "/transferencias", icon: ArrowLeftRight, allowedRoles: ALL_ROLES, section: "Operação" },
  { label: "Reuniões", href: "/reunioes", icon: CalendarDays, allowedRoles: ALL_ROLES, section: "Relacionamento" },
  { label: "Processos", href: "/processos", icon: FileText, allowedRoles: ALL_ROLES, section: "Relacionamento" },
  { label: "Contratos", href: "/contratos", icon: FileSignature, allowedRoles: ALL_ROLES, section: "Relacionamento" },
  { label: "Atas", href: "/atas", icon: ScrollText, allowedRoles: ALL_ROLES, section: "Relacionamento" },
  { label: "Fornecedores", href: "/fornecedores", icon: Truck, allowedRoles: ALL_ROLES, section: "Relacionamento" },
  { label: "Alertas", href: "/alertas", icon: AlertTriangle, allowedRoles: ALL_ROLES, section: "Sistema" },
  { label: "Relatórios", href: "/relatorios", icon: BarChart3, allowedRoles: ["council_manager", "viewer"], section: "Sistema" },
  { label: "Auditoria", href: "/administracao/auditoria", icon: History, allowedRoles: ["council_manager"], section: "Sistema" },
  { label: "Administração", href: "/administracao", icon: Settings, allowedRoles: [], centralOnly: true, section: "Sistema" },
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
