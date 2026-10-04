"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { FormMessage } from "@/components/ui/FormMessage";
import type { ActionState } from "@/lib/action-state";

const UNIT_OPTIONS = [
  { value: "KILOGRAM", label: "Kilogramo (kg)" },
  { value: "GRAM", label: "Gramo (g)" },
  { value: "LITER", label: "Litro (L)" },
  { value: "MILLILITER", label: "Mililitro (ml)" },
  { value: "UNIT", label: "Unidad (u)" },
];

export function IngredientForm({
  action,
  defaultValues,
  submitLabel = "Guardar insumo",
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  defaultValues?: {
    name: string;
    unit: string;
    minStockThreshold: number;
  };
  submitLabel?: string;
}) {
  const [state, formAction, isPending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <FormMessage error={state?.error} />
      <div>
        <Label htmlFor="name">Nombre del insumo</Label>
        <Input
          id="name"
          name="name"
          required
          placeholder="Ej. Tomate"
          defaultValue={defaultValues?.name}
        />
      </div>
      <div>
        <Label htmlFor="unit">Unidad de medida</Label>
        <Select id="unit" name="unit" defaultValue={defaultValues?.unit ?? "KILOGRAM"}>
          {UNIT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
        <p className="mt-1 text-xs text-muted">
          Todas las compras y recetas de este insumo se expresarán en esta unidad.
        </p>
      </div>
      <div>
        <Label htmlFor="minStockThreshold">Stock mínimo (alerta)</Label>
        <Input
          id="minStockThreshold"
          name="minStockThreshold"
          type="number"
          step="0.01"
          min="0"
          defaultValue={defaultValues?.minStockThreshold ?? 0}
        />
        <p className="mt-1 text-xs text-muted">
          Cuando el stock caiga por debajo de este valor, se mostrará una alerta en el dashboard.
        </p>
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Guardando..." : submitLabel}
      </Button>
    </form>
  );
}
