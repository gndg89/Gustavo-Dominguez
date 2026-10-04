"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { saleSchema } from "@/lib/validations";
import { calculateRecipeCost } from "@/lib/costing";
import { convertQuantity } from "@/lib/units";
import type { ActionState } from "@/lib/action-state";
import { requireSession } from "@/lib/require-session";

export async function createSale(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSession();

  const parsed = saleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { dishId, quantity, currency, paymentMethod, saleDate } = parsed.data;

  const dish = await prisma.dish.findUnique({
    where: { id: dishId },
    include: { recipeItems: { include: { ingredient: true } } },
  });

  if (!dish) {
    return { error: "El plato seleccionado no existe" };
  }
  if (dish.salePrice == null) {
    return { error: "Este plato no tiene precio de venta definido todavía" };
  }

  const unitCost = calculateRecipeCost(dish.recipeItems);
  const unitPrice = dish.salePrice;
  const totalAmount = Math.round(unitPrice * quantity * 100) / 100;

  await prisma.$transaction([
    prisma.sale.create({
      data: {
        dishId,
        userId: session.user.id,
        quantity,
        unitPrice,
        unitCost,
        totalAmount,
        currency,
        paymentMethod,
        saleDate,
      },
    }),
    ...dish.recipeItems.map((item) => {
      const usedQuantity =
        convertQuantity(item.quantity, item.unit, item.ingredient.unit) * quantity;
      return prisma.ingredient.update({
        where: { id: item.ingredientId },
        data: {
          stockQuantity: { decrement: usedQuantity },
        },
      });
    }),
  ]);

  revalidatePath("/ventas");
  revalidatePath("/insumos");
  revalidatePath("/contabilidad");
  revalidatePath("/dashboard");
  redirect("/ventas");
}
