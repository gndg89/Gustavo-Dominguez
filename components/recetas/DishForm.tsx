"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { FormMessage } from "@/components/ui/FormMessage";
import { formatCurrency } from "@/lib/utils";
import { calculateMargin } from "@/lib/costing";
import { RecipeItemsEditor, type IngredientOption } from "@/components/recetas/RecipeItemsEditor";
import type { ActionState } from "@/lib/action-state";

export function DishForm({
  action,
  ingredients,
  defaultValues,
  submitLabel = "Guardar receta",
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  ingredients: IngredientOption[];
  defaultValues?: {
    name: string;
    description: string | null;
    salePrice: number | null;
    isActive: boolean;
    items: { ingredientId: string; quantity: number }[];
  };
  submitLabel?: string;
}) {
  const [state, formAction, isPending] = useActionState(action, undefined);
  const [cost, setCost] = useState(0);
  const [salePrice, setSalePrice] = useState(
    defaultValues?.salePrice != null ? String(defaultValues.salePrice) : "",
  );

  const margin = calculateMargin(salePrice ? parseFloat(salePrice) : null, cost);

  return (
    <form action={formAction} className="space-y-5">
      <FormMessage error={state?.error} />

      <div>
        <Label htmlFor="name">Nombre del plato</Label>
        <Input
          id="name"
          name="name"
          required
          placeholder="Ej. Ensalada César"
          defaultValue={defaultValues?.name}
        />
      </div>

      <div>
        <Label htmlFor="description">Descripción (opcional)</Label>
        <Input
          id="description"
          name="description"
          defaultValue={defaultValues?.description ?? ""}
        />
      </div>

      <div>
        <Label>Insumos de la receta</Label>
        {ingredients.length === 0 ? (
          <p className="text-sm text-muted">
            Primero necesitas crear insumos para poder armar una receta.
          </p>
        ) : (
          <RecipeItemsEditor
            ingredients={ingredients}
            defaultItems={defaultValues?.items}
            onCostChange={setCost}
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="salePrice">Precio de venta (opcional)</Label>
          <Input
            id="salePrice"
            name="salePrice"
            type="number"
            step="0.01"
            min="0"
            value={salePrice}
            onChange={(e) => setSalePrice(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 pt-6">
          <input
            id="isActive"
            name="isActive"
            type="checkbox"
            defaultChecked={defaultValues?.isActive ?? true}
            className="h-4 w-4 rounded border-border"
          />
          <Label htmlFor="isActive" className="mb-0">
            Receta activa
          </Label>
        </div>
      </div>

      {margin != null && (
        <p className="text-sm text-muted">
          Margen estimado:{" "}
          <span className={margin >= 0 ? "text-accent" : "text-danger"}>
            {formatCurrency(margin)}
          </span>
        </p>
      )}

      <Button type="submit" disabled={isPending || ingredients.length === 0}>
        {isPending ? "Guardando..." : submitLabel}
      </Button>
    </form>
  );
}
