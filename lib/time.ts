/**
 * Venezuela no tiene horario de verano y usa UTC-4 de forma fija,
 * pero usamos el nombre de la zona IANA para que sea siempre correcto.
 */
const ZONA_VENEZUELA = "America/Caracas";

export function formatoHoraVenezuela(fechaISO: string): string {
  const fecha = new Date(fechaISO);
  return new Intl.DateTimeFormat("es-VE", {
    timeZone: ZONA_VENEZUELA,
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(fecha);
}

/** Texto relativo corto: "hace 5 min", "hace 2 h", etc. */
export function tiempoRelativo(fechaISO: string): string {
  const ahora = Date.now();
  const fecha = new Date(fechaISO).getTime();
  const diffSeg = Math.round((ahora - fecha) / 1000);

  if (diffSeg < 60) return "justo ahora";
  const diffMin = Math.round(diffSeg / 60);
  if (diffMin < 60) return `hace ${diffMin} min`;
  const diffHoras = Math.round(diffMin / 60);
  if (diffHoras < 24) return `hace ${diffHoras} h`;
  const diffDias = Math.round(diffHoras / 24);
  return `hace ${diffDias} d`;
}

