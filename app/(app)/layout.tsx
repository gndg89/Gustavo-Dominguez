import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { SignOutButton } from "@/components/layout/SignOutButton";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const isAdmin = session.user.role === "ADMIN";

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-56 shrink-0 border-r border-border bg-surface">
        <div className="border-b border-border px-4 py-4">
          <p className="text-lg font-bold text-foreground">Cocina Admin</p>
        </div>
        <Sidebar isAdmin={isAdmin} />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-3">
          <div>
            <p className="text-sm font-medium text-foreground">
              {session.user.name}
            </p>
            <p className="text-xs text-muted">
              {session.user.email} ·{" "}
              {isAdmin ? "Administrador" : "Staff"}
            </p>
          </div>
          <SignOutButton />
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
