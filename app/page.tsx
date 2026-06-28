import { createClient } from "@/lib/supabase/server";
import { PublicView } from "@/components/PublicView";
import type { Centro, Insumo } from "@/types/database";

export const revalidate = 0;

export default async function PaginaPublica() {
  const supabase = await createClient();

  const [{ data: centros }, { data: insumos }] = await Promise.all([
    supabase.from("centros").select("*").eq("activo", true).order("nombre"),
    supabase.from("insumos").select("*").order("created_at", { ascending: false }),
  ]);

  return (
    <PublicView
      centrosIniciales={(centros as Centro[]) ?? []}
      insumosIniciales={(insumos as Insumo[]) ?? []}
    />
  );
}