"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { iniciarSesion } from "./actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function PaginaLogin() {
  return (
    <Suspense>
      <FormularioLogin />
    </Suspense>
  );
}

function FormularioLogin() {
  const params = useSearchParams();
  const error = params.get("error");

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4 py-10">
      <h1 className="mb-1 text-xl font-bold text-ink">Iniciar sesión</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Para gestionar las necesidades de tu refugio.
      </p>

      {error && (
        <Card className="mb-4 border-urgente bg-urgente-bg p-3 text-sm text-urgente">{error}</Card>
      )}

      <Card className="p-5">
        <form action={iniciarSesion} className="flex flex-col gap-3">
          <Campo label="Usuario">
            <Input name="usuario" required placeholder="tu_usuario" autoComplete="username" />
          </Campo>
          <Campo label="Contraseña">
            <Input name="password" type="password" required minLength={6} placeholder="••••••••" autoComplete="current-password" />
          </Campo>
          <Button type="submit" className="mt-2 w-full" size="lg">
            Entrar
          </Button>
        </form>
      </Card>

      <a href="/" className="mt-6 text-center text-sm text-muted hover:underline">
        ← Ver centros refugio (público)
      </a>
    </main>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-ink">{label}</span>
      {children}
    </label>
  );
}