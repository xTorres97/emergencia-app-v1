import { cn } from "@/lib/utils";
import { EstadoInsumo } from "@/types/database";

const ESTILOS: Record<EstadoInsumo, string> = {
  pendiente: "bg-urgente-bg text-urgente",
  parcial: "bg-parcial-bg text-parcial",
  cubierto: "bg-cubierto-bg text-cubierto",
};

const ETIQUETAS: Record<EstadoInsumo, string> = {
  pendiente: "Pendiente",
  parcial: "Parcial",
  cubierto: "Cubierto",
};

export function EstadoBadge({ estado, className }: { estado: EstadoInsumo; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide",
        ESTILOS[estado],
        className
      )}
    >
      {ETIQUETAS[estado]}
    </span>
  );
}
