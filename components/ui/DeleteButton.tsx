"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { FormMessage } from "@/components/ui/FormMessage";
import type { ActionState } from "@/lib/action-state";

export function DeleteButton({
  action,
  confirmMessage,
  label = "Borrar",
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  confirmMessage: string;
  label?: string;
}) {
  const [state, formAction, isPending] = useActionState(action, undefined);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!window.confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
    >
      <Button type="submit" variant="danger" disabled={isPending}>
        {isPending ? "Borrando..." : label}
      </Button>
      <FormMessage error={state?.error} className="mt-2" />
    </form>
  );
}
