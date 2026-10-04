import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

export function DateRangeFilter({ from, to }: { from: string; to: string }) {
  return (
    <form method="get" className="mb-6 flex flex-wrap items-end gap-4">
      <div>
        <Label htmlFor="from">Desde</Label>
        <Input id="from" name="from" type="date" defaultValue={from} />
      </div>
      <div>
        <Label htmlFor="to">Hasta</Label>
        <Input id="to" name="to" type="date" defaultValue={to} />
      </div>
      <Button type="submit" variant="secondary">
        Filtrar
      </Button>
    </form>
  );
}
