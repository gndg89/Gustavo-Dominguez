"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { FormMessage } from "@/components/ui/FormMessage";
import { unitLabel } from "@/lib/utils";
import type { ActionState } from "@/lib/action-state";

const UNIT_OPTIONS = [
  { value: "KILOGRAM", label: "Kilogramo (kg)" },
  { value: "GRAM", label: "Gramo (g)" },
  { value: "LITER", label: "Litro (L)" },
  { value: "MILLILITER", label: "Mililitro (ml)" },
  { value: "UNIT", label: "Unidad (u)" },
];

const PAYMENT_METHOD_OPTIONS = [
  { value: "EFECTIVO", label: "Efectivo" },
  { value: "PAGO_MOVIL", label: "Pago móvil" },
  { value: "TRANSFERENCIA", label: "Transferencia" },
  { value: "ZELLE", label: "Zelle" },
  { value: "TARJETA", label: "Tarjeta" },
  { value: "OTRO", label: "Otro" },
];

type Supplier = { id: string; name: string };

export function IngredientForm({
  action,
  defaultValues,
  suppliers = [],
  submitLabel = "Guardar insumo",
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  defaultValues?: {
    name: string;
    unit: string;
    minStockThreshold: number;
  };
  suppliers?: Supplier[];
  submitLabel?: string;
}) {
  const [state, formAction, isPending] = useActionState(action, undefined);
  const [unit, setUnit] = useState(defaultValues?.unit ?? "KILOGRAM");
  const isCreating = !defaultValues;
  const today = new Date().toISOString().slice(0, 10);

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
        <Select id="unit" name="unit" value={unit} onChange={(e) => setUnit(e.target.value)}>
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

      {isCreating && (
        <div className="space-y-4 rounded-lg border border-border bg-background p-4">
          <p className="text-sm font-medium text-foreground">
            Compra inicial (opcional)
          </p>
          <p className="text-xs text-muted">
            Si ya compraste este insumo, registra aquí cuánto y a qué costo para que el
            sistema calcule el costo por {unitLabel(unit)} y arranque el stock.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="initialQuantity">Cantidad comprada ({unitLabel(unit)})</Label>
              <Input
                id="initialQuantity"
                name="initialQuantity"
                type="number"
                step="0.001"
                min="0"
                placeholder="Ej. 10"
              />
            </div>
            <div>
              <Label htmlFor="initialTotalCost">Costo total pagado</Label>
              <Input
                id="initialTotalCost"
                name="initialTotalCost"
                type="number"
                step="0.01"
                min="0"
                placeholder="Ej. 800"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="initialCurrency">Moneda</Label>
              <Select id="initialCurrency" name="initialCurrency" defaultValue="BS">
                <option value="BS">Bolívares (Bs)</option>
                <option value="USD">Divisas ($)</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="initialPaymentMethod">Forma de pago</Label>
              <Select id="initialPaymentMethod" name="initialPaymentMethod" defaultValue="EFECTIVO">
                {PAYMENT_METHOD_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="initialSupplierId">Proveedor (opcional)</Label>
              <Select id="initialSupplierId" name="initialSupplierId" defaultValue="">
                <option value="">Sin proveedor</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="initialPurchaseDate">Fecha de compra</Label>
              <Input
                id="initialPurchaseDate"
                name="initialPurchaseDate"
                type="date"
                defaultValue={today}
              />
            </div>
          </div>
        </div>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Guardando..." : submitLabel}
      </Button>
    </form>
  );
}
