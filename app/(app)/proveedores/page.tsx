import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createSupplier } from "@/actions/suppliers";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, Thead, Tbody, Tr, Th, Td, EmptyState } from "@/components/ui/Table";
import { SupplierForm } from "@/components/proveedores/SupplierForm";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { deleteSupplier } from "@/actions/suppliers";

export default async function ProveedoresPage() {
  const suppliers = await prisma.supplier.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <PageHeader title="Proveedores" description="Contactos de donde compras tu materia prima." />
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="p-0">
          <Table>
            <Thead>
              <Tr>
                <Th>Nombre</Th>
                <Th>Teléfono</Th>
                <Th>Email</Th>
                <Th></Th>
              </Tr>
            </Thead>
            <Tbody>
              {suppliers.map((supplier) => (
                <Tr key={supplier.id}>
                  <Td>
                    <Link
                      href={`/proveedores/${supplier.id}`}
                      className="font-medium text-foreground hover:underline"
                    >
                      {supplier.name}
                    </Link>
                  </Td>
                  <Td>{supplier.phone ?? "—"}</Td>
                  <Td>{supplier.email ?? "—"}</Td>
                  <Td>
                    <DeleteButton
                      action={deleteSupplier.bind(null, supplier.id)}
                      confirmMessage={`¿Borrar el proveedor "${supplier.name}"?`}
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          {suppliers.length === 0 && (
            <EmptyState message="Todavía no hay proveedores registrados." />
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nuevo proveedor</CardTitle>
          </CardHeader>
          <SupplierForm action={createSupplier} />
        </Card>
      </div>
    </div>
  );
}
