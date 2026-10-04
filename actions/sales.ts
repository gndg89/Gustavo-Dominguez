"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { saleSchema } from "@/lib/validations";
import { calculateRecipeCost } from "@/lib/costing";
import { convertQuantity } from "@/lib/units";
import type { ActionState } from "@/lib/action-state";
import { requireSession } from "@/lib/require-session";

function revalidateSalePaths() {
  revalidatePath("/ventas");
  revalidatePath("/insumos");
  revalidatePath("/contabilidad");
  revalidatePath("/dashboard");
}

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

  const consumptions = dish.recipeItems.map((item) => ({
    ingredientId: item.ingredientId,
    quantity: convertQuantity(item.quantity, item.unit, item.ingredient.unit) * quantity,
  }));

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
        consumptions: { create: consumptions },
      },
    }),
    ...consumptions.map((c) =>
      prisma.ingredient.update({
        where: { id: c.ingredientId },
        data: { stockQuantity: { decrement: c.quantity } },
      }),
    ),
  ]);

  revalidateSalePaths();
  redirect("/ventas");
}

export async function updateSale(
  saleId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireSession();

  const sale = await prisma.sale.findUnique({
    where: { id: saleId },
    include: {
      consumptions: true,
      dish: { include: { recipeItems: { include: { ingredient: true } } } },
    },
  });
  if (!sale) {
    return { error: "La venta no existe" };
  }

  const raw = Object.fromEntries(formData);
  const parsed = saleSchema
    .omit({ dishId: true })
    .safeParse({ ...raw, dishId: sale.dishId });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { quantity, currency, paymentMethod, saleDate } = parsed.data;

  const unitCost = calculateRecipeCost(sale.dish.recipeItems);
  const unitPrice = sale.unitPrice;
  const totalAmount = Math.round(unitPrice * quantity * 100) / 100;

  const newConsumptions = sale.dish.recipeItems.map((item) => ({
    ingredientId: item.ingredientId,
    quantity: convertQuantity(item.quantity, item.unit, item.ingredient.unit) * quantity,
  }));

  await prisma.$transaction([
    // Revertir el consumo anterior de stock.
    ...sale.consumptions.map((c) =>
      prisma.ingredient.update({
        where: { id: c.ingredientId },
        data: { stockQuantity: { increment: c.quantity } },
      }),
    ),
    prisma.saleConsumption.deleteMany({ where: { saleId } }),
    prisma.sale.update({
      where: { id: saleId },
      data: {
        quantity,
        unitCost,
        totalAmount,
        currency,
        paymentMethod,
        saleDate,
        consumptions: { create: newConsumptions },
      },
    }),
    // Aplicar el nuevo consumo.
    ...newConsumptions.map((c) =>
      prisma.ingredient.update({
        where: { id: c.ingredientId },
        data: { stockQuantity: { decrement: c.quantity } },
      }),
    ),
  ]);

  revalidateSalePaths();
  redirect("/ventas");
}

export async function deleteSale(
  saleId: string,
  _prevState: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  await requireSession();

  const sale = await prisma.sale.findUnique({
    where: { id: saleId },
    include: { consumptions: true },
  });
  if (!sale) {
    return { error: "La venta no existe" };
  }

  await prisma.$transaction([
    ...sale.consumptions.map((c) =>
      prisma.ingredient.update({
        where: { id: c.ingredientId },
        data: { stockQuantity: { increment: c.quantity } },
      }),
    ),
    prisma.sale.delete({ where: { id: saleId } }),
  ]);

  revalidateSalePaths();
  redirect("/ventas");
}
