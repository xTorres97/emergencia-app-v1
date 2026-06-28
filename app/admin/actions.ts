"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function cambiarRol(profileId: string, nuevoRol: "admin" | "encargado") {
  const supabase = await createClient();
  await supabase.from("profiles").update({ rol: nuevoRol }).eq("id", profileId);
  revalidatePath("/admin");
}

export async function desactivarCentro(centroId: string, activo: boolean) {
  const supabase = await createClient();
  await supabase.from("centros").update({ activo }).eq("id", centroId);
  revalidatePath("/admin");
}
