export type UnitFamily = "MASS" | "VOLUME" | "COUNT";

export const UNIT_FAMILY: Record<string, UnitFamily> = {
  GRAM: "MASS",
  KILOGRAM: "MASS",
  MILLILITER: "VOLUME",
  LITER: "VOLUME",
  UNIT: "COUNT",
};

const GRAMS_PER_UNIT: Record<string, number> = {
  GRAM: 1,
  KILOGRAM: 1000,
};

const MILLILITERS_PER_UNIT: Record<string, number> = {
  MILLILITER: 1,
  LITER: 1000,
};

export function compatibleUnits(baseUnit: string): string[] {
  const family = UNIT_FAMILY[baseUnit];
  if (family === "MASS") return ["GRAM", "KILOGRAM"];
  if (family === "VOLUME") return ["MILLILITER", "LITER"];
  return ["UNIT"];
}

export function convertQuantity(quantity: number, from: string, to: string): number {
  if (from === to) return quantity;

  const family = UNIT_FAMILY[from];
  if (family !== UNIT_FAMILY[to]) {
    throw new Error(`No se puede convertir de ${from} a ${to}`);
  }

  if (family === "MASS") {
    return (quantity * GRAMS_PER_UNIT[from]) / GRAMS_PER_UNIT[to];
  }
  if (family === "VOLUME") {
    return (quantity * MILLILITERS_PER_UNIT[from]) / MILLILITERS_PER_UNIT[to];
  }
  return quantity;
}
