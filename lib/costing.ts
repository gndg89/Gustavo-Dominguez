import { convertQuantity } from "./units";

export type CostableItem = {
  quantity: number;
  costPerUnit: number;
};

export type RecipeLineForCost = {
  quantity: number;
  unit: string;
  ingredient: { unit: string; currentCostPerUnit: number };
};

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateDishCost(items: CostableItem[]): number {
  const total = items.reduce(
    (sum, item) => sum + item.quantity * item.costPerUnit,
    0,
  );
  return round2(total);
}

export function calculateRecipeCost(items: RecipeLineForCost[]): number {
  return calculateDishCost(
    items.map((item) => ({
      quantity: convertQuantity(item.quantity, item.unit, item.ingredient.unit),
      costPerUnit: item.ingredient.currentCostPerUnit,
    })),
  );
}

export function calculateMargin(
  salePrice: number | null | undefined,
  cost: number,
): number | null {
  if (salePrice == null) return null;
  return round2(salePrice - cost);
}

export function calculateMarginPercent(
  salePrice: number | null | undefined,
  cost: number,
): number | null {
  if (salePrice == null || salePrice === 0) return null;
  return round2(((salePrice - cost) / salePrice) * 100);
}

export function pricePerUnitFromPurchase(
  totalCost: number,
  quantity: number,
): number {
  if (quantity <= 0) return 0;
  return round2(totalCost / quantity);
}
