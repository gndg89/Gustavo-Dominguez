"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { calculateDishCost } from "@/lib/costing";
import { compatibleUnits, convertQuantity } from "@/lib/units";
import { formatCurrency, unitLabel } from "@/lib/utils";

export type IngredientOption = {
  id: string;
  name: string;
  unit: string;
  currentCostPerUnit: number;
};

type Row = { key: string; ingredientId: string; quantity: string; unit: string };

export function RecipeItemsEditor({
  ingredients,
  defaultItems = [],
  onCostChange,
}: {
  ingredients: IngredientOption[];
  defaultItems?: { ingredientId: string; quantity: number; unit?: string }[];
  onCostChange?: (cost: number) => void;
}) {
  const reactId = useId();
  const ingredientMap = useMemo(
    () => new Map(ingredients.map((i) => [i.id, i])),
    [ingredients],
  );

  const [rows, setRows] = useState<Row[]>(() =>
    defaultItems.length > 0
      ? defaultItems.map((item, i) => ({
          key: `${reactId}-${i}`,
          ingredientId: item.ingredientId,
          quantity: String(item.quantity),
          unit: item.unit ?? ingredientMap.get(item.ingredientId)?.unit ?? "UNIT",
        }))
      : [
          {
            key: `${reactId}-0`,
            ingredientId: ingredients[0]?.id ?? "",
            quantity: "",
            unit: ingredients[0]?.unit ?? "UNIT",
          },
        ],
  );

  const validItems = rows
    .filter((row) => row.ingredientId && parseFloat(row.quantity) > 0)
    .map((row) => ({
      ingredientId: row.ingredientId,
      quantity: parseFloat(row.quantity),
      unit: row.unit,
    }));

  const totalCost = calculateDishCost(
    validItems.map((item) => {
      const ingredient = ingredientMap.get(item.ingredientId);
      if (!ingredient) return { quantity: 0, costPerUnit: 0 };
      const convertedQuantity = convertQuantity(item.quantity, item.unit, ingredient.unit);
      return { quantity: convertedQuantity, costPerUnit: ingredient.currentCostPerUnit };
    }),
  );

  useEffect(() => {
    onCostChange?.(totalCost);
  }, [totalCost, onCostChange]);

  function updateRow(key: string, patch: Partial<Row>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function handleIngredientChange(key: string, ingredientId: string) {
    const ingredient = ingredientMap.get(ingredientId);
    updateRow(key, { ingredientId, unit: ingredient?.unit ?? "UNIT" });
  }

  function addRow() {
    const firstIngredient = ingredients[0];
    setRows((prev) => [
      ...prev,
      {
        key: `${reactId}-${prev.length}-${Date.now()}`,
        ingredientId: firstIngredient?.id ?? "",
        quantity: "",
        unit: firstIngredient?.unit ?? "UNIT",
      },
    ]);
  }

  function removeRow(key: string) {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.key !== key) : prev));
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name="itemsJson" value={JSON.stringify(validItems)} />

      {rows.map((row) => {
        const ingredient = ingredientMap.get(row.ingredientId);
        const unitOptions = ingredient ? compatibleUnits(ingredient.unit) : ["UNIT"];
        const lineCost =
          ingredient && row.quantity
            ? convertQuantity(parseFloat(row.quantity) || 0, row.unit, ingredient.unit) *
              ingredient.currentCostPerUnit
            : 0;
        return (
          <div key={row.key} className="flex items-end gap-2">
            <div className="flex-1">
              <Select
                value={row.ingredientId}
                onChange={(e) => handleIngredientChange(row.key, e.target.value)}
              >
                {ingredients.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="w-24">
              <Input
                type="number"
                step="0.001"
                min="0"
                placeholder="cant."
                value={row.quantity}
                onChange={(e) => updateRow(row.key, { quantity: e.target.value })}
              />
            </div>
            <div className="w-24">
              <Select
                value={row.unit}
                onChange={(e) => updateRow(row.key, { unit: e.target.value })}
                disabled={unitOptions.length <= 1}
              >
                {unitOptions.map((u) => (
                  <option key={u} value={u}>
                    {unitLabel(u)}
                  </option>
                ))}
              </Select>
            </div>
            <div className="w-24 text-right text-sm text-muted">
              {formatCurrency(lineCost)}
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={() => removeRow(row.key)}
              aria-label="Quitar insumo"
            >
              ✕
            </Button>
          </div>
        );
      })}

      <Button type="button" variant="secondary" onClick={addRow}>
        + Agregar insumo
      </Button>

      <div className="flex items-center justify-between rounded-lg bg-background px-4 py-3">
        <span className="text-sm font-medium text-foreground">Costo total del plato</span>
        <span className="text-lg font-bold text-foreground">{formatCurrency(totalCost)}</span>
      </div>
    </div>
  );
}
