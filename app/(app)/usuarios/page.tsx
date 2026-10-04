import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { UserForm } from "@/components/usuarios/UserForm";

export default async function UsuariosPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div>
      <PageHeader title="Usuarios" description="Cuentas con acceso al panel." />
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="p-0">
          <Table>
            <Thead>
              <Tr>
                <Th>Nombre</Th>
                <Th>Email</Th>
                <Th>Rol</Th>
                <Th>Creado</Th>
              </Tr>
            </Thead>
            <Tbody>
              {users.map((user) => (
                <Tr key={user.id}>
                  <Td className="font-medium text-foreground">{user.name}</Td>
                  <Td>{user.email}</Td>
                  <Td>
                    <Badge tone={user.role === "ADMIN" ? "warning" : "neutral"}>
                      {user.role === "ADMIN" ? "Administrador" : "Staff"}
                    </Badge>
                  </Td>
                  <Td>{formatDate(user.createdAt)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nuevo usuario</CardTitle>
          </CardHeader>
          <UserForm />
        </Card>
      </div>
    </div>
  );
}
