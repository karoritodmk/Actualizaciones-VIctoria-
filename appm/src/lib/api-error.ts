/**
 * Convierte lo que venga en el campo "detail" de una respuesta de FastAPI
 * en un texto legible (y en español) para mostrar en pantalla.
 *
 * Qué arregla:
 *  1. "[object Object]": cuando el backend rechaza una petición por una
 *     validación automática de Pydantic (422), "detail" NO es un texto, es un
 *     ARREGLO de objetos [{ loc, msg, type, ctx }]. Hacer `new Error(detail)`
 *     lo convertía en la palabra "[object Object]".
 *  2. Mensajes en inglés: Pydantic responde "Field required", "String should
 *     have at most 120 characters", etc. Aquí se traducen según el `type` del
 *     error (y su `ctx`, que trae los límites) a frases en español.
 *  3. Prefijo "Value error, ": cuando un @field_validator lanza ValueError
 *     (p. ej. anti_scripting o "El nombre del programa es obligatorio."),
 *     Pydantic v2 antepone "Value error, " al texto. Se quita para que el
 *     usuario vea solo el mensaje del backend.
 *  4. Nombres de campo técnicos ("direccion_principal") -> nombres legibles.
 *
 * Todas las funciones SIEMPRE devuelven un string útil, sin importar la forma
 * que traiga "detail" (texto simple, arreglo de Pydantic, objeto u otra cosa).
 */

// Nombre de campo (como lo manda el backend) -> como se dice en el formulario,
// CON artículo: "la fecha de nacimiento", "el nombre"... Los campos que no
// estén aquí se muestran como: el campo «nombre del campo».
const NOMBRES_CAMPO: Record<string, string> = {
  // Personas / cuenta
  fecha_nacimiento: 'la fecha de nacimiento',
  vigencia_contrato: 'la vigencia del contrato',
  correo_personal: 'el correo personal',
  correo_sena: 'el correo SENA',
  correo: 'el correo',
  numero_documento: 'el número de documento',
  contrasena: 'la contraseña',
  nueva_contrasena: 'la nueva contraseña',
  // Fechas
  fecha_limite: 'la fecha límite',
  fecha_inicio: 'la fecha de inicio',
  fecha_fin: 'la fecha de fin',
  fecha_carga: 'la fecha de carga',
  // Sedes
  nombre: 'el nombre',
  descripcion: 'la descripción',
  direccion_principal: 'la dirección principal',
  telefono_atencion: 'los teléfonos de atención',
  horario_atencion: 'el horario de atención',
  // Programas / fichas
  nivel_formacion: 'el nivel de formación',
  url_programa: 'el enlace del programa',
  id_coordinacion: 'la coordinación',
  id_sede: 'la sede',
  id_programa: 'el programa',
  trimestre: 'el trimestre',
  jornada: 'la jornada',
};

// Primeros elementos de `loc` que indican DÓNDE viaja el dato, no qué campo es.
const ZONAS_PETICION = new Set(['body', 'query', 'path', 'header', 'cookie']);

type ErrorPydantic = {
  loc?: unknown;
  msg?: unknown;
  type?: unknown;
  ctx?: Record<string, unknown>;
};

function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/** Último nombre de campo de `loc` (ignora "body"/"query" y los índices de lista). */
function nombreLegibleDeCampo(loc: unknown): string | null {
  if (!Array.isArray(loc)) return null;
  const campos = loc.filter((p): p is string => typeof p === 'string' && !ZONAS_PETICION.has(p));
  if (campos.length === 0) return null;
  const campo = campos[campos.length - 1];
  return NOMBRES_CAMPO[campo] ?? `el campo «${campo.replace(/_/g, ' ')}»`;
}

/** Quita los prefijos en inglés que Pydantic antepone a los mensajes propios. */
function limpiarMensaje(msg: string): string {
  return msg.replace(/^(value error|assertion failed),\s*/i, '').trim();
}

