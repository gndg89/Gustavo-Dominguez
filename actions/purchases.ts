"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { purchaseSchema } from "@/lib/validations";
import { pricePerUnitFromPurchase } from "@/lib/costing";
import { refreshIngredientCost } from "@/lib/stock";
import type { ActionState } from "@/lib/action-state";
import { requireSession } from "@/lib/require-session";

function revalidatePurchasePaths(ingredientId: string) {
  revalidatePath("/insumos");
  revalidatePath(`/insumos/${ingredientId}`);
  revalidatePath("/contabilidad");
  revalidatePath("/dashboard");
}

export async function createPurchase(
  ingredientId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireSession();

  const parsed = purchaseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { supplierId, quantity, totalCost, currency, paymentMethod, purchaseDate, notes } =
    parsed.data;

  const ingredient = await prisma.ingredient.findUnique({ where: { id: ingredientId } });
  if (!ingredient) {
    return { error: "El insumo seleccionado no existe" };
  }

  const pricePerUnit = pricePerUnitFromPurchase(totalCost, quantity);

  await prisma.$transaction([
    prisma.purchase.create({
      data: {
        ingredientId,
        supplierId: supplierId || null,
        quantity,
        totalCost,
        pricePerUnit,
        currency,
        paymentMethod,
        purchaseDate,
        notes: notes || null,
      },
    }),
    prisma.ingredient.update({
      where: { id: ingredientId },
      data: { stockQuantity: { increment: quantity } },
    }),
  ]);
  await refreshIngredientCost(ingredientId);

  revalidatePurchasePaths(ingredientId);
  redirect(`/insumos/${ingredientId}`);
}

export async function updatePurchase(
  purchaseId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireSession();

  const purchase = await prisma.purchase.findUnique({ where: { id: purchaseId } });
  if (!purchase) {
    return { error: "La compra no existe" };
  }

  const parsed = purchaseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { supplierId, quantity, totalCost, currency, paymentMethod, purchaseDate, notes } =
    parsed.data;
  const pricePerUnit = pricePerUnitFromPurchase(totalCost, quantity);
  const quantityDelta = quantity - purchase.quantity;

  await prisma.$transaction([
    prisma.purchase.update({
      where: { id: purchaseId },
      data: {
        supplierId: supplierId || null,
        quantity,
        totalCost,
        pricePerUnit,
        currency,
        paymentMethod,
        purchaseDate,
        notes: notes || null,
      },
    }),
    prisma.ingredient.update({
      where: { id: purchase.ingredientId },
      data: { stockQuantity: { increment: quantityDelta } },
    }),
  ]);
  await refreshIngredientCost(purchase.ingredientId);

  revalidatePurchasePaths(purchase.ingredientId);
  redirect(`/insumos/${purchase.ingredientId}`);
}

export async function deletePurchase(
  purchaseId: string,
  _prevState: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  await requireSession();

  const purchase = await prisma.purchase.findUnique({ where: { id: purchaseId } });
  if (!purchase) {
    return { error: "La compra no existe" };
  }

  await prisma.$transaction([
    prisma.purchase.delete({ where: { id: purchaseId } }),
    prisma.ingredient.update({
      where: { id: purchase.ingredientId },
      data: { stockQuantity: { decrement: purchase.quantity } },
    }),
  ]);
  await refreshIngredientCost(purchase.ingredientId);

  revalidatePurchasePaths(purchase.ingredientId);
  redirect(`/insumos/${purchase.ingredientId}`);
}
