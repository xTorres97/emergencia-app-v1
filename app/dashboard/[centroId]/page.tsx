import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { CentroEditor } from "@/components/CentroEditor";
import { vincularmeCentro } from "./actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Centro, Insumo, Profile } from "@/types/database";

export default async function PaginaCentro({ params }: { params: Promise<{ centroId: string }> }) {
  const { centroId } = await params;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const { data: centro } = await supabase
    .from("centros")
    .select("*")
    .eq("id", centroId)
    .single();

  if (!centro) notFound();

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", auth.user.id).single();
  const perfil = profile as Profile | null;

  const { data: vinculo } = await supabase
    .from("encargados_centros")
    .select("*")
    .eq("centro_id", centroId)
    .eq("encargado_id", auth.user.id)
    .maybeSingle();

  const tieneAcceso = !!vinculo || perfil?.rol === "admin";

  if (!tieneAcceso) {
    return (
      <Card className="p-5">
        <h2 className="font-semibold text-ink">{(centro as Centro).nombre}</h2>
        <p className="mt-2 text-sm text-muted">
          Todavía no eres encargado de este centro. Si vas a colaborar actualizando sus necesidades,
          puedes agregarte como encargado.
        </p>
        <form action={vincularmeCentro.bind(null, centroId)} className="mt-3">
          <Button type="submit">Convertirme en encargado de este centro</Button>
        </form>
      </Card>
    );
  }

  const { data: insumos } = await supabase
    .from("insumos")
    .select("*")
    .eq("centro_id", centroId)
    .order("created_at", { ascending: false });

  return (
    <CentroEditor centroInicial={centro as Centro} insumosIniciales={(insumos as Insumo[]) ?? []} />
  );
}