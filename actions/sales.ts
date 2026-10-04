"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { saleSchema } from "@/lib/validations";
import { calculateDishCost } from "@/lib/costing";
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

  const { dishId, quantity, saleDate } = parsed.data;

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

  const unitCost = calculateDishCost(
    dish.recipeItems.map((item) => ({
      quantity: item.quantity,
      costPerUnit: item.ingredient.currentCostPerUnit,
    })),
  );
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
        saleDate,
      },
    }),
    ...dish.recipeItems.map((item) =>
      prisma.ingredient.update({
        where: { id: item.ingredientId },
        data: {
          stockQuantity: { decrement: item.quantity * quantity },
        },
      }),
    ),
  ]);

  revalidatePath("/ventas");
  revalidatePath("/insumos");
  revalidatePath("/dashboard");
  redirect("/ventas");
}
