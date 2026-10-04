"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { FormMessage } from "@/components/ui/FormMessage";
import { createUser } from "@/actions/users";

export function UserForm() {
  const [state, formAction, isPending] = useActionState(createUser, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <FormMessage error={state?.error} />
      <div>
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" name="name" required />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div>
        <Label htmlFor="password">Contraseña</Label>
        <Input id="password" name="password" type="password" minLength={6} required />
      </div>
      <div>
        <Label htmlFor="role">Rol</Label>
        <Select id="role" name="role" defaultValue="STAFF">
          <option value="STAFF">Staff</option>
          <option value="ADMIN">Administrador</option>
        </Select>
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Creando..." : "Crear usuario"}
      </Button>
    </form>
  );
}
