"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const DOMINIO = "emergencia.app";

export async function iniciarSesion(formData: FormData) {
  const usuario = String(formData.get("usuario")).trim().toLowerCase();
  const password = String(formData.get("password"));

  // Convertimos el usuario a email interno
  const email = `${usuario}@${DOMINIO}`;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent("Usuario o contraseña incorrectos")}`);
  }
  redirect("/dashboard");
}

export async function cerrarSesion() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}