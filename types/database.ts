export type Rol = "admin" | "encargado";
export type Categoria = "comida" | "medicamentos" | "otros_insumos";

export interface Profile {
  id: string;
  nombre: string;
  telefono: string | null;
  rol: Rol;
  created_at: string;
}

export interface Centro {
  id: string;
  nombre: string;
  direccion: string;
  estado: string | null;
  zona: string | null;
  horario: string | null;
  contacto: string;
  activo: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Insumo {
  id: string;
  centro_id: string;
  categoria: Categoria;
  nombre: string;
  unidad: string | null;
  cantidad_necesaria: number;
  cantidad_cubierta: number;
  created_at: string;
  updated_at: string;
}

export interface EncargadoCentro {
  encargado_id: string;
  centro_id: string;
  created_at: string;
}

export type EstadoInsumo = "pendiente" | "parcial" | "cubierto";

export function estadoDeInsumo(i: Pick<Insumo, "cantidad_necesaria" | "cantidad_cubierta">): EstadoInsumo {
  if (i.cantidad_cubierta <= 0) return "pendiente";
  if (i.cantidad_cubierta >= i.cantidad_necesaria) return "cubierto";
  return "parcial";
}

export const CATEGORIAS: { value: Categoria; label: string }[] = [
  { value: "comida", label: "Comida" },
  { value: "medicamentos", label: "Medicamentos" },
  { value: "otros_insumos", label: "Otros insumos" },
];

export const ESTADOS_VENEZUELA: string[] = [
  "Amazonas", "Anzoátegui", "Apure", "Aragua", "Barinas", "Bolívar",
  "Carabobo", "Cojedes", "Delta Amacuro", "Distrito Capital", "Falcón",
  "Guárico", "Lara", "Mérida", "Miranda", "Monagas", "Nueva Esparta",
  "Portuguesa", "Sucre", "Táchira", "Trujillo", "Vargas", "Yaracuy", "Zulia",
];