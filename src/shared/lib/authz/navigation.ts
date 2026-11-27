import {
  AlertTriangle,
  Archive,
  BarChart3,
  Building2,
  Calendar,
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
export const STAFF_ROLES = ["director", "request_collaborator", "purchasing_collaborator"] as const;
export const COUNCIL_ROLES = ["council_manager", "council_operator", "viewer", ...STAFF_ROLES] as const;
export type CouncilRole = (typeof COUNCIL_ROLES)[number];

export const COUNCIL_ROLE_LABELS: Record<CouncilRole, string> = {
  council_manager: "Gestor",
  council_operator: "Operador",
  viewer: "Consulta",
  director: "Diretor",
  request_collaborator: "Colaborador Normal",
  purchasing_collaborator: "Colaborador de Compras",
};

export const isStaffRole = (role: CouncilRole): boolean => STAFF_ROLES.some((staffRole) => staffRole === role);
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
  /** Grupo de navegação lateral. */
  group: "inicio" | "processos" | "estoque" | "agenda" | "outras";
}
/** Metadados visuais de cada grupo do menu lateral. */
export interface NavGroup {
  id: "inicio" | "processos" | "estoque" | "agenda" | "outras";
  label: string;
  icon: LucideIcon;
}
export const NAV_GROUPS: NavGroup[] = [
  { id: "inicio", label: "Início", icon: LayoutDashboard },
  { id: "processos", label: "Processos e solicitações", icon: FileText },
  { id: "estoque", label: "Estoque", icon: Package },
  { id: "agenda", label: "Agenda", icon: CalendarDays },
  { id: "outras", label: "Outras opções", icon: Settings },
];
const ALL_ROLES: CouncilRole[] = ["council_manager", "council_operator", "viewer", "director", "purchasing_collaborator"];
export const NAV_ITEMS: NavItem[] = [
  { label: "Início", href: "/dashboard", icon: LayoutDashboard, allowedRoles: ALL_ROLES, group: "inicio" },
  { label: "Órgãos e empresas", href: "/conselhos", icon: Building2, allowedRoles: [], centralOnly: true, group: "outras" },
  { label: "Solicitações", href: "/solicitacoes", icon: ShoppingCart, allowedRoles: [...ALL_ROLES, "request_collaborator"], group: "processos" },
  { label: "Processos", href: "/processos", icon: FileText, allowedRoles: ALL_ROLES, group: "processos" },
  { label: "Arquivados", href: "/processos/arquivados", icon: Archive, allowedRoles: ALL_ROLES, group: "processos" },
  { label: "Atas", href: "/atas", icon: ScrollText, allowedRoles: ALL_ROLES, group: "processos" },
  { label: "Contratos", href: "/contratos", icon: FileSignature, allowedRoles: ALL_ROLES, group: "processos" },
  { label: "Calendário", href: "/calendario", icon: Calendar, allowedRoles: ALL_ROLES, group: "agenda" },
  { label: "Fornecedores", href: "/fornecedores", icon: Truck, allowedRoles: ALL_ROLES, group: "outras" },
  { label: "Reuniões", href: "/reunioes", icon: CalendarDays, allowedRoles: ALL_ROLES, group: "agenda" },
  { label: "Consultar estoque", href: "/estoque", icon: Package, allowedRoles: ALL_ROLES, group: "estoque" },
  { label: "Entregas", href: "/entregas", icon: Truck, allowedRoles: ALL_ROLES, group: "estoque" },
  { label: "Alertas", href: "/alertas", icon: AlertTriangle, allowedRoles: ALL_ROLES, group: "outras" },
  { label: "Relatórios", href: "/relatorios", icon: BarChart3, allowedRoles: ["council_manager", "viewer", "director", "purchasing_collaborator"], group: "outras" },
  { label: "Auditoria", href: "/administracao/auditoria", icon: History, allowedRoles: ["council_manager", "director", "purchasing_collaborator"], group: "outras" },
  { label: "Administração", href: "/administracao", icon: Settings, allowedRoles: [], centralOnly: true, group: "outras" },
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
