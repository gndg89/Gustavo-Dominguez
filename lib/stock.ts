import { prisma } from "@/lib/prisma";

/**
 * El costo de referencia de un insumo es el precio de su compra más reciente
 * (por fecha de compra). Se vuelve a calcular así cada vez que una compra se
 * crea, edita o borra, en vez de asumir que la última compra creada es
 * siempre la más reciente (puede haberse registrado con fecha atrasada).
 */
export async function refreshIngredientCost(ingredientId: string): Promise<void> {
  const latest = await prisma.purchase.findFirst({
    where: { ingredientId },
    orderBy: [{ purchaseDate: "desc" }, { createdAt: "desc" }],
  });

  await prisma.ingredient.update({
    where: { id: ingredientId },
    data: { currentCostPerUnit: latest?.pricePerUnit ?? 0 },
  });
}
