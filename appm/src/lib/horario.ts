/**
 * Horario de atención por franjas ("Lunes a viernes: 07:00 - 17:00").
 *
 * Se guarda como TEXTO en sede.horario_atencion (una franja por línea), así
 * no hace falta cambiar la base de datos y el texto se lee bien en cualquier
 * pantalla. Este módulo convierte entre ese texto y las franjas editables.
 */
export const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'] as const;
export const DIAS_CORTOS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] as const;

export type Franja = {
  /** dias[0] = lunes ... dias[6] = domingo */
  dias: boolean[];
  cerrado: boolean;
  abre: string; // "HH:MM" (24 h)
  cierra: string;
};

export function franjaNueva(dias: number[] = [], abre = '07:00', cierra = '17:00'): Franja {
  return { dias: DIAS.map((_, i) => dias.includes(i)), cerrado: false, abre, cierra };
}

const SIN_TILDE = (t: string) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const indiceDia = (nombre: string) => DIAS.findIndex((d) => SIN_TILDE(d) === SIN_TILDE(nombre));

/** Tramos de días consecutivos: [true,true,false,true] -> [[0,1],[3,3]] */
function tramos(dias: boolean[]): [number, number][] {
  const out: [number, number][] = [];
  let ini = -1;
  dias.forEach((on, i) => {
    if (on && ini < 0) ini = i;
    if ((!on || i === dias.length - 1) && ini >= 0) {
      out.push([ini, on ? i : i - 1]);
      ini = -1;
    }
  });
  return out;
}

function etiquetaTramo([a, b]: [number, number]): string {
  if (a === b) return DIAS[a];
  const segundo = DIAS[b].toLowerCase();
  return b === a + 1 ? `${DIAS[a]} y ${segundo}` : `${DIAS[a]} a ${segundo}`;
}

export function franjasATexto(franjas: Franja[]): string {
  const lineas: string[] = [];
  for (const f of franjas) {
    for (const t of tramos(f.dias)) {
      lineas.push(`${etiquetaTramo(t)}: ${f.cerrado ? 'Cerrado' : `${f.abre} - ${f.cierra}`}`);
    }
  }
  return lineas.join('\n');
}

const NOMBRES = DIAS.map((d) => d).join('|');
const LINEA = new RegExp(
  `^(${NOMBRES})(?: (a|y) (${NOMBRES}))?:\\s*(?:(\\d{2}:\\d{2})\\s*-\\s*(\\d{2}:\\d{2})|(Cerrado))$`,
  'i'
);

/** Devuelve las franjas, o null si el texto NO tiene este formato (horario antiguo en texto libre). */
export function textoAFranjas(texto: string): Franja[] | null {
  const lineas = texto
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  if (lineas.length === 0) return [];
  const franjas: Franja[] = [];
  for (const linea of lineas) {
    const m = LINEA.exec(linea);
    if (!m) return null;
    const a = indiceDia(m[1]);
    const b = m[3] ? indiceDia(m[3]) : a;
    if (a < 0 || b < a) return null;
    const dias = DIAS.map((_, i) => i >= a && i <= b);
    franjas.push(
      m[6]
        ? { dias, cerrado: true, abre: '07:00', cierra: '17:00' }
        : { dias, cerrado: false, abre: m[4], cierra: m[5] }
    );
  }
  return franjas;
}

/** "7" -> "07:00", "730" -> "07:30", "7:5" -> "07:05". Devuelve el texto tal cual si no se entiende. */
export function normalizarHora(texto: string): string {
  const t = texto.trim();
  let h: string;
  let m = '00';
  if (/^\d{1,2}$/.test(t)) h = t;
  else if (/^\d{3,4}$/.test(t)) {
    h = t.slice(0, t.length - 2);
    m = t.slice(-2);
  } else if (/^\d{1,2}:\d{1,2}$/.test(t)) {
    [h, m] = t.split(':');
  } else return t;
  return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
}

const HORA_VALIDA = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Mensaje de error si las franjas no sirven, o null si están bien. */
export function validarFranjas(franjas: Franja[]): string | null {
  const usados = new Set<number>();
  for (const [n, f] of franjas.entries()) {
    const dias = f.dias.flatMap((on, i) => (on ? [i] : []));
    if (dias.length === 0) return `Franja ${n + 1}: elige al menos un día.`;
    for (const d of dias) {
      if (usados.has(d)) return `${DIAS[d]} aparece en más de una franja.`;
      usados.add(d);
    }
    if (f.cerrado) continue;
    if (!HORA_VALIDA.test(f.abre) || !HORA_VALIDA.test(f.cierra)) {
      return `Franja ${n + 1}: escribe las horas como HH:MM (por ejemplo 07:00 y 17:30).`;
    }
    if (f.abre >= f.cierra) return `Franja ${n + 1}: la hora de cierre debe ser después de la de apertura.`;
  }
  return null;
}
