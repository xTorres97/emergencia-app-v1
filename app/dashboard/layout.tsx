import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cerrarSesion } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/types/database";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  if (!auth.user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", auth.user.id)
    .single();

  const perfil = profile as Profile | null;

  return (
    <div className="min-h-screen">
      <nav className="flex items-center justify-between border-b border-line bg-surface px-4 py-3">
        <div>
          <span className="font-semibold text-ink">Panel de encargado</span>
          <span className="ml-2 text-sm text-muted">{perfil?.nombre}</span>
        </div>
        <div className="flex items-center gap-3">
          {perfil?.rol === "admin" && (
            <a href="/admin" className="text-sm text-brand hover:underline">
              Administración
            </a>
          )}
          <a href="/" className="text-sm text-muted hover:underline">
            Ver vista pública
          </a>
          <form action={cerrarSesion}>
            <Button type="submit" variant="secondary" size="sm">
              Salir
            </Button>
          </form>
        </div>
      </nav>
      <div className="mx-auto max-w-3xl px-4 py-6">{children}</div>
    </div>
  );
}
