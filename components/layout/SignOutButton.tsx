"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";

export function SignOutButton() {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      Cerrar sesión
    </Button>
  );
}
