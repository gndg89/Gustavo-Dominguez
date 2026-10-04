"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { FormMessage } from "@/components/ui/FormMessage";
import type { ActionState } from "@/lib/action-state";

export function SupplierForm({
  action,
  defaultValues,
  submitLabel = "Guardar proveedor",
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  defaultValues?: {
    name: string;
    phone: string | null;
    email: string | null;
    notes: string | null;
  };
  submitLabel?: string;
}) {
  const [state, formAction, isPending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <FormMessage error={state?.error} />
      <div>
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" name="name" required defaultValue={defaultValues?.name} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Teléfono (opcional)</Label>
          <Input id="phone" name="phone" defaultValue={defaultValues?.phone ?? ""} />
        </div>
        <div>
          <Label htmlFor="email">Email (opcional)</Label>
          <Input id="email" name="email" type="email" defaultValue={defaultValues?.email ?? ""} />
        </div>
      </div>
      <div>
        <Label htmlFor="notes">Notas (opcional)</Label>
        <Input id="notes" name="notes" defaultValue={defaultValues?.notes ?? ""} />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Guardando..." : submitLabel}
      </Button>
    </form>
  );
}
