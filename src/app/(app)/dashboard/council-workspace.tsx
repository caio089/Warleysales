"use client";

import type { MaterialOrder } from "@/modules/orders/schemas";
import type { StockLevelView } from "@/modules/inventory/service";
import { SectionLabel } from "@/shared/ui/page-header";
import { ActionHub, buildCouncilActions } from "@/app/(app)/meu-conselho/action-hub";
import { MeetingDialog } from "@/app/(app)/meu-conselho/meeting-dialog";
import { MaterialOrdersSection } from "@/app/(app)/meu-conselho/material-orders-section";
import { type AvailableStockItem } from "@/app/(app)/meu-conselho/material-order-dialog";
import { StockSection } from "@/app/(app)/meu-conselho/stock-section";

export interface CouncilWorkspaceProps {
  councilId: string;
  councilLabel: string;
  stockLevels: StockLevelView[];
  orders: MaterialOrder[];
  availableStock: AvailableStockItem[];
  materialLabelMap: Record<string, string>;
  materialNameMap: Record<string, string>;
  canCreateRequest: boolean;
  canCreateProcess: boolean;
  canManageMeeting: boolean;
  canCreateOrder: boolean;
}

/** Ações do antigo Meu painel, agora dentro da visão geral do órgão escolhido. */
export function CouncilWorkspace({
  councilId,
  councilLabel,
  stockLevels,
  orders,
  availableStock,
  materialLabelMap,
  materialNameMap,
  canCreateRequest,
  canCreateProcess,
  canManageMeeting,
  canCreateOrder,
}: CouncilWorkspaceProps) {
  const actions = buildCouncilActions({
    councilId,
    canCreateRequest,
    canCreateProcess,
    canManageMeeting,
    renderMeetingTrigger: (className, body) => (
      <MeetingDialog
        councilId={councilId}
        councilLabel={councilLabel}
        triggerClassName="w-full"
        trigger={
          <button type="button" className={className}>
            {body}
          </button>
        }
      />
    ),
  });

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <SectionLabel>O que você pode fazer · {councilLabel}</SectionLabel>
        <ActionHub items={actions} />
      </div>
      <StockSection
        councilId={councilId}
        stockLevels={stockLevels}
        materialLabelMap={materialLabelMap}
        materialNameMap={materialNameMap}
      />
      <MaterialOrdersSection
        councilId={councilId}
        orders={orders}
        availableStock={availableStock}
        materialLabelMap={materialLabelMap}
        canCreateOrder={canCreateOrder}
      />
    </div>
  );
}
