"use client";

import { useState, type ReactNode } from "react";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NewMeetingForm } from "@/app/(app)/reunioes/meeting-forms";

export interface MeetingDialogProps {
  councilId: string;
  councilLabel: string;
  trigger?: ReactNode;
}

export function MeetingDialog({ councilId, councilLabel, trigger }: MeetingDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<span className="inline-flex" />}>
        {trigger ?? (
          <Button variant="outline" size="sm" className="gap-2 font-medium">
            <CalendarDays className="size-4" aria-hidden />
            Agendar Reunião
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto p-6">
        <SheetHeader className="mb-4">
          <SheetTitle className="flex items-center gap-2 text-base font-semibold">
            <CalendarDays className="size-5 text-primary" aria-hidden />
            Solicitar Reunião ou Alinhamento
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            A reunião fica registrada diretamente na agenda operacional da empresa ({councilLabel}) com o Warley.
          </SheetDescription>
        </SheetHeader>
        <div className="pt-2">
          <NewMeetingForm
            councils={[{ value: councilId, label: councilLabel }]}
            defaultCouncilId={councilId}
            lockCouncil
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
