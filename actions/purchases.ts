"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { purchaseSchema } from "@/lib/validations";
import { pricePerUnitFromPurchase } from "@/lib/costing";
import type { ActionState } from "@/lib/action-state";
import { requireSession } from "@/lib/require-session";

export async function createPurchase(
  ingredientId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireSession();

  const raw = Object.fromEntries(formData);
  const parsed = purchaseSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { supplierId, quantity, totalCost, currency, paymentMethod, purchaseDate, notes } =
    parsed.data;

  const ingredient = await prisma.ingredient.findUnique({
    where: { id: ingredientId },
  });
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
      data: {
        currentCostPerUnit: pricePerUnit,
        stockQuantity: { increment: quantity },
      },
    }),
  ]);

  revalidatePath("/insumos");
  revalidatePath(`/insumos/${ingredientId}`);
  revalidatePath("/contabilidad");
  revalidatePath("/dashboard");
  redirect(`/insumos/${ingredientId}`);
}
