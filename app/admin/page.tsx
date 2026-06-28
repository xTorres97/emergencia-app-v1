import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cambiarRol, desactivarCentro } from "./actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Profile, Centro } from "@/types/database";

export default async function PaginaAdmin() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  const { data: perfil } = await supabase.from("profiles").select("*").eq("id", auth.user.id).single();
  if ((perfil as Profile | null)?.rol !== "admin") redirect("/dashboard");

  const [{ data: profiles }, { data: centros }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("centros").select("*").order("nombre"),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <a href="/dashboard" className="text-sm text-muted hover:underline">
        ← Volver al panel
      </a>
      <h1 className="mt-1 text-xl font-bold text-ink">Administración</h1>

      <Card className="mt-5 p-5">
        <h2 className="mb-3 font-semibold text-ink">Usuarios ({(profiles ?? []).length})</h2>
        <div className="flex flex-col gap-2">
          {(profiles as Profile[] | null)?.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-3 rounded-[10px] border border-line p-3">
              <div>
                <p className="font-medium text-ink">{p.nombre || "(sin nombre)"}</p>
                <p className="text-xs text-muted">{p.telefono ?? "sin teléfono"} · {p.rol}</p>
              </div>
              <form action={cambiarRol.bind(null, p.id, p.rol === "admin" ? "encargado" : "admin")}>
                <Button type="submit" variant="secondary" size="sm">
                  {p.rol === "admin" ? "Quitar admin" : "Hacer admin"}
                </Button>
              </form>
            </div>
          ))}
        </div>
      </Card>

      <Card className="mt-5 p-5">
        <h2 className="mb-3 font-semibold text-ink">Centros ({(centros ?? []).length})</h2>
        <div className="flex flex-col gap-2">
          {(centros as Centro[] | null)?.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-3 rounded-[10px] border border-line p-3">
              <div>
                <p className="font-medium text-ink">{c.nombre}</p>
                <p className="text-xs text-muted">{c.direccion}</p>
              </div>
              <div className="flex items-center gap-2">
                <a href={`/dashboard/${c.id}`} className="text-sm text-brand hover:underline">
                  Editar
                </a>
                <form action={desactivarCentro.bind(null, c.id, !c.activo)}>
                  <Button
                    type="submit"
                    variant="secondary"
                    size="sm"
                    className={c.activo ? "border-urgente text-urgente hover:bg-urgente/10" : ""}
                  >
                    {c.activo ? "Desactivar" : "Activar"}
                  </Button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}