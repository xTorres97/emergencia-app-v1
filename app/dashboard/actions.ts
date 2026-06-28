"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function crearCentro(formData: FormData) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  const nombre = String(formData.get("nombre"));
  const direccion = String(formData.get("direccion"));
  const contacto = String(formData.get("contacto"));
  const horario = String(formData.get("horario") || "");

  const { data: centro, error } = await supabase
    .from("centros")
    .insert({ nombre, direccion, contacto, horario, created_by: auth.user.id })
    .select()
    .single();

  if (error || !centro) {
    redirect(`/dashboard?error=${encodeURIComponent(error?.message ?? "No se pudo crear el centro")}`);
  }

  // El creador queda automáticamente como encargado de su nuevo centro
  await supabase.from("encargados_centros").insert({
    encargado_id: auth.user.id,
    centro_id: (centro as any).id,
  });

  revalidatePath("/dashboard");
  redirect(`/dashboard/${(centro as any).id}`);
}
