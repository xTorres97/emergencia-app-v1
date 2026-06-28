"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function vincularmeCentro(centroId: string) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return;

  await supabase.from("encargados_centros").insert({
    encargado_id: auth.user.id,
    centro_id: centroId,
  });

  revalidatePath(`/dashboard/${centroId}`);
}
