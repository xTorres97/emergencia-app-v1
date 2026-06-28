"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Centro, Insumo, CATEGORIAS, ESTADOS_VENEZUELA, Categoria, estadoDeInsumo } from "@/types/database";
import { EstadoBadge } from "@/components/EstadoBadge";
import { Input } from "@/components/ui/input";
import { formatoHoraVenezuela, tiempoRelativo } from "@/lib/time";
import { Phone, MapPin, Clock, Share2 } from "lucide-react";

const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function PublicView({
  centrosIniciales,
  insumosIniciales,
}: {
  centrosIniciales: Centro[];
  insumosIniciales: Insumo[];
}) {
  const [centros, setCentros] = useState<Centro[]>(centrosIniciales);
  const [insumos, setInsumos] = useState<Insumo[]>(insumosIniciales);
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState<Categoria | "todas">("todas");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [soloPendientes, setSoloPendientes] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    const canal = supabase
      .channel("realtime-publico")
      .on("postgres_changes", { event: "*", schema: "public", table: "centros" }, (payload) => {
        setCentros((prev) => aplicarCambio(prev, payload));
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "insumos" }, (payload) => {
        setInsumos((prev) => aplicarCambio(prev, payload));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, []);

  const centrosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return centros
      .filter(
        (c) =>
          !texto ||
          c.nombre.toLowerCase().includes(texto) ||
          c.direccion.toLowerCase().includes(texto) ||
          c.zona?.toLowerCase().includes(texto)
      )
      .filter((c) => filtroEstado === "todos" || c.estado === filtroEstado)
      .map((c) => {
        let items = insumos.filter((i) => i.centro_id === c.id);
        if (filtroCategoria !== "todas") items = items.filter((i) => i.categoria === filtroCategoria);
        if (soloPendientes) items = items.filter((i) => estadoDeInsumo(i) !== "cubierto");
        return { centro: c, items };
      });
  }, [centros, insumos, busqueda, filtroCategoria, filtroEstado, soloPendientes]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 pb-16">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Refugios</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Necesidades actualizadas en tiempo real. Llama antes de llevar algo para confirmar.
        </p>
      </header>

      <div className="mb-3 flex flex-col gap-2 sm:flex-row">
        <Input
          placeholder="Buscar por nombre, dirección o zona..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="sm:flex-1"
        />
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className={`sm:w-44 ${selectClass}`}
        >
          <option value="todos">Todos los estados</option>
          {ESTADOS_VENEZUELA.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
        <select
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value as Categoria | "todas")}
          className={`sm:w-44 ${selectClass}`}
        >
          <option value="todas">Todas las categorías</option>
          {CATEGORIAS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <label className="mb-5 flex items-center gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={soloPendientes}
          onChange={(e) => setSoloPendientes(e.target.checked)}
          className="h-4 w-4 rounded border-border accent-primary"
        />
        Mostrar solo lo que aún hace falta
      </label>

      {centrosFiltrados.length === 0 && (
        <p className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
          No hay centros que coincidan con la búsqueda.
        </p>
      )}

      <div className="flex flex-col gap-4">
        {centrosFiltrados.map(({ centro, items }) => (
          <CentroCard key={centro.id} centro={centro} items={items} />
        ))}
      </div>
    </main>
  );
}

function CentroCard({ centro, items }: { centro: Centro; items: Insumo[] }) {
  const ubicacion = [centro.zona, centro.estado].filter(Boolean).join(", ");

  const mensajeWhatsapp = encodeURIComponent(
    `Refugio: ${centro.nombre}\nDirección: ${centro.direccion}${
      ubicacion ? ` (${ubicacion})` : ""
    }\nContacto: ${centro.contacto}\n\nNecesidades:\n${
      items.map((i) => `- ${i.nombre} (${estadoDeInsumo(i)})`).join("\n") || "Sin pendientes por ahora"
    }`
  );

  const porCategoria = CATEGORIAS.map((c) => ({
    ...c,
    items: items.filter((i) => i.categoria === c.value),
  })).filter((c) => c.items.length > 0);

  return (
    <article className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{centro.nombre}</h2>
          <p className="mt-1 flex items-start gap-1.5 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              {centro.direccion}
              {ubicacion && <span className="ml-1 font-medium text-foreground">· {ubicacion}</span>}
            </span>
          </p>
          {centro.horario && (
            <p className="mt-0.5 text-sm text-muted-foreground">Horario: {centro.horario}</p>
          )}
        </div>
        <a
          href={`https://wa.me/?text=${mensajeWhatsapp}`}
          target="_blank"
          rel="noreferrer"
          className="flex shrink-0 items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
        >
          <Share2 className="h-3.5 w-3.5" /> Compartir
        </a>
      </div>

      <a
        href={`tel:${centro.contacto.replace(/\s+/g, "")}`}
        className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/15"
      >
        <Phone className="h-4 w-4" /> {centro.contacto}
      </a>

      {porCategoria.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">Sin necesidades pendientes en este momento.</p>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {porCategoria.map((cat) => (
            <div key={cat.value}>
              <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {cat.label}
              </h3>
              <ul className="flex flex-col gap-1.5">
                {cat.items.map((i) => (
                  <li
                    key={i.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted px-3 py-2 text-sm"
                  >
                    <span className="text-foreground">
                      {i.nombre}
                      {i.unidad && (
                        <span className="text-muted-foreground">
                          {" "}
                          — {i.cantidad_cubierta}/{i.cantidad_necesaria} {i.unidad}
                        </span>
                      )}
                    </span>
                    <span className="flex items-center gap-2">
                      <span
                        className="flex items-center gap-1 text-xs text-muted-foreground"
                        title={formatoHoraVenezuela(i.created_at)}
                      >
                        <Clock className="h-3 w-3" /> {tiempoRelativo(i.created_at)}
                      </span>
                      <EstadoBadge estado={estadoDeInsumo(i)} />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

function aplicarCambio<T extends { id: string }>(
  lista: T[],
  payload: { eventType: string; new: any; old: any }
): T[] {
  if (payload.eventType === "INSERT") {
    if (lista.some((x) => x.id === payload.new.id)) return lista;
    return [payload.new as T, ...lista];
  }
  if (payload.eventType === "UPDATE") return lista.map((x) => (x.id === payload.new.id ? (payload.new as T) : x));
  if (payload.eventType === "DELETE") return lista.filter((x) => x.id !== payload.old.id);
  return lista;
}