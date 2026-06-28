import { createClient } from "@/lib/supabase/server";
import { crearCentro } from "./actions";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Plus } from "lucide-react";
import { ESTADOS_VENEZUELA } from "@/types/database";

const fieldClass =
  "w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  const { data: vinculos } = await supabase
    .from("encargados_centros")
    .select("centro_id")
    .eq("encargado_id", auth.user!.id);

  const ids = (vinculos ?? []).map((v: any) => v.centro_id);

  const { data: centros } =
    ids.length > 0
      ? await supabase.from("centros").select("*").in("id", ids).order("nombre")
      : { data: [] };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Tus Refugios</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Selecciona un centro para actualizar sus necesidades, o crea uno nuevo.
        </p>
      </div>

      {error && (
        <Card className="border-urgente bg-urgente-bg p-3 text-sm text-urgente">{error}</Card>
      )}

      {(centros ?? []).length > 0 && (
        <div className="flex flex-col gap-3">
          {(centros as any[]).map((c) => (
            <a key={c.id} href={`/dashboard/${c.id}`}>
              <Card className="p-4 transition-colors hover:bg-muted">
                <h2 className="font-semibold text-foreground">{c.nombre}</h2>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {c.direccion}
                  {(c.zona || c.estado) && (
                    <span className="font-medium text-foreground">
                      · {[c.zona, c.estado].filter(Boolean).join(", ")}
                    </span>
                  )}
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" /> {c.contacto}
                </p>
              </Card>
            </a>
          ))}
        </div>
      )}

      <Card className="p-5">
        <h2 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
          <Plus className="h-4 w-4" /> Crear nuevo Refugio
        </h2>
        <form action={crearCentro} className="flex flex-col gap-3">
          <Input name="nombre" required placeholder="Nombre del centro" />
          <Input name="direccion" required placeholder="Dirección completa" />
          <select name="estado" defaultValue="" className={fieldClass}>
            <option value="">— Estado (opcional) —</option>
            {ESTADOS_VENEZUELA.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
          <Input name="zona" placeholder="Zona o ciudad (ej: Puerto Cabello, Morón...)" />
          <Input name="contacto" required placeholder="Teléfono de contacto" />
          <Input name="horario" placeholder="Horario de atención (opcional)" />
          <Button type="submit" className="mt-1">
            Crear centro
          </Button>
        </form>
      </Card>
    </div>
  );
}