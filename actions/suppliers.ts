"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { supplierSchema } from "@/lib/validations";
import type { ActionState } from "@/lib/action-state";
import { requireSession } from "@/lib/require-session";

export async function createSupplier(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireSession();

  const parsed = supplierSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  await prisma.supplier.create({
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      notes: parsed.data.notes || null,
    },
  });

  revalidatePath("/proveedores");
  redirect("/proveedores");
}

export async function updateSupplier(
  id: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireSession();

  const parsed = supplierSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  await prisma.supplier.update({
    where: { id },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      notes: parsed.data.notes || null,
    },
  });

  revalidatePath("/proveedores");
  redirect("/proveedores");
}
