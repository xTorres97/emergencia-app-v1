"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { Centro, Insumo, CATEGORIAS, ESTADOS_VENEZUELA, Categoria, estadoDeInsumo } from "@/types/database";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EstadoBadge } from "@/components/EstadoBadge";
import { formatoHoraVenezuela } from "@/lib/time";
import { Minus, Plus, Trash2, Save } from "lucide-react";

export function CentroEditor({
  centroInicial,
  insumosIniciales,
}: {
  centroInicial: Centro;
  insumosIniciales: Insumo[];
}) {
  const supabase = createClient();
  const [centro, setCentro] = useState(centroInicial);
  const [insumos, setInsumos] = useState<Insumo[]>(insumosIniciales);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const canal = supabase
      .channel(`centro-${centroInicial.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "centros", filter: `id=eq.${centroInicial.id}` },
        (payload) => {
          if (payload.eventType === "UPDATE") setCentro(payload.new as Centro);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "insumos", filter: `centro_id=eq.${centroInicial.id}` },
        (payload) => {
          setInsumos((prev) => {
            if (payload.eventType === "INSERT") {
              if (prev.some((i) => i.id === payload.new.id)) return prev;
              return [payload.new as Insumo, ...prev];
            }
            if (payload.eventType === "UPDATE")
              return prev.map((i) => (i.id === payload.new.id ? (payload.new as Insumo) : i));
            if (payload.eventType === "DELETE") return prev.filter((i) => i.id !== payload.old.id);
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [centroInicial.id, supabase]);

  async function guardarCentro(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const cambios = {
      direccion: String(form.get("direccion")),
      estado: String(form.get("estado") || "") || null,
      zona: String(form.get("zona") || "") || null,
      horario: String(form.get("horario") || "") || null,
      contacto: String(form.get("contacto")),
    };
    setCentro((c) => ({ ...c, ...cambios }));
    await supabase.from("centros").update(cambios).eq("id", centro.id);
  }

  async function agregarInsumo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const nuevo = {
      centro_id: centro.id,
      categoria: String(data.get("categoria")) as Categoria,
      nombre: String(data.get("nombre")),
      unidad: String(data.get("unidad") || "") || null,
      cantidad_necesaria: Number(data.get("cantidad_necesaria")) || 1,
      cantidad_cubierta: 0,
    };
    const { data: creado } = await supabase.from("insumos").insert(nuevo).select().single();
    if (creado) setInsumos((prev) => [creado as Insumo, ...prev]);
    form.reset();
  }

  async function actualizarCubierta(insumo: Insumo, delta: number) {
    const nueva = Math.max(0, Math.min(insumo.cantidad_necesaria, insumo.cantidad_cubierta + delta));
    setInsumos((prev) => prev.map((i) => (i.id === insumo.id ? { ...i, cantidad_cubierta: nueva } : i)));
    await supabase.from("insumos").update({ cantidad_cubierta: nueva }).eq("id", insumo.id);
  }

  async function eliminarInsumo(id: string) {
    setInsumos((prev) => prev.filter((i) => i.id !== id));
    await supabase.from("insumos").delete().eq("id", id);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <a href="/dashboard" className="text-sm text-muted hover:underline">
          ← Tus centros
        </a>
        <h1 className="mt-1 text-xl font-bold text-ink">{centro.nombre}</h1>
      </div>

      <Card className="p-5">
        <h2 className="mb-3 font-semibold text-ink">Datos del centro</h2>
        <form onSubmit={guardarCentro} className="flex flex-col gap-3">
          <Campo label="Dirección">
            <textarea
              name="direccion"
              defaultValue={centro.direccion}
              required
              rows={2}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
          </Campo>
          <Campo label="Estado">
            <select
              name="estado"
              defaultValue={centro.estado ?? ""}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">— Sin especificar —</option>
              {ESTADOS_VENEZUELA.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </Campo>
          <Campo label="Zona o ciudad">
            <Input
              name="zona"
              defaultValue={centro.zona ?? ""}
              placeholder="Ej: Puerto Cabello, Morón, San Felipe..."
            />
          </Campo>
          <Campo label="Horario de atención">
            <Input name="horario" defaultValue={centro.horario ?? ""} placeholder="Ej: Lun-Dom 8am-6pm" />
          </Campo>
          <Campo label="Contacto">
            <Input name="contacto" defaultValue={centro.contacto} required />
          </Campo>
          <Button type="submit" size="sm" className="self-start">
            <Save className="h-4 w-4" /> Guardar datos
          </Button>
        </form>
      </Card>

      <Card className="p-5">
        <h2 className="mb-3 font-semibold text-ink">Agregar necesidad</h2>
        <form onSubmit={agregarInsumo} className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <Input name="nombre" required placeholder="Ej: Agua embotellada" className="col-span-2 sm:col-span-2" />
          <select
            name="categoria"
            defaultValue="comida"
            className="col-span-1 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {CATEGORIAS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <Input name="cantidad_necesaria" type="number" min={1} defaultValue={1} placeholder="Cant." />
          <Input name="unidad" placeholder="Unidad (litros, cajas...)" />
          <Button type="submit" className="col-span-2 sm:col-span-5">
            <Plus className="h-4 w-4" /> Agregar a la lista
          </Button>
        </form>
      </Card>

      <Card className="p-5">
        <h2 className="mb-3 font-semibold text-ink">Necesidades actuales</h2>
        {insumos.length === 0 && <p className="text-sm text-muted">Aún no has agregado necesidades.</p>}
        <div className="flex flex-col gap-2">
          {insumos.map((i) => (
            <div
              key={i.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-line p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-ink">{i.nombre}</p>
                <p className="text-xs text-muted">
                  {CATEGORIAS.find((c) => c.value === i.categoria)?.label} · solicitado{" "}
                  {formatoHoraVenezuela(i.created_at)}
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => actualizarCubierta(i, -1)}
                  disabled={i.cantidad_cubierta <= 0}
                >
                  <Minus className="h-3.5 w-3.5" />
                </Button>
                <span className="w-20 text-center text-sm tabular-nums text-ink">
                  {i.cantidad_cubierta} / {i.cantidad_necesaria} {i.unidad ?? ""}
                </span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => actualizarCubierta(i, 1)}
                  disabled={i.cantidad_cubierta >= i.cantidad_necesaria}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>

              <EstadoBadge estado={estadoDeInsumo(i)} />

              <Button type="button" variant="ghost" size="sm" onClick={() => eliminarInsumo(i.id)}>
                <Trash2 className="h-4 w-4 text-urgente" />
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
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