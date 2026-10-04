"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { ingredientSchema } from "@/lib/validations";
import type { ActionState } from "@/lib/action-state";
import { requireSession } from "@/lib/require-session";

export async function createIngredient(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireSession();

  const parsed = ingredientSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const existing = await prisma.ingredient.findUnique({
    where: { name: parsed.data.name },
  });
  if (existing) {
    return { error: "Ya existe un insumo con ese nombre" };
  }

  await prisma.ingredient.create({
    data: {
      name: parsed.data.name,
      unit: parsed.data.unit,
      minStockThreshold: parsed.data.minStockThreshold,
    },
  });

  revalidatePath("/insumos");
  redirect("/insumos");
}

export async function updateIngredient(
  id: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireSession();

  const parsed = ingredientSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const existing = await prisma.ingredient.findUnique({
    where: { name: parsed.data.name },
  });
  if (existing && existing.id !== id) {
    return { error: "Ya existe un insumo con ese nombre" };
  }

  await prisma.ingredient.update({
    where: { id },
    data: {
      name: parsed.data.name,
      unit: parsed.data.unit,
      minStockThreshold: parsed.data.minStockThreshold,
    },
  });

  revalidatePath("/insumos");
  revalidatePath(`/insumos/${id}`);
  redirect(`/insumos/${id}`);
}
