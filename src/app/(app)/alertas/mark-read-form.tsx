"use client";

import { markNotificationReadFormAction } from "@/modules/notifications/actions";
import { ActionForm } from "@/shared/ui/forms/action-form";

export function MarkReadForm({ notificationId }: { notificationId: string }) {
  return (
    <ActionForm action={markNotificationReadFormAction} submitLabel="Marcar como lido" submitVariant="outline" hiddenFields={{ notificationId }}>
      {() => null}
    </ActionForm>
  );
}
