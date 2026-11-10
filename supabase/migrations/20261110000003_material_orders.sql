-- Migration 0003 Onda 2: Pedidos de materiais contra estoque liberado
-- R11/R12: reserva de saldo e despacho com auditoria e RBAC institucional.

-- Tabela principal de pedidos de materiais
create table if not exists public.material_orders (
  id uuid primary key default gen_random_uuid(),
  number text not null,
  council_id uuid not null references public.councils (id),
  status text not null default 'pendente'
    check (status in ('pendente', 'aprovado', 'rejeitado', 'cancelado')),
  requested_by uuid not null references public.profiles (id),
  notes text,
  reviewed_by uuid references public.profiles (id),
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (council_id, number),
  check (status <> 'rejeitado' or (rejection_reason is not null and length(trim(rejection_reason)) > 0)),
  check (status <> 'aprovado' or reviewed_by is not null)
);

-- Índices de consulta e ordenação para pedidos
create index if not exists idx_material_orders_council on public.material_orders (council_id);
create index if not exists idx_material_orders_status on public.material_orders (status);
create index if not exists idx_material_orders_created_at on public.material_orders (created_at desc);
create index if not exists idx_material_orders_requested_by on public.material_orders (requested_by);

-- Tabela de itens do pedido de materiais
create table if not exists public.material_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.material_orders (id) on delete cascade,
  material_id uuid not null references public.materials (id),
  quantity numeric(15,3) not null check (quantity > 0)
);

-- Índices para itens de pedido
create index if not exists idx_material_order_items_order on public.material_order_items (order_id);
create index if not exists idx_material_order_items_material on public.material_order_items (material_id);

-- Row Level Security (RLS)
alter table public.material_orders enable row level security;
alter table public.material_order_items enable row level security;

-- Política de leitura isolada por conselho (ou acesso global para Warley via private.has_council_access)
create policy material_orders_select on public.material_orders
  for select to authenticated
  using (private.has_council_access(council_id));

create policy material_order_items_select on public.material_order_items
  for select to authenticated
  using (
    exists (
      select 1 from public.material_orders o
      where o.id = material_order_items.order_id
        and private.has_council_access(o.council_id)
    )
  );

-- Escrita restrita a service_role (operações passam exclusivamente pelos serviços de domínio)
revoke insert, update, delete on public.material_orders, public.material_order_items from anon, authenticated;
