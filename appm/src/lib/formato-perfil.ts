/**
 * Funciones puras para mostrar datos de un aprendiz (documento, edad, fechas).
 * No dependen de React ni de Intl: así dan el mismo resultado en web y en
 * celular, y no hay corrimientos de día por zona horaria (new Date('2004-05-17')
 * se interpreta en UTC y en Colombia mostraría el 16).
 */

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

/** Parte {anio, mes(0-11), dia} de un 'AAAA-MM-DD' o de una fecha-hora ISO. */
function partesDeFecha(valor: string | null | undefined): { anio: number; mes: number; dia: number } | null {
  if (!valor) return null;
  const soloFecha = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor);
  if (soloFecha) {
    return { anio: Number(soloFecha[1]), mes: Number(soloFecha[2]) - 1, dia: Number(soloFecha[3]) };
  }
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return null;
  return { anio: fecha.getFullYear(), mes: fecha.getMonth(), dia: fecha.getDate() };
}

/** '2004-05-17' -> '17 de mayo de 2004'. Devuelve '' si no es una fecha válida. */
export function formatearFechaLarga(valor: string | null | undefined): string {
  const p = partesDeFecha(valor);
  return p ? `${p.dia} de ${MESES[p.mes]} de ${p.anio}` : '';
}

/** '2026-06-25T10:00:00Z' -> '25 de junio'. Devuelve '—' si no hay fecha. */
export function formatearFechaCorta(valor: string | null | undefined): string {
  const p = partesDeFecha(valor);
  return p ? `${p.dia} de ${MESES[p.mes]}` : '—';
}

/** Años cumplidos a `hoy` (por defecto, hoy). null si la fecha no es válida o es futura. */
export function calcularEdad(fechaNacimiento: string | null | undefined, hoy: Date = new Date()): number | null {
  const p = partesDeFecha(fechaNacimiento);
  if (!p) return null;
  let edad = hoy.getFullYear() - p.anio;
  const yaCumplio = hoy.getMonth() > p.mes || (hoy.getMonth() === p.mes && hoy.getDate() >= p.dia);
  if (!yaCumplio) edad -= 1;
  return edad >= 0 ? edad : null;
}

const SIGLAS_DOCUMENTO: Record<string, string> = {
  CC: 'C.C.',
  TI: 'T.I.',
  CE: 'C.E.',
};

const NOMBRES_DOCUMENTO: Record<string, string> = {
  CC: 'Cédula de ciudadanía',
  TI: 'Tarjeta de identidad',
  CE: 'Cédula de extranjería',
  PPT: 'Permiso por protección temporal',
  PEP: 'Permiso especial de permanencia',
};

/** 'TI', '80123456' -> 'T.I. 80.123.456' (los números con letras o ceros a la izquierda no se tocan). */
export function formatearDocumento(tipo: string | null | undefined, numero: string | null | undefined): string {
  const t = (tipo ?? '').trim().toUpperCase();
  const n = (numero ?? '').trim();
  const numeroFormateado = /^[1-9]\d*$/.test(n) ? n.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : n;
  return [SIGLAS_DOCUMENTO[t] ?? t, numeroFormateado].filter(Boolean).join(' ');
}

/** 'TI' -> 'Tarjeta de identidad'; si no se conoce, devuelve la sigla tal cual. */
export function nombreTipoDocumento(tipo: string | null | undefined): string {
  const t = (tipo ?? '').trim().toUpperCase();
  return NOMBRES_DOCUMENTO[t] ?? t;
}

/** 'T1' -> 'Trimestre 1'. null si no hay trimestre. */
export function etiquetaTrimestre(trimestre: string | null | undefined): string | null {
  const t = (trimestre ?? '').trim().replace(/^T/i, '');
  return t ? `Trimestre ${t}` : null;
}

/** 'diurna' -> 'Diurna'. */
export function capitalizar(texto: string | null | undefined): string {
  const t = (texto ?? '').trim();
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : '';
}
