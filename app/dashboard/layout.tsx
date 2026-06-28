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
    <div className="min-h-screen bg-background">
      <nav className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-card px-4 py-3">
        <div>
          <span className="hidden font-semibold text-foreground sm:inline">Panel de encargado</span>
          <span className="text-sm text-muted-foreground sm:ml-2">{perfil?.nombre}</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {perfil?.rol === "admin" && (
            <a href="/admin" className="text-sm text-primary hover:underline">
              Administración
            </a>
          )}
          <a href="/" className="text-sm text-muted-foreground hover:underline">
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