/** Traduce UN error de Pydantic (un elemento del arreglo `detail`). */
function mensajeDeErrorPydantic(item: ErrorPydantic): string {
  const campo = nombreLegibleDeCampo(item.loc);
  const tipo = typeof item.type === 'string' ? item.type : '';
  const ctx = item.ctx ?? {};
  const msg = typeof item.msg === 'string' && item.msg.trim() ? limpiarMensaje(item.msg) : 'valor inválido';
  const Campo = campo ? capitalizar(campo) : 'Un campo';

  switch (tipo) {
    case 'missing':
      return campo ? `Falta ${campo}.` : 'Falta un dato obligatorio.';
    case 'string_too_short':
      return ctx.min_length === 1
        ? `${Campo} no puede estar vacío.`
        : `${Campo} es demasiado corto (mínimo ${ctx.min_length ?? '?'} caracteres).`;
    case 'string_too_long':
      return `${Campo} es demasiado largo (máximo ${ctx.max_length ?? '?'} caracteres).`;
    case 'string_type':
      return `${Campo} debe ser texto.`;
    case 'int_parsing':
    case 'int_type':
    case 'float_parsing':
    case 'float_type':
      return `${Campo} debe ser un número.`;
    case 'greater_than_equal':
      return `${Campo} debe ser mayor o igual a ${ctx.ge ?? '?'}.`;
    case 'greater_than':
      return `${Campo} debe ser mayor que ${ctx.gt ?? '?'}.`;
    case 'less_than_equal':
      return `${Campo} debe ser menor o igual a ${ctx.le ?? '?'}.`;
    case 'less_than':
      return `${Campo} debe ser menor que ${ctx.lt ?? '?'}.`;
    case 'date_parsing':
    case 'date_type':
    case 'date_from_datetime_parsing':
    case 'datetime_parsing':
    case 'datetime_type':
    case 'datetime_from_date_parsing':
      return `${Campo} no es una fecha válida.`;
    case 'literal_error':
    case 'enum': {
      const permitidos = typeof ctx.expected === 'string' ? ctx.expected.replace(/ or /g, ' o ') : null;
      return permitidos
        ? `${Campo} tiene un valor no permitido. Opciones: ${permitidos}.`
        : `${Campo} tiene un valor no permitido.`;
    }
    default:
      break;
  }

  // EmailStr llega como `value_error` con un texto en inglés.
  if (/valid email/i.test(msg)) return `${Campo} no es un correo válido.`;

  // Mensajes propios del backend (ValueError en un validator): ya vienen en español.
  return campo ? `${Campo}: ${msg}` : capitalizar(msg);
}

export function mensajeDeError(detail: unknown, fallback: string): string {
  if (!detail) return fallback;

  // Caso normal: el backend mandó HTTPException(detail="texto").
  if (typeof detail === 'string') return detail.trim() || fallback;

  // Caso validación automática de Pydantic (422): detail es un arreglo.
  if (Array.isArray(detail)) {
    const mensajes = new Set<string>(); // Set: no repite el mismo mensaje dos veces
    for (const item of detail) {
      if (typeof item === 'string' && item.trim()) mensajes.add(item.trim());
      else if (item && typeof item === 'object') mensajes.add(mensajeDeErrorPydantic(item as ErrorPydantic));
    }
    return mensajes.size > 0 ? Array.from(mensajes).join(' · ') : fallback;
  }

  // Objeto suelto: si trae un texto conocido se usa; si no, nunca "[object Object]".
  if (typeof detail === 'object') {
    const objeto = detail as Record<string, unknown>;
    for (const clave of ['message', 'msg', 'detail', 'error']) {
      const valor = objeto[clave];
      if (typeof valor === 'string' && valor.trim()) return valor.trim();
    }
    try {
      const texto = JSON.stringify(detail);
      return texto && texto !== '{}' ? texto : fallback;
    } catch {
      return fallback;
    }
  }

  return fallback;
}

/**
 * Para respuestas NO exitosas: igual que mensajeDeError, pero con el estado
 * HTTP a la vista. Un 404 cuyo detalle es el texto genérico "Not Found" NO
 * es un dato que no existe (esos casos traen un mensaje propio, como
 * "Sede no encontrada."): significa que la RUTA no existe en el servidor,
 * casi siempre porque el backend que está corriendo es una versión anterior
 * a la app. Antes se mostraba solo "Not Found", sin pista de qué hacer.
 */
export function mensajeDeRespuesta(status: number, detail: unknown, fallback: string): string {
  const generico = typeof detail === 'string' ? detail.trim().toLowerCase() : '';
  if (status === 404 && generico === 'not found') {
    return 'El servidor no tiene esta función (error 404). Actualiza el backend y reinícialo (uvicorn main:app --reload).';
  }
  if (generico === 'not authenticated') return 'Tu sesión expiró. Inicia sesión de nuevo.';
  if (status === 413) return 'El archivo es demasiado grande para el servidor.';
  return mensajeDeError(detail, fallback);
}